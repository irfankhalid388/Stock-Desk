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
    tbody.innerHTML = `<tr><td colspan="3">No sales in this range.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows
    .map(
      (p) => `<tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.units_sold)}</td>
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
        <td>${escapeHtml(u.invoice_count)}</td>
        <td>${money(u.revenue)}</td>
      </tr>`
    )
    .join("");
}

async function loadSummary(from, to) {
  const res = await request(
    "GET",
    `/api/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
  if (!res.ok) {
    return { ok: false, message: messageFor(res.status, await readJson(res)) };
  }
  const data = await res.json();

  document.getElementById("sumRevenue").textContent = money(data.revenue);
  document.getElementById("sumCost").textContent = money(data.cost);
  document.getElementById("sumProfit").textContent = money(data.profit);
  document.getElementById("sumInvoiceCount").textContent = data.invoice_count ?? 0;
  renderTopProducts(Array.isArray(data.top_products) ? data.top_products : []);
  return { ok: true };
}

async function loadStaffSales(from, to) {
  const res = await request(
    "GET",
    `/api/reports/sales_per_staff?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
  // sales_per_staff admin-only hai: 403 ka matlab sirf ye ke account staff ka hai
  if (res.status === 403) return;
  if (!res.ok) throw new Error(`staff sales failed: ${res.status}`);
  const data = await res.json();
  renderStaffRows(Array.isArray(data) ? data : []);
}

async function loadReports() {
  const messageEl = document.getElementById("message");
  const applyBtn = document.getElementById("applyRange");
  messageEl.textContent = "";

  const from = document.getElementById("fromDate").value || defaultFrom();
  const to = document.getElementById("toDate").value || defaultTo();

  document.getElementById("fromDate").value = from;
  document.getElementById("toDate").value = to;
  if (from > to) {
    messageEl.textContent = "The 'from' date must be before the 'to' date.";
    return;
  }

  if (applyBtn) applyBtn.disabled = true;
  try {
    const summary = await loadSummary(from, to);
    if (!summary.ok) {
      messageEl.textContent = summary.message;
      return;
    }

    await loadStaffSales(from, to);
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Could not load reports. Please try again.";
  } finally {
    if (applyBtn) applyBtn.disabled = false;
  }
}
const stockMovementsBtn = document.getElementById("stockMovementsBtn")

if (stockMovementsBtn) {
  stockMovementsBtn.addEventListener("click", () => {
    window.location.href = "/stock-movements"
  })
}

document.getElementById("applyRange").addEventListener("click", loadReports);

window.authReady.then(loadReports);