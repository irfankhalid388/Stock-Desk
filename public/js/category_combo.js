const catInput = document.getElementById("categorySearch");
const catHidden = document.getElementById("category_id");
const catResults = document.getElementById("categoryResults");
let categories = [];

if (catInput && catHidden && catResults) {
  const errEl = () => document.getElementById("err-category_id");

  // LOAD ALL CATEGORIES ONCE ////////////////////////////////////
  async function loadCategories() {
    try {
      const res = await request("GET", "/api/categories");
      if (!res.ok) return;
      categories = await res.json();

      if (catHidden.value) {
        const current = categories.find((c) => String(c.id) === String(catHidden.value));
        if (current) catInput.value = current.name;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // SHOW MATCHING CATEGORIES + "ADD NEW" OPTION ////////////////
  function renderCategoryOptions(term) {
    const raw = term.trim();
    const t = raw.toLowerCase();
    const matches = categories.filter((c) => c.name.toLowerCase().includes(t));
    const exactExists = categories.some((c) => c.name.toLowerCase() === t);

    let html = matches
      .map(
        (c) => `<button type="button" class="pick-category" data-id="${c.id}">
          ${escapeHtml(c.name)}
        </button>`
      )
      .join("<br>");

    if (!matches.length) html = "<p>No matching categories.</p>";

    // offer to create it when the typed name is not an existing category
    if (raw && !exactExists) {
      html += `<br><button type="button" class="add-category" data-name="${escapeHtml(raw)}">
        + Add "${escapeHtml(raw)}" as new category
      </button>`;
    }

    catResults.innerHTML = html;
  }

  function closeCategoryList() {
    catResults.innerHTML = "";
  }

  function selectCategory(cat) {
    catHidden.value = cat.id;
    catInput.value = cat.name;
    closeCategoryList();
    if (errEl()) errEl().textContent = "";
  }

  // CREATE A NEW CATEGORY ///////////////////////////////////////
  async function addCategory(name) {
    if (errEl()) errEl().textContent = "";
    try {
      const res = await request("POST", "/api/categories", { name });

      if (res.status === 403) {
        if (errEl()) errEl().textContent = "Only admins can add new categories.";
        return;
      }
      if (res.status === 409) {
        if (errEl()) errEl().textContent = "This category already exists.";
        return;
      }
      if (!res.ok) {
        if (errEl()) errEl().textContent = "Could not add the category. Please try again.";
        return;
      }

      const created = await res.json();   // { id, name }
      categories.push(created);
      selectCategory(created);
    } catch (err) {
      console.error(err);
      if (errEl()) errEl().textContent = "Could not reach the server. Please try again.";
    }
  }

  // TYPING /////////////////////////////////////////////////////
  catInput.addEventListener("input", () => {
    catHidden.value = "";
    renderCategoryOptions(catInput.value);
  });

  catInput.addEventListener("focus", () => {
    renderCategoryOptions(catInput.value);
  });

  // CLICKS INSIDE THE LIST /////////////////////////////////////
  catResults.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add-category");
    if (addBtn) {
      addCategory(addBtn.dataset.name);
      return;
    }

    const btn = e.target.closest(".pick-category");
    if (!btn) return;
    const picked = categories.find((c) => String(c.id) === btn.dataset.id);
    if (picked) selectCategory(picked);
  });

  // CLICK OUTSIDE or ESC ///////////////////////////////////////
  document.addEventListener("click", (e) => {
    if (!catInput.contains(e.target) && !catResults.contains(e.target)) {
      closeCategoryList();
    }
  });
  catInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCategoryList();
  });

  loadCategories();
}