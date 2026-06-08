/* =========================================
   「櫻之丘」學園专属 
   终极逻辑版：视频纯净独占 ➔ 全站物理级防篡改锁 ➔ 强制动画重绘
   =========================================
*/

if (window.CONFIG) {
  if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
  if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
}

(function () {
  // 声明全局防篡改守卫
  let titleObserver = null;

  function initBlogThemeSystem() {
    const navbarBrand = document.querySelector('.navbar-brand');
    let subtitleEl = document.getElementById("subtitle");
    if (!navbarBrand || !subtitleEl) return;

    // 💥 杀手锏 1：暴力克隆节点，物理斩断 Fluid 原厂所有的绑定事件和残留引擎
    const newSubtitle = subtitleEl.cloneNode(false);
    subtitleEl.parentNode.replaceChild(newSubtitle, subtitleEl);
    subtitleEl = newSubtitle;

    // 🎯 三套独立主题数据库
    const themes = [
      {
        class: "glow-pink",
        quote: "私たちの幸せは、ずっとずっと続いていくんだって、信じてるよ――",
        videoSrc: "/video/紅い瞳に映るセカイ HD ReGENERATION op.mp4",
        logoHtml: `<div class="custom-logo-container theme-pink"><div class="logo-prefix"><span class="char-high">紅</span><span class="char-low">い</span><span class="char-high">瞳</span><span class="char-low">に</span><span class="char-high">映</span><span class="char-low">る</span></div><div class="logo-main">セカイ</div><div class="logo-sub">WORLD'S END LOVE WILL LAST FOREVER</div><div class="logo-feather"></div></div>`
      },
      {
        class: "glow-blue",
        quote: "そして始まる、きみとぼく、のセカイ――",
        videoSrc: "/video/いろとりどりのセカイHD ReGENERATION op.mp4",
        logoHtml: `<div class="custom-logo-container theme-blue"><div class="logo-prefix"><span class="char-high color-darkblue">い</span><span class="char-low color-darkblue">ろ</span><span class="char-high color-darkblue">と</span><span class="char-low color-darkblue">り</span><span class="char-high color-lightblue">ど</span><span class="char-low color-lightblue">り</span><span class="char-tiny color-lightblue">の</span></div><div class="logo-main">セカイ</div><div class="logo-sub">I WANT TO SPREAD MY WINGS AND FLY INTO THE SKY.</div><div class="logo-wing"></div></div>`
      },
      {
        class: "glow-orange",
        quote: "その想いはヒカリ、新しいセカイを開く 笑顔の魔法――",
        videoSrc: "/video/いろとりどりのヒカリ HD ReGENERATION op.mp4",
        logoHtml: `<div class="custom-logo-container theme-yellow"><div class="logo-prefix"><span class="char-high color-magenta">い</span><span class="char-low color-magenta">ろ</span><span class="char-high color-gold">と</span><span class="char-low color-gold">り</span><span class="char-high color-gold">ど</span><span class="char-low color-gold">り</span><span class="char-tiny color-gold">の</span></div><div class="logo-main">ヒカリ</div><div class="logo-sub">THE ETERNAL CHAPTER IN IROTORIDORI NO SEKAI</div><div class="logo-sparkle"></div></div>`
      }
    ];

    const activeTheme = themes[Math.floor(Math.random() * themes.length)];
    navbarBrand.innerHTML = activeTheme.logoHtml;

    // 💥 杀手锏 2：死锁监听器（绝对不让主题篡改我们的台词）
    function lockSubtitleText(el, text) {
      if (titleObserver) titleObserver.disconnect();
      el.innerHTML = text;
      titleObserver = new MutationObserver(() => {
        if (el.textContent !== text) {
          titleObserver.disconnect();
          el.innerHTML = text; // 强行扇回我们的神仙句子
          titleObserver.observe(el, { childList: true, characterData: true, subtree: true });
        }
      });
      titleObserver.observe(el, { childList: true, characterData: true, subtree: true });
    }

    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/index.html';

    // 绑定发光底座
    subtitleEl.className = activeTheme.class;

    if (isHome) {
      // 🏠 首页逻辑：视频纯净独占，播完才出字！
      lockSubtitleText(subtitleEl, activeTheme.quote);
      subtitleEl.style.opacity = "0"; // 绝对隐身

      const bannerEl = document.querySelector('.banner') || document.getElementById('banner');
      if (bannerEl) {
        const videoContainer = document.createElement('div');
        videoContainer.id = 'custom-video-bg-container';
        videoContainer.innerHTML = `<video id="intro-player" src="${activeTheme.videoSrc}" playsinline></video>`;
        bannerEl.insertBefore(videoContainer, bannerEl.firstChild);

        const startOverlay = document.createElement('div');
        startOverlay.id = 'custom-start-overlay';
        startOverlay.innerHTML = `<div class="start-btn-text">「 點擊進入セカイ 」</div>`;
        document.body.appendChild(startOverlay);

        const player = document.getElementById('intro-player');

        // 点击只放视频，绝不出字
        startOverlay.addEventListener('click', function () {
          startOverlay.classList.add('start-curtain-fade');
          player.muted = false;
          player.volume = 1.0;
          player.play().catch(err => console.log("播放拦截:", err));
          setTimeout(() => startOverlay.remove(), 800);
        });

        // 播完开始溶解，字体带特效破雾而出！
        player.addEventListener('ended', function () {
          videoContainer.classList.add('video-bg-dissolve-out');
          
          subtitleEl.classList.remove("subtitle-reveal");
          void subtitleEl.offsetWidth; // 触发核心重绘引擎
          subtitleEl.style.opacity = "1";
          subtitleEl.classList.add("subtitle-reveal"); // 加上发光入场动画

          setTimeout(() => videoContainer.remove(), 1500);
        });
      }
    } else {
      // 🏷️ 非首页逻辑（归档/标签/留言板等）
      lockSubtitleText(subtitleEl, activeTheme.quote); // 绝对死锁取代无聊的页面名

      // 切页时强制触发特效动画！绝不死气沉沉！
      subtitleEl.classList.remove("subtitle-reveal");
      subtitleEl.style.opacity = "0";
      void subtitleEl.offsetWidth; // 触发核心重绘引擎
      subtitleEl.style.opacity = "1";
      subtitleEl.classList.add("subtitle-reveal");
    }
  }

  function destroyVideoSystem() {
    const videoBg = document.getElementById('custom-video-bg-container');
    if (videoBg) videoBg.remove();
    const startOverlay = document.getElementById('custom-start-overlay');
    if (startOverlay) startOverlay.remove();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogThemeSystem);
  } else {
    initBlogThemeSystem();
  }

  // 监听 PJAX 切页事件
  window.addEventListener('pjax:send', destroyVideoSystem);
  window.addEventListener('pjax:complete', initBlogThemeSystem);
})();