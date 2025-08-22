/* Main.js — Clean, merged, and de-duplicated */
(() => {
    'use strict';

    // ============ Helpers ============
    const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const $ = (sel, root = document) => root.querySelector(sel);

    // ============ Typewriter (with data-duration) ============
    function applyTypewriterWithDuration(selector = '.typewriter-text') {
        $all(selector).forEach(el => {
            const fullText = el.textContent.trim();
            const totalChars = fullText.length || 1;
            const totalDuration = parseInt(el.dataset.duration, 10) || 2000;
            const step = Math.max(1, Math.floor(totalDuration / totalChars));
            el.textContent = '';
            let i = 0;
            (function typeChar() {
                el.textContent = fullText.slice(0, ++i);
                if (i < totalChars) setTimeout(typeChar, step);
            })();
        });
    }

    // ============ ScrollReveal (guarded if library exists) ============
    function initScrollReveal() {
        if (!window.ScrollReveal) return;
        const sr = ScrollReveal({
            distance: '50px',
            duration: 600,
            easing: 'ease-out',
            origin: 'bottom',
            viewFactor: 0.2
        });
        sr.reveal('.hero', {});
        sr.reveal('.about, .skills, .projects, .contact, .education, .testimonials', { interval: 200 });
        sr.reveal('.project-card, .testimonial-card, .edu-card', { interval: 150 });
    }

    // ============ Smooth scroll for nav links ============
    function initSmoothScroll() {
        $all('.nav a').forEach(a => {
            a.addEventListener('click', e => {
                const targetSel = a.getAttribute('href');
                if (!targetSel || !targetSel.startsWith('#')) return;
                const target = document.querySelector(targetSel);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // ============ Back to Top Button ============
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.id = 'backToTop';
        btn.textContent = '↑';
        btn.style.cssText = `
      position: fixed; bottom: 20px; right: 20px;
      padding: 10px 14px; border-radius: 50%;
      border: none; background: linear-gradient(135deg, #6ea8ff, #9b8cff);
      color: #0b0b0d; font-size: 18px; cursor: pointer;
      display: none; z-index: 1000;
    `;
        document.body.appendChild(btn);
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        return btn; // نحتاجه في scroll handler
    }

    // ============ Fade-in on Scroll (IntersectionObserver) ============
    function initFadeIn() {
        const faders = $all('.fade-in');
        if (!('IntersectionObserver' in window) || faders.length === 0) return;
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.3 });
        faders.forEach(el => io.observe(el));
    }

    // ============ Ripple Effect (event delegation) ============
    function initRipple() {
        document.addEventListener('click', e => {
            const target = e.target.closest('button, .btn');
            if (!target) return;

            // remove old ripple if exists
            const old = target.querySelector('.ripple');
            if (old) old.remove();

            const circle = document.createElement('span');
            const rect = target.getBoundingClientRect();
            const diameter = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - diameter / 2;
            const y = e.clientY - rect.top - diameter / 2;

            Object.assign(circle.style, {
                position: 'absolute',
                width: `${diameter}px`,
                height: `${diameter}px`,
                left: `${x}px`,
                top: `${y}px`,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
                transform: 'scale(0)',
                pointerEvents: 'none',
                animation: 'ripple 0.6s linear'
            });
            circle.className = 'ripple';
            target.style.overflow = 'hidden';
            target.style.position ||= 'relative';
            target.appendChild(circle);

            // cleanup after animation
            circle.addEventListener('animationend', () => circle.remove());
        });
    }

    // ============ Counters (animate when visible) ============
    function initCounters() {
        const counters = $all('.counter');
        if (counters.length === 0) return;

        const animate = el => {
            const target = +el.getAttribute('data-target') || 0;
            const speed = 200; // smaller = faster
            let current = 0;
            const step = Math.max(1, Math.ceil(target / speed));

            const tick = () => {
                current += step;
                if (current < target) {
                    el.textContent = current;
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target;
                }
            };
            tick();
        };

        if (!('IntersectionObserver' in window)) {
            counters.forEach(animate);
            return;
        }

        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                animate(entry.target);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.4 });

        counters.forEach(el => io.observe(el));
    }

    // ============ Navbar / Active Link / Parallax — single scroll handler ============
    function initScrollUX(backToTopBtn) {
        const navbar = $('.nav');
        const heroImg = $('.hero-portrait img');
        const sections = $all('section');
        const navLinks = $all('.nav a');

        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY || window.pageYOffset;

                // Back to top visibility
                if (backToTopBtn) backToTopBtn.style.display = y > 400 ? 'block' : 'none';

                // Navbar scrolled class
                if (navbar) navbar.classList.toggle('scrolled', y > 80);

                // Active link
                let current = '';
                sections.forEach(sec => {
                    const top = sec.offsetTop - 120; // slight offset for sticky header
                    if (y >= top) current = sec.id || '';
                });
                navLinks.forEach(link => {
                    const href = link.getAttribute('href') || '';
                    link.classList.toggle('active', href === `#${current}`);
                });

                // Parallax hero image
                if (heroImg) {
                    const offset = y * 0.2;
                    heroImg.style.transform = `scale(1.2) translateY(${offset}px)`;
                }

                ticking = false;
            });
        }

        // Initial transform for hero (fixed zoom even at top)
        if (heroImg) heroImg.style.transform = 'scale(1.2) translateY(0px)';

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on load
    }

    // ============ Boot ============
    document.addEventListener('DOMContentLoaded', () => {
        // Effects
        initScrollReveal();
        initSmoothScroll();
        applyTypewriterWithDuration('.typewriter-text'); // respects data-duration
        initFadeIn();
        initRipple();
        initCounters();

        // Scroll-driven UX
        const backToTopBtn = initBackToTop();
        initScrollUX(backToTopBtn);
    });

    // ============ Minimal CSS needed for ripple (in case not in your CSS) ============
    // ملاحظة: يفضّل تحط الكود ده في style.css:
    // @keyframes ripple { to { transform: scale(4); opacity: 0; } }
})();
