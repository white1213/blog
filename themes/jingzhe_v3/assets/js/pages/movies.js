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
});
