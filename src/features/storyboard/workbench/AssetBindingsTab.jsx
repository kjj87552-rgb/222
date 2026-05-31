import React from 'react';
import {
  EmbeddedDesignSpaceWorkbench,
  sourceTextFromWorkbenchNode,
} from '../../design-space/EmbeddedDesignSpaceWorkbench.jsx';
import {
  designSpaceActions,
  designSpaceStore,
  useDesignSpacePackage,
} from '../../design-space/designSpaceStore.js';
import { canvasActions } from '../../../shared/store/canvasStore.js';

const safeScopePart = (value, fallback) => (
  String(value || fallback || 'local')
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || String(fallback || 'local')
);

export function makeStoryboardDesignSpaceProjectId(projectId = 'local-default', nodeId = '') {
  if (!nodeId) return projectId || 'local-default';
  return `${safeScopePart(projectId, 'local-default')}__storyboard__${safeScopePart(nodeId, 'node')}`;
}

function designPackageFromNode(node = {}) {
  return node.designSpacePackage || node.state?.designSpacePackage || null;
}

function normalizeNodeDesignPackage(pkg, scopedProjectId, title) {
  if (!pkg) return null;
  return {
    ...pkg,
    projectId: scopedProjectId,
    title: pkg.title || title,
  };
}

function hasDesignPackageContent(pkg) {
  return Boolean(
    pkg?.sourceText
    || (Array.isArray(pkg?.characters) && pkg.characters.length)
    || (Array.isArray(pkg?.scenes) && pkg.scenes.length)
    || (Array.isArray(pkg?.props) && pkg.props.length)
  );
}

const DESIGN_SELECTION_HOT_KEYS = ['selectedCardId', 'activeTab', 'updatedAt'];

// 选中/切换卡片只改变 selectedCardId、activeTab 这类高频 UI 状态。若把这种变更也回写进
// 画布节点，会触发画布 store 更新（整棵分镜工作台同步重渲染）以及把含图片的大节点重新
// 持久化，造成切换卡片时的卡顿。仅当设计内容（原文 / 卡片 / 图片等）真正变化时才回写。
function isDesignSelectionOnlyChange(prev, next) {
  if (!prev || !next || prev === next) return false;
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    if (DESIGN_SELECTION_HOT_KEYS.includes(key)) continue;
    if (!Object.is(prev[key], next[key])) return false;
  }
  return true;
}

export function AssetBindingsTab({
  nodeId,
  projectId,
  node = {},
  storyboardPackage = {},
  designPackage = null,
  assets = {},
  project = null,
  models = [],
  imageModels = [],
  promptTemplates = [],
  templateStatus = null,
  onOpenDesignSpace,
  onDesignSpaceParse,
  onDesignSpaceGenerateCard,
  onDesignSpaceBatchGenerate,
  onDesignSpaceSaveVersion,
  onDesignSpaceLoadVersionToCanvas,
}) {
  const designSpaceProjectId = React.useMemo(
    () => makeStoryboardDesignSpaceProjectId(projectId, nodeId),
    [nodeId, projectId],
  );
  const scopedDesignPackage = useDesignSpacePackage(designSpaceProjectId);
  const initialDesignSourceText = React.useMemo(
    () => sourceTextFromWorkbenchNode(node),
    [node?.rawScriptText, node?.scriptSourceText, node?.scriptText],
  );
  const nodeDesignPackage = designPackageFromNode(node);
  const packageTitle = `${node?.title || project?.name || '分镜'}资产配置`;

  React.useEffect(() => {
    if (!designSpaceProjectId) return;
    const existing = designSpaceStore.getState().packagesByProject[designSpaceProjectId];
    const nodePackage = normalizeNodeDesignPackage(
      nodeDesignPackage,
      designSpaceProjectId,
      packageTitle,
    );
    if (existing) {
      if (nodePackage && existing.id !== nodePackage.id && !hasDesignPackageContent(existing)) {
        designSpaceActions.setPackage(designSpaceProjectId, nodePackage);
      }
      return;
    }

    if (nodePackage) {
      designSpaceActions.setPackage(designSpaceProjectId, nodePackage);
      return;
    }

    designSpaceActions.ensurePackage(designSpaceProjectId, {
      title: packageTitle,
    });
  }, [designSpaceProjectId, node?.id, nodeDesignPackage, packageTitle]);

  React.useEffect(() => {
    if (!nodeId || !scopedDesignPackage) return;
    canvasActions.setNodes((nodes) => {
      let changed = false;
      const nextNodes = nodes.map((item) => {
        if (item.id !== nodeId) return item;
        const currentPackage = designPackageFromNode(item);
        if (currentPackage === scopedDesignPackage) return item;
        if (isDesignSelectionOnlyChange(currentPackage, scopedDesignPackage)) return item;
        changed = true;
        return {
          ...item,
          designSpacePackage: scopedDesignPackage,
          state: {
            ...item.state,
            designSpacePackage: scopedDesignPackage,
          },
        };
      });
      return changed ? nextNodes : nodes;
    });
  }, [nodeId, scopedDesignPackage]);

  return (
    <section className="sb-asset-bindings">
      <EmbeddedDesignSpaceWorkbench
        projectId={designSpaceProjectId}
        assetProjectId={projectId}
        project={project}
        models={models}
        imageModels={imageModels}
        promptTemplates={promptTemplates}
        templateStatus={templateStatus}
        initialSourceText={initialDesignSourceText}
        onParse={onDesignSpaceParse}
        onGenerateCard={onDesignSpaceGenerateCard}
        onBatchGenerate={onDesignSpaceBatchGenerate}
        onSaveVersion={onDesignSpaceSaveVersion}
        onLoadVersionToCanvas={onDesignSpaceLoadVersionToCanvas}
        onOpenFullDesignSpace={onOpenDesignSpace}
      />
    </section>
  );
}
