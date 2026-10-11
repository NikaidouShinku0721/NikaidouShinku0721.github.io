/* Original logos and optional opening movies; the page is readable immediately. */
(function () {
  'use strict';
  if (window.CONFIG?.typed) window.CONFIG.typed.enable = false;
  const works = {
    sekai: {logo:'logo-sekai', scene:'scene-coast', sprite:'sprite-shinku', label:'五彩斑斓的世界', video:'いろとりどりのセカイHD ReGENERATION op.mp4'},
    hikari: {logo:'logo-hikari', scene:'scene-dorm-evening', sprite:'sprite-kyou', label:'五彩斑斓的曙光', video:'いろとりどりのヒカリ HD ReGENERATION op.mp4'},
    akaseka: {logo:'logo-akaseka', scene:'scene-coast-evening', sprite:'sprite-shinku', label:'映入红瞳的世界', video:'紅い瞳に映るセカイ HD ReGENERATION op.mp4'}
  };
  const asset = name => '/img/trilogy/' + name + '.webp';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function ready() {
    const brand = document.querySelector('.navbar-brand');
    if (brand) {
      brand.innerHTML = '<img class="original-brand" src="' + asset('logo-sekai') + '" alt="风津之滨 · 五彩斑斓的世界" width="1150" height="283">';
      brand.setAttribute('aria-label', '风津之滨 · 返回首页');
    }
    const navbar = document.getElementById('navbar');
    const chrome = () => navbar?.classList.toggle('archive-nav-scrolled', scrollY > 40);
    addEventListener('scroll', chrome, {passive:true}); chrome();
    const cover = document.querySelector('[data-home-cover]');
    if (!cover) return;
    const order = Object.keys(works), interval = 12000;
    let current = 'sekai', version = 0, timer = 0, deadline = 0;
    let remaining = interval, clockVersion = 0, userPaused = false, inView = true, movieOpen = false;
    const feedback = document.createElement('p');
    feedback.className = 'archive-feedback'; feedback.setAttribute('role', 'status'); feedback.hidden = true; cover.append(feedback);
    const choices = Array.from(cover.querySelectorAll('[data-home-work]'));
    const pause = cover.querySelector('[data-home-pause]');
    const progress = cover.querySelector('[data-home-progress]');
    const blocked = () => userPaused || !inView || document.hidden || movieOpen;
    function clock(reset = false) {
      const tick = ++clockVersion;
      if (timer) {
        remaining = Math.max(0, deadline - Date.now());
        clearTimeout(timer); timer = 0;
      }
      if (reset) {
        remaining = interval;
        if (progress) {
          progress.style.animation = 'none';
          void progress.offsetWidth;
          progress.style.animation = '';
        }
      }
      cover.dataset.homeCycle = blocked() ? 'paused' : 'playing';
      if (pause) {
        pause.setAttribute('aria-pressed', String(userPaused));
        pause.setAttribute('aria-label', userPaused ? '继续自动切换主题' : '暂停自动切换主题');
        pause.querySelector('span').textContent = userPaused ? '▶' : 'Ⅱ';
      }
      if (!blocked()) {
        deadline = Date.now() + remaining;
        timer = setTimeout(async () => {
          timer = 0;
          await switchWork(order[(order.indexOf(current) + 1) % order.length]);
          if (tick === clockVersion) clock(true);
        }, remaining);
      }
    }
    async function switchWork(key) {
      const work = works[key];
      if (!work) return false;
      const next = ++version;
      cover.classList.remove('is-switching');
      feedback.hidden = true;
      if (current === key) return true;
      const loaded = await Promise.all(['logo','scene','sprite'].map(field => {
        const img = new Image(); img.src = asset(work[field]);
        return img.decode().then(() => img.naturalWidth > 0).catch(() => false);
      }));
      if (version !== next) return false;
      if (loaded.some(ok => !ok)) {
        feedback.textContent = '这组原作画面暂时未能载入，请稍后重试。'; feedback.hidden = false;
        return false;
      }
      cover.classList.add('is-switching');
      await new Promise(resolve => setTimeout(resolve, reduced.matches ? 0 : 180));
      if (version !== next) return false;
      current = key;
      cover.dataset.homeWorkCurrent = key;
      cover.querySelector('[data-home-scene]').src = asset(work.scene);
      cover.querySelector('[data-home-scene]').alt = key === 'hikari' ? '原作中黄昏时的岚山庄' : key === 'akaseka' ? '原作中黄昏时的风津之滨海岸' : '原作中风津之滨的蓝色海岸';
      cover.querySelector('[data-home-logo]').src = asset(work.logo);
      cover.querySelector('[data-home-logo]').alt = work.label + '原作标题标志';
      cover.querySelector('[data-home-portrait]').src = asset(work.sprite);
      cover.querySelector('[data-home-portrait]').alt = (key === 'hikari' ? '敷島鏡' : '二階堂真紅') + '原作立绘';
      if (brand) {
        brand.querySelector('img').src = asset(work.logo);
        brand.querySelector('img').alt = '风津之滨 · ' + work.label;
      }
      choices.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.homeWork === key)));
      cover.classList.remove('is-switching');
      return true;
    }
    choices.forEach(button => button.addEventListener('click', async () => {
      // Manual selection gets a full reading interval before the next theme.
      const selection = ++clockVersion;
      if (timer) clearTimeout(timer); timer = 0;
      await switchWork(button.dataset.homeWork);
      if (selection === clockVersion) clock(true);
    }));
    pause?.addEventListener('click', () => { userPaused = !userPaused; clock(); });
    document.addEventListener('visibilitychange', () => clock());
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting; clock();
      }, {threshold: .2}).observe(cover);
    }
    clock(true);
    const opener = document.getElementById('home-opening-button');
    opener?.addEventListener('click', () => {
      if (document.querySelector('.opening-dialog[open]')) return;
      movieOpen = true; clock();
      const dialog = document.createElement('dialog');
      dialog.className = 'opening-dialog';
      dialog.setAttribute('aria-label', works[current].label + '开场影片');
      const toolbar = document.createElement('div'); toolbar.className = 'opening-toolbar';
      const title = document.createElement('p'); title.textContent = works[current].label + ' · OPENING';
      const fullscreen = document.createElement('button'); fullscreen.type = 'button';
      fullscreen.className = 'opening-fullscreen'; fullscreen.textContent = '全屏 ⛶';
      fullscreen.setAttribute('aria-label', '进入影片全屏');
      const skip = document.createElement('button'); skip.type = 'button';
      skip.textContent = 'SKIP ／ 跳过 →'; skip.className = 'opening-close';
      skip.setAttribute('aria-label', '跳过开场影片');
      const player = document.createElement('video');
      player.controls = true; player.playsInline = true; player.preload = 'none';
      player.src = '/video/' + works[current].video;
      const status = document.createElement('p'); status.className = 'opening-status';
      status.textContent = '正在载入开场…'; status.setAttribute('role', 'status');
      const retry = document.createElement('button'); retry.type = 'button';
      retry.className = 'opening-retry'; retry.textContent = '重新播放'; retry.hidden = true;
      toolbar.append(title, fullscreen, skip);
      dialog.append(player, toolbar, status, retry); document.body.append(dialog);
      let wasFullscreen = false;
      const finish = () => { player.pause(); if (dialog.open) dialog.close(); };
      const enterFullscreen = () => {
        if (dialog.requestFullscreen && !document.fullscreenElement) {
          dialog.requestFullscreen().catch(() => {});
        }
      };
      const fullscreenChanged = () => {
        if (document.fullscreenElement === dialog) {
          wasFullscreen = true; fullscreen.hidden = true;
        } else if (wasFullscreen && dialog.open) finish();
      };
      document.addEventListener('fullscreenchange', fullscreenChanged);
      skip.addEventListener('click', finish);
      fullscreen.addEventListener('click', enterFullscreen);
      player.addEventListener('ended', finish);
      player.addEventListener('playing', () => {status.hidden = true; retry.hidden = true;});
      player.addEventListener('waiting', () => {status.textContent = '正在缓冲…'; status.hidden = false;});
      player.addEventListener('error', () => {
        status.textContent = '开场影片暂时未能载入。可以重试，或跳过继续浏览。';
        status.hidden = false; retry.hidden = false;
      });
      const play = () => player.play().catch(() => {
        if (!dialog.open) return;
        status.textContent = '点击重新播放以开始影片，或跳过继续浏览。';
        status.hidden = false; retry.hidden = false;
      });
      retry.addEventListener('click', () => { player.load(); play(); });
      dialog.addEventListener('cancel', event => {event.preventDefault(); finish();});
      dialog.addEventListener('close', () => {
        player.pause();
        document.removeEventListener('fullscreenchange', fullscreenChanged);
        if (document.fullscreenElement === dialog) document.exitFullscreen().catch(() => {});
        player.removeAttribute('src'); player.load();
        dialog.remove(); movieOpen = false; clock(true); opener.focus({preventScroll:true});
      });
      dialog.showModal(); skip.focus();
      enterFullscreen(); play();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();

document.addEventListener('DOMContentLoaded', () => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || document.getElementById('shinku-cursor-container')) return;
    // Hide the system pointer only after the user's actual cursor image loads.
    const image = new Image(); image.src = '/img/Shinku猫猫鼠标光标.png';
    image.decode().then(() => {
        if (image.naturalWidth) document.body.classList.add('custom-cursor-available');
    }).catch(() => {});
    if (reduceMotion) return;

    // --- 1. 创建并挂载所有虚拟元素 ---
    const cursorContainer = document.createElement('div');
    cursorContainer.id = 'shinku-cursor-container';
    cursorContainer.hidden = true;
    cursorContainer.setAttribute('aria-hidden', 'true');
    const cursor = document.createElement('div');
    cursor.id = 'shinku-cursor';
    cursorContainer.appendChild(cursor);
    document.body.appendChild(cursorContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-star-canvas';
    canvas.setAttribute('aria-hidden', 'true');
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
        
        const parent = document.querySelector('dialog[open]') || document.body;
        if (cursorContainer.parentNode !== parent) { parent.append(cursorContainer, canvas); }
        const available = document.body.classList.contains('custom-cursor-available');
        cursorContainer.hidden = !available;
        document.body.classList.toggle('custom-cursor-enabled', available);
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
        (document.querySelector('dialog[open]') || document.body).appendChild(text);

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

    const hideCursor = () => {
        cursorContainer.hidden = true;
        document.body.classList.remove('custom-cursor-enabled');
        cursor.classList.remove('cursor-clicked');
    };
    document.addEventListener('mouseleave', hideCursor);
    window.addEventListener('blur', hideCursor);
    document.addEventListener('close', () => {
        document.body.append(cursorContainer, canvas); hideCursor();
    }, true);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            hideCursor();
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            particles = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
});
