const form = document.getElementById("userForm");

if (form) {
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

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

      if (res.ok) {
        window.location.href = "/users?saved=1";
        return;
      }

      const data = await readJson(res);

      if (res.status === 422) {
        if (data.errors) {
          const leftover = showFieldErrors(data.errors);
          if (leftover.length) setFormError(leftover.join(". "));
        } else {
          setFormError("Please check the form and try again.");
        }
      } else if (res.status === 409) {
        const leftover = showFieldErrors({ email: "A user with this email already exists." });
        if (leftover.length) setFormError(leftover[0]);
      } else {
        setFormError(messageFor(res.status, data));
      }
    } catch (err) {
      console.error(err);
      setFormError("Could not reach the server. Please try again.");
    }

    if (submitBtn) submitBtn.disabled = false;
  });
}