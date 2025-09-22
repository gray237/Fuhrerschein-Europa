document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // -----------------------
  // User Greeting
  // -----------------------
  document.getElementById("userName").textContent = user.name || "Student";

  // -----------------------
  // At-a-Glance Summary
  // -----------------------
  const hoursLogged = user.hoursLogged || 0;
  const hoursRequired = user.hoursRequired || 50;
  document.getElementById("hoursLogged").textContent = hoursLogged;
  document.getElementById("hoursRequired").textContent = hoursRequired;
  const hoursPct = hoursRequired ? Math.round((hoursLogged / hoursRequired) * 100) : 0;
  document.getElementById("hoursProgress").style.width = hoursPct + "%";

  document.getElementById("permitStatus").textContent = user.permitStatus || "Aktiv";
  document.getElementById("permitIssued").textContent = user.permitIssued || "-";
  document.getElementById("permitExpires").textContent = user.permitExpires || "-";

  document.getElementById("roadTestDays").textContent = (() => {
    const testDate = new Date(user.roadTestDate || "2025-09-10");
    const daysLeft = Math.ceil((testDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 ? daysLeft : 0;
  })();

  document.getElementById("balance").textContent = user.balance || 0;
  document.getElementById("paymentStatus").textContent = user.paymentStatus || "Ausstehend";

  // -----------------------
  // Client Information
  // -----------------------
  document.getElementById("clientName").textContent = user.name || "-";
  document.getElementById("clientEmail").textContent = user.email || "-";
  document.getElementById("clientPhone").textContent = user.phone || "-";
  document.getElementById("clientAddress").textContent = `${user.street || "-"}, ${user.addrCity || "-"}, ${user.addrState || "-"}, ${user.addrCountry || "-"}`;
  document.getElementById("clientDOB").textContent = user.dob || "-";
  document.getElementById("clientCourses").textContent = user.courses?.length ? user.courses.join(", ") : "-";
  document.getElementById("clientMarketing").textContent = user.marketing ? "Ja" : "Nein";
  document.getElementById("clientLicense").textContent = user.licenseCategory || "-";

  // -----------------------
  // Lessons
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
          <span class="badge ${l.status === 'Confirmed' ? 'bg-primary' : l.status === 'Pending' ? 'bg-warning' : 'bg-danger'} rounded-pill">${l.status}</span>
        </li>
      `
      )
      .join("");
  }

  renderLessons();

  // Drag-and-drop
  let dragIndex = null;
  lessonList.addEventListener("dragstart", e => dragIndex = e.target.dataset.index);
  lessonList.addEventListener("dragover", e => e.preventDefault());
  lessonList.addEventListener("drop", e => {
    const dropIndex = e.target.dataset.index;
    if (dropIndex === undefined) return;
    [lessons[dragIndex], lessons[dropIndex]] = [lessons[dropIndex], lessons[dragIndex]];
    renderLessons();
    saveLessons();
  });

  function renderCalendar() {
    calendar.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const slot = document.createElement("div");
      slot.className = "p-2 bg-light border rounded text-center flex-fill";
      slot.style.width = "120px";
      slot.textContent = date.toISOString().split("T")[0];
      slot.addEventListener("click", () => bookLesson(date));
      calendar.appendChild(slot);
    }
  }

  function bookLesson(date) {
    const type = prompt("Enter lesson type (In-Car / Classroom):", "In-Car");
    if (!type) return;
    lessons.push({ type, date: date.toISOString().split("T")[0], status: "Pending" });
    renderLessons();
    saveLessons();
    alert("Lesson booked successfully!");
  }

  function saveLessons() {
    user.lessons = lessons;
    localStorage.setItem("loggedInUser", JSON.stringify(user));
  }

  renderCalendar();

  // -----------------------
  // Logout
  // -----------------------
  window.logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  };
});
