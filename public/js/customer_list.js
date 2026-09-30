let currentPage = 1;
let currentUserRole = null;
let debounceTimer;

const search = document.getElementById("search");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// LOAD CUSTOMERS ////////////////////////////////////////////////
async function loadCustomers(page, searchTerm) {
  try {
    const res = await request(
      "GET",
      `/api/customers?search=${encodeURIComponent(searchTerm)}&page=${page}`
    );
    const data = await res.json();
    renderCustomerRows(data.rows);
    updatePaginationControls(data.page, data.pages);
  } catch (err) {
    const tbody = document.getElementById("customerRows");
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">Could not load customers.</td></tr>`;
  }
}

// UPDATE PAGINATION CONTROLS //////////////////////////////////
function updatePaginationControls(page, pages) {
  currentPage = page;
  document.getElementById("pageInfo").textContent = `Page ${page} of ${pages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= pages;
}
// ESCAPE HTML////////////////////////////////////////////
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// RENDER CUSTOMER ROWS /////////////////////////////////////////
function renderCustomerRows(customers) {
  const tbody = document.getElementById("customerRows");
  if (!tbody) return;
  if (!Array.isArray(customers)) return;

  if (!customers.length) {
    tbody.innerHTML = `<tr><td colspan="5">No customers found.</td></tr>`;
    return;
  }

  tbody.innerHTML = customers
    .map(
      (c) => `<tr>
      <td>${escapeHtml(c.id)}</td>  
      <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.email)}</td>
        <td>${escapeHtml(c.phone)}</td>
        <td>${escapeHtml(c.address)}</td>
      </tr>`
    )
    .join("");
}

// SEARCH /////////////////////////////////////////////////////
if (search) {
  search.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadCustomers(1, search.value);
    }, 400);
  });
}

// PREV BUTTON //////////////////////////////////////////////
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    loadCustomers(currentPage - 1, search ? search.value : "");
  });
}

// NEXT BUTTON //////////////////////////////////////////////
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    loadCustomers(currentPage + 1, search ? search.value : "");
  });
}

// ADD CUSTOMER (admin only) //////////////////////////////////
document.addEventListener("userRoleLoaded", function (e) {
  currentUserRole = e.detail.role;
  const addbtn = document.getElementById("addbtn");
  if (addbtn) addbtn.style.display = "";
  const summaryLink = document.getElementById("summaryLink");
  if (summaryLink) summaryLink.style.display = e.detail.role === "admin" ? "" : "none";
});

window.authReady.then(() => loadCustomers(1, ""));