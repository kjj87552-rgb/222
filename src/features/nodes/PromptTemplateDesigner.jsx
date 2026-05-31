import React from 'react';
import { createPortal } from 'react-dom';
import { PromptStore } from '../../shared/platform/promptStore.js';
import { ICheck, IPlay, ITrash } from '../../shared/ui/icons/index.jsx';
import {
  buildPromptTemplateCreatePayload,
  buildPromptTemplateUpdatePayload,
  mergePromptTemplateInput,
  normalizePromptTemplate,
} from './promptRunnerUtils.js';
import { duplicateOfficialTemplateDraft } from './promptTemplateLibrary.js';

const EMPTY_DRAFT = {
  id: '',
  title: '',
  description: '',
  prompt: '',
  source: 'user',
  readonly: false,
};

function normalizeSavedTemplate(record) {
  return normalizePromptTemplate(record);
}

export function PromptTemplateDesigner({
  templates = [],
  selectedTemplateId = '',
  onClose,
  onSaved,
  onDeleted,
  onSelectTemplate,
}) {
  const initial = React.useMemo(() => (
    templates.find((item) => item.id === selectedTemplateId) || templates[0] || EMPTY_DRAFT
  ), [selectedTemplateId, templates]);
  const [draft, setDraft] = React.useState(initial);
  const [sampleInput, setSampleInput] = React.useState('一只猫，赛博风格');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setDraft(initial);
    setError('');
  }, [initial]);

  const chooseTemplate = (template) => {
    setDraft(template);
    setError('');
    onSelectTemplate?.(template);
  };

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch, source: current.source || 'user' }));
  };

  const copyOfficial = () => {
    setDraft(duplicateOfficialTemplateDraft(draft));
    setError('');
  };

  const save = async () => {
    const title = (draft.title || '').trim();
    const prompt = (draft.prompt || '').trim();
    if (!title || !prompt) {
      setError('请填写模板名称和提示词内容');
      return;
    }
    setError('');
    const payload = draft.id && !draft.readonly
      ? buildPromptTemplateUpdatePayload({ ...draft, title, prompt })
      : buildPromptTemplateCreatePayload({ ...draft, title, prompt });
    const saved = draft.id && !draft.readonly
      ? await PromptStore.update(draft.id, payload)
      : await PromptStore.create(payload);
    const normalized = normalizeSavedTemplate(saved);
    setDraft(normalized);
    onSaved?.(saved);
  };

  const remove = async () => {
    if (!draft.id || draft.readonly) return;
    await PromptStore.delete(draft.id);
    onDeleted?.(draft.id);
    setDraft(EMPTY_DRAFT);
  };

  const composed = mergePromptTemplateInput(draft.prompt, sampleInput);

  const designer = (
    <div className="prompt-template-designer-backdrop" onPointerDown={(event) => event.stopPropagation()}>
      <section className="prompt-template-designer" role="dialog" aria-modal="true" aria-label="提示词模板库">
        <header className="prompt-template-designer-head">
          <strong>提示词模板库</strong>
          <button type="button" onClick={onClose}>关闭</button>
        </header>

        <aside className="prompt-template-designer-list">
          <div className="prompt-template-designer-tabs">
            <span>模板</span>
          </div>
          <button type="button" className="prompt-template-new" onClick={() => setDraft(EMPTY_DRAFT)}>
            新建模板
          </button>
          {templates.map((template) => (
            <button
              type="button"
              key={template.id}
              className={template.id === draft.id ? 'active' : ''}
              onClick={() => chooseTemplate(template)}
              title={template.title}
            >
              <strong>{template.readonly ? '官方 ' : ''}{template.title}</strong>
              <span>{template.readonly ? '官方模板' : '用户模板'}</span>
            </button>
          ))}
        </aside>

        <main className="prompt-template-editor">
          <label>
            <span>模板名称</span>
            <input
              name="templateTitle"
              value={draft.title || ''}
              disabled={draft.readonly}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="例如：生图提示词优化器"
            />
          </label>
          <label>
            <span>说明</span>
            <input
              name="templateDescription"
              value={draft.description || ''}
              disabled={draft.readonly}
              onChange={(event) => updateDraft({ description: event.target.value })}
              placeholder="给自己看的用途说明"
            />
          </label>
          <label className="prompt-template-content-field">
            <span>提示词内容</span>
            <textarea
              name="templatePrompt"
              value={draft.prompt || ''}
              disabled={draft.readonly}
              onChange={(event) => updateDraft({ prompt: event.target.value })}
              placeholder="请基于 {{INPUT}} 输出..."
            />
          </label>
          <p className="prompt-template-hint">使用 {'{{INPUT}}'} 或 {'{INPUT}'} 标记上游文本插入位置。</p>
          {error && <div className="prompt-template-error">{error}</div>}
          <div className="prompt-template-actions">
            {draft.readonly && <button type="button" onClick={copyOfficial}>复制为我的模板</button>}
            {!draft.readonly && (
              <button type="button" onClick={save}>
                <ICheck size={13} />
                <span>保存模板</span>
              </button>
            )}
            {!draft.readonly && draft.id && (
              <button type="button" onClick={remove}>
                <ITrash size={13} />
                <span>删除</span>
              </button>
            )}
          </div>
        </main>

        <aside className="prompt-template-preview">
          <label>
            <span>输入样例</span>
            <textarea value={sampleInput} onChange={(event) => setSampleInput(event.target.value)} />
          </label>
          <div className="prompt-template-composed">
            <span>组装预览</span>
            <p>{composed || '选择或新建模板后显示预览。'}</p>
          </div>
          <button type="button" className="prompt-template-test">
            <IPlay size={13} />
            <span>测试运行</span>
          </button>
        </aside>
      </section>
    </div>
  );
  if (typeof document === 'undefined') return designer;
  const portalTarget = document.querySelector('.product-shell') || document.getElementById('root') || document.body;
  return createPortal(designer, portalTarget);
}
