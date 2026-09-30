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

// cancle invoice button///////////////////////////////////
function updateCancelButtonVisibility() {
  const cancelBtn = document.getElementById("cancelInvoiceBtn");
  if (!cancelBtn || !window.currentUserRole) return;

  const canCancelRole = window.currentUserRole === "admin" || window.currentUserRole === "staff";
  const notCancelled = window.currentInvoiceStatus === "unpaid";

  cancelBtn.style.display = canCancelRole && notCancelled ? "" : "none";
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
    window.currentInvoiceStatus = data.status;
updateCancelButtonVisibility();

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
    const markPaidBtn = document.getElementById("markPaidBtn");
    if (markPaidBtn) markPaidBtn.style.display = data.status === "unpaid" ? "" : "none";

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
async function cancelInvoice() {
  const id = getInvoiceIdFromUrl();
  const messageEl = document.getElementById("message");
  if (!confirm("Cancel this invoice? Stock will be restored.")) return;

  try {
    const res = await request("PUT", `/api/invoices/${encodeURIComponent(id)}/status`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      messageEl.textContent = data.message || "Could not cancel invoice.";
      return;
    }
    loadInvoice();
  } catch (err) {
    messageEl.textContent = "Something went wrong. Please try again.";
  }
}
async function markInvoicePaid() {
  const id = getInvoiceIdFromUrl();
  const messageEl = document.getElementById("message");
  if (!confirm("Mark this invoice as paid?")) return;

  try {
    const res = await request("PUT", `/api/invoices/${encodeURIComponent(id)}/pay`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      messageEl.textContent = data.message|| data.error || "Could not mark invoice as paid.";
      return;
    }
    loadInvoice();
  } catch (err) {
    messageEl.textContent = "Something went wrong. Please try again.";
  }
}

const cancelBtn = document.getElementById("cancelInvoiceBtn");
if (cancelBtn) cancelBtn.addEventListener("click", cancelInvoice);

const markPaidBtn = document.getElementById("markPaidBtn");
if (markPaidBtn) markPaidBtn.addEventListener("click", markInvoicePaid);


document.addEventListener("userRoleLoaded", function (e) {
  window.currentUserRole = e.detail.role;
  updateCancelButtonVisibility();
});
window.authReady.then(loadInvoice);