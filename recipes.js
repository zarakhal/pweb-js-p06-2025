const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const menuToggle = document.getElementById('menuToggle');
const favoritesBtn = document.getElementById('favoritesBtn');
const profileMenu = document.getElementById('profileMenu');
const viewProfileBtn = document.getElementById('viewProfileBtn');
const profileSummary = document.getElementById('profileSummary');
const searchInput = document.getElementById('searchInput');
const cuisineFilter = document.getElementById('cuisineFilter');
const ratingSort = document.getElementById('sortBtn');
const resultsCount = document.getElementById('resultsCount');
const recipesList = document.getElementById('recipesList');
const showMoreBtn = document.getElementById('showMoreBtn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

let allRecipes = []; // full data
let filtered = [];   // filtered subset
let page = 0;
let displayed = 0;   // number of recipes currently displayed
const PAGE_SIZE = 8;

// helper function for difficulty emoji
function getDifficultyEmoji(diff) {
  const d = diff?.toLowerCase();
  if (d === 'easy') return '🟢';
  if (d === 'medium') return '🟡';
  if (d === 'hard') return '🔴';
  return '';
}

// get favorites from localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

// save favorites to localStorage
function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// check if recipe is favorited
function isFavorited(recipeId) {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === recipeId);
}

// toggle favorite
function toggleFavorite(recipe) {
  let favorites = getFavorites();
  const index = favorites.findIndex(fav => fav.id === recipe.id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(recipe);
  }
  saveFavorites(favorites);
  // update button text if needed, but since cards are re-rendered on filter, it will update
}

// proteksi halaman: cek localStorage
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  alert('Silakan login terlebih dahulu.');
  window.location.href = 'login.html';
} else {
  userNameEl.textContent = `Welcome, ${user.firstName}!`;
  // populate profile summary
  profileSummary.innerHTML = `
    <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
    <p><strong>Age:</strong> ${user.age}</p>
    <p><strong>Gender:</strong> ${user.gender}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
  `;
}

// menu toggle
menuToggle.addEventListener('click', () => {
  profileMenu.classList.toggle('hidden');
});

// favorites button
favoritesBtn.addEventListener('click', () => {
  window.location.href = 'favorites.html';
});

// view profile button
viewProfileBtn.addEventListener('click', () => {
  window.location.href = 'profil.html';
});

// close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!menuToggle.contains(e.target) && !profileMenu.contains(e.target)) {
    profileMenu.classList.add('hidden');
  }
});

// close menu when clicking on the overlay
profileMenu.addEventListener('click', (e) => {
  if (e.target === profileMenu) {
    profileMenu.classList.add('hidden');
  }
});

// logout button
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
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
  displayed = 0;
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
  displayed += slice.length;
  resultsCount.textContent = `Showing ${displayed} of ${filtered.length} recipes`;
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
  meta.textContent = `🕒 ${r.cookTimeMinutes ?? '—'} mins • ${getDifficultyEmoji(r.difficulty)} ${r.difficulty ?? '—'} • 🌍 ${r.cuisine ?? '—'}`;

  const rating = document.createElement('div');
  rating.className = 'rating';
  const stars = Math.round(r.rating ?? 0);
  rating.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars) + ` (${r.rating ?? 0})`;

  const ingr = document.createElement('p');
  ingr.className = 'ingredients';
  if (r.ingredients) {
    ingr.textContent = 'Ingredients: ' + r.ingredients.slice(0, 3).join(', ') + (r.ingredients.length > 3 ? ` +${r.ingredients.length - 3} more` : '');
  }

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '8px';

  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'View Full Recipe';
  viewBtn.className = 'btn btn--primary';
  viewBtn.style.flex = '1';
  viewBtn.addEventListener('click', () => openModal(r));

  const favBtn = document.createElement('button');
  favBtn.textContent = isFavorited(r.id) ? 'Remove from Favorites' : 'Add to Favorites';
  favBtn.className = 'btn btn--ghost';
  favBtn.style.flex = '1';
  favBtn.addEventListener('click', () => {
    toggleFavorite(r);
    favBtn.textContent = isFavorited(r.id) ? 'Remove from Favorites' : 'Add to Favorites';
  });

  btnContainer.append(viewBtn, favBtn);

  card.append(img, title, meta, rating, ingr, btnContainer);
  return card;
}

// modal
function openModal(r) {
  const stars = Math.round(r.rating ?? 0);
  const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  const tagsHtml = (r.tags ?? []).map(tag => `<span class="tag">${tag}</span>`).join('');
  modalBody.innerHTML = `
    <h2>${r.title ?? r.name}</h2>
    <div class="modal-recipe-layout">
      <img src="${r.thumbnail ?? r.image ?? ''}" alt="${r.title ?? r.name}" class="modal-image"/>
      <div class="recipe-details">
        <p><strong>Prep Time:</strong> 🕒 ${r.prepTimeMinutes ?? '—'} mins</p>
        <p><strong>Cook Time:</strong> 🕒 ${r.cookTimeMinutes ?? '—'} mins</p>
        <p><strong>Servings:</strong> 🍽️ ${r.servings ?? '—'}</p>
        <p><strong>Difficulty:</strong> ${getDifficultyEmoji(r.difficulty)} ${r.difficulty ?? '—'}</p>
        <p><strong>Cuisine:</strong> 🌍 ${r.cuisine ?? '—'}</p>
        <p><strong>Calories per Serving:</strong> 🔥 ${r.caloriesPerServing ?? '—'}</p>
        <p><strong>Rating:</strong> ${starDisplay} (${r.rating ?? '—'})</p>
        <p><strong>Review Count:</strong> 💬 ${r.reviewCount ?? '—'}</p>
        <div class="tags-container">${tagsHtml}</div>
      </div>
    </div>
    <h3>Ingredients</h3>
    <ul>
      ${(r.ingredients ?? []).map(ing => `<li>${ing}</li>`).join('')}
    </ul>
    <h3>Instructions</h3>
    <ol>
      ${(r.instructions ?? []).map(inst => `<li>${inst}</li>`).join('')}
    </ol>
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

  // sort by rating
  if (ratingSort.value === 'asc') {
    filtered.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
  } else if (ratingSort.value === 'desc') {
    filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  renderPageReset();
}

searchInput.addEventListener('input', debounce(applyFilters, 350));
cuisineFilter.addEventListener('change', applyFilters);
ratingSort.addEventListener('change', applyFilters);
showMoreBtn.addEventListener('click', renderMore);

// start
loadRecipes();
