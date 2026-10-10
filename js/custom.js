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
    let current = 'sekai', version = 0;
    const feedback = document.createElement('p');
    feedback.className = 'archive-feedback'; feedback.setAttribute('role', 'status'); feedback.hidden = true; cover.append(feedback);
    const choices = Array.from(cover.querySelectorAll('[data-home-work]'));
    choices.forEach(button => button.addEventListener('click', async () => {
      const key = button.dataset.homeWork, work = works[key];
      if (!work) return;
      const next = ++version;
      cover.classList.remove('is-switching');
      feedback.hidden = true;
      if (current === key) return;
      const images = ['logo','scene','sprite'].map(field => {
        const img = new Image(); img.src = asset(work[field]);
        return img.decode().then(() => img.naturalWidth > 0).catch(() => false);
      });
      const loaded = await Promise.all(images);
      if (version !== next) return;
      if (loaded.some(ok => !ok)) {
        feedback.textContent = '这组原作画面暂时未能载入，请稍后重试。'; feedback.hidden = false;
        return;
      }
      cover.classList.add('is-switching');
      await new Promise(resolve => setTimeout(resolve, reduced.matches ? 0 : 180));
      if (version !== next) return;
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
      choices.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      cover.classList.remove('is-switching');
    }));
    const opener = document.getElementById('home-opening-button');
    opener?.addEventListener('click', () => {
      const dialog = document.createElement('dialog');
      dialog.className = 'opening-dialog';
      dialog.setAttribute('aria-label', works[current].label + '开场影片');
      const close = document.createElement('button');
      close.type = 'button'; close.textContent = '关闭开场 ×'; close.className = 'opening-close';
      const player = document.createElement('video');
      player.controls = true; player.playsInline = true; player.preload = 'none';
      player.src = '/video/' + works[current].video;
      dialog.append(close, player); document.body.append(dialog);
      const finish = () => { player.pause(); dialog.close(); };
      close.addEventListener('click', finish);
      player.addEventListener('ended', finish);
      dialog.addEventListener('click', event => { if (event.target === dialog) finish(); });
      dialog.addEventListener('close', () => { player.pause(); dialog.remove(); opener.focus(); });
      dialog.showModal(); close.focus(); player.play().catch(() => {});
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('world-home') || document.getElementById('irotoridori-archive')) return;
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

