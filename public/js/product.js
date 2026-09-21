let currentPage = 1;
let currentUserRole = null;
let debounceTimer;

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
          ? `<a href="/products/${p.id}/edit">Edit</a> | <button class="delete-btn" data-id="${p.id}">Delete</button>`
          : "";

      const costPriceCell =
        currentUserRole === "admin"
          ? `<td>${escapeHtml(p.cost_price)}</td>`
          : "";

      return `
        <tr>
          <td>${escapeHtml(p.sku)}</td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.sale_price)}</td>
          ${costPriceCell}
          <td>${actions}</td>
        </tr>
      `;
    })
    .join("");
}

const productTableBody = document.getElementById("productTableBody");
if (productTableBody) {
  productTableBody.addEventListener("click", async (e) => {
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
