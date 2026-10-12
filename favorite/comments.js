/* The public Waline service and /message/ identity are retained from the original site. */
(() => {
  'use strict';
  const shell = document.getElementById('world-guestbook');
  if (!shell) return;
  const mount = shell.querySelector('[data-waline]');
  const status = document.getElementById('guestbook-load-status');
  const retry = document.getElementById('guestbook-retry');
  const serverURL = shell.dataset.serverUrl;
  const commentPath = shell.dataset.commentPath || '/message/';
  const localFiles = shell.dataset.clientJs && shell.dataset.clientCss
    ? { js: shell.dataset.clientJs, css: shell.dataset.clientCss } : null;
  const sources = [localFiles, {
    js: 'https://lib.baomitu.com/waline/3.6.0/waline.js',
    css: 'https://lib.baomitu.com/waline/3.6.0/waline.css'
  }, {
    js: 'https://cdn.jsdelivr.net/npm/@waline/client@3.6.0/dist/waline.js',
    css: 'https://cdn.jsdelivr.net/npm/@waline/client@3.6.0/dist/waline.css'
  }].filter(Boolean);
  let busy = false;
  let instance = null;
  let attempt = 0;
  let probeController = null;

  function feedback(state, message) {
    shell.dataset.commentState = state;
    status.textContent = message;
    retry.hidden = state !== 'error';
    mount.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
  }
  function withTimeout(promise, milliseconds) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Resource timeout')), milliseconds);
    })]).finally(() => clearTimeout(timer));
  }
  function loadStyle(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      const timer = setTimeout(() => finish(false), 9000);
      let settled = false;
      function finish(ok) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        link.onload = null;
        link.onerror = null;
        if (ok) resolve(link);
        else { link.remove(); reject(new Error('Stylesheet unavailable')); }
      }
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => finish(true);
      link.onerror = () => finish(false);
      document.head.append(link);
    });
  }
  async function loadClient() {
    for (const source of sources) {
      const files = await Promise.allSettled([
          withTimeout(import(source.js), 9000),
          loadStyle(source.css)
      ]);
      if (files[0].status === 'fulfilled' && files[1].status === 'fulfilled'
          && typeof files[0].value.init === 'function') {
        return files[0].value.init;
      }
      if (files[1].status === 'fulfilled') files[1].value.remove();
    }
    throw new Error('Comment client unavailable');
  }
  async function checkReadConnection() {
    probeController?.abort();
    const controller = new AbortController();
    probeController = controller;
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const endpoint = new URL(serverURL.replace(/\/$/, '') + '/api/comment');
      endpoint.searchParams.set('type', 'count');
      endpoint.searchParams.set('url', commentPath);
      const response = await fetch(endpoint.href, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error('Comment service unavailable');
      const payload = await response.json();
      if (typeof payload.errno === 'number' && payload.errno !== 0) throw new Error('Comment service rejected read');
    } finally {
      clearTimeout(timer);
      if (probeController === controller) probeController = null;
    }
  }
  async function openGuestbook() {
    if (busy) return;
    busy = true;
    const currentAttempt = ++attempt;
    feedback('loading', instance ? '正在重新读取留言，请保留你的草稿……' : '正在展开来访者的留言……');
    try {
      if (!instance) {
        const init = await loadClient();
        if (currentAttempt !== attempt) return;
        instance = init({
          el: mount,
          serverURL,
          path: commentPath,
          meta: ['nick', 'mail', 'link'],
          requiredMeta: ['nick'],
          lang: 'zh-CN',
          emoji: ['https://cdn.jsdelivr.net/gh/walinejs/emojis/weibo'],
          dark: false,
          wordLimit: 0,
          pageSize: 10,
          pageview: false,
          comment: false,
          locale: { placeholder: '写下作品的记忆、网站的建议，或一句来访的问候……' }
        });
      }
      await checkReadConnection();
      if (currentAttempt !== attempt) return;
      feedback('ready', '留言与旧留言板相连。愿下次再会，仍是晴天。');
    } catch (_) {
      if (currentAttempt !== attempt) return;
      feedback('error', instance
        ? '暂时无法读取留言。你的编辑框会保留，请稍后重新展开。'
        : '留言暂时没能展开，请检查网络后重试。');
    } finally {
      if (currentAttempt === attempt) busy = false;
    }
  }
  retry.addEventListener('click', openGuestbook);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      openGuestbook();
    }, { rootMargin: '240px 0px' });
    observer.observe(shell);
  } else openGuestbook();
})();
