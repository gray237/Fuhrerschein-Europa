// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Initialize users array in localStorage if not present
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }

  const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
  const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        // Save logged-in user info
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        alert("Login successful!");
        window.location.href = "armaturenbrett.html";
      } else {
        alert("Invalid email or password!");
      }
    });
  }

  // REGISTER
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      const confirmPassword = document.getElementById("regConfirmPassword").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      let users = getUsers();

      if (users.some(u => u.email === email)) {
        alert("Email already registered!");
        return;
      }

      const newUser = { id: Date.now(), name, email, password };
      users.push(newUser);
      saveUsers(users);

      // Auto-login after registration
      localStorage.setItem("loggedInUser", JSON.stringify(newUser));
      alert("Registration successful!");
      window.location.href = "armaturenbrett.html";
    });
  }

  // Optional: Logout function for dashboard
  window.logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  };
});

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header-auth");
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!header) return;

    if (user) {
        // Logged in view
        header.innerHTML = `
            <div class="d-inline-flex align-items-center" style="height: 45px;">
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle text-light" data-bs-toggle="dropdown">
                        <small><i class="fa fa-home me-2"></i> Fahrschule</small>
                    </a>
                    <div class="dropdown-menu rounded">
                        <a href="armaturenbrett.html" class="dropdown-item"><i class="fas fa-user-alt me-2"></i> Armaturenbrett</a>
                        <a href="konto.html" class="dropdown-item"><i class="fas fa-user-alt me-2"></i> Kontoverwaltung</a>
                        <a href="benachrichtigungen.html" class="dropdown-item"><i class="fas fa-bell me-2"></i> Benachrichtigungen</a>
                    </div>
                </div>
                <a href="#" id="logoutBtn" class="ms-3 text-light"><small><i class="fas fa-sign-out-alt me-2"></i> Ausloggen</small></a>
            </div>
        `;

        // Logout action
        document.getElementById("logoutBtn").addEventListener("click", e => {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });

    } else {
        // Logged out view
        header.innerHTML = `
            <div class="d-inline-flex align-items-center" style="height: 45px;">
                <a href="login.html"><small class="me-3 text-light"><i class="fa fa-user me-2"></i> Register</small></a>
                <a href="login.html"><small class="me-3 text-light"><i class="fa fa-sign-in-alt me-2"></i> Login</small></a>
            </div>
        `;
    }
});

