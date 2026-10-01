let currentPage = 1;
let currentUserRole = null;
let debounceTimer;
let currentAdjustProductId = null;

const messageEl = document.getElementById("message");
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

function showMessage(msg) {
  if (messageEl) messageEl.textContent = msg;
}

// RENDER ROWS ///////////////////////////////////////////////////////
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

// TABLE CLICKS: stock adjust panel + delete //////////////////////////
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

    const btn = e.target;
    const id = btn.dataset.id;
    if (!confirm("Delete this product? This cannot be undone.")) return;

    showMessage("");
    btn.disabled = true;

    try {
      const res = await request("DELETE", `/api/products/${id}`);

      if (!res.ok) {
        showMessage(messageFor(res.status, await readJson(res)));
        btn.disabled = false;
        return;
      }

      // success: table dobara render hoga, button khud gayab ho jayega
      await loadProducts(currentPage, searchInput ? searchInput.value : "");
    } catch (err) {
      console.error(err);
      showMessage("Could not reach the server. Please try again.");
      btn.disabled = false;
    }
  });
}

// STOCK ADJUST //////////////////////////////////////////////////////
if (cancelAdjustBtn) {
  cancelAdjustBtn.addEventListener("click", () => {
    adjustStockPanel.style.display = "none";
    currentAdjustProductId = null;
  });
}

if (submitAdjustBtn) {
  submitAdjustBtn.addEventListener("click", async () => {
    adjustMessage.textContent = "";

    if (!currentAdjustProductId) {
      adjustMessage.textContent = "No product selected. Please close this panel and try again.";
      return;
    }

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

    submitAdjustBtn.disabled = true;
    try {
      const res = await request("POST", `/api/products/${currentAdjustProductId}/adjust`, {
        change_qty,
        reason,
        note,
      });

      if (res.ok) {
        adjustStockPanel.style.display = "none";
        currentAdjustProductId = null;
        loadProducts(currentPage, searchInput ? searchInput.value : "");
        return;
      }

      const data = await readJson(res);
      if (res.status === 422 && data.errors) {
        adjustMessage.textContent = [...new Set(Object.values(data.errors))].join(". ");
      } else {
        adjustMessage.textContent = messageFor(res.status, data);
      }
    } catch (err) {
      console.error(err);
      adjustMessage.textContent = "Could not reach the server. Please try again.";
    } finally {
      submitAdjustBtn.disabled = false;
    }
  });
}

// PAGINATION + LOAD /////////////////////////////////////////////////
function updatePaginationControls(page, pages) {
  currentPage = page;
  document.getElementById("pageInfo").textContent = `Page ${page} of ${pages}`;
  document.getElementById("prevPage").disabled = page <= 1;
  document.getElementById("nextPage").disabled = page >= pages;
}

async function loadProducts(page, search) {
  try {
    const res = await request(
      "GET",
      `/api/products?search=${encodeURIComponent(search)}&page=${page}`
    );

    if (!res.ok) {
      showMessage(messageFor(res.status, await readJson(res)));
      return;
    }

    showMessage("");
    const data = await res.json();
    renderProductRows(data.rows);
    updatePaginationControls(data.page, data.pages);
  } catch (err) {
    console.error(err);
    showMessage("Could not load products. Please try again.");
  }
}

// SEARCH + PAGER ////////////////////////////////////////////////////
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

// ROLE ///////////////////////////////////////////////////////////////
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