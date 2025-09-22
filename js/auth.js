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
        alert("Login successful!");
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
    // Wizard steps
    const steps = Array.from(document.querySelectorAll('.wizard-step'));
    const progressBar = document.getElementById('wizard-progress');
    const pills = {
      1: document.getElementById('pill-1'),
      2: document.getElementById('pill-2'),
      3: document.getElementById('pill-3'),
      4: document.getElementById('pill-4'),
      5: document.getElementById('pill-5')
    };
    let current = 1;
    const total = steps.length;

    function showStep(n) {
      steps.forEach(s => s.classList.remove('active'));
      const stepEl = document.querySelector(`.wizard-step[data-step="${n}"]`);
      if (!stepEl) return;
      stepEl.classList.add('active');

      Object.keys(pills).forEach(k => {
        pills[k].classList.toggle('active', Number(k) === n);
      });

      const pct = Math.round(((n - 1) / (total - 1)) * 100);
      if (progressBar) {
        progressBar.style.width = pct + '%';
        progressBar.setAttribute('aria-valuenow', pct);
      }
      current = n;
    }

    function validateStep(n) {
      const step = document.querySelector(`.wizard-step[data-step="${n}"]`);
      if (!step) return true;
      let ok = true;
      const requiredElems = Array.from(step.querySelectorAll('[required]'));
      requiredElems.forEach(el => {
        if (el.type === 'checkbox') {
          if (!el.checked) {
            el.classList.add('is-invalid');
            ok = false;
          } else {
            el.classList.remove('is-invalid');
          }
          return;
        }
        if (!el.value || el.value.trim() === '') {
          el.classList.add('is-invalid');
          ok = false;
        } else {
          el.classList.remove('is-invalid');
        }
      });
      return ok;
    }

    // Next / Prev buttons
    document.querySelectorAll('[data-action="next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!validateStep(current)) return;
        if (current < total) showStep(current + 1);
      });
    });

    document.querySelectorAll('[data-action="prev"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current > 1) showStep(current - 1);
      });
    });

    // Build review summary
    function buildReview() {
      const selectedCourses = Array.from(document.querySelectorAll('.course-card.selected'))
        .map(c => c.querySelector('.fw-bold').textContent.trim());
      const summary = {
        Standort: `${document.getElementById('city').value || '-'} (${document.getElementById('zip').value || '-'})`,
        Name: `${document.getElementById('firstName').value || '-'} ${document.getElementById('lastName').value || '-'}`,
        EMail: document.getElementById('email').value || '-',
        Telefon: document.getElementById('phone').value || '-',
        Geburtsdatum: document.getElementById('dob').value || '-',
        Adresse: `${document.getElementById('street').value || '-'}, ${document.getElementById('addrCity').value || '-'}`,
        Kurse: selectedCourses.length ? selectedCourses.join(', ') : '-',
        Nutzername: document.getElementById('username').value || '-',
        Marketing: document.getElementById('marketingOptIn')?.checked ? 'Ja' : 'Nein'
      };
      const reviewSection = document.getElementById('reviewSection');
      reviewSection.innerHTML = '';
      Object.entries(summary).forEach(([k, v]) => {
        const row = document.createElement('div');
        row.className = 'd-flex justify-content-between align-items-start border-bottom py-2';
        row.innerHTML = `<div class="fw-bold">${k}</div><div class="text-end text-muted" style="max-width:60%">${v}</div>`;
        reviewSection.appendChild(row);
      });
    }

    // Show review on last step
    document.querySelectorAll('[data-action="next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current + 1 === total) buildReview();
      });
    });

    // Registration submit
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
        document.querySelectorAll('.course-card.selected').forEach(c => c.classList.remove('selected'));
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
