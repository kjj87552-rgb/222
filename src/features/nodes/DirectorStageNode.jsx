import React from 'react';
import { NodeShell, TbBtn } from './NodeShell.jsx';
import { ICopy, IFilm, ITrash } from '../../shared/ui/icons/index.jsx';

const DirectorStageWorkbench = React.lazy(() => (
  import('../director-stage/DirectorStageWorkbench.tsx')
    .then((module) => ({ default: module.DirectorStageWorkbench }))
));

function CompactToolbar({ node, onOpenModal }) {
  return (
    <div className="node-toolbar" onPointerDown={(event) => event.stopPropagation()}>
      <TbBtn icon={ICopy} label="复制" onClick={() => onOpenModal?.('copy', node.id)} />
      <TbBtn icon={ITrash} label="删除" onClick={() => onOpenModal?.('delete', node.id)} danger />
    </div>
  );
}

export function DirectorStageNode(props) {
  const { id, selected, onOpenModal, onUpdateNode, onCreateNode, onCreateEdge, allNodes, edges, projectId } = props;
  const node = allNodes?.find((item) => item.id === id);
  const [open, setOpen] = React.useState(false);
  if (!node) return null;

  const settings = node.settings || {};
  const elements = settings.director3dElements || [];
  const cameras = settings.director3dCameras || [];
  const advancedCount = elements.filter((item) => item.kind === 'advanced').length;
  const backgroundReady = Boolean(settings.director3dBackground || settings.director3dBackgroundSourceNodeId);

  return (
    <>
      <NodeShell
        {...props}
        node={node}
        selected={selected}
        isEmpty={false}
        toolbar={<CompactToolbar node={node} onOpenModal={onOpenModal} />}
      >
        <div className="director-stage-node-preview" onDoubleClick={(event) => { event.stopPropagation(); setOpen(true); }}>
          <div className="kicker"><span>PANORAMA::ORBIT</span><span>[ONLINE]</span></div>
          <div className="title">{settings.displayName || node.displayName || '旧版720工作台'}</div>
          <div className="stats">
            <div className="stat"><strong>{String(elements.length).padStart(2, '0')}</strong><span>OBJECTS</span></div>
            <div className="stat"><strong>{String(cameras.length || 1).padStart(2, '0')}</strong><span>CAMERAS</span></div>
            <div className="stat"><strong>{String(advancedCount).padStart(2, '0')}</strong><span>HERO</span></div>
          </div>
          <div className="kicker"><span>BG {backgroundReady ? 'LOADED' : 'NONE'}</span><span>{settings.director3dViewportMode === 'camera' ? 'CAM_PREVIEW' : 'ORBIT_VIEW'}</span></div>
          <button type="button" className="open" onPointerDown={(event) => event.stopPropagation()} onClick={() => setOpen(true)}>
            <IFilm size={14} /> 打开3D工作台
          </button>
        </div>
      </NodeShell>
      {open ? (
        <React.Suspense fallback={<div className="director-stage-backdrop"><div className="director-stage-app" style={{ alignItems: 'center', justifyContent: 'center' }}>正在加载全景环绕工作台...</div></div>}>
          <DirectorStageWorkbench
            node={node}
            allNodes={allNodes}
            edges={edges}
            projectId={projectId}
            onUpdateNode={onUpdateNode}
            onCreateNode={onCreateNode}
            onCreateEdge={onCreateEdge}
            onClose={() => setOpen(false)}
          />
        </React.Suspense>
      ) : null}
    </>
  );
}
