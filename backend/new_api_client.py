from __future__ import annotations

from dataclasses import dataclass
from dataclasses import replace
from typing import Any, AsyncIterator, Dict, List, Optional
from urllib.parse import quote

import httpx
import json


DEFAULT_REQUEST_TIMEOUT_SECONDS = 3000.0


class NewApiError(Exception):
    """Raised when a new-api request fails or returns success=false."""

    def __init__(self, message: str, *, status_code: int = 0, payload: Any = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload


@dataclass
class TokenInfo:
    id: int
    name: str
    key: str
    status: int
    remain_quota: int
    used_quota: int
    unlimited_quota: bool
    expired_time: int
    created_time: int
    group: str

    @property
    def sk_key(self) -> str:
        return self.key if self.key.startswith("sk-") else f"sk-{self.key}"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TokenInfo":
        return cls(
            id=int(data.get("id") or 0),
            name=data.get("name") or "",
            key=data.get("key") or "",
            status=int(data.get("status") or 0),
            remain_quota=int(data.get("remain_quota") or 0),
            used_quota=int(data.get("used_quota") or 0),
            unlimited_quota=bool(data.get("unlimited_quota")),
            expired_time=int(data.get("expired_time") or -1),
            created_time=int(data.get("created_time") or 0),
            group=data.get("group") or "",
        )

    def to_dict(self, include_key: bool = False) -> Dict[str, Any]:
        payload = {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "remainQuota": self.remain_quota,
            "usedQuota": self.used_quota,
            "unlimitedQuota": self.unlimited_quota,
            "expiredTime": self.expired_time,
            "createdTime": self.created_time,
            "group": self.group,
            "hasKey": bool(self.key),
            "keyPreview": self.sk_key[:10] + "..." if self.key else "",
        }
        if include_key:
            payload["skKey"] = self.sk_key
        return payload


class NewApiClient:
    """Small new-api user client for 漫创AI backend account binding."""

    def __init__(
        self,
        base_url: str,
        access_token: Optional[str] = None,
        user_id: Optional[int] = None,
        timeout: float = DEFAULT_REQUEST_TIMEOUT_SECONDS,
    ):
        self.base_url = (base_url or "").strip().rstrip("/")
        self.access_token = access_token
        self.user_id = user_id
        self.timeout = timeout
        self._session = httpx.Client(timeout=timeout, follow_redirects=True)

    def close(self) -> None:
        self._session.close()

    def _auth_headers(self) -> Dict[str, str]:
        if not self.access_token or self.user_id is None:
            raise NewApiError("尚未登录，请先登录中转站账号")
        return {
            "Authorization": self.access_token,
            "New-Api-User": str(self.user_id),
        }

    @staticmethod
    def _error_message(data: Any, fallback: str) -> str:
        if isinstance(data, dict):
            if data.get("message"):
                return str(data.get("message"))
            error = data.get("error")
            if isinstance(error, dict) and error.get("message"):
                return str(error.get("message"))
        return fallback

    @staticmethod
    def _extract_access_token(data: Any) -> str:
        if isinstance(data, str):
            return data.strip()
        if not isinstance(data, dict):
            return ""
        for key in ("access_token", "accessToken", "token", "access_token_value"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        nested = data.get("data")
        if nested is not data:
            return NewApiClient._extract_access_token(nested)
        return ""

    @staticmethod
    def _extract_user_id(data: Any) -> Optional[int]:
        if not isinstance(data, dict):
            return None
        for key in ("id", "user_id", "userId"):
            value = data.get(key)
            if value is None:
                continue
            try:
                return int(value)
            except (TypeError, ValueError):
                pass
        for key in ("user", "data"):
            nested = data.get(key)
            if nested is not data:
                found = NewApiClient._extract_user_id(nested)
                if found is not None:
                    return found
        return None

    @staticmethod
    def _extract_models(data: Any) -> List[str]:
        source = data
        if isinstance(source, dict):
            for key in ("data", "models", "items"):
                if key in source:
                    found = NewApiClient._extract_models(source.get(key))
                    if found:
                        return found
            return []
        if not isinstance(source, list):
            return []
        models: List[str] = []
        for item in source:
            if isinstance(item, str):
                models.append(item)
            elif isinstance(item, dict):
                value = item.get("id") or item.get("model") or item.get("name")
                if value:
                    models.append(str(value))
        return sorted(set(models))

    @staticmethod
    def _model_code_from_record(item: Dict[str, Any]) -> str:
        for key in ("modelCode", "model_code", "id", "model", "name"):
            value = item.get(key)
            if value:
                return str(value)
        return ""

    @staticmethod
    def _extract_model_records(data: Any) -> List[Dict[str, Any]]:
        source = data
        if isinstance(source, dict):
            for key in ("data", "models", "items", "rows"):
                if key in source:
                    found = NewApiClient._extract_model_records(source.get(key))
                    if found:
                        return found
            code = NewApiClient._model_code_from_record(source)
            return [{**source, "id": code}] if code else []
        if not isinstance(source, list):
            return []
        records: List[Dict[str, Any]] = []
        seen: set[str] = set()
        for item in source:
            if isinstance(item, str):
                record = {"id": item}
                code = item
            elif isinstance(item, dict):
                code = NewApiClient._model_code_from_record(item)
                record = {**item, "id": code} if code and not item.get("id") else dict(item)
            else:
                continue
            if not code or code in seen:
                continue
            seen.add(code)
            records.append(record)
        return sorted(records, key=lambda item: str(item.get("id") or item.get("modelCode") or ""))

    @staticmethod
    def _extract_pricing_records(data: Any) -> List[Dict[str, Any]]:
        source = data
        if isinstance(source, dict):
            for key in ("data", "items", "models", "rows"):
                nested = source.get(key)
                if isinstance(nested, (list, dict)):
                    found = NewApiClient._extract_pricing_records(nested)
                    if found:
                        return found
            return []
        if not isinstance(source, list):
            return []
        records: List[Dict[str, Any]] = []
        seen: set[str] = set()
        for item in source:
            if not isinstance(item, dict):
                continue
            code = (
                item.get("model_name")
                or item.get("modelName")
                or item.get("modelCode")
                or item.get("model_code")
                or item.get("id")
                or item.get("model")
                or item.get("name")
            )
            if not code:
                continue
            clean_code = str(code).strip()
            if not clean_code or clean_code in seen:
                continue
            seen.add(clean_code)
            records.append(dict(item))
        return sorted(records, key=lambda item: str(item.get("model_name") or item.get("modelName") or item.get("id") or ""))

    @staticmethod
    def _as_int(value: Any, default: int = 0) -> int:
        if value is None or value == "":
            return default
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _pick_dict(data: Any) -> Dict[str, Any]:
        if isinstance(data, dict):
            nested = data.get("data")
            if isinstance(nested, dict):
                return nested
            return data
        return {}

    @staticmethod
    def _extract_paged_items(data: Any) -> tuple[List[Dict[str, Any]], int]:
        source = data
        total = 0
        if isinstance(source, dict):
            data_part = source.get("data")
            if isinstance(data_part, dict):
                total = NewApiClient._as_int(data_part.get("total") or data_part.get("count") or data_part.get("total_count"))
                for key in ("items", "logs", "records", "rows", "data"):
                    if isinstance(data_part.get(key), list):
                        source = data_part.get(key)
                        break
                else:
                    source = []
            elif isinstance(data_part, list):
                source = data_part
            else:
                total = NewApiClient._as_int(source.get("total") or source.get("count") or source.get("total_count"))
                for key in ("items", "logs", "records", "rows"):
                    if isinstance(source.get(key), list):
                        source = source.get(key)
                        break
                else:
                    source = []
        if not isinstance(source, list):
            source = []
        items = [item for item in source if isinstance(item, dict)]
        return items, total or len(items)

    @classmethod
    def _log_transaction_type(cls, value: Any) -> str:
        raw = str(value or "").strip().lower()
        numeric = cls._as_int(value, default=-1)
        if numeric == 6 or raw in {"refund", "refunded", "退费", "退款"}:
            return "refund"
        if numeric == 2 or raw in {"consume", "consumption", "扣费", "消费"}:
            return "consume"
        if numeric == 1 or raw in {"topup", "recharge", "充值"}:
            return "topup"
        return raw or "unknown"

    @staticmethod
    def _media_preview_label(kind: str) -> str:
        return {
            "video": "预览视频",
            "audio": "预览音频",
            "image": "预览图片",
        }.get(str(kind or "").lower(), "打开结果")

    @classmethod
    def _log_media_kind(cls, asset: Dict[str, Any]) -> str:
        media_type = str(asset.get("media_type") or asset.get("mediaType") or asset.get("type") or "").strip().lower()
        if media_type in {"image", "video", "audio", "file", "link"}:
            return media_type
        mime_type = str(asset.get("mime_type") or asset.get("mimeType") or asset.get("content_type") or "").strip()
        url = (
            asset.get("preview_url")
            or asset.get("previewUrl")
            or asset.get("download_url")
            or asset.get("downloadUrl")
            or asset.get("url")
            or ""
        )
        return cls._media_kind(str(url or ""), media_type, mime_type)

    @classmethod
    def _normalize_log_media_asset(cls, asset: Dict[str, Any], index: int = 0) -> Dict[str, Any]:
        if not isinstance(asset, dict):
            return {}
        asset_id = asset.get("id") or asset.get("asset_id") or asset.get("assetId") or ""
        preview_url = (
            asset.get("preview_url")
            or asset.get("previewUrl")
            or asset.get("asset_url")
            or asset.get("assetUrl")
            or asset.get("url")
            or ""
        )
        download_url = (
            asset.get("original_url")
            or asset.get("originalUrl")
            or asset.get("download_url")
            or asset.get("downloadUrl")
            or asset.get("file_url")
            or asset.get("fileUrl")
            or ""
        )
        if not preview_url and asset_id:
            preview_url = f"/api/media-assets/{asset_id}/content"
        if not download_url and asset_id:
            download_url = f"/api/media-assets/{asset_id}/content?download=1"
        if not download_url:
            download_url = preview_url
        kind = cls._log_media_kind({**asset, "preview_url": preview_url, "download_url": download_url})
        file_name = asset.get("file_name") or asset.get("fileName") or asset.get("name") or ""
        return {
            "id": asset_id,
            "key": asset.get("key") or asset_id or preview_url or f"log-media-{index}",
            "mediaType": kind,
            "mimeType": asset.get("mime_type") or asset.get("mimeType") or asset.get("content_type") or "",
            "fileName": file_name,
            "previewUrl": preview_url,
            "downloadUrl": download_url,
            "previewLabel": cls._media_preview_label(kind),
            "taskId": asset.get("task_id") or asset.get("taskId") or "",
            "expired": bool(asset.get("expired")),
            "raw": asset,
        }

    @classmethod
    def _dedupe_log_media_assets(cls, assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen: set[str] = set()
        deduped: List[Dict[str, Any]] = []
        for asset in assets:
            if not asset:
                continue
            key = str(asset.get("id") or asset.get("previewUrl") or asset.get("downloadUrl") or asset.get("taskId") or "").strip()
            if not key or key in seen:
                continue
            seen.add(key)
            deduped.append(asset)
        return deduped

    @classmethod
    def _extract_log_other(cls, item: Dict[str, Any]) -> Dict[str, Any]:
        return cls._as_dict(item.get("other") or item.get("metadata") or item.get("extra") or {})

    @classmethod
    def _extract_log_media_assets(cls, item: Dict[str, Any], transaction_type: str) -> List[Dict[str, Any]]:
        explicit_assets = item.get("media_assets")
        if not isinstance(explicit_assets, list):
            explicit_assets = item.get("mediaAssets")
        assets = [
            cls._normalize_log_media_asset(asset, index)
            for index, asset in enumerate(explicit_assets if isinstance(explicit_assets, list) else [])
            if isinstance(asset, dict)
        ]

        other = cls._extract_log_other(item)
        task_id = str(other.get("task_id") or other.get("taskId") or item.get("task_id") or item.get("taskId") or "").strip()
        if transaction_type == "consume" and task_id:
            encoded_task_id = quote(task_id, safe="")
            assets.append({
                "id": "",
                "key": f"task-video-{task_id}",
                "mediaType": "video",
                "mimeType": "video/mp4",
                "fileName": f"{task_id}.mp4",
                "previewUrl": f"/v1/videos/{encoded_task_id}/content",
                "downloadUrl": f"/v1/videos/{encoded_task_id}/content?download=1",
                "previewLabel": "预览视频",
                "taskId": task_id,
                "expired": False,
                "raw": {"task_id": task_id},
            })

        return cls._dedupe_log_media_assets(assets)

    @classmethod
    def _extract_log_items(cls, data: Any) -> tuple[List[Dict[str, Any]], int]:
        raw_items, total = cls._extract_paged_items(data)
        items = [cls._normalize_log_item(item) for item in raw_items]
        return items, total or len(items)

    @classmethod
    def _normalize_log_item(cls, item: Dict[str, Any]) -> Dict[str, Any]:
        created_at = (
            item.get("created_at")
            or item.get("createdAt")
            or item.get("created_time")
            or item.get("createdTime")
            or item.get("timestamp")
            or item.get("time")
        )
        prompt_tokens = cls._as_int(
            item.get("prompt_tokens")
            or item.get("promptTokens")
            or item.get("prompt_token")
            or item.get("input_tokens")
        )
        completion_tokens = cls._as_int(
            item.get("completion_tokens")
            or item.get("completionTokens")
            or item.get("completion_token")
            or item.get("output_tokens")
        )
        quota = cls._as_int(item.get("quota") or item.get("consume_quota") or item.get("consumeQuota"))
        raw_type = item.get("type") or item.get("kind") or ""
        transaction_type = cls._log_transaction_type(raw_type)
        media_assets = cls._extract_log_media_assets(item, transaction_type)
        preview_asset = next((asset for asset in media_assets if not asset.get("expired") and asset.get("previewUrl")), None)
        normalized = {
            "id": item.get("id") or item.get("log_id") or item.get("logId") or "",
            "createdAt": created_at,
            "type": raw_type,
            "transactionType": transaction_type,
            "transactionLabel": {"consume": "消费", "refund": "退款", "topup": "充值"}.get(transaction_type, "其他"),
            "isRefund": transaction_type == "refund",
            "modelName": item.get("model_name") or item.get("modelName") or item.get("model") or "",
            "tokenName": item.get("token_name") or item.get("tokenName") or item.get("token") or "",
            "channelName": item.get("channel_name") or item.get("channelName") or "",
            "quota": quota,
            "promptTokens": prompt_tokens,
            "completionTokens": completion_tokens,
            "totalTokens": cls._as_int(item.get("total_tokens") or item.get("totalTokens")) or prompt_tokens + completion_tokens,
            "status": item.get("status") or item.get("code") or "",
            "content": item.get("content") or item.get("message") or item.get("prompt") or "",
            "requestId": item.get("request_id") or item.get("requestId") or "",
            "channelId": item.get("channel") or item.get("channel_id") or item.get("channelId") or "",
            "requestTime": cls._as_int(item.get("request_time") or item.get("requestTime") or item.get("use_time") or item.get("useTime")),
            "mediaAssets": media_assets,
            "raw": item,
        }
        if preview_asset:
            normalized.update({
                "previewUrl": preview_asset.get("previewUrl") or "",
                "downloadUrl": preview_asset.get("downloadUrl") or "",
                "previewKind": preview_asset.get("mediaType") or "link",
                "previewLabel": preview_asset.get("previewLabel") or cls._media_preview_label(preview_asset.get("mediaType") or ""),
                "previewFileName": preview_asset.get("fileName") or "",
            })
        return normalized

    @classmethod
    def _extract_task_items(cls, data: Any) -> tuple[List[Dict[str, Any]], int]:
        raw_items, total = cls._extract_paged_items(data)
        items = [cls._normalize_task_item(item) for item in raw_items]
        return items, total or len(items)

    @classmethod
    def _task_status_label(cls, status: Any) -> str:
        raw = str(status or "").strip().upper()
        return {
            "SUCCESS": "成功",
            "FAILURE": "失败",
            "IN_PROGRESS": "执行中",
            "SUBMITTED": "队列中",
            "QUEUED": "队列中",
            "NOT_START": "未启动",
            "UNKNOWN": "未知",
        }.get(raw, raw or "未知")

    @classmethod
    def _task_timestamp_seconds(cls, value: Any) -> int:
        number = cls._as_int(value)
        if number > 10_000_000_000:
            return number // 1000
        return number

    @classmethod
    def _task_duration_seconds(cls, start: Any, finish: Any) -> int:
        start_seconds = cls._task_timestamp_seconds(start)
        finish_seconds = cls._task_timestamp_seconds(finish)
        if not start_seconds or not finish_seconds or finish_seconds < start_seconds:
            return 0
        return finish_seconds - start_seconds

    @staticmethod
    def _first_present(item: Dict[str, Any], *keys: str) -> Any:
        for key in keys:
            if key in item and item.get(key) is not None:
                return item.get(key)
        return ""

    @staticmethod
    def _as_dict(value: Any) -> Dict[str, Any]:
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            text = value.strip()
            if not text:
                return {}
            try:
                parsed = json.loads(text)
            except (TypeError, ValueError):
                return {}
            return parsed if isinstance(parsed, dict) else {}
        return {}

    @classmethod
    def _task_properties(cls, item: Dict[str, Any]) -> Dict[str, Any]:
        return cls._as_dict(item.get("properties") or item.get("property") or {})

    @staticmethod
    def _task_action_label(action: Any) -> str:
        raw = str(action or "").strip()
        return {
            "generate": "图生视频",
            "textGenerate": "文生视频",
            "firstTailGenerate": "首尾帧生视频",
            "referenceGenerate": "参考生视频",
            "remixGenerate": "视频 Remix",
            "MUSIC": "生成音乐",
            "LYRICS": "生成歌词",
        }.get(raw, raw or "任务")

    @staticmethod
    def _looks_like_url(value: Any) -> bool:
        text = str(value or "").strip()
        return text.startswith("http://") or text.startswith("https://") or text.startswith("data:")

    @staticmethod
    def _is_preview_media_item(value: Any) -> bool:
        if not isinstance(value, dict):
            return False
        for key in ("is_preview", "isPreview", "preview", "is_partial", "isPartial", "partial"):
            flag = value.get(key)
            if flag is True or flag == 1 or str(flag).lower() == "true":
                return True
        for key in ("type", "kind", "role", "status", "stage", "event"):
            text = str(value.get(key) or "").strip().lower()
            if any(marker in text for marker in ("preview", "partial", "thumbnail")):
                return True
        return False

    @classmethod
    def _collect_media_urls(cls, value: Any) -> List[Dict[str, str]]:
        results: List[Dict[str, str]] = []

        def push(url: Any, kind_hint: str = "", content_type: str = "") -> None:
            if not cls._looks_like_url(url):
                return
            text = str(url).strip()
            if any(item.get("url") == text for item in results):
                return
            results.append({
                "url": text,
                "kindHint": kind_hint,
                "contentType": str(content_type or ""),
            })

        def walk(node: Any, key_hint: str = "") -> None:
            if isinstance(node, dict):
                if cls._is_preview_media_item(node):
                    return
                content_type = str(node.get("content_type") or node.get("contentType") or node.get("mime") or "")
                for key in (
                    "original_url",
                    "originalUrl",
                    "download_url",
                    "downloadUrl",
                    "result_url",
                    "resultUrl",
                    "output_url",
                    "outputUrl",
                    "file_url",
                    "fileUrl",
                    "media_url",
                    "mediaUrl",
                    "video_url",
                    "videoUrl",
                    "audio_url",
                    "audioUrl",
                    "image_url",
                    "imageUrl",
                    "url",
                    "src",
                    "preview_url",
                    "previewUrl",
                ):
                    if key in node:
                        push(node.get(key), key, content_type)
                for key in ("urls", "images", "videos", "audios", "output", "outputs", "data", "video", "audio", "image"):
                    if key in node:
                        walk(node.get(key), key)
                return
            if isinstance(node, list):
                for child in node:
                    walk(child, key_hint)
                return
            if cls._looks_like_url(node):
                push(node, key_hint)

        walk(value)
        return results

    @staticmethod
    def _media_kind(url: str, kind_hint: str = "", content_type: str = "", action: str = "") -> str:
        hint = f"{kind_hint} {content_type} {url}".lower()
        if "audio" in hint or any(hint.split("?")[0].endswith(ext) for ext in (".mp3", ".wav", ".m4a", ".aac", ".ogg")):
            return "audio"
        if "image" in hint or any(hint.split("?")[0].endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".webp", ".gif")):
            return "image"
        if "video" in hint or any(hint.split("?")[0].endswith(ext) for ext in (".mp4", ".webm", ".mov", ".m4v", ".m3u8")):
            return "video"
        if str(action or "") in {"generate", "textGenerate", "firstTailGenerate", "referenceGenerate", "remixGenerate"}:
            return "video"
        return "link"

    @classmethod
    def _task_preview(cls, item: Dict[str, Any], *, action: str, status: str) -> Dict[str, str]:
        candidates: List[Dict[str, str]] = []
        result_url = item.get("result_url") or item.get("resultUrl")
        if cls._looks_like_url(result_url):
            candidates.append({"url": str(result_url).strip(), "kindHint": "result_url", "contentType": ""})
        candidates.extend(cls._collect_media_urls(item.get("data")))
        fail_reason = item.get("fail_reason") or item.get("failReason")
        if cls._looks_like_url(fail_reason):
            candidates.append({"url": str(fail_reason).strip(), "kindHint": "fail_reason", "contentType": ""})

        if str(status or "").upper() != "SUCCESS":
            return {}
        for candidate in candidates:
            url = candidate.get("url") or ""
            if not url:
                continue
            kind = cls._media_kind(
                url,
                candidate.get("kindHint") or "",
                candidate.get("contentType") or "",
                action,
            )
            return {
                "previewUrl": url,
                "downloadUrl": url,
                "previewKind": kind,
                "previewLabel": {
                    "video": "预览视频",
                    "audio": "预览音频",
                    "image": "预览图片",
                }.get(kind, "打开结果"),
            }
        return {}

    @classmethod
    def _normalize_task_item(cls, item: Dict[str, Any]) -> Dict[str, Any]:
        submit_time = (
            item.get("submit_time")
            or item.get("submitTime")
            or item.get("created_at")
            or item.get("createdAt")
            or item.get("created_time")
        )
        finish_time = item.get("finish_time") or item.get("finishTime") or item.get("updated_at") or item.get("updatedAt")
        task_id = item.get("task_id") or item.get("taskId") or item.get("mj_id") or item.get("mjId") or item.get("id") or ""
        status = item.get("status") or ""
        action = str(item.get("action") or item.get("type") or item.get("kind") or "")
        properties = cls._task_properties(item)
        preview = cls._task_preview(item, action=action, status=str(status or ""))
        error_detail = item.get("fail_reason") or item.get("failReason") or ""
        detail = (
            item.get("detail")
            or (f"点击{preview.get('previewLabel', '')}" if preview else "")
            or error_detail
            or item.get("result_url")
            or item.get("resultUrl")
            or ""
        )
        result_url = item.get("result_url") or item.get("resultUrl") or ""
        normalized = {
            "id": item.get("id") or task_id,
            "submitTime": submit_time,
            "finishTime": finish_time,
            "durationSeconds": cls._task_duration_seconds(submit_time, finish_time),
            "channelId": cls._first_present(item, "channel_id", "channelId", "channel"),
            "platform": properties.get("origin_model_name") or properties.get("upstream_model_name") or item.get("platform") or item.get("provider") or "",
            "modelName": properties.get("origin_model_name") or properties.get("upstream_model_name") or item.get("model") or item.get("model_name") or item.get("modelName") or "",
            "type": cls._task_action_label(action),
            "action": action,
            "taskId": task_id,
            "status": status,
            "statusLabel": cls._task_status_label(status),
            "progress": item.get("progress") or "",
            "detail": detail,
            "errorDetail": error_detail,
            "resultUrl": result_url if cls._looks_like_url(result_url) else "",
            "quota": cls._as_int(item.get("quota")),
            "raw": item,
        }
        normalized.update(preview)
        return normalized

    @classmethod
    def _extract_log_stat(cls, data: Any) -> Dict[str, Any]:
        source = cls._pick_dict(data)
        quota = cls._as_int(
            source.get("quota")
            or source.get("used_quota")
            or source.get("usedQuota")
            or source.get("consume_quota")
            or source.get("consumeQuota")
        )
        total = cls._as_int(source.get("total") or source.get("request_count") or source.get("requestCount") or source.get("count"))
        return {
            "quota": quota,
            "total": total,
            "rpm": cls._as_int(source.get("rpm")),
            "tpm": cls._as_int(source.get("tpm")),
            "raw": source,
        }

    def _user_header(self) -> Dict[str, str]:
        if self.user_id is None:
            return {}
        return {"New-Api-User": str(self.user_id)}

    def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: Any = None,
        params: Optional[Dict[str, Any]] = None,
        extra_headers: Optional[Dict[str, str]] = None,
        use_session: bool = False,
        require_auth: bool = True,
    ) -> Any:
        if not self.base_url:
            raise NewApiError("中转站 Base URL 未配置")
        url = f"{self.base_url}{path}"
        headers: Dict[str, str] = {
            "Content-Type": "application/json",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }
        if require_auth and not use_session:
            headers.update(self._auth_headers())
        if extra_headers:
            headers.update(extra_headers)
        try:
            if use_session:
                response = self._session.request(method, url, json=json_body, params=params, headers=headers)
            else:
                with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                    response = client.request(method, url, json=json_body, params=params, headers=headers)
        except httpx.HTTPError as error:
            raise NewApiError(f"网络请求失败: {error}") from error

        text = response.text or ""
        try:
            data = response.json()
        except ValueError as error:
            raise NewApiError(
                f"非 JSON 响应 (HTTP {response.status_code}): {text[:200]}",
                status_code=response.status_code,
            ) from error

        if isinstance(data, dict) and data.get("success") is False:
            raise NewApiError(
                self._error_message(data, "请求失败"),
                status_code=response.status_code,
                payload=data,
            )
        if response.status_code >= 400:
            raise NewApiError(
                self._error_message(data, f"HTTP {response.status_code}"),
                status_code=response.status_code,
                payload=data,
            )
        return data

    def login(self, username: str, password: str) -> Dict[str, Any]:
        login_response = self._request(
            "POST",
            "/api/user/login",
            json_body={"username": username, "password": password},
            use_session=True,
            require_auth=False,
        )
        data = login_response.get("data") or {}
        if data.get("require_2fa"):
            raise NewApiError("此账号开启了 2FA，当前 漫创AI 登录页还未接入 2FA 验证")
        self.user_id = self._extract_user_id(data)

        self.access_token = self._extract_access_token(data)
        token_errors: List[str] = []
        if not self.access_token:
            for token_path in ("/api/user/self/token", "/api/user/token"):
                try:
                    token_response = self._request(
                        "GET",
                        token_path,
                        use_session=True,
                        require_auth=False,
                        extra_headers=self._user_header(),
                    )
                    self.access_token = self._extract_access_token(token_response)
                    if self.access_token:
                        break
                    token_errors.append(f"{token_path}: 响应中没有 AccessToken")
                except NewApiError as error:
                    token_errors.append(f"{token_path}: {error.message}")
        if not self.access_token or self.user_id is None:
            detail = "；".join(token_errors) if token_errors else "登录响应中没有 AccessToken"
            raise NewApiError(f"登录成功但没有拿到可持久化的 AccessToken：{detail}")
        return {
            "user_id": self.user_id,
            "access_token": self.access_token,
            "username": data.get("username"),
            "role": data.get("role"),
            "group": data.get("group"),
        }

    def register(
        self,
        username: str,
        password: str,
        *,
        email: Optional[str] = None,
        verification_code: Optional[str] = None,
        aff_code: Optional[str] = None,
    ) -> None:
        body: Dict[str, Any] = {
            "username": username,
            "password": password,
            "password2": password,
        }
        if email:
            body["email"] = email
        if verification_code:
            body["verification_code"] = verification_code
        if aff_code:
            body["aff_code"] = aff_code
        self._request("POST", "/api/user/register", json_body=body, require_auth=False)

    def send_email_verification(self, email: str) -> None:
        self._request("GET", "/api/verification", params={"email": email}, require_auth=False)

    def get_user_info(self) -> Dict[str, Any]:
        response = self._request("GET", "/api/user/self")
        return response.get("data") or {}

    def list_available_models(self) -> List[str]:
        errors: List[str] = []
        for path in (
            "/api/user/self/models",
            "/api/user/models",
            "/api/user/available_models",
            "/api/user/available-models",
            "/api/models",
            "/api/channel/models",
        ):
            try:
                response = self._request("GET", path)
                return self._extract_models(response)
            except NewApiError as error:
                errors.append(f"{path}: {error.message}")
        raise NewApiError("无法读取可用模型列表：" + "；".join(errors))

    def list_openai_model_records(self, api_key: str) -> List[Dict[str, Any]]:
        key = (api_key or "").strip()
        if not key:
            raise NewApiError("API Key 未配置，无法读取 /v1/models")
        token = key if key.lower().startswith("bearer ") else f"Bearer {key}"
        response = self._request(
            "GET",
            "/v1/models",
            extra_headers={"Authorization": token},
            require_auth=False,
        )
        return self._extract_model_records(response)

    def list_pricing_records(self) -> List[Dict[str, Any]]:
        response = self._request("GET", "/api/pricing", require_auth=False)
        return self._extract_pricing_records(response)

    def list_portal_model_records(self, *, page_size: int = 200) -> List[Dict[str, Any]]:
        clean_page_size = max(1, min(int(page_size or 200), 500))
        page = 1
        records: List[Dict[str, Any]] = []
        seen: set[str] = set()
        while page <= 50:
            response = self._request(
                "GET",
                "/api/portal/models/list",
                params={"pageNum": page, "pageSize": clean_page_size},
            )
            if isinstance(response, dict) and response.get("code") not in (None, 200):
                raise NewApiError(str(response.get("msg") or response.get("message") or "模型列表加载失败"))
            container = response.get("data") if isinstance(response, dict) and isinstance(response.get("data"), dict) else response
            page_records = self._extract_model_records(container)
            raw_rows = []
            if isinstance(container, dict):
                raw_rows = container.get("rows") or container.get("items") or container.get("models") or []
            for record in page_records:
                code = self._model_code_from_record(record)
                if not code or code in seen:
                    continue
                seen.add(code)
                records.append(record)
            total = self._as_int(container.get("total") if isinstance(container, dict) else None)
            if not page_records:
                break
            if total and len(records) >= total:
                break
            if isinstance(raw_rows, list) and len(raw_rows) < clean_page_size:
                break
            page += 1
        return sorted(records, key=lambda item: str(item.get("id") or item.get("modelCode") or ""))

    def redeem(self, redemption_code: str) -> int:
        response = self._request("POST", "/api/user/topup", json_body={"key": redemption_code})
        return int(response.get("data") or 0)

    def list_api_keys(self, *, page: int = 1, size: int = 20, order: str = "-id") -> List[TokenInfo]:
        response = self._request("GET", "/api/token/", params={"p": page, "size": size, "order": order})
        data = response.get("data") or {}
        items = data.get("items") if isinstance(data, dict) else data
        return [TokenInfo.from_dict(item) for item in (items or [])]

    @classmethod
    def _extract_created_api_key(cls, data: Any) -> str:
        if isinstance(data, str):
            return data.strip()
        if not isinstance(data, dict):
            return ""
        for key in ("key", "api_key", "apiKey", "sk_key", "skKey"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        for key in ("token", "data", "item", "record"):
            nested = data.get(key)
            if nested is data:
                continue
            value = cls._extract_created_api_key(nested)
            if value:
                return value
        return ""

    @staticmethod
    def _is_masked_api_key(value: str) -> bool:
        text = (value or "").strip()
        return "*" in text or "…" in text or "..." in text

    @classmethod
    def _is_usable_api_key(cls, value: str) -> bool:
        text = (value or "").strip()
        if text.lower().startswith("bearer "):
            text = text[7:].strip()
        if text and not text.startswith("sk-"):
            text = f"sk-{text}"
        return bool(text) and not cls._is_masked_api_key(text)

    def get_api_key(self, token_id: int) -> str:
        clean_id = int(token_id or 0)
        if clean_id <= 0:
            raise NewApiError("API Key ID 无效")
        response = self._request("POST", f"/api/token/{clean_id}/key")
        api_key = self._extract_created_api_key(response)
        if not api_key:
            raise NewApiError("中转站没有返回完整 API Key")
        return api_key if api_key.startswith("sk-") else f"sk-{api_key}"

    def _with_full_key_from_token_endpoint(self, token: TokenInfo) -> TokenInfo:
        if not token.id or self._is_usable_api_key(token.sk_key):
            return token
        api_key = self.get_api_key(token.id)
        return replace(token, key=api_key)

    @classmethod
    def _extract_created_token(cls, data: Any, *, fallback_name: str = "") -> Optional[TokenInfo]:
        if isinstance(data, dict):
            source = data.get("data") if isinstance(data.get("data"), dict) else data
            api_key = cls._extract_created_api_key(source)
            if not api_key:
                return None
            payload = dict(source)
            payload["key"] = api_key
            if not payload.get("name"):
                payload["name"] = fallback_name
            return TokenInfo.from_dict(payload)
        api_key = cls._extract_created_api_key(data)
        if not api_key:
            return None
        return TokenInfo(
            id=0,
            name=fallback_name,
            key=api_key,
            status=1,
            remain_quota=0,
            used_quota=0,
            unlimited_quota=True,
            expired_time=-1,
            created_time=0,
            group="",
        )

    def get_consumption_history(
        self,
        *,
        limit: int = 80,
        start_timestamp: Optional[int] = None,
        end_timestamp: Optional[int] = None,
    ) -> Dict[str, Any]:
        clean_limit = max(1, min(int(limit or 80), 200))
        log_params: Dict[str, Any] = {
            "p": 1,
            "page": 1,
            "page_size": clean_limit,
            "size": clean_limit,
        }
        if start_timestamp:
            log_params["start_timestamp"] = int(start_timestamp)
        if end_timestamp:
            log_params["end_timestamp"] = int(end_timestamp)
        stat_params = {
            key: value
            for key, value in log_params.items()
            if key in ("start_timestamp", "end_timestamp")
        }
        stat_response = self._request("GET", "/api/log/self/stat", params=stat_params or None)
        log_response = self._request(
            "GET",
            "/api/log/self",
            params=log_params,
        )
        items, total = self._extract_log_items(log_response)
        items = [item for item in items if item.get("transactionType") in {"consume", "refund"}]
        summary = self._extract_log_stat(stat_response)
        debit_quota = sum(int(item.get("quota") or 0) for item in items if item.get("transactionType") == "consume")
        refund_quota = sum(int(item.get("quota") or 0) for item in items if item.get("transactionType") == "refund")
        if not summary.get("quota"):
            summary["quota"] = debit_quota
        summary["debitQuota"] = int(summary.get("quota") or debit_quota)
        summary["refundQuota"] = refund_quota
        summary["netQuota"] = summary["debitQuota"] - refund_quota
        if not summary.get("total"):
            summary["total"] = total
        return {
            "summary": summary,
            "items": items[:clean_limit],
            "total": total,
        }

    def get_usage_history(
        self,
        *,
        limit: int = 80,
        start_timestamp: Optional[int] = None,
        end_timestamp: Optional[int] = None,
        task_id: str = "",
        channel_id: str = "",
        status: str = "",
    ) -> Dict[str, Any]:
        clean_limit = max(1, min(int(limit or 80), 200))
        params: Dict[str, Any] = {
            "p": 1,
            "page": 1,
            "page_size": clean_limit,
            "size": clean_limit,
        }
        if start_timestamp:
            params["start_timestamp"] = int(start_timestamp)
        if end_timestamp:
            params["end_timestamp"] = int(end_timestamp)
        if task_id:
            params["task_id"] = str(task_id)
        if channel_id:
            params["channel_id"] = str(channel_id)
        if status and str(status).lower() != "all":
            params["status"] = str(status)
        response = self._request("GET", "/api/task/self", params=params)
        items, total = self._extract_task_items(response)
        return {
            "summary": {"total": total},
            "items": items[:clean_limit],
            "total": total,
        }

    def desktop_announcements(self) -> Dict[str, Any]:
        return self._request("GET", "/api/desktop-announcements", require_auth=True)

    def create_api_key(
        self,
        name: str,
        *,
        remain_quota: int = 0,
        unlimited_quota: bool = True,
        expired_time: int = -1,
        model_limits: Optional[List[str]] = None,
        allow_ips: Optional[List[str]] = None,
        group: str = "",
    ) -> TokenInfo:
        create_response = self._request(
            "POST",
            "/api/token/",
            json_body={
                "name": name,
                "remain_quota": remain_quota,
                "unlimited_quota": unlimited_quota,
                "expired_time": expired_time,
                "model_limits_enabled": bool(model_limits),
                "model_limits": ",".join(model_limits) if model_limits else "",
                "allow_ips": ",".join(allow_ips) if allow_ips else "",
                "group": group,
            },
        )
        created_token = self._extract_created_token(create_response, fallback_name=name)
        if created_token:
            return self._with_full_key_from_token_endpoint(created_token)
        latest = self.list_api_keys(page=1, size=1, order="-id")
        if not latest:
            raise NewApiError("创建成功但无法读取最新令牌")
        return self._with_full_key_from_token_endpoint(latest[0])

    def delete_api_key(self, token_id: int) -> None:
        self._request("DELETE", f"/api/token/{token_id}")


async def stream_desktop_announcements(base_url: str, access_token: str, user_id: int) -> AsyncIterator[str]:
    headers = {
        "Authorization": access_token,
        "New-Api-User": str(user_id),
    }
    url = f"{base_url.rstrip('/')}/api/desktop-announcements/events"
    async with httpx.AsyncClient(timeout=None, follow_redirects=True) as client:
        async with client.stream("GET", url, headers=headers) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                yield line
