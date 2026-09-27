(() => {
    'use strict';
    if (!document.body.classList.contains('turkluxx-homepage')) return;
    const enabled = window.matchMedia('(min-width: 1200px), (max-width: 767px)');
    const galleries = [...document.querySelectorAll('[data-project-gallery]')].map(container => {
        const slides = [...container.querySelectorAll('.turkluxx-project-image')];
        const controls = container.querySelector('.turkluxx-gallery-controls');
        const dots = [...controls.querySelectorAll('.turkluxx-gallery-dot')];
        let index = 0;
        let listeners;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => { slide.hidden = i !== index; });
            dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
        }

        return () => {
            listeners?.abort();
            controls.hidden = !enabled.matches;
            show(0);
            if (!enabled.matches) return;
            listeners = new AbortController();
            const options = { signal: listeners.signal };
            dots.forEach((dot, i) => dot.addEventListener('click', () => show(i), options));

            let gesture;
            container.addEventListener('pointerdown', event => {
                if (!event.isPrimary || event.pointerType === 'mouse' || event.target.closest('button')) {
                    gesture = null;
                    return;
                }
                gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
            }, options);
            container.addEventListener('pointermove', event => {
                if (!gesture || gesture.id !== event.pointerId) return;
                const dx = Math.abs(event.clientX - gesture.x);
                const dy = Math.abs(event.clientY - gesture.y);
                // Once the gesture becomes vertical, leave it entirely to page scrolling.
                if (dy > 10 && dy >= dx) gesture = null;
            }, options);
            container.addEventListener('pointerup', event => {
                if (!gesture || gesture.id !== event.pointerId) return;
                const dx = event.clientX - gesture.x;
                const dy = event.clientY - gesture.y;
                gesture = null;
                if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
            }, options);
            container.addEventListener('pointercancel', () => { gesture = null; }, options);
        };
    });
    const sync = () => galleries.forEach(update => update());
    enabled.addEventListener('change', sync);
    sync();
})();
