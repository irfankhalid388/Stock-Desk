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
// customer selection for invoice////////////////////////////////////////
// CUSTOMER SEARCH ///////////////////////////////////////////////////
async function searchCustomers(term) {
  if (!term) {
    customerResults.innerHTML = "";
    return;
  }
  try {
    const res = await request(
      "GET",
      `/api/customers?search=${encodeURIComponent(term)}&page=1&limit=10`
    );
    // purana jawab naye search ko overwrite na kare
    if (customerSearch.value.trim() !== term) return;

    if (!res.ok) {
      customerResults.innerHTML = "<p>Search failed. Please try again.</p>";
      return;
    }
    const data = await res.json();
    renderCustomerResults(data.rows || []);
  } catch (err) {
    console.error(err);
    customerResults.innerHTML = "<p>Search failed. Please try again.</p>";
  }
}

function renderCustomerResults(rows) {
  if (!rows.length) {
    customerResults.innerHTML = "<p>No matching customers.</p>";
    return;
  }
  customerResults.innerHTML = rows
    .map(
      (c) => `<button type="button" class="pick-customer" data-id="${c.id}" data-name="${escapeHtml(c.name)}">
      ${escapeHtml(c.name)} (ID: ${c.id})
    </button>`
    )
    .join("<br>");

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
// product selection for invoice//////////////////////////////////////
// ITEM ROWS /////////////////////////////////////////////////////////
function addItemRow() {
  const rowId = ++rowCounter;
  items.push({ rowId, productId: null, productName: "", unitPrice: 0, quantity: 1 });
  renderItemRows();
}

// /////////////////////////////////////////////////////////////shows products

function renderItemRows() {
  itemRowsEl.innerHTML = items
    .map(
      (item) => `
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
  `
    )
    .join("");
    /////////////////////////////////////// connect rows to javascript

  itemRowsEl.querySelectorAll("tr").forEach((tr) => {
    const rowId = Number(tr.dataset.rowId);
    const item = items.find((i) => i.rowId === rowId);

    const productSearchInput = tr.querySelector(".product-search");
    const productResultsEl = tr.querySelector(".product-results");
    const quantityInput = tr.querySelector(".quantity-input");
    const removeBtn = tr.querySelector(".remove-row");

    let localDebounce;
    productSearchInput.addEventListener("input", () => {
      // text badla to purani selection invalid hai: purana productId submit na ho
      item.productName = productSearchInput.value;
      if (item.productId) {
        item.productId = null;
        item.unitPrice = 0;
        tr.querySelector(".unit-price-cell").textContent = "0";
        tr.querySelector(".line-total-cell").textContent = "0.00";
        updateTotals();
      }

      clearTimeout(localDebounce);
      localDebounce = setTimeout(async () => {
        const term = productSearchInput.value.trim();
        if (!term) {
          productResultsEl.innerHTML = "";
          return;
        }
        try {
          const res = await request(
            "GET",
            `/api/products?search=${encodeURIComponent(term)}&page=1&limit=10`
          );
          if (productSearchInput.value.trim() !== term) return;

          if (!res.ok) {
            productResultsEl.innerHTML = "<p>Search failed. Please try again.</p>";
            return;
          }
          const data = await res.json();
          const rows = data.rows || [];

          if (!rows.length) {
            productResultsEl.innerHTML = "<p>No matching products.</p>";
            return;
          }

          productResultsEl.innerHTML = rows
            .map(
              (p) => `<button type="button" class="pick-product" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-price="${escapeHtml(p.sale_price)}">
              ${escapeHtml(p.name)} — ${escapeHtml(p.sale_price)}
            </button>`
            )
            .join("<br>");

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
          console.error(err);
          productResultsEl.innerHTML = "<p>Search failed. Please try again.</p>";
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

// TOTALS ////////////////////////////////////////////////////////////
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

// SUBMIT ////////////////////////////////////////////////////////////
submitBtn.addEventListener("click", async () => {
  messageEl.textContent = "";

  if (!selectedCustomerId) {
    messageEl.textContent = "Please select a customer.";
    return;
  }

  // text likha hai lekin product pick nahi kiya
  const unpickedIndex = items.findIndex((i) => i.productName.trim() && !i.productId);
  if (unpickedIndex !== -1) {
    messageEl.textContent = `Row ${unpickedIndex + 1}: please pick a product from the search results.`;
    return;
  }

  const validItems = items.filter((i) => i.productId && i.quantity > 0);
  if (!validItems.length) {
    messageEl.textContent = "Please add at least one item.";
    return;
  }

  const discount = parseFloat(discountInput.value) || 0;
  const tax = parseFloat(taxInput.value) || 0;
  const subtotal = validItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  if (subtotal - discount + tax < 0) {
    messageEl.textContent = "Discount cannot be more than the invoice amount.";
    return;
  }

  const payload = {
    customerId: parseInt(selectedCustomerId),
    items: validItems.map((i) => ({ productId: parseInt(i.productId), quantity: i.quantity })),
    discount,
    tax,
  };

  submitBtn.disabled = true;
  try {
    const res = await request("POST", "/api/invoices", payload);

    if (res.ok) {
      // invoice ban chuka hai: agar reply parse fail ho to bhi retry na karwayein
      const data = await readJson(res);
      window.location.href = data.id ? `/invoices/${data.id}` : "/invoices";
      return;
    }

    const data = await readJson(res);
    if (res.status === 422 && data.errors) {
      messageEl.textContent = [...new Set(Object.values(data.errors))].join(". ");
    } else {
      messageEl.textContent = messageFor(res.status, data);
    }
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Could not reach the server. Please try again.";
  }
  submitBtn.disabled = false;
});

addItemRow();