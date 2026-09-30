const form = document.getElementById("userForm");
const submitBtn = form.querySelector("button[type='submit']");

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

function showFormError(message) {
  const formError = document.getElementById("formError");
  if (formError) formError.textContent = message;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const userId = document.getElementById("userId").value;
  const isEditMode = Boolean(userId);

  const payload = isEditMode
    ? {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        role: document.getElementById("role").value,
      }
    : {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
      };

  const method = isEditMode ? "PUT" : "POST";
  const url = isEditMode ? `/api/users/${userId}` : "/api/users";

  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await request(method, url, payload);

    if (res.status === 422) {
      const data = await res.json().catch(() => ({}));
      if (data.errors) {
        showErrors(data.errors);
      } else {
        showFormError("Please check the form and try again.");
      }
      return;
    }

    if (res.status === 409) {
      showFormError("A user with this email already exists.");
      return;
    }

    if (res.status === 403) {
      showFormError("You do not have permission to do this.");
      return;
    }

    if (!res.ok) {
      showFormError("Something went wrong. Please try again.");
      return;
    }

    window.location.href = "/users?saved=1";
  } catch (err) {
    console.error(err);
    showFormError("Could not reach the server. Please try again.");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});