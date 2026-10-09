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
    const originalSubtitleText = subtitleEl.textContent;

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
    document.body.dataset.siteTheme = activeTheme.class;
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
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const videoContainer = document.createElement('div');
        videoContainer.id = 'custom-video-bg-container';
        videoContainer.innerHTML = `<video id="intro-player" src="${activeTheme.videoSrc}" playsinline></video>`;
        bannerEl.insertBefore(videoContainer, bannerEl.firstChild);

        const player = document.getElementById('intro-player');
        const revealSubtitle = () => {
          subtitleEl.classList.remove("subtitle-reveal");
          void subtitleEl.offsetWidth;
          subtitleEl.style.opacity = "1";
          subtitleEl.classList.add("subtitle-reveal");
        };

        if (reduceMotion) {
          videoContainer.remove();
          revealSubtitle();
          return;
        }

        const startOverlay = document.createElement('div');
        startOverlay.id = 'custom-start-overlay';
        startOverlay.setAttribute('role', 'dialog');
        startOverlay.setAttribute('aria-modal', 'true');
        startOverlay.setAttribute('aria-label', '首页影片开场');
        startOverlay.innerHTML = `
          <div class="start-actions">
            <div class="start-btn-text">「 點擊進入セカイ 」</div>
            <button type="button" class="start-play-button">播放开场</button>
            <button type="button" class="start-skip-button">跳过开场，直接进入博客</button>
          </div>`;
        document.body.appendChild(startOverlay);

        const playButton = startOverlay.querySelector('.start-play-button');
        const skipButton = startOverlay.querySelector('.start-skip-button');
        const closeOverlay = () => {
          startOverlay.classList.add('start-curtain-fade');
          window.setTimeout(() => startOverlay.remove(), 800);
        };
        const skipIntro = () => {
          player.pause();
          videoContainer.remove();
          closeOverlay();
          revealSubtitle();
        };

        playButton.addEventListener('click', function () {
          closeOverlay();
          player.muted = false;
          player.volume = 1.0;
          player.play().catch(() => {
            videoContainer.remove();
            revealSubtitle();
          });
        });
        skipButton.addEventListener('click', skipIntro);
        startOverlay.addEventListener('keydown', event => {
          if (event.key === 'Escape') skipIntro();
          if (event.key === 'Tab') {
            const lastButton = event.shiftKey ? playButton : skipButton;
            const firstButton = event.shiftKey ? skipButton : playButton;
            if (document.activeElement === lastButton) {
              event.preventDefault();
              firstButton.focus();
            }
          }
        });
        playButton.focus();

        // 播完开始溶解，字体带特效破雾而出！
        player.addEventListener('ended', function () {
          videoContainer.classList.add('video-bg-dissolve-out');
          revealSubtitle();
          setTimeout(() => videoContainer.remove(), 1500);
        });
      }
    } else {
      // 保留主题为归档、标签和独立页面生成的标题，避免丢失页面上下文。
      subtitleEl.textContent = originalSubtitleText;

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

/* Editorial chapter navigation inspired by the site's world archive. */
(function () {
  let listenersReady = false;
  let revealObserver = null;

  function updateEditorialChrome() {
    const progress = document.getElementById('site-reading-progress');
    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    }

    const navbar = document.querySelector('.navbar, #navbar');
    if (navbar) navbar.classList.toggle('archive-nav-scrolled', window.scrollY > 24);
  }

  function setupEditorialLayout() {
    if (!document.getElementById('site-reading-progress')) {
      const progress = document.createElement('div');
      progress.id = 'site-reading-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
    }

    const banner = document.querySelector('.banner, #banner');
    if (banner && !banner.querySelector('.editorial-hero-meta')) {
      const meta = document.createElement('div');
      meta.className = 'editorial-hero-meta';
      meta.setAttribute('aria-hidden', 'true');
      meta.innerHTML = `
        <span class="editorial-hero-meta__top"><span>PERSONAL ARCHIVE</span><b>NO. 01</b></span>
        <span class="editorial-hero-meta__bottom"><b>MEMORY / FIELD NOTES</b><span>SCROLL TO EXPLORE <i>↓</i></span></span>`;
      banner.appendChild(meta);
    }

    const indexCard = document.querySelector('.index-card');
    if (indexCard && !indexCard.previousElementSibling?.classList.contains('editorial-archive-heading')) {
      const heading = document.createElement('header');
      heading.className = 'editorial-archive-heading editorial-reveal';
      heading.innerHTML = `
        <p class="editorial-archive-heading__eyebrow">01 <span>//</span> FIELD NOTES</p>
        <div><h2>记忆档案</h2><p>把灵感、日常与喜欢的故事，慢慢收进这里。</p></div>
        <span class="editorial-archive-heading__index">ARCHIVE<br>2026</span>`;
      indexCard.parentNode.insertBefore(heading, indexCard);
    }

    const entries = document.querySelectorAll('.index-info');
    entries.forEach((entry, index) => {
      entry.dataset.entryIndex = String(index + 1).padStart(2, '0');
      entry.classList.add('editorial-reveal');
    });

    if (revealObserver) revealObserver.disconnect();
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealObserver = new IntersectionObserver((items, observer) => {
        items.forEach(item => {
          if (item.isIntersecting) {
            item.target.classList.add('is-visible');
            observer.unobserve(item.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
      document.querySelectorAll('.editorial-reveal').forEach(element => revealObserver.observe(element));
    } else {
      document.querySelectorAll('.editorial-reveal').forEach(element => element.classList.add('is-visible'));
    }

    if (!listenersReady) {
      window.addEventListener('scroll', updateEditorialChrome, { passive: true });
      window.addEventListener('resize', updateEditorialChrome, { passive: true });
      window.addEventListener('pjax:complete', setupEditorialLayout);
      listenersReady = true;
    }
    updateEditorialChrome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEditorialLayout);
  } else {
    setupEditorialLayout();
  }
})();

/* ==========================================================
   「櫻之丘」學園专属 - 虚拟光标驱动与粒子物理引擎
   ==========================================================
*/
document.addEventListener('DOMContentLoaded', () => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return;

    document.body.classList.add('custom-cursor-enabled');

    // --- 1. 创建并挂载所有虚拟元素 ---
    const cursorContainer = document.createElement('div');
    cursorContainer.id = 'shinku-cursor-container';
    const cursor = document.createElement('div');
    cursor.id = 'shinku-cursor';
    cursorContainer.appendChild(cursor);
    document.body.appendChild(cursorContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-star-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        cursorContainer.remove();
        canvas.remove();
        document.body.classList.remove('custom-cursor-enabled');
        return;
    }

    // --- 2. 窗口自适应 ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- 3. 核心物理变量 ---
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    let animationFrame = 0;
    const maxParticles = 100;
    
    const words = ["セカイ", "ヒカリ", "魔法", "奇跡", "約束", "櫻之丘", "永遠"];

    // --- 4. 鼠标移动监听：光标跟随 & 撒下神圣星尘 ---
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorContainer.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

        // 随机生成高级粒子 (控制生成频率)
        if (Math.random() < 0.25) {
            // 随机决定粒子类型：40%十字星，30%魔法光圈，30%星尘
            const types = ['cross', 'cross', 'halo', 'halo', 'dust', 'dust'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            particles.push({
                type: type,
                x: mouseX, 
                y: mouseY,
                vx: (Math.random() - 0.5) * 1.5,
                vy: Math.random() * 1.5 + 0.2, // 缓慢下落
                life: 1,
                size: type === 'halo' ? Math.random() * 6 + 4 : Math.random() * 5 + 2,
                color: Math.random() > 0.6 ? '#ff66b2' : '#ffffff', // 晶莹粉与纯白交替
                rotation: Math.random() * Math.PI * 2, // 随机初始角度
                rotSpeed: (Math.random() - 0.5) * 0.05 // 缓慢旋转
            });
            if (particles.length > maxParticles) particles.shift();
            if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(renderParticles);
        }
    });

    // --- 5. 鼠标点击：缩小特效 & 浮动文字 ---
    document.addEventListener('mousedown', (e) => {
        cursor.classList.add('cursor-clicked');

        const text = document.createElement('span');
        text.className = 'float-word-effect';
        text.innerText = words[Math.floor(Math.random() * words.length)];
        text.style.left = (e.clientX + 25) + 'px'; // 考虑到光标变大了，文字往右下躲一点
        text.style.top = (e.clientY + 25) + 'px';
        document.body.appendChild(text);

        setTimeout(() => text.remove(), 1200);
    });

    // --- 6. 鼠标松开：极限果冻回弹 ---
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor-clicked');
    });

    // --- 7. 高级粒子渲染循环 (图形学重绘) ---
    function renderParticles() {
        animationFrame = 0;
        if (document.hidden) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.015; // 渐隐速度
            p.rotation += p.rotSpeed; // 自转

            if (p.life <= 0) {
                particles[i] = particles[particles.length - 1];
                particles.pop();
                i--;
                continue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = 8; 
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;

            // 👑 渲染十字星辉 (Cross Star)
            if (p.type === 'cross') {
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.quadraticCurveTo(0, 0, p.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, p.size);
                ctx.quadraticCurveTo(0, 0, -p.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, -p.size);
                ctx.fill();
            } 
            // 👑 渲染魔法光圈 (Halo - 随时间变大并消散)
            else if (p.type === 'halo') {
                ctx.beginPath();
                // 光圈会随着生命值减少而向外扩散放大
                let currentRadius = p.size + (1 - p.life) * 15; 
                ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
                ctx.stroke();
            } 
            // 👑 渲染基础星尘 (Dust)
            else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
        if (particles.length) animationFrame = requestAnimationFrame(renderParticles);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            particles = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
});

