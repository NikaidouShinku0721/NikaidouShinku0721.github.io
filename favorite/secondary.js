/* Ordinary reading pages keep Fluid search/color handling and the original cursor. */
(function () {
  'use strict';
  function ready() {
    if (!document.body.classList.contains('favorite-secondary')) return;
    const colorButton = document.getElementById('color-toggle-btn');
    if (colorButton) {
      const updateLabel = () => {
        const dark = document.documentElement.dataset.userColorScheme === 'dark';
        colorButton.setAttribute('aria-label', dark ? '切换到浅色阅读模式' : '切换到深色阅读模式');
      };
      updateLabel();
      new MutationObserver(updateLabel).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-user-color-scheme']
      });
    }
    // Keyboard focus stays visible inside the horizontal phone navigation.
    const navigation = document.querySelector('#favorite-site-header .site-nav');
    navigation?.addEventListener('focusin', event => {
      if (innerWidth > 640 || !event.target.matches('a')) return;
      const link = event.target;
      const left = link.offsetLeft;
      const right = left + link.offsetWidth;
      if (left < navigation.scrollLeft) navigation.scrollLeft = left;
      else if (right > navigation.scrollLeft + navigation.clientWidth) navigation.scrollLeft = right - navigation.clientWidth;
    });
    // Fluid's old scroll arrow reads #navbar height; that navbar was replaced.
    // Keep the useful arrow with the shared header's actual reading offset.
    const scrollArrow = document.querySelector('.scroll-down-bar');
    const board = document.getElementById('board');
    if (scrollArrow && board) {
      scrollArrow.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const offset = innerWidth <= 640 ? 106 : 76;
        scrollTo({
          top: Math.max(0, board.getBoundingClientRect().top + scrollY - offset),
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      }, true);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
