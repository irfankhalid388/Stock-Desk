const form = document.getElementById("userForm");

function clearErrors() {
  document.querySelectorAll("[id^='err-']").forEach((span) => {
    span.textContent = "";
  });
  const formError = document.getElementById("formError");
  if (formError) formError.textContent = "";
}

function showErrors(errors) {
  Object.keys(errors).forEach((field) => {
    const span = document.getElementById(`err-${field}`);
    if (span) span.textContent = errors[field];
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const userId = document.getElementById("userId").value;
  const isEditMode = Boolean(userId);

  let payload;
  if (isEditMode) {
    payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      role: document.getElementById("role").value,
    };
  } else {
    payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
    };
  }

  const method = isEditMode ? "PUT" : "POST";
  const url = isEditMode ? `/api/users/${userId}` : "/api/users";

  const res = await request(method, url, payload);

  if (res.status === 422) {
    const data = await res.json();
    showErrors(data.errors);
    return;
  }

  if (res.status === 409) {
    document.getElementById("formError").textContent = "A user with this email already exists.";
    return;
  }

  if (res.status === 403) {
    document.getElementById("formError").textContent = "You do not have permission to do this.";
    return;
  }

  if (!res.ok) {
    document.getElementById("formError").textContent = "Something went wrong. Please try again.";
    return;
  }

  window.location.href = "/users";
});