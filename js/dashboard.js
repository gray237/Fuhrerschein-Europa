document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // -----------------------
  // User Greeting
  // -----------------------
  document.getElementById("userName").textContent =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Student";

  // -----------------------
  // At-a-Glance Summary (static for now)
  // -----------------------
  const hoursLogged = user.hoursLogged || 0;
  const hoursRequired = user.hoursRequired || 50;
  document.getElementById("hoursLogged").textContent = hoursLogged;
  document.getElementById("hoursRequired").textContent = hoursRequired;
  const hoursPct = hoursRequired
    ? Math.round((hoursLogged / hoursRequired) * 100)
    : 0;
  document.getElementById("hoursProgress").style.width = hoursPct + "%";

  document.getElementById("permitStatus").textContent =
    user.permitStatus || "Aktiv";
  document.getElementById("permitIssued").textContent =
    user.permitIssued || "-";
  document.getElementById("permitExpires").textContent =
    user.permitExpires || "-";

  document.getElementById("roadTestDays").textContent = (() => {
    const testDate = new Date(user.roadTestDate || "2025-09-10");
    const daysLeft = Math.ceil(
      (testDate - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft >= 0 ? daysLeft : 0;
  })();

  document.getElementById("balance").textContent = user.balance || 0;
  document.getElementById("paymentStatus").textContent =
    user.paymentStatus || "Ausstehend";

  // -----------------------
  // Client Information
  // -----------------------
  document.getElementById("clientName").textContent =
    `${user.first_name || "-"} ${user.last_name || "-"}`;
  document.getElementById("clientEmail").textContent = user.email || "-";
  document.getElementById("clientPhone").textContent = user.phone || "-";
  document.getElementById("clientAddress").textContent = `${
    user.street || "-"
  }, ${user.city || "-"}, ${user.state || "-"}, ${user.country || "-"}`;
  document.getElementById("clientDOB").textContent = user.dob || "-";
  document.getElementById("clientCourses").textContent = user.courses?.length
    ? user.courses.join(", ")
    : "-";
  document.getElementById("clientMarketing").textContent = user.marketing
    ? "Ja"
    : "Nein";
  document.getElementById("clientLicense").textContent =
    user.licenseCategory || "-";
  document.getElementById("clientUsername").textContent =
    user.username || "-";

  // -----------------------
  // Populate Courses as Cards (Führerschein & Kurse)
  // -----------------------
  const coursesContainer = document.querySelector("#courses-container"); // Add this div in dashboard HTML
  if (coursesContainer && user.courses?.length) {
    coursesContainer.innerHTML = user.courses
      .map((course) => {
        const label = course === "B" ? "Auto" : course === "A" ? "Motorrad" : course;
        const typeClass = course === "B" ? "auto" : course === "A" ? "motorrad" : "";
        return `
          <div class="col-md-6 col-lg-4 mb-3">
            <div class="p-3 course-card h-100 rounded selected ${typeClass}" data-value="${course}" tabindex="0">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <span class="icon-b-sport-class-circle fa-2x text-primary"><i class="fas fa-car"></i></span>
                </div>
                <div>
                  <div class="fw-bold">${label}</div>
                  <div class="text-muted small">Klasse ${course}</div>
                </div>
                <div class="ms-auto form-check form-switch">
                  <input class="form-check-input course-toggle" type="checkbox" checked>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // -----------------------
  // Lessons (static / local)
  // -----------------------
  let lessons = user.lessons || [
    { type: "In-Car", date: "2025-08-25", status: "Confirmed" },
    { type: "Classroom", date: "2025-08-27", status: "Pending" }
  ];

  const lessonList = document.getElementById("lesson-list");
  const calendar = document.getElementById("calendar");

  function renderLessons() {
    lessonList.innerHTML = lessons
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(
        (l, i) => `
        <li class="list-group-item d-flex justify-content-between align-items-center" draggable="true" data-index="${i}">
          ${l.type} Lesson - ${l.date}
          <span class="badge ${
            l.status === "Confirmed"
              ? "bg-primary"
              : l.status === "Pending"
              ? "bg-warning"
              : "bg-danger"
          } rounded-pill">${l.status}</span>
        </li>
      `
      )
      .join("");

    highlightBookedCourses();
  }

  renderLessons();

  // Drag-and-drop
  let dragIndex = null;
  lessonList.addEventListener(
    "dragstart",
    (e) => (dragIndex = e.target.dataset.index)
  );
  lessonList.addEventListener("dragover", (e) => e.preventDefault());
  lessonList.addEventListener("drop", (e) => {
    const dropIndex = e.target.dataset.index;
    if (dropIndex === undefined) return;
    [lessons[dragIndex], lessons[dropIndex]] = [
      lessons[dropIndex],
      lessons[dragIndex]
    ];
    renderLessons();
    saveLessons();
  });

  // -----------------------
  // Calendar (Enhanced)
  // -----------------------
  function renderCalendar() {
    calendar.innerHTML = "";
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const lesson = lessons.find(l => l.date === dateStr);

      const slot = document.createElement("div");
      slot.className = "calendar-slot";

      if (lesson) {
        const typeClass = lesson.type === "In-Car" ? "in-car" : lesson.type === "Classroom" ? "classroom" : "";
        slot.classList.add("booked", typeClass);
        slot.innerHTML = `<small>${dateStr}</small><br><strong>${lesson.type}</strong>`;
      } else {
        slot.innerHTML = `<small>${dateStr}</small><br><small>Frei</small>`;
      }

      slot.addEventListener("click", () => {
        if (lesson) {
          alert(`${lesson.type} lesson already booked on ${dateStr}`);
        } else {
          const type = prompt("Enter lesson type (In-Car / Classroom):", "In-Car");
          if (!type) return;
          lessons.push({ type, date: dateStr, status: "Pending" });
          renderLessons();
          renderCalendar();
          saveLessons();
          alert("Lesson booked successfully!");
        }
      });

      calendar.appendChild(slot);
    }
  }

  renderCalendar();

  // -----------------------
  // Highlight course cards with booked lessons
  // -----------------------
  function highlightBookedCourses() {
    document.querySelectorAll(".course-card").forEach(card => {
      const courseValue = card.dataset.value;
      const booked = lessons.some(l => (l.type === "In-Car" && courseValue === "B") || 
                                       (l.type === "Classroom" && courseValue === "A"));
      if (booked) {
        card.classList.add("booked-lesson");
      } else {
        card.classList.remove("booked-lesson");
      }
    });
  }

  // -----------------------
  // Save lessons to localStorage
  // -----------------------
  function saveLessons() {
    user.lessons = lessons;
    localStorage.setItem("loggedInUser", JSON.stringify(user));
  }

  // -----------------------
  // Logout
  // -----------------------
  window.logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  };
});
