(() => {
    'use strict';
    const viewer = document.querySelector('.rengi-explorer');
    if (!viewer) return;
    const categories = Object.keys(villaData);
    const tablist = viewer.querySelector('.rengi-type-tabs');
    const panel = viewer.querySelector('#rengi-villa-selection');
    const options = viewer.querySelector('.rengi-variant-options');
    const gallery = viewer.querySelector('.rengi-villa-grid');
    const dialog = viewer.querySelector('.rengi-villa-lightbox');
    const fullImage = dialog.querySelector('img');
    let origin;
    let previousOverflow;
    let suppressClick = false;
    const status = viewer.querySelector('#rengi-viewer-status');
    let category = categories[0];
    let variant = Object.keys(villaData[category])[0];
    let slideIndex = 0;
    let mode = 'photos';
    let floorIndex = 0;
    const viewTabs = [...viewer.querySelectorAll('.rengi-view-tabs button')];
    const floorOptions = viewer.querySelector('.rengi-floor-options');
    const planPreview = viewer.querySelector('.rengi-villa-plan-preview');
    const villaCta = viewer.querySelector('.rengi-villa-contact');
    const villaContext = document.querySelector('#callback-villa');
    const callback = document.querySelector('#turkluxx-callback');
    const callbackTitle = callback.querySelector('#turkluxx-callback-title');
    const defaultCallbackTitle = callbackTitle.textContent;
    const displayName = villa => `${villa.name} (${villa.turkishName})`;

    function resetCallbackTitle() {
        callbackTitle.textContent = defaultCallbackTitle;
        callbackTitle.style.removeProperty('font-size');
        callbackTitle.style.removeProperty('line-height');
        callbackTitle.style.removeProperty('white-space');
    }

    function fitCallbackTitle() {
        resetCallbackTitle();
        if (!callback.open || !villaContext.value) return;
        const style = getComputedStyle(callbackTitle);
        const originalSize = parseFloat(style.fontSize);
        // Keep the original heading's line box, so the form and dialog never grow.
        const originalHeight = parseFloat(style.height);
        callbackTitle.style.lineHeight = `${originalHeight}px`;
        callbackTitle.style.whiteSpace = 'nowrap';
        callbackTitle.textContent = `LET'S TALK ABOUT ${villaContext.value.toUpperCase()} VILLA`;
        let size = originalSize;
        while (callbackTitle.scrollWidth > callbackTitle.clientWidth && size > 1) {
            size -= 0.5;
            callbackTitle.style.fontSize = `${size}px`;
        }
    }

    document.querySelectorAll('.turkluxx-callback-trigger').forEach(button => {
        button.addEventListener('click', () => {
            villaContext.value = button === villaCta ? villaData[category][variant].name : '';
            fitCallbackTitle();
        });
    });
    callback.addEventListener('close', () => {
        villaContext.value = '';
        resetCallbackTitle();
    });
    window.addEventListener('resize', () => {
        if (callback.open) fitCallbackTitle();
    });

    function renderFloor() {
        const villa = villaData[category][variant];
        const floor = (villa.floors || [])[floorIndex];
        const card = viewer.querySelector('.rengi-floor-card');
        card.replaceChildren();
        floorOptions.querySelectorAll('input').forEach(input => { input.checked = Number(input.value) === floorIndex; });
        if (!floor) {
            planPreview.querySelector('img').removeAttribute('src');
            return;
        }
        const image = planPreview.querySelector('img');
        image.src = floor.image;
        image.alt = `${villa.name} ${floor.name || floor.code} plan`;
        planPreview.setAttribute('aria-label', `View ${villa.name} ${floor.name || floor.code} plan fullscreen`);
        const header = element('header');
        const heading = element('h4', floor.code);
        if (floor.name) heading.append(element('span', floor.name));
        const total = element('p', 'Total: ');
        total.append(element('strong', floor.total));
        header.append(heading, total);
        const rooms = element('dl');
        rooms.append(...floor.rooms.map(room => detailRow(room.name, room.area)));
        card.append(header, rooms);
    }

    function selectMode(next) {
        if (dialog.open) dialog.close();
        mode = next;
        slideIndex = 0;
        viewTabs.forEach(tab => {
            const active = tab.dataset.view === mode;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        viewer.querySelector('#rengi-villa-panel').hidden = mode !== 'photos';
        viewer.querySelector('#rengi-villa-plans').hidden = mode !== 'plans';
    }
    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => selectMode(tab.dataset.view));
        tab.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const available = viewTabs.filter(item => !item.hidden);
            const index = available.indexOf(tab);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? available.length - 1
                : (index + (event.key === 'ArrowLeft' ? -1 : 1) + available.length) % available.length;
            available[next].focus();
            selectMode(available[next].dataset.view);
        });
    });
    planPreview.addEventListener('click', () => openLightbox(floorIndex, planPreview));
    let gesture;

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function detailRow(label, value) {
        const row = element('div');
        row.append(element('dt', label), element('dd', value));
        return row;
    }

    function showSlide(next) {
        const villa = villaData[category][variant];
        const images = mode === 'plans' ? villa.floors.map(floor => floor.image) : villa.photos;
        if (!images.length) return;
        slideIndex = (next + images.length) % images.length;
        fullImage.src = images[slideIndex];
        fullImage.alt = mode === 'plans' ? `${villa.name} ${villa.floors[slideIndex].name || villa.floors[slideIndex].code} plan`
            : `${villa.name} villa, view ${slideIndex + 1}`;
        if (mode === 'plans') {
            floorIndex = slideIndex;
            renderFloor();
        }
        dialog.querySelector('.rengi-villa-counter').textContent = `${slideIndex + 1} / ${images.length}`;
        dialog.querySelectorAll('.rengi-villa-previous, .rengi-villa-next').forEach(button => {
            button.hidden = images.length < 2;
        });
    }

    function openLightbox(index, thumbnail) {
        origin = thumbnail;
        showSlide(index);
        dialog.setAttribute('aria-label', `${villaData[category][variant].name} image viewer`);
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
    }

    function renderVilla(announce = true) {
        if (dialog.open) dialog.close();
        gesture = null;
        slideIndex = 0;
        const villa = villaData[category][variant];
        options.querySelectorAll('input').forEach(input => { input.checked = input.value === variant; });
        gallery.setAttribute('aria-label', `${villa.name} images`);
        gallery.replaceChildren(...villa.photos.map((src, i) => {
            const button = element('button', undefined, 'rengi-villa-thumbnail');
            button.type = 'button';
            button.setAttribute('aria-label', `View ${villa.name} image ${i + 1} of ${villa.photos.length} fullscreen`);
            button.setAttribute('aria-haspopup', 'dialog');
            const image = element('img');
            image.src = src;
            image.alt = `${villa.name} villa, view ${i + 1}`;
            image.loading = 'lazy';
            image.decoding = 'async';
            button.append(image);
            button.addEventListener('click', () => openLightbox(i, button));
            return button;
        }));
        viewer.querySelector('.rengi-villa-philosophy').hidden = !villa.description.length;
        viewer.querySelector('#rengi-philosophy-title').textContent = displayName(villa);
        villaCta.querySelector('span').textContent = `I want ${villa.name} villa`;
        viewer.querySelector('.rengi-philosophy-body').replaceChildren(...villa.description.map(text => element('p', text)));
        floorIndex = 0;
        const floors = villa.floors || [];
        floorOptions.closest('fieldset').hidden = floors.length <= 1;
        floorOptions.replaceChildren(...floors.map((floor, index) => {
            const label = element('label', undefined, 'rengi-variant-option');
            const input = element('input');
            input.type = 'radio';
            input.name = 'rengi-villa-floor';
            input.value = index;
            input.addEventListener('change', () => {
                if (!input.checked) return;
                if (dialog.open) dialog.close();
                floorIndex = index;
                renderFloor();
            });
            label.append(input, document.createTextNode(floor.name || floor.code));
            return label;
        }));
        renderFloor();
        viewTabs[1].hidden = !floors.length;
        selectMode(floors.length ? mode : 'photos');
        if (announce) status.textContent = `${villa.category.replace('+', ' + ')}. ${villa.name}. ${villa.photos.length} images. Specifications updated.`;
    }

    function selectCategory(next, announce = true) {
        mode = 'photos';
        category = next;
        variant = Object.keys(villaData[category])[0];
        [...tablist.children].forEach(tab => {
            const active = tab.dataset.category === category;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            if (active) panel.setAttribute('aria-labelledby', tab.id);
        });
        const displayOrder = {
            '4+1': ['jade', 'crystal', 'coral'],
            '5+1': ['silver', 'pearl', 'emerald', 'sapphire', 'motherOfPearl', 'ruby'],
            '6+1': ['gold', 'diamond']
        };
        options.replaceChildren(...displayOrder[category].map(key => {
            const villa = villaData[category][key];
            const label = document.createElement('label');
            label.className = 'rengi-variant-option';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'rengi-villa-variant';
            input.value = key;
            input.addEventListener('change', () => { if (input.checked) { variant = key; renderVilla(); } });
            label.append(input, document.createTextNode(displayName(villa)));
            return label;
        }));
        renderVilla(announce);
    }

    categories.forEach((key, i) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `rengi-category-${i}`;
        tab.dataset.category = key;
        tab.textContent = key.replace('+', ' + ');
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', panel.id);
        tab.addEventListener('click', () => selectCategory(key));
        tab.addEventListener('keydown', event => {
            const next = { ArrowRight: (i + 1) % categories.length, ArrowLeft: (i + categories.length - 1) % categories.length,
                Home: 0, End: categories.length - 1 }[event.key];
            if (next === undefined) return;
            event.preventDefault();
            tablist.children[next].focus({ preventScroll: true });
            selectCategory(categories[next]);
        });
        tablist.append(tab);
    });

    // Horizontal gestures navigate only the open viewer; vertical gestures never change images.
    dialog.addEventListener('pointerdown', event => {
        gesture = event.isPrimary && event.pointerType !== 'mouse' && !event.target.closest('button')
            ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
    });
    dialog.addEventListener('pointermove', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = Math.abs(event.clientX - gesture.x);
        const dy = Math.abs(event.clientY - gesture.y);
        if (dy > 10 && dy >= dx) gesture = null;
    });
    dialog.addEventListener('pointerup', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        gesture = null;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            suppressClick = true;
            showSlide(slideIndex + (dx < 0 ? 1 : -1));
            setTimeout(() => { suppressClick = false; }, 0);
        }
    });
    dialog.addEventListener('pointercancel', () => { gesture = null; });
    dialog.querySelector('.rengi-villa-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.rengi-villa-previous').addEventListener('click', () => showSlide(slideIndex - 1));
    dialog.querySelector('.rengi-villa-next').addEventListener('click', () => showSlide(slideIndex + 1));
    dialog.addEventListener('click', event => {
        if (event.target === dialog && !suppressClick) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        showSlide(slideIndex + (event.key === 'ArrowRight' ? 1 : -1));
    });
    dialog.addEventListener('close', () => {
        document.body.style.overflow = previousOverflow;
        gesture = null;
        const target = origin?.isConnected && origin.getClientRects().length ? origin : options.querySelector('input:checked');
        target?.focus({ preventScroll: true });
    });
    selectCategory(category, false);
})();
