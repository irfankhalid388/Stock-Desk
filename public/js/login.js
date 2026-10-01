document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitbtn = e.target.querySelector("button[type='submit']");
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = "";
  if (submitbtn) submitbtn.disabled = true;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });

    if (res.ok) {
      window.location.href = "/products";
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (res.status === 422) {
      errorMsg.textContent = Object.values(data.errors || {}).join(". ") || "Please check your details.";
    } else if (res.status === 401) {
      errorMsg.textContent = "Incorrect email or password.";
    } else if (res.status === 403) {
      errorMsg.textContent = data.message || "This account cannot log in. Please contact an admin.";
    } else if (res.status === 429) {
      errorMsg.textContent = "Too many attempts. Please wait a minute and try again.";
    } else {
      errorMsg.textContent = messageFor(res.status, data);
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not reach the server. Please try again.";
  }
  if (submitbtn) submitbtn.disabled = false;
});