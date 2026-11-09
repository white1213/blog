document.addEventListener("DOMContentLoaded", () => {
  'use strict';

  const INITIAL_VISIBLE = 16;
  const BATCH_SIZE = 32;
  const layout = document.querySelector('.ticket-layout');
  const btnLoadMore = document.getElementById('btn-load-more');
  const btnLoadMoreLabel = btnLoadMore?.querySelector('.movie-btn-more-label');
  const btnLoadMoreProgress = btnLoadMore?.querySelector('.movie-btn-more-progress');

  if (!layout) return;

  const allMovies = Array.from(layout.querySelectorAll('.review-card'));
  if (allMovies.length === 0) return;

  let currentIndex = Math.min(INITIAL_VISIBLE, allMovies.length);

  const updatePagination = () => {
    allMovies.forEach((movie, index) => {
      movie.classList.toggle('is-hidden', index >= currentIndex);
    });

    if (btnLoadMore) {
      const isComplete = currentIndex >= allMovies.length;

      btnLoadMore.hidden = false;
      btnLoadMore.disabled = isComplete;
      btnLoadMore.classList.toggle('is-complete', isComplete);

      if (btnLoadMoreLabel) {
        btnLoadMoreLabel.textContent = isComplete ? '票夹见底' : '再翻一叠';
      }

      if (btnLoadMoreProgress) {
        btnLoadMoreProgress.textContent = isComplete
          ? `共 ${allMovies.length} 张`
          : `${currentIndex} / ${allMovies.length}`;
      }

      btnLoadMore.setAttribute(
        'aria-label',
        isComplete
          ? `票夹见底，共 ${allMovies.length} 张`
          : `再翻一叠，已展开 ${currentIndex} 张，共 ${allMovies.length} 张`
      );
    }
  };

  updatePagination();

  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      currentIndex = Math.min(currentIndex + BATCH_SIZE, allMovies.length);
      updatePagination();
    });
  }

  // 本站:页内搜索,输入即过滤(片名+年份);搜索态隐藏翻页按钮,清空恢复
  const searchInput = document.getElementById('movie-search');
  const searchCount = document.getElementById('movie-search-count');
  if (searchInput && searchCount) {
    const searchable = allMovies.map(card => {
      const title = (card.querySelector('.rc-title')?.textContent || '').trim().toLowerCase();
      const year = (card.querySelector('.movie-year')?.textContent || '').trim();
      return { card, text: `${title} ${year}`.trim() };
    });

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchCount.textContent = '';
        if (btnLoadMore) btnLoadMore.hidden = false;
        updatePagination();
        return;
      }
      let hits = 0;
      searchable.forEach(({ card, text }) => {
        const match = text.includes(query);
        card.classList.toggle('is-hidden', !match);
        if (match) hits += 1;
      });
      if (btnLoadMore) btnLoadMore.hidden = true;
      searchCount.textContent = hits > 0 ? `找到 ${hits} 部` : '没有找到';
    });
  }
});
