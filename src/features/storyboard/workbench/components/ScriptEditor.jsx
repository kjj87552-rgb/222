import React from 'react';

/* Lightweight script editor — mono textarea + smart-hint banner.
 * Phase 2A intentionally avoids syntax-highlight overlays (CodeMirror/Monaco)
 * to keep the dependency surface small. Phase 2B may upgrade. */
export function ScriptEditor({
  value,
  onChange,
  scriptKind,
  placeholder = '在这里粘贴或编辑剧本…\n\n标准格式示例：\n### 1-1\n**场：** 旧书店 · 黄昏 · 内\n**人：** 林夏\n△ 林夏推门，铜铃响起。\n林夏（轻声）：你好。\n【1卡】',
  maxLength,
  counter,
  warning,
}) {
  const hint = React.useMemo(() => {
    if (scriptKind === 'standard') return null;
    if (scriptKind === 'loose-script') {
      return {
        cls: 'kind-loose',
        text: '检测到「非标准剧本」。建议先点击「格式标准化」整理后再进入后续流程。',
      };
    }
    if (scriptKind === 'prose') {
      return {
        cls: 'kind-prose',
        text: '检测到「散文小说」。建议先点击「小说→剧本」拆分成场景和对白。',
      };
    }
    return null;
  }, [scriptKind]);

  return (
    <div>
      {hint && (
        <div className={`sb-hint-banner ${hint.cls}`} role="status">
          {hint.text}
        </div>
      )}
      <textarea
        className="sb-script-editor"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        spellCheck={false}
      />
      {counter && (
        <div className={`sb-script-editor-meta ${counter.tone || ''}`}>
          <span>{counter.current} / {counter.max} 字</span>
          {counter.note && <span>{counter.note}</span>}
        </div>
      )}
      {warning && (
        <div className="sb-script-limit-warning" role="alert">
          {warning}
        </div>
      )}
    </div>
  );
}
