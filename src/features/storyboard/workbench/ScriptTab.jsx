import React from 'react';
import { ICheck, IMagic } from '../../../shared/ui/icons/index.jsx';
import { ScriptEditor } from './components/ScriptEditor.jsx';
import { canvasActions } from '../../../shared/store/canvasStore.js';
import { detectScriptKind } from '../scriptKindDetection.js';
import {
  runNovelToScript,
  runScriptFormatter,
} from '../storyboardOrchestrator.js';
import { isWorkbenchTaskActive, TaskProgressBadge } from './components/TaskProgressPanel.jsx';
import {
  countScriptInputChars,
  SCRIPT_INPUT_MAX_LENGTH,
  SCRIPT_INPUT_NEXT_STEP_LIMIT,
  truncateScriptInput,
} from './scriptInputLimits.js';

function initialSourceText(node) {
  return truncateScriptInput(node.scriptSourceText ?? node.rawScriptText ?? node.scriptText ?? '');
}

export function ScriptTab({ nodeId, projectId, node, selectedModel, task, onTask }) {
  const [sourceText, setSourceText] = React.useState(() => initialSourceText(node));
  const [standardText, setStandardText] = React.useState(node.scriptText || '');
  const latestTextRef = React.useRef({ sourceText, standardText });

  latestTextRef.current = { sourceText, standardText };

  const persistScriptState = React.useCallback((nextSourceText, nextStandardText) => {
    latestTextRef.current = {
      sourceText: nextSourceText,
      standardText: nextStandardText,
    };
    if (!nodeId) return;
    canvasActions.updateNode(nodeId, {
      scriptSourceText: nextSourceText,
      scriptText: nextStandardText,
    });
  }, [nodeId]);

  const handleSourceTextChange = React.useCallback((nextSourceText) => {
    const limitedSourceText = truncateScriptInput(nextSourceText);
    setSourceText(limitedSourceText);
    persistScriptState(limitedSourceText, latestTextRef.current.standardText);
  }, [persistScriptState]);

  const handleStandardTextChange = React.useCallback((nextStandardText) => {
    setStandardText(nextStandardText);
    persistScriptState(latestTextRef.current.sourceText, nextStandardText);
  }, [persistScriptState]);

  React.useEffect(() => {
    const nextSourceText = initialSourceText(node);
    const nextStandardText = node.scriptText || '';
    latestTextRef.current = {
      sourceText: nextSourceText,
      standardText: nextStandardText,
    };
    setSourceText(nextSourceText);
    setStandardText(nextStandardText);
  }, [node.id]);

  React.useEffect(() => {
    const nextStandardText = node.scriptText || '';
    latestTextRef.current = {
      ...latestTextRef.current,
      standardText: nextStandardText,
    };
    setStandardText(nextStandardText);
  }, [node.scriptText]);

  React.useEffect(() => () => {
    if (!nodeId) return;
    canvasActions.updateNode(nodeId, {
      scriptSourceText: latestTextRef.current.sourceText,
      scriptText: latestTextRef.current.standardText,
    });
  }, [nodeId]);

  const scriptKind = React.useMemo(() => detectScriptKind(sourceText), [sourceText]);
  const sourceInputCharCount = countScriptInputChars(sourceText);
  const sourceInputOverNextStepLimit = sourceInputCharCount > SCRIPT_INPUT_NEXT_STEP_LIMIT;
  const sourceInputCounter = React.useMemo(() => ({
    current: sourceInputCharCount,
    max: SCRIPT_INPUT_MAX_LENGTH,
    note: `下一步上限 ${SCRIPT_INPUT_NEXT_STEP_LIMIT} 字`,
    tone: sourceInputOverNextStepLimit ? 'over-limit' : '',
  }), [sourceInputCharCount, sourceInputOverNextStepLimit]);
  const sourceInputWarning = sourceInputOverNextStepLimit
    ? `当前 ${sourceInputCharCount} 字，超过 ${SCRIPT_INPUT_NEXT_STEP_LIMIT} 字后不能进入下一步。`
    : '';
  const novelBusy = isWorkbenchTaskActive(task, 'novel-to-script');
  const formatterBusy = isWorkbenchTaskActive(task, 'script-formatter');
  const commandBusy = novelBusy || formatterBusy;

  const flushScriptState = React.useCallback(() => {
    persistScriptState(sourceText, standardText);
  }, [persistScriptState, sourceText, standardText]);

  const requireReady = (emptyMsg) => {
    if (!sourceText.trim()) {
      onTask?.({ id: 'no-input', error: emptyMsg });
      return false;
    }
    if (!selectedModel) {
      onTask?.({ id: 'no-model', error: '请先选择一个 Chat 模型（顶部下拉）' });
      return false;
    }
    return true;
  };

  const handleNovelToScript = async () => {
    if (!requireReady('请先粘贴小说文本')) return;
    flushScriptState();
    onTask?.({ id: 'novel-to-script', stage: '准备…', progress: 0 });
    const result = await runNovelToScript({
      novelText: sourceText,
      projectId,
      nodeId,
      model: selectedModel,
      onProgress: (p) => onTask?.({ id: 'novel-to-script', ...p }),
    });
    if (!result.ok) onTask?.({ id: 'novel-to-script', error: result.error || '失败' });
  };

  const handleScriptFormatter = async () => {
    if (!requireReady('请先粘贴或编辑剧本')) return;
    flushScriptState();
    onTask?.({ id: 'script-formatter', stage: '准备…', progress: 0 });
    const result = await runScriptFormatter({
      rawScript: sourceText,
      projectId,
      nodeId,
      model: selectedModel,
      onProgress: (p) => onTask?.({ id: 'script-formatter', ...p }),
    });
    if (!result.ok) onTask?.({ id: 'script-formatter', error: result.error || '失败' });
  };

  return (
    <div className="sb-script-layout" data-busy={commandBusy ? 'true' : 'false'}>
      <div className="sb-script-command-strip" data-busy={commandBusy ? 'true' : 'false'}>
        <button
          type="button"
          className={`sb-tool-btn primary ${novelBusy ? 'is-loading' : ''}`}
          onClick={handleNovelToScript}
          disabled={novelBusy}
          aria-label="小说转剧本"
        >
          <span className="btn-icon" aria-hidden="true">
            {novelBusy ? <span className="sb-btn-spinner" /> : <IMagic size={15} />}
          </span>
          <span>{novelBusy ? '生成中' : '小说→剧本'}</span>
        </button>
        <button
          type="button"
          className={`sb-tool-btn warning ${formatterBusy ? 'is-loading' : ''}`}
          onClick={handleScriptFormatter}
          disabled={formatterBusy}
          aria-label="格式标准化"
        >
          <span className="btn-icon" aria-hidden="true">
            {formatterBusy ? <span className="sb-btn-spinner" /> : <ICheck size={15} />}
          </span>
          <span>{formatterBusy ? '标准化中' : '格式标准化'}</span>
        </button>
        <TaskProgressBadge task={task} taskIds={['novel-to-script', 'script-formatter']} className="inline" />
      </div>
      <div className="sb-script-split">
        <section className="sb-script-pane">
          <div className="sb-script-pane-head">
            <h3>原文 / 自有剧本</h3>
          </div>
          <ScriptEditor
            value={sourceText}
            onChange={handleSourceTextChange}
            scriptKind={scriptKind}
            placeholder="在这里粘贴小说原文，或粘贴你已有的剧本..."
            maxLength={SCRIPT_INPUT_MAX_LENGTH}
            counter={sourceInputCounter}
            warning={sourceInputWarning}
          />
        </section>
        <section className="sb-script-pane">
          <div className="sb-script-pane-head">
            <h3>标准化剧本</h3>
          </div>
          <ScriptEditor
            value={standardText}
            onChange={handleStandardTextChange}
            scriptKind="standard"
            placeholder={'标准格式示例：\n### 1-1\n**场：** 旧书店 · 黄昏 · 内\n**人：** 林夏\n△ 林夏推门，铜铃响起。\n林夏（轻声）：你好。\n【1卡】'}
          />
        </section>
      </div>
    </div>
  );
}
