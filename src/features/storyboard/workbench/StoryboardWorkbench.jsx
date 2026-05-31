import React from 'react';
import {
  IArrow,
  IBox,
  ICamera,
  IChevD,
  IChevL,
  IFilm,
  IMagic,
  IScript,
  IText,
  IVideo,
} from '../../../shared/ui/icons/index.jsx';
import { canvasActions, useEdges, useNodeById, useNodes, useProject } from '../../../shared/store/canvasStore.js';
import { useAssets } from '../../../shared/store/libraryStore.js';
import { useProjectAssets } from '../../../shared/store/projectAssetsStore.js';
import { useDesignSpacePackage } from '../../design-space/designSpaceStore.js';
import { ScriptTab } from './ScriptTab.jsx';
import {
  AssetBindingsTab,
  makeStoryboardDesignSpaceProjectId,
} from './AssetBindingsTab.jsx';
import { ShotsTab } from './ShotsTab.jsx';
import {
  VideoAnalysisTab,
  VideoPromptReverseTab,
} from './VideoAnalysisTab.jsx';
import { OutputTab } from './OutputTab.jsx';
import { getNodeStoryboardPackage } from '../package/storyboardPackage.js';
import { storyboardPackageActions } from '../../../shared/store/storyboardPackageStore.js';
import { ProviderStore } from '../../../shared/platform/providerStore.js';
import { modelLabel, selectBackendModel } from '../../../shared/platform/modelSelection.js';
import { getStoryboardWorkbenchEntry } from './workbenchEntry.js';
import {
  getWorkflowDefaultTab,
  getWorkflowTabs,
  getWorkflowTitle,
  normalizeWorkbenchMode,
  normalizeWorkflowTab,
  WORKBENCH_MODE_SCRIPT,
} from './workbenchWorkflow.js';
import {
  countScriptInputChars,
  SCRIPT_INPUT_NEXT_STEP_LIMIT,
} from './scriptInputLimits.js';

const CHAT_CAPABILITY = 'text.generate';

const asArray = (value) => (Array.isArray(value) ? value : []);

function safeText(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function firstText(...values) {
  return values.map(safeText).find(Boolean) || '';
}

function nodeDesignPackageFromNode(node = {}) {
  return node?.designSpacePackage || node?.state?.designSpacePackage || null;
}

function normalizeDesignCardAsset(card = {}, type, index) {
  const id = firstText(card.id, card.assetId, card.cardId, `${type}_${String(index + 1).padStart(3, '0')}`);
  const name = firstText(card.name, card.title, card.label, id);
  const details = firstText(card.details, card.description, card.prompt, card.visualPrompt);
  const visualPrompt = firstText(card.visualPrompt, card.prompt, details);
  return {
    ...card,
    id,
    assetId: firstText(card.assetId, id),
    cardId: firstText(card.cardId, card.id, id),
    type: card.type || type,
    name,
    title: firstText(card.title, name),
    label: firstText(card.label, name),
    details,
    prompt: firstText(card.prompt, visualPrompt, details),
    visualPrompt,
    source: card.source || 'design-space',
  };
}

export function designPackageToStoryboardAssets(pkg = {}) {
  return {
    keyCharacters: asArray(pkg?.characters).map((card, index) => normalizeDesignCardAsset(card, 'character', index)),
    sceneAnalysis: asArray(pkg?.scenes).map((card, index) => normalizeDesignCardAsset(card, 'scene', index)),
    keyProps: asArray(pkg?.props).map((card, index) => normalizeDesignCardAsset(card, 'prop', index)),
  };
}

function assetKey(asset = {}) {
  return firstText(asset.id, asset.assetId, asset.cardId, asset.name, asset.title, asset.label).toLowerCase();
}

function mergeAssetList(...lists) {
  const order = [];
  const byKey = new Map();
  lists.flatMap(asArray).forEach((asset) => {
    const key = assetKey(asset);
    if (!key) return;
    if (!byKey.has(key)) order.push(key);
    byKey.set(key, { ...(byKey.get(key) || {}), ...asset });
  });
  return order.map((key) => byKey.get(key));
}

export function resolveWorkbenchStoryboardAssets(projectAssets = {}, ...designPackages) {
  const designAssets = designPackages
    .filter(Boolean)
    .map((pkg) => designPackageToStoryboardAssets(pkg));
  return {
    keyCharacters: mergeAssetList(
      projectAssets?.keyCharacters,
      ...designAssets.map((assets) => assets.keyCharacters),
    ),
    sceneAnalysis: mergeAssetList(
      projectAssets?.sceneAnalysis,
      ...designAssets.map((assets) => assets.sceneAnalysis),
    ),
    keyProps: mergeAssetList(
      projectAssets?.keyProps,
      ...designAssets.map((assets) => assets.keyProps),
    ),
  };
}

const sourceModeForWorkbenchMode = (mode) => (mode === 'video-remix' ? 'video-remix' : 'script');
const workbenchModeForSourceMode = (sourceMode) => (
  sourceMode === 'video-remix' || sourceMode === 'video_reference'
    ? 'video-remix'
    : 'script-create'
);

const TAB_ICON_COMPONENTS = {
  script: IText,
  'asset-bindings': IBox,
  shots: IFilm,
  output: IArrow,
  video: IVideo,
  'video-frames': ICamera,
  'video-prompts': IMagic,
};

function WorkflowTabIcon({ tabKey }) {
  const TabIcon = TAB_ICON_COMPONENTS[tabKey] || IScript;
  return <TabIcon size={15} />;
}

function WorkbenchModelPicker({ nodeId, node, selectedModel, setSelectedModel }) {
  const [models, setModels] = React.useState([]);
  const [modelLoading, setModelLoading] = React.useState(false);
  const [modelMenuOpen, setModelMenuOpen] = React.useState(false);
  const pickerRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    setModelLoading(true);
    ProviderStore.models({ capability: CHAT_CAPABILITY })
      .then((result) => {
        if (cancelled) return;
        const next = (result?.models || []).filter((m) => m.enabled !== false);
        const preferred = selectBackendModel(next, {
          currentId: node.workbenchModelId || null,
          currentLabel: node.workbenchModelLabel || null,
        });
        setModels(next);
        setSelectedModel((current) => current || preferred);
      })
      .catch(() => {
        if (!cancelled) {
          setModels([]);
          setSelectedModel(null);
        }
      })
      .finally(() => {
        if (!cancelled) setModelLoading(false);
      });
    return () => { cancelled = true; };
  }, [node.workbenchModelId, node.workbenchModelLabel, setSelectedModel]);

  React.useEffect(() => {
    if (!modelMenuOpen) return undefined;
    const onDocClick = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [modelMenuOpen]);

  const chooseModel = React.useCallback((model) => {
    setSelectedModel(model);
    setModelMenuOpen(false);
    canvasActions.updateNode(nodeId, {
      workbenchModelId: model.id,
      workbenchModelLabel: modelLabel(model),
    });
  }, [nodeId, setSelectedModel]);

  const pickerLabel = selectedModel
    ? modelLabel(selectedModel)
    : (modelLoading ? '加载模型中…' : '暂无可用模型');

  return (
    <div className="sb-model-picker" ref={pickerRef}>
      <span>模型：</span>
      <button
        type="button"
        className="picker-btn"
        onClick={() => setModelMenuOpen((value) => !value)}
        disabled={modelLoading}
        title={selectedModel ? `${modelLabel(selectedModel)} (${selectedModel.providerId})` : ''}
      >
        <span>{pickerLabel}</span>
        <span className="arrow" aria-hidden="true"><IChevD size={13} /></span>
      </button>
      {modelMenuOpen && (
        <div className="sb-model-menu" role="listbox">
          {models.length ? models.map((model) => (
            <div
              key={model.id}
              role="option"
              aria-selected={selectedModel?.id === model.id}
              className={`item ${selectedModel?.id === model.id ? 'active' : ''}`}
              onClick={() => chooseModel(model)}
            >
              <span className="label">{modelLabel(model)}</span>
              <span className="provider">{model.providerId}</span>
            </div>
          )) : (
            <div className="empty">暂无可用模型 — 请到「模型配置」启用</div>
          )}
        </div>
      )}
    </div>
  );
}

export function StoryboardWorkbench({
  nodeId,
  onClose,
  onTask,
  onDeployPackage,
  onGeneratePackageMedia,
  initialTab,
  packageSourceMode,
  entry,
  task,
  onOpenDesignSpace,
  designModels = [],
  imageModels = [],
  videoModels = [],
  designPromptTemplates = [],
  designTemplateStatus = null,
  onDesignSpaceParse,
  onDesignSpaceGenerateCard,
  onDesignSpaceBatchGenerate,
  onDesignSpaceSaveVersion,
  onDesignSpaceLoadVersionToCanvas,
  onStopPromptInferenceQueue,
  onCancelPromptInferenceRunning,
  onCancelPromptInferenceQueueTask,
}) {
  const hasEntry = entry !== undefined && entry !== null;
  const resolvedEntry = getStoryboardWorkbenchEntry(entry);
  const node = useNodeById(nodeId);
  const persistedSourceMode = node?.storyboardPackage?.sourceMode || node?.state?.storyboardPackage?.sourceMode;
  const desiredSourceMode = packageSourceMode || (hasEntry ? resolvedEntry.sourceMode : persistedSourceMode);
  const desiredMode = normalizeWorkbenchMode(
    hasEntry ? resolvedEntry.workbenchMode : workbenchModeForSourceMode(desiredSourceMode),
  );
  const desiredInitialTab = initialTab
    || (hasEntry ? resolvedEntry.initialTab : getWorkflowDefaultTab(desiredMode));
  const canvasNodes = useNodes();
  const canvasEdges = useEdges();
  const libraryAssets = useAssets();
  const project = useProject();
  const projectId = project?.id || 'local-default';
  const projectAssets = useProjectAssets(projectId);
  const designPackage = useDesignSpacePackage(projectId);
  const scopedDesignSpaceProjectId = React.useMemo(
    () => makeStoryboardDesignSpaceProjectId(projectId, nodeId),
    [nodeId, projectId],
  );
  const scopedDesignPackage = useDesignSpacePackage(scopedDesignSpaceProjectId);
  const assets = React.useMemo(
    () => resolveWorkbenchStoryboardAssets(
      projectAssets,
      nodeDesignPackageFromNode(node),
      scopedDesignPackage,
    ),
    [node, projectAssets, scopedDesignPackage],
  );
  const [activeMode, setActiveMode] = React.useState(desiredMode);
  const [activeTab, setActiveTab] = React.useState(() => normalizeWorkflowTab(desiredMode, desiredInitialTab));
  const [selectedModel, setSelectedModel] = React.useState(null);
  const activeSourceMode = sourceModeForWorkbenchMode(activeMode);
  const workflowTabs = getWorkflowTabs(activeMode);
  const workflowTitle = getWorkflowTitle(activeMode);
  const scopedTask = task && (!task.nodeId || task.nodeId === nodeId) ? task : null;
  const scriptSourceInput = node?.scriptSourceText ?? node?.rawScriptText ?? node?.scriptText ?? '';
  const scriptSourceCharCount = countScriptInputChars(scriptSourceInput);
  const scriptInputBlocksNextSteps = (
    activeMode === WORKBENCH_MODE_SCRIPT
    && scriptSourceCharCount > SCRIPT_INPUT_NEXT_STEP_LIMIT
  );
  const scriptTabIndex = workflowTabs.findIndex((tab) => tab.key === 'script');
  const activeTabIndex = workflowTabs.findIndex((tab) => tab.key === activeTab);
  const activeTabBlockedByScriptLimit = (
    scriptInputBlocksNextSteps
    && scriptTabIndex >= 0
    && activeTabIndex > scriptTabIndex
  );

  React.useEffect(() => {
    setActiveTab(normalizeWorkflowTab(desiredMode, desiredInitialTab));
  }, [desiredInitialTab, desiredMode]);

  React.useEffect(() => {
    setActiveMode(desiredMode);
  }, [desiredMode]);

  React.useEffect(() => {
    if (activeTabBlockedByScriptLimit) {
      setActiveTab('script');
    }
  }, [activeTabBlockedByScriptLimit]);

  React.useEffect(() => {
    if (!nodeId) return;
    storyboardPackageActions.ensureNodePackage(nodeId, {
      projectId,
      sourceMode: activeSourceMode,
    });
  }, [nodeId, projectId, activeSourceMode]);

  /* Esc to close. */
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!node) {
    return (
      <div className="sb-workbench-backdrop" role="presentation" onClick={onClose}>
        <div className="sb-workbench" onClick={(e) => e.stopPropagation()} style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: 'var(--ink-mute)', fontSize: 13, padding: 40 }}>
            找不到节点 {nodeId ? `（id: ${nodeId}）` : '(无 nodeId)'}
          </div>
          <button className="sb-tool-btn" onClick={onClose}>← 返回画布</button>
        </div>
      </div>
    );
  }

  const normalizedPackage = getNodeStoryboardPackage(node, {
    projectId,
    nodeId,
    sourceMode: activeSourceMode,
  });
  const activeDesignPackage = scopedDesignPackage || nodeDesignPackageFromNode(node) || designPackage || null;
  const storyboardPackage = {
    ...normalizedPackage,
    sourceMode: activeSourceMode,
    ...(activeDesignPackage ? { designSpacePackage: activeDesignPackage } : {}),
  };
  const packageShotGroups = Array.isArray(storyboardPackage.shotGroups) ? storyboardPackage.shotGroups : [];
  const shotGroupCount = packageShotGroups.length;
  const totalSeconds = packageShotGroups.reduce((sum, g) => {
    const v = parseFloat(String(g.totalDuration || '0').replace(/[^\d.]/g, ''));
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);

  const tabContext = {
    nodeId,
    projectId,
    node,
    project,
    assets,
    canvasNodes,
    canvasEdges,
    libraryAssets,
    storyboardPackage,
    designPackage: activeDesignPackage,
    models: designModels,
    imageModels,
    videoModels,
    promptTemplates: designPromptTemplates,
    templateStatus: designTemplateStatus,
    selectedModel,
    task: scopedTask,
    onOpenDesignSpace,
    onDesignSpaceParse,
    onDesignSpaceGenerateCard,
    onDesignSpaceBatchGenerate,
    onDesignSpaceSaveVersion,
    onDesignSpaceLoadVersionToCanvas,
    onStopPromptInferenceQueue,
    onCancelPromptInferenceRunning,
    onCancelPromptInferenceQueueTask,
    onTask,           // hand off to App-level toast
  };
  const isWorkflowTabLocked = (tabKey) => {
    if (!scriptInputBlocksNextSteps || scriptTabIndex < 0) return false;
    const targetIndex = workflowTabs.findIndex((tab) => tab.key === tabKey);
    return targetIndex > scriptTabIndex;
  };
  const scriptInputLimitTitle = `内容输入当前 ${scriptSourceCharCount} 字，超过 ${SCRIPT_INPUT_NEXT_STEP_LIMIT} 字不能进入下一步`;

  return (
    <div className="sb-workbench-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`sb-workbench ${scopedTask ? 'has-task' : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sb-workbench-shellbar">
          <div className="sb-shell-left">
            <button type="button" className="sb-shell-back" onClick={onClose} aria-label="返回画布">
              <IChevL size={15} />
              <span>返回画布</span>
            </button>
            <div className="sb-shell-title">
              <span><IScript size={14} />{workflowTitle}</span>
              <strong>{node.title || '脚本节点'}</strong>
            </div>
          </div>

          <nav className="sb-workflow-tabs" role="tablist" aria-label={`${workflowTitle}步骤`}>
            {workflowTabs.map((t, index) => {
              const active = activeTab === t.key;
              const locked = isWorkflowTabLocked(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  className={active ? 'active' : ''}
                  aria-selected={active}
                  aria-disabled={locked ? 'true' : undefined}
                  disabled={locked}
                  title={locked ? scriptInputLimitTitle : undefined}
                  onClick={() => {
                    if (!locked) setActiveTab(t.key);
                  }}
                >
                  <span className="tab-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="tab-icon"><WorkflowTabIcon tabKey={t.key} /></span>
                  <span className="tab-label">{t.label}</span>
                  {active && scopedTask && <span className="tab-pulse" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>

          <div className="sb-shell-actions">
            <WorkbenchModelPicker
              nodeId={nodeId}
              node={node}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
        </header>

        <main className={`sb-body ${activeTab === 'asset-bindings' ? 'asset-bindings-body' : ''}`}>
          {activeTab === 'script' && <ScriptTab {...tabContext} />}
          {activeTab === 'asset-bindings' && <AssetBindingsTab {...tabContext} />}
          {activeTab === 'shots' && <ShotsTab {...tabContext} />}
          {activeTab === 'video' && <VideoAnalysisTab {...tabContext} view="input" />}
          {activeTab === 'video-frames' && <VideoAnalysisTab {...tabContext} />}
          {activeTab === 'video-prompts' && <VideoPromptReverseTab {...tabContext} />}
          {activeTab === 'output' && (
            <OutputTab
              {...tabContext}
              onDeploy={(request) => {
                const deploymentRequest = {
                  ...(request || {}),
                  nodeId,
                  projectId,
                  storyboardPackage,
                };
                if (onDeployPackage) {
                  onDeployPackage(deploymentRequest);
                } else {
                  onTask?.({ type: 'storyboard-package-deploy', ...deploymentRequest });
                }
              }}
              onGenerateMedia={(request) => {
                const mediaRequest = {
                  ...(request || {}),
                  nodeId,
                  projectId,
                  storyboardPackage,
                };
                if (onGeneratePackageMedia) {
                  onGeneratePackageMedia(mediaRequest);
                } else {
                  onTask?.({ type: 'storyboard-shotgroup-media', ...mediaRequest });
                }
              }}
            />
          )}
        </main>

        <footer className="sb-statusbar" aria-hidden="true">
          {`节点 ${node.id} · sourceMode: ${storyboardPackage.sourceMode} · shotGroups: ${shotGroupCount} · 总时长: ${totalSeconds.toFixed(1)}s`}
        </footer>
      </div>
    </div>
  );
}
