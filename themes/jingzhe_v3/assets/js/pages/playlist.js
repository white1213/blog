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

  // 本站:页内搜索,输入即过滤(歌名+歌手+专辑);搜索态显示全部匹配,清空恢复折叠
  const searchInput = document.getElementById('playlist-search');
  const searchCount = document.getElementById('playlist-search-count');
  if (searchInput && searchCount) {
    const songCards = Array.from(document.querySelectorAll('.pl-card')).map(card => ({
      songs: Array.from(card.querySelectorAll('.pl-song')).map(li => ({
        li,
        text: [
          li.querySelector('.pl-title')?.textContent || '',
          li.querySelector('.pl-artist')?.textContent || '',
          li.querySelector('.pl-album')?.textContent || '',
        ].join(' ').trim().toLowerCase(),
      })),
      moreBtn: card.querySelector('.pl-more'),
    }));

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchCount.textContent = '';
        songCards.forEach(({ songs, moreBtn }) => {
          const expanded = moreBtn && moreBtn.dataset.expanded === 'true';
          songs.forEach(({ li }, i) => {
            li.classList.toggle('is-hidden', !expanded && i >= 15);
          });
          if (moreBtn) moreBtn.hidden = false;
        });
        return;
      }
      let hits = 0;
      songCards.forEach(({ songs, moreBtn }) => {
        songs.forEach(({ li, text }) => {
          const match = text.includes(query);
          li.classList.toggle('is-hidden', !match);
          if (match) hits += 1;
        });
        if (moreBtn) moreBtn.hidden = true;
      });
      searchCount.textContent = hits > 0 ? `找到 ${hits} 首` : '没有找到';
    });
  }
});
