export const DESIGN_SPACE_JOB_POLL_INTERVAL_MS = 1800;
export const DESIGN_SPACE_PARSE_JOB_POLL_ATTEMPTS = 600;

function outputText(output = {}) {
  return String(output?.text || output?.content || output?.message || '').trim();
}

export function extractCompletedDesignSpaceJobText(job = {}) {
  if (job?.status === 'failed') {
    throw new Error(job.error || '设计空间解析任务失败');
  }
  if (job?.status !== 'completed') {
    throw new Error('设计空间解析仍在运行，请稍后再查看结果');
  }

  const text = outputText(job.output);
  if (!text) {
    throw new Error('设计空间解析任务完成但没有返回文本内容');
  }
  return text;
}
