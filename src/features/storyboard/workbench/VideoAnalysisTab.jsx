import React from 'react';
import { storyboardPackageActions } from '../../../shared/store/storyboardPackageStore.js';
import { uploadFileAsAsset } from '../../../shared/utils/uploadHelpers.js';
import {
  REFERENCE_INTENTS,
  refreshReferenceDiagnostics,
  upsertSourceAsset,
} from '../reference/referencePackage.js';
import {
  runStoryboardReferenceAnalysis,
  runStoryboardVideoReferenceAnalysis,
} from '../storyboardOrchestrator.js';
import { asArray, displayFirst, displayKey, displayValue } from './displayValue.js';

const DEFAULT_REFERENCE_INTENT = REFERENCE_INTENTS.structure;
const DEFAULT_SCENE_DETECTION_STRENGTH = 60;
const DEFAULT_MIN_SCENE_DURATION = 0.8;
const DEFAULT_EXTRACTION_STRATEGY = 'scene_representative';
const DEFAULT_MAX_FRAMES = 8;

const clampNumber = (value, fallback, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, numeric));
};

const strengthPresetFromStrength = (strength) => {
  if (strength <= 40) return 'low';
  if (strength >= 78) return 'high';
  return 'medium';
};

const sceneLabel = (scene, index) => (
  displayFirst([
    scene?.title,
    scene?.name,
    scene?.id,
  ], `场景 ${index + 1}`)
);

const sceneDescription = (scene) => (
  displayFirst([
    scene?.summary,
    scene?.description,
    scene?.timeRange,
  ], '')
);

const sourceKind = (kind) => {
  const value = String(kind || '').toLowerCase();
  if (value.includes('video')) return 'video';
  if (value.includes('image')) return 'image';
  return 'unknown';
};

const assetUrl = (asset) => displayFirst([
  asset?.url,
  asset?.src,
  asset?.assetUrl,
  asset?.previewUrl,
  asset?.path,
], '');

const videoTitle = (asset, index) => displayFirst([
  asset?.title,
  asset?.name,
  asset?.filename,
  asset?.assetId,
  asset?.id,
], `参考视频 ${index + 1}`);

const frameKey = (frame, index = 0) => displayKey([
  frame?.id,
  frame?.assetId,
  frame?.url,
  frame?.assetUrl,
  frame?.path,
], `frame-${index}`);

export function VideoAnalysisTab({
  nodeId,
  projectId,
  node,
  storyboardPackage,
  onTask,
  view = 'frames',
}) {
  const analysis = storyboardPackage?.videoReferenceAnalysis;
  const scenes = asArray(analysis?.scenes || storyboardPackage?.sceneBible?.scenes);
  const frames = asArray(analysis?.frames);
  const frameCandidates = asArray(analysis?.frameCandidates?.length ? analysis.frameCandidates : analysis?.frames);
  const sourceVideos = asArray(storyboardPackage?.sourceAssets)
    .filter((asset) => sourceKind(asset?.kind || asset?.type) === 'video');
  const analysisSceneDetect = analysis?.sceneDetect || {};
  const initialStrength = Number(displayFirst([
    analysisSceneDetect?.strength,
    analysisSceneDetect?.sceneDetectionStrength,
    analysis?.sceneDetectionStrength,
    analysis?.sceneDetectStrength,
  ], String(DEFAULT_SCENE_DETECTION_STRENGTH)));
  const initialMaxFrames = Number(displayFirst([
    analysisSceneDetect?.maxFrames,
    analysis?.analysis?.sampleCount,
  ], String(DEFAULT_MAX_FRAMES)));
  const [selectedVideoId, setSelectedVideoId] = React.useState(sourceVideos[0]?.id || '');
  const [sceneDetectionStrength, setSceneDetectionStrength] = React.useState(
    clampNumber(initialStrength, DEFAULT_SCENE_DETECTION_STRENGTH, 0, 100),
  );
  const [maxFrames, setMaxFrames] = React.useState(
    clampNumber(initialMaxFrames, DEFAULT_MAX_FRAMES, 4, 24),
  );
  const [selectedFrameKeys, setSelectedFrameKeys] = React.useState([]);
  const [busy, setBusy] = React.useState('');
  const fileInputRef = React.useRef(null);
  const frameCandidateSignature = frameCandidates
    .map((frame, index) => `${frameKey(frame, index)}:${frame?.userSelected !== false ? '1' : '0'}`)
    .join('|');

  React.useEffect(() => {
    if (!selectedVideoId && sourceVideos[0]?.id) setSelectedVideoId(sourceVideos[0].id);
  }, [selectedVideoId, sourceVideos]);

  React.useEffect(() => {
    setSelectedFrameKeys(
      frameCandidates
        .map((frame, index) => ({ frame, key: frameKey(frame, index) }))
        .filter(({ frame }) => frame?.userSelected !== false)
        .map(({ key }) => key),
    );
  }, [frameCandidateSignature]);

  const selectedVideo = sourceVideos.find((asset) => asset?.id === selectedVideoId) || sourceVideos[0] || null;
  const selectedFrameSet = React.useMemo(() => new Set(selectedFrameKeys), [selectedFrameKeys]);

  const updatePackage = React.useCallback((updater) => {
    if (!nodeId) return;
    storyboardPackageActions.updateNodePackage(nodeId, { projectId, updater });
  }, [nodeId, projectId]);

  const handleUpload = React.useCallback(async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type?.startsWith('video/')) {
      onTask?.({ id: 'storyboard-video-reference-analyze', error: '请选择视频文件' });
      return;
    }
    setBusy('upload');
    try {
      const record = await uploadFileAsAsset(file, projectId, 'video', {
        source: 'storyboard-video-reference-upload',
      });
      if (!record) {
        onTask?.({ id: 'storyboard-video-reference-analyze', error: '视频上传失败，后端未返回资产记录' });
        return;
      }
      const nextSource = {
        origin: 'local_upload',
        assetId: record.id || record.assetId,
        kind: 'video',
        title: record.title || file.name,
        url: assetUrl(record),
        referenceIntent: DEFAULT_REFERENCE_INTENT,
      };
      updatePackage((pkg) => refreshReferenceDiagnostics(upsertSourceAsset(pkg, nextSource)));
      setSelectedVideoId(`source_local_upload_${record.id || record.assetId || assetUrl(record)}`);
      onTask?.({ id: 'storyboard-video-reference-analyze', stage: '视频已保存，可开始后端解析', progress: 0 });
    } catch (error) {
      onTask?.({ id: 'storyboard-video-reference-analyze', error: String(error?.message || error) });
    } finally {
      setBusy('');
    }
  }, [onTask, projectId, updatePackage]);

  const handleAnalyze = React.useCallback(async () => {
    if (!selectedVideo) {
      onTask?.({ id: 'storyboard-video-reference-analyze', error: '请先上传或在参考页添加一个视频素材' });
      return;
    }
    setBusy('analyze');
    try {
      onTask?.({ id: 'storyboard-video-reference-analyze', stage: '准备后端 FFmpeg 解析…', progress: 0 });
      const normalizedStrength = clampNumber(
        sceneDetectionStrength,
        DEFAULT_SCENE_DETECTION_STRENGTH,
        0,
        100,
      );
      const normalizedMaxFrames = clampNumber(maxFrames, DEFAULT_MAX_FRAMES, 4, 24);
      const strengthPreset = strengthPresetFromStrength(normalizedStrength);
      const sceneDetect = {
        strength: normalizedStrength,
        sceneDetectionStrength: normalizedStrength,
        strengthPreset,
        minSceneDuration: DEFAULT_MIN_SCENE_DURATION,
        maxFrames: normalizedMaxFrames,
        strategy: DEFAULT_EXTRACTION_STRATEGY,
      };
      const result = await runStoryboardVideoReferenceAnalysis({
        sourceAsset: {
          ...selectedVideo,
          referenceIntent: DEFAULT_REFERENCE_INTENT,
        },
        projectId,
        nodeId,
        referenceIntent: DEFAULT_REFERENCE_INTENT,
        sceneDetectionStrength: normalizedStrength,
        strengthPreset,
        minSceneDuration: DEFAULT_MIN_SCENE_DURATION,
        extractionStrategy: DEFAULT_EXTRACTION_STRATEGY,
        sceneDetect,
        maxFrames: normalizedMaxFrames,
        onProgress: (payload) => onTask?.({ id: 'storyboard-video-reference-analyze', ...payload }),
      });
      if (!result.ok) {
        onTask?.({ id: 'storyboard-video-reference-analyze', error: result.error || '视频解析任务提交失败' });
      }
    } catch (error) {
      onTask?.({ id: 'storyboard-video-reference-analyze', error: String(error?.message || error) });
    } finally {
      setBusy('');
    }
  }, [
    maxFrames,
    nodeId,
    onTask,
    projectId,
    sceneDetectionStrength,
    selectedVideo,
  ]);

  const toggleFrame = React.useCallback((key) => {
    setSelectedFrameKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return [...next];
    });
  }, []);

  const selectAllFrames = React.useCallback(() => {
    setSelectedFrameKeys(frameCandidates.map((frame, index) => frameKey(frame, index)));
  }, [frameCandidateSignature]);

  const clearFrames = React.useCallback(() => {
    setSelectedFrameKeys([]);
  }, []);

  const handleConfirmKeyframes = React.useCallback(() => {
    if (!analysis || frameCandidates.length === 0) return;
    if (selectedFrameKeys.length === 0) {
      onTask?.({ id: 'storyboard-video-reference-analyze', error: '请至少选择一个关键帧' });
      return;
    }
    const selectedKeys = new Set(selectedFrameKeys);
    updatePackage((pkg) => {
      const currentAnalysis = pkg?.videoReferenceAnalysis || analysis;
      const candidates = asArray(
        currentAnalysis?.frameCandidates?.length ? currentAnalysis.frameCandidates : currentAnalysis?.frames,
      ).map((frame, index) => ({
        ...frame,
        userSelected: selectedKeys.has(frameKey(frame, index)),
      }));
      const selectedFrames = candidates.filter((frame, index) => selectedKeys.has(frameKey(frame, index)))
        .map((frame) => ({ ...frame, userSelected: true }));
      const selectedSceneIds = new Set(selectedFrames.map((frame) => frame.sceneId).filter(Boolean));
      const selectedSceneIndexes = new Set(selectedFrames.map((frame) => frame.sceneIndex).filter((value) => value !== null && value !== undefined));
      const nextScenes = asArray(currentAnalysis?.scenes).map((scene) => {
        const selected = selectedSceneIds.has(scene?.id)
          || selectedSceneIndexes.has(scene?.index);
        return {
          ...scene,
          userSelected: selected,
        };
      });
      return {
        ...pkg,
        videoReferenceAnalysis: {
          ...currentAnalysis,
          frameCandidates: candidates,
          frames: selectedFrames,
          scenes: nextScenes,
          status: 'ready',
          keyframesConfirmedAt: new Date().toISOString(),
        },
        reviewState: {
          ...pkg?.reviewState,
          videoReviewed: true,
        },
      };
    });
    onTask?.({ id: 'storyboard-video-reference-analyze', stage: '关键帧已确认', progress: 100 });
  }, [analysis, frameCandidateSignature, onTask, selectedFrameKeys, updatePackage]);

  const isInputView = view === 'input';
  const title = isInputView ? '视频输入' : '抽帧分析';
  const subtitle = isInputView
    ? (selectedVideo ? videoTitle(selectedVideo, 0) : '上传或选择参考视频')
    : `FFmpeg 场景检测 · 关键帧 ${frameCandidates.length}`;

  return (
    <section className="sb-package-panel">
      <div className="sb-package-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="sb-status-pill">候选 {frameCandidates.length} · 已选 {selectedFrameKeys.length || frames.length}</span>
      </div>

      <div className="sb-video-console">
        <label className="sb-video-source">
          <span>参考视频</span>
          <select
            value={selectedVideo?.id || ''}
            onChange={(event) => setSelectedVideoId(event.target.value)}
            disabled={!sourceVideos.length || busy === 'analyze'}
          >
            {sourceVideos.length ? sourceVideos.map((asset, index) => (
              <option key={displayKey([asset?.id, asset?.assetId, asset?.url], `video-${index}`)} value={asset.id}>
                {videoTitle(asset, index)}
              </option>
            )) : (
              <option value="">暂无视频素材</option>
            )}
          </select>
        </label>

        {!isInputView && (
          <>
            <label className="sb-video-slider">
              <span>
                <strong>检测强度</strong>
                <em>{sceneDetectionStrength}</em>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sceneDetectionStrength}
                disabled={busy === 'analyze'}
                onInput={(event) => setSceneDetectionStrength(Number(event.currentTarget.value))}
                onChange={(event) => setSceneDetectionStrength(Number(event.currentTarget.value))}
              />
            </label>

            <label className="sb-video-slider">
              <span>
                <strong>关键帧上限</strong>
                <em>{maxFrames}</em>
              </span>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={maxFrames}
                disabled={busy === 'analyze'}
                onInput={(event) => setMaxFrames(Number(event.currentTarget.value))}
                onChange={(event) => setMaxFrames(Number(event.currentTarget.value))}
              />
            </label>
          </>
        )}

        <div className="sb-video-actions">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy === 'upload'}>
            上传参考视频
          </button>
          {!isInputView && (
            <button
              type="button"
              className="primary"
              onClick={handleAnalyze}
              disabled={!selectedVideo || busy === 'analyze'}
            >
              解析视频
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={handleUpload}
          />
        </div>
      </div>

      {isInputView && (
        <div className="sb-empty-block">
          {selectedVideo ? '视频已就绪，请进入「抽帧分析」解析并筛选关键帧。' : '请先上传参考视频。'}
        </div>
      )}

      {!isInputView && (
        <>
      {!analysis ? (
        <div className="sb-empty-block">尚未解析参考视频。</div>
      ) : (
        <>
          <div className="sb-video-summary">
            <div>
              <span>时长</span>
              <strong>{displayFirst([analysis.duration, analysis.durationSeconds], '未知')}</strong>
            </div>
            <div>
              <span>场景</span>
              <strong>{scenes.length}</strong>
            </div>
            <div>
              <span>关键帧</span>
              <strong>{frameCandidates.length || frames.length}</strong>
            </div>
            <div>
              <span>检测强度</span>
              <strong>{displayFirst([
                analysis.sceneDetectStrength,
                analysis.sceneDetectionStrength,
                analysis.sceneDetect?.threshold,
                analysis.sceneDetectionThreshold,
              ], '未评估')}</strong>
            </div>
          </div>

          {frameCandidates.length > 0 && (
            <>
              <div className="sb-video-result-head">
                <h3>关键帧</h3>
                <div className="sb-package-actions inline">
                  <button type="button" onClick={selectAllFrames}>全选</button>
                  <button type="button" onClick={clearFrames}>清空</button>
                  <button
                    type="button"
                    className="primary"
                    data-testid="confirm-video-keyframes"
                    onClick={handleConfirmKeyframes}
                    disabled={!selectedFrameKeys.length}
                  >
                    确认关键帧
                  </button>
                </div>
              </div>
              <div className="sb-frame-strip">
                {frameCandidates.map((frame, index) => {
                  const key = frameKey(frame, index);
                  const selected = selectedFrameSet.has(key);
                  return (
                    <label
                      key={key}
                      className={`sb-frame-tile selectable${selected ? ' selected' : ''}`}
                      style={{ backgroundImage: assetUrl(frame) ? `url(${assetUrl(frame)})` : 'none' }}
                    >
                      <input
                        type="checkbox"
                        data-testid={`video-frame-select-${key}`}
                        checked={selected}
                        onChange={() => toggleFrame(key)}
                      />
                      <span>{index + 1}</span>
                      <em>{displayValue(frame?.timestampSec, '')}s</em>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {scenes.length > 0 && (
            <div className="sb-package-list">
              {scenes.map((scene, index) => (
                <div
                  className="sb-package-row"
                  key={displayKey([scene?.id, scene?.title, scene?.name], `scene-${index}`)}
                >
                  <strong>{sceneLabel(scene, index)}</strong>
                  <span>{sceneDescription(scene)}</span>
                </div>
              ))}
            </div>
          )}

        </>
      )}
        </>
      )}
    </section>
  );
}

const promptFrameAssets = (frames) => frames.map((frame, index) => ({
  id: frameKey(frame, index),
  origin: 'manual',
  kind: 'image',
  assetId: frame?.assetId || frame?.id,
  url: assetUrl(frame),
  title: `关键帧 ${index + 1}${frame?.timestampSec !== undefined ? ` · ${frame.timestampSec}s` : ''}`,
  roleHint: '视频抽帧后用户确认用于提示词反推的关键帧',
  referenceIntent: DEFAULT_REFERENCE_INTENT,
})).filter((asset) => asset.assetId || asset.url);

export function VideoPromptReverseTab({
  nodeId,
  projectId,
  node,
  storyboardPackage,
  selectedModel,
  onTask,
}) {
  const analysis = storyboardPackage?.videoReferenceAnalysis;
  const scenes = asArray(analysis?.scenes || storyboardPackage?.sceneBible?.scenes);
  const frames = asArray(analysis?.frames).filter((frame) => frame?.userSelected !== false);
  const confirmedFrames = analysis?.keyframesConfirmedAt ? frames : [];
  const reverseResult = storyboardPackage?.analysisDraft?.referenceAnalysis || {};
  const [busy, setBusy] = React.useState('');

  const handleReversePrompt = React.useCallback(async () => {
    if (!confirmedFrames.length) {
      onTask?.({ id: 'storyboard-video-prompt-reverse', error: '请先在「抽帧分析」确认关键帧' });
      return;
    }
    if (!selectedModel) {
      onTask?.({ id: 'storyboard-video-prompt-reverse', error: '请先在右上角选择或启用 Chat 模型' });
      return;
    }
    const selectedFrameAssets = promptFrameAssets(confirmedFrames);
    if (!selectedFrameAssets.length) {
      onTask?.({ id: 'storyboard-video-prompt-reverse', error: '确认的关键帧缺少可读取的资产地址' });
      return;
    }
    setBusy('reverse');
    try {
      onTask?.({ id: 'storyboard-video-prompt-reverse', stage: '提交关键帧反推…', progress: 0 });
      const sceneLines = scenes.map((scene, index) => (
        `${index + 1}. ${sceneDescription(scene) || scene?.timeRange || sceneLabel(scene, index)}`
      )).join('\n');
      const result = await runStoryboardReferenceAnalysis({
        scriptTitle: node?.title || storyboardPackage?.brief?.title || '参考视频提示词反推',
        scriptExcerpt: [
          '请只基于用户确认的关键帧进行提示词反推，忽略未确认的抽帧。',
          analysis?.analysisPrompt || '',
          sceneLines,
        ].filter(Boolean).join('\n\n').slice(0, 5000),
        sourceAssets: selectedFrameAssets,
        referenceAssets: selectedFrameAssets,
        textCandidates: {
          videoScenes: scenes,
          selectedFrameCount: selectedFrameAssets.length,
          selectedFrameTimes: confirmedFrames.map((frame) => frame?.timestampSec).filter((value) => value !== undefined),
        },
        projectId,
        nodeId,
        model: selectedModel,
        onProgress: (payload) => onTask?.({ id: 'storyboard-video-prompt-reverse', ...payload }),
      });
      if (!result.ok) {
        onTask?.({ id: 'storyboard-video-prompt-reverse', error: result.error || '提示词反推任务提交失败' });
      }
    } catch (error) {
      onTask?.({ id: 'storyboard-video-prompt-reverse', error: String(error?.message || error) });
    } finally {
      setBusy('');
    }
  }, [analysis, confirmedFrames, node, nodeId, onTask, projectId, scenes, selectedModel, storyboardPackage]);

  return (
    <section className="sb-package-panel">
      <div className="sb-package-head">
        <div>
          <h2>提示词反推</h2>
          <p>只使用抽帧分析中确认的关键帧</p>
        </div>
        <span className="sb-status-pill">已确认关键帧 {confirmedFrames.length}</span>
      </div>

      {!analysis ? (
        <div className="sb-empty-block">请先完成抽帧分析。</div>
      ) : !confirmedFrames.length ? (
        <div className="sb-empty-block">请先在「抽帧分析」确认要用于反推的关键帧。</div>
      ) : (
        <>
          <div className="sb-video-result-head">
            <h3>反推关键帧</h3>
            <div className="sb-package-actions inline">
              <button
                type="button"
                className="primary"
                onClick={handleReversePrompt}
                disabled={busy === 'reverse'}
              >
                开始反推提示词
              </button>
            </div>
          </div>

          <div className="sb-frame-strip">
            {confirmedFrames.map((frame, index) => (
              <div
                key={frameKey(frame, index)}
                className="sb-frame-tile selected"
                style={{ backgroundImage: assetUrl(frame) ? `url(${assetUrl(frame)})` : 'none' }}
              >
                <span>{index + 1}</span>
                <em>{displayValue(frame?.timestampSec, '')}s</em>
              </div>
            ))}
          </div>

          {analysis.analysisPrompt && (
            <div className="sb-video-prompt">
              <span>抽帧摘要</span>
              <p>{displayValue(analysis.analysisPrompt, '')}</p>
            </div>
          )}

          {reverseResult.referenceIntentSummary && (
            <div className="sb-video-prompt">
              <span>反推结果</span>
              <p>{displayValue(reverseResult.referenceIntentSummary, '')}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
