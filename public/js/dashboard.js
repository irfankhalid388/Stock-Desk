function money(n) {
  return "Rs " + Number(n).toLocaleString("en-US");
}

function renderCounts(counts) {
  document.querySelectorAll("[data-count]").forEach((el) => {
    el.textContent = counts[el.dataset.count] ?? 0;
  });
}

function renderSales(sales) {
  document.querySelectorAll("[data-sales]").forEach((el) => {
    el.textContent = money(sales[el.dataset.sales] ?? 0);
  });
  document.getElementById("salesSection").hidden = false;
}

// textContent use kiya hai, innerHTML nahi, taake product name se XSS na ho
function renderTopProducts(list) {
  const box = document.getElementById("topProducts");
  box.textContent = "";
  document.getElementById("topSection").hidden = false;

  if (list.length === 0) {
    document.getElementById("topEmpty").hidden = false;
    return;
  }

  list.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p.name + " - " + money(p.revenue);
    box.appendChild(li);
  });
}

async function loadDashboard() {
  const res = await request("GET", "/api/dashboard");

  if (res.status === 401) {
    window.location.href = "/login";
    return;
  }
  if (!res.ok) {
    document.getElementById("dashError").hidden = false;
    return;
  }

  const data = await res.json();
  renderCounts(data.counts);
  // backend ne sales/top_products sirf admin ko bheje hain, isliye yahan role check ki zaroorat nahi
  if (data.sales) renderSales(data.sales);
  if (data.top_products) renderTopProducts(data.top_products);
}

window.authReady.then(loadDashboard);