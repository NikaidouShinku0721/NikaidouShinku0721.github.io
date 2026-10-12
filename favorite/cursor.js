document.addEventListener('DOMContentLoaded', () => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || document.getElementById('shinku-cursor-container')) return;
    // Hide the system pointer only after the user's actual cursor image loads.
    // The cursor has one source of truth: its embedded CSS data URI.
    const cursorCss = getComputedStyle(document.documentElement)
        .getPropertyValue('--shinku-cursor-image').trim();
    const cursorSource = /^url\((["']?)(data:image\/png;base64,[A-Za-z0-9+/=]+)\1\)$/.exec(cursorCss);
    if (!cursorSource) return;
    const image = new Image(); image.src = cursorSource[2];
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

/* BEGIN shinku-resource-guards: frontend deterrent, not access control. */
(function () {
  'use strict';
  if (window.__shinkuResourceGuardsInstalled) return;
  window.__shinkuResourceGuardsInstalled = true;

  document.addEventListener('contextmenu', event => {
    event.preventDefault();
  }, {capture: true, passive: false});

  // Prevent dragging artwork while retaining ordinary text and link dragging.
  document.addEventListener('dragstart', event => {
    if (event.target instanceof Element && event.target.closest('img, picture')) {
      event.preventDefault();
    }
  }, {capture: true, passive: false});

  document.addEventListener('keydown', event => {
    if (event.key === 'F12' || event.code === 'F12') event.preventDefault();
  }, {capture: true, passive: false});
})();
/* END shinku-resource-guards */
