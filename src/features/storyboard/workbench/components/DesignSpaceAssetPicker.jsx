import React from 'react';
import { cardsForDesignTab } from '../../../design-space/designSpacePackage.js';

const TABS = [
  { key: 'characters', label: '人物' },
  { key: 'scenes', label: '场景' },
  { key: 'props', label: '道具' },
];

function currentVersion(card) {
  const history = Array.isArray(card?.history) ? card.history : [];
  return history.find((item) => item.id === card.currentVersionId) || history[0] || null;
}

function cardPrompt(card) {
  return card?.visualPrompt
    || card?.outfitPrompt
    || card?.atmospherePrompt
    || card?.materialPrompt
    || card?.details
    || '';
}

export function DesignSpaceAssetPicker({ designPackage, onPick }) {
  const [activeTab, setActiveTab] = React.useState('characters');
  const [query, setQuery] = React.useState('');
  const cards = cardsForDesignTab(designPackage, activeTab);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCards = cards.filter((card) => {
    if (!normalizedQuery) return true;
    return [card?.name, cardPrompt(card)].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
  });

  return (
    <section className="sb-design-picker">
      <div className="sb-design-picker-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索资产设计卡片"
        aria-label="搜索资产设计卡片"
      />
      <div className="sb-design-picker-list">
        {filteredCards.length === 0 ? (
          <div className="sb-empty-block">没有可选择的设计卡片。</div>
        ) : filteredCards.map((card) => {
          const version = currentVersion(card);
          const hasGeneratedVersion = !!version?.assetUrl;
          return (
            <button
              key={card.id}
              type="button"
              className="sb-design-picker-item"
              onClick={() => onPick?.({ card, version })}
              disabled={!hasGeneratedVersion}
              title={hasGeneratedVersion ? '' : '此卡片还没有可用生成图'}
            >
              <span className="thumb">
                {version?.assetUrl ? <img src={version.assetUrl} alt="" /> : <em>{card.type || 'asset'}</em>}
              </span>
              <strong>{card.name || '未命名资产'}</strong>
              <small>{cardPrompt(card) || '暂无提示词'}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
