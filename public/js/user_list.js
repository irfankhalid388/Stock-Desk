const messageEl = document.getElementById("message");
const userRowsEl = document.getElementById("userRows");

function showMessage(msg) {
  if (messageEl) messageEl.textContent = msg;
}

function renderUserRows(users, currentUserId) {
  if (!userRowsEl) return;
  if (!users.length) {
    userRowsEl.innerHTML = `<tr><td colspan="5">No users found.</td></tr>`;
    return;
  }

  userRowsEl.innerHTML = users
    .map((u) => {
      const status = u.is_active ? "Active" : "Deactivated";
      const canDeactivate = u.is_active && u.id !== currentUserId;
      const deactivateBtn = canDeactivate
        ? `<button class="deactivate-btn" data-id="${u.id}" data-name="${escapeHtml(u.name)}">Deactivate</button>`
        : "";
      return `<tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.role)}</td>
        <td>${status}</td>
        <td><a href="/users/${u.id}/edit">Edit</a> ${deactivateBtn}</td>
      </tr>`;
    })
    .join("");
}

async function loadUsers(currentUserId) {
  showMessage("");
  try {
    const res = await request("GET", "/api/users");
    if (!res.ok) {
      showMessage(
        res.status === 403
          ? "You do not have permission to view this."
          : messageFor(res.status, await readJson(res))
      );
      return;
    }
    const data = await res.json();
    showMessage("")
    renderUserRows(data.users || [], currentUserId);
  } catch (err) {
    console.error(err);
    showMessage("Could not load users. Please try again.");
  }
}

if (userRowsEl) {
  userRowsEl.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("deactivate-btn")) return;

    const btn = e.target;
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    if (!confirm(`Deactivate ${name}? They will no longer be able to log in.`)) return;

    showMessage("");
    btn.disabled = true;

    try {
      const res = await request("PATCH", `/api/users/${id}/deactivate`);
      if (!res.ok) {
        showMessage(messageFor(res.status, await readJson(res)));
        btn.disabled = false;
        return;
      }
      if (window.currentUserId) await loadUsers(window.currentUserId);
      else location.reload();
    } catch (err) {
      console.error(err);
      showMessage("Could not reach the server. Please try again.");
      btn.disabled = false;
    }
  });
}
let started=false

document.addEventListener("userRoleLoaded", function (e) {
  started=true
  window.currentUserId = e.detail.id;
  const addLink = document.getElementById("addUserLink");
  if (addLink) addLink.style.display = e.detail.role === "admin" ? "" : "none";
  loadUsers(e.detail.id);
});

// agar session refresh hi fail ho gaya to userRoleLoaded kabhi fire nahi hoga
window.authReady.then(() => {
  if (!window.currentUserId && messageEl && !messageEl.textContent) {
    messageEl.textContent = "Could not verify your session. Please log in again.";
  }
});