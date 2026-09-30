const messageEl = document.getElementById("message");
const customerSearch = document.getElementById("customerSearch");
const customerResults = document.getElementById("customerResults");
const selectedCustomerEl = document.getElementById("selectedCustomer");
const selectedCustomerName = document.getElementById("selectedCustomerName");
const clearCustomerBtn = document.getElementById("clearCustomer");
const itemRowsEl = document.getElementById("itemRows");
const addItemBtn = document.getElementById("addItemBtn");
const discountInput = document.getElementById("discount");
const taxInput = document.getElementById("tax");
const subtotalDisplay = document.getElementById("subtotalDisplay");
const totalDisplay = document.getElementById("totalDisplay");
const submitBtn = document.getElementById("submitInvoice");

let debounceTimer;
let selectedCustomerId = null;
let items = [];
let rowCounter = 0;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function searchCustomers(term) {
  if (!term) {
    customerResults.innerHTML = "";
    return;
  }
  try {
    const res = await request("GET", `/api/customers?search=${encodeURIComponent(term)}&page=1&limit=10`);
    if (!res.ok) return;
    const data = await res.json();
    renderCustomerResults(data.rows || []);
  } catch (err) {
    customerResults.innerHTML = "";
  }
}

function renderCustomerResults(rows) {
  if (!rows.length) {
    customerResults.innerHTML = "<p>No matching customers.</p>";
    return;
  }
  customerResults.innerHTML = rows.map(
    (c) => `<button type="button" class="pick-customer" data-id="${c.id}" data-name="${escapeHtml(c.name)}">
      ${escapeHtml(c.name)} (ID: ${c.id})
    </button>`
  ).join("<br>");

  customerResults.querySelectorAll(".pick-customer").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedCustomerId = btn.dataset.id;
      selectedCustomerName.textContent = btn.dataset.name;
      selectedCustomerEl.style.display = "";
      customerResults.innerHTML = "";
      customerSearch.value = "";
    });
  });
}

clearCustomerBtn.addEventListener("click", () => {
  selectedCustomerId = null;
  selectedCustomerEl.style.display = "none";
});

customerSearch.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchCustomers(customerSearch.value.trim());
  }, 400);
});

function addItemRow() {
  const rowId = ++rowCounter;
  items.push({ rowId, productId: null, productName: "", unitPrice: 0, quantity: 1 });
  renderItemRows();
}

function renderItemRows() {
  itemRowsEl.innerHTML = items.map((item) => `
    <tr data-row-id="${item.rowId}">
      <td>
        <input type="text" class="product-search" placeholder="Search product..." value="${escapeHtml(item.productName)}">
        <div class="product-results"></div>
      </td>
      <td><input type="number" class="quantity-input" min="1" value="${item.quantity}"></td>
      <td class="unit-price-cell">${item.unitPrice}</td>
      <td class="line-total-cell">${(item.unitPrice * item.quantity).toFixed(2)}</td>
      <td><button type="button" class="remove-row">Remove</button></td>
    </tr>
  `).join("");

  itemRowsEl.querySelectorAll("tr").forEach((tr) => {
    const rowId = Number(tr.dataset.rowId);
    const item = items.find((i) => i.rowId === rowId);

    const productSearchInput = tr.querySelector(".product-search");
    const productResultsEl = tr.querySelector(".product-results");
    const quantityInput = tr.querySelector(".quantity-input");
    const removeBtn = tr.querySelector(".remove-row");

    let localDebounce;
    productSearchInput.addEventListener("input", () => {
      clearTimeout(localDebounce);
      localDebounce = setTimeout(async () => {
        const term = productSearchInput.value.trim();
        if (!term) {
          productResultsEl.innerHTML = "";
          return;
        }
        try {
          const res = await request("GET", `/api/products?search=${encodeURIComponent(term)}&page=1&limit=10`);
          if (!res.ok) return;
          const data = await res.json();
          productResultsEl.innerHTML = (data.rows || []).map(
            (p) => `<button type="button" class="pick-product" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-price="${p.sale_price}">
              ${escapeHtml(p.name)} — ${p.sale_price}
            </button>`
          ).join("<br>");

          productResultsEl.querySelectorAll(".pick-product").forEach((btn) => {
            btn.addEventListener("click", () => {
              item.productId = btn.dataset.id;
              item.productName = btn.dataset.name;
              item.unitPrice = parseFloat(btn.dataset.price);
              renderItemRows();
              updateTotals();
            });
          });
        } catch (err) {
          productResultsEl.innerHTML = "";
        }
      }, 400);
    });

    quantityInput.addEventListener("input", () => {
      item.quantity = parseInt(quantityInput.value) || 1;
      updateTotals();
      const lineTotalCell = tr.querySelector(".line-total-cell");
      if (lineTotalCell) lineTotalCell.textContent = (item.unitPrice * item.quantity).toFixed(2);
    });

    removeBtn.addEventListener("click", () => {
      items = items.filter((i) => i.rowId !== rowId);
      renderItemRows();
      updateTotals();
    });
  });
}

addItemBtn.addEventListener("click", addItemRow);

function updateTotals() {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = parseFloat(discountInput.value) || 0;
  const tax = parseFloat(taxInput.value) || 0;
  const total = subtotal - discount + tax;

  subtotalDisplay.textContent = subtotal.toFixed(2);
  totalDisplay.textContent = total.toFixed(2);
}

discountInput.addEventListener("input", updateTotals);
taxInput.addEventListener("input", updateTotals);

submitBtn.addEventListener("click", async () => {
  messageEl.textContent = "";

  if (!selectedCustomerId) {
      messageEl.textContent = "Please select a customer.";
    return; 
  }

  const validItems = items.filter((i) => i.productId && i.quantity > 0);
  if (!validItems.length) {
    messageEl.textContent = "Please add at least one item.";
    return;
  }

  const payload = {
    customerId: parseInt(selectedCustomerId),
    items: validItems.map((i) => ({ productId: parseInt(i.productId), quantity: i.quantity })),
    discount: parseFloat(discountInput.value) || 0,
    tax: parseFloat(taxInput.value) || 0,
  };

  try {
    const res = await request("POST", "/api/invoices", payload);

    if (res.status === 422) {
  const data = await res.json().catch(() => ({}));
  messageEl.textContent = data.errors
    ? Object.values(data.errors).join(". ")
    : data.error || "Validation failed.";
  return;
}

    if (!res.ok) {
      messageEl.textContent = "Something went wrong. Please try again.";
      return;
    }

    const data = await res.json();
    window.location.href = `/invoices/${data.id}`;
  } catch (err) {
    messageEl.textContent = "Something went wrong. Please try again.";
  }
});

addItemRow();