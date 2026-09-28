(() => {
  const dialog = document.querySelector('#turkluxx-callback');
  const triggers = document.querySelectorAll('.turkluxx-callback-trigger');
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');

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

  for (const input of form.querySelectorAll('input')) {
    const validate = () => {
      input.setCustomValidity(input.value && !input.value.trim() ? 'Please enter your ' + input.name + '.' : '');
    };
    input.addEventListener('input', () => { validate(); status.textContent = ''; });
    input.addEventListener('change', validate);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = 'Your details are valid. This form is not connected yet, so your request has not been sent. Please call +1 818 434 7266.';
  });
})();
