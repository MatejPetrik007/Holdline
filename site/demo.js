// Blackout simulation: the same alert fails over the cell network, then floods a Meshtastic mesh.
// Simplified model: high-site routers relay, household nodes are CLIENT_MUTE (receive, never relay);
// range circles, no terrain, no collisions.
// mountDemo(root, S) renders into root using the translated strings S and returns a cleanup function.

const SVGNS = 'http://www.w3.org/2000/svg';
const f = (s, v = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : `{${k}}`));
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// seeded random (mulberry32) so every replay looks the same
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The crisis centre writes the alert once, in Polish. Translations are made at the centre before
// sending, because nodes have no internet in a blackout. Every node shows the alert in its own
// display language; if that language was not sent, it shows the original.
const ORIGINAL = 'pl';
const LANGS = ['cs', 'pl', 'en'];
const MSG = {
  pl: 'Brak prądu do odwołania. Woda i ładowanie telefonów: Rynek i nám. ČSA, 10–18.',
  cs: 'Výpadek proudu do odvolání. Voda a nabíjení telefonů: Rynek a nám. ČSA, 10–18.',
  en: 'Power cut until further notice. Water and phone charging: Rynek and nám. ČSA, 10–18.',
};
const MAX_PAYLOAD = 233; // Meshtastic DATA_PAYLOAD_LEN, bytes per packet
// Text drawn by the node itself on its E-Ink screen, in the node's display language.
const DEV = {
  cs: { alert: '! VÝSTRAHA · OLZA', idle: 'KANÁL OLZA', waiting: 'Zatím žádná zpráva.', orig: 'originál {l} · překlad nebyl odeslán' },
  pl: { alert: '! ALERT · OLZA', idle: 'KANAŁ OLZA', waiting: 'Brak wiadomości.', orig: 'oryginał {l} · tłumaczenie nie zostało wysłane' },
  en: { alert: '! ALERT · OLZA', idle: 'CHANNEL OLZA', waiting: 'No messages yet.', orig: 'original {l} · no translation was sent' },
};
const TR_MODES = ['orig', 'recipients', 'all'];

export function mountDemo(root, S) {
  const N = S.nodes;
  root.innerHTML = `
  <div class="sim">
    <aside class="sim-panel sim-console">
      <div><div class="sim-who">${S.who}</div><div class="sim-title">${S.outgoing}</div></div>
      <label class="sim-tr">${S.translate}
        <select data-b="tr">${S.modes.map((m, i) => `<option value="${TR_MODES[i]}"${i === 1 ? ' selected' : ''}>${escH(m)}</option>`).join('')}</select>
      </label>
      <div class="sim-msg">
        <div class="sim-msgs" data-k="msgs"></div>
        <div class="sim-meta"><span data-k="bytes"></span><span>${S.channelLine}</span><span>${S.preset} <b data-k="hl">3</b></span></div>
      </div>
      <p class="sim-trnote">${S.trNote}</p>
      <div class="sim-route">
        <div class="sim-row"><span>${S.routeCell}</span><span class="sim-pill" data-k="pCell"></span></div>
        <div class="sim-row"><span>${S.routeMesh}</span><span class="sim-pill" data-k="pMesh"></span></div>
      </div>
    </aside>

    <div class="sim-panel sim-mapbox">
      <div class="sim-mapscroll">
        <svg class="sim-map" viewBox="0 0 1000 620" role="img" aria-label="${escH(S.mapLabel)}">
          <g data-g="lights"></g>
          <path class="river" d="M 440 -10 C 470 120, 530 190, 500 300 S 470 470, 560 630"/>
          <path class="border" d="M 440 -10 C 470 120, 530 190, 500 300 S 470 470, 560 630"/>
          <text class="country" x="60" y="600">ČESKO</text>
          <text class="country" x="770" y="600">POLSKA</text>
          <text class="town" x="250" y="410">ČESKÝ TĚŠÍN</text>
          <text class="town" x="560" y="410">CIESZYN</text>
          <text class="legend" x="474" y="608" transform="rotate(-62 474 608)">${S.riverLabel}</text>
          <g data-g="cover"></g><g data-g="back"></g><g data-g="links"></g><g data-g="towers"></g><g data-g="rings"></g><g data-g="pkts"></g><g data-g="houses"></g><g data-g="nodes"></g>
          <text class="clock" x="24" y="44" data-k="clock">18:40</text>
          <text class="phase" x="24" y="66" data-k="phase"></text>
          <g transform="translate(24 96)" class="legend">
            <circle cx="5" cy="-4" r="5" fill="var(--s-signal)"/><text x="16" y="0">${S.legend[0]}</text>
            <circle cx="5" cy="14" r="5" fill="var(--s-panel-2)" stroke="var(--s-muted)" stroke-width="1.5"/><text x="16" y="18">${S.legend[1]}</text>
            <rect x="0" y="27" width="10" height="10" fill="var(--s-panel-2)" stroke="var(--s-muted)" stroke-width="1.5" transform="rotate(45 5 32)"/><text x="16" y="36">${S.legend[2]}</text>
            <path d="M5 44 L0 56 M5 44 L10 56 M2 52 L8 52" stroke="var(--s-cell)" stroke-width="2" fill="none"/><text x="16" y="54">${S.legend[3]}</text>
          </g>
        </svg>
      </div>
      <div class="sim-controls">
        <button class="primary" type="button" data-b="replay">${S.replay}</button>
        <button type="button" data-b="mesh">${S.resend}</button>
        <label>${S.hopLimit} <select data-b="hop">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<option${n === 3 ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>${S.speed} <select data-b="speed"><option value="0.4">${S.speeds[0]}</option><option value="1" selected>${S.speeds[1]}</option><option value="2.2">${S.speeds[2]}</option></select></label>
        <button type="button" data-b="restore">${S.restore}</button>
        <span class="sim-hint">${S.hint}</span>
      </div>
      <div class="sim-node">
        <div class="sim-node-head">
          <span class="sim-node-k">${S.nodeScreen}</span>
          <b data-k="nName"></b><span class="sim-node-meta" data-k="nMeta"></span>
          <label>${S.nodeLang} <select data-b="nLang">${LANGS.map((l) => `<option value="${l}">${escH(S.langNames[l])}</option>`).join('')}</select></label>
        </div>
        <div class="sim-eink" data-k="eink" aria-live="polite">
          <div class="sim-eink-top"><b data-k="eTitle"></b><span data-k="eRight"></span></div>
          <div class="sim-eink-body" data-k="eBody"></div>
          <div class="sim-eink-foot" data-k="eFoot"></div>
        </div>
        <span class="sim-hint">${S.nodeHint}</span>
      </div>
    </div>

    <aside class="sim-panel sim-log">
      <div class="sim-bar"><span></span><span></span><span></span><b>meshtastic --listen · ${S.base}</b></div>
      <div class="sim-pre" data-k="log" aria-live="polite"></div>
    </aside>
  </div>
  <div class="sim-stats" aria-label="${escH(S.statsLabel)}">
    ${S.stats.map((k, i) => `<div><span class="k">${k}</span><span class="v ${['red', 'amber', '', '', ''][i]}" data-k="s${i}">–</span></div>`).join('')}
  </div>`;

  const q = (sel) => root.querySelector(sel);
  const K = (k) => q(`[data-k="${k}"]`);
  const G = (g) => q(`[data-g="${g}"]`);
  const B = (b) => q(`[data-b="${b}"]`);
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const setPill = (k, cls, text) => { const p = K(k); p.className = 'sim-pill ' + cls; p.textContent = text; };

  // Map units are roughly 10 m. Routers sit on high points (castle hill, a tall roof, a water tower) and
  // see over the rooftops; household nodes are CLIENT_MUTE: they receive and show alerts but never relay.
  const RANGE = { hq: 280, router: 400, home: 120 };
  const NODES = [
    { id: 'hq', name: N.hq, x: 600, y: 300, role: 'hq', c: 'PL' },
    { id: 'castle', name: 'Góra Zamkowa', x: 540, y: 250, role: 'router', c: 'PL' },
    { id: 'ctr', name: N.roof, x: 370, y: 320, role: 'router', c: 'CZ' },
    { id: 'mniszt', name: 'Wieża Mnisztwo', x: 800, y: 400, role: 'router', c: 'PL' },
    { id: 'bulwary', name: 'Bulwary', x: 522, y: 380, role: 'home', c: 'PL' },
    { id: 'hospital', name: N.hospital, x: 660, y: 210, role: 'home', c: 'PL' },
    { id: 'bobrek', name: 'Bobrek', x: 590, y: 80, role: 'home', c: 'PL' },
    { id: 'pastwiska', name: 'Pastwiska', x: 720, y: 110, role: 'home', c: 'PL' },
    { id: 'krasna', name: 'Krasna', x: 720, y: 330, role: 'home', c: 'PL' },
    { id: 'bogus', name: 'Boguszowice', x: 840, y: 270, role: 'home', c: 'PL' },
    { id: 'markl', name: 'Marklowice', x: 660, y: 500, role: 'home', c: 'PL' },
    { id: 'nam', name: 'nám. ČSA', x: 400, y: 200, role: 'home', c: 'CZ' },
    { id: 'chot', name: 'Chotěbuz', x: 340, y: 100, role: 'home', c: 'CZ' },
    { id: 'svib', name: 'Svibice', x: 230, y: 160, role: 'home', c: 'CZ' },
    { id: 'mosty', name: 'Mosty', x: 205, y: 420, role: 'home', c: 'CZ' },
    { id: 'zukov', name: 'Dolní Žukov', x: 430, y: 440, role: 'home', c: 'CZ' },
    { id: 'stan', name: 'Stanislavice', x: 300, y: 470, role: 'home', c: 'CZ' },
    { id: 'konak', name: 'Koňákov', x: 170, y: 560, role: 'home', c: 'CZ' },
  ];
  // Hundreds of unnamed household nodes, scattered over the towns and villages (seeded, so every replay matches).
  const HOUSES = [
    { x: 625, y: 260, rx: 110, ry: 125, n: 95, c: 'PL' }, { x: 395, y: 285, rx: 95, ry: 115, n: 85, c: 'CZ' },
    { x: 590, y: 88, rx: 40, ry: 26, n: 10, c: 'PL' }, { x: 720, y: 118, rx: 40, ry: 26, n: 10, c: 'PL' },
    { x: 830, y: 285, rx: 40, ry: 28, n: 10, c: 'PL' }, { x: 800, y: 445, rx: 40, ry: 26, n: 10, c: 'PL' },
    { x: 660, y: 510, rx: 40, ry: 26, n: 10, c: 'PL' }, { x: 870, y: 525, rx: 42, ry: 28, n: 10, c: 'PL' },
    { x: 340, y: 110, rx: 40, ry: 26, n: 10, c: 'CZ' }, { x: 230, y: 170, rx: 40, ry: 26, n: 10, c: 'CZ' },
    { x: 205, y: 430, rx: 42, ry: 30, n: 12, c: 'CZ' }, { x: 415, y: 460, rx: 36, ry: 26, n: 10, c: 'CZ' },
    { x: 300, y: 480, rx: 40, ry: 26, n: 10, c: 'CZ' }, { x: 170, y: 565, rx: 34, ry: 22, n: 8, c: 'CZ' },
  ];
  {
    const r = rng(1234);
    let k = 0;
    HOUSES.forEach((c) => {
      for (let i = 0; i < c.n; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r());
        NODES.push({ id: 'h' + k++, name: '', x: +(c.x + Math.cos(a) * c.rx * d).toFixed(1), y: +(c.y + Math.sin(a) * c.ry * d).toFixed(1), role: 'home', c: c.c, gen: true });
      }
    });
  }
  const byId = {};
  NODES.forEach((n) => { byId[n.id] = n; n.off = false; n.lang = n.c === 'CZ' ? 'cs' : 'pl'; });
  const TOWERS = [
    { name: 'BTS Cieszyn', x: 700, y: 160 },
    { name: 'BTS Český Těšín', x: 290, y: 250 },
    { name: 'BTS Hażlach', x: 870, y: 520 },
  ];
  const HQ = byId.hq;
  const others = NODES.filter((n) => n.role !== 'hq');
  const homes = NODES.filter((n) => n.role === 'home');
  const routers = NODES.filter((n) => n.role === 'router');
  const relays = NODES.filter((n) => n.role !== 'home');
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // Only the centre and the routers transmit. Everyone within a transmitter's range hears it directly.
  const adj = {};
  relays.forEach((t) => (adj[t.id] = NODES.filter((n) => n !== t && dist(t, n) <= RANGE[t.role])));
  // Backbone links between the centre and the high sites (both ends in each other's range).
  const links = [];
  for (let i = 0; i < relays.length; i++)
    for (let j = i + 1; j < relays.length; j++) {
      const a = relays[i], b = relays[j];
      if (dist(a, b) <= Math.min(RANGE[a.role], RANGE[b.role])) links.push({ a, b });
    }

  // ---------- static drawing ----------
  const lights = [];
  {
    const r = rng(42);
    const clusters = [
      { x: 620, y: 260, rx: 120, ry: 130, n: 120 }, { x: 400, y: 280, rx: 110, ry: 120, n: 100 },
      { x: 590, y: 90, rx: 40, ry: 30, n: 14 }, { x: 720, y: 115, rx: 40, ry: 30, n: 14 }, { x: 820, y: 285, rx: 40, ry: 30, n: 14 },
      { x: 800, y: 435, rx: 40, ry: 30, n: 14 }, { x: 660, y: 505, rx: 40, ry: 30, n: 14 }, { x: 340, y: 105, rx: 40, ry: 30, n: 14 },
      { x: 230, y: 165, rx: 40, ry: 30, n: 14 }, { x: 205, y: 425, rx: 45, ry: 35, n: 18 }, { x: 420, y: 455, rx: 40, ry: 30, n: 14 }, { x: 300, y: 475, rx: 40, ry: 30, n: 14 },
      { x: 170, y: 560, rx: 35, ry: 25, n: 10 }, { x: 870, y: 520, rx: 45, ry: 30, n: 14 },
    ];
    clusters.forEach((c) => {
      for (let i = 0; i < Math.round(c.n * 0.6); i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r());
        const e = mk('circle', {
          cx: (c.x + Math.cos(a) * c.rx * d).toFixed(1), cy: (c.y + Math.sin(a) * c.ry * d).toFixed(1),
          r: (0.8 + r() * 1.3).toFixed(2), class: 'light', opacity: (0.25 + r() * 0.55).toFixed(2),
        }, G('lights'));
        e.style.transitionDelay = (r() * 1.4).toFixed(2) + 's';
        lights.push(e);
      }
    });
  }
  links.forEach((l) => { l.el = mk('line', { x1: l.a.x, y1: l.a.y, x2: l.b.x, y2: l.b.y, class: 'link' }, G('links')); });
  // Coverage of each transmitter: every household inside a circle hears it directly, with no relay.
  relays.forEach((n) => { n.cover = mk('circle', { cx: n.x, cy: n.y, r: RANGE[n.role], class: 'cover' }, G('cover')); });

  TOWERS.forEach((t) => {
    mk('path', { d: `M${HQ.x} ${HQ.y} L${t.x} ${t.y}`, class: 'backhaul' }, G('back'));
    const g = mk('g', { class: 'tower', transform: `translate(${t.x} ${t.y})` }, G('towers'));
    mk('path', { class: 'mast', d: 'M0 -16 L-9 12 M0 -16 L9 12 M-5 2 L5 2 M-7 7 L7 7' }, g);
    mk('path', { class: 'wave', d: 'M-8 -22 A10 10 0 0 1 8 -22' }, g);
    mk('path', { class: 'wave', d: 'M-13 -27 A17 17 0 0 1 13 -27' }, g);
    mk('path', { class: 'xx', d: 'M-9 -26 L9 -8 M9 -26 L-9 -8' }, g);
    mk('text', { class: 'lbl', x: 0, y: 28, 'text-anchor': 'middle' }, g).textContent = t.name;
    t.g = g;
  });

  function setState(n, s) { n.state = s; n.g.setAttribute('class', `node ${n.role}${n.gen ? ' gen' : ''} ${n.off ? 'off' : s}`); }
  function refreshLinks() {
    links.forEach((l) => l.el.classList.toggle('dead', l.a.off || l.b.off));
    relays.forEach((n) => n.cover.classList.toggle('dead', n.off));
  }
  function setTower(t, s) { t.g.setAttribute('class', 'tower ' + s); }
  const roleName = (n) => (n.role === 'router' ? S.router : S.household);

  NODES.forEach((n) => {
    if (n.gen) {
      // unnamed household: a small dot, no label, not interactive
      const g = mk('g', { class: 'node home gen', transform: `translate(${n.x} ${n.y})` }, G('houses'));
      mk('circle', { class: 'core', r: 2.6 }, g);
      n.g = g;
      return;
    }
    const isHq = n.role === 'hq';
    const g = mk('g', { class: 'node ' + n.role, transform: `translate(${n.x} ${n.y})`, tabindex: isHq ? -1 : 0, role: isHq ? 'img' : 'button' }, G('nodes'));
    mk('circle', { class: 'halo', r: 20 }, g);
    if (n.role === 'router') mk('rect', { class: 'core', x: -8, y: -8, width: 16, height: 16, transform: 'rotate(45)' }, g);
    else if (isHq) mk('rect', { class: 'core', x: -10, y: -10, width: 20, height: 20, rx: 3 }, g);
    else mk('circle', { class: 'core', r: 6 }, g);
    mk('path', { class: 'x', d: 'M-6 -6 L6 6 M6 -6 L-6 6' }, g);
    mk('text', { class: 'lbl' + (n.role !== 'home' ? ' strong' : ''), x: 0, y: n.role === 'home' ? 20 : 26, 'text-anchor': 'middle' }, g).textContent = n.name;
    mk('title', {}, g).textContent = isHq ? S.tipHq : f(S.tipNode, { name: n.name, c: n.c, role: roleName(n) });
    n.g = g;
    if (!isHq) {
      g.addEventListener('mouseenter', () => showNode(n));
      g.addEventListener('focus', () => showNode(n));
      const toggle = () => { n.off = !n.off; setState(n, n.off ? 'off' : 'idle'); refreshLinks(); renderOutgoing(); showNode(n); };
      g.addEventListener('click', toggle);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    }
  });

  // ---------- log ----------
  const logEl = K('log');
  let clockBase = '18:40', clockT0 = 0, simT = 0;
  function fmtClock(base, ms) {
    const [h, m] = base.split(':').map(Number);
    const total = h * 3600 + m * 60 + ms / 1000;
    const hh = Math.floor(total / 3600) % 24, mm = Math.floor((total % 3600) / 60), ss = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${ss.toFixed(1).padStart(4, '0')}`;
  }
  function log(cls, text) {
    const line = document.createElement('div');
    const t = document.createElement('span'); t.className = 't'; t.textContent = fmtClock(clockBase, Math.max(0, simT - clockT0)) + '  ';
    const s = document.createElement('span'); s.className = cls; s.textContent = text;
    line.append(t, s); logEl.appendChild(line);
    while (logEl.childNodes.length > 80) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function setClock(base, label) { clockBase = base; clockT0 = simT; K('phase').textContent = label; }

  // ---------- engine ----------
  let events = [], visuals = [], last = null, speed = 1, mode = 'story', raf = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const at = (t, fn) => { events.push({ t, fn }); events.sort((a, b) => a.t - b.t); };
  function clearSim() { events = []; visuals.forEach((v) => v.el.remove()); visuals = []; }
  function frame(now) {
    if (last == null) last = now;
    const dt = Math.min(now - last, 60); last = now;
    simT += dt * speed * (reduce ? 1.6 : 1);
    while (events.length && events[0].t <= simT) { const e = events.shift(); e.fn(e.t); }
    visuals = visuals.filter((v) => {
      const p = (simT - v.t0) / v.dur;
      if (p < 0) { v.el.setAttribute('opacity', 0); return true; }
      if (p >= 1) { v.el.remove(); return false; }
      if (v.kind === 'ring') { v.el.setAttribute('r', (v.R * p).toFixed(1)); v.el.setAttribute('opacity', (0.9 * (1 - p)).toFixed(2)); }
      else { v.el.setAttribute('cx', (v.x1 + (v.x2 - v.x1) * p).toFixed(1)); v.el.setAttribute('cy', (v.y1 + (v.y2 - v.y1) * p).toFixed(1)); v.el.setAttribute('opacity', 1); }
      return true;
    });
    K('clock').textContent = fmtClock(clockBase, Math.max(0, simT - clockT0)).slice(0, mode === 'mesh' ? 10 : 5);
    if (mode === 'mesh' && meshT0 != null && !meshDone) K('s4').textContent = ((simT - meshT0) / 1000).toFixed(1) + ' s';
    raf = requestAnimationFrame(frame);
  }
  function ring(x, y, R, t0, dur) { visuals.push({ kind: 'ring', el: mk('circle', { cx: x, cy: y, r: 0, class: 'ring', opacity: 0 }, G('rings')), R, t0, dur }); }
  function pkt(a, b, t0, dur, cls) {
    visuals.push({ kind: 'pkt', el: mk('circle', { cx: a.x, cy: a.y, r: 4, class: 'pkt ' + (cls || ''), opacity: 0 }, G('pkts')), x1: a.x, y1: a.y, x2: b.x, y2: b.y, t0, dur });
  }

  // ---------- managed flooding ----------
  const AIR = 700;
  let H = 3, seen = {}, reached = 0, maxHop = 0, txCount = 0, implicitAck = false, meshT0 = null, meshDone = true;
  let sentLangs = null, packets = 1, sel = byId.nam;

  // ---------- languages ----------
  const payload = (langs) => langs.map((l) => `${l.toUpperCase()}: ${MSG[l]}`).join('\n');
  function langsFor(mode) {
    const extra = LANGS.filter((l) => l !== ORIGINAL && (mode === 'all' || (mode === 'recipients' && others.some((n) => !n.off && n.lang === l))));
    return [ORIGINAL, ...extra];
  }
  function renderOutgoing() {
    const langs = langsFor(B('tr').value);
    const b = new TextEncoder().encode(payload(langs)).length;
    const p = Math.ceil(b / MAX_PAYLOAD);
    K('msgs').innerHTML = langs.map((l) => `<div><div class="sim-lang">${l.toUpperCase()}${l === ORIGINAL ? '' : ` · ${escH(S.autoTag)}`}</div><span>${escH(MSG[l])}</span></div>`).join('');
    K('bytes').textContent = f(p === 1 ? S.fits : S.packets, { n: b, p });
    return { langs, b, p };
  }
  function showNode(n) { if (n && n.role !== 'hq') { sel = n; drawScreen(); } }
  function drawScreen() {
    const n = sel, d = DEV[n.lang], got = !!(seen[n.id] && sentLangs);
    K('nName').textContent = n.name;
    K('nMeta').textContent = `${n.c} · ${roleName(n)}`;
    B('nLang').value = n.lang;
    const e = K('eink');
    e.classList.toggle('off', n.off); e.classList.toggle('alert', got && !n.off);
    const put = (title, right, body, foot) => { K('eTitle').textContent = title; K('eRight').textContent = right; K('eBody').textContent = body; K('eFoot').textContent = foot; };
    if (n.off) put(n.name, '', S.nodeOff, '');
    else if (got) {
      const shown = sentLangs.includes(n.lang) ? n.lang : ORIGINAL;
      put(d.alert, `hop ${n.rxHop}`, MSG[shown], shown === n.lang ? `${shown.toUpperCase()} · SNR ${n.rxSnr} dB` : f(d.orig, { l: ORIGINAL.toUpperCase() }));
    } else put(d.idle, '☀ 86%', d.waiting, 'EU_868 · LongFast');
  }

  function updateStats() {
    K('s1').textContent = `${reached}/${homes.length}`;
    K('s2').textContent = maxHop || '–';
    K('s3').textContent = txCount * packets;
  }
  const snrOf = (n, from) => (10 - 24 * Math.min(1, dist(n, from) / RANGE[from.role])).toFixed(1);
  function startMesh(t) {
    mode = 'mesh'; meshDone = false;
    H = Number(B('hop').value);
    const out = renderOutgoing(); sentLangs = out.langs; packets = out.p;
    seen = { hq: true }; reached = 0; maxHop = 0; txCount = 0; implicitAck = false; meshT0 = t;
    others.forEach((n) => setState(n, n.off ? 'off' : 'idle'));
    links.forEach((l) => l.el.classList.remove('hot'));
    setClock('21:31', S.phases.mesh); clockT0 = t;
    setPill('pMesh', 'busy', S.pills.sending);
    updateStats();
    if (sentLangs.length > 1) log('sys', f(S.log.translate, { from: ORIGINAL.toUpperCase(), to: sentLangs.slice(1).map((l) => l.toUpperCase()).join(', ') }));
    log('sys', f(S.log.tx, { b: out.b, h: H, p: packets }));
    drawScreen();
    transmit(HQ, H, t);
    at(t + 1, function check(tt) { if (events.length === 0) finishMesh(); else at(tt + 200, check); });
  }
  // One transmission: every live node inside the circle hears it at the same moment.
  function transmit(n, hl, t) {
    txCount++; updateStats();
    setState(n, n.role === 'hq' ? 'hqtx' : 'tx');
    ring(n.x, n.y, RANGE[n.role], t, AIR * 1.4);
    const near = adj[n.id].filter((nb) => !nb.off);
    near.filter((nb) => nb.role !== 'home').forEach((nb) => {
      pkt(n, nb, t, AIR);
      at(t + AIR, (tt) => receive(nb, hl, n, tt));
    });
    const hh = near.filter((nb) => nb.role === 'home');
    if (hh.length) at(t + AIR, () => hear(hh, hl, n));
    at(t + AIR, () => { if (n.state === 'tx') setState(n, 'got'); if (n.role === 'hq') setState(n, 'idle'); });
  }
  // Households (CLIENT_MUTE) take the alert and show it. They never rebroadcast.
  function hear(list, hl, from) {
    const hop = H - hl + 1;
    let k = 0;
    list.forEach((n) => {
      if (n.off || seen[n.id]) return;
      seen[n.id] = true; k++; reached++;
      n.rxHop = hop; n.rxSnr = snrOf(n, from);
      setState(n, 'got');
      if (n === sel) drawScreen();
    });
    if (!k) return;
    maxHop = Math.max(maxHop, hop);
    log('rx', f(S.log.rxHomes, { k, from: from.name, hop }));
    updateStats();
  }
  // Routers (ROUTER role) relay the first copy they hear, quickly and always.
  function receive(n, hl, from, t) {
    if (n.off) return;
    const l = links.find((l) => (l.a === n && l.b === from) || (l.b === n && l.a === from));
    if (l) l.el.classList.add('hot');
    if (n.role === 'hq') {
      if (!implicitAck) { implicitAck = true; log('rx', f(S.log.ack, { from: from.name })); }
      return;
    }
    if (seen[n.id]) return;
    seen[n.id] = true;
    const hop = H - hl + 1; maxHop = Math.max(maxHop, hop);
    const snr = snrOf(n, from);
    n.rxHop = hop; n.rxSnr = snr;
    if (n === sel) drawScreen();
    updateStats();
    if (hl > 0) {
      const delay = 120 + Math.round(dist(n, from) / 4);
      setState(n, 'waiting');
      log('rx', f(S.log.rx, { n: n.name, c: n.c, hop, snr, ms: delay }));
      at(t + delay, (tt) => { if (n.state !== 'waiting' || n.off) return; transmit(n, hl - 1, tt); });
    } else {
      setState(n, 'limit');
      log('rx', f(S.log.rxLimit, { n: n.name, c: n.c, hop, snr }));
    }
  }
  function finishMesh() {
    if (meshDone) return;
    meshDone = true;
    const missed = homes.filter((n) => !seen[n.id]);
    K('s4').textContent = ((simT - meshT0) / 1000).toFixed(1) + ' s';
    if (missed.length === 0) log('sys', f(S.log.all, { t: homes.length, tx: txCount }));
    else {
      const off = missed.filter((n) => n.off).length;
      const named = missed.filter((n) => !n.gen).map((n) => n.name).join(', ');
      log('bad', f(S.log.missed, { n: missed.length, list: named || '–' }) + (off ? f(S.log.offCount, { n: off }) : ''));
      if (missed.some((n) => !n.off)) log('sys', S.log.tip);
    }
    setPill('pMesh', missed.length ? 'busy' : 'ok', f(S.pills.delivered, { r: reached, t: homes.length }));
    K('phase').textContent = S.phases.done;
  }

  // ---------- story ----------
  const lightsOn = (on) => lights.forEach((l) => l.classList.toggle('off', !on));
  function resetVisual() {
    clearSim(); logEl.textContent = ''; meshT0 = null; meshDone = true; seen = {}; sentLangs = null;
    others.forEach((n) => setState(n, n.off ? 'off' : 'idle')); setState(HQ, 'idle');
    links.forEach((l) => l.el.classList.remove('hot'));
    TOWERS.forEach((t) => setTower(t, ''));
    for (let i = 0; i < 5; i++) K('s' + i).textContent = '–';
    setPill('pCell', 'wait', S.pills.waiting);
    setPill('pMesh', 'wait', S.pills.waiting);
    drawScreen();
  }
  function cellFailed() {
    TOWERS.forEach((t) => setTower(t, 'dead failed'));
    setPill('pCell', 'fail', S.pills.failed);
    K('s0').textContent = '0/' + homes.length;
  }
  function story() {
    mode = 'story'; resetVisual(); simT = 0; lightsOn(true);
    setClock('18:40', S.phases.normal);
    log('sys', S.log.grid);
    log('sys', f(S.log.meshReady, { r: routers.length, n: homes.length }));
    at(1600, () => {
      setClock('18:42', S.phases.blackout); lightsOn(false); TOWERS.forEach((t) => setTower(t, 'battery'));
      log('bad', S.log.lost); log('q', S.log.battery);
    });
    TOWERS.forEach((t, i) => at(4200 + i * 500, () => {
      if (i === 0) setClock('21:10', S.phases.drained);
      setTower(t, 'dead'); log('bad', f(S.log.depleted, { t: t.name }));
    }));
    at(6400, (tt) => {
      setClock('21:30', S.phases.cell);
      setPill('pCell', 'busy', S.pills.sending);
      log('cell', S.log.sms);
      TOWERS.forEach((t) => pkt(HQ, t, tt, 1100, 'cell'));
      at(tt + 1100, () => { cellFailed(); log('bad', S.log.noCell); });
    });
    at(9400, () => log('sys', S.log.switching));
    at(10200, (tt) => startMesh(tt));
  }
  function meshOnly() {
    mode = 'mesh'; clearSim(); lightsOn(false); cellFailed();
    log('sys', S.log.resend);
    startMesh(simT + 300);
  }

  B('replay').addEventListener('click', story);
  B('mesh').addEventListener('click', meshOnly);
  B('restore').addEventListener('click', () => { others.forEach((n) => { n.off = false; setState(n, n.state === 'off' ? 'idle' : n.state); }); refreshLinks(); renderOutgoing(); drawScreen(); });
  B('tr').addEventListener('change', renderOutgoing);
  B('nLang').addEventListener('change', (e) => { sel.lang = e.target.value; renderOutgoing(); drawScreen(); });
  B('speed').addEventListener('change', (e) => { speed = Number(e.target.value); });
  B('hop').addEventListener('change', (e) => { K('hl').textContent = e.target.value; });

  others.forEach((n) => setState(n, 'idle')); setState(HQ, 'idle');
  renderOutgoing();
  story();
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
