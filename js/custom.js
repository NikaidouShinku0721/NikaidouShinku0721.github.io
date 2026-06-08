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
  console.log("%c🌸 [櫻之丘學園] custom.js 终极修复完全体驱动通网！", "color: #ff66b2; font-weight: bold; font-size: 14px;");

  function initBlogThemeSystem() {
    const navbarBrand = document.querySelector('.navbar-brand');
    const subtitleEl = document.getElementById("subtitle");
    if (!navbarBrand) return;

    // 🎯 1. 三套独立主题数据库（彻底修正所有错别字，重回100%纯正日文圣经台词）
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
        quote: "そして始まる、きみとぼく、のセカイ――",
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
              <span class="char-high color-gold">ど</span><span class="char-gold">り</span>
              <span class="char-tiny color-gold">の</span>
            </div>
            <div class="logo-main">ヒカリ</div>
            <div class="logo-sub">THE ETERNAL CHAPTER IN IROTORIDORI NO SEKAI</div>
            <div class="logo-sparkle"></div>
          </div>
        `
      }
    ];

    // 全站跨页随机抽取一套固定色系渲染 Logo
    const activeTheme = themes[Math.floor(Math.random() * themes.length)];
    navbarBrand.innerHTML = activeTheme.logoHtml;

    // 📡 首页精准锁判定
    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/index.html';

    if (isHome && subtitleEl) {
      // 🏠 场景一：只有在首页时，才接管并激活开场视频系统
      subtitleEl.textContent = activeTheme.quote;
      subtitleEl.style.opacity = "0"; // 👑 核心修复：视频播放期间台词保持绝对隐形，不挡视频！

      const bannerEl = document.querySelector('.banner') || document.getElementById('banner');
      if (bannerEl) {
        // 创建内嵌式视频背景容器
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

        // 点击进入
        startOverlay.addEventListener('click', function () {
          startOverlay.classList.add('start-curtain-fade');
          document.body.classList.add('video-active'); // 激活全透明环境光锁
          
          player.muted = false;
          player.volume = 1.0;
          player.play().catch(err => console.log("播放拦截:", err));

          setTimeout(() => startOverlay.remove(), 1000);
        });

        // 👑 核心修复：只有当视频完全播完的瞬间，台词才破雾入场绽放，绝不提前穿帮！
        player.addEventListener('ended', function () {
          videoContainer.classList.add('video-bg-dissolve-out');
          
          // 台词在此刻丝滑绽放
          subtitleEl.style.opacity = ""; 
          subtitleEl.className = activeTheme.class + " subtitle-reveal";

          setTimeout(() => {
            videoContainer.remove();
            document.body.classList.remove('video-active'); // 卸载全透明环境锁
          }, 1500);
        });
      }
    } else {
      // 🏷️ 场景二：如果是非首页，绝对不触碰、不克隆、不修改 subtitle，完美保留原厂全部文字与日期！
      console.log("🌸 [櫻之丘學園] 当前处于非首页单页，触发安全隔离锁保护原生UI。");
    }
  }

  // PJAX 跨页物理蒸发雷达
  function destroyVideoSystem() {
    const videoBg = document.getElementById('custom-video-bg-container');
    if (videoBg) videoBg.remove();
    const startOverlay = document.getElementById('custom-start-overlay');
    if (startOverlay) startOverlay.remove();
    document.body.classList.remove('video-active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogThemeSystem);
  } else {
    initBlogThemeSystem();
  }

  window.addEventListener('pjax:send', destroyVideoSystem);
  window.addEventListener('pjax:complete', initBlogThemeSystem);
})();