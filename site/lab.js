// Lab: interactive LoRa packet / airtime calculator with a chirp visualiser, and a solar autonomy
// calculator with a two-week weather simulation. Everything runs locally; no network requests.
// mountLab(root, lang) renders into root and returns a cleanup function.

const SVGNS = 'http://www.w3.org/2000/svg';
const f = (s, v = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : `{${k}}`));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Meshtastic modem presets: bandwidth (kHz), spreading factor, coding rate 4/x.
export const PRESETS = [
  ['ShortTurbo', 500, 7, 5], ['ShortFast', 250, 7, 5], ['ShortSlow', 250, 8, 5], ['MediumFast', 250, 9, 5],
  ['MediumSlow', 250, 10, 5], ['LongFast', 250, 11, 5], ['LongModerate', 125, 11, 8], ['LongSlow', 125, 12, 8],
];
const SNR_LIMIT = { 7: -7.5, 8: -10, 9: -12.5, 10: -15, 11: -17.5, 12: -20 };
const TX_DBM = 27; // EU868 869.4–869.65 MHz sub-band: 500 mW ERP, 10 % duty cycle
const DUTY = 0.10;
const PREAMBLE = 16;
const HEADER = 16; // Meshtastic over-the-air header: to, from, id, flags, channel hash, next hop, relay node
const MAX_PL = 255;

// Semtech SX126x time on air, explicit header, CRC on.
export function airtime(plBytes, bwKhz, sf, crDen) {
  const tsym = (2 ** sf) / (bwKhz * 1000);
  const de = tsym > 0.016 ? 1 : 0;
  const cr = crDen - 4;
  const n = 8 + Math.max(Math.ceil((8 * plBytes - 4 * sf + 28 + 16) / (4 * (sf - 2 * de))) * (cr + 4), 0);
  const pre = (PREAMBLE + 4.25) * tsym;
  return { tsym, pre, total: pre + n * tsym, nsym: n };
}
const sensitivity = (bw, sf) => -174 + 10 * Math.log10(bw * 1000) + 6 + SNR_LIMIT[sf];
const dataFields = (len) => 2 + 2 + 1 + (len < 128 ? 1 : 2); // portnum, bitfield, payload tag + length varint

// Approximate monthly peak-sun-hours at ~49.7° N (Cieszyn / Český Těšín), optimal tilt; day length in hours.
const PSH = [1.3, 2.1, 3.0, 4.0, 4.4, 4.6, 4.7, 4.3, 3.4, 2.4, 1.4, 1.0];
const DAYLEN = [8.3, 9.9, 11.8, 13.7, 15.3, 16.1, 15.7, 14.3, 12.4, 10.4, 8.7, 7.9];
const LOSS = 0.7, CELL_WH = 3 * 3.7, V = 3.7;

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fmtMs = (s) => (s < 1 ? `${(s * 1000).toFixed(s < 0.01 ? 2 : s < 0.1 ? 1 : 0)} ms` : `${s.toFixed(2)} s`);

const STR = {
  en: {
    eyebrow: 'lab · runs in your browser',
    title: 'Do the radio and solar maths yourself',
    lede: 'Type a message and see exactly how many bytes it takes on air, how long it occupies the channel and what each Meshtastic preset trades away for range. Then size a solar setup for any month on the Olza and watch two weeks of weather fill or drain the battery.',
    toc: ['Packet & airtime', 'LoRa chirps', 'Solar autonomy'],
    pkt: 'Packet and airtime',
    msg: 'Your message', msgDefault: 'Water and phone charging at the town hall, 10–18. Bring a container.',
    preset: 'Modem preset', def: 'default',
    bytes: '{n} B of text · {c} characters', tooLong: 'Too long by {n} B. Shorten the message.', utf: 'Letters like ž, ł or ř take 2 bytes, emoji take 4.',
    seg: ['Mesh header', 'Data fields', 'Your text', 'Free'],
    stats: ['Time on air', 'Symbol time', 'Link budget', 'Alerts per hour'], statSub: ['one transmission', '2^SF / bandwidth', '{s} dBm sensitivity', '10 % duty cycle, EU868'],
    relays: 'Nodes that relay it', flood: 'With {n} relays the channel is busy for {t} for this one alert.',
    compare: 'Same message, every preset', compareCols: ['Preset', 'BW · SF · CR', 'Time on air', 'Link budget'],
    chirp: 'What the radio actually sends: LoRa chirps',
    chirpNote: 'Each symbol is one frequency sweep across the channel. The preamble is a run of identical up-chirps, then two sync words and 2¼ down-chirps, then your data: each data symbol starts its sweep at a different frequency, and that starting point carries {sf} bits. A higher spreading factor makes every sweep twice as long per step, which buys range and costs airtime. Playback slowed {x}×.',
    chirpAxis: ['frequency ±{bw} kHz', 'time · {ms} shown'], chirpParts: ['preamble', 'sync', 'data'],
    pktNote: 'Semtech SX126x time-on-air formula, explicit header, CRC on, 16-symbol preamble as Meshtastic uses. Header sizes are approximate. Link budget = +27 dBm (EU868 limit, 500 mW) minus receiver sensitivity for that bandwidth and spreading factor; antenna height, cables and terrain decide the real range.',
    sol: 'Solar autonomy',
    panel: 'Solar panel', cells: '18650 cells (3000 mAh)', load: 'Node profile', month: 'Month',
    loads: [['Client, power saving', 12], ['Client, screen + Bluetooth', 30], ['Rooftop router', 55]],
    sstats: ['Harvest per day', 'Use per day', 'Battery', 'Days with no sun'], balance: ['surplus', 'deficit'],
    year: 'Energy across a year', yearLegend: ['harvest per day', 'node use'],
    sim: 'Two weeks of {m} weather', reroll: 'New weather', simOk: 'The battery never ran empty.', simBad: 'The node was off for {h} hours. Add panel watts or a cell.',
    simLegend: ['battery charge', 'night'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    solNote: 'Sun-hours are rough monthly averages for about 49.7° N with 30 % system losses (charger, cell, dust, angle). Weather is randomised around the monthly average. Plan with these, then measure your own node with a USB power meter.',
  },
  cs: {
    eyebrow: 'laboratoř · běží ve vašem prohlížeči',
    title: 'Spočítejte si rádio a solár sami',
    lede: 'Napište zprávu a uvidíte, kolik bajtů zabere ve vzduchu, jak dlouho obsadí kanál a co každý preset Meshtasticu obětuje za dosah. Pak navrhněte solární napájení pro libovolný měsíc na Olze a sledujte, jak dva týdny počasí plní nebo vybíjejí baterii.',
    toc: ['Paket a vysílací čas', 'LoRa chirpy', 'Solární výdrž'],
    pkt: 'Paket a vysílací čas',
    msg: 'Vaše zpráva', msgDefault: 'Voda a nabíjení telefonů na radnici, 10–18. Vezměte si nádobu.',
    preset: 'Preset modemu', def: 'výchozí',
    bytes: '{n} B textu · {c} znaků', tooLong: 'O {n} B moc dlouhá. Zkraťte zprávu.', utf: 'Písmena jako ž, ł nebo ř zaberou 2 bajty, emoji 4.',
    seg: ['Hlavička sítě', 'Datová pole', 'Váš text', 'Volné'],
    stats: ['Vysílací čas', 'Doba symbolu', 'Linková rezerva', 'Výstrah za hodinu'], statSub: ['jedno vysílání', '2^SF / šířka pásma', 'citlivost {s} dBm', 'střída 10 %, EU868'],
    relays: 'Uzly, které ji přepošlou', flood: 'S {n} přeposílajícími uzly je kanál kvůli této jediné výstraze obsazen {t}.',
    compare: 'Stejná zpráva, všechny presety', compareCols: ['Preset', 'BW · SF · CR', 'Vysílací čas', 'Linková rezerva'],
    chirp: 'Co rádio skutečně vysílá: LoRa chirpy',
    chirpNote: 'Každý symbol je jeden frekvenční přeběh přes kanál. Preambule je řada stejných vzestupných chirpů, pak dvě synchronizační slova a 2¼ sestupného chirpu, pak vaše data: každý datový symbol začíná přeběh na jiné frekvenci a tento počáteční bod nese {sf} bitů. Vyšší spreading factor prodlouží každý přeběh na dvojnásobek za krok: získáte dosah, zaplatíte vysílacím časem. Přehrávání zpomaleno {x}×.',
    chirpAxis: ['frekvence ±{bw} kHz', 'čas · zobrazeno {ms}'], chirpParts: ['preambule', 'sync', 'data'],
    pktNote: 'Vzorec Semtech SX126x pro vysílací čas, explicitní hlavička, CRC zapnuto, 16symbolová preambule jako v Meshtasticu. Velikosti hlaviček jsou přibližné. Linková rezerva = +27 dBm (limit EU868, 500 mW) minus citlivost přijímače pro danou šířku pásma a spreading factor; skutečný dosah určí výška antény, kabely a terén.',
    sol: 'Solární výdrž',
    panel: 'Solární panel', cells: 'Články 18650 (3000 mAh)', load: 'Profil uzlu', month: 'Měsíc',
    loads: [['Klient, úsporný režim', 12], ['Klient, displej + Bluetooth', 30], ['Střešní router', 55]],
    sstats: ['Zisk za den', 'Spotřeba za den', 'Baterie', 'Dní bez slunce'], balance: ['přebytek', 'deficit'],
    year: 'Energie během roku', yearLegend: ['zisk za den', 'spotřeba uzlu'],
    sim: 'Dva týdny počasí: {m}', reroll: 'Jiné počasí', simOk: 'Baterie se nikdy nevybila.', simBad: 'Uzel byl {h} hodin vypnutý. Přidejte watty panelu nebo článek.',
    simLegend: ['nabití baterie', 'noc'],
    months: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
    solNote: 'Sluneční hodiny jsou hrubé měsíční průměry pro zhruba 49,7° s. š. se ztrátami systému 30 % (nabíječka, článek, prach, úhel). Počasí je náhodné kolem měsíčního průměru. Plánujte podle toho a pak změřte svůj uzel USB měřičem.',
  },
  pl: {
    eyebrow: 'laboratorium · działa w twojej przeglądarce',
    title: 'Policz radio i fotowoltaikę samodzielnie',
    lede: 'Wpisz wiadomość i zobacz, ile bajtów zajmie w eterze, jak długo zajmie kanał i co każdy preset Meshtastica poświęca dla zasięgu. Potem dobierz zasilanie słoneczne na dowolny miesiąc nad Olzą i zobacz, jak dwa tygodnie pogody ładują lub rozładowują akumulator.',
    toc: ['Pakiet i czas nadawania', 'Chirpy LoRa', 'Autonomia solarna'],
    pkt: 'Pakiet i czas nadawania',
    msg: 'Twoja wiadomość', msgDefault: 'Woda i ładowanie telefonów w ratuszu, 10–18. Weź pojemnik.',
    preset: 'Preset modemu', def: 'domyślny',
    bytes: '{n} B tekstu · {c} znaków', tooLong: 'Za długa o {n} B. Skróć wiadomość.', utf: 'Litery takie jak ż, ł czy ř zajmują 2 bajty, emoji 4.',
    seg: ['Nagłówek sieci', 'Pola danych', 'Twój tekst', 'Wolne'],
    stats: ['Czas nadawania', 'Czas symbolu', 'Budżet łącza', 'Alertów na godzinę'], statSub: ['jedna transmisja', '2^SF / szerokość pasma', 'czułość {s} dBm', 'cykl pracy 10 %, EU868'],
    relays: 'Węzły, które ją przekażą', flood: 'Przy {n} przekaźnikach kanał jest zajęty przez {t} dla tego jednego alertu.',
    compare: 'Ta sama wiadomość, każdy preset', compareCols: ['Preset', 'BW · SF · CR', 'Czas nadawania', 'Budżet łącza'],
    chirp: 'Co radio naprawdę nadaje: chirpy LoRa',
    chirpNote: 'Każdy symbol to jedno przemiatanie częstotliwości przez kanał. Preambuła to seria identycznych chirpów w górę, potem dwa słowa synchronizacji i 2¼ chirpu w dół, potem twoje dane: każdy symbol danych zaczyna przemiatanie od innej częstotliwości i ten punkt startowy niesie {sf} bitów. Wyższy spreading factor wydłuża każde przemiatanie dwukrotnie na krok: zyskujesz zasięg, płacisz czasem nadawania. Odtwarzanie spowolnione {x}×.',
    chirpAxis: ['częstotliwość ±{bw} kHz', 'czas · pokazano {ms}'], chirpParts: ['preambuła', 'sync', 'dane'],
    pktNote: 'Wzór Semtech SX126x na czas nadawania, jawny nagłówek, CRC włączone, 16-symbolowa preambuła jak w Meshtasticu. Rozmiary nagłówków są przybliżone. Budżet łącza = +27 dBm (limit EU868, 500 mW) minus czułość odbiornika dla danej szerokości pasma i spreading factor; rzeczywisty zasięg zależy od wysokości anteny, kabli i terenu.',
    sol: 'Autonomia solarna',
    panel: 'Panel słoneczny', cells: 'Ogniwa 18650 (3000 mAh)', load: 'Profil węzła', month: 'Miesiąc',
    loads: [['Klient, oszczędzanie energii', 12], ['Klient, ekran + Bluetooth', 30], ['Router na dachu', 55]],
    sstats: ['Uzysk na dzień', 'Zużycie na dzień', 'Akumulator', 'Dni bez słońca'], balance: ['nadwyżka', 'deficyt'],
    year: 'Energia w ciągu roku', yearLegend: ['uzysk na dzień', 'zużycie węzła'],
    sim: 'Dwa tygodnie pogody: {m}', reroll: 'Nowa pogoda', simOk: 'Akumulator ani razu się nie rozładował.', simBad: 'Węzeł był wyłączony przez {h} godzin. Dodaj waty panelu lub ogniwo.',
    simLegend: ['naładowanie akumulatora', 'noc'],
    months: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
    solNote: 'Godziny słoneczne to przybliżone średnie miesięczne dla ok. 49,7° N przy 30 % strat systemu (ładowarka, ogniwo, kurz, kąt). Pogoda jest losowana wokół średniej miesięcznej. Planuj z tymi liczbami, potem zmierz własny węzeł miernikiem USB.',
  },
};
export const labStrings = (lang) => STR[lang] || STR.en;

export function mountLab(root, lang) {
  const S = labStrings(lang);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const presetOpts = PRESETS.map(([n], i) => `<option value="${i}" ${n === 'LongFast' ? 'selected' : ''}>${n}${n === 'LongFast' ? ` (${S.def})` : ''}</option>`).join('');
  const thisMonth = new Date().getMonth();
  root.innerHTML = `
<p class="eyebrow" style="margin-top:48px">${S.eyebrow}</p>
<h2 id="lab">${S.title}</h2>
<p>${S.lede}</p>
<div class="toc"><a href="#/solar#packet">${S.toc[0]}</a><a href="#/solar#chirps">${S.toc[1]}</a><a href="#/solar#solar-lab">${S.toc[2]}</a></div>

<h2 id="packet">${S.pkt}</h2>
<div class="lab card">
  <div class="lab-in">
    <label class="lab-field lab-wide"><span>${S.msg}</span><textarea id="l-msg" rows="2" spellcheck="false">${esc(S.msgDefault)}</textarea><small id="l-bytes"></small></label>
    <label class="lab-field"><span>${S.preset}</span><select id="l-preset">${presetOpts}</select></label>
  </div>
  <div class="bytebar" id="l-bar" aria-hidden="true"></div>
  <div class="bytebar-legend" id="l-barleg"></div>
  <div class="lab-stats" id="l-stats"></div>
  <label class="lab-field lab-range"><span>${S.relays} <b id="l-relays-v">12</b></span><input type="range" id="l-relays" min="0" max="40" value="12"></label>
  <p class="lab-flood" id="l-flood"></p>
</div>

<h3>${S.compare}</h3>
<div class="tbl-wrap"><table class="tbl lab-cmp"><thead><tr>${S.compareCols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody id="l-cmp"></tbody></table></div>

<h2 id="chirps">${S.chirp}</h2>
<div class="chirp-box"><svg id="l-chirp" class="chirp" viewBox="0 0 1000 260" role="img" aria-label="${esc(S.chirp)}"></svg></div>
<p class="small" id="l-chirpnote"></p>
<p class="small">${S.pktNote}</p>

<h2 id="solar-lab">${S.sol}</h2>
<div class="lab card">
  <div class="lab-in lab-in4">
    <label class="lab-field"><span>${S.panel} <b id="s-panel-v"></b></span><input type="range" id="s-panel" min="1" max="10" step="0.5" value="3"></label>
    <label class="lab-field"><span>${S.cells} <b id="s-cells-v"></b></span><input type="range" id="s-cells" min="1" max="4" step="1" value="1"></label>
    <label class="lab-field"><span>${S.load}</span><select id="s-load">${S.loads.map(([n, ma], i) => `<option value="${i}" ${i === 1 ? 'selected' : ''}>${n} · ${ma} mA</option>`).join('')}</select></label>
    <label class="lab-field"><span>${S.month}</span><select id="s-month">${S.months.map((m, i) => `<option value="${i}" ${i === thisMonth ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
  </div>
  <div class="lab-stats" id="s-stats"></div>
  <h3>${S.year}</h3>
  <svg id="s-year" class="solar-year" viewBox="0 0 720 200" role="img" aria-label="${esc(S.year)}"></svg>
  <div class="sim-head"><h3 id="s-simtitle"></h3><button type="button" class="btn" id="s-reroll">↻ ${S.reroll}</button></div>
  <svg id="s-sim" class="solar-sim" viewBox="0 0 720 210" role="img"></svg>
  <p id="s-simres" class="lab-flood"></p>
</div>
<p class="small">${S.solNote}</p>`;

  const $ = (s) => root.querySelector(s);
  const msg = $('#l-msg'), presetSel = $('#l-preset'), relays = $('#l-relays');
  const stat = (v, l, sub, cls = '') => `<div class="${cls}"><b>${v}</b><span>${l}</span><small>${sub}</small></div>`;

  // ----- packet -----
  let chirpState = null;
  function updatePacket() {
    const text = msg.value;
    const len = new TextEncoder().encode(text).length;
    const df = dataFields(len);
    const pl = HEADER + df + len;
    const over = pl - MAX_PL;
    const [name, bw, sf, cr] = PRESETS[+presetSel.value];
    const a = airtime(Math.min(pl, MAX_PL), bw, sf, cr);
    const sens = sensitivity(bw, sf);
    const perHour = Math.floor((3600 * DUTY) / a.total);
    $('#l-bytes').innerHTML = over > 0 ? `<span class="bad">${f(S.tooLong, { n: over })}</span>` : `${f(S.bytes, { n: len, c: [...text].length })} · ${S.utf}`;
    const segs = [[HEADER, 'h'], [df, 'd'], [Math.min(len, MAX_PL - HEADER - df), 't'], [Math.max(0, MAX_PL - pl), 'f']];
    $('#l-bar').innerHTML = segs.map(([n, c]) => `<i class="seg-${c}${over > 0 && c === 't' ? ' over' : ''}" style="flex-grow:${n}"></i>`).join('');
    $('#l-barleg').innerHTML = segs.map(([n, c], i) => `<span><i class="seg-${c}"></i>${S.seg[i]} · ${n} B</span>`).join('') + `<span class="tot">${Math.min(pl, MAX_PL)}/${MAX_PL} B</span>`;
    $('#l-stats').innerHTML =
      stat(fmtMs(a.total), S.stats[0], S.statSub[0], 'hl') +
      stat(fmtMs(a.tsym), S.stats[1], S.statSub[1]) +
      stat(`${(TX_DBM - sens).toFixed(1)} dB`, S.stats[2], f(S.statSub[2], { s: sens.toFixed(1) })) +
      stat(perHour.toLocaleString(lang), S.stats[3], S.statSub[3]);
    const n = +relays.value;
    $('#l-relays-v').textContent = n;
    $('#l-flood').textContent = f(S.flood, { n, t: fmtMs(a.total * (n + 1)) });
    const all = PRESETS.map(([pn, pbw, psf, pcr]) => ({ pn, pbw, psf, pcr, t: airtime(Math.min(pl, MAX_PL), pbw, psf, pcr).total, lb: TX_DBM - sensitivity(pbw, psf) }));
    const maxT = Math.max(...all.map((x) => x.t));
    $('#l-cmp').innerHTML = all.map((x) => `<tr class="${x.pn === name ? 'sel' : ''}" data-i="${PRESETS.findIndex((p) => p[0] === x.pn)}"><td><b>${x.pn}</b></td><td><code>${x.pbw} · ${x.psf} · 4/${x.pcr}</code></td><td><div class="tbar"><i style="width:${(100 * x.t) / maxT}%"></i><span>${fmtMs(x.t)}</span></div></td><td>${x.lb.toFixed(1)} dB</td></tr>`).join('');
    drawChirp(text, bw, sf, a);
  }
  $('#l-cmp').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-i]');
    if (tr) { presetSel.value = tr.dataset.i; updatePacket(); }
  });

  // ----- chirp visualiser -----
  const SLOW = 40;
  let raf = 0;
  function drawChirp(text, bw, sf, a) {
    const svg = $('#l-chirp');
    const W = 1000, top = 34, bot = 214, L = 20, R = 990;
    const bytes = new TextEncoder().encode(text || ' ');
    const nPre = 8, nData = 12;
    const syms = [];
    for (let i = 0; i < nPre; i++) syms.push({ k: 0, w: 1, part: 0 });
    syms.push({ k: 8 / 128, w: 1, part: 1 }, { k: 16 / 128, w: 1, part: 1 });
    syms.push({ down: true, w: 1, part: 1 }, { down: true, w: 1, part: 1 }, { down: true, w: 0.25, part: 1 });
    let h = 2166136261;
    for (let i = 0; i < nData; i++) {
      h = Math.imul(h ^ bytes[i % bytes.length] ^ i, 16777619) >>> 0;
      syms.push({ k: (h % 2 ** sf) / 2 ** sf, w: 1, part: 2 });
    }
    const totalW = syms.reduce((s, x) => s + x.w, 0);
    const u = (R - L) / totalW;
    const y = (fr) => bot - fr * (bot - top);
    let d = '', x = L;
    const bounds = [];
    for (const s of syms) {
      const w = s.w * u;
      if (!bounds[s.part]) bounds[s.part] = [x, x];
      if (s.down) d += `M${x.toFixed(1)} ${top}L${(x + w).toFixed(1)} ${y(1 - s.w).toFixed(1)}`;
      else if (s.k === 0) d += `M${x.toFixed(1)} ${bot}L${(x + w).toFixed(1)} ${top}`;
      else {
        const xw = x + w * (1 - s.k);
        d += `M${x.toFixed(1)} ${y(s.k).toFixed(1)}L${xw.toFixed(1)} ${top}M${xw.toFixed(1)} ${bot}L${(x + w).toFixed(1)} ${y(s.k).toFixed(1)}`;
      }
      x += w;
      bounds[s.part][1] = x;
    }
    const shownS = totalW * a.tsym;
    const marks = bounds.map(([x1, x2], i) => `<path d="M${x1 + 2} 236H${x2 - 2}" class="ch-brace"/><text x="${(x1 + x2) / 2}" y="252" text-anchor="middle">${S.chirpParts[i]}</text>`).join('');
    svg.innerHTML = `<defs><clipPath id="ch-clip"><rect id="ch-play" x="0" y="0" width="0" height="260"/></clipPath></defs>
      <rect x="${L}" y="${top}" width="${R - L}" height="${bot - top}" class="ch-bg"/>
      <path d="M${L} ${(top + bot) / 2}H${R}" class="ch-mid"/>
      <text x="${L}" y="22">${f(S.chirpAxis[0], { bw: bw / 2 })}</text><text x="${R}" y="22" text-anchor="end">${f(S.chirpAxis[1], { ms: fmtMs(shownS) })} · ${fmtMs(a.tsym)}/sym</text>
      <path d="${d}" class="ch-dim"/><path d="${d}" class="ch-on" clip-path="url(#ch-clip)"/>
      <path id="ch-head" d="M0 ${top - 4}V${bot + 4}" class="ch-head"/>${marks}`;
    $('#l-chirpnote').textContent = f(S.chirpNote, { sf, x: SLOW });
    chirpState = { L, R, dur: shownS * SLOW * 1000, t0: performance.now() };
    const play = $('#ch-play'), head = $('#ch-head');
    cancelAnimationFrame(raf);
    if (reduce) { play.setAttribute('width', W); head.style.display = 'none'; return; }
    const tick = (now) => {
      const { L, R, dur, t0 } = chirpState;
      const p = ((now - t0) % (dur + 600)) / dur;
      const xx = L + Math.min(1, p) * (R - L);
      play.setAttribute('width', xx);
      head.setAttribute('transform', `translate(${xx} 0)`);
      head.style.opacity = p > 1 ? 0 : 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  // ----- solar -----
  let seed = 7;
  function updateSolar() {
    const W = +$('#s-panel').value, cells = +$('#s-cells').value, li = +$('#s-load').value, m = +$('#s-month').value;
    const ma = S.loads[li][1];
    const use = (ma / 1000) * V * 24;
    const cap = cells * CELL_WH;
    const harvest = (mm) => W * PSH[mm] * LOSS;
    $('#s-panel-v').textContent = `${W} W`;
    $('#s-cells-v').textContent = `× ${cells}`;
    const hv = harvest(m), bal = hv - use;
    $('#s-stats').innerHTML =
      stat(`${hv.toFixed(1)} Wh`, S.sstats[0], `${W} W × ${PSH[m]} h × ${LOSS}`, bal >= 0 ? 'good' : 'warn') +
      stat(`${use.toFixed(1)} Wh`, S.sstats[1], `${ma} mA × ${V} V × 24 h`) +
      stat(`${cap.toFixed(1)} Wh`, S.sstats[2], `${bal >= 0 ? '+' : ''}${bal.toFixed(1)} Wh/d ${bal >= 0 ? S.balance[0] : S.balance[1]}`) +
      stat((cap / use).toFixed(1), S.sstats[3], `${cap.toFixed(1)} ÷ ${use.toFixed(1)}`);

    // year chart
    const yr = $('#s-year');
    const vals = PSH.map((_, i) => harvest(i));
    const vmax = Math.max(...vals, use) * 1.12;
    const cw = 680 / 12, bx = 30, by = 170, bh = 150;
    const yy = (v) => by - (v / vmax) * bh;
    yr.innerHTML = vals.map((v, i) => `<g class="yb${i === m ? ' sel' : ''}${v < use ? ' short' : ''}" data-m="${i}"><rect x="${bx + i * cw}" y="${by - bh - 10}" width="${cw}" height="${bh + 40}" class="hit"/><rect x="${bx + i * cw + 8}" y="${yy(v)}" width="${cw - 16}" height="${by - yy(v)}" rx="4" class="bar"/><text x="${bx + i * cw + cw / 2}" y="${by + 18}" text-anchor="middle">${S.months[i].slice(0, 3)}</text><text x="${bx + i * cw + cw / 2}" y="${yy(v) - 5}" text-anchor="middle" class="v">${v.toFixed(1)}</text></g>`).join('') +
      `<path d="M${bx} ${yy(use)}H${bx + 680}" class="useline"/><path d="M${bx + 520} 10H${bx + 544}" class="useline"/><text x="${bx + 680}" y="14" text-anchor="end" class="uselbl">${S.yearLegend[1]} ${use.toFixed(1)} Wh</text><text x="${bx}" y="14" class="axis">Wh / ${S.yearLegend[0].split(' ').slice(-1)[0]}</text>`;

    // two-week simulation, hourly
    $('#s-simtitle').textContent = f(S.sim, { m: S.months[m] });
    const r = rng(seed * 101 + m);
    const days = 14, dl = DAYLEN[m], rise = 12 - dl / 2;
    const kinds = [['☀', 1.4], ['⛅', 0.85], ['☁', 0.25]];
    const mean = 0.35 * 1.4 + 0.35 * 0.85 + 0.3 * 0.25;
    let soc = cap * 0.6, off = 0;
    const pts = [], wx = [];
    for (let d = 0; d < days; d++) {
      const q = r();
      const k = q < 0.35 ? 0 : q < 0.7 ? 1 : 2;
      wx.push(kinds[k][0]);
      const dayE = (hv * kinds[k][1]) / mean;
      for (let hh = 0; hh < 24; hh++) {
        const t = hh + 0.5 - rise;
        const sun = t > 0 && t < dl ? (Math.PI / (2 * dl)) * Math.sin((Math.PI * t) / dl) * dayE : 0;
        soc += sun;
        if (soc > 0) soc -= use / 24;
        if (soc <= 0) { soc = 0; off++; }
        soc = Math.min(cap, soc);
        pts.push(soc / cap);
      }
    }
    const sx = (i) => 30 + (i / (days * 24)) * 680, sy = (v) => 180 - v * 150;
    let night = '';
    for (let d = 0; d < days; d++) {
      const a1 = d * 24, s1 = a1 + rise, s2 = s1 + dl;
      night += `<rect x="${sx(a1)}" y="30" width="${sx(s1) - sx(a1)}" height="150"/><rect x="${sx(s2)}" y="30" width="${sx(a1 + 24) - sx(s2)}" height="150"/>`;
    }
    const line = pts.map((v, i) => `${i ? 'L' : 'M'}${sx(i + 1).toFixed(1)} ${sy(v).toFixed(1)}`).join('');
    const sim = $('#s-sim');
    sim.setAttribute('aria-label', `${$('#s-simtitle').textContent}: ${wx.join(' ')}`);
    sim.innerHTML = `<g class="night">${night}</g>
      ${[0, 0.5, 1].map((v) => `<path d="M30 ${sy(v)}H710" class="grid"/><text x="24" y="${sy(v) + 4}" text-anchor="end" class="axis">${v * 100}%</text>`).join('')}
      <path d="${line}L${sx(pts.length)} 180L${sx(1)} 180Z" class="area"/><path d="${line}" class="soc${reduce ? '' : ' draw'}" pathLength="1"/>
      ${wx.map((w, d) => `<text x="${sx(d * 24 + 12)}" y="20" text-anchor="middle" class="wx">${w}</text><text x="${sx(d * 24 + 12)}" y="200" text-anchor="middle" class="axis">${d + 1}</text>`).join('')}
      ${pts.map((v, i) => (v === 0 ? `<rect x="${sx(i)}" y="176" width="${680 / (days * 24) + 0.4}" height="4" class="dead"/>` : '')).join('')}`;
    const res = $('#s-simres');
    res.className = `lab-flood ${off ? 'bad' : 'ok'}`;
    res.textContent = off ? f(S.simBad, { h: off }) : S.simOk;
  }
  $('#s-year').addEventListener('click', (e) => {
    const g = e.target.closest('[data-m]');
    if (g) { $('#s-month').value = g.dataset.m; updateSolar(); }
  });
  $('#s-reroll').addEventListener('click', () => { seed++; updateSolar(); });

  msg.addEventListener('input', updatePacket);
  presetSel.addEventListener('change', updatePacket);
  relays.addEventListener('input', updatePacket);
  ['#s-panel', '#s-cells', '#s-load', '#s-month'].forEach((s) => $(s).addEventListener('input', updateSolar));
  updatePacket();
  updateSolar();
  return () => cancelAnimationFrame(raf);
}
