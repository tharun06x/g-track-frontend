(function () {
  const baseFromRuntime = (window.GTRACK_API_BASE_URL || "").trim();
  const API_BASE_URL = (baseFromRuntime || "https://g-track-backend-94gv.onrender.com").replace(/\/+$/, "");

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

    const raw = await response.text();
    let data = null;

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { detail: raw };
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearAuth();
        window.location.href = '/index.html';
        throw new Error("Session expired. Please log in again.");
      }

      let message = `Request failed (${response.status})`;

      if (data) {
        const detail = data.detail || data.message || data.error;
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          const parts = detail
            .map((item) => {
              if (!item) {
                return "";
              }
              if (typeof item === "string") {
                return item;
              }
              if (item.msg) {
                if (Array.isArray(item.loc) && item.loc.length) {
                  return `${item.loc.join('.')}: ${item.msg}`;
                }
                return item.msg;
              }
              return JSON.stringify(item);
            })
            .filter(Boolean);
          if (parts.length) {
            message = parts.join("; ");
          }
        } else if (detail && typeof detail === "object") {
          message = JSON.stringify(detail);
        }
      }

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