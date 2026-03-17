/* blog-view.js — render a markdown file in blog.html */
(function () {
  'use strict';

  const titleEl = document.getElementById('post-title');
  const metaEl = document.getElementById('post-meta');
  const contentEl = document.getElementById('post-content');

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizePath(path) {
    const parts = path.split('/');
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/');
  }

  function resolveAssetPath(url, mdPath) {
    if (/^(https?:|data:|#|\/)/i.test(url)) return url;
    const base = mdPath.slice(0, mdPath.lastIndexOf('/') + 1);
    return normalizePath(`${base}${url}`);
  }

  function inline(text, mdPath) {
    let out = escapeHtml(text);
    out = out.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, function (_, alt, src) {
      const safeSrc = resolveAssetPath(src.trim(), mdPath);
      return '<img src="' + safeSrc + '" alt="' + escapeHtml(alt) + '">';
    });
    out = out.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, function (_, label, href) {
      const safeHref = resolveAssetPath(href.trim(), mdPath);
      return '<a href="' + safeHref + '" target="_blank" rel="noopener">' + escapeHtml(label) + '</a>';
    });
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    return out;
  }

  function renderMarkdown(md, mdPath, pageTitle) {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let inCode = false;
    let inUl = false;
    let inOl = false;
    let skippedTopTitle = false;

    function closeLists() {
      if (inUl) { html.push('</ul>'); inUl = false; }
      if (inOl) { html.push('</ol>'); inOl = false; }
    }

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        closeLists();
        if (!inCode) {
          html.push('<pre><code>');
          inCode = true;
        } else {
          html.push('</code></pre>');
          inCode = false;
        }
        continue;
      }

      if (inCode) {
        html.push(escapeHtml(line) + '\n');
        continue;
      }

      if (!line.trim()) {
        closeLists();
        continue;
      }

      const heading = /^(#{1,6})\s+(.+)$/.exec(line);
      if (heading) {
        closeLists();
        const level = heading[1].length;
        const headingText = heading[2].trim();
        if (!skippedTopTitle && level === 1 && headingText.toLowerCase() === (pageTitle || '').toLowerCase()) {
          skippedTopTitle = true;
          continue;
        }
        html.push('<h' + level + '>' + inline(heading[2], mdPath) + '</h' + level + '>');
        continue;
      }

      const quote = /^>\s+(.+)$/.exec(line);
      if (quote) {
        closeLists();
        html.push('<blockquote>' + inline(quote[1], mdPath) + '</blockquote>');
        continue;
      }

      const ul = /^[-*]\s+(.+)$/.exec(line);
      if (ul) {
        if (inOl) { html.push('</ol>'); inOl = false; }
        if (!inUl) { html.push('<ul>'); inUl = true; }
        html.push('<li>' + inline(ul[1], mdPath) + '</li>');
        continue;
      }

      const ol = /^\d+\.\s+(.+)$/.exec(line);
      if (ol) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        if (!inOl) { html.push('<ol>'); inOl = true; }
        html.push('<li>' + inline(ol[1], mdPath) + '</li>');
        continue;
      }

      closeLists();
      const imageLinkOnly = /^\[([^\]]+)\]\(([^\)]+\.(?:png|jpg|jpeg|gif|webp|svg))\)$/i.exec(line.trim());
      if (imageLinkOnly) {
        const alt = imageLinkOnly[1].trim();
        const src = resolveAssetPath(imageLinkOnly[2].trim(), mdPath);
        html.push('<figure><img src="' + src + '" alt="' + escapeHtml(alt) + '"><figcaption>' + escapeHtml(alt) + '</figcaption></figure>');
        continue;
      }

      html.push('<p>' + inline(line, mdPath) + '</p>');
    }

    if (inCode) html.push('</code></pre>');
    closeLists();
    return html.join('');
  }

  function getPostPath() {
    const params = new URLSearchParams(window.location.search);
    const post = params.get('post') || '';
    return decodeURIComponent(post);
  }

  async function load() {
    const postPath = getPostPath();
    if (!postPath || !postPath.startsWith('blogs/') || !postPath.endsWith('.md')) {
      titleEl.textContent = 'Invalid post path';
      metaEl.textContent = 'Expected path like blogs/yyyy-mm-dd-x/file.md';
      contentEl.innerHTML = '<p>Open a post from the Blog tab in index.html.</p>';
      return;
    }

    try {
      const res = await fetch(postPath, { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not load markdown');
      const md = await res.text();

      const h1 = md.match(/^#\s+(.+)$/m);
      const title = h1 ? h1[1].trim() : postPath.split('/').pop().replace(/\.md$/i, '');
      titleEl.textContent = title;
      const dateMatch = /blogs\/(\d{4}-\d{2}-\d{2})/.exec(postPath);
      metaEl.textContent = dateMatch ? `Posted on ${dateMatch[1]} · Island Dev Log` : 'Island Dev Log';
      document.title = title + ' | Island Dev Log';
      contentEl.innerHTML = renderMarkdown(md, postPath, title);
    } catch (err) {
      titleEl.textContent = 'Failed to load post';
      metaEl.textContent = postPath;
      contentEl.innerHTML = '<p>' + escapeHtml(err.message) + '</p>';
    }
  }

  load();
})();
