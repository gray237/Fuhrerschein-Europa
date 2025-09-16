// js/blog.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("blog-container");
  if (!container || !window.POSTS) return;

  const formatDate = (iso) => {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-US", { month: "short" });
    const yr = d.getFullYear();
    return `${day} ${mon} ${yr}`;
  };

  const compact = (n) =>
    n >= 1000
      ? (Math.round((n / 1000) * 10) / 10).toFixed(1).replace(/\.0$/, "") + "K"
      : String(n);

  // Sort newest first
  const posts = [...window.POSTS].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Detect page type (index.html or blog.html)
  const isIndex = window.location.pathname.includes("index.html");
  const isBlog = window.location.pathname.includes("blog.html");

  let postsPerPage = isIndex ? 3 : 6;
  let currentPage = 1;

  // If blog.html, check ?page= query
  if (isBlog) {
    const params = new URLSearchParams(window.location.search);
    currentPage = parseInt(params.get("page")) || 1;
  }

  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;
  const visiblePosts = posts.slice(start, end);

  const cards = visiblePosts
    .map(
      (p) => `
      <div class="col-lg-4 col-md-6">
        <div class="blog-item">
          <div class="blog-img">
            <div class="blog-img-inner">
              <img class="img-fluid w-100 rounded-top" src="${p.image}" alt="${p.title}">
              <div class="blog-icon">
                <a href="post.html?id=${p.id}" class="my-auto"><i class="fas fa-link fa-2x text-white"></i></a>
              </div>
            </div>
            <div class="blog-info d-flex align-items-center border border-start-0 border-end-0">
              <small class="flex-fill text-center border-end py-2">
                <i class="fa fa-calendar-alt text-primary me-2"></i>${formatDate(p.date)}
              </small>
              <a href="post.html?id=${p.id}" class="btn-hover flex-fill text-center text-white border-end py-2">
                <i class="fa fa-thumbs-up text-primary me-2"></i>${compact(p.likes)}
              </a>
              <a href="post.html?id=${p.id}" class="btn-hover flex-fill text-center text-white py-2">
                <i class="fa fa-comments text-primary me-2"></i>${compact(p.comments)}
              </a>
            </div>
          </div>
          <div class="blog-content border border-top-0 rounded-bottom p-4">
            <p class="mb-3">Posted By: ${p.author}</p>
            <a href="post.html?id=${p.id}" class="h4">${p.title}</a>
            <p class="my-3">${p.excerpt}</p>
            <a href="post.html?id=${p.id}" class="btn btn-primary rounded-pill py-2 px-4">Mehr Lesen</a>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  container.innerHTML = cards || `<p class="text-center">Noch keine Beiträge</p>`;

  // Add pagination if on blog.html
  if (isBlog) {
    const totalPages = Math.ceil(posts.length / postsPerPage);
    if (totalPages > 1) {
      const pagination = document.createElement("div");
      pagination.className = "pagination mt-4 d-flex justify-content-center";

      let buttons = "";
      for (let i = 1; i <= totalPages; i++) {
        buttons += `
          <a href="blog.html?page=${i}" class="btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"} mx-1">
            ${i}
          </a>
        `;
      }

      pagination.innerHTML = buttons;
      container.parentNode.appendChild(pagination);
    }
  }
});
