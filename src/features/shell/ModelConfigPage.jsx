import React from 'react';
import { NewApiStore } from '../../shared/platform/newApiStore.js';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { displayCurrencyText, RMB_SYMBOL } from '../../shared/utils/currency.js';

const MODEL_GROUPS = [
  {
    key: 'image',
    title: '图片模型',
    caption: '图片生成、图片理解和参考图能力',
    capabilities: ['image.generate', 'image.analyze'],
  },
  {
    key: 'video',
    title: '视频模型',
    caption: '视频生成和后续多模态视频能力',
    capabilities: ['video.generate'],
  },
  {
    key: 'inference',
    title: '推理模型',
    caption: '文本推理、脚本理解和通用分析',
    capabilities: ['text.generate', 'text.reason', 'inference.generate'],
  },
];

const VIDEO_MODEL_FAMILY_GROUPS = [
  { key: 'google', title: '谷歌系' },
  { key: 'seedenceVolc', title: 'Seedence火山版' },
  { key: 'seedenceSpecial', title: 'Seedence特价版' },
  { key: 'seedence', title: 'Seedence其他' },
  { key: 'grok', title: 'Grok系列' },
  { key: 'sora', title: 'Sora系列' },
  { key: 'other', title: '其他' },
];

export const MODEL_PRICE_SYNC_INTERVAL_MS = 60_000;

const MODEL_PRICE_FALLBACKS = {
  'gpt-image-2': '图像输入 ￥8.00 / 1M tokens · 输出 ￥30.00 / 1M tokens',
  'gpt-5.5': '￥5.00 输入 / ￥30.00 输出 · 1M tokens',
  'gpt-5.5-image-analyze': '￥5.00 输入 / ￥30.00 输出 · 1M tokens',
};

const SECOND_BASED_VIDEO_MODEL_PATTERNS = [
  /\bseedance-2-0(?:-fast|-pro)?\b/i,
  /\bseedance-2[.]0(?:-fast|-pro)?\b/i,
  /\bsora-3-(?:fast|pro)\b/i,
  /\bsora-v3-(?:fast|pro)\b/i,
  /\bseedence2-(?:fast|pro)\b/i,
  /seedence2[.]0.*m-c/i,
];

const OFFICIAL_VOLC_SEEDANCE_PRICE_TIERS = {
  fast: [
    ['480p Pro 极速', 8.25],
    ['720p 标准极速', 9.2],
    ['720p Pro 极速', 15],
    ['1080p 标准极速', 16.25],
  ],
  pro: [
    ['480p Pro', 9.75],
    ['720p 标准Pro', 11],
    ['720p Pro', 17.8],
    ['1080p 标准Pro', 19],
    ['1080p Pro', 42],
  ],
};

function modelFamily(model) {
  const text = `${model?.providerId || ''} ${model?.modelName || ''} ${model?.displayName || ''}`.toLowerCase();
  if (text.includes('openai') || text.includes('gpt')) return 'openai';
  if (text.includes('kling') || text.includes('可灵')) return 'kling';
  if (text.includes('runway')) return 'runway';
  if (text.includes('wan') || text.includes('通义')) return 'wan';
  return 'generic';
}

function modelIdentityText(model) {
  const meta = model?.meta || {};
  const aliases = Array.isArray(meta.aliases) ? meta.aliases : [];
  return [
    model?.id,
    model?.providerId,
    model?.modelName,
    model?.displayName,
    model?.adapter,
    meta.family,
    meta.modelFamily,
    ...aliases,
  ].filter(Boolean).join(' ').toLowerCase();
}

function isVolcSeedanceFamily(identity) {
  return /\bseedance-2(?:[-.]0)(?:[-.](?:fast|pro))?\b/i.test(identity);
}

function isSpecialSeedenceFamily(identity) {
  return /(特价版|残血版|jimeng|low[-_\s]?price)/i.test(identity);
}

function officialVolcSeedanceKind(model) {
  const identity = [
    model?.id,
    model?.modelName,
    model?.displayName,
  ].filter(Boolean).join(' ').toLowerCase();
  if (/\bseedance-2-0-fast\b/i.test(identity)) return 'fast';
  if (/\bseedance-2-0-pro\b/i.test(identity)) return 'pro';
  return '';
}

function hasOfficialVolcSeedancePricing(model) {
  return Boolean(OFFICIAL_VOLC_SEEDANCE_PRICE_TIERS[officialVolcSeedanceKind(model)]);
}

function videoModelFamilyKey(model) {
  const identity = modelIdentityText(model);
  if (identity.includes('谷歌') || /\b(?:google|gemini|veo)/i.test(identity)) return 'google';
  if (/\b(?:seedence|seedance)/i.test(identity)) {
    if (isSpecialSeedenceFamily(identity)) return 'seedenceSpecial';
    if (isVolcSeedanceFamily(identity)) return 'seedenceVolc';
    return 'seedence';
  }
  if (/\b(?:grok|xai)/i.test(identity)) return 'grok';
  if (/\bsora/i.test(identity)) return 'sora';
  return 'other';
}

function priceNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (Number.isInteger(number)) return String(number);
  return number.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

function numericPricingValue(pricing, ...keys) {
  for (const key of keys) {
    const value = pricing?.[key];
    if (value === undefined || value === null || value === '') continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function secondBasedVideoPriceLabel(model, pricing) {
  if (!pricing || typeof pricing !== 'object') return '';
  const identity = [
    model?.id,
    model?.modelName,
    model?.displayName,
    pricing?.model_name,
    pricing?.modelName,
    pricing?.modelCode,
    pricing?.model_code,
  ].filter(Boolean).join(' ');
  if (!SECOND_BASED_VIDEO_MODEL_PATTERNS.some((pattern) => pattern.test(identity))) return '';
  const quotaType = numericPricingValue(pricing, 'quotaType', 'quota_type');
  const modelRatio = numericPricingValue(pricing, 'modelRatio', 'model_ratio', 'ratio');
  if (quotaType !== 0 || modelRatio === null) return '';
  const pricePerSecond = numericPricingValue(pricing, 'pricePerSecond', 'price_per_second') ?? (modelRatio / 2);
  const priceFor15Seconds = numericPricingValue(pricing, 'priceFor15Seconds', 'price_for_15_seconds') ?? (pricePerSecond * 15);
  return `每秒价格 ${RMB_SYMBOL}${priceNumber(pricePerSecond)} / 秒 · 15秒价格 ${RMB_SYMBOL}${priceNumber(priceFor15Seconds)}`;
}

function officialVolcSeedancePriceLabel(model) {
  const kind = officialVolcSeedanceKind(model);
  const tiers = OFFICIAL_VOLC_SEEDANCE_PRICE_TIERS[kind];
  if (!tiers) return '';
  const tierText = tiers.map(([label, price]) => `${label} ${RMB_SYMBOL}${priceNumber(price)} / 15秒`);
  return ['官方火山版按实际秒数折算', ...tierText].join(' · ');
}

export function modelPriceLabel(model) {
  const meta = model?.meta || {};
  const pricing = meta.pricing || {};
  const officialVolcLabel = officialVolcSeedancePriceLabel(model);
  if (officialVolcLabel) return displayCurrencyText(officialVolcLabel);
  const secondLabel = secondBasedVideoPriceLabel(model, pricing);
  if (secondLabel) return displayCurrencyText(secondLabel);
  if (typeof meta.priceLabel === 'string' && meta.priceLabel.trim()) return displayCurrencyText(meta.priceLabel.trim());
  if (typeof pricing === 'string' && pricing.trim()) return displayCurrencyText(pricing.trim());
  if (typeof pricing.label === 'string' && pricing.label.trim()) return displayCurrencyText(pricing.label.trim());
  if (pricing.input || pricing.output) {
    const input = pricing.input ? `输入 ${pricing.input}` : '';
    const output = pricing.output ? `输出 ${pricing.output}` : '';
    return displayCurrencyText([input, output].filter(Boolean).join(' · '));
  }
  const id = String(model?.id || '').trim().toLowerCase();
  const modelName = String(model?.modelName || '').trim().toLowerCase();
  return displayCurrencyText(MODEL_PRICE_FALLBACKS[id] || MODEL_PRICE_FALLBACKS[modelName] || '按后台价格表计费');
}

function priceLineItems(price) {
  const text = String(price || '').trim();
  if (!text) return [];
  if ((/^每秒价格\s/.test(text) && text.includes(' · 15秒价格')) || /^官方火山版/.test(text)) {
    return text.split(/\s*·\s*/).map((item) => item.trim()).filter(Boolean);
  }
  return [text];
}

function firstCleanText(...values) {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const text = value.trim();
    if (text) return text;
  }
  return '';
}

function isSpecialPriceTwoModel(identity) {
  return /特价版\s*(?:2|二)/.test(identity);
}

function isSpecialPriceModel(identity) {
  return /特价版\s*(?:1|一|2|二)/.test(identity);
}

function isSeedenceSpecialPriceTwoModel(model) {
  const identity = [
    model?.id,
    model?.modelName,
    model?.displayName,
  ].filter(Boolean).join(' ').toLowerCase();
  return (
    (identity.includes('seedence2-fast') || identity.includes('seedence2-pro'))
    && isSpecialPriceTwoModel(identity)
  );
}

export function modelWarningLabel(model) {
  if (isSeedenceSpecialPriceTwoModel(model)) return '下午4点到晚上9点成功率会下降';
  return '';
}

export function modelIntroductionLabel(model) {
  const meta = model?.meta || {};
  const custom = firstCleanText(
    meta.introduction,
    meta.modelIntroduction,
    meta.modelIntro,
    meta.description,
    model?.introduction,
    model?.description,
  );
  if (custom) return custom;

  const identity = [
    model?.id,
    model?.modelName,
    model?.displayName,
  ].filter(Boolean).join(' ').toLowerCase();
  const capability = String(model?.capability || '').toLowerCase();

  if (identity.includes('grok')) return '适合高质量视频生成与品牌级素材包装';
  if (identity.includes('sora-vip3-pro-720p') || identity.includes('seedence2.0-720（满血）')) {
    return '满血，直接过真人';
  }
  if (identity.includes('sora')) return '适合高质量视频生成与创意叙事表达；稳定可用，支持并发';
  if (identity.includes('veo')) return '轻量高效，适合快速验证与灵感预览';
  if (officialVolcSeedanceKind(model)) {
    return '官方火山版，支持 480p、720p、1080p；按实际生成秒数折算，不同清晰度和档位价格不同';
  }
  if (isSeedenceSpecialPriceTwoModel(model)) {
    return '最多四张参考，不支持参考音频；提示词不能超过1500字';
  }
  if ((identity.includes('seedence2-fast') || identity.includes('seedence2-pro')) && isSpecialPriceModel(identity)) {
    return '最多四张参考，不支持参考音频；提示词不能超过1500字';
  }
  if (identity.includes('seedence2-fast') || identity.includes('seedence2-pro')) {
    return '最多四张参考，不支持参考音频';
  }
  if (
    identity.includes('muse_sd2_fast_real_full')
    || identity.includes('muse_sd2_real_full')
    || identity.includes('seedence2.0fast（满血可人脸）')
    || identity.includes('seedence2.0pro（满血可人脸）')
  ) {
    return '小概率动漫风变真人风';
  }
  if (identity.includes('seedence2.0') && identity.includes('m-c')) {
    return '国内火山渠道备用渠道，可过真人人脸';
  }
  if (identity.includes('seedance') && (identity.includes('极速') || identity.includes('seedance-2.0-fast') || identity.includes('seedance-2.0-pro-fast'))) {
    return '不卡速度十分钟一条，人脸几率过需要处理';
  }
  if (/\bseedance-2-0-pro\b/i.test(identity)) return '（国内满血火山版）（可用真人人脸库）';
  if (identity.includes('seedance') && identity.includes('pro')) {
    return '平衡画质与成本，适合专业级视频创作';
  }
  if (identity.includes('seedance') && identity.includes('fast')) {
    return '适合极速出片、短视频预览与创意迭代';
  }
  if (capability.includes('video')) return '适合高质量视频生成与创意内容包装';
  if (capability.includes('image')) return '适合图像生成、视觉包装与素材扩展';
  if (capability.includes('text') || capability.includes('inference')) return '适合文本推理、脚本分析与任务规划';
  return '适合创意生产场景中的稳定模型调用';
}

export function groupModelsForCatalog(models = []) {
  const grouped = Object.fromEntries(MODEL_GROUPS.map((group) => [group.key, []]));
  (models || []).forEach((model) => {
    const capability = model?.capability;
    const group = MODEL_GROUPS.find((item) => item.capabilities.includes(capability));
    if (!group) return;
    grouped[group.key].push(model);
  });
  MODEL_GROUPS.forEach((group) => {
    grouped[group.key].sort((a, b) => {
      const enabledRank = Number(b.enabled !== false) - Number(a.enabled !== false);
      if (enabledRank) return enabledRank;
      return String(a.displayName || a.modelName || a.id).localeCompare(String(b.displayName || b.modelName || b.id), 'zh-CN');
    });
  });
  return grouped;
}

export function groupVideoModelsForCatalog(models = []) {
  const grouped = VIDEO_MODEL_FAMILY_GROUPS.map((group) => ({ ...group, items: [] }));
  const byKey = new Map(grouped.map((group) => [group.key, group]));
  (models || []).forEach((model) => {
    const key = videoModelFamilyKey(model);
    (byKey.get(key) || byKey.get('other')).items.push(model);
  });
  return grouped;
}

function OpenAIIcon() {
  return (
    <svg viewBox="0 0 158.7128 157.296" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M60.8734 57.2556V42.3124c0-1.2586.4722-2.2029 1.5728-2.8314l30.0443-17.3023c4.0899-2.3593 8.9662-3.4599 13.9988-3.4599 18.8759 0 30.8307 14.6289 30.8307 30.2006 0 1.1007 0 2.3593-.158 3.6178l-31.1446-18.2467c-1.8872-1.1006-3.7754-1.1006-5.6629 0L60.8734 57.2556ZM131.0276 115.4561V79.7487c0-2.2028-.9446-3.7756-2.8318-4.8763l-39.481-22.9651 12.8982-7.3934c1.1007-.6285 2.0453-.6285 3.1458 0l30.0441 17.3024c8.6523 5.0341 14.4708 15.7296 14.4708 26.1107 0 11.9539-7.0769 22.965-18.2461 27.527v.0021ZM51.593 83.9964l-12.8982-7.5497c-1.1007-.6285-1.5728-1.5728-1.5728-2.8314V39.0105c0-16.8303 12.8982-29.5722 30.3585-29.5722 6.607 0 12.7403 2.2029 17.9324 6.1349L54.4259 33.5056c-1.8871 1.1007-2.8314 2.6735-2.8314 4.8764v45.6159l-.0014-.0015ZM79.3562 100.0403 60.8733 89.6592V67.6383l18.4829-10.3811 18.4812 10.3811v22.0209l-18.4812 10.3811ZM91.2319 147.8591c-6.607 0-12.7403-2.2031-17.9324-6.1344l30.9866-17.9333c1.8872-1.1005 2.8318-2.6728 2.8318-4.8759v-45.616l13.0564 7.5498c1.1005.6285 1.5723 1.5728 1.5723 2.8314v34.6051c0 16.8297-13.0564 29.5723-30.5147 29.5723v.001ZM53.9522 112.7822 23.9079 95.4798c-8.652-5.0343-14.471-15.7296-14.471-26.1107 0-12.1119 7.2356-22.9652 18.403-27.5272v35.8634c0 2.2028.9443 3.7756 2.8314 4.8763l39.3248 22.8068-12.8982 7.3938c-1.1007.6287-2.045.6287-3.1456 0ZM52.2229 138.5791c-17.7745 0-30.8306-13.3713-30.8306-29.8871 0-1.2585.1578-2.5169.3143-3.7754l30.987 17.9323c1.8871 1.1005 3.7757 1.1005 5.6628 0l39.4811-22.807v14.9435c0 1.2585-.4721 2.2021-1.5728 2.8308l-30.0443 17.3025c-4.0898 2.359-8.9662 3.4605-13.9989 3.4605h.0014ZM91.2319 157.296c19.0327 0 34.9188-13.5272 38.5383-31.4594 17.6164-4.562 28.9425-21.0779 28.9425-37.908 0-11.0112-4.719-21.7066-13.2133-29.4143.7867-3.3035 1.2595-6.607 1.2595-9.909 0-22.4929-18.2471-39.3247-39.3251-39.3247-4.2461 0-8.3363.6285-12.4262 2.045C87.9284 4.4043 78.1758.0002 67.4805.0002c-19.0331 0-34.9191 13.5268-38.5384 31.4591C11.3255 36.0212 0 52.5373 0 69.3675c0 11.0112 4.7184 21.7065 13.2125 29.4142-.7865 3.3035-1.2586 6.6067-1.2586 9.9092 0 22.4923 18.2466 39.3241 39.3248 39.3241 4.2462 0 8.3362-.6277 12.426-2.0441 7.0776 6.921 16.8302 11.3251 27.5271 11.3251Z" />
    </svg>
  );
}

function GenericModelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 4.4 18.6 8v8L12 19.6 5.4 16V8L12 4.4Z" />
      <path d="M12 12 18.2 8.3M12 12 5.8 8.3M12 12v7" />
      <path d="M8.7 6.35 15.3 10M15.3 14 8.7 17.65" />
    </svg>
  );
}

function ModelBrandIcon({ model }) {
  const family = modelFamily(model);
  return (
    <span className={`model-brand-icon model-brand-${family}`}>
      {family === 'openai' ? <OpenAIIcon /> : <GenericModelIcon />}
    </span>
  );
}

function modelCardDisplayName(model) {
  return model?.displayName || model?.modelName || model?.id || '未命名模型';
}

function modelCatalogKey(model) {
  return model?.id || model?.modelName || model?.displayName || '';
}

function SeedanceVolcPriceTable({ models = [] }) {
  const orderedModels = [...models]
    .filter(hasOfficialVolcSeedancePricing)
    .sort((a, b) => {
      const order = { fast: 0, pro: 1 };
      return (order[officialVolcSeedanceKind(a)] ?? 99) - (order[officialVolcSeedanceKind(b)] ?? 99);
    });

  if (!orderedModels.length) return null;

  return (
    <section className="seedance-volc-price-table" aria-label="Seedance 火山版价格表">
      <div className="seedance-volc-price-head">
        <div>
          <span>按实际生成秒数折算</span>
          <h3>Seedance 火山版价格表</h3>
        </div>
        <strong>{orderedModels.length} models</strong>
      </div>
      <div className="seedance-volc-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">模型</th>
              <th scope="col">形式</th>
              <th scope="col">15秒价格</th>
              <th scope="col">每秒价格</th>
            </tr>
          </thead>
          <tbody>
            {orderedModels.map((model) => {
              const kind = officialVolcSeedanceKind(model);
              const tiers = OFFICIAL_VOLC_SEEDANCE_PRICE_TIERS[kind] || [];
              return tiers.map(([form, price], index) => (
                <tr key={`${modelCatalogKey(model)}-${form}`}>
                  {index === 0 ? (
                    <td className="seedance-volc-model-cell" rowSpan={tiers.length}>
                      <strong>{modelCardDisplayName(model)}</strong>
                      <span>{kind === 'fast' ? 'Fast 极速' : 'Pro 专业'}</span>
                    </td>
                  ) : null}
                  <td>{form}</td>
                  <td className="seedance-volc-price-cell">{RMB_SYMBOL}{priceNumber(price)} / 15秒</td>
                  <td className="seedance-volc-price-cell seedance-volc-second-cell">{RMB_SYMBOL}{priceNumber(price / 15)} / 秒</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ModelCard({ model, onToggleEnabled = null, toggling = false }) {
  const priceLines = priceLineItems(modelPriceLabel(model));
  const introduction = modelIntroductionLabel(model);
  const warning = modelWarningLabel(model);
  const enabled = model.enabled !== false;
  const displayName = modelCardDisplayName(model);

  return (
    <article className={`model-catalog-card ${enabled ? 'is-enabled' : 'is-disabled'}`}>
      <div className="model-catalog-card-head">
        <ModelBrandIcon model={model} />
        <div className="model-title-copy">
          <strong>{displayName}</strong>
        </div>
        <div className="model-card-actions">
          <span className={`status-pill ${enabled ? 'ready' : ''}`}>
            {enabled ? '已启用' : '已停用'}
          </span>
          {typeof onToggleEnabled === 'function' ? (
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              className={`model-enable-switch ${enabled ? 'is-on' : 'is-off'}`}
              onClick={() => onToggleEnabled(model)}
              disabled={toggling}
              aria-label={`${displayName} 模型启用开关`}
            >
              <span className="switch-track" aria-hidden="true">
                <span className="switch-knob" />
              </span>
              <span className="switch-label">{toggling ? '保存中' : (enabled ? '开' : '关')}</span>
            </button>
          ) : null}
        </div>
      </div>
      {priceLines.length ? (
        <div className="model-price-row">
          <span>价格</span>
          <strong className={priceLines.length > 1 ? 'price-lines' : ''}>
            {priceLines.map((item) => <span className="price-line" key={item}>{item}</span>)}
          </strong>
        </div>
      ) : null}
      {warning ? (
        <div className="model-intro-warning" role="note">
          <strong>高峰期提醒</strong>
          <span>{warning}</span>
        </div>
      ) : null}
      <div className="model-intro-panel">
        <span>模型介绍</span>
        <p>{introduction}</p>
      </div>
    </article>
  );
}

function EmptyGroup({ title }) {
  return (
    <div className="model-empty-card">
      <strong>{title}暂无模型</strong>
      <span>后端 provider_models 中接入对应 capability 后会自动显示在这里。</span>
    </div>
  );
}

export function ModelCatalogContent({
  providers = [],
  models = [],
  loading = false,
  message = '',
  initialTab = 'image',
  onSyncModels = null,
  onRefresh = null,
  onToggleModelEnabled = null,
  togglingModelIds = new Set(),
  syncing = false,
}) {
  const grouped = React.useMemo(() => groupModelsForCatalog(models), [models]);
  const defaultTab = MODEL_GROUPS.some((group) => group.key === initialTab) ? initialTab : 'image';
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const activeGroup = MODEL_GROUPS.find((group) => group.key === activeTab) || MODEL_GROUPS[0];
  const activeItems = grouped[activeGroup.key] || [];
  const [activeVideoFamily, setActiveVideoFamily] = React.useState('all');
  const videoFamilyGroups = React.useMemo(() => groupVideoModelsForCatalog(activeItems), [activeItems]);
  const videoFamilyTabs = React.useMemo(() => [
    { key: 'all', title: '全部', items: activeItems },
    ...videoFamilyGroups,
  ], [activeItems, videoFamilyGroups]);
  const selectedVideoFamily = videoFamilyTabs.find((group) => group.key === activeVideoFamily) || videoFamilyTabs[0];
  const visibleActiveItems = activeGroup.key === 'video' && selectedVideoFamily.key !== 'all'
    ? selectedVideoFamily.items
    : activeItems;
  const officialVolcItems = activeGroup.key === 'video'
    ? visibleActiveItems.filter(hasOfficialVolcSeedancePricing)
    : [];
  const cardActiveItems = activeGroup.key === 'video'
    ? visibleActiveItems.filter((model) => !hasOfficialVolcSeedancePricing(model))
    : visibleActiveItems;
  const activeCountLabel = activeGroup.key === 'video' && selectedVideoFamily.key !== 'all'
    ? `${visibleActiveItems.length}/${activeItems.length} models`
    : `${activeItems.length} models`;
  const emptyGroupTitle = activeGroup.key === 'video' && selectedVideoFamily.key !== 'all'
    ? selectedVideoFamily.title
    : activeGroup.title;
  const syncHandler = typeof onSyncModels === 'function'
    ? onSyncModels
    : (typeof onRefresh === 'function' ? onRefresh : null);

  return (
    <section className="home-page model-config-page model-catalog-page" data-onboarding-id="model-config">
      {message ? <div className="model-message error">{message}</div> : null}

      <div className="model-catalog-tabs" role="tablist" aria-label="模型类型">
        {MODEL_GROUPS.map((group) => {
          const active = activeGroup.key === group.key;
          const count = grouped[group.key]?.length || 0;
          return (
            <button
              key={group.key}
              type="button"
              role="tab"
              id={`model-tab-${group.key}`}
              aria-selected={active}
              aria-controls={`model-panel-${group.key}`}
              tabIndex={active ? 0 : -1}
              className={active ? 'active' : ''}
              onClick={() => setActiveTab(group.key)}
            >
              <strong>{group.title}</strong>
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      <section
        className={`model-result-frame model-list-section model-list-${activeGroup.key}`}
        role="tabpanel"
        id={`model-panel-${activeGroup.key}`}
        aria-labelledby={`model-tab-${activeGroup.key}`}
      >
        <div className="model-list-section-head">
          <div>
            <span>{activeGroup.caption}</span>
            <h2>{activeGroup.title}</h2>
          </div>
          <div className="model-list-section-actions">
            <strong>{activeCountLabel}</strong>
            {syncHandler ? (
              <button
                type="button"
                className="home-btn model-sync-btn"
                onClick={syncHandler}
                disabled={loading || syncing}
              >
                {syncing ? '同步中...' : '同步模型'}
              </button>
            ) : null}
          </div>
        </div>
        {activeGroup.key === 'video' ? (
          <div className="video-model-family-tabs" role="tablist" aria-label="视频模型分类">
            {videoFamilyTabs.map((group) => {
              const active = selectedVideoFamily.key === group.key;
              return (
                <button
                  key={group.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={active ? 'active' : ''}
                  onClick={() => setActiveVideoFamily(group.key)}
                >
                  <strong>{group.title}</strong>
                  <span>{group.items.length}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="model-list-scroll">
          {loading ? (
            <div className="model-empty-card">正在读取后端模型</div>
          ) : visibleActiveItems.length ? (
            <>
              <SeedanceVolcPriceTable models={officialVolcItems} />
              {cardActiveItems.length ? (
                <div className="model-catalog-grid">
                  {cardActiveItems.map((model) => (
                    <ModelCard
                      key={modelCatalogKey(model)}
                      model={model}
                      providers={providers}
                      onToggleEnabled={onToggleModelEnabled}
                      toggling={togglingModelIds.has(modelCatalogKey(model))}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyGroup title={emptyGroupTitle} />
          )}
        </div>
      </section>
    </section>
  );
}

export function ModelConfigPage() {
  const [providers, setProviders] = React.useState([]);
  const [models, setModels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [togglingModelIds, setTogglingModelIds] = React.useState(() => new Set());
  const [message, setMessage] = React.useState('');

  const loadProviders = React.useCallback(async ({ showLoading = true, clearMessage = true } = {}) => {
    if (showLoading) setLoading(true);
    try {
      const result = await ProviderStore.list();
      setProviders(result?.providers || []);
      setModels(result?.models || []);
      if (clearMessage) setMessage('');
    } catch (error) {
      if (showLoading) {
        setProviders([]);
        setModels([]);
        setMessage(error instanceof Error ? error.message : String(error));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  React.useEffect(() => {
    let active = true;
    const refreshRemotePricing = async () => {
      try {
        await NewApiStore.models();
        ProviderStore.clearModelCache();
        if (active) await loadProviders({ showLoading: false, clearMessage: false });
      } catch {
        // Keep showing the last local provider list when a silent price refresh fails.
      }
    };
    refreshRemotePricing();
    const timer = window.setInterval(refreshRemotePricing, MODEL_PRICE_SYNC_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [loadProviders]);

  const syncModels = React.useCallback(async () => {
    setSyncing(true);
    setMessage('');
    try {
      await NewApiStore.models();
      ProviderStore.clearModelCache();
      await loadProviders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSyncing(false);
    }
  }, [loadProviders]);

  const toggleModelEnabled = React.useCallback(async (model) => {
    const modelId = modelCatalogKey(model);
    if (!modelId) {
      setMessage('缺少模型 ID，无法修改启用状态');
      return;
    }
    const nextEnabled = model.enabled === false;
    const previousEnabled = model.enabled !== false;
    setMessage('');
    setTogglingModelIds((current) => {
      const next = new Set(current);
      next.add(modelId);
      return next;
    });
    setModels((current) => current.map((item) => (
      modelCatalogKey(item) === modelId ? { ...item, enabled: nextEnabled } : item
    )));
    try {
      await ProviderStore.updateModel(modelId, { enabled: nextEnabled });
      await loadProviders({ showLoading: false, clearMessage: false });
    } catch (error) {
      setModels((current) => current.map((item) => (
        modelCatalogKey(item) === modelId ? { ...item, enabled: previousEnabled } : item
      )));
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setTogglingModelIds((current) => {
        const next = new Set(current);
        next.delete(modelId);
        return next;
      });
    }
  }, [loadProviders]);

  return (
    <ModelCatalogContent
      providers={providers}
      models={models}
      loading={loading}
      message={message}
      onSyncModels={syncModels}
      onToggleModelEnabled={toggleModelEnabled}
      togglingModelIds={togglingModelIds}
      syncing={syncing}
    />
  );
}
