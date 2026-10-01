const form = document.getElementById("customerForm");

// payload //////////////////////////////////////////////
function getFormPayload() {
  return {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
  };
}

// FORM /////////////////////////////////////////////////
if (form) {
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const customerId = document.getElementById("customerId").value;
    const isEditMode = Boolean(customerId);
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `/api/customers/${customerId}` : "/api/customers";

    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await request(method, url, getFormPayload());

      if (res.ok) {
        window.location.href = "/customers";
        return;
      }

      const data = await readJson(res);

      if (res.status === 422) {
        const leftover = showFieldErrors(data.errors);
        if (leftover.length) setFormError(leftover.join(". "));
      } else if (res.status === 409) {
        showFieldErrors({ email: "This email already exists" });
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