import React from 'react';
import { EmbeddedDesignSpaceWorkbench } from './EmbeddedDesignSpaceWorkbench.jsx';
import { designSpaceStyles } from './styles.js';

export function DesignSpacePage({
  projectId = 'local-default',
  project,
  models = [],
  imageModels = [],
  promptTemplates = [],
  templateStatus = null,
  onBackToCanvas,
  onParse,
  onGenerateCard,
  onBatchGenerate,
  onSaveVersion,
  onLoadVersionToCanvas,
}) {
  return (
    <section className="design-space-page">
      <style>{designSpaceStyles}</style>
      <header className="design-space-topbar">
        <button type="button" className="design-space-back" onClick={onBackToCanvas}>
          返回画布
        </button>
        <div>
          <div className="design-space-kicker">LibTV Design Space</div>
          <h1>设计空间</h1>
        </div>
        <div className="design-space-project">{project?.name || '未命名项目'}</div>
        {templateStatus?.usingFallback && (
          <div className="design-template-status">使用内置提示词模板</div>
        )}
      </header>

      <EmbeddedDesignSpaceWorkbench
        projectId={projectId}
        project={project}
        models={models}
        imageModels={imageModels}
        promptTemplates={promptTemplates}
        templateStatus={templateStatus}
        onParse={onParse}
        onGenerateCard={onGenerateCard}
        onBatchGenerate={onBatchGenerate}
        onSaveVersion={onSaveVersion}
        onLoadVersionToCanvas={onLoadVersionToCanvas}
      />
    </section>
  );
}
