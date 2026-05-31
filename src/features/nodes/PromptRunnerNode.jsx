import React from 'react';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { PromptStore } from '../../shared/platform/promptStore.js';
import { modelLabel, selectBackendModel } from '../../shared/platform/modelSelection.js';
import { IChevD, IPlay, ISparkle } from '../../shared/ui/icons/index.jsx';
import { NodeShell } from './NodeShell.jsx';
import { PromptTemplateDesigner } from './PromptTemplateDesigner.jsx';
import {
  PROMPT_RUNNER_CATEGORY,
  collectPromptRunnerInput,
  mergePromptTemplateInput,
} from './promptRunnerUtils.js';
import { mergePromptTemplateOptions } from './promptTemplateLibrary.js';

function combineLegacyPrompt(node = {}) {
  return [node.systemPrompt, node.userPrompt]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join('\n\n');
}

export function PromptRunnerNode(props) {
  const {
    node,
    allNodes = [],
    edges = [],
    onUpdateNode,
    onGenerate,
  } = props;
  const [templates, setTemplates] = React.useState([]);
  const [templateLoading, setTemplateLoading] = React.useState(false);
  const [designerOpen, setDesignerOpen] = React.useState(false);
  const [models, setModels] = React.useState([]);
  const [modelLoading, setModelLoading] = React.useState(false);
  const [selectedModelId, setSelectedModelId] = React.useState(node.providerModelId || node.modelId || '');
  const [localError, setLocalError] = React.useState('');

  const update = React.useCallback((patch) => {
    onUpdateNode?.(node.id, patch);
  }, [node.id, onUpdateNode]);

  const refreshTemplates = React.useCallback(async () => {
    setTemplateLoading(true);
    try {
      const result = await PromptStore.list({ category: PROMPT_RUNNER_CATEGORY, scope: 'global' });
      setTemplates(mergePromptTemplateOptions(Array.isArray(result?.prompts) ? result.prompts : []));
      setLocalError('');
    } catch (error) {
      setTemplates(mergePromptTemplateOptions([]));
      setLocalError(error instanceof Error ? error.message : '模板加载失败');
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setTemplateLoading(true);
    PromptStore.list({ category: PROMPT_RUNNER_CATEGORY, scope: 'global' })
      .then((result) => {
        if (!cancelled) {
          setTemplates(mergePromptTemplateOptions(Array.isArray(result?.prompts) ? result.prompts : []));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setTemplates(mergePromptTemplateOptions([]));
          setLocalError(error instanceof Error ? error.message : '模板加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) setTemplateLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setModelLoading(true);
    Promise.all([
      ProviderStore.models({ capability: 'inference.generate' }),
      ProviderStore.models({ capability: 'text.reason' }),
      ProviderStore.models({ capability: 'text.generate' }),
    ])
      .then((results) => {
        if (cancelled) return;
        const seen = new Set();
        const next = results
          .flatMap((result) => (Array.isArray(result?.models) ? result.models : []))
          .filter((model) => {
            if (!model?.id || seen.has(model.id) || model.enabled === false) return false;
            seen.add(model.id);
            return true;
          });
        setModels(next);
        const current = next.find((model) => model.id === selectedModelId)
          || selectBackendModel(next, { currentId: selectedModelId, currentLabel: node.model })
          || next[0];
        if (current) setSelectedModelId(current.id);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setModelLoading(false);
      });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedModel = React.useMemo(() => (
    models.find((model) => model.id === selectedModelId)
    || selectBackendModel(models, { currentId: selectedModelId, currentLabel: node.model })
    || models[0]
  ), [models, node.model, selectedModelId]);
  const displayModel = selectedModel ? modelLabel(selectedModel) : (modelLoading ? '加载模型...' : '暂无推理模型');
  const inputPreview = React.useMemo(
    () => collectPromptRunnerInput(node.id, allNodes, edges, node.manualInput || ''),
    [allNodes, edges, node.id, node.manualInput],
  );
  const legacyPrompt = combineLegacyPrompt(node);
  const legacyTemplate = legacyPrompt && node.templateSource !== 'official' ? {
    id: node.templateId || 'legacy-node-template',
    title: node.templateTitle || '旧模板',
    description: node.templateDescription || '',
    prompt: legacyPrompt,
    source: node.templateSource || 'user',
    readonly: false,
  } : null;
  const selectedTemplate = React.useMemo(() => (
    templates.find((template) => template.id === node.templateId) || legacyTemplate || null
  ), [legacyTemplate, node.templateId, templates]);
  const errorText = localError || node.error || '';
  const selectTemplate = React.useCallback((template) => {
    if (!template) return;
    setLocalError('');
    update({
      templateId: template.id,
      templateTitle: template.title,
      templateDescription: template.description,
      templateSource: template.source,
      error: null,
    });
  }, [update]);

  const handleTemplateSaved = React.useCallback(async (saved) => {
    await refreshTemplates();
    if (saved?.id) {
      update({
        templateId: saved.id,
        templateTitle: saved.title || node.templateTitle || '',
        templateSource: 'user',
        error: null,
      });
    }
  }, [node.templateTitle, refreshTemplates, update]);

  const handleTemplateDeleted = React.useCallback(async (templateId) => {
    await refreshTemplates();
    if (templateId && node.templateId === templateId) {
      update({
        templateId: '',
        templateTitle: '',
        templateDescription: '',
        templateSource: '',
        error: null,
      });
    }
  }, [node.templateId, refreshTemplates, update]);

  const chooseModel = (event) => {
    const model = models.find((item) => item.id === event.target.value);
    if (!model) return;
    setSelectedModelId(model.id);
    update({
      providerModelId: model.id,
      modelId: model.id,
      modelName: model.modelName,
      provider: model.providerId,
      model: modelLabel(model),
      error: null,
    });
  };

  const runPrompt = () => {
    if (!selectedTemplate?.prompt) {
      update({ error: '请先选择提示词模板' });
      return;
    }
    if (!inputPreview.trim()) {
      update({ error: '请连接上游文本节点' });
      return;
    }
    if (!selectedModel) {
      update({ error: '请选择可用推理模型' });
      return;
    }
    const finalPrompt = mergePromptTemplateInput(selectedTemplate.prompt, inputPreview);
    const modelDisplay = modelLabel(selectedModel);
    update({
      generating: true,
      progress: 8,
      error: null,
      prompt: finalPrompt,
      composedPrompt: finalPrompt,
      templateTitle: selectedTemplate.title,
      templateSource: selectedTemplate.source,
      model: modelDisplay,
      providerModelId: selectedModel.id,
      modelId: selectedModel.id,
      modelName: selectedModel.modelName,
      provider: selectedModel.providerId,
      body: '',
      output: '',
      parsedOutput: '',
      videoPrompt: '',
      rawOutput: '',
    });
    onGenerate?.({
      tab: 'text',
      type: selectedModel.capability || 'inference.generate',
      capability: selectedModel.capability || 'inference.generate',
      nodeId: node.id,
      prompt: finalPrompt,
      model: modelDisplay,
      modelId: selectedModel.id,
      providerModelId: selectedModel.id,
      modelName: selectedModel.modelName,
      provider: selectedModel.providerId,
      title: node.title || '提示词调用',
      _promptRunner: true,
      _templateId: selectedTemplate.id,
      _templateTitle: selectedTemplate.title,
      _templateDescription: selectedTemplate.description,
    });
  };

  const selectorTemplates = templates.filter((item) => item.id && item.prompt);
  const designerTemplates = templates.filter((item) => item.source !== 'official' && !item.readonly);
  const officialTemplates = selectorTemplates.filter((item) => item.source === 'official' || item.readonly);
  const userTemplates = selectorTemplates.filter((item) => item.source !== 'official' && !item.readonly);
  const customTemplates = legacyTemplate && !templates.some((template) => template.id === legacyTemplate.id)
    ? [...userTemplates, legacyTemplate]
    : userTemplates;
  const selectedOfficialTemplate = selectedTemplate
    && officialTemplates.some((item) => item.id === selectedTemplate.id);
  const selectedCustomTemplate = selectedTemplate
    && customTemplates.some((item) => item.id === selectedTemplate.id);

  return (
    <NodeShell {...props} isEmpty={false} toolbar={null}>
      <div className="prompt-runner-panel" onPointerDown={(event) => event.stopPropagation()}>
        <div className="prompt-runner-status">
          <span className={`prompt-runner-dot ${selectedModel ? 'ready' : ''}`} />
          <strong>提示词调用</strong>
          <em>{node.generating ? `${node.progress || 1}%` : displayModel}</em>
        </div>

        <div className="prompt-runner-template-source prompt-runner-template-dual">
          <label>
            <span>官方提示词</span>
            <select
              name="officialTemplateSelector"
              value={selectedOfficialTemplate ? selectedTemplate.id : ''}
              disabled={templateLoading}
              onChange={(event) => {
                const template = officialTemplates.find((item) => item.id === event.target.value);
                selectTemplate(template);
              }}
            >
              <option value="">{templateLoading ? '加载模板...' : '选择官方提示词'}</option>
              {officialTemplates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
          </label>
          <label>
            <span>自定义提示词</span>
            <select
              name="customTemplateSelector"
              value={selectedCustomTemplate ? selectedTemplate.id : ''}
              disabled={templateLoading}
              onChange={(event) => {
                const template = customTemplates.find((item) => item.id === event.target.value);
                selectTemplate(template);
              }}
            >
              <option value="">{templateLoading ? '加载模板...' : '选择自定义提示词'}</option>
              {customTemplates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="prompt-runner-template-card">
          <strong>{selectedTemplate?.title || '未选择模板'}</strong>
          <p>{selectedTemplate?.description || '从模板库选择一个提示词模板后运行。'}</p>
        </div>

        {errorText && <div className="prompt-runner-error">{errorText}</div>}

        <div className="prompt-runner-bottom">
          <label className="prompt-runner-model" title={displayModel}>
            <select value={selectedModel?.id || selectedModelId} disabled={modelLoading || !models.length} onChange={chooseModel}>
              {!models.length && <option value="">{displayModel}</option>}
              {models.map((model) => (
                <option key={model.id} value={model.id}>{modelLabel(model)}</option>
              ))}
            </select>
            <IChevD size={10} />
          </label>
          <button type="button" data-action="open-template-designer" onClick={() => setDesignerOpen(true)}>
            <ISparkle size={11} />
            <span>管理模板</span>
          </button>
          <button type="button" className="primary" data-action="run-prompt" onClick={runPrompt} disabled={node.generating}>
            <IPlay size={11} />
            <span>{node.generating ? '运行中' : (node.error ? '重试' : '运行')}</span>
          </button>
        </div>

        {designerOpen && (
          <PromptTemplateDesigner
            templates={designerTemplates}
            selectedTemplateId={designerTemplates.some((template) => template.id === selectedTemplate?.id) ? selectedTemplate.id : ''}
            onClose={() => setDesignerOpen(false)}
            onSaved={handleTemplateSaved}
            onDeleted={handleTemplateDeleted}
            onSelectTemplate={selectTemplate}
          />
        )}
      </div>
    </NodeShell>
  );
}
