(() => {
  const dialog = document.querySelector('#turkluxx-callback');
  const trigger = document.querySelector('.turkluxx-callback-trigger');
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');
  let scrollY = 0;
  let bodyStyle;
  let closing = false;

  trigger.addEventListener('click', () => {
    scrollY = window.scrollY;
    bodyStyle = document.body.getAttribute('style');
    Object.assign(document.body.style, {
      position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden'
    });
    status.textContent = '';
    dialog.showModal();
  });

  function close() {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.classList.add('is-closing');
    window.setTimeout(() => {
      dialog.close();
      dialog.classList.remove('is-closing');
      if (bodyStyle === null) document.body.removeAttribute('style');
      else document.body.setAttribute('style', bodyStyle);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      trigger.focus({ preventScroll: true });
      closing = false;
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160);
  }

  dialog.querySelector('.turkluxx-callback-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  let startedOutside = false;
  const outside = event => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', event => { startedOutside = outside(event); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && startedOutside && outside(event)) close();
    startedOutside = false;
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
