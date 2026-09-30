let accesstoken = null;
let refreshPromise = null;
// access token///////////////////////////////////////////////////////////
function setAccessToken(token) {
  accesstoken = token;
}
// refreshing/////////////////////////////////////////////////////////////
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

function isAuthRoute(url) {
  return url.startsWith("/api/auth/");
}
// for feild erros/////////////////////////////////////////////////
function clearFieldErrors() {
  document.querySelectorAll("[id^='err-']").forEach((s) => (s.textContent = ""));
  const fe = document.getElementById("formError");
  if (fe) fe.textContent = "";
}

function showFieldErrors(errors) {
  const leftover = [];
  Object.entries(errors || {}).forEach(([field, msg]) => {
    const span = document.getElementById(`err-${field}`);
    if (span) span.textContent = msg;
    else leftover.push(msg);
  });
  return leftover;
}

// ///////////////////////////////////////////request used in other js
async function request(method, url, body) {
    if (window.authReady && !isAuthRoute(url)) {           // this whole block is new — old version started straight at "const headers = ..."
    await window.authReady;
  }
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

  if (res.status === 401 && !isAuthRoute(url)) {
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
    else{
      window.location.href="/login"
    }
  }

  return res;
}
//////////////////////////////////// load user get logged in user role
async function loadUserRole() {
  const res = await request("GET", "/api/auth/me");
  if (!res.ok) return;

  const user = await res.json();

  if (user.role === "admin") {
    const reportsLink = document.getElementById("reportsLink");
    if (reportsLink) reportsLink.style.display = "";
// /////////////////////////////////////////////////////users
  const usersLink = document.getElementById("usersLink");
  if (usersLink) usersLink.style.display = "";

    
  }


  document.dispatchEvent(new CustomEvent("userRoleLoaded", { detail: user }));
}
// init auth///////////////////////////////////////////////
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
// logout button ///////////////////////////////////////////////////////////////
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