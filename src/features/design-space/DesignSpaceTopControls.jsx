import React from 'react';
import {
  designModelOptionId,
  designModelOptionLabel,
  normalizeDesignParseModels,
} from './designSpaceModels.js';
import { ASSET_RATIOS, ASSET_RESOLUTIONS } from '../nodes/assetGenPresets.js';
import {
  ratioOptionsForModel,
  resolutionOptionsForModel,
} from '../../shared/platform/generationModelParams.js';
import { getStyleGroups, styleLibraryActions } from '../../shared/store/styleLibraryStore.js';

export const DESIGN_SPACE_STYLE_PRESETS = getDesignSpaceStylePresets();
export const DEFAULT_DESIGN_IMAGE_PARAMS = {
  ratio: ASSET_RATIOS[0] || '1:1',
  resolution: ASSET_RESOLUTIONS.includes('2K') ? '2K' : (ASSET_RESOLUTIONS[0] || '2K'),
};

export function getDesignSpaceStylePresets(styleGroups = getStyleGroups()) {
  return styleGroups.find((group) => group.id === 'comic-drama')?.items || [];
}

export function defaultDesignSpaceStyleId(stylePresets = DESIGN_SPACE_STYLE_PRESETS) {
  return stylePresets[0]?.id || '';
}

function emptyCustomStyleDraft() {
  return {
    name: '',
    prompt: '',
  };
}

export function composeDesignSpaceProjectStyle(styleId = '', styleExtra = '', stylePresets = DESIGN_SPACE_STYLE_PRESETS, enabled = true) {
  if (!enabled) return '';
  const selectedStyle = stylePresets.find((style) => style.id === styleId)
    || stylePresets[0]
    || null;
  const extra = String(styleExtra || '').trim();
  return [
    selectedStyle ? `项目风格：${selectedStyle.n}` : '',
    selectedStyle?.prompt || '',
    extra ? `风格补充：${extra}` : '',
  ].filter(Boolean).join('\n');
}

export function normalizeDesignImageParams(params = {}) {
  const ratio = ASSET_RATIOS.includes(params?.ratio) ? params.ratio : DEFAULT_DESIGN_IMAGE_PARAMS.ratio;
  const resolution = ASSET_RESOLUTIONS.includes(params?.resolution) ? params.resolution : DEFAULT_DESIGN_IMAGE_PARAMS.resolution;
  return { ratio, resolution };
}

function imageSpecValue(params = DEFAULT_DESIGN_IMAGE_PARAMS) {
  const normalized = normalizeDesignImageParams(params);
  return `${normalized.ratio}|${normalized.resolution}`;
}

function includeCurrentOption(options, selectedValue) {
  if (!selectedValue || options.includes(selectedValue)) return options;
  return [selectedValue, ...options];
}

function imageRatioOptions(model, selectedImageParams) {
  const selected = normalizeDesignImageParams(selectedImageParams);
  const ratios = ratioOptionsForModel(model, ASSET_RATIOS)
    .filter((ratio) => ASSET_RATIOS.includes(ratio));
  return includeCurrentOption(ratios, selected.ratio);
}

function imageResolutionOptions(model, selectedImageParams) {
  const selected = normalizeDesignImageParams(selectedImageParams);
  const resolutions = resolutionOptionsForModel(model, false, ASSET_RESOLUTIONS)
    .filter((resolution) => ASSET_RESOLUTIONS.includes(resolution));
  return includeCurrentOption(resolutions, selected.resolution);
}

function modelOptions(models = []) {
  return models
    .map((model) => ({ id: designModelOptionId(model), label: designModelOptionLabel(model) }))
    .filter((model) => model.id);
}

export function DesignSpaceTopControls({
  models = [],
  imageModels = [],
  sourceText = '',
  projectStyle = '',
  stylePresetId = '',
  styleExtra = '',
  styleEnabled = true,
  parserModelId = '',
  imageModelId = '',
  imageParams = DEFAULT_DESIGN_IMAGE_PARAMS,
  stylePresets = DESIGN_SPACE_STYLE_PRESETS,
  parsing = false,
  onParserModelChange,
  onImageModelChange,
  onImageParamsChange,
  onStylePresetChange,
  onStyleExtraChange,
  onStyleEnabledChange,
  onParse,
}) {
  const [imageParamOpen, setImageParamOpen] = React.useState(false);
  const [customStyleOpen, setCustomStyleOpen] = React.useState(false);
  const [customStyleDraft, setCustomStyleDraft] = React.useState(emptyCustomStyleDraft);
  const imageParamRef = React.useRef(null);
  const parserOptions = React.useMemo(() => modelOptions(normalizeDesignParseModels(models)), [models]);
  const imageOptions = React.useMemo(() => modelOptions(imageModels), [imageModels]);
  const selectedParserModelId = parserOptions.some((model) => model.id === parserModelId)
    ? parserModelId
    : (parserOptions[0]?.id || '');
  const selectedImageModelId = imageOptions.some((model) => model.id === imageModelId)
    ? imageModelId
    : (imageOptions[0]?.id || '');
  const selectedImageModel = imageModels.find((model) => designModelOptionId(model) === selectedImageModelId) || null;
  const selectedStylePresetId = stylePresets.some((style) => style.id === stylePresetId)
    ? stylePresetId
    : defaultDesignSpaceStyleId(stylePresets);
  const selectedImageParams = normalizeDesignImageParams(imageParams);
  const selectedImageSpecValue = imageSpecValue(selectedImageParams);
  const imageRatioOptionItems = imageRatioOptions(selectedImageModel, selectedImageParams);
  const imageResolutionOptionItems = imageResolutionOptions(selectedImageModel, selectedImageParams);
  const customStyleName = String(customStyleDraft.name || '').trim();
  const customStylePrompt = String(customStyleDraft.prompt || '').trim();

  const saveCustomStyle = React.useCallback((event) => {
    event.preventDefault();
    if (!customStyleName) return;
    const added = styleLibraryActions.addCustomStyle({
      groupId: 'comic-drama',
      name: customStyleName,
      prompt: customStylePrompt,
    });
    onStyleEnabledChange?.(true);
    onStylePresetChange?.(added.id);
    setCustomStyleDraft(emptyCustomStyleDraft());
    setCustomStyleOpen(false);
  }, [customStyleName, customStylePrompt, onStyleEnabledChange, onStylePresetChange]);

  const updateCustomStyleDraft = React.useCallback((key, value) => {
    setCustomStyleDraft((current) => ({ ...current, [key]: value }));
  }, []);

  React.useEffect(() => {
    if (!imageParamOpen) return undefined;
    const closeFromOutside = (event) => {
      if (!imageParamRef.current?.contains(event.target)) setImageParamOpen(false);
    };
    const closeFromEscape = (event) => {
      if (event.key === 'Escape') setImageParamOpen(false);
    };
    document.addEventListener('mousedown', closeFromOutside);
    document.addEventListener('keydown', closeFromEscape);
    return () => {
      document.removeEventListener('mousedown', closeFromOutside);
      document.removeEventListener('keydown', closeFromEscape);
    };
  }, [imageParamOpen]);

  return (
    <div className="design-space-top-controls">
      <label>
        <span>解析模型</span>
        <select value={selectedParserModelId} onChange={(event) => onParserModelChange?.(event.target.value)}>
          {parserOptions.length === 0 && <option value="">默认模型</option>}
          {parserOptions.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>图片模型</span>
        <select value={selectedImageModelId} onChange={(event) => onImageModelChange?.(event.target.value)}>
          {imageOptions.length === 0 && <option value="">默认图像模型</option>}
          {imageOptions.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
      </label>
      <div className="design-space-control-field design-space-image-param-control" ref={imageParamRef}>
        <span>图片规格</span>
        <button
          type="button"
          className={`design-space-image-param-trigger${imageParamOpen ? ' active' : ''}`}
          aria-label="图片参数与质量"
          aria-expanded={imageParamOpen ? 'true' : 'false'}
          onClick={() => setImageParamOpen((value) => !value)}
        >
          <strong>{selectedImageSpecValue.replace('|', ' · ')}</strong>
          <span aria-hidden="true">⌄</span>
        </button>
        {imageParamOpen && (
          <div className="design-space-image-param-popover">
            <section>
              <h3>比例</h3>
              <div className="design-space-param-option-grid">
                {imageRatioOptionItems.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    data-param-kind="ratio"
                    aria-label={`图片比例 ${ratio}`}
                    className={selectedImageParams.ratio === ratio ? 'active' : ''}
                    onClick={() => onImageParamsChange?.(normalizeDesignImageParams({
                      ...selectedImageParams,
                      ratio,
                    }))}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3>清晰度</h3>
              <div className="design-space-param-option-row">
                {imageResolutionOptionItems.map((resolution) => (
                  <button
                    key={resolution}
                    type="button"
                    data-param-kind="resolution"
                    aria-label={`图片清晰度 ${resolution}`}
                    className={selectedImageParams.resolution === resolution ? 'active' : ''}
                    onClick={() => onImageParamsChange?.(normalizeDesignImageParams({
                      ...selectedImageParams,
                      resolution,
                    }))}
                  >
                    {resolution}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
      <div className={`design-space-control-field design-space-style-control${styleEnabled ? '' : ' is-disabled'}`}>
        <div className="design-space-style-label-row">
          <span>项目风格</span>
          <label className="design-space-style-enable">
            <input
              aria-label="启用项目风格"
              type="checkbox"
              checked={styleEnabled}
              onChange={(event) => onStyleEnabledChange?.(event.target.checked)}
            />
            <span>{styleEnabled ? '启用' : '停用'}</span>
          </label>
          <button
            type="button"
            className="design-space-style-add"
            onClick={() => setCustomStyleOpen(true)}
          >
            添加风格
          </button>
        </div>
        <select
          aria-label="项目风格"
          value={selectedStylePresetId}
          disabled={!styleEnabled}
          onChange={(event) => onStylePresetChange?.(event.target.value)}
        >
          {stylePresets.map((style) => (
            <option key={style.id} value={style.id}>
              {style.n}
            </option>
          ))}
        </select>
        <input
          aria-label="风格补充"
          value={styleExtra}
          disabled={!styleEnabled}
          placeholder={styleEnabled ? '补充风格要求' : '风格已停用'}
          onChange={(event) => onStyleExtraChange?.(event.target.value)}
        />
      </div>
      <button
        type="button"
        className="design-space-primary"
        disabled={parsing || !sourceText.trim() || !selectedParserModelId}
        onClick={() => onParse?.({ modelId: selectedParserModelId, projectStyle })}
      >
        {parsing ? '解析中...' : '解析原文'}
      </button>
      {customStyleOpen && (
        <div className="design-style-dialog-backdrop" role="dialog" aria-modal="true" aria-label="新增项目风格">
          <form className="design-style-dialog" onSubmit={saveCustomStyle}>
            <div className="design-style-dialog-head">
              <div>
                <span>Custom Style</span>
                <h2>新增项目风格</h2>
              </div>
              <button
                type="button"
                aria-label="关闭新增项目风格"
                onClick={() => setCustomStyleOpen(false)}
              >
                x
              </button>
            </div>
            <label className="design-space-field">
              <span>风格名称</span>
              <input
                aria-label="自定义风格名称"
                value={customStyleDraft.name}
                onChange={(event) => updateCustomStyleDraft('name', event.target.value)}
                placeholder="例如：古风悬疑漫剧"
              />
            </label>
            <label className="design-space-field">
              <span>完整提示词</span>
              <textarea
                aria-label="自定义风格提示词"
                value={customStyleDraft.prompt}
                onChange={(event) => updateCustomStyleDraft('prompt', event.target.value)}
                placeholder="写入画面方向、光影、色彩、材质、构图和禁忌要求"
              />
            </label>
            <div className="design-style-dialog-actions">
              <button type="button" onClick={() => setCustomStyleOpen(false)}>取消</button>
              <button type="submit" className="design-space-primary" disabled={!customStyleName}>
                保存风格
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
