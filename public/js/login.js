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

    if (res.status === 422) {
      const data = await res.json().catch(() => ({}));
      errorMsg.textContent = Object.values(data.errors || {}).join(". ") || "Login failed";
    } else {
      errorMsg.textContent =
        res.status === 429 ? "Too many attempts. Please wait a minute and try again." : "Login failed";
    }
  } catch (err) {
    errorMsg.textContent = "Could not reach the server. Please try again.";
  }
  if (submitbtn) submitbtn.disabled = false;
});