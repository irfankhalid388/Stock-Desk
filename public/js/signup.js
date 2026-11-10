function clearFieldErrors() {
  document.querySelectorAll("[id^='err-']").forEach((s) => (s.textContent = ""));
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

document.getElementById("signupform").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitbtn = e.target.querySelector("button[type='submit']");
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = "";
  clearFieldErrors();
  if (submitbtn) submitbtn.disabled = true;

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: document.getElementById("email").value,
        name: document.getElementById("name").value,
        password: document.getElementById("password").value
      })
    });

    if (res.ok) {
      window.location.href = "/login";
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (res.status === 422 && data.errors) {
      errorMsg.textContent = showFieldErrors(data.errors).join(". ");
    } else if (res.status === 403) {
      errorMsg.textContent = "Registration is closed. Ask an admin to create your account.";
    } else if (res.status === 409) {
      errorMsg.textContent = "This email is already registered.";
    } else if (res.status === 429) {
      errorMsg.textContent = "Too many attempts. Please wait a minute and try again.";
    } else {
      errorMsg.textContent = "Sign up failed. Please try again.";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not reach the server. Please try again.";
  }
  if (submitbtn) submitbtn.disabled = false;
});