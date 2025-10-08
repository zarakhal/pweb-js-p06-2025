// favorites.js
const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const goToRecipesBtn = document.getElementById('goToRecipesBtn');
const favoritesList = document.getElementById('favoritesList');
const noFavorites = document.getElementById('noFavorites');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

// proteksi halaman: cek localStorage
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  alert('Silakan login terlebih dahulu.');
  window.location.href = 'login.html';
} else {
  userNameEl.textContent = `Welcome, ${user.firstName}!`;
}

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
  loadFavorites();
}

// load and display favorites
function loadFavorites() {
  const favorites = getFavorites();
  favoritesList.innerHTML = '';
  if (favorites.length === 0) {
    noFavorites.classList.remove('hidden');
    favoritesList.classList.add('hidden');
  } else {
    noFavorites.classList.add('hidden');
    favoritesList.classList.remove('hidden');
    favorites.forEach(recipe => {
      favoritesList.appendChild(createCard(recipe));
    });
  }
}

// create card for favorites
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
  viewBtn.addEventListener('click', () => openModal(r));

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove from Favorites';
  removeBtn.className = 'btn btn--ghost';
  removeBtn.addEventListener('click', () => toggleFavorite(r));

  btnContainer.append(viewBtn, removeBtn);

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
    <img src="${r.thumbnail ?? r.image ?? ''}" alt="${r.title ?? r.name}" style="max-width:300px; width:100%; border-radius:10px; margin-bottom:20px;"/>
    <div class="recipe-details">
      <p><strong>Prep Time:</strong> 🕒 ${r.prepTimeMinutes ?? '—'} mins</p>
      <p><strong>Cook Time:</strong> 🕒 ${r.cookTimeMinutes ?? '—'} mins</p>
      <p><strong>Servings:</strong> 🍽️ ${r.servings ?? '—'}</p>
      <p><strong>Difficulty:</strong> ${getDifficultyEmoji(r.difficulty)} ${r.difficulty ?? '—'}</p>
      <p><strong>Cuisine:</strong> 🌍 ${r.cuisine ?? '—'}</p>
      <p><strong>Calories per Serving:</strong> 🔥 ${r.caloriesPerServing ?? '—'}</p>
      <p><strong>Tags:</strong> ${r.tags ? r.tags.join(', ') : '—'}</p>
      <p><strong>Rating:</strong> ${starDisplay} (${r.rating ?? '—'})</p>
      <p><strong>Review Count:</strong> 💬 ${r.reviewCount ?? '—'}</p>
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

// back button
backBtn.addEventListener('click', () => {
  window.location.href = 'recipes.html';
});

// go to recipes button
goToRecipesBtn.addEventListener('click', () => {
  window.location.href = 'recipes.html';
});

// logout button
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

// start
loadFavorites();