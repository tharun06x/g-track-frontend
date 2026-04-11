(function () {
  const baseFromRuntime = (window.GTRACK_API_BASE_URL || "").trim();
  const API_BASE_URL = (baseFromRuntime || "http://localhost:8000").replace(/\/+$/, "");

  function getHeaders(token) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: getHeaders(options.token),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = data && data.detail ? data.detail : `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  }

  function saveAuth(payload) {
    localStorage.setItem("gtrack_auth", JSON.stringify(payload));
  }

  function readAuth() {
    const raw = localStorage.getItem("gtrack_auth");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function clearAuth() {
    localStorage.removeItem("gtrack_auth");
  }

  window.GTrackApi = {
    API_BASE_URL,
    request,
    saveAuth,
    readAuth,
    clearAuth,
  };
})();