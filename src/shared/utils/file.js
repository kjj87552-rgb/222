/* File / download utilities */

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}

export function safeFileName(name, fallback = "asset") {
  return String(name || fallback)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80) || fallback;
}

function assetDownloadSource(asset) {
  return asset?.src || asset?.url || asset?.assetUrl || asset?.imageUrl || asset?.videoSrc || asset?.audioSrc || asset?.assetPath || asset?.path || "";
}

function assetDownloadPath(asset) {
  return asset?.assetPath || asset?.localPath || asset?.path || "";
}

async function buildDownloadBlob(source, overrideText, mime) {
  if (overrideText != null) {
    return new Blob([String(overrideText)], { type: mime });
  }
  if (!source) {
    throw new Error("没有可下载的文件地址");
  }
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`读取文件失败：${response.status}`);
  }
  return await response.blob();
}

async function saveWithBrowserPicker(asset, source, overrideText, mime) {
  if (typeof window === "undefined" || typeof window.showSaveFilePicker !== "function") {
    return null;
  }
  const filename = asset.filename || "asset";
  try {
    const handle = await window.showSaveFilePicker({ suggestedName: filename });
    const writable = await handle.createWritable();
    const blob = await buildDownloadBlob(source, overrideText, asset.mime || mime);
    await writable.write(blob);
    await writable.close();
    return { path: filename, browserFilePicker: true };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { canceled: true };
    }
    const message = String(error?.message || error || "未知错误");
    console.warn("Browser save file failed", error);
    if (typeof window.alert === "function") {
      window.alert(`下载失败：${message}`);
    }
    return { error: message };
  }
}

export async function triggerDownload(asset, overrideText, mime = "text/plain;charset=utf-8") {
  if (!asset) return;
  const source = assetDownloadSource(asset);
  const filename = asset.filename || "asset";
  if (typeof window !== "undefined" && window.libai?.system?.saveFile) {
    try {
      return await window.libai.system.saveFile({
        source,
        assetPath: assetDownloadPath(asset),
        filename,
        kind: asset.mediaKind || asset.kind || "",
        mime: asset.mime || mime,
        text: overrideText != null ? String(overrideText) : undefined,
      });
    } catch (error) {
      const message = String(error?.message || error || "未知错误");
      console.warn("Electron save file failed", error);
      if (typeof window.alert === "function") {
        window.alert(`下载失败：${message}`);
      }
      return { error: message };
    }
  }

  const pickerResult = await saveWithBrowserPicker(asset, source, overrideText, mime);
  if (pickerResult) return pickerResult;

  let objectUrl = "";
  const a = document.createElement("a");
  if (overrideText != null) {
    objectUrl = URL.createObjectURL(new Blob([overrideText], { type: mime }));
    a.href = objectUrl;
  } else {
    a.href = source;
  }
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
  return { browserDownload: true };
}
