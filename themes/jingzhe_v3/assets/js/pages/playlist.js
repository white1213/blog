document.addEventListener("DOMContentLoaded", () => {
  'use strict';

  document.querySelectorAll('.pl-more').forEach(button => {
    const card = button.closest('.pl-card');
    if (!card) return;
    const total = button.dataset.total || '';
    const hideBeyond = index => {
      card.querySelectorAll('.pl-song').forEach((song, i) => {
        song.classList.toggle('is-hidden', index !== null && i >= index);
      });
    };

    button.addEventListener('click', () => {
      const expanded = button.dataset.expanded === 'true';
      if (expanded) {
        hideBeyond(15);
        button.dataset.expanded = 'false';
        button.textContent = `展开全部 ${total} 首`;
      } else {
        hideBeyond(null);
        button.dataset.expanded = 'true';
        button.textContent = '收起';
      }
    });
  });
});
