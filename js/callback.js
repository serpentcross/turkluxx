(() => {
  const dialog = document.querySelector('#turkluxx-callback');
  const triggers = document.querySelectorAll('.turkluxx-callback-trigger');
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');

  // Context exists only in memory for the current form opening. Resolvers read
  // the selected item from each page's existing data model at click time.
  const leadResolvers = new WeakMap();
  let leadContext = null;
  window.registerTurkLuxxLeadContext = (trigger, resolveContext) => {
    leadResolvers.set(trigger, resolveContext);
  };
  window.buildTurkLuxxLeadPayload = sourceForm => {
    const fields = new FormData(sourceForm);
    const value = key => String(fields.get(key) || '').trim();
    const context = sourceForm === form ? leadContext : null;
    return {
      referral: window.getTurkLuxxReferral(),
      name: value('name'),
      phone: value('phone'),
      email: value('email'),
      project: context?.project || null,
      property: context?.property || null,
      propertyCode: context?.propertyCode || null,
      page: window.location.href
    };
  };
  dialog.addEventListener('close', () => { leadContext = null; });

  // All dialogs share dismissal, scroll restoration and focus handling.
  function modalController(modal) {
    let trigger;
    let scrollY = 0;
    let bodyStyle;
    let closing = false;
    let startedOutside = false;

    function open(opener) {
      if (modal.open || closing) return;
      trigger = opener;
      scrollY = window.scrollY;
      bodyStyle = document.body.getAttribute('style');
      Object.assign(document.body.style, {
        position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden'
      });
      modal.showModal();
      modal.scrollTop = 0;
    }

    function close(afterClose) {
      if (closing || !modal.open) return;
      closing = true;
      modal.classList.add('is-closing');
      window.setTimeout(() => {
        modal.close();
        modal.classList.remove('is-closing');
        if (bodyStyle === null) document.body.removeAttribute('style');
        else document.body.setAttribute('style', bodyStyle);
        window.scrollTo({ top: scrollY, behavior: 'instant' });
        trigger?.focus({ preventScroll: true });
        closing = false;
        if (afterClose) afterClose(trigger);
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160);
    }

    modal.querySelector('.turkluxx-callback-close').addEventListener('click', () => close());
    modal.addEventListener('cancel', event => { event.preventDefault(); close(); });
    const outside = event => {
      const box = modal.getBoundingClientRect();
      return event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom;
    };
    modal.addEventListener('pointerdown', event => { startedOutside = outside(event); });
    modal.addEventListener('click', event => {
      if (event.target === modal && startedOutside && outside(event)) close();
      startedOutside = false;
    });
    return { open, close };
  }

  const callback = modalController(dialog);
  const informationModals = new Map(
    [...document.querySelectorAll('.turkluxx-roi-modal, .turkluxx-info-modal')]
      .map(modal => [modal, modalController(modal)])
  );
  triggers.forEach(button => button.addEventListener('click', () => {
    const context = leadResolvers.get(button)?.();
    leadContext = context ? {
      project: context.project || null,
      property: context.property || null,
      propertyCode: context.propertyCode || null
    } : null;
    status.textContent = '';
    // Close the information dialog before opening the existing form. Restore
    // focus to its original trigger when the consultation flow finishes.
    const active = [...informationModals].find(([modal]) => modal.open);
    if (active) active[1].close(opener => callback.open(opener));
    else callback.open(button);
  }));
  document.querySelectorAll('.turkluxx-roi-trigger, .turkluxx-info-trigger').forEach(button => {
    const information = informationModals.get(document.getElementById(button.getAttribute('aria-controls')));
    button.addEventListener('click', event => {
      event.preventDefault();
      information?.open(button);
    });
    button.addEventListener('keydown', event => {
      if (event.key === ' ') {
        event.preventDefault();
        button.click();
      }
    });
  });

  const validators = [];
  for (const input of form.querySelectorAll('input:not([type="hidden"])')) {
    const validate = () => {
      input.setCustomValidity(input.value && !input.value.trim() ? 'Please enter your ' + input.name + '.' : '');
    };
    validators.push(validate);
    input.addEventListener('input', () => { validate(); status.textContent = ''; });
    input.addEventListener('change', validate);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    validators.forEach(validate => validate());
    if (!form.reportValidity()) return;
    const payload = window.buildTurkLuxxLeadPayload(form);
    // Local integration hook only; a future backend adapter can consume detail.
    form.dispatchEvent(new CustomEvent('turkluxx:lead-ready', { detail: payload, bubbles: true }));
    status.textContent = 'Your details are valid. This form is not connected yet, so your request has not been sent. Please call +1 818 434 7266.';
  });
})();
