/* ──────────────────────────────────────────
   tabs.js  —  pixel tab switching
   To add a new tab:
     1. Add <button class="tab-btn" data-tab="myid"> in index.html
     2. Add <div class="tab-panel" id="myid"> in index.html
     No JS changes needed.
   ────────────────────────────────────────── */
(function () {
  'use strict';

  function updateHud(id) {
    const l1 = document.getElementById('hud-label-1');
    const v1 = document.getElementById('hud-value-1');
    const l2 = document.getElementById('hud-label-2');
    const v2 = document.getElementById('hud-value-2');
    if (!l1 || !v1 || !l2 || !v2) return;

    if (id === 'books') {
      l1.textContent = 'WORLD';
      v1.textContent = '1-1';
      l2.textContent = 'READS';
      v2.textContent = '🪙 FREE';
      return;
    }

    if (id === 'blog') {
      const blogCount = Number(window.__blogPostCount || 0);
      l1.textContent = 'SEASON';
      v1.textContent = 'SPRING';
      l2.textContent = 'POSTS';
      v2.textContent = `✏ ${blogCount || 'SOON'}`;
      return;
    }

    if (id === 'repos') {
      l1.textContent = 'REGION';
      v1.textContent = 'MAP';
      l2.textContent = 'PINS';
      v2.textContent = '🧭 8';
    }
  }

  function setTheme(id) {
    const themes = ['theme-books', 'theme-blog', 'theme-repos'];
    document.body.classList.remove(...themes);
    document.body.classList.add(`theme-${id}`);
  }

  function showTab(id) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById(id);
    const btn   = document.querySelector(`.tab-btn[data-tab="${id}"]`);
    if (panel) panel.classList.add('active');
    if (btn)   btn.classList.add('active');
    setTheme(id);
    updateHud(id);
  }

  // Wire up all tab buttons via delegation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  // Expose globally in case other scripts need it
  window.showTab = showTab;

  // Sync theme with current active tab on load.
  const initial = document.querySelector('.tab-btn.active');
  if (initial && initial.dataset.tab) {
    const activeId = initial.dataset.tab;
    setTheme(activeId);
    updateHud(activeId);
  }
})();
