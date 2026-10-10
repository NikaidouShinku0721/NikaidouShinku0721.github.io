(function () {
  'use strict';

  function setupPicturebooks() {
    document.querySelectorAll('[data-world-picturebook]').forEach(book => {
      if (book.dataset.pbReady === 'true') return;
      const chapters = Array.from(book.querySelectorAll('[data-pb-chapter]'));
      const tabs = Array.from(book.querySelectorAll('[data-pb-tab]'));
      const navigation = book.querySelector('[data-pb-navigation]');
      const tablist = book.querySelector('[data-pb-tabs]');
      const previous = book.querySelector('[data-pb-prev]');
      const next = book.querySelector('[data-pb-next]');
      const status = book.querySelector('[data-pb-status]');
      const stage = book.querySelector('.pb-stage');
      if (!chapters.length || chapters.length !== tabs.length || !navigation || !tablist || !previous || !next) return;

      book.dataset.pbReady = 'true';
      window.__worldPicturebookSequence = (window.__worldPicturebookSequence || 0) + 1;
      const prefix = 'world-picturebook-' + window.__worldPicturebookSequence;
      let current = 0;
      let requested = 0;
      let requestSequence = 0;
      const scenePromises = new Map();
      tablist.setAttribute('role', 'tablist');
      tablist.setAttribute('aria-label', '选择绘本章节');
      tablist.setAttribute('aria-orientation', 'horizontal');

      chapters.forEach((chapter, index) => {
        chapter.id = prefix + '-chapter-' + index;
        chapter.setAttribute('role', 'tabpanel');
        chapter.setAttribute('aria-labelledby', prefix + '-tab-' + index);
        chapter.tabIndex = 0;
        tabs[index].id = prefix + '-tab-' + index;
        tabs[index].setAttribute('role', 'tab');
        tabs[index].setAttribute('aria-controls', chapter.id);
      });

      function renderPage(index, focusTab) {
        current = index;
        chapters.forEach((chapter, chapterIndex) => {
          const selected = chapterIndex === current;
          chapter.classList.toggle('is-current', selected);
          chapter.hidden = !selected;
          chapter.querySelector('.pb-sheet').open = selected;
          tabs[chapterIndex].classList.toggle('is-current', selected);
          tabs[chapterIndex].setAttribute('aria-selected', String(selected));
          tabs[chapterIndex].tabIndex = selected ? 0 : -1;
        });
        previous.disabled = current === 0;
        next.disabled = current === chapters.length - 1;
        if (status) status.textContent = '第 ' + (current + 1) + ' 章，共 ' + chapters.length + ' 章 · ' + tabs[current].textContent.trim().replace(/^\d+\s*/, '');
        if (focusTab) tabs[current].focus({ preventScroll: true });
        // Keep the selected thumbnail inside its own strip without moving the page.
        const selectedTab = tabs[current];
        if (tablist.scrollWidth > tablist.clientWidth) {
          const stripRect = tablist.getBoundingClientRect();
          const tabRect = selectedTab.getBoundingClientRect();
          const offset = (tabRect.left + tabRect.width / 2) - (stripRect.left + stripRect.width / 2);
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          tablist.scrollTo({ left: tablist.scrollLeft + offset, behavior: reduced ? 'auto' : 'smooth' });
        }
      }

      function prepareScene(index) {
        if (scenePromises.has(index)) return scenePromises.get(index);
        const image = chapters[index].querySelector('.pb-scene-img');
        if (!image) return Promise.resolve(false);
        image.loading = 'eager';
        image.decoding = 'async';
        if (image.complete && image.naturalWidth === 0) {
          const source = image.getAttribute('src');
          if (source) {
            // Restart a failed request with the original URL and normal cache rules.
            image.removeAttribute('src');
            image.setAttribute('src', source);
          }
        }
        const ready = typeof image.decode === 'function'
          ? image.decode().then(() => image.naturalWidth > 0)
          : new Promise(resolve => {
              if (image.complete) { resolve(image.naturalWidth > 0); return; }
              image.addEventListener('load', () => resolve(true), { once: true });
              image.addEventListener('error', () => resolve(false), { once: true });
            });
        const promise = ready.catch(() => false).then(loaded => {
          if (!loaded) scenePromises.delete(index);
          return loaded;
        });
        scenePromises.set(index, promise);
        return promise;
      }

      async function changePage(index, focusTab) {
        if (index < 0 || index >= chapters.length) return;
        const sequence = ++requestSequence;
        requested = index;
        if (focusTab) tabs[index].focus({ preventScroll: true });
        book.setAttribute('aria-busy', 'true');
        if (status) status.textContent = '正在翻到第 ' + (index + 1) + ' 章…';
        const loaded = await prepareScene(index);
        // A slower earlier request must never overwrite a later selection.
        if (sequence !== requestSequence || !book.isConnected) return;
        book.setAttribute('aria-busy', 'false');
        if (!loaded) {
          requested = current;
          if (status) status.textContent = '该页场景尚未加载，暂时保留当前页。请稍后重试。';
          if (focusTab) tabs[current].focus({ preventScroll: true });
          return;
        }
        renderPage(index, focusTab);
        if (stage) {
          window.requestAnimationFrame(() => {
            if (sequence !== requestSequence || !book.isConnected) return;
            const bounds = stage.getBoundingClientRect();
            const offset = window.matchMedia('(max-width: 760px)').matches ? 68 : 76;
            const outsideViewport = bounds.bottom <= 0 || bounds.top >= window.innerHeight;
            if (bounds.top < offset || outsideViewport) {
              // Target the document only; scrolling hidden ancestors can displace the book.
              const targetTop = Math.max(0, window.scrollY + bounds.top - offset);
              window.scrollTo({
                top: targetTop,
                left: window.scrollX,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
              });
            }
          });
        }
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => changePage(index, false));
        tab.addEventListener('keydown', event => {
          let destination;
          if (event.key === 'ArrowRight') destination = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') destination = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') destination = 0;
          else if (event.key === 'End') destination = tabs.length - 1;
          else return;
          event.preventDefault();
          changePage(destination, true);
        });
      });
      previous.addEventListener('click', () => changePage(requested - 1, false));
      next.addEventListener('click', () => changePage(requested + 1, false));
      book.classList.add('is-enhanced');
      navigation.hidden = false;
      renderPage(0, false);
      chapters.forEach((_, index) => prepareScene(index));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupPicturebooks);
  else setupPicturebooks();
  window.addEventListener('pjax:complete', setupPicturebooks);
})();

