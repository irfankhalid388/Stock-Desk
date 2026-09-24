let currentPage = 1;
let currentUserRole = null;
let debounceTimer;
let currentAdjustProductId = null;

const adjustStockPanel = document.getElementById("adjustStockPanel");
const adjustProductName = document.getElementById("adjustProductName");
const adjustMessage = document.getElementById("adjustMessage");
const changeQtyInput = document.getElementById("changeQty");
const adjustReasonSelect = document.getElementById("adjustReason");
const adjustNoteInput = document.getElementById("adjustNote");
const submitAdjustBtn = document.getElementById("submitAdjust");
const cancelAdjustBtn = document.getElementById("cancelAdjust");

const searchInput = document.getElementById("searchInput");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderProductRows(products) {
  const tbody = document.getElementById("productTableBody");
  if (!tbody) return;
  if (!Array.isArray(products)) return;

  tbody.innerHTML = products
    .map((p) => {
      const actions =
        currentUserRole === "admin"
          ? `<a href="/products/${p.id}/edit">Edit</a> | 
             <button class="delete-btn" data-id="${p.id}">Delete</button> | 
             <button class="stock_adjust" data-id="${p.id}" data-name="${escapeHtml(p.name)}">STOCK ADJUST</button>`
          : "";

      const costPriceCell =
        currentUserRole === "admin"
          ? `<td>${escapeHtml(p.cost_price)}</td>`
          : "";

      return `
        <tr>
          <td>${escapeHtml(p.sku)}</td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.category_name || p.category_id)}</td>
          <td>${escapeHtml(p.sale_price)}</td>
          ${costPriceCell}
          <td>${escapeHtml(p.quantity)}</td>
          <td>${escapeHtml(p.reorder_level)}</td>
          <td>${actions}</td>
        </tr>
      `;
    })
    .join("");
}

const productTableBody = document.getElementById("productTableBody");

if (productTableBody) {
  productTableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("stock_adjust")) {
      currentAdjustProductId = e.target.dataset.id;
      adjustProductName.textContent = e.target.dataset.name;
      changeQtyInput.value = "";
      adjustReasonSelect.value = "";
      adjustNoteInput.value = "";
      adjustMessage.textContent = "";
      adjustStockPanel.style.display = "";
      return;
    }

    if (!e.target.classList.contains("delete-btn")) return;

    const id = e.target.dataset.id;
    if (!confirm("Delete this product? This cannot be undone.")) return;

    const res = await request("DELETE", `/api/products/${id}`);

    if (!res.ok) {
      console.error("Failed to delete product", res.status);
      return;
    }
    loadProducts(currentPage, searchInput ? searchInput.value : "");
  });
}

if (cancelAdjustBtn) {
  cancelAdjustBtn.addEventListener("click", () => {
    adjustStockPanel.style.display = "none";
    currentAdjustProductId = null;
  });
}

if (submitAdjustBtn) {
  submitAdjustBtn.addEventListener("click", async () => {
    adjustMessage.textContent = "";

    const change_qty = parseInt(changeQtyInput.value);
    const reason = adjustReasonSelect.value;
    const note = adjustNoteInput.value.trim();

    if (isNaN(change_qty) || change_qty === 0) {
      adjustMessage.textContent = "Enter a non-zero number.";
      return;
    }
    if (!reason) {
      adjustMessage.textContent = "Please select a reason.";
      return;
    }

    try {
      const res = await request("POST", `/api/products/${currentAdjustProductId}/adjust`, {
        change_qty,
        reason,
        note,
      });

      if (res.status === 422) {
        const data = await res.json();
        adjustMessage.textContent = data.error || "Could not adjust stock.";
        return;
      }

      if (!res.ok) {
        adjustMessage.textContent = "Something went wrong. Please try again.";
        return;
      }

      adjustStockPanel.style.display = "none";
      currentAdjustProductId = null;
      loadProducts(currentPage, searchInput ? searchInput.value : "");
    } catch (err) {
      adjustMessage.textContent = "Something went wrong. Please try again.";
    }
  });
}

function updatePaginationControls(page, pages) {
  currentPage = page;
  document.getElementById("pageInfo").textContent = `Page ${page} of ${pages}`;
  document.getElementById("prevPage").disabled = page <= 1;
  document.getElementById("nextPage").disabled = page >= pages;
}

async function loadProducts(page, search) {
  const res = await request(
    "GET",
    `/api/products?search=${encodeURIComponent(search)}&page=${page}`
  );
  const data = await res.json();

  renderProductRows(data.rows);
  updatePaginationControls(data.page, data.pages);
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadProducts(1, searchInput.value);
    }, 400);
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    loadProducts(currentPage - 1, searchInput ? searchInput.value : "");
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    loadProducts(currentPage + 1, searchInput ? searchInput.value : "");
  });
}

document.addEventListener("userRoleLoaded", function (e) {
  currentUserRole = e.detail.role;
  if (e.detail.role === "admin") {
    const addLink = document.getElementById("addProductLink");
    if (addLink) addLink.style.display = "";
    const costPriceHeader = document.getElementById("costPriceHeader");
    if (costPriceHeader) costPriceHeader.style.display = "";
  }
});
window.authReady.then(() => loadProducts(1, ""));