/* =========================================
   「櫻之丘」學園专属 
   终极修复版：透明镶嵌导航栏 ➔ 视音频文字完美同步绽放
   =========================================
*/

if (window.CONFIG) {
  if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
  if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
}

(function () {
  function initBlogThemeSystem() {
    const navbarBrand = document.querySelector('.navbar-brand');
    const subtitleEl = document.getElementById("subtitle");
    if (!navbarBrand) return;

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

    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/index.html';

    if (subtitleEl) {
      // 无论哪个页面，都给字加上对应主题的发光特效
      subtitleEl.className = activeTheme.class;

      if (isHome) {
        // 🏠 首页：视频与台词同步逻辑
        subtitleEl.textContent = activeTheme.quote;
        subtitleEl.style.opacity = "0"; // 初始隐藏台词

        const bannerEl = document.querySelector('.banner') || document.getElementById('banner');
        if (bannerEl) {
          // 插入无任何遮罩的纯净视频图层
          const videoContainer = document.createElement('div');
          videoContainer.id = 'custom-video-bg-container';
          videoContainer.innerHTML = `<video id="intro-player" src="${activeTheme.videoSrc}" playsinline></video>`;
          bannerEl.insertBefore(videoContainer, bannerEl.firstChild);

          // 启动幕布
          const startOverlay = document.createElement('div');
          startOverlay.id = 'custom-start-overlay';
          startOverlay.innerHTML = `<div class="start-btn-text">「 點擊進入セカイ 」</div>`;
          document.body.appendChild(startOverlay);

          const player = document.getElementById('intro-player');

          // 💥 关键交互：点击瞬间，视频播放，台词同步带着特效显现！
          startOverlay.addEventListener('click', function () {
            startOverlay.classList.add('start-curtain-fade');
            
            player.muted = false;
            player.volume = 1.0;
            player.play().catch(err => console.log("播放拦截:", err));

            // 字和视频一起出现
            subtitleEl.style.opacity = "1";
            subtitleEl.classList.add("subtitle-reveal");

            setTimeout(() => startOverlay.remove(), 800);
          });

          // 视频播完自然溶解
          player.addEventListener('ended', function () {
            videoContainer.classList.add('video-bg-dissolve-out');
            setTimeout(() => videoContainer.remove(), 1500);
          });
        }
      } else {
        // 🏷️ 非首页（如“归档”）：保留原字（如“归档”），且特效全开！
        subtitleEl.style.opacity = "1";
      }
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

  window.addEventListener('pjax:send', destroyVideoSystem);
  window.addEventListener('pjax:complete', initBlogThemeSystem);
})();