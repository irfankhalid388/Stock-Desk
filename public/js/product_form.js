const form = document.getElementById("productForm");

function getFormPayload() {
  return {
    sku: document.getElementById("sku").value.trim(),
    name: document.getElementById("name").value.trim(),
    category_id: document.getElementById("category_id").value,
    cost_price: document.getElementById("cost_price").value,
    sale_price: document.getElementById("sale_price").value,
    quantity: document.getElementById("quantity").value,
    reorder_level: document.getElementById("reorder_level").value,
  };
}

if (form) {
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const productId = document.getElementById("productId").value;
    const isEditMode = Boolean(productId);
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `/api/products/${productId}` : "/api/products";

    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await request(method, url, getFormPayload());

      if (res.ok) {
        window.location.href = "/products";
        return;
      }

      const data = await readJson(res);

      if (res.status === 422) {
        const leftover = showFieldErrors(data.errors);
        if (leftover.length) setFormError(leftover.join(". "));
      } else if (res.status === 409) {
        showFieldErrors({ sku: "This SKU already exists" });
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