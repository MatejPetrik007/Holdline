import { CONFIG } from './config.js';
import { PINS } from './pins.js';
import en from './content/en.js';
import cs from './content/cs.js';
import pl from './content/pl.js';

const LANGS = { en, cs, pl };
const ROUTES = ['home', 'hardware', 'build', 'solar', 'openhw', 'access', 'faq', 'verify', 'security', 'releases'];
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

let lang = store.get('lang') || (navigator.language || 'en').slice(0, 2);
if (!LANGS[lang]) lang = 'en';
let T = LANGS[lang];

// ---------- theme ----------
function applyTheme(t) {
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
applyTheme(store.get('theme'));
$('#theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  applyTheme(next);
  store.set('theme', next);
});

// ---------- language ----------
$$('#langs button').forEach((b) =>
  b.addEventListener('click', () => {
    lang = b.dataset.lang;
    T = LANGS[lang];
    store.set('lang', lang);
    render();
  }),
);

$('#menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));

// ---------- routing ----------
function route() {
  const [path, anchor] = location.hash.replace(/^#\/?/, '').split('#');
  return { page: ROUTES.includes(path) ? path : 'home', anchor };
}
window.addEventListener('hashchange', () => render(true));

// ---------- tables ----------
function pinTable(rows) {
  const c = T.ui.pinCols;
  return `<div class="tbl-wrap"><table class="tbl pins"><thead><tr><th>${c[0]}</th><th>${c[1]}</th><th>${c[2]}</th><th>${c[3]}</th></tr></thead><tbody>${rows
    .map(([part, sig, gpio, fn]) => `<tr><td>${esc(part)}</td><td><code>${esc(sig)}</code></td><td><span class="gpio">${typeof gpio === 'number' ? 'GPIO' + gpio : esc(gpio)}</span></td><td>${esc(fn[lang])}</td></tr>`)
    .join('')}</tbody></table></div>`;
}
function powerTable() {
  return `<ol class="chain">${PINS.power.map(([n, what, how]) => `<li><b>${esc(what[lang])}</b><span>${esc(how[lang])}</span></li>`).join('')}</ol>`;
}

const DEVICE = `<svg class="device" viewBox="0 0 420 360" role="img" aria-label="E-Ink mesh node with solar panel">
  <defs><pattern id="cells" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#1f3b5c"/><path d="M0 0H22V22" fill="none" stroke="#5f86b3" stroke-width="1"/></pattern></defs>
  <g transform="translate(250 18) rotate(8)"><rect width="150" height="104" rx="6" fill="url(#cells)" stroke="var(--ink)" stroke-width="3"/><path d="M75 104v40" stroke="var(--ink)" stroke-width="3"/></g>
  <g fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M78 70a26 26 0 0 1 0-36"/><path d="M64 82a44 44 0 0 1 0-60"/></g>
  <rect x="90" y="20" width="8" height="90" rx="4" fill="var(--ink)"/>
  <rect x="40" y="100" width="300" height="230" rx="22" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/>
  <rect x="62" y="122" width="256" height="150" rx="6" fill="#e9e7df" stroke="var(--ink)" stroke-width="2"/>
  <g font-family="ui-monospace, Menlo, monospace" fill="#16171a">
    <text x="76" y="146" font-size="13" font-weight="700">MESH · 12 nodes</text><text x="250" y="146" font-size="12">☀ 87%</text>
    <path d="M76 156H304" stroke="#16171a" stroke-width="1"/>
    <text x="76" y="178" font-size="12">◂ Pavla: water ok at</text><text x="76" y="196" font-size="12">  the north hut.</text>
    <text x="76" y="220" font-size="12">◂ Node 7: SNR 9.5 dB</text>
    <text x="76" y="252" font-size="11" opacity=".6">EU_868 · LongFast · 3.98V</text>
  </g>
  <circle cx="100" cy="300" r="9" fill="var(--ink)"/><circle cx="280" cy="300" r="5" fill="var(--accent)"/>
  <g fill="var(--muted)"><rect x="150" y="296" width="80" height="8" rx="4"/></g>
</svg>`;

function fill(html) {
  return html
    .replaceAll('{{DEVICE}}', DEVICE)
    .replaceAll('{{UP}}', `<span class="up">${T.ui.up}</span>`)
    .replaceAll('{{PINS_HELTEC}}', pinTable(PINS.heltec))
    .replaceAll('{{PINS_DIY}}', pinTable(PINS.diy))
    .replaceAll('{{POWER_CHAIN}}', powerTable())
    .replaceAll('{{REPO}}', `https://github.com/${CONFIG.repo}`);
}

// ---------- render ----------
function render(fromHash) {
  const { page, anchor } = route();
  document.documentElement.lang = lang;
  $$('#langs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  $('#nav').innerHTML = ROUTES.map((r) => `<a href="#/${r}" ${r === page ? 'aria-current="page"' : ''}>${T.ui.nav[r]}</a>`).join('');
  $('#foot').innerHTML = fill(T.ui.footer);
  document.title = `${T.ui.nav[page]} · ${T.ui.brand}`;
  $('#main').innerHTML = fill(T.pages[page]);
  document.body.classList.remove('nav-open');
  wireCopy();
  ({ verify: initVerify, releases: initReleases, faq: initFaq, access: initForms, openhw: initForms }[page] || (() => {}))();
  if (anchor) document.getElementById(anchor)?.scrollIntoView();
  else if (fromHash) window.scrollTo(0, 0);
}

function wireCopy() {
  $$('#main pre').forEach((pre) => {
    const b = document.createElement('button');
    b.className = 'copy';
    b.type = 'button';
    b.textContent = T.ui.copy;
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(($('code', pre) || pre).innerText.replace(/\s*#.*$/gm, '').trim()); b.textContent = T.ui.copied; } catch { b.textContent = '✗'; }
      setTimeout(() => (b.textContent = T.ui.copy), 1500);
    });
    pre.prepend(b);
  });
}

// ---------- verify ----------
const hexOf = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s) => new Uint8Array((s.match(/../g) || []).map((h) => parseInt(h, 16)));
const sha256 = async (bytes) => hexOf(await crypto.subtle.digest('SHA-256', bytes));

function initVerify() {
  const files = {};
  const out = $('#v-result');
  const status = $('#v-status');
  const slots = $$('.drop');
  const update = () => {
    const n = Object.keys(files).length;
    status.textContent = T.ui.verify.waiting.replace('{n}', n);
    if (n === 3) runVerify(files, out);
  };
  slots.forEach((slot) => {
    const input = $('input', slot);
    const take = async (f) => {
      if (!f) return;
      files[slot.dataset.kind] = new Uint8Array(await f.arrayBuffer());
      slot.classList.add('has');
      $('.fname', slot).textContent = `${f.name} · ${f.size.toLocaleString()} B`;
      update();
    };
    input.addEventListener('change', () => take(input.files[0]));
    slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.classList.add('over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => { e.preventDefault(); slot.classList.remove('over'); take(e.dataTransfer.files[0]); });
  });
  $('#v-reset').addEventListener('click', () => render());
  $('#v-demo').addEventListener('click', async () => {
    const base = 'releases/demo-0.0.1/';
    for (const [kind, name] of [['bin', 'firmware.bin'], ['manifest', 'manifest.json'], ['sig', 'manifest.sig']]) {
      const r = await fetch(base + name);
      files[kind] = new Uint8Array(await r.arrayBuffer());
      const slot = $(`.drop[data-kind="${kind}"]`);
      slot.classList.add('has');
      $('.fname', slot).textContent = `${name} (demo)`;
    }
    update();
  });
}

async function runVerify(files, out) {
  const V = T.ui.verify;
  const rows = [];
  let pass = true;
  const row = (ok, label, detail) => { if (ok !== null && !ok) pass = false; rows.push({ ok, label, detail }); };
  try {
    const manifestText = new TextDecoder().decode(files.manifest);
    const manifest = JSON.parse(manifestText);
    const sig = JSON.parse(new TextDecoder().decode(files.sig));
    const pub = await (await fetch('pubkey.json', { cache: 'no-store' })).json();
    const { ml_dsa65, ed25519 } = await import('./vendor/noble.js');

    const binHash = await sha256(files.bin);
    const entry = (manifest.files || []).find((f) => f.sha256?.toLowerCase() === binHash) || (manifest.files || [])[0];
    row(entry?.sha256?.toLowerCase() === binHash, V.hash, `${binHash}`);

    const algs = manifest.signature_algs || ['ML-DSA-65', 'Ed25519'];
    for (const alg of algs) {
      let ok = false;
      try {
        if (alg === 'ML-DSA-65') ok = ml_dsa65.verify(unhex(sig[alg]), files.manifest, unhex(pub[alg]));
        else if (alg === 'Ed25519') ok = ed25519.verify(unhex(sig[alg]), files.manifest, unhex(pub[alg]));
      } catch { ok = false; }
      row(ok, `${V.sig} ${alg}`, ok ? V.sigOk : V.sigBad);
    }
    for (const alg of Object.keys(pub)) row(null, `${V.fp} ${alg}`, await sha256(unhex(pub[alg])));
    row(null, V.meta, `v${esc(manifest.version)} · ${esc(manifest.board)} · ${esc(manifest.upstream_commit)}${manifest.note ? ' · ' + esc(manifest.note) : ''}`);
  } catch (e) {
    pass = false;
    rows.push({ ok: false, label: V.error, detail: String(e.message || e) });
  }
  out.innerHTML = `<div class="verdict ${pass ? 'pass' : 'fail'}">${pass ? V.pass : V.fail}</div>
  <ul class="checks">${rows.map((r) => `<li class="${r.ok === null ? 'info' : r.ok ? 'ok' : 'bad'}"><span>${r.ok === null ? 'ⓘ' : r.ok ? '✓' : '✗'}</span><div><b>${esc(r.label)}</b><code>${esc(r.detail)}</code></div></li>`).join('')}</ul>
  <p class="small">${V.compare}</p>`;
}

// ---------- releases ----------
async function initReleases() {
  const el = $('#rel-list');
  try {
    const list = await (await fetch('releases.json', { cache: 'no-store' })).json();
    const R = T.ui.releases;
    el.innerHTML = list.map((r) => `<article class="card release">
      <header><h2>${esc(r.name)} <span class="ver">v${esc(r.version)}</span></h2>${/demo/i.test(r.version) ? `<span class="pill warn">DEMO</span>` : ''}</header>
      ${r.note ? `<p class="small">${esc(r.note)}</p>` : ''}
      <dl class="meta"><dt>${R.board}</dt><dd><code>${esc(r.board)}</code></dd><dt>${R.commit}</dt><dd><code>${esc(r.upstream_commit)}</code></dd><dt>${R.built}</dt><dd>${esc(r.built_at)}</dd><dt>${R.algs}</dt><dd>${esc((r.signature_algs || []).join(' + '))}</dd></dl>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${R.file}</th><th>${R.size}</th><th>SHA-256</th></tr></thead><tbody>${(r.files || []).map((f) => `<tr><td><a href="${esc(r.path)}/${esc(f.name)}" download>${esc(f.name)}</a></td><td>${f.size.toLocaleString()} B</td><td><code class="hash">${esc(f.sha256)}</code></td></tr>`).join('')}</tbody></table></div>
      <p class="links"><a href="${esc(r.path)}/manifest.json" download>manifest.json</a> · <a href="${esc(r.path)}/manifest.sig" download>manifest.sig</a> · <a href="#/verify">${R.verify} →</a></p>
    </article>`).join('') || `<p>${R.none}</p>`;
  } catch {
    el.innerHTML = `<p>${T.ui.releases.none}</p>`;
  }
}

// ---------- FAQ: ask form + read-only channel ----------
async function initFaq() {
  const form = $('#ask-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const q = String(d.get('question') || '').trim();
    if (q.length < 10) { $('#ask-msg').textContent = T.ui.ask.tooShort; return; }
    const params = new URLSearchParams({
      template: 'question.yml',
      title: `[Q] ${String(d.get('title') || q).slice(0, 80)}`,
      labels: 'question',
      question: q,
      topic: String(d.get('topic') || ''),
      language: { en: 'English', cs: 'Čeština', pl: 'Polski' }[lang],
    });
    window.open(`https://github.com/${CONFIG.repo}/issues/new?${params}`, '_blank', 'noopener');
    $('#ask-msg').textContent = T.ui.ask.opened;
  });

  const el = $('#channel');
  try {
    const items = await (await fetch('channel.json', { cache: 'no-store' })).json();
    const C = T.ui.channel;
    el.innerHTML = items.length
      ? items.map((it) => `<article class="post" id="q${esc(it.id)}">
          <header><span class="pill ${it.answer ? 'ok' : 'warn'}">${it.answer ? C.answered : C.pending}</span><time>${esc((it.asked_at || '').slice(0, 10))}</time>${it.original_lang && it.original_lang !== lang ? `<span class="small">${C.translatedFrom} ${esc(it.original_lang.toUpperCase())}</span>` : ''}</header>
          <h3>${esc(it.title?.[lang] || it.title?.en || '')}</h3>
          <p class="q">${esc(it.question?.[lang] || it.question?.en || '')}</p>
          ${it.answer ? `<div class="a"><b>${C.authority}</b><p>${esc(it.answer[lang] || it.answer.en)}</p></div>` : ''}
        </article>`).join('')
      : `<p class="empty">${C.empty}</p>`;
  } catch {
    el.innerHTML = `<p class="empty">${T.ui.channel.empty}</p>`;
  }
}

// ---------- registration forms (private: e-mail to central authority) ----------
function initForms() {
  $$('form.reg').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const F = T.ui.form;
      const msg = $('.form-msg', form);
      const lines = [];
      for (const el of $$('input, select, textarea', form)) {
        if (!el.name || (el.type === 'checkbox' && !el.checked) || (el.type === 'radio' && !el.checked)) continue;
        const label = el.closest('label')?.querySelector('.lbl')?.textContent || el.closest('fieldset')?.querySelector('legend')?.textContent || el.name;
        const value = el.type === 'checkbox' ? el.closest('label').textContent.trim() : el.value.trim();
        if (value) lines.push(`${label.trim()}: ${value}`);
      }
      const subject = `[${form.dataset.kind}] ${form.querySelector('[name=name]')?.value || ''}`.trim();
      const body = `${lines.join('\n')}\n\n-- ${T.ui.brand} · ${lang.toUpperCase()}`;
      if (CONFIG.authorityEmail) {
        location.href = `mailto:${CONFIG.authorityEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        msg.innerHTML = F.sent;
      } else {
        msg.innerHTML = `${F.noInbox}<pre class="summary">${esc(subject + '\n\n' + body)}</pre>`;
        try { await navigator.clipboard.writeText(subject + '\n\n' + body); msg.insertAdjacentHTML('beforeend', `<p class="small">${F.copied}</p>`); } catch {}
      }
    });
  });
}

render();
