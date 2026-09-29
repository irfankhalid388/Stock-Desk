function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderUserRows(users, currentUserId) {
  const tbody = document.getElementById("userRows");
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users
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
  const messageEl = document.getElementById("message");
  try {
    const res = await request("GET", "/api/users");
    if (!res.ok) {
      messageEl.textContent = res.status === 403 ? "You do not have permission to view this." : "Could not load users.";
      return;
    }
    const data = await res.json();
    renderUserRows(data.users || [], currentUserId);
  } catch (err) {
    messageEl.textContent = "Something went wrong. Please try again.";
  }
}

document.getElementById("userRows").addEventListener("click", async (e) => {
  if (!e.target.classList.contains("deactivate-btn")) return;

  const id = e.target.dataset.id;
  const name = e.target.dataset.name;
  if (!confirm(`Deactivate ${name}? They will no longer be able to log in.`)) return;

  const res = await request("PATCH", `/api/users/${id}/deactivate`);
  if (!res.ok) {
    document.getElementById("message").textContent = "Could not deactivate user.";
    return;
  }
  window.currentUserId ? loadUsers(window.currentUserId) : location.reload();
});

document.addEventListener("userRoleLoaded", function (e) {
  window.currentUserId = e.detail.id;
  const addLink = document.getElementById("addUserLink");
  if (addLink) addLink.style.display = e.detail.role === "admin" ? "" : "none";
  loadUsers(e.detail.id);
});