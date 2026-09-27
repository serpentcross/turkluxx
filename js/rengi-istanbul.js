(() => {
    'use strict';

    // Replace each villa's specs and media here when approved project assets arrive.
    // Each type can hold distinct approved plan assets; brochure variants are labelled below.
    const placeholderMedia = () => ({
        exterior: { src: '../assets/turkluxx-villa.png', position: '65% center', alt: 'Illustrative contemporary villa exterior with a swimming pool', caption: 'Illustrative exterior. Project photography coming soon.' },
        interior: { src: '../assets/istanbul-family-hero.png', position: '35% center', alt: 'Illustrative property scene used as a placeholder for interior photography', caption: 'Interior photography coming soon. Illustrative property image only.' }
    });
    const pendingSpecs = () => [
        ['Living Area', 'To be confirmed'], ['Plot Size', 'To be confirmed'],
        ['Bedrooms', 'To be confirmed'], ['Bathrooms', 'To be confirmed'],
        ['Private Pool', 'To be confirmed'], ['Garden', 'To be confirmed']
    ];
    const villas = {
        a: {
            name: 'Type A', subtitle: 'Modern Family Villa',
            specs: [['Living Area', '350 m\u00b2'], ['Plot Size', '500\u2013700 m\u00b2'], ['Bedrooms', '4+1'], ['Bathrooms', '4'], ['Private Pool', 'Yes'], ['Garden', 'Yes']],
            note: 'Provisional specifications. Final details to be confirmed.', media: placeholderMedia()
        },
        b: { name: 'Type B', subtitle: 'Villa details coming soon', specs: pendingSpecs(), note: 'Type B specifications and imagery to be confirmed.', media: placeholderMedia() },
        c: { name: 'Type C', subtitle: 'Villa details coming soon', specs: pendingSpecs(), note: 'Type C specifications and imagery to be confirmed.', media: placeholderMedia() },
        twin: { name: 'Twin Villa', subtitle: 'Villa details coming soon', specs: pendingSpecs(), note: 'Twin Villa specifications and imagery to be confirmed.', media: placeholderMedia() }
    };
    const variants = { a: 'Diamond A1', b: 'Ruby B6', c: 'Coral C3' };
    Object.entries(villas).forEach(([key, villa]) => {
        ['ground', 'first'].forEach((floor, index) => {
            const label = index ? 'First floor' : 'Ground floor';
            const caption = variants[key]
                ? `${variants[key]} - Brochure ${index ? 'upper' : 'lower'} floor. Representative Group ${key.toUpperCase()} variant.`
                : `Twin Villa - ${label} plan coming soon.`;
            villa.media[floor] = { src: `assets/rengi/${key}-${floor}.${key === 'twin' ? 'svg' : 'jpg'}`, alt: `${villa.name}: ${label}. ${caption}`, caption, position: 'center', plan: true };
        });
    });
    // Add verified unit IDs, type/status values and coordinates only when supplied.
    const masterPlan = { units: [], src: 'assets/rengi/master-plan.jpg' };
    const viewer = document.querySelector('.rengi-explorer');
    let activeVilla = 'a';
    let activeView = 'exterior';
    const image = viewer.querySelector('#rengi-villa-image');
    const specs = viewer.querySelector('#rengi-villa-specs');
    const typeTabs = [...viewer.querySelectorAll('[data-villa]')];
    const mediaTabs = [...viewer.querySelectorAll('[data-view]')];

    function updateTabs(tabs, key, selected) {
        tabs.forEach(tab => {
            const active = tab.dataset[key] === selected;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });
    }

    function render(announce = true) {
        const villa = villas[activeVilla];
        const media = villa.media[activeView];
        viewer.querySelector('#rengi-villa-name').textContent = villa.name;
        viewer.querySelector('#rengi-villa-subtitle').textContent = villa.subtitle;
        viewer.querySelector('#rengi-villa-note').textContent = villa.note;
        specs.replaceChildren(...villa.specs.map(([label, value]) => {
            const row = document.createElement('div');
            const term = document.createElement('dt');
            const detail = document.createElement('dd');
            term.textContent = label;
            detail.textContent = value;
            row.append(term, detail);
            return row;
        }));
        const preview = viewer.querySelector('#rengi-media-preview');
        preview.disabled = !media.plan;
        preview.setAttribute('aria-label', `Open ${villa.name} ${activeView === 'ground' ? 'ground floor' : 'first floor'} plan fullscreen`);
        preview.querySelector('.rengi-media-expand').hidden = !media.plan;
        viewer.querySelector('#rengi-villa-panel').classList.toggle('is-plan', !!media.plan);
        image.src = media.src;
        image.alt = media.alt;
        image.style.objectPosition = media.position;
        viewer.querySelector('#rengi-media-caption').textContent = media.caption;
        viewer.querySelector('#rengi-villa-panel').setAttribute('aria-labelledby', `rengi-type-${activeVilla}`);
        viewer.querySelector('#rengi-media-panel').setAttribute('aria-labelledby', `rengi-media-${activeView}`);
        updateTabs(typeTabs, 'villa', activeVilla);
        updateTabs(mediaTabs, 'view', activeView);
        if (announce) viewer.querySelector('#rengi-viewer-status').textContent = `${villa.name}. ${media.caption}`;
    }

    function bindTabs(tabs, select) {
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => select(tab));
            tab.addEventListener('keydown', event => {
                let next;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = tabs.length - 1;
                else return;
                event.preventDefault();
                tabs[next].focus({ preventScroll: true });
                tabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
                select(tabs[next]);
            });
        });
    }
    bindTabs(typeTabs, tab => { activeVilla = tab.dataset.villa; render(); });
    bindTabs(mediaTabs, tab => { activeView = tab.dataset.view; render(); });
    render(false);

    const dialog = document.querySelector('#rengi-plan-lightbox');
    const lightboxImage = dialog.querySelector('#rengi-lightbox-image');
    const scroll = dialog.querySelector('.rengi-lightbox-scroll');
    let zoom = 100;
    let baseWidth = 0;
    let previousOverflow = '';
    function setZoom(value) {
        zoom = Math.max(100, Math.min(300, value));
        lightboxImage.style.width = `${baseWidth * zoom / 100}px`;
        dialog.querySelector('#rengi-plan-zoom').textContent = `${zoom}%`;
        dialog.querySelector('#rengi-plan-zoom-out').disabled = zoom === 100;
        dialog.querySelector('#rengi-plan-zoom-in').disabled = zoom === 300;
    }
    function fitImage() {
        baseWidth = Math.min(scroll.clientWidth - 32, (scroll.clientHeight - 32) * lightboxImage.naturalWidth / lightboxImage.naturalHeight);
        setZoom(100);
    }
    function openPlan(src, alt, title) {
        lightboxImage.onload = fitImage;
        lightboxImage.src = src;
        lightboxImage.alt = alt;
        dialog.querySelector('#rengi-lightbox-title').textContent = title;
        previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        scroll.scrollTo(0, 0);
        if (lightboxImage.complete && lightboxImage.naturalWidth) fitImage();
    }
    viewer.querySelector('#rengi-media-preview').addEventListener('click', () => {
        const villa = villas[activeVilla];
        const media = villa.media[activeView];
        if (media.plan) openPlan(media.src, media.alt, `${villa.name} - ${activeView === 'ground' ? 'Ground floor' : 'First floor'}`);
    });
    function openMaster() {
        openPlan(masterPlan.src, document.querySelector('#rengi-master-image').alt, 'Master Plan');
    }
    document.querySelector('.rengi-master-preview').addEventListener('click', openMaster);
    document.querySelector('#rengi-master-fullscreen').addEventListener('click', openMaster);
    dialog.querySelector('#rengi-plan-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
    dialog.querySelector('#rengi-plan-zoom-in').addEventListener('click', () => setZoom(zoom + 25));
    dialog.querySelector('#rengi-plan-zoom-out').addEventListener('click', () => setZoom(zoom - 25));
    window.addEventListener('resize', () => { if (dialog.open) fitImage(); });
})();
