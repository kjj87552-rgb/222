import React from 'react';

function templatePromptText(template) {
  return String(template?.content || template?.name || '').trim();
}

const PROMPT_TARGET_META = {
  characters: { cardType: 'character', label: '人物', title: '一键人物提示词' },
  scenes: { cardType: 'scene', label: '场景', title: '一键场景提示词' },
  props: { cardType: 'prop', label: '道具', title: '一键道具提示词' },
};

export function DesignSpaceInputPanel({
  packageData,
  sourceText = '',
  onSourceTextChange,
  selectedCardsCount = 0,
  totalCardsCount = 0,
  actionCardsCount = 0,
  allActiveCardsSelected = false,
  selectedImageModelId = '',
  imageParams = null,
  promptTemplates = [],
  selectedPromptCard = null,
  selectedPromptCards = [],
  onSelectAllCards,
  onBatchGenerate,
  onGenerateTemplate,
}) {
  const usablePromptTemplates = React.useMemo(
    () => promptTemplates.filter((template) => template?.id && templatePromptText(template)),
    [promptTemplates],
  );
  const activeTab = packageData?.activeTab || 'characters';
  const promptTargetMeta = PROMPT_TARGET_META[activeTab] || PROMPT_TARGET_META.characters;
  const showPromptTemplates = usablePromptTemplates.length > 0;
  const promptTargets = React.useMemo(() => {
    const selectedTargets = selectedPromptCards
      .filter((card) => card?.type === promptTargetMeta.cardType && card.status !== 'generating');
    if (selectedTargets.length > 0) return selectedTargets;
    if (selectedPromptCard?.type === promptTargetMeta.cardType && selectedPromptCard.status !== 'generating') {
      return [selectedPromptCard];
    }
    return [];
  }, [promptTargetMeta.cardType, selectedPromptCard, selectedPromptCards]);

  const runPromptTemplates = React.useCallback((templatesToRun = []) => {
    const templates = templatesToRun.filter((template) => template?.id && templatePromptText(template));
    if (!templates.length || !promptTargets.length) return;
    if (onBatchGenerate) {
      onBatchGenerate({
        cards: promptTargets,
        modelId: selectedImageModelId,
        imageParams,
        templates,
      });
      return;
    }
    promptTargets.forEach((card) => {
      templates.forEach((template) => {
        onGenerateTemplate?.({ card, modelId: selectedImageModelId, imageParams, template });
      });
    });
  }, [imageParams, onBatchGenerate, onGenerateTemplate, promptTargets, selectedImageModelId]);

  const promptGenerateDisabled = !selectedImageModelId || promptTargets.length === 0 || usablePromptTemplates.length === 0;

  return (
    <aside className="design-space-panel design-space-input-panel">
      <div className="design-space-panel-head">
        <h2>输入与解析</h2>
      </div>
      <label className="design-space-field">
        <span>原文</span>
        <textarea
          value={sourceText}
          onChange={(event) => onSourceTextChange?.(event.target.value)}
          placeholder="粘贴小说或剧本原文"
        />
      </label>
      {packageData.parseError && (
        <div className="design-error-box">
          <strong>解析失败</strong>
          <span>{packageData.parseError}</span>
        </div>
      )}
      <div className="design-side-actions" aria-label="快捷生成">
        <div className="design-side-actions-head">
          <strong>快捷生成</strong>
          <span>已选 {selectedCardsCount} · 目标 {actionCardsCount}</span>
        </div>
        <div className="design-side-action-grid">
          <button type="button" disabled={totalCardsCount === 0} onClick={onSelectAllCards}>
            {allActiveCardsSelected ? '取消全选' : '一键全选'}
          </button>
          <button
            type="button"
            disabled={actionCardsCount === 0 || !selectedImageModelId}
            onClick={() => onBatchGenerate?.({ imageParams })}
          >
            生成所选
          </button>
        </div>
        {showPromptTemplates && (
          <div className="design-side-template-block">
            <div className="design-side-actions-head">
              <strong>{promptTargetMeta.title}</strong>
              <span>{promptTargetMeta.label} {promptTargets.length} · 模板 {usablePromptTemplates.length}</span>
            </div>
            <div className="design-side-template-grid">
              {usablePromptTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  disabled={promptGenerateDisabled}
                  onClick={() => runPromptTemplates([template])}
                >
                  {template.name}
                </button>
              ))}
              <button
                type="button"
                disabled={promptGenerateDisabled}
                onClick={() => runPromptTemplates(usablePromptTemplates)}
              >
                全部能力
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
