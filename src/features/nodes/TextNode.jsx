import React from 'react';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { modelLabel, modelMatchesLabel, selectBackendModel } from '../../shared/platform/modelSelection.js';
import { TEXT_NODE_MODEL_CAPABILITIES } from '../../shared/utils/textNodeTools.js';
import {
  ISparkle, IMagic, IText, IVideo, ICopy, ITrash,
} from '../../shared/ui/icons/index.jsx';
import { NodeShell, TbBtn } from './NodeShell.jsx';

function uniqueModels(models) {
  const seen = new Set();
  return models.filter((model) => {
    if (!model?.id || seen.has(model.id)) return false;
    seen.add(model.id);
    return model.enabled !== false;
  });
}

function TextToolbar({ onOpen }) {
  return (
    <div className="node-toolbar" onPointerDown={(e)=>e.stopPropagation()}>
      <TbBtn icon={ISparkle} label="AI 续写"   onClick={() => onOpen("textcont")}/>
      <TbBtn icon={IMagic}   label="重写"      onClick={() => onOpen("textrewrite")}/>
      <TbBtn icon={IText}    label="润色"      onClick={() => onOpen("textpolish")}/>
      <TbBtn icon={IVideo}   label="文生视频"  onClick={() => onOpen("textvideo")}/>
      <span className="sep"/>
      <TbBtn icon={ICopy}    onClick={() => onOpen("copy")}/>
      <TbBtn icon={ITrash}   onClick={() => onOpen("delete")} danger/>
    </div>
  );
}

export function TextNode(props) {
  const { node, onOpenModal, onUpdateNode, onSelect } = props;
  const [models, setModels] = React.useState([]);
  const [modelLoading, setModelLoading] = React.useState(false);
  const open = (kind) => onOpenModal?.(kind, node.id);
  const isEmpty = !node.body || node.body.trim() === "";

  React.useEffect(() => {
    let cancelled = false;
    setModelLoading(true);
    Promise.all(TEXT_NODE_MODEL_CAPABILITIES.map((capability) => ProviderStore.models({ capability })))
      .then((results) => {
        if (cancelled) return;
        setModels(uniqueModels(results.flatMap((result) => Array.isArray(result?.models) ? result.models : [])));
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setModelLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const selectedModel = React.useMemo(() => (
    models.find((item) => item.id === (node.providerModelId || node.modelId || node.workbenchModelId))
    || models.find((item) => modelMatchesLabel(item, node.workbenchModel || node.model))
    || selectBackendModel(models, {
      currentId: node.providerModelId || node.modelId || node.workbenchModelId,
      currentLabel: node.workbenchModel || node.model,
    })
  ), [models, node.model, node.modelId, node.providerModelId, node.workbenchModel, node.workbenchModelId]);

  const selectedModelId = selectedModel?.id || node.providerModelId || node.modelId || node.workbenchModelId || '';
  const displayModel = selectedModel ? modelLabel(selectedModel) : (node.workbenchModel || node.model || (modelLoading ? '加载模型...' : '暂无可用推理模型'));

  const chooseModel = (event) => {
    const model = models.find((item) => item.id === event.target.value);
    if (!model) return;
    const label = modelLabel(model);
    onUpdateNode?.(node.id, {
      workbenchModel: label,
      model: label,
      workbenchModelId: model.id,
      modelId: model.id,
      providerModelId: model.id,
      modelName: model.modelName,
      provider: model.providerId,
      textModelCapability: model.capability || 'text.reason',
      error: null,
    });
  };

  return (
    <NodeShell {...props} isEmpty={false}
      toolbar={<TextToolbar onOpen={open}/>}>
      <div className="text-node-topbar" onPointerDown={(event) => event.stopPropagation()}>
        <label className="text-model-field" title={displayModel}>
          <span>推理模型</span>
          <select
            className="text-model-select"
            value={selectedModelId}
            disabled={modelLoading || !models.length}
            onChange={chooseModel}
          >
            {!models.length && <option value="">{modelLoading ? '加载模型...' : '暂无可用推理模型'}</option>}
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {modelLabel(model)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        className="text-editor"
        value={node.body || ""}
        placeholder="自己编写内容，或从底部生成器生成文本..."
        onPointerDown={(e) => { e.stopPropagation(); onSelect?.(node.id, false); }}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => onUpdateNode?.(node.id, { body: e.target.value })}
      />
      {node.generating && (
        <div className="gen-overlay">
          <div className="spin"/>
          <div className="pct">{node.progress || 1}%</div>
          <div className="label">{node.model || '文本模型'} · 处理中</div>
        </div>
      )}
      {isEmpty && (
        <div className="text-empty-hint" onPointerDown={(e)=>e.stopPropagation()}>
          <IText size={15} sw={1.5}/>
          <span>文本输入</span>
        </div>
      )}
    </NodeShell>
  );
}
