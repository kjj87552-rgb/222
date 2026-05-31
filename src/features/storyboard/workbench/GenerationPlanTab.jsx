import React from 'react';
import { summarizeGenerationPlan } from '../package/storyboardPackage.js';
import { summarizeShotGroupsForDeployment } from '../deployment/canvasDeploymentDraft.js';
import { asArray, displayFirst, displayKey, displayValue } from './displayValue.js';

const shotNumber = (task, index) => (
  displayFirst([
    task?.shotNumber,
    task?.number,
    task?.shotId,
    task?.id,
  ], String(index + 1).padStart(4, '0'))
);

const shotGroup = (task) => (
  displayFirst([
    task?.shotGroup,
    task?.shotGroupId,
    task?.groupId,
  ], '未分组')
);

const promptText = (task) => (
  displayFirst([
    task?.prompt,
    task?.imagePrompt,
    task?.videoPrompt,
    task?.description,
  ], '')
);

export function GenerationPlanTab({ storyboardPackage, onDeploy }) {
  const plan = storyboardPackage?.generationPlan || {};
  const shotTasks = asArray(plan.shotTasks);
  const summary = summarizeGenerationPlan(plan);
  const deploymentGroups = summarizeShotGroupsForDeployment(storyboardPackage);
  const hasShotTasks = shotTasks.length > 0;
  const deployAll = (mode) => onDeploy?.({ mode, scope: 'all' });
  const deployGroup = (shotGroupId) => onDeploy?.({
    mode: 'canvas',
    scope: 'shot-group',
    shotGroupId,
  });

  return (
    <section className="sb-package-panel">
      <div className="sb-package-head">
        <div>
          <h2>生成计划</h2>
          <p>总镜头 {summary.total}</p>
        </div>
        <span className="sb-status-pill">总镜头 {summary.total}</span>
      </div>

      <div className="sb-package-actions">
        <button type="button" disabled={!hasShotTasks} onClick={() => deployAll('virtual')}>
          部署虚拟节点
        </button>
        <button type="button" disabled={!hasShotTasks} onClick={() => deployAll('canvas')}>
          部署到画布
        </button>
      </div>

      {hasShotTasks && (
        <div className="sb-deploy-groups">
          <div className="sb-deploy-groups-title">部署分组</div>
          <div className="sb-deploy-group-list">
            {deploymentGroups.map((group) => (
              <div className="sb-deploy-group" key={group.shotGroupId}>
                <div>
                  <strong>{group.shotGroupId}</strong>
                  <span>{group.total} 镜</span>
                </div>
                <div className="sb-deploy-group-stats">
                  <span>已部署 {group.deployed}</span>
                  <span>已出图 {group.imageDone}</span>
                  <span>已成片 {group.videoDone}</span>
                  <span>失败 {group.failed}</span>
                </div>
                <button type="button" onClick={() => deployGroup(group.shotGroupId)}>
                  部署此组
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasShotTasks ? (
        <table className="sb-plan-table">
          <thead>
            <tr>
              <th>镜头</th>
              <th>分组</th>
              <th>状态</th>
              <th>提示词</th>
            </tr>
          </thead>
          <tbody>
            {shotTasks.map((task, index) => (
              <tr key={displayKey([task?.id, task?.shotNumber], `shot-task-${index}`)}>
                <td>{shotNumber(task, index)}</td>
                <td>{shotGroup(task)}</td>
                <td>{displayValue(task?.status, 'planned')}</td>
                <td>{promptText(task)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="sb-empty-block">还没有生成计划镜头。</div>
      )}
    </section>
  );
}
