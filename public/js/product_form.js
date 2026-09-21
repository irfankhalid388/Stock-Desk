const form = document.getElementById("productForm");

function clearErrors() {
  document.querySelectorAll("[id^='err-']").forEach((span) => {
    span.textContent = "";
  });
  const formError = document.getElementById("formError");
  if (formError) formError.textContent = "";
}

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

function showErrors(errors) {
  Object.keys(errors).forEach((field) => {
    const span = document.getElementById(`err-${field}`);
    if (span) {
      span.textContent = errors[field];
    }
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const payload = getFormPayload();

    const productId = document.getElementById("productId").value;
    const isEditMode = Boolean(productId);
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `/api/products/${productId}` : "/api/products";

    const res = await request(method, url, payload);

    if (res.status === 422) {
      const data = await res.json();
      showErrors(data.errors);
      return;
    }

    if (!res.ok) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} product`, res.status);
      const formError = document.getElementById("formError");
      if (formError) {
        formError.textContent = "Something went wrong. Please try again.";
      }
      return;
    }

    window.location.href = "/products";
  });
}