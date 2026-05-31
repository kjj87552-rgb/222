import React from 'react';
import {
  IClose, IScript, IBox, IText, IVideo, ISparkle,
} from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { useNodeById } from '../../../shared/store/canvasStore.js';

const PLACEHOLDER_DESC = '（待填写）';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function countShots(node) {
  return asArray(node?.shots).filter((shot) => {
    const desc = String(shot?.desc || '').trim();
    return desc && desc !== PLACEHOLDER_DESC;
  }).length;
}

function countImageTasks(plan) {
  return asArray(plan?.imageTasks).length
    + asArray(plan?.images).length
    + asArray(plan?.tasks).filter((task) => String(task?.kind || task?.type || '').includes('image')).length;
}

function countVideoTasks(plan) {
  return asArray(plan?.videoTasks).length
    + asArray(plan?.videos).length
    + asArray(plan?.tasks).filter((task) => String(task?.kind || task?.type || '').includes('video')).length;
}

function getStoryboardPackage(node) {
  return node?.storyboardPackage || node?.state?.storyboardPackage || {};
}

function buildSummary(node) {
  const storyboardPackage = getStoryboardPackage(node);
  const plan = storyboardPackage.generationPlan || node?.generationPlan || {};
  const shotGroups = asArray(storyboardPackage.shotGroups || node?.shotGroups);
  const shots = countShots(node);
  const groups = shotGroups.length;
  const characters = asArray(storyboardPackage.characters || storyboardPackage.characterCards || node?.characters).length;
  const scenes = asArray(storyboardPackage.scenes || storyboardPackage.sceneCards || node?.scenes).length;
  const imageTasks = countImageTasks(plan);
  const videoTasks = countVideoTasks(plan);
  return {
    shots: shots || groups,
    groups,
    characters,
    scenes,
    imageTasks,
    videoTasks,
    hasPackage: Boolean(
      shots || groups || characters || scenes || imageTasks || videoTasks || node?.scriptText || node?.scriptSourceText,
    ),
  };
}

function summaryLabel(value, label) {
  return `${Number(value) || 0} 个${label}`;
}

function formatShotPreview(shots) {
  return asArray(shots)
    .map((shot, index) => {
      const desc = String(shot?.desc || '').trim();
      if (!desc || desc === PLACEHOLDER_DESC) return '';
      const n = String(shot?.n || index + 1).padStart(2, '0');
      const shotType = String(shot?.shot || '镜头').trim();
      const duration = String(shot?.dur || '').trim();
      const head = [n, shotType, duration].filter(Boolean).join('｜');
      return `${head}\n${desc}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

export function ScriptFullModal({ nodeId, onClose, onOpenWorkbench }) {
  const node = useNodeById(nodeId);
  const openWorkbench = React.useCallback((entry = 'package') => {
    onOpenWorkbench?.({ entry });
  }, [onOpenWorkbench]);

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      <button className="active"><IScript size={15}/><span className="tip">分镜生产包</span></button>
    </div>
  );

  if (!node) {
    return (
      <ToolModal onClose={onClose} toolbar={tb}>
        <div className="tool-modal sf-modal" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontSize: 13 }}>
          找不到节点 {nodeId ? `（id: ${nodeId}）` : '(无 nodeId)'}
        </div>
      </ToolModal>
    );
  }

  const summary = buildSummary(node);
  const title = node.title || '脚本节点';
  const sourceText = String(node.scriptText || node.scriptSourceText || node.rawScriptText || '').trim();
  const previewText = sourceText || formatShotPreview(node.shots);

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tool-modal sf-modal sf-overview-modal">
        <div className="tm-stage sf-overview-stage">
          <section className="sf-overview-main">
            <div className="sf-overview-kicker"><IScript size={14}/>分镜生产包</div>
            <h2>{title}</h2>
            <div className="sf-overview-stats">
              <div><strong>{summaryLabel(summary.shots, '镜头')}</strong><span>镜头表</span></div>
              <div><strong>{summaryLabel(summary.characters, '角色')}</strong><span>角色设定</span></div>
              <div><strong>{summaryLabel(summary.scenes, '场景')}</strong><span>场景设定</span></div>
              <div><strong>{summaryLabel(summary.groups, '镜头组')}</strong><span>shotGroups</span></div>
              <div><strong>{summaryLabel(summary.imageTasks, '图片任务')}</strong><span>画布部署</span></div>
              <div><strong>{summaryLabel(summary.videoTasks, '视频任务')}</strong><span>画布部署</span></div>
            </div>
            <div className="sf-overview-preview">
              {summary.hasPackage ? (
                <pre className="sf-overview-script">{previewText || '生产包已建立'}</pre>
              ) : (
                <p>暂无生产包内容</p>
              )}
            </div>
            <div className="sf-overview-actions">
              <button
                type="button"
                className="primary"
                onClick={() => openWorkbench(summary.hasPackage ? 'package' : 'script_create')}
              >
                <IBox size={14}/>打开分镜工作台
              </button>
              <button type="button" onClick={() => openWorkbench('script_create')}>
                <IText size={14}/>剧本创作
              </button>
              <button type="button" onClick={() => openWorkbench('video_remix')}>
                <IVideo size={14}/>视频参考
              </button>
            </div>
          </section>
          <aside className="sf-overview-side">
            <div className="sf-overview-step active"><ISparkle size={13}/><span>内容输入</span></div>
            <div className="sf-overview-step"><IBox size={13}/><span>资产绑定</span></div>
            <div className="sf-overview-step"><IScript size={13}/><span>镜头计划</span></div>
            <div className="sf-overview-step"><IVideo size={13}/><span>输出部署</span></div>
          </aside>
        </div>
      </div>
    </ToolModal>
  );
}
