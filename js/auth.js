// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registrationForm"); 
  const header = document.getElementById("header-auth");

  // -----------------------
  // LOGIN
  // -----------------------
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      try {
        const res = await fetch("/.netlify/functions/login-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const text = await res.text();
          alert(text);
          return;
        }

        const data = await res.json();
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        window.location.href = "armaturenbrett.html";

      } catch (err) {
        console.error(err);
        alert("Error logging in. Try again.");
      }
    });
  }

  // -----------------------
  // REGISTRATION (Wizard)
  // -----------------------
  if (registerForm) {
    // Wizard logic and UI unchanged
    // ...

    registerForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!validateStep(current)) return;

      const data = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        street: document.getElementById('street').value,
        city: document.getElementById('addrCity').value,
        state: document.getElementById('addrState').value,
        country: document.getElementById('addrCountry').value,
        courses: Array.from(document.querySelectorAll('.course-card.selected')).map(c => c.dataset.value),
        marketing: document.getElementById('marketingOptIn')?.checked || false
      };

      try {
        const res = await fetch("/.netlify/functions/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const text = await res.text();
          alert(text);
          return;
        }

        alert("Registrierung erfolgreich! Bitte logge dich ein.");
        registerForm.reset();
        showStep(1);

        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();

      } catch (err) {
        console.error(err);
        alert("Fehler bei der Registrierung. Versuche es erneut.");
      }
    });

    showStep(1);
  }

  // -----------------------
  // HEADER AUTH
  // -----------------------
  if (header) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
      header.innerHTML = `
        <div class="d-inline-flex align-items-center" style="height: 45px;">
            <div class="dropdown">
                <a href="#" class="dropdown-toggle text-light" data-bs-toggle="dropdown">
                    <small><i class="fa fa-home me-2"></i> Fahrschule</small>
                </a>
                <ul class="dropdown-menu rounded">
                    <li><a href="armaturenbrett.html" class="dropdown-item"><i class="fas fa-user-alt me-2"></i> Armaturenbrett</a></li>
                    <li><a href="konto.html" class="dropdown-item"><i class="fas fa-user-alt me-2"></i> Kontoverwaltung</a></li>
                    <li><a href="benachrichtigungen.html" class="dropdown-item"><i class="fas fa-bell me-2"></i> Benachrichtigungen</a></li>
                </ul>
            </div>
            <a href="#" id="logoutBtn" class="ms-3 text-light"><small><i class="fas fa-sign-out-alt me-2"></i> Ausloggen</small></a>
        </div>
      `;
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) logoutBtn.addEventListener("click", e => {
        e.preventDefault();
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
      });
    } else {
      header.innerHTML = `
        <div class="d-inline-flex align-items-center" style="height: 45px;">
            <a href="login.html"><small class="me-3 text-light"><i class="fa fa-user me-2"></i> Register</small></a>
            <a href="login.html"><small class="me-3 text-light"><i class="fa fa-sign-in-alt me-2"></i> Login</small></a>
        </div>
      `;
    }
  }
});
