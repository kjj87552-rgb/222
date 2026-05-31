// src/features/director-stage-v2/inspector/RightInspector.tsx
import React, { useEffect, useState } from 'react';
import { ensureInspectorStylesInjected } from './inspector-styles';
import { EmptyInspector } from './EmptyInspector';
import { ElementInspector } from './ElementInspector';
import { CameraInspector } from './CameraInspector';
import { MultiSelectInspector } from './MultiSelectInspector';
import { BackgroundToolPanel } from './BackgroundToolPanel';
import { GroundPlanToolPanel } from './GroundPlanToolPanel';
import { CrowdBuilderPanel } from './CrowdBuilderPanel';

type InspTab = 'inspector' | 'scene-list';

export interface RightInspectorProps {
  elements: Array<{ id: string; kind: 'advanced' | 'crowd'; name?: string; [k: string]: any }>;
  cameras: Array<{ id: string; name?: string; fov?: number; frame?: string; shotType?: string; priority?: string; [k: string]: any }>;
  selectedElementIds: string[];
  selectedCameraId: string | null;
  activeTool: null | 'background' | 'ground' | 'crowd-builder' | 'camera' | 'frame' | 'path' | 'command';
  onUpdateElement: (id: string, patch: Record<string, any>) => void;
  onUpdateCamera: (id: string, patch: Record<string, any>) => void;
  onDeleteElement: (id: string) => void;
  onDeleteCamera: (id: string) => void;
  activeCameraId: string | null;
  onSelectElement: (id: string | null) => void;
  onSelectCamera: (id: string | null) => void;
  onGenerateCrowd: (cfg: { count: number; layout: string; columns: number; spacingX: number; spacingZ: number; radius: number }) => void;
  onClearActiveTool: () => void;
  connectedSources: Array<{ nodeId: string; label: string; rawSource: string }>;
  backgroundColor: string;
  currentBackground: string;
  currentBackgroundSourceNodeId: string | null;
  onSelectBackgroundSource: (nodeId: string) => void;
  onClearBackgroundSource: () => void;
  onPickBackgroundColor: (color: string) => void;
  groundPlanUrl: string;
  showGroundPlan: boolean;
  groundOpacity: number;
  groundScale: number;
  groundRotation: number;
  groundOffsetX: number;
  groundOffsetZ: number;
  onUpdateGround: (patch: {
    groundPlan?: string; showGroundPlan?: boolean;
    opacity?: number; scale?: number; rotation?: number; offsetX?: number; offsetZ?: number;
  }) => void;
  onUploadBackgroundFile: (file: File) => void;
  onUploadGroundFile: (file: File) => void;
  onClearGroundFile: () => void;
}

export function RightInspector(props: RightInspectorProps) {
  useEffect(() => { ensureInspectorStylesInjected(); }, []);
  const [tab, setTab] = useState<InspTab>('inspector');

  const { elements, cameras, selectedElementIds, selectedCameraId, activeTool } = props;
  const heroCount = elements.filter((e) => e.kind === 'advanced').length;
  const crowdCount = elements.filter((e) => e.kind === 'crowd').length;
  const pathCount = elements.filter((e) => Array.isArray(e.motionPath?.points) && e.motionPath.points.length > 0).length;

  function renderInspector() {
    // 工具激活优先级最高
    if (activeTool === 'background') {
      return (
        <BackgroundToolPanel
          currentBackground={props.currentBackground}
          currentBackgroundSourceNodeId={props.currentBackgroundSourceNodeId}
          currentBackgroundColor={props.backgroundColor}
          connectedSources={props.connectedSources}
          onSelectSource={props.onSelectBackgroundSource}
          onClearSource={props.onClearBackgroundSource}
          onPickColor={props.onPickBackgroundColor}
          onUploadFile={props.onUploadBackgroundFile}
          onClose={props.onClearActiveTool}
        />
      );
    }
    if (activeTool === 'ground') {
      return (
        <GroundPlanToolPanel
          groundPlanUrl={props.groundPlanUrl}
          showGroundPlan={props.showGroundPlan}
          opacity={props.groundOpacity}
          scale={props.groundScale}
          rotation={props.groundRotation}
          offsetX={props.groundOffsetX}
          offsetZ={props.groundOffsetZ}
          onUpdate={props.onUpdateGround}
          onUploadFile={props.onUploadGroundFile}
          onClearFile={props.onClearGroundFile}
          onClose={props.onClearActiveTool}
        />
      );
    }
    if (activeTool === 'crowd-builder') {
      return <CrowdBuilderPanel onGenerate={props.onGenerateCrowd} onClose={props.onClearActiveTool} />;
    }

    // 多选
    if (selectedElementIds.length > 1) {
      const selected = elements.filter((x) => selectedElementIds.includes(x.id));
      return (
        <MultiSelectInspector
          elements={selected as any}
          onUpdateMany={(ids, patch) => ids.forEach((id) => props.onUpdateElement(id, patch))}
          onDeleteMany={(ids) => { ids.forEach((id) => props.onDeleteElement(id)); props.onSelectElement(null); }}
          onClear={() => props.onSelectElement(null)}
        />
      );
    }

    // 单选 element
    if (selectedElementIds.length === 1) {
      const el = elements.find((x) => x.id === selectedElementIds[0]);
      if (el) {
        return (
          <ElementInspector
            element={el as any}
            onUpdate={(patch) => props.onUpdateElement(el.id, patch)}
            onDelete={() => { props.onDeleteElement(el.id); props.onSelectElement(null); }}
            onRename={(name) => props.onUpdateElement(el.id, { name })}
          />
        );
      }
    }

    // 单选 camera
    if (selectedCameraId) {
      const cam = cameras.find((x) => x.id === selectedCameraId);
      if (cam) {
        return (
          <CameraInspector
            camera={cam as any}
            isActive={cam.id === props.activeCameraId}
            onUpdate={(patch) => props.onUpdateCamera(cam.id, patch)}
            onDelete={() => { props.onDeleteCamera(cam.id); props.onSelectCamera(null); }}
            onRename={(name) => props.onUpdateCamera(cam.id, { name })}
            onMakeActive={() => props.onSelectCamera(cam.id)}
          />
        );
      }
    }

    // 默认空
    return (
      <EmptyInspector
        heroCount={heroCount}
        crowdCount={crowdCount}
        cameraCount={cameras.length}
        pathCount={pathCount}
        backgroundLabel={null}
      />
    );
  }

  function renderSceneList() {
    return (
      <div className="dsv2-insp-body" data-testid="inspector-scene-list">
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>👤 主角 · {heroCount}</span><span>▾</span></div>
        </div>
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>👥 群演 · {crowdCount}</span><span>▾</span></div>
        </div>
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>🎬 机位 · {cameras.length}</span><span>▾</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dsv2-insp" data-testid="director-v2-inspector">
      <div className="dsv2-insp-tabs" role="tablist" aria-label="检查器">
        <button type="button" role="tab" aria-selected={tab === 'inspector'}
                id="dsv2-tab-inspector" aria-controls="dsv2-insp-panel"
                className="dsv2-insp-tab"
                data-active={tab === 'inspector' ? '1' : '0'}
                onClick={() => setTab('inspector')}>检查器</button>
        <button type="button" role="tab" aria-selected={tab === 'scene-list'}
                id="dsv2-tab-scene-list" aria-controls="dsv2-scene-panel"
                className="dsv2-insp-tab"
                data-active={tab === 'scene-list' ? '1' : '0'}
                onClick={() => setTab('scene-list')}>场景清单</button>
      </div>
      {tab === 'inspector' ? (
        <div id="dsv2-insp-panel" role="tabpanel" aria-labelledby="dsv2-tab-inspector">
          {renderInspector()}
        </div>
      ) : (
        <div id="dsv2-scene-panel" role="tabpanel" aria-labelledby="dsv2-tab-scene-list">
          {renderSceneList()}
        </div>
      )}
    </div>
  );
}

