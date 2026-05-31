import React from 'react';
import { cardsForDesignTab, createManualDesignCard, selectedDesignCard } from './designSpacePackage.js';
import { designSpaceActions, designSpaceStore, useDesignSpacePackage } from './designSpaceStore.js';
import {
  applyDesignCardJobToPackage,
  designSpaceCardJobMeta,
} from './designSpaceCardJobResults.js';
import { DesignSpaceInputPanel } from './DesignSpaceInputPanel.jsx';
import { DesignSpaceCardGrid } from './DesignSpaceCardGrid.jsx';
import { DesignSpaceDetailPanel } from './DesignSpaceDetailPanel.jsx';
import {
  DesignSpaceTopControls,
  DEFAULT_DESIGN_IMAGE_PARAMS,
  composeDesignSpaceProjectStyle,
  defaultDesignSpaceStyleId,
  getDesignSpaceStylePresets,
  normalizeDesignImageParams,
} from './DesignSpaceTopControls.jsx';
import { designModelOptionId, normalizeDesignParseModels } from './designSpaceModels.js';
import { JobStore } from '../../shared/platform/jobStore.js';
import { useStyleGroups } from '../../shared/store/styleLibraryStore.js';

function bucketForCard(card, pkg) {
  if (!card) return pkg?.activeTab || 'characters';
  if (card.type === 'scene') return 'scenes';
  if (card.type === 'prop') return 'props';
  if (Array.isArray(pkg?.scenes) && pkg.scenes.some((item) => item.id === card.id)) return 'scenes';
  if (Array.isArray(pkg?.props) && pkg.props.some((item) => item.id === card.id)) return 'props';
  return 'characters';
}

function fallbackPackage(projectId, project, packageData) {
  return packageData || {
    projectId,
    title: `${project?.name || '项目'}设计空间`,
    activeTab: 'characters',
    selectedCardId: '',
    sourceText: '',
    projectMeta: {},
    characters: [],
    scenes: [],
    props: [],
  };
}

function normalizeDesignBucket(bucket) {
  if (bucket === 'scenes' || bucket === 'props') return bucket;
  return 'characters';
}

export function sourceTextFromWorkbenchNode(node = {}) {
  return node.scriptText || node.scriptSourceText || node.rawScriptText || '';
}

export function EmbeddedDesignSpaceWorkbench({
  projectId = 'local-default',
  assetProjectId = projectId,
  project,
  models = [],
  imageModels = [],
  promptTemplates = [],
  templateStatus = null,
  initialSourceText = '',
  onParse,
  onGenerateCard,
  onBatchGenerate,
  onSaveVersion,
  onLoadVersionToCanvas,
}) {
  const packageData = useDesignSpacePackage(projectId);
  const [parsing, setParsing] = React.useState(false);
  const [sourceText, setSourceText] = React.useState(packageData?.sourceText || initialSourceText || '');
  const [stylePresetId, setStylePresetId] = React.useState(packageData?.projectMeta?.visualStylePresetId || defaultDesignSpaceStyleId());
  const [styleExtra, setStyleExtra] = React.useState(packageData?.projectMeta?.visualStyleExtra || '');
  const [styleEnabled, setStyleEnabled] = React.useState(packageData?.projectMeta?.visualStyleEnabled !== false);
  const [imageParams, setImageParams] = React.useState(() => (
    normalizeDesignImageParams(packageData?.projectMeta?.imageGenerationParams || DEFAULT_DESIGN_IMAGE_PARAMS)
  ));
  const [promptPrefix, setPromptPrefix] = React.useState(packageData?.projectMeta?.imagePromptPrefix || '');
  const [parserModelId, setParserModelId] = React.useState('');
  const [imageModelId, setImageModelId] = React.useState('');
  const [selectedCardIds, setSelectedCardIds] = React.useState(() => new Set());
  const styleGroups = useStyleGroups();
  const designStylePresets = React.useMemo(() => getDesignSpaceStylePresets(styleGroups), [styleGroups]);

  React.useEffect(() => {
    designSpaceActions.ensurePackage(projectId, {
      title: `${project?.name || '项目'}设计空间`,
    });
  }, [projectId, project?.name]);

  React.useEffect(() => {
    if (!projectId || !JobStore.available()) return undefined;
    let cancelled = false;
    const timestamp = (job) => Date.parse(job?.createdAt || job?.updatedAt || '') || 0;

    JobStore.list({ projectId: assetProjectId, limit: 200 })
      .then((result) => {
        if (cancelled) return;
        const jobs = Array.isArray(result) ? result : (Array.isArray(result?.jobs) ? result.jobs : []);
        const relevantJobs = jobs
          .filter((job) => designSpaceCardJobMeta(job)?.projectId === projectId)
          .sort((a, b) => timestamp(a) - timestamp(b));
        if (!relevantJobs.length) return;

        const current = designSpaceStore.getState().packagesByProject[projectId];
        if (!current) return;
        let next = current;
        relevantJobs.forEach((job) => {
          next = applyDesignCardJobToPackage(next, job);
        });
        if (next !== current) designSpaceActions.setPackage(projectId, next);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [assetProjectId, packageData?.id, projectId]);

  React.useEffect(() => {
    setSourceText(packageData?.sourceText || initialSourceText || '');
  }, [initialSourceText, packageData?.id, packageData?.sourceText]);

  React.useEffect(() => {
    setStylePresetId(packageData?.projectMeta?.visualStylePresetId || defaultDesignSpaceStyleId());
    setStyleExtra(packageData?.projectMeta?.visualStyleExtra || '');
    setStyleEnabled(packageData?.projectMeta?.visualStyleEnabled !== false);
    setImageParams(normalizeDesignImageParams(packageData?.projectMeta?.imageGenerationParams || DEFAULT_DESIGN_IMAGE_PARAMS));
    setPromptPrefix(packageData?.projectMeta?.imagePromptPrefix || '');
  }, [
    packageData?.id,
    packageData?.projectMeta?.imagePromptPrefix,
    packageData?.projectMeta?.imageGenerationParams,
    packageData?.projectMeta?.visualStyleEnabled,
    packageData?.projectMeta?.visualStyleExtra,
    packageData?.projectMeta?.visualStylePresetId,
  ]);

  const selectedParserModelId = React.useMemo(() => {
    const options = normalizeDesignParseModels(models).map(designModelOptionId).filter(Boolean);
    return options.includes(parserModelId) ? parserModelId : (options[0] || '');
  }, [models, parserModelId]);

  const selectedImageModelId = React.useMemo(() => {
    const options = imageModels.map(designModelOptionId).filter(Boolean);
    return options.includes(imageModelId) ? imageModelId : (options[0] || '');
  }, [imageModelId, imageModels]);

  const selectedStylePresetId = React.useMemo(() => (
    designStylePresets.some((style) => style.id === stylePresetId)
      ? stylePresetId
      : defaultDesignSpaceStyleId(designStylePresets)
  ), [designStylePresets, stylePresetId]);

  const projectStyle = React.useMemo(
    () => composeDesignSpaceProjectStyle(selectedStylePresetId, styleExtra, designStylePresets, styleEnabled),
    [designStylePresets, selectedStylePresetId, styleEnabled, styleExtra],
  );

  const pkg = React.useMemo(
    () => fallbackPackage(projectId, project, packageData),
    [packageData, project, projectId],
  );

  const runParse = React.useCallback(async (request) => {
    setParsing(true);
    try {
      await onParse?.(request);
    } finally {
      setParsing(false);
    }
  }, [onParse]);

  const patchProjectMeta = React.useCallback((
    nextStylePresetId,
    nextStyleExtra,
    nextImageParams = imageParams,
    nextPromptPrefix = promptPrefix,
    nextStyleEnabled = styleEnabled,
  ) => {
    const normalizedImageParams = normalizeDesignImageParams(nextImageParams);
    const enabled = nextStyleEnabled !== false;
    const visualStyle = composeDesignSpaceProjectStyle(nextStylePresetId, nextStyleExtra, designStylePresets, enabled);
    designSpaceActions.patchPackage(projectId, {
      projectMeta: {
        ...(packageData?.projectMeta || {}),
        visualStyle,
        visualStylePresetId: nextStylePresetId,
        visualStyleExtra: nextStyleExtra,
        visualStyleEnabled: enabled,
        imageGenerationParams: normalizedImageParams,
        imagePromptPrefix: String(nextPromptPrefix || '').trim(),
      },
    });
  }, [designStylePresets, imageParams, packageData?.projectMeta, projectId, promptPrefix, styleEnabled]);

  const handleStylePresetChange = React.useCallback((nextStylePresetId) => {
    setStylePresetId(nextStylePresetId);
    patchProjectMeta(nextStylePresetId, styleExtra, imageParams, promptPrefix, styleEnabled);
  }, [imageParams, patchProjectMeta, promptPrefix, styleEnabled, styleExtra]);

  const handleStyleExtraChange = React.useCallback((nextStyleExtra) => {
    setStyleExtra(nextStyleExtra);
    patchProjectMeta(selectedStylePresetId, nextStyleExtra, imageParams, promptPrefix, styleEnabled);
  }, [imageParams, patchProjectMeta, promptPrefix, selectedStylePresetId, styleEnabled]);

  const handleStyleEnabledChange = React.useCallback((nextStyleEnabled) => {
    setStyleEnabled(nextStyleEnabled);
    patchProjectMeta(selectedStylePresetId, styleExtra, imageParams, promptPrefix, nextStyleEnabled);
  }, [imageParams, patchProjectMeta, promptPrefix, selectedStylePresetId, styleExtra]);

  const handleImageParamsChange = React.useCallback((nextImageParams) => {
    const normalizedImageParams = normalizeDesignImageParams(nextImageParams);
    setImageParams(normalizedImageParams);
    patchProjectMeta(selectedStylePresetId, styleExtra, normalizedImageParams, promptPrefix, styleEnabled);
  }, [patchProjectMeta, promptPrefix, selectedStylePresetId, styleEnabled, styleExtra]);

  const handlePromptPrefixChange = React.useCallback((nextPromptPrefix) => {
    const normalizedPromptPrefix = String(nextPromptPrefix || '').trim();
    setPromptPrefix(normalizedPromptPrefix);
    patchProjectMeta(selectedStylePresetId, styleExtra, imageParams, normalizedPromptPrefix, styleEnabled);
  }, [imageParams, patchProjectMeta, selectedStylePresetId, styleEnabled, styleExtra]);

  const handleParseFromTop = React.useCallback(({ modelId, projectStyle: nextProjectStyle }) => {
    const style = nextProjectStyle ?? projectStyle;
    designSpaceActions.patchPackage(projectId, {
      sourceText,
      parseError: '',
      projectMeta: {
        ...(packageData?.projectMeta || {}),
        visualStyle: style,
        visualStylePresetId: selectedStylePresetId,
        visualStyleExtra: styleExtra,
        visualStyleEnabled: styleEnabled,
      },
    });
    runParse({ projectId, assetProjectId, sourceText, projectStyle: style, modelId });
  }, [assetProjectId, packageData?.projectMeta, projectId, projectStyle, runParse, selectedStylePresetId, sourceText, styleEnabled, styleExtra]);

  const persistCurrentProjectStyle = React.useCallback(() => {
    patchProjectMeta(selectedStylePresetId, styleExtra, imageParams, promptPrefix, styleEnabled);
  }, [imageParams, patchProjectMeta, promptPrefix, selectedStylePresetId, styleEnabled, styleExtra]);

  const handleGenerateCard = React.useCallback((request) => {
    persistCurrentProjectStyle();
    onGenerateCard?.({
      ...request,
      projectId,
      assetProjectId,
      projectStyle,
      imageParams: normalizeDesignImageParams(request?.imageParams || imageParams),
      promptPrefix: String(request?.promptPrefix ?? promptPrefix).trim(),
    });
  }, [assetProjectId, imageParams, onGenerateCard, persistCurrentProjectStyle, projectId, projectStyle, promptPrefix]);

  const handleBatchGenerate = React.useCallback((request) => {
    persistCurrentProjectStyle();
    onBatchGenerate?.({
      ...request,
      projectId,
      assetProjectId,
      projectStyle,
      imageParams: normalizeDesignImageParams(request?.imageParams || imageParams),
      promptPrefix: String(request?.promptPrefix ?? promptPrefix).trim(),
    });
  }, [assetProjectId, imageParams, onBatchGenerate, persistCurrentProjectStyle, projectId, projectStyle, promptPrefix]);

  const handleSaveVersion = React.useCallback((request = {}) => {
    onSaveVersion?.({ ...request, projectId, assetProjectId });
  }, [assetProjectId, onSaveVersion, projectId]);

  const handleLoadVersionToCanvas = React.useCallback((request = {}) => {
    onLoadVersionToCanvas?.({ ...request, projectId, assetProjectId });
  }, [assetProjectId, onLoadVersionToCanvas, projectId]);

  const selectedCard = React.useMemo(() => {
    if (!pkg?.selectedCardId) return null;
    return selectedDesignCard(pkg);
  }, [pkg]);

  const patchSelectedCard = React.useCallback((patch) => {
    if (!pkg || !selectedCard) return;
    const bucket = bucketForCard(selectedCard, pkg);
    const cards = Array.isArray(pkg[bucket]) ? pkg[bucket] : [];
    designSpaceActions.patchPackage(projectId, {
      [bucket]: cards.map((card) => (
        card.id === selectedCard.id
          ? { ...card, ...patch, updatedAt: new Date().toISOString() }
          : card
      )),
    });
  }, [pkg, projectId, selectedCard]);

  const activeCards = React.useMemo(() => cardsForDesignTab(pkg, pkg.activeTab || 'characters'), [pkg]);
  const selectedCards = React.useMemo(
    () => activeCards.filter((card) => selectedCardIds.has(card.id)),
    [activeCards, selectedCardIds],
  );
  const actionTargetCards = React.useMemo(() => {
    if (selectedCards.length > 0) return selectedCards;
    return selectedCard ? [selectedCard] : [];
  }, [selectedCard, selectedCards]);
  React.useEffect(() => {
    const activeCardIds = new Set(activeCards.map((card) => card.id));
    setSelectedCardIds((current) => {
      const next = new Set([...current].filter((id) => activeCardIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [activeCards]);

  const toggleSelectedCard = React.useCallback((cardId) => {
    setSelectedCardIds((current) => {
      const next = new Set(current);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  const allActiveCardsSelected = React.useMemo(() => (
    activeCards.length > 0 && activeCards.every((card) => selectedCardIds.has(card.id))
  ), [activeCards, selectedCardIds]);

  const toggleAllActiveCards = React.useCallback(() => {
    if (allActiveCardsSelected) {
      setSelectedCardIds(new Set());
      return;
    }
    setSelectedCardIds(new Set(activeCards.map((card) => card.id).filter(Boolean)));
  }, [activeCards, allActiveCardsSelected]);

  const generateSelectedCards = React.useCallback((request = {}) => {
    const requestedCards = Array.isArray(request.cards) ? request.cards.filter(Boolean) : [];
    const targetCards = requestedCards.length > 0 ? requestedCards : actionTargetCards;
    handleBatchGenerate({
      ...request,
      cards: targetCards,
      modelId: request.modelId || selectedImageModelId,
    });
  }, [actionTargetCards, handleBatchGenerate, selectedImageModelId]);
  const handleSelectCard = React.useCallback((cardId) => {
    designSpaceActions.selectCard(projectId, cardId);
  }, [projectId]);

  const handleCreateManualAsset = React.useCallback(({ bucket, name, visualPrompt }) => {
    const targetBucket = normalizeDesignBucket(bucket);
    const currentPackage = designSpaceStore.getState().packagesByProject[projectId];
    const currentCards = Array.isArray(currentPackage?.[targetBucket]) ? currentPackage[targetBucket] : [];
    const card = createManualDesignCard({ bucket: targetBucket, name, visualPrompt });
    setSelectedCardIds(new Set());
    designSpaceActions.patchPackage(projectId, {
      activeTab: targetBucket,
      selectedCardId: card.id,
      [targetBucket]: [...currentCards, card],
    });
  }, [projectId]);

  const handleDeleteCard = React.useCallback((cardId) => {
    if (!cardId) return;
    const currentPackage = designSpaceStore.getState().packagesByProject[projectId];
    if (!currentPackage) return;
    const allBuckets = ['characters', 'scenes', 'props'];
    const targetBucket = allBuckets.find((bucket) => (
      Array.isArray(currentPackage?.[bucket])
        && currentPackage[bucket].some((card) => card?.id === cardId)
    ));
    if (!targetBucket) return;

    const currentCards = Array.isArray(currentPackage[targetBucket]) ? currentPackage[targetBucket] : [];
    const cardIndex = currentCards.findIndex((card) => card?.id === cardId);
    const nextCards = currentCards.filter((card) => card?.id !== cardId);
    const replacement = nextCards[Math.min(cardIndex, nextCards.length - 1)] || nextCards[cardIndex - 1] || null;
    const nextSelectedCardId = currentPackage.selectedCardId === cardId
      ? (replacement?.id || '')
      : currentPackage.selectedCardId;

    setSelectedCardIds((current) => {
      if (!current.has(cardId)) return current;
      const next = new Set(current);
      next.delete(cardId);
      return next;
    });
    designSpaceActions.patchPackage(projectId, {
      [targetBucket]: nextCards,
      selectedCardId: nextSelectedCardId,
    });
  }, [projectId]);

  return (
    <section className="embedded-design-space-workbench">
      <div className="embedded-design-space-toolbar">
        <DesignSpaceTopControls
          models={models}
          imageModels={imageModels}
          sourceText={sourceText}
          projectStyle={projectStyle}
          stylePresetId={selectedStylePresetId}
          styleExtra={styleExtra}
          styleEnabled={styleEnabled}
          imageParams={imageParams}
          stylePresets={designStylePresets}
          parserModelId={selectedParserModelId}
          imageModelId={selectedImageModelId}
          parsing={parsing}
          onParserModelChange={setParserModelId}
          onImageModelChange={setImageModelId}
          onImageParamsChange={handleImageParamsChange}
          onStylePresetChange={handleStylePresetChange}
          onStyleExtraChange={handleStyleExtraChange}
          onStyleEnabledChange={handleStyleEnabledChange}
          onParse={handleParseFromTop}
        />
        {templateStatus?.usingFallback && (
          <div className="design-template-status">使用内置提示词模板</div>
        )}
      </div>
      <div className="design-space-workbench embedded">
        <DesignSpaceInputPanel
          packageData={pkg}
          sourceText={sourceText}
          onSourceTextChange={setSourceText}
          selectedCardsCount={selectedCards.length}
          totalCardsCount={activeCards.length}
          actionCardsCount={actionTargetCards.length}
          allActiveCardsSelected={allActiveCardsSelected}
          selectedImageModelId={selectedImageModelId}
          imageParams={imageParams}
          promptTemplates={promptTemplates}
          selectedPromptCard={selectedCard}
          selectedPromptCards={selectedCards}
          onSelectAllCards={toggleAllActiveCards}
          onBatchGenerate={onBatchGenerate ? generateSelectedCards : undefined}
          onGenerateTemplate={handleGenerateCard}
        />
        <DesignSpaceCardGrid
          projectId={projectId}
          packageData={pkg}
          selectedIds={selectedCardIds}
          onSelectCard={handleSelectCard}
          onToggleCard={toggleSelectedCard}
          onDeleteCard={handleDeleteCard}
          onCreateManualAsset={handleCreateManualAsset}
        />
        <DesignSpaceDetailPanel
          projectId={projectId}
          card={selectedCard}
          selectedImageModelId={selectedImageModelId}
          imageParams={imageParams}
          promptPrefix={promptPrefix}
          promptTemplates={promptTemplates}
          onPatchCard={patchSelectedCard}
          onGenerateCard={handleGenerateCard}
          onPromptPrefixChange={handlePromptPrefixChange}
        />
      </div>
    </section>
  );
}
