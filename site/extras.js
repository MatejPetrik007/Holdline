// Site-wide extras: a living E-Ink hero screen, an ambient mesh-flooding canvas behind the hero,
// a ⌘K / "/" search palette across every page, heading anchors and scroll-reveal animations.

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L').toLowerCase();
export const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 's';

export const EXTRA = {
  en: {
    search: 'Search', searchPh: 'Search pages, sections and questions…', none: 'Nothing found.', keys: '↑ ↓ move · Enter open · Esc close',
    screens: [
      ['MESH · 12 nodes', '☀ 87%', ['◂ Pavla: water ok at', '  the north hut.', '◂ Node 7: SNR 9.5 dB'], 'EU_868 · LongFast · 3.98V'],
      ['! ALERT · OLZA', '☀ 86%', ['Water + charging:', 'town hall, 10–18.', 'Bring a container.'], 'hop 2/3 · SNR 6.0 dB', true],
      ['NODES HEARD', '☀ 86%', ['Rynek      1.2 km  9dB', 'Góra Zam.  2.8 km  4dB', 'Bulwary    0.6 km 11dB'], '12 heard · 4 direct'],
      ['POWER', '☀ 91%', ['Solar   +312 mA', 'Load     -28 mA', 'Cell 4.05 V ▮▮▮▮▯'], '≈ 6 days without sun'],
    ],
  },
  cs: {
    search: 'Hledat', searchPh: 'Hledat stránky, sekce a otázky…', none: 'Nic nenalezeno.', keys: '↑ ↓ pohyb · Enter otevřít · Esc zavřít',
    screens: [
      ['SÍŤ · 12 uzlů', '☀ 87%', ['◂ Pavla: voda ok', '  u severní chaty.', '◂ Uzel 7: SNR 9.5 dB'], 'EU_868 · LongFast · 3.98V'],
      ['! VÝSTRAHA · OLZA', '☀ 86%', ['Voda + nabíjení:', 'radnice, 10–18.', 'Vezměte nádobu.'], 'hop 2/3 · SNR 6.0 dB', true],
      ['SLYŠENÉ UZLY', '☀ 86%', ['Rynek      1.2 km  9dB', 'Góra Zam.  2.8 km  4dB', 'Bulwary    0.6 km 11dB'], '12 slyšeno · 4 přímo'],
      ['NAPÁJENÍ', '☀ 91%', ['Solár   +312 mA', 'Odběr    -28 mA', 'Článek 4.05 V ▮▮▮▮▯'], '≈ 6 dní bez slunce'],
    ],
  },
  pl: {
    search: 'Szukaj', searchPh: 'Szukaj stron, sekcji i pytań…', none: 'Nic nie znaleziono.', keys: '↑ ↓ ruch · Enter otwórz · Esc zamknij',
    screens: [
      ['SIEĆ · 12 węzłów', '☀ 87%', ['◂ Pavla: woda ok', '  przy północnej chacie.', '◂ Węzeł 7: SNR 9.5 dB'], 'EU_868 · LongFast · 3.98V'],
      ['! ALERT · OLZA', '☀ 86%', ['Woda + ładowanie:', 'ratusz, 10–18.', 'Weź pojemnik.'], 'hop 2/3 · SNR 6.0 dB', true],
      ['SŁYSZANE WĘZŁY', '☀ 86%', ['Rynek      1.2 km  9dB', 'Góra Zam.  2.8 km  4dB', 'Bulwary    0.6 km 11dB'], '12 słyszanych · 4 bezp.'],
      ['ZASILANIE', '☀ 91%', ['Solar   +312 mA', 'Pobór    -28 mA', 'Ogniwo 4.05 V ▮▮▮▮▯'], '≈ 6 dni bez słońca'],
    ],
  },
};

// ---------- living E-Ink screen ----------
// Mimics a real e-paper full refresh: the panel flashes black, white, black, then the new image
// settles in with a faint ghost of the old one.
export function mountEink(lang) {
  const svg = document.querySelector('.hero .device');
  if (!svg) return () => {};
  const txt = svg.querySelector('.eink-text');
  const flash = svg.querySelector('.eink-flash');
  const ghost = svg.querySelector('.eink-ghost');
  const screens = (EXTRA[lang] || EXTRA.en).screens;
  const draw = ([title, right, lines, foot]) =>
    `<text x="76" y="146" font-size="13" font-weight="700">${esc(title)}</text><text x="304" y="146" font-size="12" text-anchor="end">${esc(right)}</text>
     <path d="M76 156H304" stroke="#16171a" stroke-width="1"/>
     ${lines.map((l, i) => `<text x="76" y="${178 + i * 20}" font-size="12" xml:space="preserve">${esc(l)}</text>`).join('')}
     <text x="76" y="252" font-size="11" opacity=".6">${esc(foot)}</text>`;
  let i = 0, timers = [];
  txt.innerHTML = draw(screens[0]);
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const step = () => {
    if (document.hidden) { later(5200, step); return; }
    const next = screens[(i = (i + 1) % screens.length)];
    const fast = reduceMotion();
    ghost.innerHTML = txt.innerHTML;
    if (fast) { txt.innerHTML = draw(next); ghost.innerHTML = ''; }
    else {
      const seq = [['#16171a', 0], ['#e9e7df', 110], ['#16171a', 220], [null, 330]];
      seq.forEach(([c, t]) => later(t, () => {
        if (c) { flash.style.fill = c; flash.style.opacity = 1; }
        else {
          flash.style.opacity = 0;
          txt.innerHTML = draw(next);
          ghost.style.opacity = 0.09;
          later(900, () => { ghost.style.opacity = 0; });
        }
      }));
    }
    svg.classList.toggle('alerting', !!next[4]);
    later(next[4] ? 6500 : 4800, step);
  };
  later(3800, step);
  return () => timers.forEach(clearTimeout);
}

// ---------- ambient mesh: managed flooding drawn on a canvas behind the hero ----------
export function mountMesh() {
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};
  const cv = document.createElement('canvas');
  cv.className = 'mesh-bg';
  cv.setAttribute('aria-hidden', 'true');
  hero.prepend(cv);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, nodes = [], links = [], events = [], raf = 0, visible = true, last = 0, nextFlood = 600;
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const colors = () => {
    const cs = getComputedStyle(document.documentElement);
    return { ink: cs.getPropertyValue('--ink').trim() || '#16171a', acc: cs.getPropertyValue('--accent').trim() || '#0d7a5c' };
  };
  let C = colors();
  function layout() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed = 42;
    const n = Math.round(Math.min(46, Math.max(18, (W * H) / 16000)));
    nodes = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H, lit: -1e9, hop: 0 }));
    const R = Math.max(120, Math.sqrt((W * H) / n) * 1.45);
    links = [];
    nodes.forEach((a, i) => { a.nb = []; });
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < R) { links.push([i, j]); nodes[i].nb.push(j); nodes[j].nb.push(i); }
    }
  }
  function flood(now) {
    const o = Math.floor(rnd() * nodes.length);
    const seen = new Set([o]);
    let frontier = [[o, now]];
    events = events.filter((e) => now - e.t < 3000);
    for (let hop = 0; hop < 4 && frontier.length; hop++) {
      const nf = [];
      for (const [i, t] of frontier) {
        events.push({ i, t, hop });
        for (const j of nodes[i].nb) if (!seen.has(j)) { seen.add(j); nf.push([j, t + 380 + rnd() * 420]); }
      }
      frontier = nf;
    }
    for (const [i, t] of frontier) events.push({ i, t, hop: 4, rx: true });
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    if (now - last < 32) return; // ~30 fps is plenty
    last = now;
    if (now > nextFlood) { flood(now); nextFlood = now + 4200 + rnd() * 1800; }
    ctx.clearRect(0, 0, W, H);
    for (const e of events) if (now >= e.t && !e.done) { nodes[e.i].lit = e.t; e.done = true; }
    ctx.lineWidth = 1;
    for (const [a, b] of links) {
      const A = nodes[a], B = nodes[b];
      const hot = Math.max(0, 1 - (now - Math.max(A.lit, B.lit)) / 1400) * (Math.min(now - A.lit, now - B.lit) < 1400 ? 1 : 0);
      ctx.globalAlpha = 0.07 + hot * 0.35;
      ctx.strokeStyle = hot > 0 ? C.acc : C.ink;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }
    for (const e of events) {
      const dt = now - e.t;
      if (dt < 0 || dt > 1300 || e.rx) continue;
      const n = nodes[e.i];
      ctx.globalAlpha = 0.28 * (1 - dt / 1300);
      ctx.strokeStyle = C.acc; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(n.x, n.y, 6 + dt * 0.11, 0, Math.PI * 2); ctx.stroke();
    }
    for (const n of nodes) {
      const age = now - n.lit;
      const hot = age >= 0 && age < 2200 ? 1 - age / 2200 : 0;
      ctx.globalAlpha = 0.18 + hot * 0.6;
      ctx.fillStyle = hot ? C.acc : C.ink;
      ctx.beginPath(); ctx.arc(n.x, n.y, 2.4 + hot * 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  layout();
  const ro = new ResizeObserver(() => layout());
  ro.observe(hero);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(hero);
  const mo = new MutationObserver(() => { C = colors(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const onMq = () => { C = colors(); };
  mq.addEventListener('change', onMq);
  if (reduceMotion()) { frame(performance.now()); cancelAnimationFrame(raf); }
  else raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); mq.removeEventListener('change', onMq); };
}

// ---------- heading anchors ----------
// Gives every heading and FAQ entry a stable id so the palette (and people) can deep-link to it.
const ANCHORS = 'h1, h2, h3, details.qa';
export function anchorize(root, page) {
  const used = new Set([...root.querySelectorAll('[id]')].map((e) => e.id));
  for (const el of root.querySelectorAll(ANCHORS)) {
    if (el.id) continue;
    const text = el.matches('details') ? el.querySelector('summary')?.textContent || '' : el.textContent;
    let id = slug(text), k = 2;
    while (used.has(id)) id = `${slug(text)}-${k++}`;
    used.add(id);
    el.id = id;
    if (el.matches('h2, h3') && !el.closest('.card, .steps, .sim')) {
      el.insertAdjacentHTML('beforeend', ` <a class="anchor" href="#/${page}#${id}" aria-label="#">#</a>`);
    }
  }
}

// ---------- search palette ----------
export function buildIndex(T, routes, fill, extraPages = {}) {
  const out = [];
  const tmp = document.createElement('div');
  for (const page of routes) {
    tmp.innerHTML = extraPages[page] ?? fill(T.pages[page] || '');
    anchorize(tmp, page);
    tmp.querySelectorAll('.anchor').forEach((a) => a.remove());
    const pageName = T.ui.nav[page];
    out.push({ page, id: '', title: pageName, sub: '', lvl: 0 });
    for (const el of tmp.querySelectorAll(ANCHORS)) {
      if (el.closest('svg')) continue;
      const isQ = el.matches('details');
      const title = (isQ ? el.querySelector('summary')?.textContent : el.textContent)?.trim();
      if (!title) continue;
      const body = isQ ? el.textContent.slice(title.length, title.length + 220) : (el.nextElementSibling?.textContent || '').slice(0, 220);
      out.push({ page, id: el.id, title, sub: pageName, body: body.trim(), lvl: isQ ? 3 : +el.tagName[1], q: isQ });
    }
  }
  return out.map((e) => ({ ...e, hay: norm(`${e.title} ${e.sub} ${e.body || ''}`), ht: norm(e.title) }));
}

export function mountPalette({ getIndex, getStrings, go }) {
  const dlg = document.createElement('dialog');
  dlg.className = 'palette';
  dlg.innerHTML = `<form method="dialog"><div class="pal-in"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" autocomplete="off" spellcheck="false" role="combobox" aria-controls="pal-list" aria-expanded="true"><kbd>Esc</kbd></div><ul id="pal-list" role="listbox"></ul><p class="pal-keys"></p></form>`;
  document.body.append(dlg);
  const input = dlg.querySelector('input'), list = dlg.querySelector('ul');
  let items = [], sel = 0;
  const hi = (text, terms) => {
    let h = esc(text);
    for (const t of terms) {
      if (!t) continue;
      const n = norm(text), at = n.indexOf(t);
      if (at >= 0) { const raw = text.slice(at, at + t.length); h = h.replace(esc(raw), `<mark>${esc(raw)}</mark>`); }
    }
    return h;
  };
  function search() {
    const S = getStrings();
    const terms = norm(input.value).split(/\s+/).filter(Boolean);
    const idx = getIndex();
    items = (terms.length
      ? idx.filter((e) => terms.every((t) => e.hay.includes(t)))
          .map((e) => ({ e, s: terms.reduce((s, t) => s + (e.ht.startsWith(t) ? 6 : e.ht.includes(t) ? 3 : 0), 0) - e.lvl * 0.5 }))
          .sort((a, b) => b.s - a.s).map((x) => x.e)
      : idx.filter((e) => e.lvl === 0)).slice(0, 40);
    sel = 0;
    list.innerHTML = items.length
      ? items.map((e, i) => `<li role="option" id="pal-${i}" data-i="${i}" ${i === 0 ? 'aria-selected="true"' : ''}><span class="pal-kind">${e.lvl === 0 ? '▦' : e.q ? '?' : '#'}</span><span><b>${hi(e.title, terms)}</b>${e.sub ? `<small>${esc(e.sub)}${e.body ? ' · ' + hi(e.body.slice(0, 90), terms) : ''}</small>` : ''}</span></li>`).join('')
      : `<li class="pal-none">${S.none}</li>`;
    input.setAttribute('aria-activedescendant', items.length ? 'pal-0' : '');
  }
  const move = (d) => {
    if (!items.length) return;
    list.querySelector(`[data-i="${sel}"]`)?.removeAttribute('aria-selected');
    sel = (sel + d + items.length) % items.length;
    const li = list.querySelector(`[data-i="${sel}"]`);
    li.setAttribute('aria-selected', 'true');
    li.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', li.id);
  };
  const pick = (i) => { const e = items[i]; if (!e) return; dlg.close(); go(e.page, e.id); };
  input.addEventListener('input', search);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
  });
  list.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) pick(+li.dataset.i); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  const open = () => {
    const S = getStrings();
    input.placeholder = S.searchPh;
    input.setAttribute('aria-label', S.search);
    dlg.querySelector('.pal-keys').textContent = S.keys;
    input.value = '';
    search();
    dlg.showModal();
    input.focus();
  };
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !e.target.closest('input, textarea, select, [contenteditable]'))) {
      e.preventDefault();
      dlg.open ? dlg.close() : open();
    }
  });
  return open;
}

// ---------- scroll reveal ----------
let io = null;
export function reveal(root) {
  if (reduceMotion() || !('IntersectionObserver' in window)) return;
  io?.disconnect();
  io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -6% 0px' });
  const vh = innerHeight;
  root.querySelectorAll('.grid > .card, .steps > li, .two > *, .tbl-wrap, .callout, .board-wrap, .post, details.qa, .lab').forEach((el, i) => {
    if (el.getBoundingClientRect().top < vh * 0.92) return; // already on screen: no flash
    el.classList.add('rv');
    el.style.setProperty('--rv-d', `${(i % 4) * 60}ms`);
    io.observe(el);
  });
}
