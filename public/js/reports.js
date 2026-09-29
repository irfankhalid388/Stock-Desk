function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function defaultFrom() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
}

function defaultTo() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function renderTopProducts(rows) {
  const tbody = document.getElementById("topProductRows");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="2">No sales in this range.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows
    .map(
      (p) => `<tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${money(p.revenue)}</td>
      </tr>`
    )
    .join("");
}

function renderStaffRows(rows) {
  const tbody = document.getElementById("staffRows");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="3">No sales in this range.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows
    .map(
      (u) => `<tr>
        <td>${escapeHtml(u.user_name)}</td>
        <td>${u.invoice_count}</td>
        <td>${money(u.revenue)}</td>
      </tr>`
    )
    .join("");
}

async function loadSummary(from, to) {
  const res = await request("GET", `/api/reports/summary?from=${from}&to=${to}`);
  if (!res.ok) return false;
  const data = await res.json();

  document.getElementById("sumRevenue").textContent = money(data.revenue);
  document.getElementById("sumCost").textContent = money(data.cost);
  document.getElementById("sumProfit").textContent = money(data.profit);
  document.getElementById("sumInvoiceCount").textContent = data.invoice_count;
  renderTopProducts(data.top_products || []);
  return true;
}

async function loadStaffSales(from, to) {
  const res = await request("GET", `/api/reports/sales_per_staff?from=${from}&to=${to}`);
  if (!res.ok) return;
  const data = await res.json();
  renderStaffRows(data || []);
}

async function loadReports() {
  const messageEl = document.getElementById("message");
  const from = document.getElementById("fromDate").value || defaultFrom();
  const to = document.getElementById("toDate").value || defaultTo();

  document.getElementById("fromDate").value = from;
  document.getElementById("toDate").value = to;

  try {
    const summaryOk = await loadSummary(from, to);
    if (!summaryOk) {
      messageEl.textContent = "Could not load report summary.";
      return;
    }

    // sales_per_staff is admin-only server-side; a 403 here just means
    // this account is staff, so silently leave that table as-is.
    await loadStaffSales(from, to);
  } catch (err) {
    messageEl.textContent = "Something went wrong. Please try again.";
  }
}

document.getElementById("applyRange").addEventListener("click", loadReports);

window.authReady.then(loadReports);