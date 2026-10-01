let currentPage = 1;
let userRole = null;
let debounceTimer;
let latestRequest = 0;

const search = document.getElementById("search");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const messageEl = document.getElementById("message");

function showMessage(msg) {
  if (messageEl) messageEl.textContent = msg;
}

// load invoice ///////////////////////////////////////////////////////////
async function loadInvoices(page, searchTerm) {
  const myRequest = ++latestRequest;
  try {
    const res = await request(
      "GET",
      `/api/invoices?search=${encodeURIComponent(searchTerm)}&page=${page}`
    );

    if (myRequest !== latestRequest) return;

    if (!res.ok) {
      showMessage(messageFor(res.status, await readJson(res)));
      return;
    }

    showMessage("");
    const data = await res.json();
    renderInvoiceRows(data.rows);
    updatePaginationControls(data.page, data.pages);
  } catch (err) {
    console.error(err);
    if (myRequest !== latestRequest) return;
    showMessage("Could not load invoices. Please try again.");
  }
}

// update pagination //////////////////////////////////////////////////////
function updatePaginationControls(page, pages) {
  currentPage = page;
  document.getElementById("pageInfo").textContent = `Page ${page} of ${pages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= pages;
}

// render invoice /////////////////////////////////////////////////////////
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
        <td>${escapeHtml(inv.total)}</td>
        <td>${escapeHtml(inv.status)}</td>
        <td>${new Date(inv.created_at).toLocaleDateString()}</td>
      </tr>`
    )
    .join("");
}

// search /////////////////////////////////////////////////////////////////
if (search) {
  search.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadInvoices(1, search.value);
    }, 250);
  });
}

// buttons ////////////////////////////////////////////////////////////////
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

// role ///////////////////////////////////////////////////////////////////
document.addEventListener("userRoleLoaded", function (e) {
  userRole = e.detail.role;
  const createBtn = document.getElementById("createbtn");
  if (createBtn) createBtn.style.display = "";
});

window.authReady.then(() => loadInvoices(1, ""));