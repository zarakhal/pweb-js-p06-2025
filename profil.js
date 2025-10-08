// profil.js
const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const profileDetails = document.getElementById('profileDetails');

// proteksi halaman: cek localStorage
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  alert('Silakan login terlebih dahulu.');
  window.location.href = 'login.html';
} else {
  userNameEl.textContent = `Welcome, ${user.firstName}!`;
  // populate profile details
  profileDetails.innerHTML = `
    <h2>Personal Information</h2>
    <div class="detail-grid">
      <p><strong>First Name:</strong> ${user.firstName || '—'}</p>
      <p><strong>Last Name:</strong> ${user.lastName || '—'}</p>
      <p><strong>Maiden Name:</strong> ${user.maidenName || '—'}</p>
      <p><strong>Age:</strong> ${user.age || '—'}</p>
      <p><strong>Gender:</strong> ${user.gender || '—'}</p>
      <p><strong>Email:</strong> ${user.email || '—'}</p>
      <p><strong>Phone:</strong> ${user.phone || '—'}</p>
      <p><strong>Birth Date:</strong> ${user.birthDate || '—'}</p>
      <p><strong>Blood Group:</strong> ${user.bloodGroup || '—'}</p>
      <p><strong>Height:</strong> ${user.height || '—'} cm</p>
      <p><strong>Weight:</strong> ${user.weight || '—'} kg</p>
      <p><strong>Eye Color:</strong> ${user.eyeColor || '—'}</p>
      <p><strong>Hair Color:</strong> ${user.hair?.color || '—'}</p>
      <p><strong>Hair Type:</strong> ${user.hair?.type || '—'}</p>
    </div>
    <h2>Address</h2>
    <div class="detail-grid">
      <p><strong>Address:</strong> ${user.address?.address || '—'}</p>
      <p><strong>City:</strong> ${user.address?.city || '—'}</p>
      <p><strong>State:</strong> ${user.address?.state || '—'}</p>
      <p><strong>State Code:</strong> ${user.address?.stateCode || '—'}</p>
      <p><strong>Postal Code:</strong> ${user.address?.postalCode || '—'}</p>
      <p><strong>Country:</strong> ${user.address?.country || '—'}</p>
    </div>
  `;
}

// back button
backBtn.addEventListener('click', () => {
  window.location.href = 'recipes.html';
});

// logout button
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});