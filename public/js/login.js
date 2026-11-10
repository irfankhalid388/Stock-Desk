(() => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  const submitBtn = form.querySelector("button[type='submit']");

  const readJson = (res) => res.json().catch(() => ({}));

  function messageFor(status, data) {
    if (data.message) return data.message;
    if (status >= 500) return "Server error. Please try again.";
    return "Something went wrong. Please try again.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        }),
      });

      if (res.ok) {
        window.location.href = "/products";
        return; // stay disabled: we're leaving the page
      }

      const data = await readJson(res);

      if (res.status === 422) {
        errorMsg.textContent =
          Object.values(data.errors || {}).join(". ") || "Please check your details.";
      } else if (res.status === 401) {
        errorMsg.textContent = "Incorrect email or password.";
      } else if (res.status === 403) {
        errorMsg.textContent =
          data.message || "This account cannot log in. Please contact an admin.";
      } else if (res.status === 429) {
        errorMsg.textContent = "Too many attempts. Please wait a minute and try again.";
      } else {
        errorMsg.textContent = messageFor(res.status, data);
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Could not reach the server. Please try again.";
    }

    submitBtn.disabled = false;
  });
})();