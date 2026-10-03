(() => {
    'use strict';
    const viewer = document.querySelector('.antalya-explorer');
    const q = selector => viewer.querySelector(selector);
    const keys = Object.keys(antalyaProjects);
    const tabs = q('.antalya-project-tabs');
    const panel = q('#antalya-project-panel');
    const options = q('.rengi-variant-options');
    const media = q('.rengi-villa-media');
    const photos = q('#antalya-photos-panel .rengi-villa-grid');
    const plans = q('.antalya-plan-gallery');
    const viewTabs = q('.rengi-view-tabs');
    // Reuse the Istanbul content-tab placement above the gallery.
    panel.prepend(viewTabs);
    const dialog = q('.rengi-villa-lightbox');
    const fullImage = dialog.querySelector('img');
    const cta = q('.rengi-villa-contact');
    const bind = (...args) => window.TurkLuxxI18n.bind(...args);
    let selected = keys[0], apartment = null, mode = 'photos';
    let images = [], slide = 0, origin, previousOverflow, gesture, suppressClick = false;
    const project = () => antalyaProjects[selected];
    const selectedApartment = () => apartment === null ? null : project().apartmentTypes[apartment];
    const floorPlans = () => project().floorPlans || [];
    const selectedPhotos = () => selectedApartment() ? (selectedApartment().photos || []) : project().photos;
    const element = (tag, text, className) => {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    };
    function facts(target, rows) {
        target.replaceChildren(...rows.map(([label, value]) => {
            const row = element('div');
            row.append(element('dt', label), element('dd', value === '1+1 to 5+1' ? '1+1 – 5+1' : value));
            return row;
        }));
        target.hidden = !rows.length;
    }
    function showSlide(next) {
        slide = (next + images.length) % images.length;
        fullImage.src = images[slide].src;
        const entry = images[slide];
        bind(fullImage, entry.key, entry.values, 'alt');
        q('.rengi-villa-counter').textContent = `${slide + 1} / ${images.length}`;
        dialog.querySelectorAll('.rengi-villa-previous, .rengi-villa-next').forEach(button => { button.hidden = images.length < 2; });
    }
    function gallery(target, entries) {
        target.replaceChildren(...entries.map((entry, index) => {
            const button = element('button', undefined, 'rengi-villa-thumbnail');
            button.type = 'button';
            bind(button, 'media.fullscreen', () => ({ name: window.TurkLuxxI18n.t(entry.key, entry.values()) }), 'aria-label');
            button.setAttribute('aria-haspopup', 'dialog');
            const image = element('img');
            image.src = entry.src;
            bind(image, entry.key, entry.values, 'alt');
            image.loading = 'lazy';
            image.decoding = 'async';
            button.append(image);
            button.addEventListener('click', () => {
                images = entries;
                origin = button;
                previousOverflow = document.body.style.overflow;
                showSlide(index);
                bind(dialog, 'media.viewer', { name: project().name }, 'aria-label');
                document.body.style.overflow = 'hidden';
                dialog.showModal();
            });
            return button;
        }));
    }
    function renderMedia() {
        const data = project();
        const photoSet = selectedPhotos();
        const floors = floorPlans();
        if (!floors.length) mode = 'photos';
        media.hidden = false;
        viewTabs.hidden = false;
        q('.antalya-visual-placeholder').hidden = !!photoSet.length;
        const mediaName = () => data.name + (selectedApartment() ? ` ${window.TurkLuxxI18n.text(selectedApartment().name)}` : '');
        bind(q('.antalya-visual-placeholder'), 'media.placeholder', () => ({ name: mediaName() }), 'aria-label');
        photos.hidden = !photoSet.length;
        [...viewTabs.children].forEach(tab => {
            tab.hidden = tab.dataset.view === 'plans' && !floors.length;
            const active = tab.dataset.view === mode;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        q('#antalya-photos-panel').hidden = mode !== 'photos';
        q('#antalya-plans-panel').hidden = mode !== 'plans';
        gallery(photos, photoSet.map((src, i) => ({ src, key: 'media.projectView', values: () => ({ name: mediaName(), number: i + 1 }) })));
        // Plans are explicit { image, name } records, never generated filenames.
        gallery(plans, floors.map(floor => ({ src: floor.image, key: 'media.plan', values: () => ({ name: data.name, floor: window.TurkLuxxI18n.text(floor.name) }) })));
    }
    function renderProject(announce = true) {
        apartment = project().apartmentTypes.length ? 0 : null;
        mode = 'photos';
        const data = project();
        [...tabs.children].forEach(tab => {
            const active = tab.dataset.project === selected;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            if (active) panel.setAttribute('aria-labelledby', tab.id);
        });
        q('#antalya-project-name').textContent = data.name;
        q('.antalya-project-location').textContent = data.location || '';
        q('.antalya-project-location').hidden = !data.location;
        q('.antalya-project-tagline').textContent = data.tagline || '';
        q('.antalya-project-tagline').hidden = !data.tagline;
        bind(cta.querySelector('span'), 'project.cta', { name: data.name });
        q('.rengi-philosophy-body').replaceChildren(...data.descriptionKeys.map(key => { const p = element('p'); p.dataset.i18n = key; return p; }));
        facts(q('.antalya-project-facts'), data.projectStats.filter(([label]) => !data.featuredStats || data.featuredStats.includes(label)));
        const amenities = q('.antalya-amenities');
        amenities.hidden = !data.amenities.length;
        amenities.replaceChildren(...data.amenities.map(text => element('li', text)));
        q('.antalya-apartments').hidden = !data.apartmentTypes.length;
        options.replaceChildren(...data.apartmentTypes.map((type, index) => {
            const label = element('label', undefined, 'rengi-variant-option');
            const input = element('input');
            input.type = 'radio'; input.name = 'antalya-apartment'; input.value = index;
            input.checked = index === apartment;
            input.addEventListener('change', () => {
                if (!input.checked) return;
                apartment = index;
                mode = 'photos';
                renderMedia();
            });
            label.append(input, document.createTextNode(type.name));
            return label;
        }));
        renderMedia();
        if (announce) bind(q('#antalya-status'), 'project.selected', { name: data.name });
    }
    function keyboardTabs(event, buttons) {
        const index = buttons.indexOf(event.currentTarget);
        const next = { ArrowRight: (index + 1) % buttons.length, ArrowLeft: (index + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault(); buttons[next].focus({ preventScroll: true }); buttons[next].click();
    }
    keys.forEach((key, index) => {
        const tab = element('button', antalyaProjects[key].name);
        tab.type = 'button'; tab.id = `antalya-project-${index}`; tab.dataset.project = key;
        tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', panel.id);
        tab.addEventListener('click', () => { selected = key; renderProject(); });
        tab.addEventListener('keydown', event => keyboardTabs(event, [...tabs.children]));
        tabs.append(tab);
    });
    [...viewTabs.children].forEach(tab => {
        tab.addEventListener('click', () => { mode = tab.dataset.view; renderMedia(); });
        tab.addEventListener('keydown', event => keyboardTabs(event, [...viewTabs.children].filter(button => !button.hidden)));
    });
    q('.rengi-villa-close').addEventListener('click', () => dialog.close());
    q('.rengi-villa-previous').addEventListener('click', () => showSlide(slide - 1));
    q('.rengi-villa-next').addEventListener('click', () => showSlide(slide + 1));
    dialog.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); showSlide(slide + (event.key === 'ArrowRight' ? 1 : -1));
    });
    dialog.addEventListener('click', event => { if (event.target === dialog && !suppressClick) dialog.close(); });
    dialog.addEventListener('pointerdown', event => {
        gesture = event.isPrimary && event.pointerType !== 'mouse' && !event.target.closest('button') ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
    });
    dialog.addEventListener('pointermove', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = Math.abs(event.clientX - gesture.x), dy = Math.abs(event.clientY - gesture.y);
        if (dy > 10 && dy >= dx) gesture = null;
    });
    dialog.addEventListener('pointerup', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        gesture = null;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            suppressClick = true; showSlide(slide + (dx < 0 ? 1 : -1));
            setTimeout(() => { suppressClick = false; }, 0);
        }
    });
    dialog.addEventListener('pointercancel', () => { gesture = null; });
    dialog.addEventListener('close', () => {
        document.body.style.overflow = previousOverflow;
        gesture = null;
        (origin?.isConnected ? origin : tabs.querySelector('[aria-selected="true"]'))?.focus({ preventScroll: true });
    });

    window.registerTurkLuxxLeadContext(cta, () => ({
        project: 'Rengi Antalya',
        property: project().name,
        propertyCode: null
    }));

    // Same callback script/markup as Istanbul; only Antalya context is page-specific.
    const callback = document.querySelector('#turkluxx-callback');
    const title = callback.querySelector('h2');
    const context = document.querySelector('#callback-project');
    function resetTitle() {
        bind(title, 'common.let_s_talk');
        ['font-size', 'line-height', 'white-space'].forEach(property => title.style.removeProperty(property));
    }
    function fitTitle() {
        resetTitle();
        if (!callback.open || !context.value) return;
        if (window.TurkLuxxI18n?.language !== 'en') {
            bind(title, 'callback.projectTitle', { name: context.value });
            return;
        }
        const style = getComputedStyle(title);
        let size = parseFloat(style.fontSize);
        title.style.lineHeight = style.height;
        title.style.whiteSpace = 'nowrap';
        bind(title, 'callback.projectTitle', () => ({ name: window.TurkLuxxI18n.language === 'en' ? context.value.toUpperCase() : context.value }));
        while (title.scrollWidth > title.clientWidth && size > 1) {
            size -= .5; title.style.fontSize = `${size}px`;
        }
    }
    document.querySelectorAll('.turkluxx-callback-trigger').forEach(button => {
        button.addEventListener('click', () => { context.value = button === cta ? project().name : ''; fitTitle(); });
    });
    callback.addEventListener('close', () => { context.value = ''; resetTitle(); });
    window.addEventListener('turkluxx:language-change', () => { if (callback.open) fitTitle(); });
    window.addEventListener('resize', () => { if (callback.open) fitTitle(); });
    // Later sections intentionally do not exist yet; retain their navigation layout.
    document.querySelectorAll('.turkluxx-sales-nav [aria-disabled="true"]').forEach(link => {
        link.addEventListener('click', event => event.preventDefault());
    });
    renderProject(false);
})();
