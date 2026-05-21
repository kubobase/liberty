/* ============================================================
   Liberty | Interactions
   ============================================================ */

'use strict';

/* ── Loader ── */
(() => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    const done = () => loader.classList.add('done');
    if (document.readyState === 'complete') {
        setTimeout(done, 900);
    } else {
        window.addEventListener('load', () => setTimeout(done, 900));
    }
})();

/* ── Custom cursor ── */
(() => {
    const cursor   = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top  = my + 'px';
    });

    const tick = () => {
        fx += (mx - fx) * 0.13;
        fy += (my - fy) * 0.13;
        follower.style.left = fx + 'px';
        follower.style.top  = fy + 'px';
        requestAnimationFrame(tick);
    };
    tick();

    document.querySelectorAll('a, button, .service-item, input, select, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('expanded');
            follower.classList.add('expanded');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('expanded');
            follower.classList.remove('expanded');
        });
    });
})();

/* ── Header scroll ── */
(() => {
    const header = document.getElementById('header');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/* ── Mobile menu ── */
(() => {
    const toggle = document.getElementById('menuToggle');
    const menu   = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
})();

/* ── Smooth anchor scroll ── */
(() => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const offset = window.scrollY + target.getBoundingClientRect().top - 72;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        });
    });
})();

/* ── Reveal on scroll ── */
(() => {
    const els = document.querySelectorAll('.reveal-up');
    if (!els.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => io.observe(el));
})();

/* ── Hero parallax ── */
(() => {
    const title = document.querySelector('.hero-title');
    const desc  = document.querySelector('.hero-desc');
    if (!title) return;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (y > vh) return;
        const t = y / vh;
        title.style.transform = `translateY(${y * 0.12}px)`;
        title.style.opacity   = String(1 - t * 0.9);
        if (desc) {
            desc.style.transform = `translateY(${y * 0.07}px)`;
            desc.style.opacity   = String(1 - t * 1.2);
        }
    }, { passive: true });
})();

/* ── Hero constellation canvas ── */
(() => {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
        W = canvas.width  = canvas.parentElement.offsetWidth  || window.innerWidth;
        H = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    new ResizeObserver(resize).observe(canvas.parentElement);

    const GOLD  = { r: 201, g: 166, b: 107 };
    const STEEL = { r: 143, g: 160, b: 179 };
    const NAVY  = { r:  27, g:  45, b:  69 };
    const COLORS = [GOLD, GOLD, STEEL, STEEL, NAVY];

    const rand = (a, b) => a + Math.random() * (b - a);

    const makeParticles = () =>
        Array.from({ length: Math.min(80, Math.max(36, (W * H) / 9000)) }, () => {
            const c = COLORS[Math.floor(Math.random() * COLORS.length)];
            return {
                x: rand(0, W), y: rand(0, H),
                vx: rand(-0.22, 0.22),
                vy: rand(-0.22, 0.22),
                r: rand(0.8, 2.4),
                alpha: rand(0.2, 0.55),
                col: c,
                phase: rand(0, Math.PI * 2),
                freq:  rand(0.007, 0.018),
            };
        });

    let particles = makeParticles();
    window.addEventListener('resize', () => { particles = makeParticles(); });

    const focal = () => ({ x: W * 0.68, y: H * 0.42 });
    let mouse = { x: -9999, y: -9999 };
    canvas.parentElement.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    canvas.parentElement.addEventListener('mouseleave', () => { mouse = { x: -9999, y: -9999 }; });

    let t = 0;
    const draw = () => {
        requestAnimationFrame(draw);
        t++;
        ctx.clearRect(0, 0, W, H);

        const f = focal();
        const CONN  = Math.min(W, H) * 0.14;
        const FDIST = Math.min(W, H) * 0.26;
        const MDIST = 150;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10;
            if (p.y > H + 10) p.y = -10;
        });

        // particle–particle lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d > CONN) continue;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(201,166,107,${(1 - d / CONN) * 0.1})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        // focal lines
        particles.forEach(p => {
            const d = Math.hypot(p.x - f.x, p.y - f.y);
            if (d > FDIST) return;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(f.x, f.y);
            ctx.strokeStyle = `rgba(201,166,107,${(1 - d / FDIST) * 0.28})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        // mouse lines
        particles.forEach(p => {
            const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (d > MDIST) return;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(201,166,107,${(1 - d / MDIST) * 0.18})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
        });

        // particles
        particles.forEach(p => {
            const pulse = Math.sin(p.phase + t * p.freq) * 0.15 + 0.85;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.col.r},${p.col.g},${p.col.b},${p.alpha * pulse})`;
            ctx.fill();
        });

        // focal sparkle
        const fp = Math.sin(t * 0.018) * 0.2 + 0.8;
        const fa = Math.sin(t * 0.024) * 0.15 + 0.55;

        ctx.save();
        ctx.translate(f.x, f.y);

        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 44 * fp);
        grd.addColorStop(0, `rgba(201,166,107,${0.22 * fp})`);
        grd.addColorStop(0.5, `rgba(201,166,107,${0.07 * fp})`);
        grd.addColorStop(1, 'rgba(201,166,107,0)');
        ctx.beginPath();
        ctx.arc(0, 0, 44 * fp, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        const L = 16 * fp, S = 5 * fp;
        ctx.strokeStyle = `rgba(243,241,235,${fa})`;
        ctx.lineWidth = 0.9;
        [[0], [90]].forEach(([deg]) => {
            const r = deg * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(r) * L, -Math.sin(r) * L);
            ctx.lineTo( Math.cos(r) * L,  Math.sin(r) * L);
            ctx.stroke();
        });
        [[45], [135]].forEach(([deg]) => {
            const r = deg * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(r) * S, -Math.sin(r) * S);
            ctx.lineTo( Math.cos(r) * S,  Math.sin(r) * S);
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.arc(0, 0, 2 * fp, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,241,235,${fa})`;
        ctx.fill();
        ctx.restore();
    };
    draw();
})();

/* ── Concept canvas (拡散・集約 diagram) ── */
(() => {
    const canvas = document.getElementById('conceptCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
        const parent = canvas.parentElement;
        const size = parent.offsetWidth || 320;
        W = canvas.width  = size;
        H = canvas.height = size;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    new ResizeObserver(resize).observe(canvas.parentElement);

    const rand = (a, b) => a + Math.random() * (b - a);
    const nodes = Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * Math.PI * 2 + rand(-0.2, 0.2);
        const dist  = rand(0.22, 0.44);
        return {
            bx: 0.5 + Math.cos(angle) * dist,
            by: 0.5 + Math.sin(angle) * dist,
            phase: rand(0, Math.PI * 2),
            freq:  rand(0.012, 0.024),
            r:     rand(1.2, 3),
            alpha: rand(0.3, 0.7),
        };
    });

    let t = 0;
    const draw = () => {
        requestAnimationFrame(draw);
        t++;
        ctx.clearRect(0, 0, W, H);

        const cx = W * 0.5, cy = H * 0.5;
        const scale = Math.min(W, H);

        // lines from nodes to center
        nodes.forEach(n => {
            const nx = n.bx * W + Math.sin(n.phase + t * n.freq * 0.5) * scale * 0.03;
            const ny = n.by * H + Math.cos(n.phase + t * n.freq * 0.5) * scale * 0.03;
            const d  = Math.hypot(nx - cx, ny - cy) / scale;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(cx, cy);
            ctx.strokeStyle = `rgba(201,166,107,${(0.55 - d) * 0.5})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        });

        // node-to-node short connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i], b = nodes[j];
                const ax = a.bx * W, ay = a.by * H;
                const bx = b.bx * W, by = b.by * H;
                const d  = Math.hypot(ax - bx, ay - by);
                if (d > scale * 0.2) continue;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.strokeStyle = `rgba(143,160,179,${(1 - d / (scale * 0.2)) * 0.12})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
            }
        }

        // nodes
        nodes.forEach(n => {
            const nx    = n.bx * W + Math.sin(n.phase + t * n.freq * 0.5) * scale * 0.03;
            const ny    = n.by * H + Math.cos(n.phase + t * n.freq * 0.5) * scale * 0.03;
            const pulse = Math.sin(n.phase + t * n.freq) * 0.2 + 0.8;
            ctx.beginPath();
            ctx.arc(nx, ny, n.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(143,160,179,${n.alpha * pulse})`;
            ctx.fill();
        });

        // center focal
        const fp = Math.sin(t * 0.02) * 0.18 + 0.82;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32 * fp);
        grd.addColorStop(0, `rgba(201,166,107,${0.3 * fp})`);
        grd.addColorStop(1, 'rgba(201,166,107,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, 32 * fp, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 3.5 * fp, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,212,168,${0.6 + fp * 0.3})`;
        ctx.fill();
    };
    draw();
})();

/* ── Contact form ── */
(() => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit');
        const txt = form.querySelector('.submit-text');
        const orig = txt.textContent;
        btn.disabled = true;
        txt.textContent = '送信中...';
        setTimeout(() => {
            txt.textContent = '送信しました ✓';
            form.reset();
            setTimeout(() => {
                txt.textContent = orig;
                btn.disabled = false;
            }, 3000);
        }, 1000);
    });
})();

/* ── Service constellation canvas ── */
(() => {
    const canvas = document.getElementById('serviceCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
        const p = canvas.parentElement;
        W = canvas.width  = p.offsetWidth  || 800;
        H = canvas.height = p.offsetHeight || 600;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    new ResizeObserver(resize).observe(canvas.parentElement);

    // Nodes loosely aligned to the 3×2 card grid (relative positions)
    const NODES = [
        { rx: 0.165, ry: 0.22 }, // SNS
        { rx: 0.500, ry: 0.14 }, // VIDEO
        { rx: 0.835, ry: 0.22 }, // WEB
        { rx: 0.165, ry: 0.80 }, // DESIGN
        { rx: 0.500, ry: 0.88 }, // AI
        { rx: 0.835, ry: 0.80 }, // OPS
    ];
    const EDGES = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[1,3],[2,4]];

    let activeIdx = -1;
    const hoverA = new Float32Array(6).fill(0.55);

    document.querySelectorAll('.svc-card').forEach((card, i) => {
        card.addEventListener('mouseenter', () => { activeIdx = i; });
        card.addEventListener('mouseleave', () => { activeIdx = -1; });
    });

    const rand = (a, b) => a + Math.random() * (b - a);
    const phases = Array.from({length: 6}, () => rand(0, Math.PI * 2));
    const freqs  = Array.from({length: 6}, () => rand(0.016, 0.034));

    // Background star field
    const bgStars = Array.from({length: 80}, () => ({
        x: rand(0,1), y: rand(0,1),
        r: rand(0.2, 0.9),
        a: rand(0.04, 0.18),
        ph: rand(0, Math.PI*2),
        fr: rand(0.006, 0.018),
    }));

    let t = 0;
    const draw = () => {
        requestAnimationFrame(draw);
        t++;
        ctx.clearRect(0, 0, W, H);

        // Smooth hover alpha
        for (let i = 0; i < 6; i++) {
            const target = activeIdx === -1 ? 0.55 : (i === activeIdx ? 1 : 0.2);
            hoverA[i] += (target - hoverA[i]) * 0.07;
        }

        // Background stars
        bgStars.forEach(s => {
            const p = Math.sin(s.ph + t * s.fr) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.r * p, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,166,107,${s.a * p})`;
            ctx.fill();
        });

        const nx = i => NODES[i].rx * W;
        const ny = i => NODES[i].ry * H;

        // Edges
        EDGES.forEach(([a, b]) => {
            const alpha = Math.min(hoverA[a], hoverA[b]) * 0.45;
            const g = ctx.createLinearGradient(nx(a), ny(a), nx(b), ny(b));
            g.addColorStop(0,   `rgba(201,166,107,${alpha * 0.5})`);
            g.addColorStop(0.5, `rgba(201,166,107,${alpha})`);
            g.addColorStop(1,   `rgba(201,166,107,${alpha * 0.5})`);
            ctx.beginPath();
            ctx.moveTo(nx(a), ny(a));
            ctx.lineTo(nx(b), ny(b));
            ctx.strokeStyle = g;
            ctx.lineWidth = 0.7;
            ctx.stroke();
        });

        // Nodes
        NODES.forEach((node, i) => {
            const x = nx(i), y = ny(i);
            const pulse = Math.sin(phases[i] + t * freqs[i]) * 0.22 + 0.78;
            const ha = hoverA[i];

            // Glow
            const grd = ctx.createRadialGradient(x, y, 0, x, y, 22 * pulse);
            grd.addColorStop(0, `rgba(201,166,107,${0.4 * ha * pulse})`);
            grd.addColorStop(1, 'rgba(201,166,107,0)');
            ctx.beginPath();
            ctx.arc(x, y, 22 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Outer ring
            ctx.beginPath();
            ctx.arc(x, y, 8 * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201,166,107,${0.28 * ha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();

            // Sparkle arms
            [[0,11,4],[90,11,4],[45,5,0],[135,5,0]].forEach(([deg, L, S]) => {
                const r = deg * Math.PI / 180;
                const len = (L + (S > 0 ? 0 : 0)) * pulse;
                const alpha = deg < 90 ? 0.5 * ha * pulse : 0.22 * ha * pulse;
                ctx.beginPath();
                ctx.moveTo(x - Math.cos(r)*len, y - Math.sin(r)*len);
                ctx.lineTo(x + Math.cos(r)*len, y + Math.sin(r)*len);
                ctx.strokeStyle = `rgba(201,166,107,${alpha})`;
                ctx.lineWidth = deg < 90 ? 0.8 : 0.5;
                ctx.stroke();
            });

            // Core dot
            ctx.beginPath();
            ctx.arc(x, y, 2.8 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232,212,168,${ha * pulse})`;
            ctx.fill();
        });
    };
    draw();
})();

/* ── Vision canvas ── */
(() => {
    const canvas = document.getElementById('visionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
        W = canvas.width  = canvas.parentElement.offsetWidth  || window.innerWidth;
        H = canvas.height = canvas.parentElement.offsetHeight || 500;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    new ResizeObserver(resize).observe(canvas.parentElement);

    const rand = (a, b) => a + Math.random() * (b - a);

    const rings = Array.from({ length: 5 }, (_, i) => ({
        r: (i + 1) * 80,
        alpha: 0.04 - i * 0.006,
        speed: 0.0003 * (i % 2 === 0 ? 1 : -1),
        dash: [8 + i * 4, 20 + i * 6],
        offset: rand(0, Math.PI * 2),
    }));

    const particles = Array.from({ length: 40 }, () => ({
        x: rand(0, 1), y: rand(0, 1),
        vx: rand(-0.08, 0.08), vy: rand(-0.08, 0.08),
        r: rand(0.6, 1.8),
        alpha: rand(0.1, 0.35),
        phase: rand(0, Math.PI * 2),
        freq: rand(0.01, 0.022),
    }));

    let t = 0;
    const draw = () => {
        requestAnimationFrame(draw);
        t++;
        ctx.clearRect(0, 0, W, H);
        const cx = W / 2, cy = H / 2;

        rings.forEach(ring => {
            ring.offset += ring.speed;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ring.offset);
            ctx.beginPath();
            ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201,166,107,${ring.alpha})`;
            ctx.setLineDash(ring.dash);
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.restore();
        });

        particles.forEach(p => {
            p.x += p.vx / W * 100;
            p.y += p.vy / H * 100;
            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;
            if (p.y < 0) p.y = 1;
            if (p.y > 1) p.y = 0;
            const pulse = Math.sin(p.phase + t * p.freq) * 0.2 + 0.8;
            ctx.beginPath();
            ctx.arc(p.x * W, p.y * H, p.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,166,107,${p.alpha * pulse})`;
            ctx.fill();
        });
    };
    draw();
})();

/* ── Sub-page in-page nav highlight ── */
(() => {
    const links = document.querySelectorAll('.subpage-nav-link');
    if (!links.length) return;

    const targets = Array.from(links).map(l => {
        const id = l.getAttribute('href');
        return id && id.startsWith('#') ? document.querySelector(id) : null;
    });

    const update = () => {
        const scrollY = window.scrollY + 160;
        let active = 0;
        targets.forEach((el, i) => {
            if (el && el.offsetTop <= scrollY) active = i;
        });
        links.forEach((l, i) => l.classList.toggle('active', i === active));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/* ── Sub-page hero canvas (shared across philosophy.html / message.html) ── */
(() => {
    const canvas = document.getElementById('subpageHeroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
        W = canvas.width  = canvas.parentElement.offsetWidth  || window.innerWidth;
        H = canvas.height = canvas.parentElement.offsetHeight || 500;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const rand = (a, b) => a + Math.random() * (b - a);
    const pts = Array.from({ length: 50 }, () => ({
        x: rand(0, 1), y: rand(0, 1),
        vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
        r: rand(0.5, 1.8),
        alpha: rand(0.1, 0.4),
        phase: rand(0, Math.PI * 2),
        freq: rand(0.008, 0.018),
    }));

    let t = 0;
    const draw = () => {
        requestAnimationFrame(draw);
        t++;
        ctx.clearRect(0, 0, W, H);

        const CONN = Math.min(W, H) * 0.18;
        pts.forEach(p => {
            p.x += p.vx / W * 80;
            p.y += p.vy / H * 80;
            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;
            if (p.y < 0) p.y = 1;
            if (p.y > 1) p.y = 0;
        });

        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const a = pts[i], b = pts[j];
                const d = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
                if (d > CONN) continue;
                ctx.beginPath();
                ctx.moveTo(a.x * W, a.y * H);
                ctx.lineTo(b.x * W, b.y * H);
                ctx.strokeStyle = `rgba(201,166,107,${(1 - d / CONN) * 0.08})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        pts.forEach(p => {
            const pulse = Math.sin(p.phase + t * p.freq) * 0.2 + 0.8;
            ctx.beginPath();
            ctx.arc(p.x * W, p.y * H, p.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,166,107,${p.alpha * pulse})`;
            ctx.fill();
        });
    };
    draw();
})();
