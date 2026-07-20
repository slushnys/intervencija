const dispatchMeasurement = (name, details = {}) => {
  window.dispatchEvent(new CustomEvent('intervencija:measurement', {
    detail: { name, ...details }
  }));
};

const initializeReveal = () => {
  const nodes = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  nodes.forEach((node) => observer.observe(node));
};

const initializeMeasurement = () => {
  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', () => {
      dispatchMeasurement(element.dataset.track, {
        destination: element.getAttribute('href') || undefined
      });
    });
  });
};

const buildPayload = (form) => {
  const data = new FormData(form);

  return {
    name: data.get('name'),
    email: data.get('email'),
    role: data.get('role'),
    company: data.get('company') || 'N/A',
    challenge: data.get('challenge'),
    _subject: `Intervencija request - ${data.get('company') || data.get('role') || 'Architecture'}`
  };
};

const requestForEnvironment = async (endpoint, payload) => {
  const params = new URLSearchParams(window.location.search);
  const localTestMode = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
    ? params.get('form-test')
    : null;

  if (localTestMode === 'success') return { ok: true };
  if (localTestMode === 'failure') return { ok: false };

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });
};

const initializeInquiryForm = () => {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  const formNote = document.getElementById('form-note');
  const submitButton = form.querySelector('button[type="submit"]');
  let formStarted = false;

  form.addEventListener('focusin', () => {
    if (formStarted) return;
    formStarted = true;
    dispatchMeasurement('form_start');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.dataset.submitting === 'true') return;

    const endpoint = form.getAttribute('action');
    if (!endpoint || !submitButton) return;

    form.dataset.submitting = 'true';
    submitButton.disabled = true;
    submitButton.setAttribute('aria-disabled', 'true');
    const originalLabel = submitButton.textContent;
    submitButton.textContent = 'Sending securely';

    if (formNote) {
      formNote.textContent = 'Sending your enquiry securely...';
      formNote.dataset.state = 'pending';
    }

    try {
      const response = await requestForEnvironment(endpoint, buildPayload(form));
      if (!response.ok) throw new Error('Submission was not accepted');

      if (formNote) {
        formNote.textContent = 'Thank you. Your enquiry has been received. We will reply after reviewing the context you shared.';
        formNote.dataset.state = 'success';
      }

      form.reset();
      formStarted = false;
      dispatchMeasurement('form_success');
    } catch {
      if (formNote) {
        formNote.textContent = 'We could not send the enquiry. Your details are still here. Please try again or email hello@intervencija.eu.';
        formNote.dataset.state = 'error';
      }

      dispatchMeasurement('form_failure');
    } finally {
      form.dataset.submitting = 'false';
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-disabled');
      submitButton.textContent = originalLabel;
    }
  });
};

initializeReveal();
initializeMeasurement();
initializeInquiryForm();
