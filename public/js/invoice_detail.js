function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
// get id//////////////////////////
function getInvoiceIdFromUrl() {
  const parts = window.location.pathname.split("/");
  return parts[parts.length - 1];
}
// load invoice////////////////////////////////////
async function loadInvoice() {
  const id = getInvoiceIdFromUrl();
  const messageEl = document.getElementById("message");
  const infoEl = document.getElementById("invoiceInfo");
  const itemRowsEl = document.getElementById("itemRows");

  try {
    const res = await request("GET", `/api/invoices/${encodeURIComponent(id)}`);

    if (!res.ok) {
      messageEl.textContent = res.status === 404 ? "Invoice not found." : "Could not load invoice.";
      return;
    }

    const data = await res.json();

    infoEl.innerHTML = `
      <p><strong>Invoice No:</strong> ${escapeHtml(data.invoice_no)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(data.customer_name || "")} (${escapeHtml(data.customer_email || "")})</p>
      <p><strong>Created By:</strong> ${escapeHtml(data.created_by_name || "")}</p>
      <p><strong>Status:</strong> ${escapeHtml(data.status)}</p>
      <p><strong>Subtotal:</strong> ${data.subtotal}</p>
      <p><strong>Discount:</strong> ${data.discount}</p>
      <p><strong>Tax:</strong> ${data.tax}</p>
      <p><strong>Total:</strong> ${data.total}</p>
    `;

    if (!data.items || !data.items.length) {
      itemRowsEl.innerHTML = `<tr><td colspan="5">No items.</td></tr>`;
      return;
    }

    itemRowsEl.innerHTML = data.items
      .map(
        (item) => `<tr>
          <td>${escapeHtml(item.product_name || "")}</td>
          <td>${escapeHtml(item.sku || "")}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_price}</td>
          <td>${item.line_total}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    messageEl.textContent = "Something went wrong. Please try again.";
  }
}

window.authReady.then(loadInvoice);