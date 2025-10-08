// login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";
    message.classList.remove("error", "success");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      message.textContent = "Mohon isi username dan password.";
      message.classList.add("error");
      return;
    }

    try {
      // Fetch ke dummyjson API
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // jika status bukan 200
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data));
      message.textContent = "Login berhasil! Mengalihkan...";
      message.classList.add("success");

      // Delay sedikit agar user sempat lihat pesannya
      setTimeout(() => {
        window.location.href = "recipes.html";
      }, 1000);
    } catch (error) {
      message.textContent = "Username atau password salah, silakan coba lagi.";
      message.classList.add("error");
    }
  });
});
