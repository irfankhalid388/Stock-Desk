const summary = document.getElementById("summarySearch");
const results = document.getElementById("summaryResults");
const summarymessage = document.getElementById("summaryMessage");
const summarydetail = document.getElementById("summaryDetail");
let debounceTimer;

// ESCAPE HTML ///////////////////////////////////////////////////////////////
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// SEARCH INPUT ////////////////////////////////////
async function search(term) {
  summarymessage.textContent = "";
  summarydetail.style.display = "none";

  if (!term) {
    results.innerHTML = "";
    return;
  }
  try {
    const res = await request(
      "GET",
      `/api/customers?search=${encodeURIComponent(term)}&page=1&limit=10`
    );
    if (!res.ok) {
      results.innerHTML = "";
      summarymessage.textContent = "Could not search customers.";
      return;
    }
    const data = await res.json();
    renderResults(data.rows);
  } catch (err) {
    results.innerHTML = "";
    summarymessage.textContent = "Something went wrong. Please try again.";
  }
}

// RENDER RESULTS — MAKES CUSTOMER DATA CLICKABLE /////////////////////////////////////////////////////////////
function renderResults(rows) {
  if (!rows || !rows.length) {
    results.innerHTML = "<p>No matching customers.</p>";
    return;
  }
  results.innerHTML = rows.map(
    (c) => `<button type="button" class="pick-customer" data-id="${c.id}">
      ${escapeHtml(c.name)} — ${escapeHtml(c.email || "")} (ID: ${c.id})
    </button>`
  ).join("<br>");

  results.querySelectorAll(".pick-customer").forEach((btn) => {
    btn.addEventListener("click", () => loadSummary(btn.dataset.id));
  });
}

// LOAD SUMMARY — put data in summary //////////////////////////////////////////////////////////
async function loadSummary(id) {
  summarymessage.textContent = "";
  try {
    const res = await request("GET", `/api/customers/${encodeURIComponent(id)}/summary`);

    if (!res.ok) {
      summarydetail.style.display = "none";
      if (res.status === 404) {
        summarymessage.textContent = "Customer not found.";
      } else if (res.status === 403) {
        summarymessage.textContent = "You do not have permission to view this.";
      } else {
        summarymessage.textContent = "Could not load summary.";
      }
      return;
    }

    const data = await res.json();
    document.getElementById("sum-name").textContent = data.name || "";
    document.getElementById("sum-email").textContent = data.email || "";
    document.getElementById("sum-phone").textContent = data.phone || "";
    document.getElementById("sum-address").textContent = data.address || "";
    document.getElementById("sum-count").textContent = data.invoice_count ?? "0";
    document.getElementById("sum-total").textContent = data.total_spent ?? "0";
    summarydetail.style.display = "";
  } catch (err) {
    summarymessage.textContent = "Something went wrong. Please try again.";
  }
}

summary.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    search(summary.value.trim());
  }, 400);
});