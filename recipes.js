// recipes.js
const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const cuisineFilter = document.getElementById('cuisineFilter');
const recipesList = document.getElementById('recipesList');
const showMoreBtn = document.getElementById('showMoreBtn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

let allRecipes = []; // full data
let filtered = [];   // filtered subset
let page = 0;
const PAGE_SIZE = 8;

// proteksi halaman: cek localStorage
const firstName = localStorage.getItem('firstName');
if (!firstName) {
  alert('Silakan login terlebih dahulu.');
  window.location.href = 'login.html';
} else {
  userNameEl.textContent = firstName;
}

// logout button
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('firstName');
  window.location.href = 'login.html';
});

// fetch recipes
async function loadRecipes() {
  try {
    recipesList.innerHTML = 'Loading...';
    const res = await fetch('https://dummyjson.com/recipes');
    if (!res.ok) throw new Error('Gagal mengambil recipes');
    const data = await res.json();
    // dummyjson might return { recipes: [...] } or array directly
    allRecipes = data.recipes ?? data;
    filtered = allRecipes.slice();
    populateCuisineDropdown(allRecipes);
    renderPageReset();
  } catch (err) {
    recipesList.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    console.error(err);
  }
}

// fill cuisine dropdown
function populateCuisineDropdown(recipes) {
  const cuisines = Array.from(new Set(recipes.map(r => r.cuisine).filter(Boolean)));
  cuisines.sort();
  cuisines.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    cuisineFilter.appendChild(opt);
  });
}

// rendering functions
function renderPageReset() {
  page = 0;
  recipesList.innerHTML = '';
  renderMore();
}

function renderMore() {
  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  slice.forEach(recipe => {
    recipesList.appendChild(createCard(recipe));
  });
  page++;
  // hide button if no more
  if (page * PAGE_SIZE >= filtered.length) {
    showMoreBtn.style.display = 'none';
  } else {
    showMoreBtn.style.display = 'inline-block';
  }
}

function createCard(r) {
  const card = document.createElement('article');
  card.className = 'card recipe-card';

  const img = document.createElement('img');
  img.src = r.thumbnail ?? r.image ?? '';
  img.alt = r.title ?? r.name ?? 'recipe';

  const title = document.createElement('h3');
  title.textContent = r.title ?? r.name ?? 'No title';

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${r.cookingTime ?? r.time ?? '—'} min • ${r.difficulty ?? '—'} • ${r.cuisine ?? '—'}`;

  const rating = document.createElement('div');
  rating.className = 'rating';
  const stars = Math.round(r.rating ?? 0);
  rating.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars) + ` (${r.rating ?? 0})`;

  const ingr = document.createElement('p');
  ingr.className = 'ingredients';
  if (r.ingredients) {
    ingr.textContent = 'Ingredients: ' + r.ingredients.slice(0, 5).join(', ') + (r.ingredients.length > 5 ? '...' : '');
  }

  const btn = document.createElement('button');
  btn.textContent = 'View Full Recipe';
  btn.addEventListener('click', () => openModal(r));

  card.append(img, title, meta, rating, ingr, btn);
  return card;
}

// modal
function openModal(r) {
  modalBody.innerHTML = `
    <h2>${r.title ?? r.name}</h2>
    <img src="${r.thumbnail ?? r.image ?? ''}" alt="${r.title ?? r.name}" style="max-width:100%;"/>
    <p><strong>Time:</strong> ${r.cookingTime ?? r.time ?? '—'} min</p>
    <p><strong>Difficulty:</strong> ${r.difficulty ?? '—'}</p>
    <p><strong>Cuisine:</strong> ${r.cuisine ?? '—'}</p>
    <p><strong>Rating:</strong> ${r.rating ?? '—'}</p>
    <p><strong>Ingredients:</strong> ${(r.ingredients ?? []).join(', ')}</p>
    <p><strong>Steps / Instructions:</strong></p>
    <pre>${(r.instructions ?? r.steps ?? 'Tidak ada instruksi lengkap')}</pre>
  `;
  modal.classList.remove('hidden');
}

modalClose.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

// search + filter (debounce)
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function applyFilters() {
  const q = (searchInput.value || '').toLowerCase();
  const cuisine = cuisineFilter.value;

  filtered = allRecipes.filter(r => {
    // search in title/name, cuisine, ingredients, tags
    const title = (r.title ?? r.name ?? '').toString().toLowerCase();
    const c = (r.cuisine ?? '').toString().toLowerCase();
    const ingredients = (r.ingredients ?? []).join(' ').toLowerCase();
    const tags = (r.tags ?? []).join(' ').toLowerCase();

    const qMatch = !q || title.includes(q) || c.includes(q) || ingredients.includes(q) || tags.includes(q);
    const cuisineMatch = !cuisine || c === cuisine.toLowerCase();
    return qMatch && cuisineMatch;
  });

  renderPageReset();
}

searchInput.addEventListener('input', debounce(applyFilters, 350));
cuisineFilter.addEventListener('change', applyFilters);
showMoreBtn.addEventListener('click', renderMore);

// start
loadRecipes();
