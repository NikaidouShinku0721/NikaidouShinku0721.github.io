/* =========================================
   「櫻之丘」學園专属 
   方案A完全体：根图层视差视频底衬 ➔ 网页全交互 ➔ 纯日文真白芯台词系统
   =========================================
*/

// 强行拦截 Fluid 主题自带的原生 typed 配置，防止双重冲突
if (window.CONFIG) {
  if (window.CONFIG.typed) window.CONFIG.typed.enable = false;
  if (window.CONFIG.slogan) window.CONFIG.slogan.typed = false;
}

console.log("%c🌸 [櫻之丘學園] custom.js 绝对底层画布视频背景系统通网！", "color: #ff66b2; font-weight: bold; font-size: 14px;");

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
      // 🏠 如果在首页：台词初始隐藏
      subtitleEl.style.opacity = "0";

      // 👑 核心重构：将视频作为独立节点直接挂载到 body 根躯干上，化身真正的全景画布底层
      const videoContainer = document.createElement('div');
      videoContainer.id = 'custom-video-bg-container';
      videoContainer.innerHTML = `<video id="intro-player" src="${activeTheme.videoSrc}" playsinline></video>`;
      document.body.appendChild(videoContainer);

      // 🎬 创建最顶层的 Galgame 专属启动点击幕布
      const startOverlay = document.createElement('div');
      startOverlay.id = 'custom-start-overlay';
      startOverlay.innerHTML = `<div class="start-btn-text">「 點擊進入セカイ 」</div>`;
      document.body.appendChild(startOverlay);

      const player = document.getElementById('intro-player');

      // 📡 监听：点击进入
      startOverlay.addEventListener('click', function () {
        startOverlay.classList.add('start-curtain-fade');
        
        // 开启环境光透镜：让 body 染上视频激活类，强制上方原厂遮挡墙透明化
        document.body.classList.add('video-active');
        
        // 原声大碟震撼起航
        player.muted = false;
        player.volume = 1.0;
        player.play().catch(err => console.log("播放被拦截:", err));

        // 首页真·白芯极光台词破雾入场绽放
        subtitleEl.style.opacity = ""; 
        subtitleEl.className = activeTheme.class + " subtitle-reveal";

        setTimeout(() => startOverlay.remove(), 1000);
      });

      // 📡 监听：视频播放完毕瞬间
      player.addEventListener('ended', function () {
        // 视频在最底层执行水雾模糊溶解
        videoContainer.classList.add('video-bg-dissolve-out');
        
        // 过渡完毕后，彻底销毁视频节点并卸载透明类，原厂静态大图满状态复活
        setTimeout(() => {
          videoContainer.remove();
          document.body.classList.remove('video-active');
        }, 1500);
      });

    } else {
      // 🏷️ 如果在非首页页面：视频与幕布彻底锁死，台词直接显示
      subtitleEl.className = activeTheme.class;
    }
  }
});