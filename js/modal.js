/* ──────────────────────────────────────────
   modal.js  —  floating coin + donation modal
   ────────────────────────────────────────── */
(function () {
  'use strict';

  const modal    = document.getElementById('donation-modal');
  const coinBtn  = document.getElementById('coin-btn');
  const closeBtn = document.getElementById('modal-close');
  const copyBtn  = document.getElementById('copy-btn');
  const ethAddr  = document.getElementById('eth-addr').textContent.trim();

  function openModal()  { modal.classList.add('open');    }
  function closeModal() { modal.classList.remove('open'); }

  coinBtn.addEventListener('click',  openModal);
  closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Copy address to clipboard
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(ethAddr).then(() => {
      copyBtn.textContent = 'COPIED!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'COPY';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });
})();
