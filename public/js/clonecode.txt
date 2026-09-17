let accessToken = null;

async function initauth() {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      accessToken = data.accessToken;
    }
  } catch (err) {
    console.error("Failed to refresh session:", err);
  }
}
initauth();

// ---- automatic refresh on expired token ----

async function apiFetch(url, options = {}) {
  const doFetch = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const errbody = await res.clone().json().catch(() => ({}));

    if (errbody.error === "TOKEN_EXPIRED") {
      const refreshtoken = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshtoken.ok) {
        const data = await refreshtoken.json();
        accessToken = data.accessToken;
        res = await doFetch(accessToken);
      } else {
        window.location.href = "/login";
        return null;
      }
    } else {
      window.location.href = "/login";
      return null;
    }
  }

  return res;
}

// ---- search ----

const searchinput = document.getElementById("input");
let debouncetimer;

if (searchinput) {
  searchinput.addEventListener("input", () => {
    clearTimeout(debouncetimer);
    debouncetimer = setTimeout(() => {
      pagecurrent(1, searchinput.value);
    }, 300);
  });
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderProductrows(products) {
  const tbody = document.getElementById("productTableBody");
  if (!tbody) return;
  tbody.innerHTML = products
    .map(
      (p) => `
        <tr>
          <td>${escapeHtml(p.sku)}</td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.sale_price)}</td>
        </tr>
      `
    )
    .join("");
}

// ---- pagination ----

let currentpage = 1;

async function pagecurrent(page, search) {
  const res = await apiFetch(`/api/products?search=${encodeURIComponent(search)}&page=${page}`);
  const data = await res.json();
  renderProductrows(data.rows);
  updatepaginationcontrol(data.page, data.pages);
  currentpage = data.page;
}

function updatepaginationcontrol(page, pages) {
  currentpage = page;
  document.getElementById("pageinfo").textContent = `${page} of ${pages}`;
  document.getElementById("prevpage").disabled = page <= 1;
  document.getElementById("nextpage").disabled = page >= pages;
}

const prevbtn = document.getElementById("prevpage");
const nextbtn = document.getElementById("nextpage");

if (prevbtn) {
  prevbtn.addEventListener("click", () => {
    pagecurrent(currentpage - 1, searchinput ? searchinput.value : "");
  });
}

if (nextbtn) {
  nextbtn.addEventListener("click", () => {
    pagecurrent(currentpage + 1, searchinput ? searchinput.value : "");
  });
}

// ---- form (add/edit) ----

const productForm = document.getElementById("productForm");

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.querySelectorAll("[id^='err-']").forEach((el) => (el.textContent = ""));

    const id = document.getElementById("productId").value;
    const costPriceEl = document.getElementById("cost_price");

    const payload = {
      sku: document.getElementById("sku").value,
      name: document.getElementById("name").value,
      category_id: Number(document.getElementById("category_id").value),
      sale_price: Number(document.getElementById("sale_price").value),
      quantity: Number(document.getElementById("quantity").value),
      reorder_level: Number(document.getElementById("reorder_level").value),
    };

    if (costPriceEl) {
      payload.cost_price = Number(costPriceEl.value);
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `/api/products/${id}` : "/api/products";

    const res = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.status === 422) {
      Object.entries(data.errors).forEach(([field, msg]) => {
        const el = document.getElementById(`err-${field}`);
        if (el) el.textContent = msg;
      });
      return;
    }

    if (res.status === 409) {
      document.getElementById("err-sku").textContent = data.error;
      return;
    }

    window.location.href = "/products";
  });
}
// ---- delete ----

document.querySelectorAll(".delete-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!confirm("Delete this product?")) return;

    const id = btn.dataset.id;
    const res = await apiFetch(`/api/products/${id}`, { method: "DELETE" });

    if (res && res.status === 204) {
      btn.closest("tr").remove();
    }
  });
});

// ---- stock adjust ----

document.querySelectorAll(".adjust-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const change_qty = Number(prompt("Change quantity by (negative to reduce):"));
    if (!change_qty) return;

    const reason = prompt("Reason (sale/purchase/adjustment/return):", "adjustment");
    const note = prompt("Note (optional):", "");

    const id = btn.dataset.id;
    const res = await apiFetch(`/api/products/${id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ change_qty, reason, note }),
    });

    if (res && res.ok) {
      window.location.reload();
    } else if (res) {
      const data = await res.json();
      alert(data.error || "Adjustment failed");
    }
  });
});