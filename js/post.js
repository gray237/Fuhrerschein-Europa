// js/post.js 
document.addEventListener("DOMContentLoaded", () => {
  const postContainer = document.getElementById("post-container");
  const relatedContainer = document.getElementById("related-posts");

  if (!window.POSTS || !postContainer) return;

  // Get ID from URL
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id) {
    postContainer.innerHTML = `<div class="alert alert-warning">No post ID provided.</div>`;
    return;
  }

  // Find post
  const post = window.POSTS.find((p) => p.id === id);

  if (!post) {
    postContainer.innerHTML = `<div class="alert alert-warning">Sorry, this post could not be found.</div>`;
    if (relatedContainer) relatedContainer.innerHTML = "";
    return;
  }

  // --- NEW: Update breadcrumb with post title ---
  const breadcrumbTitle = document.getElementById("post-title");
  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = post.title;
  }
  // --- END NEW ---

  // Format date
  const formatDateLong = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

 // Render main post 
postContainer.innerHTML = `
  <article class="post">
    <h1 class="mb-3">${post.title}</h1>
    <p class="text-muted mb-3">By ${post.author} • ${formatDateLong(post.date)}</p>
    <img src="${post.image}" alt="${post.title}" class="img-fluid rounded mb-4">
    <div class="post-content mb-4">${post.content}</div>

    <!-- Tags -->
    ${
      post.tags && post.tags.length
        ? `<div class="mb-4">
             <strong style="color:black;">Schlagwörter:</strong> 
             ${post.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join(" ")}
           </div>`
        : ""
    }

    <!-- Like Button -->
    <button id="like-btn" class="btn btn-primary mb-4">
      <i class="fa fa-thumbs-up me-2"></i> Like (<span id="like-count">${post.likes}</span>)
    </button>

    <!-- Comments Section -->
    <section id="comments-section">
      <h3>Comments (${post.comments?.length || 0})</h3>
      <div id="comments-list" class="mb-3">
        ${(post.comments || [])
          .map(
            (c) => `<div class="mb-2"><strong>${c.name}</strong> <small class="text-muted">${new Date(c.date).toLocaleDateString()}</small><p>${c.text}</p></div>`
          )
          .join("")}
      </div>
      <div class="mb-3">
        <input type="text" id="comment-name" class="form-control mb-2" placeholder="Your Name">
        <textarea id="comment-text" class="form-control mb-2" placeholder="Write a comment"></textarea>
        <button id="comment-submit" class="btn btn-secondary">Post Comment</button>
      </div>
    </section>
  </article>
`;


  // Like button functionality
  const likeBtn = document.getElementById("like-btn");
  const likeCount = document.getElementById("like-count");
  const storedLikes = localStorage.getItem(`post-${post.id}-likes`);
  if (storedLikes) likeCount.textContent = storedLikes;

  likeBtn.addEventListener("click", () => {
    post.likes = Number(likeCount.textContent) + 1;
    likeCount.textContent = post.likes;
    localStorage.setItem(`post-${post.id}-likes`, post.likes);
  });

  // Comment submission
  const commentSubmit = document.getElementById("comment-submit");
  const commentName = document.getElementById("comment-name");
  const commentText = document.getElementById("comment-text");
  const commentsList = document.getElementById("comments-list");

  // Load saved comments from localStorage
  const storedComments = localStorage.getItem(`post-${post.id}-comments`);
  if (storedComments) {
    post.comments = JSON.parse(storedComments);
    commentsList.innerHTML = post.comments
      .map(
        (c) => `<div class="mb-2"><strong>${c.name}</strong> <small class="text-muted">${new Date(c.date).toLocaleDateString()}</small><p>${c.text}</p></div>`
      )
      .join("");
  }

  commentSubmit.addEventListener("click", () => {
    const name = commentName.value.trim();
    const text = commentText.value.trim();
    if (!name || !text) return;

    const newComment = { name, date: new Date().toISOString(), text };
    post.comments = post.comments || [];
    post.comments.push(newComment);

    localStorage.setItem(`post-${post.id}-comments`, JSON.stringify(post.comments));

    commentsList.innerHTML += `<div class="mb-2"><strong>${name}</strong> <small class="text-muted">${new Date(newComment.date).toLocaleDateString()}</small><p>${text}</p></div>`;
    
    commentName.value = "";
    commentText.value = "";
  });

  // Render related posts
  if (relatedContainer) {
    const shareTag = (a, b) => a.tags?.some((t) => b.tags?.includes(t));

    const others = window.POSTS
      .filter((p) => p.id !== post.id)
      .sort((a, b) => {
        const aShared = shareTag(a, post) ? 1 : 0;
        const bShared = shareTag(b, post) ? 1 : 0;
        if (aShared !== bShared) return bShared - aShared;
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, 6);

    relatedContainer.innerHTML =
      others
        .map(
          (p) => `
          <div class="d-flex mb-3">
            <a href="post.html?id=${p.id}" class="me-3" style="flex:0 0 80px;">
              <img src="${p.image}" alt="${p.title}" class="img-fluid rounded" style="width:80px;height:80px;object-fit:cover;">
            </a>
            <div>
              <a href="post.html?id=${p.id}" class="h6 d-block mb-1">${p.title}</a>
              <small class="text-muted">${new Date(p.date).toDateString()}</small>
            </div>
          </div>
        `
        )
        .join("") || `<p class="text-muted">No related posts.</p>`;
  }
});
