import React from 'react';
import { useModal, useTopModal, useOverlayModal, uiActions } from '../../shared/store/uiStore.js';

// account top-modals (singletons)
import { ShareModal } from './account/ShareModal.jsx';
import { MessageModal } from './account/MessageModal.jsx';
import { MemberModal } from './account/MemberModal.jsx';
import { AccountModal } from './account/AccountModal.jsx';

// overlay singletons
import { ProjectsModal } from './project/ProjectsModal.jsx';
import { ScriptCreateModal } from './project/ScriptCreateModal.jsx';
import { HistoryModal } from './library/HistoryModal.jsx';
import { SubjectLibModal } from './library/SubjectLibModal.jsx';
import { StyleLibModal } from './library/StyleLibModal.jsx';
import { ComplianceModal } from './account/ComplianceModal.jsx';
import { RealPersonModal } from './account/RealPersonModal.jsx';
import { RedeemModal } from './account/RedeemModal.jsx';

// middle-layer (caller-driven, with props)
import { NodePreviewModal } from './shared/NodePreviewModal.jsx';
import { AutoUpdateModal } from './shared/AutoUpdateModal.jsx';
import { AngleModal } from './image-edit/AngleModal.jsx';
import { LightModal } from './image-edit/LightModal.jsx';
import { RotateModal } from './image-edit/RotateModal.jsx';
import { MarkupModal } from './image-edit/MarkupModal.jsx';
import { FocusEditModal } from './image-edit/FocusEditModal.jsx';
import { LensFocusModal } from './image-edit/LensFocusModal.jsx';
import { FrameCapModal } from './image-edit/FrameCapModal.jsx';
import { GridSplitModal } from './image-edit/GridSplitModal.jsx';
import { PanoModal } from './image-edit/PanoModal.jsx';
import { UpscalePopover } from './image-edit/UpscalePopover.jsx';
import {
  ImageAnnotateToolModal,
  ImageCropToolModal,
  ImageSplitToolModal,
  ImageUpscaleToolModal,
} from './image-edit/CanvasImageToolModals.jsx';
import { CamCtrlPanel } from './image-edit/CamCtrlPanel.jsx';
import { TimelineModal } from './video-edit/TimelineModal.jsx';
import { StoryboardCollectorWorkspaceModal } from './video-edit/StoryboardCollectorWorkspaceModal.jsx';
import { VideoClipModal } from './video-edit/VideoClipModal.jsx';
import { VideoSubtitleRemoveModal } from './video-edit/VideoSubtitleRemoveModal.jsx';
import { VoiceChangeModal } from './audio-edit/VoiceChangeModal.jsx';
import { ToolboxModal } from './library/ToolboxModal.jsx';
import { SaveAssetModal } from './library/SaveAssetModal.jsx';
import { SeedencePortraitLibraryModal } from './library/SeedencePortraitLibraryModal.jsx';
import { ScriptFullModal } from './project/ScriptFullModal.jsx';
import { SaveWorkflowModal } from './project/SaveWorkflowModal.jsx';

// Top layer registry — singleton modals, no props
const TOP_REGISTRY = {
  share:   ShareModal,
  message: MessageModal,
  member:  MemberModal,
  account: AccountModal,
};

// Overlay layer registry — singleton modals, no props
const OVERLAY_REGISTRY = {
  history:      HistoryModal,
  projects:     ProjectsModal,
  compliance:   ComplianceModal,
  realperson:   RealPersonModal,
  redeem:       RedeemModal,
  subject:      SubjectLibModal,
  style:        StyleLibModal,
};

// Middle layer registry — caller passes props via uiActions.openModal({ kind, ...data })
// Keys match the exact kind strings used in app.jsx setModal({ kind: '...' }) calls.
const MIDDLE_REGISTRY = {
  preview:      NodePreviewModal,   // { kind:'preview', item }
  pano:         PanoModal,          // { kind:'pano', src, nodeId }
  angle:        AngleModal,         // { kind:'angle', src, nodeId }
  light:        LightModal,         // { kind:'light', src, nodeId }
  gridsplit:    GridSplitModal,     // { kind:'gridsplit', src }
  rotate:       RotateModal,        // { kind:'rotate', src }
  timeline:     TimelineModal,      // { kind:'timeline' }
  storyboardcollector: StoryboardCollectorWorkspaceModal, // { kind:'storyboardcollector', nodeId }
  subtitlesremove: VideoSubtitleRemoveModal, // { kind:'subtitlesremove', src, nodeId }
  upscale:      UpscalePopover,     // { kind:'upscale', kindHint }
  markup:       MarkupModal,        // { kind:'markup', src }
  scriptcreate: ScriptCreateModal,   // { kind:'scriptcreate', nodeId, onCreate }
  stylelib:     StyleLibModal,       // { kind:'stylelib', onPick }
  scriptfull:   ScriptFullModal,    // { kind:'scriptfull' }
  focus:        FocusEditModal,     // { kind:'focus', src }
  lens:         LensFocusModal,     // { kind:'lens', src }
  videoclip:    VideoClipModal,     // { kind:'videoclip', src }
  framecap:     FrameCapModal,      // { kind:'framecap', src }
  voicechange:  VoiceChangeModal,   // { kind:'voicechange' }
  toolbox:      ToolboxModal,       // { kind:'toolbox' }
  saveasset:    SaveAssetModal,      // { kind:'saveasset', nodeId }
  seedencePortraitLibrary: SeedencePortraitLibraryModal,
  imagecrop:    ImageCropToolModal,
  imageannotate: ImageAnnotateToolModal,
  imagesplit:   ImageSplitToolModal,
  imageupscale: ImageUpscaleToolModal,
  saveworkflow: SaveWorkflowModal,  // { kind:'saveworkflow', count }
};

export function ModalRoot() {
  const modal        = useModal();        // { kind, src?, item?, ... } | null
  const topModal     = useTopModal();     // 'share' | 'message' | 'member' | 'account' | null
  const overlayModal = useOverlayModal(); // 'history' | 'projects' | ... | null

  const overlayKind = typeof overlayModal === 'string' ? overlayModal : overlayModal?.kind;
  const overlayProps = overlayModal && typeof overlayModal === 'object' ? overlayModal : {};
  const Top     = topModal     && TOP_REGISTRY[topModal];
  const Overlay = overlayKind  && OVERLAY_REGISTRY[overlayKind];
  const Middle  = modal        && MIDDLE_REGISTRY[modal.kind];

  return (
    <>
      {Middle && (
        <Middle
          {...modal}                         // passes src, item, kind, nodeId, count, etc.
          onClose={uiActions.closeModal}     // default close — caller may override via modal spread
        />
      )}
      {Overlay && <Overlay {...overlayProps} />}
      {Top && <Top />}
      <AutoUpdateModal />
    </>
  );
}
