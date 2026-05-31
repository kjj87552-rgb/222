/* Bottom generator dock: connected generation, upload references, and model/style selection. */
import React from 'react';
import {
  IAdd,
  IAudio,
  IBox,
  ICamera,
  ICheck,
  IChevD,
  IClose,
  IFilm,
  IFolder,
  IGrid9,
  IImage,
  IMic,
  IScript,
  ISparkle,
  IText,
  IVideo,
} from '../../shared/ui/icons/index.jsx';
import { SLASH_COMMANDS, STYLE_PRESETS } from '../../shared/data/presets.js';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { AssetStore } from '../../shared/platform/assetStore.js';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { capabilityForGeneration } from '../../shared/platform/generationPayload.js';
import { modelLabel, modelMatchesLabel, selectBackendModel } from '../../shared/platform/modelSelection.js';
import { useAssets } from '../../shared/store/libraryStore.js';
import { DEFAULT_PROJECT_ID, makeAssetRecord } from '../../shared/utils/asset.js';
import { readFileAsDataUrl } from '../../shared/utils/file.js';
import { importLocalFileAsAsset } from '../../shared/utils/uploadHelpers.js';
import {
  MEDIA_KIND_LABELS,
  findActiveMediaMention,
  getMediaKind,
  getMediaSrc,
  getMediaThumbnailSrc,
  getMediaTitle,
  isMediaAsset,
  makeMediaToken,
  mergeMediaReference,
  removeMediaReference,
  removeMediaMentionText,
} from '../../shared/utils/mediaReferences.js';
import { isProjectLibraryAsset, withProjectAssetScope } from '../../shared/utils/assetScopes.js';
import { genStyles } from './styles.js';

const TAB_DEFS = [
  ['image', IImage, '图像'],
  ['video', IVideo, '视频'],
  ['audio', IAudio, '音频'],
  ['text', IText, '文本'],
];

const OPTIONS_BY_TAB = {
  image: ['1:1', '16:9', '9:16', '3:4', '4:3'],
  video: ['1:1', '16:9', '9:16', '3:4', '4:3'],
  audio: ['流行', '民谣', '电子', '古典'],
  text: ['精确', '创意'],
};

const ACCEPT_BY_TAB = {
  image: 'image/*',
  video: 'image/*,video/*,audio/*',
  audio: 'audio/*',
  text: 'image/*,video/*,audio/*',
};

const PICK_FILTERS_BY_TAB = {
  image: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'bmp'] }],
  video: [
    { name: 'Media', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'mov', 'webm', 'mkv', 'avi', 'mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac'] },
  ],
  audio: [{ name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac'] }],
  text: [
    { name: 'Media', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'mov', 'webm', 'mkv', 'avi', 'mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac'] },
  ],
};

function defaultOption(tab) {
  if (tab === 'audio') return '流行';
  if (tab === 'text') return '精确';
  return '16:9';
}

function inferKindFromFile(file) {
  const mime = String(file?.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  const name = String(file?.name || '').toLowerCase();
  if (/\.(png|jpe?g|webp|gif|avif|bmp|svg)$/.test(name)) return 'image';
  if (/\.(mp4|mov|webm|mkv|avi)$/.test(name)) return 'video';
  if (/\.(mp3|wav|m4a|flac|ogg|aac)$/.test(name)) return 'audio';
  return '';
}

function assetAllowedForTab(asset, tab) {
  const kind = getMediaKind(asset);
  if (tab === 'image') return kind === 'image';
  if (tab === 'audio') return kind === 'audio';
  return kind === 'image' || kind === 'video' || kind === 'audio';
}

function iconForKind(kind, size = 15) {
  if (kind === 'video') return <IVideo size={size}/>;
  if (kind === 'audio') return <IAudio size={size}/>;
  return <IImage size={size}/>;
}

function mediaDisplayUrl(asset, thumbnail = false) {
  const raw = thumbnail ? getMediaThumbnailSrc(asset) : getMediaSrc(asset);
  return raw ? makeAssetUrl({ ...asset, src: raw, url: raw, assetUrl: raw }) : '';
}

function MediaReferenceThumb({ asset }) {
  const kind = getMediaKind(asset);
  const thumbUrl = mediaDisplayUrl(asset, true);
  const mediaUrl = mediaDisplayUrl(asset, false);
  const [failed, setFailed] = React.useState(false);
  const imageUrl = failed && mediaUrl !== thumbUrl ? mediaUrl : (thumbUrl || mediaUrl);

  React.useEffect(() => {
    setFailed(false);
  }, [thumbUrl, mediaUrl]);

  if (kind === 'image' && imageUrl) {
    return <img src={imageUrl} alt="" loading="lazy" decoding="async" draggable="false" onError={() => setFailed(true)} />;
  }
  if (kind === 'video' && thumbUrl && !failed) {
    return <img src={thumbUrl} alt="" loading="lazy" decoding="async" draggable="false" onError={() => setFailed(true)} />;
  }
  return <span className="media-icon">{iconForKind(kind, 15)}</span>;
}

function styleId(style) {
  return style?.id || style?.n || 'none';
}

function styleName(style) {
  return style?.name || style?.n || '';
}

function stylePromptFor(style) {
  if (!style) return '';
  if (style.prompt || style.description) return style.prompt || style.description;
  const name = styleName(style);
  const tag = style?.tag || '';
  if (style.source === 'style-library') {
    return `${name}风格，参考风格库${tag ? ` ${tag}` : ''}的色彩、材质、构图和光影特征`;
  }
  return `${name}风格，${tag ? `${tag}方向，` : ''}保持统一的色彩、材质、构图和光影语言`;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeImportedAsset(asset) {
  const src = getMediaSrc(asset);
  if (!src) return null;
  return {
    ...asset,
    src,
    url: asset.url || src,
    title: asset.title || asset.name || asset.filename || getMediaTitle(asset),
  };
}

function mergeAssetLists(...lists) {
  const map = new Map();
  lists.flat().forEach((asset) => {
    if (!asset) return;
    const key = asset.id || getMediaSrc(asset);
    if (!key) return;
    map.set(key, { ...(map.get(key) || {}), ...asset });
  });
  return Array.from(map.values());
}

export function Generator({ onRunSlash, onOpenModal, onGenerate, projectId }) {
  const assets = useAssets();
  const effectiveProjectId = projectId || DEFAULT_PROJECT_ID;
  const promptRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [tab, setTab] = React.useState('image');
  const [prompt, setPrompt] = React.useState('');
  const [slash, setSlash] = React.useState(false);
  const [openPanel, setOpenPanel] = React.useState(null);
  const [ratio, setRatio] = React.useState('16:9');
  const [count, setCount] = React.useState(1);
  const [style, setStyle] = React.useState(STYLE_PRESETS[0] || null);
  const [referenceAssets, setReferenceAssets] = React.useState([]);
  const [hoveredReferenceAsset, setHoveredReferenceAsset] = React.useState(null);
  const [mention, setMention] = React.useState(null);
  const [backendMentionAssets, setBackendMentionAssets] = React.useState([]);
  const [mentionAssetsLoading, setMentionAssetsLoading] = React.useState(false);
  const [models, setModels] = React.useState([]);
  const [modelLoading, setModelLoading] = React.useState(false);
  const [providerModelId, setProviderModelId] = React.useState('');
  const [model, setModel] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  const capability = capabilityForGeneration(tab);
  const supportsStyleReferences = tab !== 'audio';
  const selectedModel = React.useMemo(
    () => models.find((item) => item.id === providerModelId) || models.find((item) => modelMatchesLabel(item, model)) || null,
    [model, models, providerModelId],
  );
  const displayModel = selectedModel ? modelLabel(selectedModel) : (model || (modelLoading ? '加载模型...' : '暂无可用模型'));
  const canGenerate = prompt.trim().length > 0 && Boolean(selectedModel);

  const availableAssets = React.useMemo(
    () => (supportsStyleReferences
      ? mergeAssetLists(assets, backendMentionAssets)
        .filter((asset) => isMediaAsset(asset) && isProjectLibraryAsset(asset, effectiveProjectId) && assetAllowedForTab(asset, tab))
      : []),
    [assets, backendMentionAssets, effectiveProjectId, supportsStyleReferences, tab],
  );
  const filteredMentionAssets = React.useMemo(() => {
    if (!supportsStyleReferences || !mention) return [];
    const query = mention.query.trim().toLowerCase();
    return availableAssets.filter((asset) => {
      if (!query) return true;
      return `${getMediaTitle(asset)} ${MEDIA_KIND_LABELS[getMediaKind(asset)] || ''} ${makeMediaToken(asset)}`
        .toLowerCase()
        .includes(query);
    }).slice(0, 80);
  }, [availableAssets, mention, supportsStyleReferences]);

  React.useEffect(() => {
    if (!supportsStyleReferences || !mention) return undefined;
    let cancelled = false;
    setMentionAssetsLoading(true);
    AssetStore.list({ project_id: effectiveProjectId })
      .then((result) => {
        if (cancelled) return;
        const clean = (Array.isArray(result?.assets) ? result.assets : [])
          .map(normalizeImportedAsset)
          .filter(Boolean);
        setBackendMentionAssets(clean);
      })
      .catch(() => {
        if (!cancelled) setBackendMentionAssets([]);
      })
      .finally(() => {
        if (!cancelled) setMentionAssetsLoading(false);
      });
    return () => { cancelled = true; };
  }, [effectiveProjectId, mention, supportsStyleReferences]);

  React.useEffect(() => {
    setPrompt('');
    setReferenceAssets([]);
    setHoveredReferenceAsset(null);
    setMention(null);
    setSlash(false);
    setOpenPanel(null);
  }, [effectiveProjectId]);

  React.useEffect(() => {
    setRatio(defaultOption(tab));
    setOpenPanel(null);
    setMention(null);
    setSlash(false);
    setReferenceAssets((refs) => (tab === 'audio' ? [] : refs.filter((asset) => assetAllowedForTab(asset, tab))));
  }, [tab]);

  React.useEffect(() => {
    let cancelled = false;
    setModelLoading(true);
    ProviderStore.models({ capability })
      .then((result) => {
        if (cancelled) return;
        const next = Array.isArray(result?.models) ? result.models.filter((item) => item.enabled !== false) : [];
        const preferred = selectBackendModel(next, { currentId: providerModelId, currentLabel: model });
        setModels(next);
        setProviderModelId(preferred?.id || '');
        setModel(preferred ? modelLabel(preferred) : '');
      })
      .catch(() => {
        if (!cancelled) {
          setModels([]);
          setProviderModelId('');
          setModel('');
        }
      })
      .finally(() => {
        if (!cancelled) setModelLoading(false);
      });
    return () => { cancelled = true; };
  }, [capability]);

  const addReferences = React.useCallback((items, insertTokens = false) => {
    if (!supportsStyleReferences) return;
    const clean = items.map(normalizeImportedAsset).filter((asset) => asset && isMediaAsset(asset) && assetAllowedForTab(asset, tab));
    if (!clean.length) return;
    setReferenceAssets((prev) => clean.reduce((refs, asset) => mergeMediaReference(refs, asset), prev));
    if (insertTokens) {
      const tokens = clean.map(makeMediaToken);
      setPrompt((value) => `${value}${value.trim() ? ' ' : ''}${tokens.join(' ')} `);
    }
  }, [supportsStyleReferences, tab]);

  const handlePromptChange = (event) => {
    const value = event.target.value;
    const nextMention = supportsStyleReferences ? findActiveMediaMention(value, event.target.selectionStart) : null;
    setPrompt(value);
    setMention(nextMention);
    setSlash(value.endsWith('/') && !nextMention);
  };

  const updateMention = (target, value = target.value) => {
    if (!supportsStyleReferences) {
      setMention(null);
      return;
    }
    setMention(findActiveMediaMention(value, target.selectionStart));
  };

  const handleUploadFiles = async (fileList) => {
    if (!supportsStyleReferences) return;
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const records = [];
      for (const file of files) {
        const kind = inferKindFromFile(file);
        if (!kind || !assetAllowedForTab({ kind, src: 'pending' }, tab)) continue;
        const meta = {
          source: 'generator-upload',
          inLibrary: false,
          libraryAsset: false,
          scope: 'project',
          projectId: effectiveProjectId,
          project_id: effectiveProjectId,
        };
        let persisted = await importLocalFileAsAsset(file, effectiveProjectId, kind, meta);
        let dataUrl = '';
        if (!persisted) {
          dataUrl = await readFileAsDataUrl(file);
        }
        if (AssetStore.writeAvailable()) {
          try {
            if (!persisted) {
              persisted = await AssetStore.writeDataUrl(effectiveProjectId, {
                filename: file.name || `${kind}-${Date.now()}`,
                dataUrl,
                kind,
                mime: file.type,
                meta,
              });
            }
          } catch (error) {
            console.warn('Generator upload persistence failed', error);
          }
        }
        const localRecord = makeAssetRecord({
          kind,
          src: dataUrl,
          title: file.name || '未命名素材',
          source: 'generator-upload',
        });
        records.push({
          ...withProjectAssetScope(localRecord, effectiveProjectId),
          ...(persisted || {}),
          id: persisted?.id || localRecord.id,
          kind: persisted?.kind || kind,
          src: persisted?.src || persisted?.url || dataUrl,
          url: persisted?.url || persisted?.src || dataUrl,
          title: persisted?.title || persisted?.name || file.name || localRecord.title,
          filename: persisted?.filename || file.name,
          mime: persisted?.mime || file.type,
          size: file.size,
          source: persisted?.source || 'generator-upload',
          projectId: effectiveProjectId,
          project_id: effectiveProjectId,
          assetScope: 'project',
          libraryScope: 'project',
          inLibrary: false,
          libraryAsset: false,
        });
      }
      if (records.length) {
        addReferences(records, false);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openUploadPicker = async () => {
    if (!supportsStyleReferences) return;
    setOpenPanel(null);
    setMention(null);
    setSlash(false);

    if (AssetStore.available()) {
      setUploading(true);
      try {
        const imported = await AssetStore.pickAndImport(effectiveProjectId, {
          multiple: true,
          kind: tab === 'image' || tab === 'audio' ? tab : undefined,
          filters: PICK_FILTERS_BY_TAB[tab],
          deferCopy: true,
          meta: {
            source: 'generator-upload',
            inLibrary: false,
            libraryAsset: false,
            scope: 'project',
            projectId: effectiveProjectId,
            project_id: effectiveProjectId,
          },
        });
        const clean = imported.map(normalizeImportedAsset).filter(Boolean).map((asset) => withProjectAssetScope(asset, effectiveProjectId));
        if (clean.length) {
          addReferences(clean, false);
        }
      } catch (error) {
        console.warn('Native generator upload picker failed; falling back to browser input', error);
        fileInputRef.current?.click();
      } finally {
        setUploading(false);
      }
      return;
    }

    fileInputRef.current?.click();
  };

  const insertAssetReference = (asset) => {
    const token = makeMediaToken(asset);
    const cleaned = removeMediaMentionText(prompt, mention);
    setPrompt(cleaned.value);
    setReferenceAssets((prev) => mergeMediaReference(prev, { ...asset, token }));
    setMention(null);
    setSlash(false);
    requestAnimationFrame(() => {
      promptRef.current?.focus();
      promptRef.current?.setSelectionRange(cleaned.caret, cleaned.caret);
    });
  };

  const removeAssetReference = (asset) => {
    const nextRefs = removeMediaReference(referenceAssets, asset);
    const token = asset?.token || makeMediaToken(asset);
    setHoveredReferenceAsset(null);
    setReferenceAssets(nextRefs);
    setPrompt((value) => value
      .replace(new RegExp(`(^|\\s)${escapeRegExp(token)}(?=\\s|$)`, 'u'), '$1')
      .replace(/\s{2,}/g, ' '));
  };

  const chooseModel = (value) => {
    setProviderModelId(value?.id || '');
    setModel(modelLabel(value));
    setOpenPanel(null);
  };

  const pickStyleFromLibrary = (item) => {
    const name = item.name || item.n || '风格库';
    setStyle({
      id: item.id ? `stylelib:${item.id}` : `stylelib:${name}`,
      name,
      tag: item.tag || (item.a ? `@${item.a}` : '风格库'),
      source: 'style-library',
      group: item.group,
      mode: item.mode,
      prompt: item.prompt,
      description: item.description,
      texture: item.texture,
      thumbnail: item.preview,
    });
    setOpenPanel(null);
  };

  const openStyleLibrary = () => {
    onOpenModal?.('stylelib', null, { onPick: pickStyleFromLibrary });
  };

  const handleGenerate = () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || !selectedModel) return;
    const selectedStyle = supportsStyleReferences ? (style || STYLE_PRESETS[0] || null) : null;
    const selectedStylePayload = selectedStyle ? { ...selectedStyle, prompt: stylePromptFor(selectedStyle) } : null;
    onGenerate?.({
      tab,
      type: selectedModel?.capability || capability,
      capability: selectedModel?.capability || capability,
      placement: 'viewport-center',
      ignoreSelection: true,
      replaceTarget: false,
      prompt: cleanPrompt,
      model: displayModel,
      modelId: selectedModel?.id || providerModelId,
      providerModelId: selectedModel?.id || providerModelId,
      modelName: selectedModel?.modelName,
      provider: selectedModel?.providerId,
      ratio,
      aspectRatio: tab === 'image' || tab === 'video' ? ratio : undefined,
      mode: tab === 'text' ? ratio : undefined,
      audioStyle: tab === 'audio' ? ratio : undefined,
      count,
      style: supportsStyleReferences ? styleId(selectedStyle) : undefined,
      styleName: supportsStyleReferences ? styleName(selectedStyle) : undefined,
      stylePrompt: supportsStyleReferences ? stylePromptFor(selectedStyle) : undefined,
      stylePreset: supportsStyleReferences ? selectedStylePayload : undefined,
      referenceAssets: supportsStyleReferences ? referenceAssets : [],
    });
  };

  return (
    <div className="generator" data-onboarding-id="canvas-generator-panel">
      <input
        ref={fileInputRef}
        type="file"
        className="generator-file-input"
        multiple
        accept={ACCEPT_BY_TAB[tab]}
        onChange={(event) => handleUploadFiles(event.target.files)}
      />

      <header>
        {TAB_DEFS.map(([key, IconComp, label]) => (
          <button key={key} type="button" className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <IconComp size={13}/>
            <span>{label}</span>
          </button>
        ))}
        <div className="model-anchor">
          <button type="button" className="model" onClick={() => setOpenPanel(openPanel === 'model' ? null : 'model')}>
            <ISparkle size={12}/>
            <span>{displayModel}</span>
            <IChevD size={10}/>
          </button>
          {openPanel === 'model' && (
            <div className="model-menu">
              {models.length ? models.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`model-menu-item ${selectedModel?.id === item.id ? 'active' : ''}`}
                  onClick={() => chooseModel(item)}
                >
                  <span className="k">{modelLabel(item)}</span>
                  <span className="d">{selectedModel?.id === item.id ? <ICheck size={12}/> : item.providerId}</span>
                </button>
              )) : (
                <button type="button" className="model-menu-item" disabled>
                  <span className="k">暂无可用模型</span>
                  <span className="d">/providers</span>
                </button>
              )}
            </div>
          )}
        </div>
        <span className="credit">· {tab === 'video' ? '18' : tab === 'audio' ? '4' : '3'} credits</span>
      </header>

      <div className="prompt-wrap">
        <div className="prompt">
          {supportsStyleReferences && referenceAssets.length > 0 && (
            <div className="generator-inline-refs" aria-label="已引用素材">
              {referenceAssets.map((asset) => {
                const src = getMediaSrc(asset);
                const title = getMediaTitle(asset);
                return (
                  <span
                    className="generator-ref-card"
                    key={asset.id || src || asset.token}
                    aria-label={title ? `引用素材：${title}` : '引用素材'}
                    onMouseEnter={() => setHoveredReferenceAsset(asset)}
                    onMouseLeave={() => setHoveredReferenceAsset(null)}
                  >
                    <span className="generator-ref-thumb">
                      <MediaReferenceThumb asset={asset}/>
                    </span>
                    <button type="button" className="generator-ref-remove" onClick={() => removeAssetReference(asset)} title="移除引用">
                      <IClose size={9}/>
                    </button>
                    <span className="generator-ref-preview" aria-hidden="true">
                      <span className="generator-ref-preview-media"><MediaReferenceThumb asset={asset}/></span>
                    </span>
                  </span>
                );
              })}
            </div>
          )}
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === 'Escape') {
                setMention(null);
                setSlash(false);
              }
            }}
            onKeyUp={(event) => updateMention(event.currentTarget)}
            onClick={(event) => updateMention(event.currentTarget)}
            onWheel={(event) => event.stopPropagation()}
            placeholder={tab === 'audio' ? '描述音频内容，输入 / 调出快捷功能...' : '描述内容，输入 @ 引用素材，或输入 / 调出快捷功能...'}
          />
        </div>
        {supportsStyleReferences && hoveredReferenceAsset && (
          <span className="generator-ref-floating-preview" aria-hidden="true">
            <span className="generator-ref-preview-media"><MediaReferenceThumb asset={hoveredReferenceAsset}/></span>
          </span>
        )}

        {slash && (
          <div className="slash-menu">
            {SLASH_COMMANDS.map((item) => (
              <button
                key={item.k}
                type="button"
                className="slash-item"
                onClick={() => {
                  setPrompt(prompt.slice(0, -1));
                  setSlash(false);
                  onRunSlash?.(item.k);
                }}
              >
                <span className="k">{item.k}</span>
                <span className="d">{item.d}</span>
              </button>
            ))}
          </div>
        )}

        {supportsStyleReferences && mention && (
          <div
            className="at-menu"
            onMouseDown={(event) => event.preventDefault()}
            onWheel={(event) => event.stopPropagation()}
          >
            <div className="at-head">
              <span>@ 引用素材</span>
              <button type="button" onClick={openUploadPicker}><IAdd size={11}/>上传</button>
            </div>
            {filteredMentionAssets.length ? filteredMentionAssets.map((asset) => {
              const kind = getMediaKind(asset);
              const src = getMediaSrc(asset);
              const title = getMediaTitle(asset);
              return (
                <button key={asset.id || src} type="button" className="at-item" onClick={() => insertAssetReference(asset)}>
                  <span className="at-thumb">
                    <MediaReferenceThumb asset={asset}/>
                  </span>
                  <span className="at-main">
                    <strong>{title}</strong>
                    <em>{MEDIA_KIND_LABELS[kind] || kind} · {makeMediaToken(asset)}</em>
                  </span>
                  <span className="at-preview" aria-hidden="true">
                    <span className="at-preview-media"><MediaReferenceThumb asset={asset}/></span>
                    <strong>{title}</strong>
                  </span>
                </button>
              );
            }) : mentionAssetsLoading ? (
              <div className="at-empty">正在加载项目资产...</div>
            ) : (
              <div className="at-empty">当前项目素材暂无可引用素材，先上传参考图或从资产库加入素材</div>
            )}
          </div>
        )}
      </div>

      <div className="controls">
        {supportsStyleReferences && (
          <>
            <button type="button" className="chip" onClick={openStyleLibrary} title="打开风格库">
              <ISparkle size={11}/>{styleName(style) || '风格'}
            </button>
            <button type="button" className="chip" onClick={openUploadPicker}>
              {uploading ? <ISparkle size={11}/> : <IAdd size={11}/>}上传参考图
            </button>
          </>
        )}

        {tab === 'image' && <>
          <button type="button" className="chip" onClick={() => onOpenModal?.('camctrl-image')}><ICamera size={11}/>摄像机</button>
          <button type="button" className="chip" onClick={() => onOpenModal?.('gridsplit')}><IGrid9 size={11}/>焦点</button>
        </>}
        {tab === 'video' && <>
          <button type="button" className="chip" onClick={() => onOpenModal?.('camctrl-video')}><IFilm size={11}/>运镜</button>
          <button type="button" className="chip" onClick={() => onOpenModal?.('subjectlib')}><IFolder size={11}/>项目素材</button>
        </>}
        {tab === 'audio' && <>
          <button type="button" className="chip"><IMic size={11}/>音色</button>
          <button type="button" className="chip"><IFilm size={11}/>BPM</button>
        </>}
        {tab === 'text' && <>
          <button type="button" className="chip" onClick={() => onOpenModal?.('scriptcreate')}><IScript size={11}/>分镜脚本</button>
          <button type="button" className="chip"><ISparkle size={11}/>润色</button>
        </>}
        <button type="button" className="chip" onClick={() => onOpenModal?.('toolbox')}><IBox size={11}/>工具箱</button>

        <span className="control-sep"/>

        <div className="control-wrap">
          <button type="button" className={`chip ghost ${openPanel === 'ratio' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'ratio' ? null : 'ratio')}>
            {tab === 'image' || tab === 'video' ? <span className="ratio-glyph"/> : <ISparkle size={11}/>}
            {ratio}
            <IChevD size={10}/>
          </button>
          {openPanel === 'ratio' && (
            <div className="control-pop option-list">
              {OPTIONS_BY_TAB[tab].map((item) => (
                <button key={item} type="button" className={`option-btn ${ratio === item ? 'active' : ''}`} onClick={() => { setRatio(item); setOpenPanel(null); }}>
                  <span>{item}</span>
                  {ratio === item && <ICheck size={12}/>}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="control-sep"/>
        <button type="button" className="chip ghost" onClick={() => setCount((value) => (value % 4) + 1)}>×{count}</button>
        <button type="button" className="gen-btn" disabled={!canGenerate} onClick={handleGenerate}>
          <ISparkle size={13}/>生成
        </button>
      </div>
    </div>
  );
}

export { genStyles };
