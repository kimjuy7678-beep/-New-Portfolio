// ===== 모바일 메뉴 토글 =====
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('heroNav');

if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
}

// ===== 스크롤 시 섹션 페이드인 =====
const revealTargets = document.querySelectorAll(
    '.about__block, .project, .contact__inner'
);

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealTargets.forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

(function setupToolsMarquee() {
    const marquee = document.querySelector('.tools-marquee');
    const track = document.querySelector('.tools-marquee__track');
    const originalList = track ? track.querySelector('.tool-icons') : null;

    if (!marquee || !track || !originalList) return;

    function buildMarquee() {
        const containerWidth = marquee.offsetWidth;
        const oneSetWidth = originalList.scrollWidth;
        if (!containerWidth || !oneSetWidth) return;

        const repeatsPerHalf = Math.max(1, Math.ceil(containerWidth / oneSetWidth) + 1);

        track.innerHTML = '';
        for (let half = 0; half < 2; half++) {
            for (let i = 0; i < repeatsPerHalf; i++) {
                const clone = originalList.cloneNode(true);
                const isFirstVisibleCopy = half === 0 && i === 0;
                if (!isFirstVisibleCopy) {
                    clone.setAttribute('aria-hidden', 'true');
                    clone.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
                }
                track.appendChild(clone);
            }
        }

        const PIXELS_PER_SECOND = 40;
        const halfWidth = track.scrollWidth / 2;
        const duration = Math.max(8, halfWidth / PIXELS_PER_SECOND);
        track.style.animationDuration = `${duration}s`;
    }

    buildMarquee();
    window.addEventListener('load', buildMarquee);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildMarquee, 250);
    });
})();

// ===== 맨 위로 올라가기 버튼 =====
(function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const toggleVisibility = () => {
        if (window.scrollY > window.innerHeight * 0.6) {
            btn.classList.add('is-visible');
        } else {
            btn.classList.remove('is-visible');
        }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ===== 메일 보내기 — Gmail/네이버/다음 선택 드롭다운 =====
(function setupMailPicker() {
    const btn = document.getElementById('mailPickerBtn');
    const menu = document.getElementById('mailPickerMenu');
    if (!btn || !menu) return;

    const closeMenu = () => {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
    };

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.hidden ? openMenu() : closeMenu();
    });

    document.addEventListener('click', (e) => {
        if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) closeMenu();
    });
})();

// ===== 전화번호 클릭 — 번호 복사 + 알림 =====
(function setupPhoneLink() {
    const link = document.getElementById('phoneLink');
    if (!link) return;

    let toast;
    function showPhoneToast(message) {
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'phone-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(showPhoneToast._timer);
        showPhoneToast._timer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 1800);
    }

    link.addEventListener('click', (e) => {
        const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        if (!isMobile) {
            e.preventDefault();
        }

        const phone = link.dataset.phone || '';
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(phone)
                .then(() => showPhoneToast(`${phone} 복사되었습니다`))
                .catch(() => showPhoneToast(phone));
        } else {
            showPhoneToast(phone);
        }
    });
})();