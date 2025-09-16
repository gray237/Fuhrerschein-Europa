document.addEventListener("DOMContentLoaded", function() {
    // Remove spinner
    window.addEventListener("load", function () {
    const spinner = document.getElementById("spinner");
    if (spinner) {
      spinner.classList.remove("show");
    }
  });

    // ---------------- Search Bar Suggestions ----------------
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");

    // Use window.POSTS
    const posts = window.POSTS || [];

    // Helper: Get first N words
    function getFirstWords(text, wordCount) {
        return text.split(/\s+/).slice(0, wordCount).join(" ");
    }

    if (searchForm && searchInput && searchSuggestions) {
        // Show suggestions while typing
        searchInput.addEventListener("input", function() {
            const query = this.value.trim().toLowerCase();
            if (!query) {
                searchSuggestions.style.display = "none";
                return;
            }

            const queryWords = query.split(/\s+/);
            const matches = posts.filter(post => {
                const text = (post.title + " " + post.excerpt + " " + post.content).toLowerCase();
                return queryWords.some(word => text.includes(word));
            }).slice(0, 5);

            if (matches.length === 0) {
                searchSuggestions.style.display = "none";
                return;
            }

            searchSuggestions.innerHTML = matches.map(post => `
                <li class="list-group-item list-group-item-action" 
                    style="cursor:pointer; border-radius:1rem;" 
                    data-id="${post.id}">
                    ${post.title}
                </li>
            `).join('');
            searchSuggestions.style.display = "block";
        });

        // Click on a suggestion
        searchSuggestions.addEventListener("click", function(e) {
            if (e.target && e.target.nodeName === "LI") {
                const postId = e.target.getAttribute("data-id");
                if (postId) {
                    window.location.href = `post.html?id=${postId}`;
                } else {
                    searchInput.value = e.target.textContent;
                    searchSuggestions.style.display = "none";
                    searchForm.submit();
                }
            }
        });

        // Hide dropdown when clicking outside
        document.addEventListener("click", function(e) {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = "none";
            }
        });

        // Submit form (Enter key or button click)
        searchForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `suchergebnisse.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // ---------------- Search Results Page ----------------
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q")?.toLowerCase() || "";
    const resultsContainer = document.getElementById("search-results");
    const queryText = document.getElementById("search-query-text");

    if (queryText) {
        queryText.textContent = query ? `Ergebnisse für "${query}"` : "Keine Abfrage angegeben.";
    }

    if (resultsContainer) {
        if (posts.length === 0) {
            resultsContainer.innerHTML = "<p class='text-center text-danger'>⚠️ Beitragsdaten nicht geladen.</p>";
            return;
        }

        if (query) {
            const queryWords = query.split(/\s+/);

            const matches = posts.filter(post => {
                const text = (post.title + " " + post.excerpt + " " + post.content).toLowerCase();
                return queryWords.some(word => text.includes(word));
            });

            if (matches.length > 0) {
                resultsContainer.innerHTML = matches.map(post => {
                    // Extract first 50 words of content for longer excerpt
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = post.content;
                    const contentText = tempDiv.textContent || tempDiv.innerText || "";
                    const longExcerpt = `${post.excerpt} ${getFirstWords(contentText, 50)}...`;

                    return `
                        <div class="col-12 mb-4">
                            <div class="card flex-row h-100 shadow-sm">
                                <img src="${post.image}" class="card-img-left img-fluid" alt="${post.title}" style="width:20%; object-fit:cover; border-top-left-radius:0.5rem; border-bottom-left-radius:0.5rem;">
                                <div class="card-body d-flex flex-column justify-content-center">
                                    <h5 class="card-title">${post.title}</h5>
                                    <p class="card-text">${longExcerpt}</p>
                                    <a href="post.html?id=${post.id}" class="btn btn-primary align-self-start">Mehr Lesen</a>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                resultsContainer.innerHTML = "<p class='text-center'>Keine Ergebnisse gefunden.</p>";
            }
        }
    }
});
