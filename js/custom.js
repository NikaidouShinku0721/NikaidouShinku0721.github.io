/* =========================================
   「櫻之丘」學園专属 
   方案A完全体：内嵌全屏动态视频背景 ➔ 网页全交互 ➔ 纯日文真白芯台词系统
   =========================================
*/

// 强行拦截 Fluid 主题自带的原生 typed 配置，防止双重冲突
if (window.CONFIG) {
  if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
  if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
}

console.log("%c🌸 [櫻之丘學園] custom.js 动态内嵌背景视频系统已完美通网！", "color: #ff66b2; font-weight: bold; font-size: 14px;");

document.addEventListener("DOMContentLoaded", function () {
  if (window.CONFIG) {
    if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
    if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
  }

  const navbarBrand = document.querySelector('.navbar-brand');
  const oldSubtitleEl = document.getElementById("subtitle");
  if (!navbarBrand) return;

  // 🎯 1. 核心数据库：100% 纯正原版日文台词，精准对齐你的 HD OP 视频原名
  const themes = [
    {
      class: "glow-pink",
      quote: "私たちの幸せは、ずっとずっと続いていくんだって、信じてるよ――",
      videoSrc: "/video/紅い瞳に映るセカイ HD ReGENERATION op.mp4",
      logoHtml: `
        <div class="custom-logo-container theme-pink">
          <div class="logo-prefix">
            <span class="char-high">編</span><span class="char-low">い</span>
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

  // 2. 随机抽取一套主题并渲染左上角 Logo
  const activeTheme = themes[Math.floor(Math.random() * themes.length)];
  navbarBrand.innerHTML = activeTheme.logoHtml;

  // 3. 📡 首页精准锁逻辑判定
  const currentPath = window.location.pathname;
  const isHome = currentPath === '/' || currentPath === '/index.html';

  if (oldSubtitleEl) {
    const subtitleEl = oldSubtitleEl.cloneNode(false);
    oldSubtitleEl.parentNode.replaceChild(subtitleEl, oldSubtitleEl);
    subtitleEl.textContent = activeTheme.quote;

    if (isHome) {
      // 🏠 如果在首页：台词初始隐藏，等待点击进入瞬间绽放
      subtitleEl.style.opacity = "0";

      // 🔍 核心黑魔法：寻找 Fluid 主题首页的大背景看板元素
      const bannerEl = document.querySelector('.banner') || document.getElementById('banner');
      
      if (bannerEl) {
        // 动态创建内嵌式视频背景容器
        const videoContainer = document.createElement('div');
        videoContainer.id = 'custom-video-bg-container';
        videoContainer.innerHTML = `<video id="intro-player" src="${activeTheme.videoSrc}" playsinline></video>`;
        
        // 💥 关键点：把视频作为第一子节点塞入 Banner 内部，直接化身真正的网页背景！
        bannerEl.insertBefore(videoContainer, bannerEl.firstChild);

        // 🎬 创建最顶层的 Galgame 专属启动点击幕布
        const startOverlay = document.createElement('div');
        startOverlay.id = 'custom-start-overlay';
        startOverlay.innerHTML = `<div class="start-btn-text">「 點擊進入セカイ 」</div>`;
        document.body.appendChild(startOverlay);

        const player = document.getElementById('intro-player');

        // 📡 监听：点击进入セカイ
        startOverlay.addEventListener('click', function () {
          startOverlay.classList.add('start-curtain-fade');
          
          // 原声大碟轰鸣起航
          player.muted = false;
          player.volume = 1.0;
          player.play().catch(err => console.log("播放被拦截:", err));

          // ✨ 满足交代：上面的导航栏和UI完全存在，白芯句子也在此刻同步破雾入场绽放！
          subtitleEl.style.opacity = ""; 
          subtitleEl.className = activeTheme.class + " subtitle-reveal";

          setTimeout(() => startOverlay.remove(), 1000);
        });

        // 📡 监听：视频播放完毕瞬间，执行内嵌溶解淡出，自然露出原本的静态背景图
        player.addEventListener('ended', function () {
          videoContainer.classList.add('video-bg-dissolve-out');
          setTimeout(() => videoContainer.remove(), 1500);
        });
      }

    } else {
      // 🏷️ 如果在分类、标签等非首页页面：视频与幕布彻底锁死，台词以对应的霓虹白芯直接常驻显示
      subtitleEl.className = activeTheme.class;
    }
  }
});