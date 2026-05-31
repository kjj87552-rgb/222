function isTransportFetchError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  return (
    error instanceof TypeError
    || /fetch failed/i.test(message)
    || /ECONNREFUSED|ECONNRESET|EPIPE|socket hang up/i.test(message)
  );
}

function readableBackendConnectionError(error) {
  const detail = error instanceof Error ? error.message : String(error || "");
  return new Error(`本地服务连接失败：${detail || "无法连接到本地后端"}。请稍后重试；如果仍然失败，请重启漫创AI。`);
}

async function parseBackendResponse(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }
  if (!res.ok) {
    if (res.status === 404) {
      return {
        error: "not_found",
        status: 404,
        detail: typeof data === "string" ? data : data?.detail || "Not found",
      };
    }
    throw new Error(typeof data === "string" ? data : data?.detail || `HTTP ${res.status}`);
  }
  return data;
}

function createBackendRequester({
  getBackendBaseUrl,
  ensureBackendRunning,
  fetchImpl = fetch,
}) {
  async function requestOnce(baseUrl, { method = "GET", path: requestPath, body }) {
    if (!baseUrl) throw new Error("Backend is not ready");
    const res = await fetchImpl(`${baseUrl}${requestPath}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return parseBackendResponse(res);
  }

  return async function backendRequest(request) {
    const firstBaseUrl = await ensureBackendRunning({ restart: false }) || getBackendBaseUrl();
    try {
      return await requestOnce(firstBaseUrl, request);
    } catch (error) {
      if (!isTransportFetchError(error)) throw error;
      let retryBaseUrl = "";
      try {
        retryBaseUrl = await ensureBackendRunning({ restart: true });
      } catch (restartError) {
        throw readableBackendConnectionError(restartError);
      }
      try {
        return await requestOnce(retryBaseUrl || getBackendBaseUrl(), request);
      } catch (retryError) {
        if (!isTransportFetchError(retryError)) throw retryError;
        throw readableBackendConnectionError(retryError);
      }
    }
  };
}

module.exports = {
  createBackendRequester,
  isTransportFetchError,
};
