// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registrationForm"); // wizard form
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
    // Initialize tooltips (Tippy)
    tippy('[data-tippy-content]', { theme: 'light-border', delay: [80, 0] });

    // Wizard logic
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
      stepEl.classList.add('active');

      Object.keys(pills).forEach(k => {
        pills[k].classList.toggle('active', Number(k) === n);
      });

      const pct = Math.round(((n - 1) / (total - 1)) * 100);
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', pct);
      current = n;
    }

    // Next / Prev buttons
    document.querySelectorAll('[data-action="next"]').forEach(btn => btn.addEventListener('click', () => {
      if (!validateStep(current)) return;
      if (current < total) showStep(current + 1);
      if (current === total) showStep(total);
    }));

    document.querySelectorAll('[data-action="prev"]').forEach(btn => btn.addEventListener('click', () => {
      if (current > 1) showStep(current - 1);
    }));

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (confirm('Registrierung verwerfen?')) {
          window.location.href = 'index.html';
        }
      });
    }

    function validateStep(n) {
      const step = document.querySelector(`.wizard-step[data-step="${n}"]`);
      const requiredElems = Array.from(step.querySelectorAll('[required]'));
      let ok = true;
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

    // File preview
    const idUpload = document.getElementById('idUpload');
    const idPreviewWrap = document.getElementById('idPreviewWrap');
    const idPreview = document.getElementById('idPreview');
    if (idUpload) {
      idUpload.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (!f) {
          idPreviewWrap.style.display = 'none';
          return;
        }
        const url = URL.createObjectURL(f);
        if (f.type.startsWith('image/')) {
          idPreview.src = url;
          idPreview.style.display = 'block';
        } else {
          idPreview.style.display = 'none';
        }
        idPreviewWrap.style.display = 'block';
      });
    }

    // Flatpickr init
    flatpickr("#dob", { dateFormat: "d.m.Y", maxDate: new Date(), allowInput: true });

    // Course card selection
    document.querySelectorAll('.course-card').forEach(card => {
      const toggle = card.querySelector('.course-toggle');
      card.addEventListener('click', (ev) => {
        if (ev.target.classList.contains('form-check-input')) return;
        toggle.checked = !toggle.checked;
        card.classList.toggle('selected', toggle.checked);
      });
      toggle.addEventListener('change', () => {
        card.classList.toggle('selected', toggle.checked);
      });
    });

    // Password toggle & strength
    const password = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const passwordBar = document.getElementById('passwordBar');
    if (togglePassword && password) {
      togglePassword.addEventListener('click', () => {
        password.type = password.type === 'password' ? 'text' : 'password';
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
      });

      password.addEventListener('input', () => {
        const s = calcPasswordScore(password.value);
        const pct = Math.round((s / 5) * 100);
        passwordBar.style.width = pct + '%';
        passwordBar.style.background = s <= 1 ? '#dc3545' : s <= 3 ? '#ffc107' : '#198754';
      });
    }

    function calcPasswordScore(pw) {
      let score = 0;
      if (!pw) return 0;
      if (pw.length >= 8) score++;
      if (pw.length >= 12) score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      return score;
    }

    // Build review
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

    // Show review before last step
    document.querySelectorAll('[data-action="next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current + 1 === total) buildReview();
      });
    });

    // -----------------------
    // REGISTRATION SUBMIT (Netlify + Supabase)
    // -----------------------
    registerForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!validateStep(current)) return;

      const data = {
        name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        street: document.getElementById('street').value,
        city: document.getElementById('addrCity').value,
        state: document.getElementById('addrState').value,
        country: document.getElementById('addrCountry').value,
        courses: Array.from(document.querySelectorAll('.course-card.selected'))
          .map(c => c.dataset.value),
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
        if (passwordBar) passwordBar.style.width = '0%';
        showStep(1);

        // Switch to Login tab
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
  // HEADER AUTH (unchanged)
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
      if (logoutBtn) {
        logoutBtn.addEventListener("click", e => {
          e.preventDefault();
          localStorage.removeItem("loggedInUser");
          window.location.href = "login.html";
        });
      }

    } else {
      header.innerHTML = `
        <div class="d-inline-flex align-items-center" style="height: 45px;">
            <a href="login.html"><small class="me-3 text-light"><i class="fa fa-user me-2"></i> Register</small></a>
            <a href="login.html"><small class="me-3 text-light"><i class="fa fa-sign-in-alt me-2"></i> Login</small></a>
        </div>
      `;
    }
  }

  window.logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  };
});
