import React from 'react';
import { ShotProductionWorkspace } from './components/ShotProductionWorkspace.jsx';
import { canvasActions } from '../../../shared/store/canvasStore.js';
import { storyboardPackageActions } from '../../../shared/store/storyboardPackageStore.js';
import { runScriptToShotGroups, runShotGroupPromptInference } from '../storyboardOrchestrator.js';
import {
  SHOTGROUP_PROMPT_INFERENCE_TAG,
  SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE,
} from '../promptInference.js';
import {
  DEFAULT_PROMPT_INFERENCE_CONCURRENCY,
  createPromptInferenceQueueId,
  initialPromptInferenceQueueItems,
  promptInferenceGroupsToRun,
} from '../promptInferenceQueue.js';
import {
  DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID,
  SHOTGROUP_PROMPT_TEMPLATE_GROUPS,
  getShotGroupPromptTemplateDefinition,
  getShotGroupPromptTemplateOptions,
} from '../promptTemplateRegistry.js';
import { isWorkbenchTaskActive, TaskProgressBadge } from './components/TaskProgressPanel.jsx';
import { PromptInferenceQueueModal } from './components/PromptInferenceQueueModal.jsx';

export const SHOT_BREAKDOWN_DESIGN_WIDTH = 1520;

export function calculateShotBreakdownScale(width, designWidth = SHOT_BREAKDOWN_DESIGN_WIDTH) {
  const available = Number(width);
  const target = Number(designWidth);
  if (!Number.isFinite(available) || available <= 0 || !Number.isFinite(target) || target <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(0.1, available / target));
}

function useShotBreakdownScale() {
  const ref = React.useRef(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === 'undefined') return undefined;

    let frame = 0;
    const update = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const nextScale = calculateShotBreakdownScale(element.clientWidth);
        setScale((current) => (
          Math.abs(current - nextScale) > 0.001 ? nextScale : current
        ));
      });
    };

    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(element);
      return () => {
        observer.disconnect();
        if (frame) window.cancelAnimationFrame(frame);
      };
    }

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const frameStyle = React.useMemo(() => {
    const safeScale = scale > 0 ? scale : 1;
    const inverse = 1 / safeScale;
    return {
      transform: `scale(${safeScale})`,
      width: `${inverse * 100}%`,
      height: `${inverse * 100}%`,
    };
  }, [scale]);

  return { ref, frameStyle };
}

function shotGroupsFromNodeAndPackage(node, storyboardPackage) {
  if (Array.isArray(storyboardPackage?.shotGroups) && storyboardPackage.shotGroups.length) {
    return storyboardPackage.shotGroups;
  }
  return Array.isArray(node.shotGroups) ? node.shotGroups : [];
}

function storyboardPackageFromNode(node = {}) {
  return node.storyboardPackage || node.state?.storyboardPackage || {};
}

function resolveShotGroupsUpdate(update, currentGroups = []) {
  const baseGroups = Array.isArray(currentGroups) ? currentGroups : [];
  const nextGroups = typeof update === 'function' ? update(baseGroups) : update;
  return Array.isArray(nextGroups) ? nextGroups : baseGroups;
}

function flattenShotGroups(shotGroups = []) {
  return shotGroups.flatMap((group) => (
    Array.isArray(group?.shots) ? group.shots : []
  ));
}

function shotGroupId(group = {}) {
  return String(group.groupId || group.shotGroupId || group.id || '').trim();
}

function normalizeTargetDuration(value, fallback = 15) {
  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(8, Math.min(15, numeric));
}

const TARGET_DURATION_COMMIT_DELAY_MS = 160;

function targetDurationFromNode(node = {}) {
  if (node.targetDuration !== undefined) return normalizeTargetDuration(node.targetDuration);
  const legacyMatch = String(node.shotEngine || '').match(/\d+/);
  return normalizeTargetDuration(legacyMatch ? legacyMatch[0] : 15);
}

function hasStoredTargetDuration(node = {}) {
  return node.targetDuration !== undefined || /\d+/.test(String(node.shotEngine || ''));
}

const ACTIVE_GROUP_PROMPT_STATUSES = new Set(['pending', 'queued', 'running']);

export function ShotsTab({
  nodeId,
  projectId,
  node = {},
  storyboardPackage,
  assets = {},
  selectedModel,
  task,
  onTask,
  onStopPromptInferenceQueue,
  onCancelPromptInferenceRunning,
  onCancelPromptInferenceQueueTask,
}) {
  const shotGroups = shotGroupsFromNodeAndPackage(node, storyboardPackage);
  const shotScale = useShotBreakdownScale();
  const [targetDuration, setTargetDuration] = React.useState(() => targetDurationFromNode(node));
  const targetDurationRef = React.useRef(targetDuration);
  const targetDurationCommitTimerRef = React.useRef(0);
  const lastCommittedTargetDurationRef = React.useRef(
    hasStoredTargetDuration(node) ? targetDurationFromNode(node) : null,
  );
  const scriptText = node.scriptText || node.scriptSourceText || '';
  const aspectRatio = node.aspectRatio || node.targetAspectRatio || node.outputAspectRatio || 'auto';
  const initialTemplate = getShotGroupPromptTemplateDefinition(
    node.shotGroupPromptTemplateId
    || node.promptTemplateId
    || DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID,
    { aspectRatio },
  );
  const [promptCategory, setPromptCategory] = React.useState(() => initialTemplate?.category || 'grok');
  const [promptTemplateId, setPromptTemplateId] = React.useState(() => initialTemplate?.id || DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID);
  const promptTemplateOptions = React.useMemo(
    () => getShotGroupPromptTemplateOptions(promptCategory),
    [promptCategory],
  );
  const selectedPromptTemplate = React.useMemo(
    () => getShotGroupPromptTemplateDefinition(promptTemplateId, { aspectRatio }),
    [aspectRatio, promptTemplateId],
  );
  const generationTaskIds = ['script-to-shotgroups', 'shotgroup-prompts'];
  const shotsBusy = isWorkbenchTaskActive(task, 'script-to-shotgroups');
  const promptsBusy = isWorkbenchTaskActive(task, SHOTGROUP_PROMPT_INFERENCE_TAG);
  const [queueModalOpen, setQueueModalOpen] = React.useState(false);
  const disableSingleGroupPrompts = React.useCallback((group = {}) => {
    const groupStatus = String(group.promptStatus || '').trim().toLowerCase();
    return shotsBusy || !selectedModel || ACTIVE_GROUP_PROMPT_STATUSES.has(groupStatus);
  }, [selectedModel, shotsBusy]);

  const clearTargetDurationCommitTimer = React.useCallback(() => {
    if (!targetDurationCommitTimerRef.current) return;
    clearTimeout(targetDurationCommitTimerRef.current);
    targetDurationCommitTimerRef.current = 0;
  }, []);

  const setLocalTargetDuration = React.useCallback((value) => {
    const nextDuration = normalizeTargetDuration(value);
    targetDurationRef.current = nextDuration;
    setTargetDuration((current) => (current === nextDuration ? current : nextDuration));
    return nextDuration;
  }, []);

  const commitTargetDuration = React.useCallback((value = targetDurationRef.current) => {
    const nextDuration = normalizeTargetDuration(value);
    clearTargetDurationCommitTimer();
    targetDurationRef.current = nextDuration;
    setTargetDuration((current) => (current === nextDuration ? current : nextDuration));
    if (!nodeId || lastCommittedTargetDurationRef.current === nextDuration) return;
    lastCommittedTargetDurationRef.current = nextDuration;
    canvasActions.updateNode(nodeId, {
      targetDuration: nextDuration,
      shotEngine: `${nextDuration}s`,
    });
  }, [clearTargetDurationCommitTimer, nodeId]);

  const scheduleTargetDurationCommit = React.useCallback((value) => {
    const nextDuration = normalizeTargetDuration(value);
    clearTargetDurationCommitTimer();
    if (!nodeId) return;
    targetDurationCommitTimerRef.current = setTimeout(() => {
      targetDurationCommitTimerRef.current = 0;
      commitTargetDuration(nextDuration);
    }, TARGET_DURATION_COMMIT_DELAY_MS);
  }, [clearTargetDurationCommitTimer, commitTargetDuration, nodeId]);

  const handleTargetDurationInput = React.useCallback((event) => {
    const nextDuration = setLocalTargetDuration(event.currentTarget.value);
    scheduleTargetDurationCommit(nextDuration);
  }, [scheduleTargetDurationCommit, setLocalTargetDuration]);

  const flushTargetDurationCommit = React.useCallback(() => {
    commitTargetDuration(targetDurationRef.current);
  }, [commitTargetDuration]);

  React.useEffect(() => {
    if (!nodeId || hasStoredTargetDuration(node)) return;
    commitTargetDuration(targetDurationRef.current);
  }, [commitTargetDuration, node, nodeId]);

  React.useEffect(() => () => {
    clearTargetDurationCommitTimer();
  }, [clearTargetDurationCommitTimer]);

  React.useEffect(() => {
    if (!nodeId || !selectedPromptTemplate) return;
    canvasActions.updateNode(nodeId, {
      shotGroupPromptCategory: promptCategory,
      shotGroupPromptTemplateId: selectedPromptTemplate.id,
      shotGroupPromptTemplateKey: selectedPromptTemplate.key,
      shotGroupPromptOutputMode: selectedPromptTemplate.outputMode,
    });
  }, [nodeId, promptCategory, selectedPromptTemplate]);

  React.useEffect(() => {
    if (!promptTemplateOptions.length) return;
    if (
      selectedPromptTemplate?.id
      && selectedPromptTemplate.id !== promptTemplateId
      && promptTemplateOptions.some((item) => item.id === selectedPromptTemplate.id)
    ) {
      setPromptTemplateId(selectedPromptTemplate.id);
      return;
    }
    if (promptTemplateOptions.some((item) => item.id === promptTemplateId)) return;
    setPromptTemplateId(promptTemplateOptions[0].id);
  }, [promptTemplateId, promptTemplateOptions, selectedPromptTemplate]);

  const handlePromptCategoryChange = (event) => {
    const category = event.currentTarget.value;
    const options = getShotGroupPromptTemplateOptions(category);
    const preferred = category === 'director-storyboard'
      ? getShotGroupPromptTemplateDefinition('director-storyboard.dual', { aspectRatio })
      : null;
    setPromptCategory(category);
    setPromptTemplateId(
      preferred && options.some((item) => item.id === preferred.id)
        ? preferred.id
        : options[0]?.id || DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID,
    );
  };

  const persistShotGroups = React.useCallback((update) => {
    if (!nodeId) return;
    canvasActions.updateNode(nodeId, (currentNode = {}) => {
      const currentGroups = shotGroupsFromNodeAndPackage(
        currentNode,
        storyboardPackageFromNode(currentNode),
      );
      const updated = resolveShotGroupsUpdate(update, currentGroups.length ? currentGroups : shotGroups);
      const flatShots = flattenShotGroups(updated);
      return {
        shotGroups: updated,
        shots: flatShots.map((shot, index) => ({ ...shot, n: index + 1 })),
      };
    });
    storyboardPackageActions.updateNodePackage(nodeId, {
      projectId,
      updater: (pkg) => ({
        shotGroups: resolveShotGroupsUpdate(update, (
          Array.isArray(pkg?.shotGroups) && pkg.shotGroups.length
            ? pkg.shotGroups
            : shotGroups
        )),
      }),
    });
  }, [nodeId, projectId, shotGroups]);

  const handleUpdateShot = (groupId, nextShot) => {
    persistShotGroups((currentGroups) => currentGroups.map((g) => {
      if (shotGroupId(g) !== groupId) return g;
      return {
        ...g,
        shots: g.shots.map((s) => s.id === nextShot.id ? { ...s, ...nextShot, updatedAt: new Date().toISOString() } : s),
      };
    }));
  };

  const handleUpdateGroup = (groupId, patch = {}) => {
    persistShotGroups((currentGroups) => currentGroups.map((g) => {
      if (shotGroupId(g) !== groupId) return g;
      return {
        ...g,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const handleDeleteShot = (groupId, shotId) => {
    if (!window.confirm('确认删除该分镜？')) return;
    persistShotGroups((currentGroups) => currentGroups.map((g) => {
      if (shotGroupId(g) !== groupId) return g;
      return { ...g, shots: g.shots.filter((s) => (s.id || s.shotId || s.shotNumber) !== shotId) };
    }));
  };

  const handleGenerateShots = async () => {
    if (!scriptText.trim()) {
      onTask?.({ id: 'script-to-shotgroups', error: '请先在「内容输入」准备标准剧本' });
      return;
    }
    if (!selectedModel) {
      onTask?.({ id: 'script-to-shotgroups', error: '请先在顶部选择一个 Chat 模型' });
      return;
    }
    const hasAssets = (assets.keyCharacters || []).length > 0
      || (assets.sceneAnalysis || []).length > 0
      || (assets.keyProps || []).length > 0;
    if (!hasAssets) {
      const ok = window.confirm('当前项目没有角色 / 场景 / 道具资产，建议先到「资产配置」执行「解析原文」。是否仍继续？');
      if (!ok) return;
    }
    onTask?.({ id: 'script-to-shotgroups', stage: '准备…', progress: 0 });
    const result = await runScriptToShotGroups({
      scriptText,
      strategicGuide: {
        keyCharacters: assets.keyCharacters || [],
        keyProps: assets.keyProps || [],
        sceneAnalysis: assets.sceneAnalysis || [],
      },
      projectId,
      nodeId,
      model: selectedModel,
      targetDuration,
      onProgress: (p) => onTask?.({ id: 'script-to-shotgroups', ...p }),
    });
    if (!result.ok) onTask?.({ id: 'script-to-shotgroups', error: result.error || '失败' });
  };

  const markPromptSubmitFailures = (failures = []) => {
    const failedByGroupId = new Map(failures.map(({ groupId, error }) => [groupId, error]));
    if (!failedByGroupId.size) return;
    const updatedAt = new Date().toISOString();
    persistShotGroups((currentGroups) => currentGroups.map((group) => {
      const groupId = shotGroupId(group);
      if (!failedByGroupId.has(groupId)) return group;
      return {
        ...group,
        promptStatus: 'failed',
        promptProgress: 100,
        promptStage: failedByGroupId.get(groupId) || '提示词推理任务提交失败',
        promptError: failedByGroupId.get(groupId),
        promptUpdatedAt: updatedAt,
      };
    }));
  };

  const markPromptGroupsReady = (groupsToRun = [], initialGroups = []) => {
    const pendingIds = new Set(groupsToRun.map((group) => shotGroupId(group)).filter(Boolean));
    const queuedIds = new Set(initialGroups.map((group) => shotGroupId(group)).filter(Boolean));
    if (!pendingIds.size) return;
    const updatedAt = new Date().toISOString();
    persistShotGroups((currentGroups) => currentGroups.map((group) => {
      const groupId = shotGroupId(group);
      if (!pendingIds.has(groupId)) return group;
      const queued = queuedIds.has(groupId);
      return {
        ...group,
        promptStatus: queued ? 'queued' : 'pending',
        promptProgress: queued ? 1 : 0,
        promptStage: queued ? '提交提示词推理中…' : '等待前序分组完成…',
        promptError: '',
        promptUpdatedAt: updatedAt,
      };
    }));
  };

  const submitPromptInferenceGroup = async ({
    group,
    groups,
    groupsToRun,
    groupIndex,
    queueId,
    autoContinue,
    concurrency,
    queueMode = 'parallel',
  }) => {
    const batchGroups = (Array.isArray(groups) && groups.length ? groups : [group]).filter(Boolean);
    const firstGroup = batchGroups[0] || group;
    const batchGroupIds = batchGroups.map((item, index) => (
      shotGroupId(item) || `G${String(groupIndex + index + 1).padStart(3, '0')}`
    ));
    const groupId = batchGroupIds[0] || shotGroupId(firstGroup) || `G${String(groupIndex + 1).padStart(3, '0')}`;
    const groupLabel = batchGroupIds.length > 1
      ? `${batchGroupIds[0]}~${batchGroupIds[batchGroupIds.length - 1]}`
      : groupId;
    const total = Math.max(1, groupsToRun.length);
    const queue = {
      queueId,
      index: groupIndex + 1,
      total,
      groupId: groupLabel,
      kind: 'prompt',
      batchSize: batchGroups.length,
    };
    return runShotGroupPromptInference({
      shotGroup: firstGroup,
      shotGroups: batchGroups,
      assets,
      previousAnchor: null,
      directorAnalysis: storyboardPackage?.generationPlan?.directorAnalysis || node.directorAnalysis || '',
      styleDirective: node.styleDirective || '',
      scriptText,
      aspectRatio,
      projectId,
      nodeId,
      model: selectedModel,
      targetDuration,
      allShotGroups: groupsToRun,
      groupIndex,
      groupTotal: total,
      promptTemplateId: selectedPromptTemplate?.id || promptTemplateId,
      promptTemplateKey: selectedPromptTemplate?.key || '',
      promptOutputMode: selectedPromptTemplate?.outputMode || 'dual',
      promptQueueId: queueId,
      promptQueueMode: queueMode,
      promptQueueConcurrency: concurrency,
      shotGroupAutoContinue: autoContinue,
      onProgress: (payload) => onTask?.({
        id: SHOTGROUP_PROMPT_INFERENCE_TAG,
        ...payload,
        queue,
      }),
    });
  };

  const handleGeneratePrompts = async () => {
    if (!shotGroups.length) {
      onTask?.({ id: SHOTGROUP_PROMPT_INFERENCE_TAG, error: '请先生成分镜组，再执行提示词推理' });
      return;
    }
    if (!selectedModel) {
      onTask?.({ id: SHOTGROUP_PROMPT_INFERENCE_TAG, error: '请先在顶部选择一个 Chat 模型' });
      return;
    }
    const groupsToRun = promptInferenceGroupsToRun(shotGroups);
    if (!groupsToRun.length) {
      onTask?.({
        id: SHOTGROUP_PROMPT_INFERENCE_TAG,
        stage: '所有分组提示词已完成',
        progress: 100,
      });
      return;
    }
    const queueId = createPromptInferenceQueueId(nodeId || 'storyboard');
    const concurrency = DEFAULT_PROMPT_INFERENCE_CONCURRENCY;
    const initialItems = initialPromptInferenceQueueItems(groupsToRun, {
      concurrency,
      batchSize: SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE,
    });
    const initialGroups = initialItems.flatMap((item) => item.groups || [item.group].filter(Boolean));
    markPromptGroupsReady(groupsToRun, initialGroups);
    const firstGroupId = shotGroupId(initialGroups[0]) || 'G001';
    const lastGroupId = shotGroupId(initialGroups[initialGroups.length - 1]) || firstGroupId;
    const batchLabel = initialGroups.length > 1 ? `${firstGroupId}~${lastGroupId}` : firstGroupId;
    const queue = {
      queueId,
      index: 1,
      total: groupsToRun.length,
      groupId: batchLabel,
      kind: 'prompt',
      batchSize: initialGroups.length,
    };
    onTask?.({
      id: SHOTGROUP_PROMPT_INFERENCE_TAG,
      stage: `提交前 ${initialGroups.length} 个分组提示词推理任务…`,
      progress: 0,
      queue,
    });
    const results = await Promise.all(initialItems.map(async ({ group, groups, index }) => {
      const result = await submitPromptInferenceGroup({
        group,
        groups,
        groupsToRun,
        groupIndex: index,
        queueId,
        autoContinue: true,
        concurrency,
        queueMode: 'parallel',
      });
      return {
        groupIds: (groups || [group]).map((item) => shotGroupId(item)).filter(Boolean),
        result,
      };
    }));
    const failures = results
      .filter(({ result }) => !result?.ok)
      .flatMap(({ groupIds, result }) => groupIds.map((groupId) => ({
        groupId,
        error: result?.error || '提示词推理任务提交失败',
      })));
    if (failures.length) {
      markPromptSubmitFailures(failures);
      onTask?.({
        id: SHOTGROUP_PROMPT_INFERENCE_TAG,
        ...(failures.length === initialItems.length ? { error: '提示词推理队列提交失败' } : { stage: `已跳过 ${failures.length} 个提交失败的分组，队列继续等待回调…` }),
        queue,
      });
    }
  };

  const handleGenerateGroupPrompts = async (groupId) => {
    if (!selectedModel) {
      onTask?.({ id: SHOTGROUP_PROMPT_INFERENCE_TAG, error: '请先在顶部选择一个 Chat 模型' });
      return;
    }
    const groupsToRun = promptInferenceGroupsToRun(shotGroups, {
      includeCompleted: true,
      groupId,
    });
    const targetGroup = groupsToRun[0];
    if (!targetGroup) {
      onTask?.({ id: SHOTGROUP_PROMPT_INFERENCE_TAG, error: '没有找到要生成的分镜组' });
      return;
    }
    const queueId = createPromptInferenceQueueId(`${nodeId || 'storyboard'}-retry-${groupId}`);
    const queue = {
      queueId,
      index: 1,
      total: 1,
      groupId,
      kind: 'prompt',
      batchSize: 1,
    };
    onTask?.({
      id: SHOTGROUP_PROMPT_INFERENCE_TAG,
      stage: `将 ${groupId} 加入提示词重试队列…`,
      progress: 0,
      queue,
    });
    markPromptGroupsReady([targetGroup], [targetGroup]);
    const result = await submitPromptInferenceGroup({
      group: targetGroup,
      groups: [targetGroup],
      groupsToRun,
      groupIndex: 0,
      queueId,
      autoContinue: false,
      concurrency: 1,
      queueMode: 'parallel',
    });
    if (!result.ok) {
      markPromptSubmitFailures([{ groupId, error: result.error || '提示词推理任务提交失败' }]);
      onTask?.({
        id: SHOTGROUP_PROMPT_INFERENCE_TAG,
        error: result.error || '提示词推理任务提交失败',
        queue,
      });
    }
  };

  const control = (
    <div className="sb-shot-controls">
      <div>
        <h2>分镜拆解</h2>
        <p>使用标准剧本和已配置资产生成镜头组。</p>
      </div>
      <div className="sb-shot-control-actions">
        <div className="sb-shot-param-panel">
          <label className="sb-duration-slider">
            <span>目标时长 <strong>{targetDuration}s</strong></span>
            <input
              type="range"
              min="8"
              max="15"
              step="1"
              value={targetDuration}
              onInput={handleTargetDurationInput}
              onChange={handleTargetDurationInput}
              onPointerUp={flushTargetDurationCommit}
              onMouseUp={flushTargetDurationCommit}
              onTouchEnd={flushTargetDurationCommit}
              onKeyUp={flushTargetDurationCommit}
              onBlur={flushTargetDurationCommit}
            />
          </label>
          <div className="sb-prompt-template-controls">
            <label>
              <span>提示词类型</span>
              <select
                value={promptCategory}
                onChange={handlePromptCategoryChange}
                disabled={promptsBusy}
              >
                {SHOTGROUP_PROMPT_TEMPLATE_GROUPS.map((group) => (
                  <option key={group.id} value={group.id}>{group.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>模板</span>
              <select
                value={promptTemplateId}
                onChange={(event) => setPromptTemplateId(event.currentTarget.value)}
                disabled={promptsBusy || promptTemplateOptions.length === 0}
              >
                {promptTemplateOptions.map((template) => (
                  <option key={template.id} value={template.id}>{template.title}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="sb-shot-action-panel">
          <button
            type="button"
            className={`sb-tool-btn primary ${shotsBusy ? 'is-loading' : ''}`}
            onClick={handleGenerateShots}
            disabled={shotsBusy || promptsBusy}
          >
            {shotsBusy && <span className="sb-btn-spinner" aria-hidden="true" />}
            {shotsBusy ? '生成中' : 'V3 生成分镜'}
          </button>
          <button
            type="button"
            className={`sb-tool-btn ${promptsBusy ? 'is-loading' : ''}`}
            onClick={handleGeneratePrompts}
            disabled={shotsBusy || promptsBusy || shotGroups.length === 0}
          >
            {promptsBusy && <span className="sb-btn-spinner" aria-hidden="true" />}
            {promptsBusy ? '推理中' : '提示词推理'}
          </button>
          <button
            type="button"
            className="sb-tool-btn"
            onClick={() => setQueueModalOpen(true)}
            disabled={shotGroups.length === 0}
          >
            任务队列
          </button>
          <TaskProgressBadge task={task} taskIds={generationTaskIds} className="inline" />
        </div>
      </div>
      <PromptInferenceQueueModal
        open={queueModalOpen}
        shotGroups={shotGroups}
        task={task}
        onClose={() => setQueueModalOpen(false)}
        onStopQueue={(summary) => onStopPromptInferenceQueue?.({ ...summary, nodeId, task })}
        onCancelRunning={(summary) => onCancelPromptInferenceRunning?.({ ...summary, nodeId, task })}
        onCancelTask={(request) => onCancelPromptInferenceQueueTask?.({ ...request, nodeId, task })}
      />
    </div>
  );

  if (shotGroups.length === 0) {
    return (
      <section className="sb-shots-layout" ref={shotScale.ref}>
        <div className="sb-shots-scale-frame" style={shotScale.frameStyle}>
          {control}
          <div className="sb-empty-step-placeholder">
            <strong>还没有分镜组</strong>
            请先在「内容输入」准备标准剧本，再点击「V3 生成分镜」。
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sb-shots-layout" ref={shotScale.ref}>
      <div className="sb-shots-scale-frame" style={shotScale.frameStyle}>
        {control}
        <div className="sb-shot-scroll">
          <ShotProductionWorkspace
            shotGroups={shotGroups}
            assets={assets}
            onGeneratePrompts={handleGenerateGroupPrompts}
            disableGeneratePrompts={disableSingleGroupPrompts}
            onUpdateGroup={handleUpdateGroup}
            onUpdateShot={handleUpdateShot}
            onDeleteShot={handleDeleteShot}
          />
        </div>
      </div>
    </section>
  );
}
