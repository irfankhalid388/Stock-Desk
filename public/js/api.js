let accesstoken = null;
let refreshPromise = null;

function setAccessToken(token) {
  accesstoken = token;
}

async function doRefresh() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accesstoken);
        return true;
      }

      setAccessToken(null);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request(method, url, body) {
  const headers = { "Content-Type": "application/json" };
  if (accesstoken) {
    headers["Authorization"] = `Bearer ${accesstoken}`;
  }

  let res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 401) {
    const refreshed = await doRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${accesstoken}`;
      res = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined
      });
    }
  }

  return res;
}

async function loadUserRole() {
  const res = await request("GET", "/api/auth/me");
  if (!res.ok) return;

  const user = await res.json();

  if (user.role === "admin") {
    const reportsLink = document.getElementById("reportsLink");
    if (reportsLink) reportsLink.style.display = "";
  }

  document.dispatchEvent(new CustomEvent("userRoleLoaded", { detail: user }));
}

async function initAuth() {
  try {
    const refreshed = await doRefresh();
    if (refreshed) {
      await loadUserRole();
    }
  } catch (err) {
    console.error("Failed to refresh session", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await request("POST", "/api/auth/logout");
      setAccessToken(null);
      window.location.href = "/login";
    });
  }
});
window.authReady = initAuth();