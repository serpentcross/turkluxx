(() => {
    'use strict';
    const ns = 'http://www.w3.org/2000/svg';
    const types = { a: 'Type A', b: 'Type B', c: 'Type C', twin: 'Twin Villa' };
    const floors = { ground: 'Ground Floor', first: 'First Floor', second: 'Second Floor' };
    // Replace src/alt for each type + floor with approved plan assets. Null src uses a demo diagram.
    const plans = Object.fromEntries(Object.keys(types).map((type, typeIndex) => [type,
        Object.fromEntries(Object.keys(floors).map((floor, floorIndex) => [floor, {
            src: null, alt: `${types[type]} ${floors[floor]} demo layout, not an actual project plan`,
            demoSplit: 290 + typeIndex * 45, demoLevel: floorIndex
        }]))
    ]));
    // Coordinates use the master image's normalized 1000 x 500 viewBox.
    // Replace the image, polygon points, and demo data together with verified inventory.
    const masterPlan = {
        image: 'assets/turkluxx-villa.png',
        units: [
            { id: 'A-12', type: 'a', area: '350 m\u00b2', bedrooms: '4+1', status: 'available', demo: true, x: 90, y: 230, width: 180, height: 140 },
            { id: 'B-08', type: 'b', area: 'To be confirmed', bedrooms: null, status: 'reserved', demo: true, x: 330, y: 170, width: 180, height: 140 },
            { id: 'C-03', type: 'c', area: 'To be confirmed', bedrooms: null, status: 'sold', demo: true, x: 570, y: 260, width: 180, height: 140 }
        ]
    };
    function svgElement(tag, attrs, text) {
        const node = document.createElementNS(ns, tag);
        Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
        if (text) node.textContent = text;
        return node;
    }
    function planArt(plan) {
        if (plan.src) {
            const img = new Image(); img.src = plan.src; img.alt = plan.alt; return img;
        }
        const svg = svgElement('svg', { viewBox: '0 0 900 500', role: 'img', 'aria-label': plan.alt });
        svg.append(svgElement('rect', { width: 900, height: 500, fill: '#fffdf7' }));
        svg.append(svgElement('rect', { x: 70, y: 60, width: 760, height: 370, fill: '#f7f5f1', stroke: '#212c6c', 'stroke-width': 7 }));
        const split = plan.demoSplit;
        svg.append(svgElement('path', { d: `M${split} 60V220m0 55v155M${split} 250H600m55 0h175M590 60v190M${split} 350h180m55 0H830`, fill: 'none', stroke: '#212c6c', 'stroke-width': 5 }));
        svg.append(svgElement('path', { d: 'M720 80v140m-60-140v140m0-120h60m-60 20h60m-60 20h60m-60 20h60m-60 20h60m-60 20h60', fill: 'none', stroke: '#8c6b30', 'stroke-width': 2 }));
        const labels = [['Living', 'Kitchen', 'Dining', 'Terrace'], ['Bedroom', 'Bedroom', 'Bathroom', 'Landing'], ['Suite', 'Study', 'Bathroom', 'Terrace']][plan.demoLevel];
        [[(70 + split) / 2, 220], [(split + 590) / 2, 160], [(split + 830) / 2, 308], [(split + 830) / 2, 395]].forEach(([x, y], index) => {
            svg.append(svgElement('text', { x, y, fill: '#212c6c', 'font-family': 'Manrope, sans-serif', 'font-size': 22, 'text-anchor': 'middle' }, labels[index]));
        });
        svg.append(svgElement('text', { x: 450, y: 475, fill: '#8c6b30', 'font-family': 'Manrope, sans-serif', 'font-size': 18, 'text-anchor': 'middle' }, 'DEMO SCHEMATIC / NOT TO SCALE'));
        return svg;
    }
    let activeType = 'a', activeFloor = 'ground';
    const typeTabs = [...document.querySelectorAll('[data-plan-type]')];
    const floorTabs = [...document.querySelectorAll('[data-plan-floor]')];
    const preview = document.querySelector('.rengi-plan-preview');
    function selectTabs(tabs, key, value) {
        tabs.forEach(tab => { const selected = tab.dataset[key] === value; tab.setAttribute('aria-selected', selected); tab.tabIndex = selected ? 0 : -1; });
    }
    function render() {
        document.querySelector('#rengi-plan-art').replaceChildren(planArt(plans[activeType][activeFloor]));
        document.querySelector('#rengi-plan-caption').textContent = `${types[activeType]} / ${floors[activeFloor]} — Demo layout. Select the plan to inspect fullscreen.`;
        preview.setAttribute('aria-label', `Open ${types[activeType]} ${floors[activeFloor]} demo plan fullscreen`);
        document.querySelector('#rengi-plan-type-panel').setAttribute('aria-labelledby', `plan-type-${activeType}`);
        document.querySelector('#rengi-plan-panel').setAttribute('aria-labelledby', `plan-floor-${activeFloor}`);
        selectTabs(typeTabs, 'planType', activeType); selectTabs(floorTabs, 'planFloor', activeFloor);
    }
    function bindTabs(tabs, select) {
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => select(tab));
            tab.addEventListener('keydown', event => {
                const indices = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
                if (!(event.key in indices)) return;
                event.preventDefault(); const next = tabs[indices[event.key]];
                next.focus({ preventScroll: true }); next.scrollIntoView({ block: 'nearest', inline: 'nearest' }); select(next);
            });
        });
    }
    bindTabs(typeTabs, tab => { activeType = tab.dataset.planType; render(); });
    bindTabs(floorTabs, tab => { activeFloor = tab.dataset.planFloor; render(); });
    render();
    const dialog = document.querySelector('#rengi-plan-lightbox');
    const lightboxArt = document.querySelector('#rengi-lightbox-art');
    let zoom = 100;
    function applyZoom() {
        lightboxArt.className = zoom === 100 ? '' : `is-zoom-${zoom}`;
        document.querySelector('#rengi-plan-zoom').textContent = `${zoom}%`;
        document.querySelector('#rengi-plan-zoom-out').disabled = zoom === 100;
        document.querySelector('#rengi-plan-zoom-in').disabled = zoom === 250;
    }
    preview.addEventListener('click', () => {
        lightboxArt.replaceChildren(planArt(plans[activeType][activeFloor]));
        document.querySelector('#rengi-lightbox-title').textContent = `${types[activeType]} / ${floors[activeFloor]}`;
        zoom = 100; applyZoom(); document.documentElement.classList.add('rengi-plan-modal-open'); dialog.showModal();
        dialog.querySelector('.rengi-lightbox-scroll').scrollTo(0, 0);
    });
    document.querySelector('#rengi-plan-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.documentElement.classList.remove('rengi-plan-modal-open'); preview.focus({ preventScroll: true }); });
    document.querySelector('#rengi-plan-zoom-out').addEventListener('click', () => { zoom = Math.max(100, zoom - 50); applyZoom(); });
    document.querySelector('#rengi-plan-zoom-in').addEventListener('click', () => { zoom = Math.min(250, zoom + 50); applyZoom(); });

    const overlay = document.querySelector('#rengi-master-overlay');
    const popup = document.querySelector('#rengi-unit-popup');
    let selectedUnit, selectedArea;
    document.querySelector('.rengi-master-stage > img').src = masterPlan.image;
    const statusLabel = status => status.charAt(0).toUpperCase() + status.slice(1);
    function showUnit(unit, area) {
        selectedUnit = unit; selectedArea = area;
        overlay.querySelectorAll('[aria-expanded]').forEach(node => node.setAttribute('aria-expanded', String(node === area)));
        document.querySelector('#rengi-unit-name').textContent = `Villa ${unit.id}`;
        document.querySelector('#rengi-unit-type').textContent = types[unit.type];
        document.querySelector('#rengi-unit-area').textContent = unit.area;
        document.querySelector('#rengi-unit-beds').textContent = unit.bedrooms ? `${unit.bedrooms} Bedrooms` : 'Bedrooms to be confirmed';
        document.querySelector('#rengi-unit-status').textContent = `${statusLabel(unit.status)} (demo)`;
        document.querySelector('#rengi-unit-announcement').textContent = `Demo Villa ${unit.id}, ${types[unit.type]}, ${statusLabel(unit.status)}. Not live availability.`;
        popup.hidden = false;
    }
    function closeUnit() { popup.hidden = true; overlay.querySelectorAll('[aria-expanded]').forEach(node => node.setAttribute('aria-expanded', 'false')); }
    masterPlan.units.forEach(unit => {
        const area = svgElement('g', { class: 'rengi-demo-unit', role: 'button', tabindex: 0, 'data-status': unit.status, 'data-villa-id': unit.id, 'aria-expanded': false, 'aria-controls': 'rengi-unit-popup', 'aria-label': `Demo Villa ${unit.id}, ${types[unit.type]}, ${statusLabel(unit.status)}. Show details.` });
        area.append(svgElement('rect', { x: unit.x, y: unit.y, width: unit.width, height: unit.height }));
        area.append(svgElement('text', { x: unit.x + unit.width / 2, y: unit.y + unit.height / 2, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, unit.id));
        area.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') showUnit(unit, area); });
        area.addEventListener('click', () => showUnit(unit, area));
        area.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showUnit(unit, area); popup.querySelector('a').focus(); } });
        overlay.append(area);
    });
    popup.querySelector('button').addEventListener('click', () => { closeUnit(); selectedArea?.focus(); });
    document.querySelector('.rengi-master-plan').addEventListener('keydown', event => { if (event.key === 'Escape' && !popup.hidden) { closeUnit(); selectedArea?.focus(); } });
    document.querySelector('#rengi-unit-details').addEventListener('click', event => {
        event.preventDefault(); activeType = selectedUnit.type; activeFloor = 'ground'; render(); closeUnit();
        document.querySelector('.rengi-floor-plans').scrollIntoView({ block: 'start' }); typeTabs.find(tab => tab.dataset.planType === activeType).focus({ preventScroll: true });
    });
})();
