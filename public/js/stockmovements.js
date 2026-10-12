const tbody = document.getElementById("movementsBody")
const msg = document.getElementById("movementsMsg")

async function loadMovements() {
  const res = await request("GET", "/api/reports/stock-movements")
  const data = await readJson(res)

  if (!res.ok) {
    msg.textContent = messageFor(res.status, data)
    return
  }

  tbody.innerHTML = data.rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(new Date(r.created_at).toLocaleString())}</td>
        <td>${escapeHtml(r.product_name)}</td>
        <td>${escapeHtml(r.sku)}</td>
        <td>${escapeHtml(r.change_qty)}</td>
        <td>${escapeHtml(r.reason)}</td>
        <td>${escapeHtml(r.reference_id)}</td>
        <td>${escapeHtml(r.user_name)}</td>
        <td>${escapeHtml(r.note)}</td>
      </tr>`
    )
    .join("")

  if (data.rows.length === 0) msg.textContent = "No stock movements yet."
}

loadMovements()