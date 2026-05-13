// ============================
// liberty | Interactions
// ============================

// Custom cursor
(() => {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    const animate = () => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
        requestAnimationFrame(animate);
    };
    animate();

    const hoverables = document.querySelectorAll('a, button, .service-item, input, select, textarea');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
})();

// Header scroll behaviour
(() => {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => {
        if (window.scrollY > 40) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// Mobile menu
(() => {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => menu.classList.remove('open'));
    });
})();

// Reveal on scroll
(() => {
    const targets = document.querySelectorAll(
        '.section-head, .about-text, .about-stats, .service-item, .member, .philosophy-inner, .contact-info, .contact-form'
    );
    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => io.observe(el));
})();

// Counters
(() => {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const animateCount = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target).toString();
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toString();
        };
        requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => io.observe(c));
})();

// Smooth anchor scroll (offset for fixed header)
(() => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 60;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();

// Contact form (front-end only)
(() => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit span');
        const original = btn.textContent;
        btn.textContent = 'Sending...';
        setTimeout(() => {
            btn.textContent = 'Message Sent ✓';
            form.reset();
            setTimeout(() => { btn.textContent = original; }, 2400);
        }, 900);
    });
})();

// Parallax on hero title (subtle)
(() => {
    const title = document.querySelector('.hero-title');
    if (!title) return;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
            title.style.transform = `translateY(${y * 0.15}px)`;
            title.style.opacity = String(1 - y / (window.innerHeight * 0.9));
        }
    }, { passive: true });
})();
