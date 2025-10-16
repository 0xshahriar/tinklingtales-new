import { registerPage } from "../app.js";
import { blogPosts } from "../../data/blog-posts.js";
import { sanitizeHTML } from "../utils.js";
import { getIcon } from "../icons.js";

function formatDisplayDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(value));
  } catch (error) {
    console.warn("Failed to format date", error);
    return value;
  }
}

function renderPosts() {
  const container = document.querySelector("[data-blog-list]");
  if (!container) return;

  const posts = blogPosts.slice().sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  container.innerHTML = posts
    .map((post) => {
      const title = sanitizeHTML(post.title);
      const excerpt = sanitizeHTML(post.excerpt);
      const date = formatDisplayDate(post.publishedAt);
      const href = `blog.html#${post.slug}`;

      return `
        <article class="card blog-card">
          <a href="${href}" class="blog-card__image">
            <img src="${post.image}" alt="${title}" loading="lazy" data-fallback />
          </a>
          <div class="blog-card__content">
            <div class="blog-card__meta">
              <span class="icon icon--inline" aria-hidden="true">${getIcon("calendar")}</span>
              <span>${date}</span>
              <span aria-hidden="true">•</span>
              <span>${sanitizeHTML(post.readingTime)}</span>
            </div>
            <h2 class="blog-card__title"><a href="${href}">${title}</a></h2>
            <p class="blog-card__excerpt">${excerpt}</p>
            <a href="${href}" class="button-link">Read story</a>
          </div>
        </article>
      `;
    })
    .join("");
}

registerPage("blog", async () => {
  renderPosts();
});
