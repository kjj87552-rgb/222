import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { importLocalFileAsAsset } from '../../shared/utils/uploadHelpers.js';
import { ensureStageTokensInjected } from './tokens/stage-tokens';
import { ensureStageMaterialsInjected } from './tokens/stage-materials';
import { ensureStageSignatureInjected } from './tokens/stage-signature';
import { ensureMotionKeyframesInjected } from './motion/transitions';
import { WorkbenchShell, type ViewportMode } from './shell/WorkbenchShell';
import { DiagnosticBar } from './shell/DiagnosticBar';
import { LeftToolRail, type ActiveTool } from './tools/LeftToolRail';
import { DirectorStageViewport, type DirectorStageViewportHandle } from './viewport/DirectorStageViewport';
import { ViewportTopHud } from './viewport/viewport-hud/ViewportTopHud';
import { ViewportBottomHud } from './viewport/viewport-hud/ViewportBottomHud';
import { EmptyStateHint } from './viewport/viewport-hud/EmptyStateHint';
import { RightInspector } from './inspector/RightInspector';
import { useGlobalHotkeys } from './shell/useGlobalHotkeys';
import {
  buildDirectorStageConnectedSources,
  createDirectorStageCrowdElement,
  createDirectorStageAdvancedElement,
  type DirectorStageOrbit,
} from '../director-stage/types';

// Synced from tapnow DirectorStageWorkbench – element selection cluster helpers
const uniqueIds = (ids: string[]) => Array.from(new Set(ids.filter(Boolean)));

const getElementSelectionCluster = (elements: any[], elementId: string) => {
  const target = elements.find((e) => e.id === elementId);
  if (!target) return [elementId];
  const groupId = (target as any).crowdGroupId || (target as any).groupId;
  if (!groupId) return [elementId];
  return elements.filter((e) => ((e as any).crowdGroupId || (e as any).groupId) === groupId).map((e) => e.id);
};

const expandElementSelection = (elements: any[], elementIds: string[]) =>
  uniqueIds(elementIds.flatMap((id) => getElementSelectionCluster(elements, id)));

// Copied from V1 DirectorStageWorkbench – pure helper functions
const getNodePrimarySource = (node: CanvasNodeLike) => (
  node.src
  || node.poster
  || node.videoSrc
  || (typeof node.content === 'string' ? node.content : '')
  || (node.settings as any)?.imageUrl
  || (node.settings as any)?.panoramaImageUrl
  || (node.settings as any)?.selectedPreviewImage
  || (node.settings as any)?.image_url
  || (node.settings as any)?.reference_image_url
  || ''
);

const toDirectorSourceNode = (node: CanvasNodeLike) => {
  const rawSource = getNodePrimarySource(node);
  const legacyType = node.type === 'image' ? 'input-image' : node.type === 'video' ? 'gen-video' : node.type;
  return {
    id: node.id,
    type: legacyType,
    content: rawSource || node.content,
    settings: {
      ...(node.settings || {}),
      displayName: (node.settings as any)?.displayName || node.title || node.displayName,
      imageUrl: (node.settings as any)?.imageUrl || rawSource || undefined,
      image_url: (node.settings as any)?.image_url || rawSource || undefined,
      selectedPreviewImage: (node.settings as any)?.selectedPreviewImage || rawSource || undefined,
    },
  };
};

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error || new Error('File read failed'));
  reader.readAsDataURL(file);
});

const uploadProjectFile = async (projectId: string, file: File, kind: string) => {
  const imported = await importLocalFileAsAsset(file, projectId, kind, {
    source: 'director-stage-v2-upload',
    inLibrary: false,
    libraryAsset: false,
    scope: 'project',
    projectId,
    project_id: projectId,
  });
  const importedUrl = imported?.url || imported?.src || imported?.assetUrl;
  if (importedUrl) {
    return { url: importedUrl, filename: imported.filename || imported.title || file.name };
  }
  const dataUrl = await readFileAsDataUrl(file);
  const bridge = (window as any).libai;
  if (bridge?.asset?.writeDataUrl) {
    try {
      const uploaded = await bridge.asset.writeDataUrl(projectId, {
        filename: file.name,
        dataUrl,
        kind,
        mime: file.type || undefined,
      });
      if (uploaded?.url) {
        return { url: uploaded.url, filename: uploaded.title || file.name };
      }
    } catch (error) {
      console.warn('[director-stage-v2] Asset write bridge failed, falling back to data url:', error);
    }
  }
  return { url: dataUrl, filename: file.name };
};

const useDirectorStageSources = (nodeId: string, allNodes: CanvasNodeLike[], edges: CanvasEdgeLike[]) => useMemo(() => {
  const seen = new Set<string>();
  const incomingNodes = edges
    .filter(edge => edge.to === nodeId && !seen.has(edge.from) && seen.add(edge.from))
    .map(edge => allNodes.find(item => item.id === edge.from))
    .filter((item): item is CanvasNodeLike => Boolean(item))
    .map(toDirectorSourceNode);
  return buildDirectorStageConnectedSources(incomingNodes as any);
}, [allNodes, edges, nodeId]);

export interface CanvasNodeLike {
  id: string; type: string;
  x?: number; y?: number; width?: number; height?: number; w?: number; h?: number;
  title?: string; displayName?: string;
  content?: unknown;
  src?: string | null; poster?: string | null; videoSrc?: string | null;
  settings?: Record<string, any>;
  projectId?: string;
}
export interface CanvasEdgeLike { id?: string; from: string; to: string; }

export interface DirectorStageWorkbenchV2Props {
  node: CanvasNodeLike;
  allNodes?: CanvasNodeLike[];
  edges?: CanvasEdgeLike[];
  projectId?: string;
  onUpdateNode?: (id: string, patch: Record<string, any>) => void;
  onCreateNode?: (node: CanvasNodeLike) => void;
  onCreateEdge?: (edge: CanvasEdgeLike) => void;
  onClose: () => void;
}

const DEFAULT_ORBIT: DirectorStageOrbit = {
  yaw: 0.1, pitch: 0.24, distance: 9,
  targetX: 0, targetY: 1.4, targetZ: 0,
};

export function DirectorStageWorkbench(props: DirectorStageWorkbenchV2Props) {
  const { node, onUpdateNode, onClose } = props;
  const viewportRef = useRef<DirectorStageViewportHandle>(null);

  useEffect(() => {
    ensureStageTokensInjected();
    ensureStageMaterialsInjected();
    ensureStageSignatureInjected();
    ensureMotionKeyframesInjected();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [onClose]);

  const settings = (node.settings || {}) as Record<string, any>;
  const initialTitle = (node.settings?.displayName as string) || node.displayName || node.title || '全景环绕控制';
  const [title, setTitle] = useState(initialTitle);
  const [viewportMode, setViewportMode] = useState<ViewportMode>(
    (node.settings?.director3dViewportMode as ViewportMode) || 'director',
  );
  const [isDirty, setIsDirty] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [pathPreviewPlaying, setPathPreviewPlaying] = useState(false);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>(
    (settings.director3dSelectedElementIds as string[]) ||
    (settings.director3dSelectedElementId ? [settings.director3dSelectedElementId as string] : [])
  );
  const [selectedCameraId, setSelectedCameraIdLocal] = useState<string | null>(
    (settings.director3dActiveCameraId as string) || null,
  );
  const [orbit, setOrbit] = useState<DirectorStageOrbit>(
    (node.settings?.director3dOrbit as DirectorStageOrbit) || DEFAULT_ORBIT,
  );

  const onTitleChange = useCallback((next: string) => {
    setTitle(next);
    setIsDirty(true);
  }, []);
  const onViewportModeChange = useCallback((mode: ViewportMode) => {
    setViewportMode(mode);
    setIsDirty(true);
  }, []);

  const onSave = useCallback(() => {
    onUpdateNode?.(node.id, {
      displayName: title,
      title,
      settings: {
        ...(node.settings || {}),
        displayName: title,
        director3dViewportMode: viewportMode,
        director3dOrbitYaw: orbit.yaw,
        director3dOrbitPitch: orbit.pitch,
        director3dOrbitDistance: orbit.distance,
        director3dOrbitTargetX: orbit.targetX,
        director3dOrbitTargetY: orbit.targetY,
        director3dOrbitTargetZ: orbit.targetZ,
        director3dSelectedElementIds: selectedElementIds,
        director3dActiveCameraId: selectedCameraId || undefined,
      },
    });
    setIsDirty(false);
  }, [node.id, node.settings, title, viewportMode, orbit, selectedElementIds, selectedCameraId, onUpdateNode]);
  const elementsArr = (settings.director3dElements || []) as Array<{ id: string; kind?: string; [k: string]: any }>;
  const camerasArr = (settings.director3dCameras || []) as Array<{ id: string; name?: string; shotType?: string; frame?: string; fov?: number }>;
  const activeCamId = settings.director3dActiveCameraId as string | undefined;
  const activeCam = camerasArr.find((c) => c.id === activeCamId) || camerasArr[0] || null;

  const onUpdateElement = useCallback((id: string, patch: Record<string, any>) => {
    const next = elementsArr.map((e) => (e.id === id ? { ...e, ...patch } : e));
    onUpdateNode?.(node.id, { settings: { ...settings, director3dElements: next } });
    setIsDirty(true);
  }, [elementsArr, settings, node.id, onUpdateNode]);

  const onDeleteElement = useCallback((id: string) => {
    const next = elementsArr.filter((e) => e.id !== id);
    onUpdateNode?.(node.id, { settings: { ...settings, director3dElements: next } });
    setIsDirty(true);
  }, [elementsArr, settings, node.id, onUpdateNode]);

  const onUpdateCamera = useCallback((id: string, patch: Record<string, any>) => {
    const next = camerasArr.map((c) => (c.id === id ? { ...c, ...patch } : c));
    onUpdateNode?.(node.id, { settings: { ...settings, director3dCameras: next } });
    setIsDirty(true);
  }, [camerasArr, settings, node.id, onUpdateNode]);

  const onDeleteCamera = useCallback((id: string) => {
    if (camerasArr.length <= 1) return; // 至少留一个
    const next = camerasArr.filter((c) => c.id !== id);
    onUpdateNode?.(node.id, { settings: { ...settings, director3dCameras: next } });
    setIsDirty(true);
  }, [camerasArr, settings, node.id, onUpdateNode]);

  const onSelectBackgroundSource = useCallback((nodeId: string) => {
    const src = props.allNodes?.find((n) => n.id === nodeId);
    onUpdateNode?.(node.id, { settings: { ...settings,
      director3dBackgroundSourceNodeId: nodeId,
      director3dBackground: src?.src || (src?.settings as any)?.imageUrl || '',
    }});
    setIsDirty(true);
  }, [props.allNodes, settings, node.id, onUpdateNode]);

  const onClearBackgroundSource = useCallback(() => {
    onUpdateNode?.(node.id, { settings: { ...settings,
      director3dBackgroundSourceNodeId: undefined,
      director3dBackground: undefined,
    }});
    setIsDirty(true);
  }, [settings, node.id, onUpdateNode]);

  const onPickBackgroundColor = useCallback((color: string) => {
    onUpdateNode?.(node.id, { settings: { ...settings, director3dBackgroundColor: color }});
    setIsDirty(true);
  }, [settings, node.id, onUpdateNode]);

  const projectId = props.projectId || node.projectId || '';

  const onUploadBackgroundFile = useCallback(async (file: File) => {
    try {
      const { url, filename } = await uploadProjectFile(projectId, file, 'image');
      if (!url) return;
      onUpdateNode?.(node.id, { settings: { ...settings,
        director3dBackground: url,
        director3dBackgroundName: filename,
        director3dBackgroundSourceNodeId: undefined,
      }});
      setIsDirty(true);
    } catch (err) {
      console.error('[director-stage-v2] background upload failed:', err);
    }
  }, [projectId, settings, node.id, onUpdateNode]);

  const onUploadGroundFile = useCallback(async (file: File) => {
    try {
      const { url, filename } = await uploadProjectFile(projectId, file, 'image');
      if (!url) return;
      onUpdateNode?.(node.id, { settings: { ...settings,
        director3dGroundPlan: url,
        director3dGroundPlanName: filename,
        director3dShowGroundPlan: true,
      }});
      setIsDirty(true);
    } catch (err) {
      console.error('[director-stage-v2] ground upload failed:', err);
    }
  }, [projectId, settings, node.id, onUpdateNode]);

  const onClearGroundFile = useCallback(() => {
    onUpdateNode?.(node.id, { settings: { ...settings,
      director3dGroundPlan: undefined,
      director3dGroundPlanName: undefined,
    }});
    setIsDirty(true);
  }, [settings, node.id, onUpdateNode]);

  const onUpdateGround = useCallback((patch: any) => {
    const settingsPatch: Record<string, any> = {};
    if ('groundPlan' in patch)     settingsPatch.director3dGroundPlan = patch.groundPlan;
    if ('showGroundPlan' in patch) settingsPatch.director3dShowGroundPlan = patch.showGroundPlan;
    if ('opacity' in patch)        settingsPatch.director3dGroundPlanOpacity = patch.opacity;
    if ('scale' in patch)          settingsPatch.director3dGroundPlanScale = patch.scale;
    if ('rotation' in patch)       settingsPatch.director3dGroundPlanRotation = patch.rotation;
    if ('offsetX' in patch)        settingsPatch.director3dGroundPlanOffsetX = patch.offsetX;
    if ('offsetZ' in patch)        settingsPatch.director3dGroundPlanOffsetZ = patch.offsetZ;
    onUpdateNode?.(node.id, { settings: { ...settings, ...settingsPatch }});
    setIsDirty(true);
  }, [settings, node.id, onUpdateNode]);

  const onGenerateCrowd = useCallback((cfg: { count: number; layout: string; columns: number; spacingX: number; spacingZ: number; radius: number }) => {
    const baseIndex = elementsArr.length;
    const newCrowd = [];
    for (let i = 0; i < cfg.count; i++) {
      const el = createDirectorStageCrowdElement(baseIndex + i + 1);
      if (cfg.layout === 'grid') {
        const col = i % cfg.columns; const row = Math.floor(i / cfg.columns);
        el.x = (col - (cfg.columns - 1) / 2) * cfg.spacingX;
        el.z = row * cfg.spacingZ;
      } else if (cfg.layout === 'circle') {
        const angle = (i / cfg.count) * Math.PI * 2;
        el.x = Math.cos(angle) * cfg.radius;
        el.z = Math.sin(angle) * cfg.radius;
        el.rotationY = (-angle + Math.PI) * (180 / Math.PI);
      } else { // single
        el.x = (i - (cfg.count - 1) / 2) * cfg.spacingX;
        el.z = 0;
      }
      newCrowd.push(el);
    }
    onUpdateNode?.(node.id, { settings: { ...settings, director3dElements: [...elementsArr, ...newCrowd] } });
    setIsDirty(true);
  }, [elementsArr, settings, node.id, onUpdateNode]);

  const onAddHero = useCallback(() => {
    const newHero = createDirectorStageAdvancedElement(
      elementsArr.filter((e) => e.kind === 'advanced').length + 1,
    );
    const next = [...elementsArr, newHero];
    onUpdateNode?.(node.id, { settings: { ...settings, director3dElements: next } });
    setSelectedElementIds(expandElementSelection(next, [newHero.id]));
    setIsDirty(true);
  }, [elementsArr, settings, node.id, onUpdateNode]);

  const connectedSources = useDirectorStageSources(node.id, props.allNodes || [], props.edges || []);

  useGlobalHotkeys({
    onHero: onAddHero,
    onCrowd: () => setActiveTool(activeTool === 'crowd-builder' ? null : 'crowd-builder'),
    onCamera: () => setActiveTool(activeTool === 'camera' ? null : 'camera'),
    onBackground: () => setActiveTool(activeTool === 'background' ? null : 'background'),
    onGround: () => setActiveTool(activeTool === 'ground' ? null : 'ground'),
    onFrame: () => setActiveTool(activeTool === 'frame' ? null : 'frame'),
    onPath: () => setActiveTool(activeTool === 'path' ? null : 'path'),
    onTogglePathPreview: () => setPathPreviewPlaying((p) => !p),
    onResetView: () => { viewportRef.current?.resetView?.(); },
    onCommandPalette: () => setActiveTool('command'),
  });

  const leftRail = (
    <LeftToolRail
      activeTool={activeTool}
      counts={{
        hero: elementsArr.filter((e) => e.kind === 'advanced').length,
        crowd: elementsArr.filter((e) => e.kind === 'crowd').length,
        camera: camerasArr.length,
        hasBackground: Boolean(settings.director3dBackground || settings.director3dBackgroundSourceNodeId),
        hasGround: Boolean(settings.director3dGroundPlan),
        selectedHasPath: false, // Task 17/18 接入
      }}
      onActivateTool={setActiveTool}
      onAddHero={onAddHero}
      onTogglePathPreview={() => setPathPreviewPlaying((p) => !p)}
      isPathPreviewPlaying={pathPreviewPlaying}
    />
  );

  const viewport = (
    <div style={{ position: 'relative', borderRadius: 11, overflow: 'hidden' }}>
      <DirectorStageViewport
        ref={viewportRef}
        backgroundSrc={settings.director3dBackground as string | undefined}
        backgroundColor={(settings.director3dBackgroundColor as string) || '#0a1828'}
        groundPlanSrc={settings.director3dGroundPlan as string | undefined}
        groundPlanOpacity={(settings.director3dGroundPlanOpacity as number) ?? 0.82}
        groundPlanScale={(settings.director3dGroundPlanScale as number) ?? 1}
        groundPlanRotation={(settings.director3dGroundPlanRotation as number) ?? 0}
        groundPlanOffsetX={(settings.director3dGroundPlanOffsetX as number) ?? 0}
        groundPlanOffsetZ={(settings.director3dGroundPlanOffsetZ as number) ?? 0}
        elements={(settings.director3dElements || []) as any[]}
        cameras={(settings.director3dCameras || []) as any[]}
        selectedElementId={selectedElementIds[0] || undefined}
        selectedElementIds={(settings.director3dSelectedElementIds || []) as string[]}
        activeCameraId={activeCamId}
        viewportMode={viewportMode === 'camera' ? 'camera' : 'director'}
        showGrid={(settings.director3dShowGrid as boolean) ?? true}
        showCameras={(settings.director3dShowCameras as boolean) ?? true}
        showTargets={(settings.director3dShowTargets as boolean) ?? true}
        showFocus={(settings.director3dShowFocus as boolean) ?? true}
        showElementNumbers={(settings.director3dShowElementNumbers as boolean) ?? true}
        showGroundPlan={(settings.director3dShowGroundPlan as boolean) ?? true}
        showPaths={(settings.director3dShowPaths as boolean) ?? true}
        orbit={orbit}
        onOrbitChange={setOrbit}
        onSelectElement={(id) => {
          if (id) setSelectedElementIds(expandElementSelection(elementsArr, [id]));
          else setSelectedElementIds([]);
        }}
        onSelectElements={(ids) => {
          setSelectedElementIds(expandElementSelection(elementsArr, ids));
        }}
        onSelectCamera={(id) => {
          setSelectedCameraIdLocal(id);
        }}
        onMoveElement={(id, x, z) => {
          onUpdateElement(id, { x, z });
        }}
        onMoveElementY={(id, y) => {
          onUpdateElement(id, { y });
        }}
        onRotateElement={(id, rotationY) => {
          onUpdateElement(id, { rotationY });
        }}
        onMoveCamera={(id, x, z) => {
          onUpdateCamera(id, { x, z });
        }}
        onMoveCameraTarget={(id, x, z) => {
          onUpdateCamera(id, { targetX: x, targetZ: z });
        }}
      />
      <div className="dsv2-hud-overlay">
        <ViewportTopHud
          activeCameraName={activeCam?.name || null}
          activeCameraShotType={activeCam?.shotType || null}
          activeCameraFrame={activeCam?.frame || 'none'}
          showGrid={settings.director3dShowGrid ?? true}
          showElementNumbers={settings.director3dShowElementNumbers ?? true}
          showPaths={settings.director3dShowPaths ?? true}
          onToggleGrid={() => onUpdateNode?.(node.id, { settings: { ...(settings), director3dShowGrid: !(settings.director3dShowGrid ?? true) } })}
          onToggleNumbers={() => onUpdateNode?.(node.id, { settings: { ...(settings), director3dShowElementNumbers: !(settings.director3dShowElementNumbers ?? true) } })}
          onTogglePaths={() => onUpdateNode?.(node.id, { settings: { ...(settings), director3dShowPaths: !(settings.director3dShowPaths ?? true) } })}
        />
        <ViewportBottomHud
          fov={activeCam?.fov || 42}
          distance={settings.director3dOrbitDistance || 9}
          onResetView={() => { viewportRef.current?.resetView?.(); }}
          onFitScene={() => { viewportRef.current?.fitScene?.(); }}
        />
        {elementsArr.length === 0 && camerasArr.length <= 1 && !settings.director3dBackground ? (
          <EmptyStateHint />
        ) : null}
      </div>
    </div>
  );

  const inspector = (
    <RightInspector
      elements={elementsArr as any}
      cameras={camerasArr as any}
      selectedElementIds={selectedElementIds}
      selectedCameraId={selectedCameraId}
      activeCameraId={settings.director3dActiveCameraId as string || null}
      activeTool={activeTool}
      onUpdateElement={onUpdateElement}
      onUpdateCamera={onUpdateCamera}
      onDeleteElement={onDeleteElement}
      onDeleteCamera={onDeleteCamera}
      onSelectElement={(id) => setSelectedElementIds(id ? expandElementSelection(elementsArr, [id]) : [])}
      onSelectCamera={(id) => setSelectedCameraIdLocal(id)}
      onGenerateCrowd={onGenerateCrowd}
      onClearActiveTool={() => setActiveTool(null)}
      connectedSources={connectedSources}
      backgroundColor={(settings.director3dBackgroundColor as string) || '#10172a'}
      currentBackground={(settings.director3dBackground as string) || ''}
      currentBackgroundSourceNodeId={(settings.director3dBackgroundSourceNodeId as string) || null}
      onSelectBackgroundSource={onSelectBackgroundSource}
      onClearBackgroundSource={onClearBackgroundSource}
      onPickBackgroundColor={onPickBackgroundColor}
      groundPlanUrl={(settings.director3dGroundPlan as string) || ''}
      showGroundPlan={(settings.director3dShowGroundPlan as boolean) ?? true}
      groundOpacity={(settings.director3dGroundPlanOpacity as number) ?? 0.82}
      groundScale={(settings.director3dGroundPlanScale as number) ?? 1}
      groundRotation={(settings.director3dGroundPlanRotation as number) ?? 0}
      groundOffsetX={(settings.director3dGroundPlanOffsetX as number) ?? 0}
      groundOffsetZ={(settings.director3dGroundPlanOffsetZ as number) ?? 0}
      onUpdateGround={onUpdateGround}
      onUploadBackgroundFile={onUploadBackgroundFile}
      onUploadGroundFile={onUploadGroundFile}
      onClearGroundFile={onClearGroundFile}
    />
  );

  const diagBar = (
    <DiagnosticBar
      heroCount={elementsArr.filter((e) => e.kind === 'advanced').length}
      crowdCount={elementsArr.filter((e) => e.kind === 'crowd').length}
      cameraCount={camerasArr.length}
      backgroundLabel={settings.director3dBackground ? '已连接' : settings.director3dBackgroundColor ? '纯色' : null}
      activeCameraName={activeCam?.name || null}
      activeCameraShotType={activeCam?.shotType || null}
      activeCameraFrame={activeCam?.frame || 'none'}
    />
  );

  return (
    <WorkbenchShell
      title={title}
      isDirty={isDirty}
      viewportMode={viewportMode}
      onViewportModeChange={onViewportModeChange}
      onTitleChange={onTitleChange}
      onSave={onSave}
      onClose={onClose}
      leftRail={leftRail}
      viewport={viewport}
      inspector={inspector}
      diagBar={diagBar}
    />
  );
}
