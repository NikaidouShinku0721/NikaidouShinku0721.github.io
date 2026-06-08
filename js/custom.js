/* =========================================
   「櫻之丘」學園专属 
   方案A：Galgame正统开场幕布 ➔ HD原声视频 ➔ 霓虹白芯全句绽放联动系统
   =========================================
*/

// 强行拦截 Fluid 主题自带的原生 typed 配置，防止双重冲突
if (window.CONFIG) {
  if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
  if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
}

console.log("%c🌸 [櫻之丘學園] custom.js 方案A Galgame完全体系统已就位！", "color: #ff66b2; font-weight: bold; font-size: 14px;");

document.addEventListener("DOMContentLoaded", function () {
  if (window.CONFIG) {
    if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
    if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
  }

  const navbarBrand = document.querySelector('.navbar-brand');
  const oldSubtitleEl = document.getElementById("subtitle");
  if (!navbarBrand) return;

  // 🎯 1. 核心数据库：三套独立主题（完美对齐 HD ReGENERATION 视频原名）
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

  // 2. 随机抽取一套主题并渲染 Logo
  const activeTheme = themes[Math.floor(Math.random() * themes.length)];
  navbarBrand.innerHTML = activeTheme.logoHtml;

  // 3. 📡 首页精准锁业务调度
  const currentPath = window.location.pathname;
  const isHome = currentPath === '/' || currentPath === '/index.html';

  if (oldSubtitleEl) {
    const subtitleEl = oldSubtitleEl.cloneNode(false);
    oldSubtitleEl.parentNode.replaceChild(subtitleEl, oldSubtitleEl);
    subtitleEl.textContent = activeTheme.quote;

    if (isHome) {
      // 🏠 如果在首页：台词初始处于隐藏状态
      subtitleEl.style.opacity = "0";

      // 🎬 A款暗魔法①：动态注入全屏视频图层（不加 autoplay 和 muted，等待唤醒）
      const videoOverlay = document.createElement('div');
      videoOverlay.id = 'custom-video-overlay';
      videoOverlay.innerHTML = `<video id="intro-player" src="${activeTheme.videoSrc}" playsinline></video>`;
      document.body.appendChild(videoOverlay);

      // 🎬 A款暗魔法②：动态注入 Galgame 专属启动点击幕布
      const startOverlay = document.createElement('div');
      startOverlay.id = 'custom-start-overlay';
      startOverlay.innerHTML = `<div class="start-btn-text">「 點擊進入セカイ 」</div>`;
      document.body.appendChild(startOverlay);

      const player = document.getElementById('intro-player');

      // 📡 监听：一旦用户点击启动幕布，瞬间解禁声音并轰鸣起航
      startOverlay.addEventListener('click', function () {
        // 幕布丝滑淡出
        startOverlay.classList.add('start-curtain-fade');
        
        // 视频解禁声音并播放
        player.muted = false;
        player.volume = 1.0; // 音量全额拉满
        player.play().catch(err => console.log("播放被拦截:", err));

        // 动画播完后彻底移除幕布节点
        setTimeout(() => startOverlay.remove(), 1000);
      });

      // 📡 监听：视频播放完毕（ended）瞬间执行水雾溶解淡出
      player.addEventListener('ended', function () {
        videoOverlay.classList.add('video-dissolve-out');

        // 延迟 0.3秒，首页真白芯霓虹台词破雾绽放
        setTimeout(() => {
          subtitleEl.style.opacity = ""; 
          subtitleEl.className = activeTheme.class + " subtitle-reveal";
        }, 300);

        // 彻底移出视频图层，绝不占内存
        setTimeout(() => videoOverlay.remove(), 1500);
      });

    } else {
      // 🏷️ 如果在分类、标签页：不加载任何开场特效，台词直接显示
      subtitleEl.className = activeTheme.class;
    }
  }
});