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

const initializeNavigation = () => {
  const menus = Array.from(document.querySelectorAll('[data-nav-menu]'));

  if (menus.length) {
    const closeAll = (except) => {
      menus.forEach((menu) => {
        if (menu !== except) menu.open = false;
      });
    };

    menus.forEach((menu) => {
      menu.addEventListener('toggle', () => {
        if (menu.open) closeAll(menu);
      });

      menu.addEventListener('click', (event) => {
        if (event.target.closest('a')) menu.open = false;
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('[data-nav-menu]')) closeAll(null);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const open = menus.find((menu) => menu.open);
      if (!open) return;
      open.open = false;
      open.querySelector('summary')?.focus();
    });
  }

  const sectionLinks = Array.from(document.querySelectorAll('[data-nav-section]'));
  if (!sectionLinks.length || !('IntersectionObserver' in window)) return;

  const sections = sectionLinks
    .map((link) => document.getElementById(link.dataset.navSection))
    .filter(Boolean);

  if (!sections.length) return;

  const visible = new Set();

  const paint = () => {
    const current = sections.find((section) => visible.has(section));
    sectionLinks.forEach((link) => {
      if (current && link.dataset.navSection === current.id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visible.add(entry.target);
      } else {
        visible.delete(entry.target);
      }
    });
    paint();
  }, { rootMargin: '-30% 0px -55% 0px' });

  sections.forEach((section) => observer.observe(section));
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
  const interest = data.get('interest') || 'General enquiry';

  return {
    name: data.get('name'),
    email: data.get('email'),
    company: data.get('company') || 'N/A',
    interest,
    message: data.get('message'),
    _email: {
      subject: `Intervencija enquiry - ${interest} - ${data.get('company') || 'no company given'}`
    }
  };
};

const requestForEnvironment = async (endpoint, payload) => {
  const params = new URLSearchParams(window.location.search);
  const localTestMode = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
    ? params.get('form-test')
    : null;

  if (localTestMode === 'success') return { ok: true };
  if (localTestMode === 'failure') return { ok: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    return await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
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
    const originalContent = submitButton.innerHTML;
    submitButton.textContent = 'Sending your enquiry…';

    if (formNote) {
      formNote.textContent = 'Sending your project enquiry…';
      formNote.dataset.state = 'pending';
    }

    try {
      const response = await requestForEnvironment(endpoint, buildPayload(form));
      if (!response.ok) throw new Error('Submission was not accepted');

      if (formNote) {
        formNote.textContent = 'Thank you. Your enquiry has been sent. We’ll review the context and reply to the email address you provided.';
        formNote.dataset.state = 'success';
      }

      form.reset();
      formStarted = false;
      dispatchMeasurement('form_success');
    } catch {
      if (formNote) {
        formNote.textContent = 'We couldn’t confirm delivery. Your details are still here. Please try again or email hello@intervencija.eu.';
        formNote.dataset.state = 'error';
      }

      dispatchMeasurement('form_failure');
    } finally {
      form.dataset.submitting = 'false';
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-disabled');
      submitButton.innerHTML = originalContent;
    }
  });
};

initializeReveal();
initializeNavigation();
initializeMeasurement();
initializeInquiryForm();
