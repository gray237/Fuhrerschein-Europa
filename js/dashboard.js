document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userName").textContent = user.name;

  // Initialize dashboard data
  let lessons = user.lessons || [
    { type: "In-Car", date: "2025-08-25", status: "Confirmed" },
    { type: "Classroom", date: "2025-08-27", status: "Pending" }
  ];

  const lessonList = document.getElementById("lesson-list");
  const calendar = document.getElementById("calendar");

  // Render upcoming lessons
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

  // Drag-and-drop reordering
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

  // Calendar rendering
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

  renderCalendar();

  function saveLessons() {
    user.lessons = lessons;
    localStorage.setItem("loggedInUser", JSON.stringify(user));
  }

  // Driving hours progress
  const hoursLogged = user.hoursLogged || 20;
  const hoursRequired = user.hoursRequired || 50;
  const hoursProgress = document.getElementById("hoursProgress");
  hoursProgress.style.width = `${(hoursLogged / hoursRequired) * 100}%`;
  document.getElementById("hoursLogged").textContent = hoursLogged;
  document.getElementById("hoursRequired").textContent = hoursRequired;

  // Payment info
  const balance = user.balance || 150;
  document.getElementById("balance").textContent = balance;

  // Road test countdown
  const testDate = new Date(user.roadTestDate || "2025-09-10");
  const daysLeft = Math.ceil((testDate - new Date()) / (1000 * 60 * 60 * 24));
  document.getElementById("roadTestDays").textContent = daysLeft;

  // Logout function
  window.logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  };
});
