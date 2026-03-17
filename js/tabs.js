/* ──────────────────────────────────────────
   tabs.js  —  pixel tab switching
   To add a new tab:
     1. Add <button class="tab-btn" data-tab="myid"> in index.html
     2. Add <div class="tab-panel" id="myid"> in index.html
     No JS changes needed.
   ────────────────────────────────────────── */
(function () {
  'use strict';

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
    setTheme(initial.dataset.tab);
  }
})();
