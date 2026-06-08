/* =========================================
   「櫻之丘」學園专属 
   方案A完全体：内嵌视差视频底衬 ➔ 全局UI高精交互 ➔ 纯日文真白芯台词系统（完美兼容PJAX）
   =========================================
*/

if (window.CONFIG) {
  if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
  if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
}

(function () {
  console.log("%c🌸 [櫻之丘學園] custom.js 核心驱动完全体已就位！", "color: #ff66b2; font-weight: bold; font-size: 14px;");

  function initBlogThemeSystem() {
    const navbarBrand = document.querySelector('.navbar-brand');
    const oldSubtitleEl = document.getElementById("subtitle");
    if (!navbarBrand) return;

    // 🎯 1. 三套独立主题数据库（100% 纯正原版日文台词，精准对齐你的 HD OP 视频原名）
    const themes = [
      {
        class: "glow-pink",
        quote: "私たちの幸せは、ずっとずっと続いていくんだって、信じてるよ――",
        videoSrc: "/video/紅い瞳に映るセカイ HD ReGENERATION op.mp4",
        logoHtml: `
          <div class="custom-logo-container theme-pink">
            <div class="logo-prefix">
              <span class="char-high">紅</span><span class="char-low">い</span>
              <span class="char-high">瞳</span><span class="char-low">に</span>
              <span class="char-high">映</span><span class="char-low">る</span>
            </div>
            <div class="logo-main">セカイ</div>
            <div class="logo-sub">WORLD'S END LOVE WILL LAST FOREVER</div>
            <div class="logo-feather"></div>
          </div>
        `
      },
      {
        class: "glow-blue",
        quote: "性と始まる、きみとぼく、のセカイ――",
        videoSrc: "/video/いろとりどりのセカイHD ReGENERATION op.mp4",
        logoHtml: `
          <div class="custom-logo-container theme-blue">
            <div class="logo-prefix">
              <span class="char-high color-darkblue">い</span><span class="char-low color-darkblue">ろ</span>
              <span class="char-high color-darkblue">と</span><span class="char-low color-darkblue">り</span>
              <span class="char-high color-lightblue">ど</span><span class="char-low color-lightblue">り</span>
              <span class="char-tiny color-lightblue">の</span>
            </div>
            <div class="logo-main">セカイ</div>
            <div class="logo-sub">I WANT TO SPREAD MY WINGS AND FLY INTO THE SKY.</div>
            <div class="logo-wing"></div>
          </div>
        `
      },
      {
        class: "glow-orange",
        quote: "その想いはヒカリ、新しいセカイを開く 笑顔の魔法――",
        videoSrc: "/video/いろとりどりのヒカリ HD ReGENERATION op.mp4",
        logoHtml: `
          <div class="custom-logo-container theme-yellow">
            <div class="logo-prefix">
              <span class="char-high color-magenta">い</span><span class="char-low color-magenta">ろ</span>
              <span class="char-high color-gold">と</span><span class="char-low color-gold">り</span>
              <span class="char-high color-gold">ど</span><span class="char-low color-gold">り</span>
              <span class="char-tiny color-gold">の</span>
            </div>
            <div class="logo-main">ヒカリ</div>
            <div class="logo-sub">THE ETERNAL CHAPTER IN IROTORIDORI NO SEKAI</div>
            <div class="logo-sparkle"></div>
          </div>
        `
      }
    ];

    // 随机抽取一套固定色系渲染 Logo
    const activeTheme = themes[Math.floor(Math.random() * themes.length)];
    navbarBrand.innerHTML = activeTheme.logoHtml;

    // 📡 首页精准锁判定
    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/index.html';

    if (oldSubtitleEl) {
      const originalText = oldSubtitleEl.innerText || oldSubtitleEl.textContent;
      const subtitleEl = oldSubtitleEl.cloneNode(false);
      oldSubtitleEl.parentNode.replaceChild(subtitleEl, oldSubtitleEl);

      if (isHome) {
        // 🏠 场景一：如果是首页，展现台词并触发动态内嵌视频背景
        subtitleEl.textContent = activeTheme.quote;
        subtitleEl.style.opacity = "0";

        const bannerEl = document.querySelector('.banner') || document.getElementById('banner');
        if (bannerEl) {
          // 创建内嵌式视频容器
          const videoContainer = document.createElement('div');
          videoContainer.id = 'custom-video-bg-container';
          videoContainer.innerHTML = `<video id="intro-player" src="${activeTheme.videoSrc}" playsinline></video>`;
          bannerEl.insertBefore(videoContainer, bannerEl.firstChild);

          // 全屏启动点击幕布
          const startOverlay = document.createElement('div');
          startOverlay.id = 'custom-start-overlay';
          startOverlay.innerHTML = `<div class="start-btn-text">「 點擊進入セカイ 」</div>`;
          document.body.appendChild(startOverlay);

          const player = document.getElementById('intro-player');

          startOverlay.addEventListener('click', function () {
            startOverlay.classList.add('start-curtain-fade');
            player.muted = false;
            player.volume = 1.0;
            player.play().catch(err => console.log("播放拦截:", err));

            // UI和台词第一秒同步顺畅显示，并追加白芯绽放动画
            subtitleEl.style.opacity = ""; 
            subtitleEl.className = activeTheme.class + " subtitle-reveal";

            setTimeout(() => startOverlay.remove(), 1000);
          });

          // 视频播完，内嵌在 Banner 底部溶解，自然显露原本的静态图
          player.addEventListener('ended', function () {
            videoContainer.classList.add('video-bg-dissolve-out');
            setTimeout(() => videoContainer.remove(), 1500);
          });
        }
      } else {
        // 🏷️ 场景二：如果是非首页（如留言板、文章页），保护原生文案，仅追加发光底座
        subtitleEl.textContent = originalText;
        subtitleEl.className = activeTheme.class;
        subtitleEl.style.opacity = "1";
      }
    }
  }

  // 🌀 核心安全锁：毁灭雷达（跨页时瞬间将所有残留节点物理蒸发，完美阻断UI穿帮）
  function destroyVideoSystem() {
    const videoBg = document.getElementById('custom-video-bg-container');
    if (videoBg) videoBg.remove();
    const startOverlay = document.getElementById('custom-start-overlay');
    if (startOverlay) startOverlay.remove();
  }

  // 绑定初始化与生命周期
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogThemeSystem);
  } else {
    initBlogThemeSystem();
  }

  // 完美对齐 Fluid 主题的 PJAX 局部刷新钩子
  window.addEventListener('pjax:send', destroyVideoSystem);
  window.addEventListener('pjax:complete', initBlogThemeSystem);
})();