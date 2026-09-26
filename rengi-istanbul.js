(() => {
    'use strict';

    // Replace each villa's specs and media here when approved project assets arrive.
    // Floor/interior views intentionally use labelled illustrative exteriors for now.
    const placeholderMedia = () => ({
        exterior: { src: 'assets/turkluxx-villa.png', position: '65% center', alt: 'Illustrative contemporary villa exterior with a swimming pool', caption: 'Illustrative exterior. Project photography coming soon.' },
        ground: { src: 'assets/istanbul-family-hero.png', position: '72% center', alt: 'Illustrative property scene used as a placeholder for the ground floor plan', caption: 'Ground floor plan coming soon. Illustrative property image only.' },
        first: { src: 'assets/turkluxx-villa.png', position: '100% top', alt: 'Illustrative villa exterior used as a placeholder for the first floor plan', caption: 'First floor plan coming soon. Illustrative property image only.' },
        interior: { src: 'assets/istanbul-family-hero.png', position: '35% center', alt: 'Illustrative property scene used as a placeholder for interior photography', caption: 'Interior photography coming soon. Illustrative property image only.' }
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

    const form = document.querySelector('#rengi-contact-form');
    const status = form.querySelector('[role="status"]');
    const name = form.elements.namedItem('name');
    const phone = form.elements.namedItem('phone');
    function validate() {
        name.setCustomValidity(name.value && !name.value.trim() ? 'Please enter your full name.' : '');
        const digits = phone.value.replace(/\D/g, '');
        const validPhone = /^[+\d\s().-]+$/.test(phone.value) && digits.length >= 7 && digits.length <= 15;
        phone.setCustomValidity(phone.value && !validPhone ? 'Please enter a phone number with 7 to 15 digits.' : '');
    }
    form.addEventListener('input', () => { validate(); status.textContent = ''; });
    form.addEventListener('change', validate);
    form.addEventListener('submit', event => {
        event.preventDefault();
        validate();
        if (!form.reportValidity()) return;
        status.textContent = 'Your details are valid, but this form is not connected yet. Your enquiry has not been sent. Please call +1 818 434 7266 to speak with an advisor.';
    });
})();
