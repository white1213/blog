document.addEventListener("DOMContentLoaded", () => {
  'use strict';

  const FOLD_LIMIT = 15;

  const sections = Array.from(document.querySelectorAll('.pl-card'));
  const tabs = Array.from(document.querySelectorAll('.pl-tab'));
  const searchInput = document.getElementById('playlist-search');
  const searchCount = document.getElementById('playlist-search-count');

  if (sections.length === 0) return;

  // 每个歌单面板:可搜索文本 + 折叠按钮 + 匹配结果
  const panels = sections.map(section => {
    const moreBtn = section.querySelector('.pl-more');
    const songs = Array.from(section.querySelectorAll('.pl-song')).map(li => ({
      li,
      text: [
        li.querySelector('.pl-title')?.textContent || '',
        li.querySelector('.pl-artist')?.textContent || '',
        li.querySelector('.pl-album')?.textContent || '',
      ].join(' ').trim().toLowerCase(),
    }));
    return { section, moreBtn, songs, matches: [], matchCount: 0 };
  });

  const isExpanded = panel => panel.moreBtn?.dataset.expanded === 'true';

  let activeIndex = 0;
  let query = '';

  const computeMatches = () => {
    panels.forEach(panel => {
      let count = 0;
      panel.matches = panel.songs.map(({ text }) => {
        const hit = text.includes(query);
        if (hit) count += 1;
        return hit;
      });
      panel.matchCount = count;
    });
  };

  // 只渲染当前面板的可见性(其余面板整体隐藏)
  const renderPanel = panel => {
    panel.songs.forEach(({ li }, i) => {
      const hidden = query ? !panel.matches[i] : (!isExpanded(panel) && i >= FOLD_LIMIT);
      li.classList.toggle('is-hidden', hidden);
    });
    if (panel.moreBtn) {
      panel.moreBtn.hidden = Boolean(query);
      panel.moreBtn.textContent = isExpanded(panel)
        ? '收起'
        : `展开全部 ${panel.moreBtn.dataset.total} 首`;
    }
  };

  const render = () => {
    tabs.forEach((tab, i) => {
      const on = i === activeIndex;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      const countEl = tab.querySelector('.pl-tab-count');
      if (countEl) {
        // 搜索态显示各歌单匹配数,方便跨歌单发现;非搜索态恢复总曲目数
        countEl.textContent = query
          ? `${panels[i].matchCount} 匹配`
          : (countEl.dataset.total || '');
      }
    });

    panels.forEach((panel, i) => {
      panel.section.classList.toggle('is-hidden', i !== activeIndex);
    });

    const panel = panels[activeIndex];
    if (panel) renderPanel(panel);

    if (searchCount) {
      if (!query) {
        searchCount.textContent = '';
      } else {
        searchCount.textContent = panel && panel.matchCount > 0
          ? `当前歌单找到 ${panel.matchCount} 首`
          : '当前歌单没有找到';
      }
    }
  };

  const switchTo = index => {
    if (index === activeIndex || !panels[index]) return;
    activeIndex = index;
    render();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => switchTo(i));
    // 键盘左右/Home/End 切换,符合 tablist 习惯
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      switchTo(next);
      tabs[next].focus();
    });
  });

  // 展开/收起:只影响所属歌单,搜索态下按钮已隐藏
  panels.forEach(panel => {
    if (!panel.moreBtn) return;
    panel.moreBtn.addEventListener('click', () => {
      panel.moreBtn.dataset.expanded = isExpanded(panel) ? 'false' : 'true';
      renderPanel(panel);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      query = searchInput.value.trim().toLowerCase();
      if (query) computeMatches();
      render();
    });
  }

  render();
});
