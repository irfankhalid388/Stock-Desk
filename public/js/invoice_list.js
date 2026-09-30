let currentPage = 1;
let userRole = null;
let debounceTimer;

const search = document.getElementById("search");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
// escapehtml////////////////////////////////////////////
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
// load invoice///////////////////////////////////////////////////////////
async function loadInvoices(page, searchTerm) {
  try {
    const res = await request(
      "GET",
      `/api/invoices?search=${encodeURIComponent(searchTerm)}&page=${page}`
    );
    const data = await res.json();
    renderInvoiceRows(data.rows);
    updatePaginationControls(data.page, data.pages);
  } catch (err) {
    const tbody = document.getElementById("invoiceRows");
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">Could not load invoices.</td></tr>`;
  }
}
// upadte pagination/////////////////////////////////////////////////////////////
function updatePaginationControls(page, pages) {
  currentPage = page;
  document.getElementById("pageInfo").textContent = `Page ${page} of ${pages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= pages;
}
// render invoice//////////////////////////////////
function renderInvoiceRows(invoices) {
  const tbody = document.getElementById("invoiceRows");
  if (!tbody) return;
  if (!Array.isArray(invoices)) return;

  if (!invoices.length) {
    tbody.innerHTML = `<tr><td colspan="5">No invoices found.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices
    .map(
      (inv) => `<tr>
        <td><a href="/invoices/${inv.id}">${escapeHtml(inv.invoice_no)}</a></td>
        <td>${escapeHtml(inv.customer_name || "")}</td>
        <td>${inv.total}</td>
        <td>${escapeHtml(inv.status)}</td>
        <td>${new Date(inv.created_at).toLocaleDateString()}</td>
      </tr>`
    )
    .join("");
}
// search//////////////////////////////////////
if (search) {
  search.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadInvoices(1, search.value);
    }, 350);
  });
}
// buttons//////////////////////////////////////////////
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    loadInvoices(currentPage - 1, search ? search.value : "");
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    loadInvoices(currentPage + 1, search ? search.value : "");
  });
}

document.addEventListener("userRoleLoaded", function (e) {
  userRole = e.detail.role;
  const createBtn = document.getElementById("createbtn");
  if (createBtn) createBtn.style.display = "";
});

window.authReady.then(() => loadInvoices(1, ""));