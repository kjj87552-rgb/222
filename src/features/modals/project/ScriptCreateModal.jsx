import React from 'react';
import { IText, IVideo, IScript, ISparkle, IClose, IAdd, IPlay } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { useProject } from '../../../shared/store/canvasStore.js';
import { uploadFileAsAsset, analyzeVideoFileWithBackend } from '../../../shared/utils/uploadHelpers.js';

const MAX_CHAR_IMAGES = 3;
const VIDEO_FRAME_COUNT = 6;
const MAX_VIDEO_DURATION_SEC = 60;

export function ScriptCreateModal({ onCreate, onClose: closeModal }) {
  const onClose = closeModal || uiActions.closeOverlayModal;
  const project = useProject();
  const projectId = project?.id || 'local-default';

  const [mode, setMode] = React.useState('script');
  const [text, setText] = React.useState('');
  const [shotsCount, setShotsCount] = React.useState('8');

  /* char-mode state — up to MAX_CHAR_IMAGES asset records */
  const [charImages, setCharImages] = React.useState([]);

  /* video-mode state — single video file + extracted frame asset records */
  const [videoFile, setVideoFile] = React.useState(null);
  const [videoAsset, setVideoAsset] = React.useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = React.useState('');
  const [videoFrames, setVideoFrames] = React.useState([]);
  const [videoMeta, setVideoMeta] = React.useState(null); // { duration, width, height }
  const [videoStage, setVideoStage] = React.useState('');

  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');

  const charInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);

  /* Cleanup video preview blob URL on unmount or replacement. */
  React.useEffect(() => () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
  }, [videoPreviewUrl]);

  const modes = [
    { k: 'script', icon: <IText size={16}/>, h: '剧本创作', d: '粘贴或撰写剧情文本，AI 自动拆分为分镜表' },
    { k: 'video',  icon: <IVideo size={16}/>, h: '参考视频复刻', d: '上传参考视频，AI 拆解节奏、镜头和关键帧', badge: '新' },
  ];

  /* === Char-mode upload handlers === */

  const onPickCharFiles = async (event) => {
    const files = Array.from(event.target?.files || []);
    if (event.target) event.target.value = '';
    if (!files.length) return;
    const remaining = Math.max(0, MAX_CHAR_IMAGES - charImages.length);
    if (remaining === 0) {
      setError(`角色参考图最多 ${MAX_CHAR_IMAGES} 张`);
      return;
    }
    const accepted = files.slice(0, remaining).filter((f) => f.type.startsWith('image/'));
    if (!accepted.length) {
      setError('请选择图片文件');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const results = [];
      for (const file of accepted) {
        const record = await uploadFileAsAsset(file, projectId, 'image', { source: 'script-create.char' });
        if (record) results.push(record);
      }
      if (!results.length) {
        setError('上传失败 — 后端可能未连接');
      } else {
        setCharImages((cur) => [...cur, ...results]);
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setUploading(false);
    }
  };

  const removeCharImage = (idx) => {
    setCharImages((cur) => cur.filter((_, i) => i !== idx));
  };

  /* === Video-mode upload + frame extraction === */

  const onPickVideoFile = async (event) => {
    const file = event.target?.files?.[0];
    if (event.target) event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }
    setError('');
    setUploading(true);
    try {
      /* Replace any prior video state. */
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      const previewUrl = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoAsset(null);
      setVideoPreviewUrl(previewUrl);
      setVideoFrames([]);
      setVideoMeta(null);
      setVideoStage('正在提交后端 FFmpeg 解析…');

      const {
        videoAsset: uploadedVideo,
        frames: records,
        frameTimes,
        scenes,
        analysis,
        duration,
        width,
        height,
        videoReferenceAnalysis,
      } = await analyzeVideoFileWithBackend(file, projectId, {
        maxFrames: VIDEO_FRAME_COUNT,
        sceneDetectionStrength: 60,
        referenceIntent: 'structure_reference',
        onStage: setVideoStage,
      });
      if (duration > MAX_VIDEO_DURATION_SEC) {
        setError(`视频时长超过 ${MAX_VIDEO_DURATION_SEC}s — 仍会按抽样帧分析，但建议精简素材`);
      }
      const nextVideoMeta = {
        duration,
        width,
        height,
        frameCount: records.length,
        frameTimes,
        scenes,
        sceneCount: scenes.length,
        analysis,
        videoReferenceAnalysis,
      };
      setVideoMeta(nextVideoMeta);
      setVideoAsset(uploadedVideo);
      if (!records.length) {
        setError('后端未生成关键帧，请检查 FFmpeg 配置');
      } else {
        setVideoFrames(records);
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setVideoStage('');
      setUploading(false);
    }
  };

  const clearVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoAsset(null);
    setVideoPreviewUrl('');
    setVideoFrames([]);
    setVideoMeta(null);
    setVideoStage('');
    setError('');
  };

  /* === Submit gating === */

  const canSubmit = (() => {
    if (uploading) return false;
    if (mode === 'script') return Boolean(text.trim());
    if (mode === 'char') return charImages.length > 0;
    if (mode === 'video') return videoFrames.length > 0;
    return false;
  })();

  const handleSubmit = () => {
    if (!canSubmit) return;
    /* Active image references for the orchestrator (char + video share the same field). */
    const images = mode === 'char'
      ? charImages
      : mode === 'video'
        ? videoFrames
        : [];
    onCreate?.({
      mode,
      text,
      shotsCount,
      images,
      characterPlan: mode === 'char' ? buildCharacterPlan(charImages, text) : null,
      characterImages: mode === 'char' ? charImages : [],
      videoFrames: mode === 'video' ? videoFrames : [],
      videoAsset: mode === 'video' ? videoAsset : null,
      videoAnalysis: mode === 'video' ? videoMeta?.analysis || null : null,
      videoScenes: mode === 'video' ? videoMeta?.scenes || [] : [],
      referenceAssets: mode === 'char'
        ? charImages
        : mode === 'video'
          ? [videoAsset, ...videoFrames].filter(Boolean)
          : [],
      /* Video metadata helps the orchestrator note this came from a video reference. */
      videoMeta: mode === 'video' ? { ...(videoMeta || {}), filename: videoFile?.name || null } : null,
    });
    onClose();
  };

  const submitLabel = uploading ? '上传中…' : '开始生成';

  return (
    <XModal
      title="新建分镜脚本"
      icon={<IScript size={16}/>}
      onClose={onClose}
      className="sc-modal"
      footer={<>
        <span className="x-credit"><ISparkle size={11}/>预计消耗 {mode === 'video' ? 24 : 12} 算力</span>
        <span style={{ flex: 1 }}/>
        {error && <span style={{ color: '#fca5a5', fontSize: 11, marginRight: 8 }}>{error}</span>}
        <button className="x-btn ghost" onClick={onClose}>取消</button>
        <button
          className="x-btn primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={!canSubmit ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <ISparkle size={12}/>{submitLabel}
        </button>
      </>}
    >
      <div className="sc-modes">
        {modes.map(m => (
          <button key={m.k} className={`sc-mode ${mode===m.k?'active':''}`} onClick={() => { setMode(m.k); setError(''); }}>
            {m.badge && <span className="badge-new">{m.badge}</span>}
            <div className="ic">{m.icon}</div>
            <h3>{m.h}</h3>
            <p>{m.d}</p>
          </button>
        ))}
      </div>

      <div className="sc-form">
        {mode === 'script' && (
          <>
            <div className="sc-field">
              <label>剧情 / 剧本片段</label>
              <textarea rows="6" value={text} onChange={e => setText(e.target.value)}
                placeholder="例如：少女走进旧书店，铃铛轻响。她环视一圈，目光停在窗边的诗集上，伸手取下..."/>
            </div>
            <div className="sc-field">
              <label>分镜数量</label>
              <input value={shotsCount} onChange={e => setShotsCount(e.target.value)} placeholder="8"/>
            </div>
          </>
        )}

        {mode === 'char' && (
          <>
            <div className="sc-field">
              <label>上传角色参考图（{charImages.length}/{MAX_CHAR_IMAGES} 张）</label>
              <div className="sc-uploaded">
                {charImages.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="pic"
                    style={{ backgroundImage: `url(${img.url || img.src || ''})` }}
                  >
                    <span
                      className="x"
                      onClick={() => removeCharImage(idx)}
                      role="button"
                      tabIndex={0}
                    ><IClose size={10}/></span>
                  </div>
                ))}
                {charImages.length < MAX_CHAR_IMAGES && (
                  <div
                    className="add"
                    onClick={() => charInputRef.current?.click()}
                    style={{ opacity: uploading ? 0.5 : 1, cursor: uploading ? 'wait' : 'pointer' }}
                    role="button"
                    tabIndex={0}
                  >
                    <IAdd size={20}/>
                  </div>
                )}
              </div>
              <input
                ref={charInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onPickCharFiles}
                style={{ display: 'none' }}
              />
            </div>
            <div className="sc-field">
              <label>剧情描述</label>
              <textarea rows="4" value={text} onChange={e => setText(e.target.value)}
                placeholder="描述角色在故事中的行为与情绪..."/>
            </div>
          </>
        )}

        {mode === 'video' && (
          <>
            <div className="sc-field">
              <label>上传参考视频（≤{MAX_VIDEO_DURATION_SEC}s）</label>
              {!videoFile ? (
                <div
                  className="add"
                  onClick={() => videoInputRef.current?.click()}
                  style={{
                    width: 160, aspectRatio: '16/9', height: 'auto',
                    border: '1px dashed var(--line)', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--ink-mute)', cursor: uploading ? 'wait' : 'pointer',
                    opacity: uploading ? 0.5 : 1,
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <IAdd size={20}/>
                </div>
              ) : (
                <div className="sc-uploaded">
                  <div className="pic" style={{
                    backgroundImage: videoFrames[0]?.url ? `url(${videoFrames[0].url})` : 'none',
                    backgroundColor: '#0a0a0a',
                    width: 160, aspectRatio: '16/9', height: 'auto',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      <IPlay size={20}/>
                    </div>
                    <span
                      className="x"
                      onClick={clearVideo}
                      role="button"
                      tabIndex={0}
                    ><IClose size={10}/></span>
                  </div>
                  {videoMeta && (
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', alignSelf: 'center', marginLeft: 12 }}>
                      时长 {videoMeta.duration?.toFixed(1)}s · 检测 {videoMeta.sceneCount || 1} 个镜头/场景 · 关键帧 {videoFrames.length}
                      {videoMeta.analysis?.pacing ? ` · ${formatPacing(videoMeta.analysis.pacing)}` : ''}
                      {videoAsset ? ' · 原视频已保存' : ''}
                    </div>
                  )}
                  {uploading && videoStage && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', alignSelf: 'center', marginLeft: 12 }}>
                      {videoStage}
                    </div>
                  )}
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={onPickVideoFile}
                style={{ display: 'none' }}
              />
            </div>
            <div className="sc-field">
              <label>额外提示词（可选）</label>
              <input value={text} onChange={e => setText(e.target.value)}
                placeholder="例如：保留分镜节奏，但替换为科幻题材"/>
            </div>
            {videoFrames.length > 0 && (
              <div className="sc-field">
                <label>智能关键帧（按镜头变化选择）</label>
                <div className="sc-analysis-note">
                  <span>场景检测</span>
                  <em>{videoMeta?.sceneCount || 1} 段</em>
                  <em>{videoMeta?.analysis?.sampleCount || videoFrames.length} 个采样点</em>
                  <em>{videoMeta?.analysis?.cutCount || 0} 个剪切点</em>
                  {videoMeta?.analysis?.averageSceneDuration && (
                    <em>平均 {Number(videoMeta.analysis.averageSceneDuration).toFixed(1)}s/镜头</em>
                  )}
                </div>
                <div className="sc-frame-strip">
                  {videoFrames.map((frame, idx) => (
                    <div
                      key={frame.id || idx}
                      className="frame"
                      style={{ backgroundImage: `url(${frame.url || frame.src || ''})` }}
                    >
                      <span>{idx + 1}</span>
                      {Number.isFinite(Number(frame.timestampSec)) && (
                        <em>{Number(frame.timestampSec).toFixed(1)}s</em>
                      )}
                      {Number.isFinite(Number(frame.sceneIndex)) && (
                        <strong>镜头 {Number(frame.sceneIndex) + 1}</strong>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </XModal>
  );
}

function buildCharacterPlan(images = [], storyText = '') {
  const count = images.length;
  return {
    mode: count > 1 ? 'multi-reference-character-lock' : 'single-character-lock',
    referenceCount: count,
    hasStoryText: Boolean(String(storyText || '').trim()),
    referenceSlots: images.map((img, index) => ({
      index: index + 1,
      assetId: img?.id || null,
      title: img?.title || img?.name || img?.filename || `角色参考图${index + 1}`,
      role: index === 0 ? 'primary-identity-reference' : 'secondary-angle-or-outfit-reference',
    })),
    analysisWorkflow: [
      '先识别每张图的人物身份、年龄感、发型、服装、标志物、气质表情',
      '判断多图是同一角色多视角/多造型，还是多个不同角色',
      '合并不冲突的视觉信息，冲突项优先采用第一张主参考图',
      '输出分镜前先形成角色设定表，并在每个镜头中延续角色一致性',
    ],
    consistencyLocks: [
      '脸型与五官比例',
      '发型与发色',
      '服装轮廓与主色',
      '体型比例与年龄感',
      '标志配饰或道具',
      '气质、表情习惯与角色关系',
    ],
    conflictPolicy: '多参考图出现冲突时，优先锁定第一张图的人物身份；后续图片只补充角度、服装细节、表情和姿态，不覆盖核心身份。',
    storyboardRules: [
      '先建立角色视觉设定，再写分镜',
      '每个镜头都要保持角色外观一致',
      '不要凭空改变发型、服饰主色和年龄感',
      '如果多张图属于同一角色，合并为同一角色设定；如果明显是不同角色，建立角色关系',
      '每条分镜都要明确角色在画面中的动作、情绪、景别、构图和镜头运动',
    ],
  };
}

function formatPacing(pacing) {
  if (pacing === 'fast-cut') return '快切节奏';
  if (pacing === 'slow-build') return '慢镜铺陈';
  return '均衡节奏';
}
