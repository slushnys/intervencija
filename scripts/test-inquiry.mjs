import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');

function harness(fetchImpl, location = { hostname: 'intervencija.eu', search: '' }) {
  const listeners = {};
  const events = [];
  const timers = new Map();
  const values = new Map(Object.entries({
    name: 'Test Person',
    email: 'test@example.com',
    company: 'Test Company',
    interest: 'Critical Builds',
    message: 'Test project context'
  }));
  const button = {
    disabled: false,
    innerHTML: 'Send project enquiry <span aria-hidden="true">↗</span>',
    setAttribute() {},
    removeAttribute() {}
  };
  const note = { textContent: '', dataset: {} };
  const form = {
    dataset: {},
    addEventListener: (name, callback) => { listeners[name] = callback; },
    getAttribute: () => 'https://submit-form.com/test-only',
    querySelector: () => button,
    reset: () => { values.set('name', ''); values.set('message', ''); }
  };
  let nextTimer = 0;
  runInNewContext(source, {
    window: {
      location,
      dispatchEvent: (event) => events.push(event.detail)
    },
    document: {
      querySelectorAll: () => [],
      getElementById: (id) => id === 'inquiry-form' ? form : note
    },
    FormData: class { get(key) { return values.get(key); } },
    CustomEvent: class { constructor(name, { detail }) { this.detail = detail; } },
    URLSearchParams,
    AbortController,
    fetch: fetchImpl,
    setTimeout: (callback) => { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimeout: (id) => timers.delete(id)
  });
  return { button, note, values, form, events, timers,
    submit: () => listeners.submit({ preventDefault() {} }),
    focus: () => listeners.focusin()
  };
}

test('successful enquiries send the selected service and restore button markup', async () => {
  let request;
  const h = harness(async (endpoint, options) => {
    request = { endpoint, ...options };
    return { ok: true };
  });
  const originalMarkup = h.button.innerHTML;
  h.focus();
  h.focus();
  await h.submit();
  const payload = JSON.parse(request.body);
  assert.equal(request.method, 'POST');
  assert.equal(request.headers.Accept, 'application/json');
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.equal(payload.interest, 'Critical Builds');
  assert.match(payload._email.subject, /Critical Builds/);
  assert.equal(h.values.get('message'), '');
  assert.equal(h.note.dataset.state, 'success');
  assert.equal(h.button.disabled, false);
  assert.equal(h.button.innerHTML, originalMarkup);
  assert.equal(h.timers.size, 0);
  assert.deepEqual(h.events.map(e => e.name), ['form_start', 'form_success']);
  assert.ok(h.events.every(e => Object.keys(e).length === 1), 'Measurement must not contain enquiry data');
});

for (const failure of ['http', 'network']) {
  test(`${failure} failures retain the message and allow a retry`, async () => {
    const h = harness(async () => {
      if (failure === 'network') throw new Error('Offline');
      return { ok: false };
    });
    await h.submit();
    assert.equal(h.values.get('message'), 'Test project context');
    assert.equal(h.note.dataset.state, 'error');
    assert.match(h.note.textContent, /hello@intervencija.eu/);
    assert.equal(h.button.disabled, false);
    assert.equal(h.form.dataset.submitting, 'false');
    assert.equal(h.timers.size, 0);
  });
}

test('only one request is sent while a submission is pending', async () => {
  let resolveRequest;
  let calls = 0;
  const h = harness(() => { calls++; return new Promise(resolve => { resolveRequest = resolve; }); });
  const first = h.submit();
  assert.equal(h.button.disabled, true);
  await h.submit();
  assert.equal(calls, 1);
  resolveRequest({ ok: true });
  await first;
  assert.equal(h.button.disabled, false);
});

test('a timed-out request is aborted and the form remains usable', async () => {
  let signal;
  const h = harness((endpoint, options) => {
    signal = options.signal;
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('Timed out'))));
  });
  const pending = h.submit();
  for (const callback of h.timers.values()) callback();
  await pending;
  assert.equal(signal.aborted, true);
  assert.equal(h.note.dataset.state, 'error');
  assert.equal(h.button.disabled, false);
  assert.equal(h.values.get('message'), 'Test project context');
  assert.equal(h.timers.size, 0);
});

test('local test parameters cannot bypass submission on the production domain', async () => {
  let requests = 0;
  const h = harness(async () => { requests++; return { ok: true }; }, {
    hostname: 'intervencija.eu', search: '?form-test=success'
  });
  await h.submit();
  assert.equal(requests, 1);
});
