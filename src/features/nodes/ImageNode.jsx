import React from 'react';
import { useCanvasMediaEnabled } from '../canvas/canvasMediaVisibilityStore.js';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { ICrop, IGrid9, IImage, IMagic, IText, IZoomIn } from '../../shared/ui/icons/index.jsx';
import { MediaPreviewButton, NodeBlankState, NodeShell } from './NodeShell.jsx';

const IMAGE_TOOLS = [
  { key: 'textpolish', label: '润色', icon: IText },
  { key: 'imagecrop', label: '裁剪', icon: ICrop },
  { key: 'imageannotate', label: '标注', icon: IMagic },
  { key: 'imagesplit', label: '切割', icon: IGrid9 },
  { key: 'imageupscale', label: '放大', icon: IZoomIn },
  { key: 'imageinpaint', label: '涂抹', icon: IMagic },
];

const ASSET_URL_ID_RE = /\/assets\/([^/?#]+)/;

function nodeErrorText(node) {
  if (typeof node?.error === 'string') return node.error.trim();
  if (node?.error) return String(node.error);
  return '';
}

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function decodeAssetId(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractAssetIdFromUrl(value) {
  const text = compactString(value);
  if (!text) return '';
  const match = text.match(ASSET_URL_ID_RE);
  return match ? decodeAssetId(match[1]) : '';
}

function imageNodeAssetId(node) {
  return compactString(node?.assetId)
    || extractAssetIdFromUrl(node?.src)
    || extractAssetIdFromUrl(node?.url)
    || extractAssetIdFromUrl(node?.assetUrl)
    || extractAssetIdFromUrl(node?.imageUrl);
}

function explicitImagePreviewSource(node) {
  return compactString(node?.thumbUrl)
    || compactString(node?.thumbnailUrl)
    || compactString(node?.thumbnail)
    || compactString(node?.thumb)
    || compactString(node?.thumbPath);
}

function imageThumbUrlForAsset(assetId) {
  return assetId ? `/assets/${encodeURIComponent(assetId)}/thumb` : '';
}

function seedencePortraitAssetName(asset) {
  return compactString(asset?.name)
    || compactString(asset?.title)
    || compactString(asset?.assetId)
    || compactString(asset?.asset_id)
    || 'Seedence 角色';
}

export function getImageNodeDisplaySources(node) {
  const src = makeAssetUrl({
    src: node?.src || node?.url || node?.assetUrl || node?.imageUrl,
    assetId: node?.assetId,
    assetPath: node?.assetPath,
    localPath: node?.localPath,
    path: node?.path,
    preferLocalAsset: true,
  });
  const explicitPreview = explicitImagePreviewSource(node);
  const previewSrc = explicitPreview
    ? makeAssetUrl({ src: explicitPreview, assetPath: node?.thumbPath, preferLocalAsset: true })
    : makeAssetUrl({ src: imageThumbUrlForAsset(imageNodeAssetId(node)) });
  return {
    src,
    previewSrc: previewSrc || src,
  };
}

function ImageNodeToolbar({ nodeId, onOpenModal }) {
  const openTool = (event, key) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenModal?.(key, nodeId);
  };

  return (
    <div
      className="image-node-action-dock"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="image-node-action-main"
        title="图片工具"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <IImage size={13}/>
        <span>工具</span>
      </button>
      <span className="image-node-action-options" role="menu" aria-label="图片工具列表">
        {IMAGE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.key}
              type="button"
              role="menuitem"
              title={tool.label}
              onClick={(event) => openTool(event, tool.key)}
            >
              <Icon size={13}/>
              <span>{tool.label}</span>
            </button>
          );
        })}
      </span>
    </div>
  );
}

export function ImageNode(props) {
  const { node, onOpenModal } = props;
  const { src, previewSrc } = getImageNodeDisplaySources(node);
  const deferMediaLoading = Boolean(props.deferMediaLoading || node?.deferMediaLoading);
  const mediaEnabled = useCanvasMediaEnabled(node?.id, deferMediaLoading);
  const [useFullImage, setUseFullImage] = React.useState(false);
  const [loadFailedSrc, setLoadFailedSrc] = React.useState('');
  React.useEffect(() => {
    setLoadFailedSrc('');
    setUseFullImage(false);
  }, [mediaEnabled, previewSrc, src]);
  const errorText = nodeErrorText(node);
  const hasLoadError = Boolean(src && loadFailedSrc === src);
  const hasFailed = !node.generating && !src && (node.tag === '失败' || Boolean(errorText));
  const mediaDeferred = Boolean(src && !mediaEnabled && !node.generating && !hasLoadError);
  const empty = !src && !node.generating && !hasFailed && !hasLoadError;
  const activeSrc = mediaEnabled ? (useFullImage ? src : previewSrc) : '';
  const seedencePortraitName = seedencePortraitAssetName(node?.seedancePortraitAsset);
  const hasSeedencePortraitAsset = Boolean(node?.seedancePortraitAsset);
  const handleImageError = React.useCallback(() => {
    if (activeSrc && src && activeSrc !== src) {
      setUseFullImage(true);
      return;
    }
    setLoadFailedSrc(src || activeSrc);
  }, [activeSrc, src]);

  return (
    <NodeShell {...props} isEmpty={empty || mediaDeferred || hasFailed || hasLoadError} toolbar={null}>
      {node.generating && (
        <div className="gen-overlay">
          <div className="spin"/>
          <div className="pct">{node.progress || 1}%</div>
          <div className="label">{node.model || '默认图片模型'} · 生成中</div>
        </div>
      )}
      {activeSrc && !node.generating && !hasLoadError && (
        <div className="image-node-media">
          <img src={activeSrc} alt="" draggable="false" decoding="async" onError={handleImageError}/>
          <MediaPreviewButton title={node.title} onClick={() => onOpenModal?.('preview', node.id)}/>
          <ImageNodeToolbar nodeId={node.id} onOpenModal={onOpenModal}/>
        </div>
      )}
      {mediaDeferred && (
        <NodeBlankState
          icon={<IImage size={25} sw={1.5}/>}
          title="图片待加载"
          description="移动停止后按视口加载预览资源"
          tone="image"
        />
      )}
      {hasLoadError && (
        <NodeBlankState
          icon={<IImage size={25} sw={1.5}/>}
          title="图片加载失败"
          description="资源文件不存在或后端地址已变化，请重新打开项目或重新导入图片"
          tone="error"
        />
      )}
      {hasFailed && (
        <NodeBlankState
          icon={<IImage size={25} sw={1.5}/>}
          title="生成失败"
          description={errorText || '后端没有返回错误详情，请检查模型配置或稍后重试'}
          tone="error"
        />
      )}
      {empty && (
        <NodeBlankState
          icon={<IImage size={25} sw={1.5}/>}
          title="图片输入"
          description="生成结果或本地图片会显示在这里"
          tone="image"
        />
      )}
      {hasSeedencePortraitAsset && (
        <span
          className="image-node-seedence-badge"
          title={`已加入 Seedence 角色库：${seedencePortraitName}`}
        >
          已入库
        </span>
      )}
    </NodeShell>
  );
}
