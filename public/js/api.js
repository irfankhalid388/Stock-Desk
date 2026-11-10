
// ///////////global variables
let accesstoken = null;
let refreshPromise = null;

// updating access token ///////////////////////////////////////////////////////////
function setAccessToken(token) {
  accesstoken = token;
}

// refreshing /////////////////////////////////////////////////////////////
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
        return data.accesstoken;
      }

      setAccessToken(null);
      return false;
    } finally {
      // current refresh operation is ended in future we can do again refresh
      refreshPromise = null;  
      
    }
  })();

  return refreshPromise;
}
// this checks the route is authentication related or not 
function isAuthRoute(url) {
  const authRoutes = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/me",
  ];
  // Strip query parameters to prevent mismatching URLs with query strings
  const pathname = String(url || "").split("?")[0];
  return authRoutes.includes(pathname);
}
// shared helpers (sab page scripts yahin se use karengi) //////////////////
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// agar json na mila kali object return kro
function readJson(res) {
  return res.json().catch(() => ({}));
}
// error handling
function messageFor(status, data) {
  if (data && data.message) return data.message;
  if (status === 403) return "You do not have permission to do this.";
  if (status === 404) return "Not found.";
  if (status === 409) return "This record already exists.";
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status >= 500) return "Server error. Please try again.";
  return "Something went wrong. Please try again.";
}

function setFormError(msg) {
  const el = document.getElementById("formError");
  if (el) el.textContent = msg;
}

// field errors ///////////////////////////////////////////////////////////
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

// request used in other js ///////////////////////////////////////////////
async function request(method, url, body) {
  if (window.authReady && !isAuthRoute(url)) {
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
    let newtoken;
try {
  newtoken = await doRefresh();
} catch (err) {
  console.error("Token refresh failed", err);
  return res; // don't redirect: a network blip isn't a dead session
}
    if (newtoken) {
      headers["Authorization"] = `Bearer ${accesstoken}`;
      res = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined
      });
    } else {
      window.location.href = "/login";
      return new Promise(()=>{});
    }
  }

  return res;
}

// load user: logged in user ka role //////////////////////////////////////
async function loadUserRole() {
  const res = await request("GET", "/api/auth/me");
  if (!res.ok) {
    console.error("Could not load user", res.status);
    const box = document.getElementById("message");
    if (box) box.textContent = "Could not load your account. Please refresh the page.";
    return;
  }

  const user = await res.json();

  if (user.role === "admin") {
    const reportsLink = document.getElementById("reportsLink");
    if (reportsLink) reportsLink.style.display = "";

    const usersLink = document.getElementById("usersLink");
    if (usersLink) usersLink.style.display = "";
  }

  document.dispatchEvent(new CustomEvent("userRoleLoaded", { detail: user }));
}

// init auth //////////////////////////////////////////////////////////////
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

// logout button //////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await request("POST", "/api/auth/logout");
      } catch (err) {
        console.error("Logout request failed", err);
      }
      setAccessToken(null);
      window.location.href = "/login";
    });
  }
});

  window.authReady = initAuth();