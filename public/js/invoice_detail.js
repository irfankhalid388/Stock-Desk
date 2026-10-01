// get id //////////////////////////
function getInvoiceIdFromUrl() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

// cancel invoice button ///////////////////////////////////
function updateCancelButtonVisibility() {
  const cancelBtn = document.getElementById("cancelInvoiceBtn");
  if (!cancelBtn || !window.currentUserRole) return;

  const canCancelRole = window.currentUserRole === "admin" || window.currentUserRole === "staff";
  const notCancelled = window.currentInvoiceStatus === "unpaid";

  cancelBtn.style.display = canCancelRole && notCancelled ? "" : "none";
}

// load invoice ////////////////////////////////////
async function loadInvoice() {
  const id = getInvoiceIdFromUrl();
  const messageEl = document.getElementById("message");
  const infoEl = document.getElementById("invoiceInfo");
  const itemRowsEl = document.getElementById("itemRows");

  messageEl.textContent = "";

  try {
    const res = await request("GET", `/api/invoices/${encodeURIComponent(id)}`);

    if (!res.ok) {
      messageEl.textContent =
        res.status === 404
          ? "Invoice not found."
          : messageFor(res.status, await readJson(res));
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
      <p><strong>Subtotal:</strong> ${escapeHtml(data.subtotal)}</p>
      <p><strong>Discount:</strong> ${escapeHtml(data.discount)}</p>
      <p><strong>Tax:</strong> ${escapeHtml(data.tax)}</p>
      <p><strong>Total:</strong> ${escapeHtml(data.total)}</p>
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
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(item.unit_price)}</td>
          <td>${escapeHtml(item.line_total)}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Could not load invoice. Please try again.";
  }
}

// cancel ////////////////////////////////////////////////////
async function cancelInvoice() {
  const id = getInvoiceIdFromUrl();
  const messageEl = document.getElementById("message");
  const btn = document.getElementById("cancelInvoiceBtn");
  if (!confirm("Cancel this invoice? Stock will be restored.")) return;

  messageEl.textContent = "";
  if (btn) btn.disabled = true;

  try {
    const res = await request("PUT", `/api/invoices/${encodeURIComponent(id)}/status`);
    if (!res.ok) {
      messageEl.textContent = messageFor(res.status, await readJson(res));
      return;
    }
    await loadInvoice();
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Could not reach the server. Please try again.";
  } finally {
    if (btn) btn.disabled = false;
  }
}

// mark paid /////////////////////////////////////////////////
async function markInvoicePaid() {
  const id = getInvoiceIdFromUrl();
  const messageEl = document.getElementById("message");
  const btn = document.getElementById("markPaidBtn");
  if (!confirm("Mark this invoice as paid?")) return;

  messageEl.textContent = "";
  if (btn) btn.disabled = true;

  try {
    const res = await request("PUT", `/api/invoices/${encodeURIComponent(id)}/pay`);
    if (!res.ok) {
      messageEl.textContent = messageFor(res.status, await readJson(res));
      return;
    }
    await loadInvoice();
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Could not reach the server. Please try again.";
  } finally {
    if (btn) btn.disabled = false;
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