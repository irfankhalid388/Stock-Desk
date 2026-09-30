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
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const payload = getFormPayload();

    const productId = document.getElementById("productId").value;
    const isEditMode = Boolean(productId);
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `/api/products/${productId}` : "/api/products";
    const formError = document.getElementById("formError");
    const res = await request(method, url, payload);
    if (res.status === 422) {
  const data = await res.json().catch(() => ({}));
  const leftover = showFieldErrors(data.errors);
  if (leftover.length && formError) formError.textContent = leftover.join(". ");
  return;
}
if (res.status === 409) {
  showFieldErrors({ sku: "This SKU already exists" });
  return;
}
if (!res.ok) {
  const data = await res.json().catch(() => ({}));
  if (formError) formError.textContent = data.message || "Something went wrong. Please try again.";
  return;
}
window.location.href = "/products";
  });
}