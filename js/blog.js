/* blog.js — load blog markdown files listed in blogs/index.json */
(function () {
  'use strict';

  const feed = document.getElementById('blog-feed');
  if (!feed) return;

  function toDateLabel(folderName) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(folderName || '');
    if (!m) return 'Unknown Date';
    return `${m[1]}-${m[2]}-${m[3]}`;
  }

  function parseMarkdown(md, fallbackTitle) {
    const titleMatch = md.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : fallbackTitle;

    const plain = md
      .replace(/^#.+$/gm, '')
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
      .replace(/[\*_`>#-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const excerpt = plain.length > 120 ? `${plain.slice(0, 117)}...` : plain;
    return { title, excerpt: excerpt || 'No summary yet.' };
  }

  function rowHtml(post, parsed) {
    const dateLabel = toDateLabel(post.folder);
    const viewHref = `blog.html?post=${encodeURIComponent(post.markdown)}`;
    return `
      <article class="blog-row">
        <div class="row-main">
          <h3>${parsed.title}</h3>
          <p>${parsed.excerpt}</p>
        </div>
        <div class="row-meta">
          <span class="row-date">${dateLabel}</span>
          <a class="row-open" href="${viewHref}">Read Post</a>
        </div>
      </article>
    `;
  }

  async function loadPosts() {
    try {
      const manifestRes = await fetch('blogs/index.json', { cache: 'no-store' });
      if (!manifestRes.ok) throw new Error('Failed to load blog manifest');
      const manifest = await manifestRes.json();
      const posts = Array.isArray(manifest.posts) ? manifest.posts : [];
      window.__blogPostCount = posts.length;

      if (!posts.length) {
        feed.innerHTML = `
          <article class="blog-row">
            <div class="row-main">
              <h3>No blog posts yet</h3>
              <p>Add a post folder under blogs/ and list it in blogs/index.json.</p>
            </div>
          </article>
        `;
        return;
      }

      const loaded = await Promise.all(posts.map(async (post) => {
        try {
          const res = await fetch(post.markdown, { cache: 'no-store' });
          if (!res.ok) throw new Error('missing markdown');
          const md = await res.text();
          const parsed = parseMarkdown(md, post.folder || 'Untitled Post');
          return rowHtml(post, parsed);
        } catch (_) {
          return rowHtml(post, {
            title: post.folder || 'Untitled Post',
            excerpt: 'Could not read markdown content for this post.'
          });
        }
      }));

      feed.innerHTML = loaded.join('');

      const hudPosts = document.getElementById('hud-value-2');
      if (hudPosts && document.body.classList.contains('theme-blog')) {
        hudPosts.textContent = `✏ ${posts.length}`;
      }
    } catch (err) {
      feed.innerHTML = `
        <article class="blog-row">
          <div class="row-main">
            <h3>Blog failed to load</h3>
            <p>${err.message}</p>
          </div>
        </article>
      `;
    }
  }

  loadPosts();
})();
