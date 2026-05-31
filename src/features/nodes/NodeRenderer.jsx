import React from 'react';
import { NodeRegistry } from '../../shared/platform/nodeRegistry.js';
import { ImageNode } from './ImageNode.jsx';
import { VideoNode } from './VideoNode.jsx';
import { TextNode } from './TextNode.jsx';
import { AudioNode } from './AudioNode.jsx';
import { ScriptNode } from './ScriptNode.jsx';
import { DirectorStageNode } from './DirectorStageNode.jsx';
import { VR720GenNode } from './VR720GenNode.jsx';
import { PanoramaViewerNode } from './PanoramaViewerNode.jsx';
import { AssetGenNode } from './AssetGenNode.jsx';
import { JianyingExportNode } from './JianyingExportNode.jsx';
import { StoryboardCollectorNode } from './StoryboardCollectorNode.jsx';
import { PromptRunnerNode } from './PromptRunnerNode.jsx';

/* Map legacy short type → renderer component.
 * The new dotted types (image.generate, text.note, etc.) all carry a `legacyType`
 * in NODE_DEFINITIONS that points to one of these keys, so this single map covers both. */
const COMPONENT_BY_LEGACY = {
  image:  ImageNode,
  video:  VideoNode,
  text:   TextNode,
  audio:  AudioNode,
  script: ScriptNode,
  'director-stage': DirectorStageNode,
  'vr720-gen': VR720GenNode,
  'panorama-viewer': PanoramaViewerNode,
  'asset-gen': AssetGenNode,
  'jianying-export': JianyingExportNode,
  'storyboard-collector-detail': StoryboardCollectorNode,
  'prompt-runner': PromptRunnerNode,
};

export function resolveNodeRendererNode({ id, node, allNodes = [] }) {
  if (node) return node;
  return typeof allNodes.find === 'function' ? allNodes.find((item) => item.id === id) : null;
}

function NodeRendererBase({ id, type, node, allNodes = [], ...rest }) {
  const def = NodeRegistry.get(type);
  const legacyType = def?.legacyType || type;
  const Comp = COMPONENT_BY_LEGACY[legacyType];
  if (!Comp) return null;
  const resolvedNode = resolveNodeRendererNode({ id, node, allNodes });
  if (!resolvedNode) return null;
  return <Comp id={id} node={resolvedNode} allNodes={allNodes} {...rest} />;
}

export function areNodeRendererPropsEqual(prev, next) {
  return (
    prev.id === next.id
    && prev.type === next.type
    && prev.node === next.node
    && prev.selected === next.selected
    && prev.edges === next.edges
    && prev.projectId === next.projectId
  );
}

export const NodeRenderer = React.memo(NodeRendererBase, areNodeRendererPropsEqual);
