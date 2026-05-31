import React from 'react';
import { asArray, displayFirst, displayKey, displayValue } from './displayValue.js';

const diagnosticMessage = (diagnostic, index) => (
  displayFirst([
    diagnostic?.message,
    diagnostic?.text,
    diagnostic?.title,
  ], `诊断 ${index + 1}`)
);

export function PackageTab({ storyboardPackage }) {
  const characters = asArray(storyboardPackage?.characterBible?.characters);
  const shotGroups = asArray(storyboardPackage?.shotGroups);
  const shotTasks = asArray(storyboardPackage?.generationPlan?.shotTasks);
  const diagnostics = asArray(storyboardPackage?.diagnostics);

  return (
    <section className="sb-package-panel">
      <div className="sb-package-head">
        <div>
          <h2>分镜生产包</h2>
          <p>
            v{displayValue(storyboardPackage?.version, '1')}
            {' · '}
            {displayValue(storyboardPackage?.sourceMode, 'script')}
          </p>
        </div>
        <span className="sb-status-pill">诊断 {diagnostics.length}</span>
      </div>

      <div className="sb-package-grid">
        <div className="sb-package-card">
          <span>角色</span>
          <strong>{characters.length}</strong>
        </div>
        <div className="sb-package-card">
          <span>分镜组</span>
          <strong>{shotGroups.length}</strong>
        </div>
        <div className="sb-package-card">
          <span>生成任务</span>
          <strong>{shotTasks.length}</strong>
        </div>
      </div>

      {diagnostics.length === 0 ? (
        <div className="sb-empty-block">暂无生产包诊断。</div>
      ) : (
        <ul className="sb-warning-list">
          {diagnostics.map((diagnostic, index) => (
            <li key={displayKey([diagnostic?.id, diagnostic?.message], `diagnostic-${index}`)}>
              <strong>{displayValue(diagnostic?.severity, 'info')}</strong>
              <span>{diagnosticMessage(diagnostic, index)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
