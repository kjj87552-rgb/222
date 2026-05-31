import { jsonRobustParse } from './jsonRobustParse.js';
import { normalizeShotGroups } from './normalizeShot.js';
import { buildShotTasksFromShotGroups } from './package/storyboardPackage.js';

export const SCRIPT_TO_SHOTGROUPS_TAG = 'script-to-shotgroups';

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'canceled']);

const isObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const jobTag = (job) => job?.input?._storyboard || '';

const outputText = (job) => {
  const output = job?.output || {};
  return String(output.text || output.content || output.message || '').trim();
};

const jobError = (job, fallback = '任务失败') => {
  const output = job?.output || {};
  return job?.error || output.error || output.message || output.detail || fallback;
};

const terminalErrorNodePatch = (job, error) => ({
  generating: false,
  progress: 0,
  jobStage: '',
  jobId: job?.id || job?.jobId || '',
  error,
});

const terminalErrorUpdate = (job, error) => ({
  handled: true,
  terminal: true,
  autoPromptInference: false,
  task: { id: SCRIPT_TO_SHOTGROUPS_TAG, error },
  nodePatch: terminalErrorNodePatch(job, error),
});

const directOutputObject = (job) => {
  const output = job?.output || {};
  if (Array.isArray(output)) return output;
  if (isObject(output) && (Array.isArray(output.shotGroups) || Array.isArray(output.shots))) {
    return output;
  }
  return null;
};

const rawShotGroupArray = (data) => {
  if (Array.isArray(data)) return data;
  if (isObject(data)) return data.shotGroups || data.shots || [];
  return [];
};

const hasShotGroupShape = (data) => rawShotGroupArray(data)
  .some((group) => isObject(group) && Array.isArray(group.shots));

function findShotGroupsArrayStart(text) {
  const re = /"shotGroups"\s*:\s*\[/g;
  const match = re.exec(text);
  if (!match) return -1;
  return match.index + match[0].lastIndexOf('[');
}

function salvageShotGroupsFromText(raw) {
  const text = String(raw || '');
  const arrayStart = findShotGroupsArrayStart(text);
  if (arrayStart < 0) return [];

  const groups = [];
  let objectStart = -1;
  let objectDepth = 0;
  let inString = false;
  let escape = false;

  for (let i = arrayStart + 1; i < text.length; i += 1) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      if (objectDepth === 0) objectStart = i;
      objectDepth += 1;
      continue;
    }

    if (ch === '}') {
      if (objectDepth <= 0) continue;
      objectDepth -= 1;
      if (objectDepth === 0 && objectStart >= 0) {
        const candidate = text.slice(objectStart, i + 1);
        try {
          const parsed = JSON.parse(candidate);
          if (isObject(parsed)) groups.push(parsed);
        } catch {
          // Ignore malformed partial objects; earlier complete groups are still useful.
        }
        objectStart = -1;
      }
    }
  }

  return groups;
}

async function parseShotGroupsOutput(job) {
  const direct = directOutputObject(job);
  if (direct) return { ok: true, data: direct };

  const text = outputText(job);
  const result = await jsonRobustParse(text);
  if (!result.ok) {
    const recoveredGroups = salvageShotGroupsFromText(text);
    if (recoveredGroups.length) {
      return {
        ok: true,
        partial: true,
        recoveredCount: recoveredGroups.length,
        data: { shotGroups: recoveredGroups },
      };
    }
    return { ok: false, error: `分镜 JSON 解析失败：${result.error}` };
  }
  if (!hasShotGroupShape(result.data) && /"shotGroups"\s*:/.test(text)) {
    const recoveredGroups = salvageShotGroupsFromText(text);
    if (recoveredGroups.length) {
      return {
        ok: true,
        partial: true,
        recoveredCount: recoveredGroups.length,
        data: { shotGroups: recoveredGroups },
      };
    }
  }
  return { ok: true, data: result.data || {} };
}

export function isScriptToShotGroupsJobTag(tag) {
  return tag === SCRIPT_TO_SHOTGROUPS_TAG;
}

export async function resolveScriptToShotGroupsJobUpdate(job) {
  const tag = jobTag(job);
  if (!isScriptToShotGroupsJobTag(tag)) {
    return { handled: false };
  }

  const status = job?.status || '';
  if (!TERMINAL_STATUSES.has(status)) {
    return {
      handled: true,
      terminal: false,
      autoPromptInference: false,
      task: {
        id: SCRIPT_TO_SHOTGROUPS_TAG,
        stage: job?.output?.stage || '运行中…',
        progress: Math.max(1, Math.min(99, Number(job?.progress) || 1)),
      },
    };
  }

  if (status === 'failed' || status === 'canceled') {
    const error = status === 'canceled' ? '已取消' : jobError(job);
    return terminalErrorUpdate(job, error);
  }

  const result = await parseShotGroupsOutput(job);
  if (!result.ok) {
    return terminalErrorUpdate(job, result.error);
  }

  const data = result.data || {};
  const rawGroups = rawShotGroupArray(data);
  const groups = normalizeShotGroups(rawGroups);
  if (!groups.length) {
    return terminalErrorUpdate(job, '分镜 JSON 解析失败：模型输出中未找到 shotGroups 数组');
  }
  const shotGroups = groups.map((group) => ({
    ...group,
    promptStatus: 'pending',
  }));
  const flatShots = shotGroups.flatMap((group) => group.shots || []);
  const shotTasks = buildShotTasksFromShotGroups(shotGroups);
  const directorAnalysis = isObject(data) ? data.directorAnalysis : null;

  return {
    handled: true,
    terminal: true,
    autoPromptInference: false,
    task: {
      id: SCRIPT_TO_SHOTGROUPS_TAG,
      stage: result.partial
        ? `分镜生成完成（已恢复 ${groups.length} 组，输出不完整），可继续执行提示词推理`
        : '分镜生成完成，可继续执行提示词推理',
      progress: 100,
    },
    nodePatch: {
      shotGroups,
      shots: flatShots.map((shot, index) => ({ ...shot, n: index + 1 })),
      generating: false,
      progress: 0,
      jobStage: '',
    },
    updater: (pkg) => ({
      shotGroups,
      generationPlan: {
        ...pkg.generationPlan,
        shotTasks,
        directorAnalysis: directorAnalysis || pkg.generationPlan?.directorAnalysis || null,
      },
    }),
  };
}
