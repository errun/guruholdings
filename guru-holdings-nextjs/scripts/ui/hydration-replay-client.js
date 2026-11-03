import { createElement as h, Fragment, lazy, startTransition, Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';

const params = new URL(location.href).searchParams;
const mode = params.get('boundary');
const boundary = mode === '1';
const delayed = params.get('delayed') === '1';
// Model a Flight child that becomes available while concurrent hydration yields.
const ready = h('section', { id: 'research-ready' }, 'Research content');
const incoming = lazy(() => {
  const chunk = { status: 'pending', value: undefined, then(resolve) {
    const deliver = () => {
      chunk.status = 'fulfilled';
      chunk.value = { default: ready };
      resolve(chunk.value);
    };
    if (delayed) setTimeout(deliver, 50); else queueMicrotask(deliver);
  } };
  return chunk;
});
const content = boundary ? h(Suspense, { fallback: h('p', null, 'Loading') }, incoming)
  : mode === 'fragment' ? h(Fragment, { key: 'page-content' }, incoming) : incoming;
const tree = h('div', { id: 'shell' }, h('header', null, 'Header'),
  h('main', null, content), h('footer', null, 'Footer'));
const original = document.querySelector('main');
const errors = [];
startTransition(() => hydrateRoot(document.getElementById('root'), tree, {
  onRecoverableError: error => errors.push(error.message.split('\n')[0]),
}));
setTimeout(() => {
  window.__hydrationReplay = { boundary, delayed, errors,
    mainReused: document.querySelector('main') === original,
    contentVisible: document.getElementById('research-ready')?.textContent === 'Research content' };
}, 250);
