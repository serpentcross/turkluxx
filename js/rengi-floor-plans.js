(() => {
    'use strict';
    const section = document.querySelector('.rengi-floor-plans');
    if (!section) return;

    // Add approved image paths and specification rows here as more floor data arrives.
    // The requested ground-floor figures are supplied separately from the brochure drawing.
    const floors = {
        ground: {
            title: 'Ground Floor', src: 'assets/rengi/a-ground.jpg',
            alt: 'Diamond A1 lower-floor architectural drawing from the Rengi Istanbul brochure',
            caption: 'Diamond A1 lower floor from the project brochure. Representative Type A drawing.',
            specs: [['Living Area', '180 m\u00b2', 'area'], ['Terrace', '50 m\u00b2', 'terrace'], ['Bedrooms', '1 + 1', 'bed'], ['Bathrooms', '2', 'bath'], ['Kitchen', '1', 'kitchen'], ['Living Room', '1', 'living']],
            note: 'Specifications supplied separately; the brochure drawing shows a representative Type A variant.'
        },
        first: {
            title: 'First Floor', src: 'assets/rengi/a-first.jpg',
            alt: 'Diamond A1 upper-floor architectural drawing from the Rengi Istanbul brochure',
            caption: 'Diamond A1 upper floor from the project brochure. Representative Type A drawing.',
            specs: [], note: 'Separate first-floor specifications are not yet available.'
        },
        second: {
            title: 'Second Floor', src: null, alt: '', caption: '',
            specs: [], note: 'A second-floor drawing and specifications have not been supplied.'
        },
        site: {
            title: 'Site Plan', src: 'assets/rengi/master-plan.jpg',
            alt: 'Rengi Istanbul overall site plan from the project brochure',
            caption: 'Overall project site plan from the Rengi Istanbul brochure.',
            specs: [], note: 'The overall site plan is shown for context. A separate Type A plot plan is not yet available.'
        }
    };
    const icons = {
        area: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M4 4l5 5m11-5-5 5m5 11-5-5M4 20l5-5',
        terrace: 'M3 20h18M5 20V10m14 10V10M3 10h18M8 10v10m4-10v10m4-10v10M5 6h14',
        bed: 'M3 20V9m18 11V9M3 16h18M3 12h18v4M6 12V6h12v6M9 9h6',
        bath: 'M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3Zm3 7v2m12-2v2M6 12V5a2 2 0 0 1 4 0v2',
        kitchen: 'M4 4h16v16H4V4Zm0 9h16M7 6v1m4-1v1m5-1v1M8 13v7m5-4h4',
        living: 'M5 12V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M5 12H3v7h18v-7h-2v4H5v-4Zm0 7v2m14-2v2'
    };
    const tabs = [...section.querySelectorAll('[data-floor]')];
    const panel = section.querySelector('#rengi-floor-panel');
    const image = section.querySelector('#rengi-floor-image');
    const preview = section.querySelector('.rengi-floor-preview');
    const fullscreen = section.querySelector('.rengi-floor-fullscreen');
    const dialog = section.querySelector('dialog');
    const modalImage = dialog.querySelector('img');
    const scroller = dialog.querySelector('.rengi-lightbox-scroll');
    const zoomOut = dialog.querySelector('[data-zoom-out]');
    const zoomIn = dialog.querySelector('[data-zoom-in]');
    let active = 'ground';
    let zoom = 100;
    let fittedWidth = 0;
    let previousOverflow = '';

    function render(key, announce = true) {
        active = key;
        const floor = floors[key];
        tabs.forEach(tab => {
            const selected = tab.dataset.floor === key;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', `rengi-floor-tab-${key}`);
        section.querySelector('#rengi-floor-heading').textContent = floor.title;
        preview.hidden = !floor.src;
        section.querySelector('.rengi-floor-missing').hidden = !!floor.src;
        fullscreen.disabled = !floor.src;
        preview.setAttribute('aria-label', `View ${floor.title.toLowerCase()} fullscreen`);
        if (floor.src) { image.src = floor.src; image.alt = floor.alt; }
        section.querySelector('#rengi-floor-caption').textContent = floor.caption;
        section.querySelector('#rengi-floor-note').textContent = floor.note;
        section.querySelector('.rengi-floor-specs').replaceChildren(...floor.specs.map(([label, value, icon]) => {
            const row = document.createElement('div');
            const term = document.createElement('dt');
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('aria-hidden', 'true');
            const path = document.createElementNS(svg.namespaceURI, 'path');
            path.setAttribute('d', icons[icon]);
            svg.append(path);
            term.append(svg, document.createTextNode(label));
            const detail = document.createElement('dd');
            detail.textContent = value;
            row.append(term, detail);
            return row;
        }));
        if (announce) section.querySelector('[role="status"]').textContent = `${floor.title} selected.${floor.src ? '' : ' Drawing not yet available.'}`;
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => render(tab.dataset.floor));
        tab.addEventListener('keydown', event => {
            const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
            if (next === undefined) return;
            event.preventDefault();
            tabs[next].focus({ preventScroll: true });
            tabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
            render(tabs[next].dataset.floor);
        });
    });
    function setZoom(value) {
        zoom = Math.max(100, Math.min(300, value));
        modalImage.style.width = `${fittedWidth * zoom / 100}px`;
        dialog.querySelector('output').textContent = `${zoom}%`;
        zoomOut.disabled = zoom === 100;
        zoomIn.disabled = zoom === 300;
    }
    function fit() {
        if (!modalImage.naturalWidth) return;
        fittedWidth = Math.min(scroller.clientWidth - 32, (scroller.clientHeight - 32) * modalImage.naturalWidth / modalImage.naturalHeight);
        setZoom(100);
    }
    function open() {
        const floor = floors[active];
        if (!floor.src) return;
        modalImage.onload = fit;
        modalImage.src = floor.src;
        modalImage.alt = floor.alt;
        dialog.querySelector('h2').textContent = `Type A \u2014 ${floor.title}`;
        previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        scroller.scrollTo(0, 0);
        if (modalImage.complete) fit();
    }
    preview.addEventListener('click', open);
    fullscreen.addEventListener('click', open);
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    // The image fills its own box; only clicks in the surrounding canvas dismiss it.
    dialog.addEventListener('click', event => {
        if (event.target === dialog || event.target === scroller) dialog.close();
    });
    dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
    zoomIn.addEventListener('click', () => setZoom(zoom + 25));
    zoomOut.addEventListener('click', () => setZoom(zoom - 25));
    window.addEventListener('resize', () => { if (dialog.open) fit(); });
    render('ground', false);
})();
