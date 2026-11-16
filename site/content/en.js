const DISCLAIMER = `<p><b>Disclaimer:</b> this is an unofficial community build and documentation site. It is not affiliated with, endorsed by, or connected to the Meshtastic project. Use any firmware at your own risk. LoRa radio use is regulated: frequency bands, power limits and licensing rules vary by country. Check the rules for your location before transmitting, for example in the <a href="https://meshtastic.org/docs/" rel="noopener">official Meshtastic documentation</a>.</p>`;

export default {
  ui: {
    brand: 'Holdline',
    nav: { home: 'Home', demo: 'Blackout demo', hardware: 'Hardware', build: 'Build', solar: 'Solar', lab: 'Lab', openhw: 'Open hardware', access: 'Accessibility', form: 'Form', faq: 'Q&A', verify: 'Verify', security: 'Security', releases: 'Releases' },
    up: 'check upstream',
    copy: 'COPY', copied: 'COPIED',
    pinCols: ['Part', 'Signal', 'ESP32-S3 pin', 'What it does'],
    bomCols: ["Part", "Example", "Notes", "Where to buy"],
    shopNote: "Shop links are example search pages, not endorsements. Check stock, price and the 868 MHz version before ordering.",
    computeCols: ["Setup", "Hardware", "GPU / accelerator", "What it does", "Power"],
    board: {
      aria: "ESP32-S3-DevKitC-1 pin diagram with the GPIOs used by the e-paper display, the SX1262 radio, battery sensing and add-ons",
      sub: "DIY wiring · hover a group or a pin",
      v33: "3V3 → radio, e-paper",
      gnd: "GND (common)",
      groups: {
        epaper: ["E-paper display", "SPI + DC, RST, BUSY · GPIO2–7"],
        radio: ["SX1262 LoRa radio", "SPI + NRST, BUSY, DIO1 · GPIO8–14"],
        power: ["3.3 V supply", "from the LDO, never 5 V"],
        gnd: ["Ground", "shared by every module"],
        battery: ["Battery sense", "100k/100k divider · GPIO1"],
        addon: ["Accessibility add-ons", "I²C 17/18 · haptic 21 · band serial 15/16"],
        ui: ["BOOT button", "already on the board · GPIO0"],
      },
      note: "Pin order follows ESP32-S3-DevKitC-1 v1.1. Check the silkscreen of your board before soldering. Assembled nodes are already wired; this is for people who build or repair their own.",
    },
    demo: {
      translate: "Auto-translation", modes: ["None · original PL", "Recipients' languages", "All languages"],
      packets: "{n} B · {p} packets", autoTag: "auto",
      trNote: "Translated at the centre before sending: nodes have no internet in a blackout.",
      nodeScreen: "Node screen", nodeLang: "Display language", nodeHint: "Hover over or tap a node to see its screen.",
      langNames: { cs: "Čeština", pl: "Polski", en: "English" }, nodeOff: "switched off",
      who: "Crisis centre · Cieszyn", outgoing: "Outgoing alert", fits: "{n} B · fits in one packet",
      channelLine: "Channel OLZA · AES-256 · EU868", preset: "Preset LongFast · hop limit",
      routeCell: "SMS / cell broadcast", routeMesh: "Meshtastic mesh",
      mapLabel: "Map of Cieszyn and Český Těšín with mesh radio nodes on both sides of the Olza river",
      riverLabel: "Olza · border",
      legend: ["mesh node · got alert", "mesh node · not yet", "rooftop router", "cell tower"],
      replay: "Replay story", resend: "Resend via mesh", hopLimit: "Hop limit", speed: "Speed", speeds: ["Slow", "Normal", "Fast"],
      restore: "Restore all nodes", hint: "Click a node to knock it out, then resend.", base: "base station",
      statsLabel: "Delivery summary", stats: ["Cell network", "Mesh reached", "Max hops", "Transmissions", "Time to deliver"],
      nodes: { hq: "Crisis centre", hospital: "Hospital", roof: "Těšín roof" },
      tipHq: "Crisis centre base station (Cieszyn)", tipNode: "{name} ({c}) · {role} · click to switch off / on",
      router: "rooftop router", household: "household node",
      pills: { waiting: "waiting", sending: "sending", failed: "failed", delivered: "{r}/{t} delivered" },
      phases: { normal: "GRID NORMAL", blackout: "BLACKOUT · BOTH BANKS", drained: "TOWER BATTERIES DRAINED", cell: "ALERT VIA CELL NETWORK", mesh: "MESHTASTIC · MANAGED FLOODING", done: "ALERT DELIVERED OVER MESH" },
      log: {
        grid: "Grid normal · 3 cell sites on mains power",
        meshReady: "Mesh: {n} nodes on battery/solar, channel OLZA",
        lost: "Grid power lost in Cieszyn and Český Těšín",
        battery: "Cell sites switched to backup batteries",
        depleted: "{t}: battery depleted, site offline",
        sms: "SMS / cell broadcast → operator gateways",
        noCell: "No cell site reachable · 0 residents notified",
        switching: "Switching to the Meshtastic base station…",
        resend: "──── resend via mesh ────",
        translate: "Auto-translated {from} → {to}",
        tx: "TX alert id=0x4F1A · {b} B · {p} pkt · hop_limit={h} · ch OLZA",
        ack: "implicit ACK · heard {from} relay our packet",
        quiet: "{n}: heard {from} relay it first, stays quiet",
        rx: "{n} ({c}) rx hop {hop} · SNR {snr} dB · relay in {ms} ms",
        rxLimit: "{n} ({c}) rx hop {hop} · SNR {snr} dB · hop limit 0, not relayed",
        all: "Delivered to all {t} nodes · {tx} transmissions · {q} stayed quiet",
        missed: "Not reached: {list}", offCount: " ({n} switched off)",
        tip: "Tip: raise the hop limit or restore a router, then resend.",
      },
    },
    verify: {
      waiting: 'waiting for files: {n}/3',
      hash: 'SHA-256 of firmware matches manifest', sig: 'Signature', sigOk: 'valid for publisher key', sigBad: 'INVALID or missing',
      fp: 'Publisher key fingerprint', meta: 'Release', error: 'Could not verify',
      pass: 'PASS · authentic release', fail: 'FAIL · do not flash',
      compare: 'Compare the key fingerprints above with the ones published in a second channel (the GitHub README or a printed card). If they differ, do not trust a PASS.',
    },
    releases: { board: 'Board', commit: 'Upstream commit', built: 'Built at', algs: 'Signature algs', file: 'File', size: 'Size', verify: 'Verify this release', none: 'No releases yet.' },
    ask: { tooShort: 'Please write a bit more (at least 10 characters).', opened: 'A GitHub form opened in a new tab. Submit it there; your question will be translated and appear in the channel below.' },
    channel: { answered: 'answered', pending: 'waiting for answer', authority: 'Central authority', translatedFrom: 'translated from', empty: 'No questions published yet. Be the first to ask.' },
    form: {
      sent: 'Your e-mail app opened with the registration filled in. Press send there to deliver it to the central authority.',
      noInbox: '<b>The registration inbox is not configured yet.</b> Your answers are below (and copied to your clipboard if allowed). Keep them; you can send them as soon as the address is published in the channel.',
      copied: 'Copied to clipboard.',
    },
    footer: DISCLAIMER + `<p class="stamp">no cookies · no tracking · no third-party requests · verification runs locally in your browser · <a href="{{REPO}}">source on GitHub</a> · hardware CERN-OHL-S-2.0 · firmware GPL-3.0</p>`,
  },

  pages: {
    home: `
<section class="hero">
  <div>
    <p class="eyebrow">open hardware · off-grid · ESP32-S3 + E-Ink</p>
    <h1>A solar-powered mesh node you can build at home.</h1>
    <p class="lede">An open-hardware LoRa node running <a href="https://meshtastic.org" rel="noopener">Meshtastic</a> with an E-Ink screen. Every household receives one <b>fully assembled</b> from the state, so soldering is optional: the schematics are open for anyone who wants to build their own. You can also register for accessibility add-ons such as a Braille keyboard or a haptic skin band. Every firmware release can be verified in your browser before you flash it.</p>
    <div class="cta">
      <a class="btn primary" href="#/demo">See it work in a blackout →</a>
      <a class="btn" href="#/hardware#pins">Build it yourself</a>
      <a class="btn" href="#/faq">Q&amp;A and pinout</a>
      <a class="btn" href="#/access">Accessibility registration</a>
    </div>
  </div>
  {{DEVICE}}
</section>

<div class="grid">
  <div class="card"><div class="feature-icon">⌁</div><span class="num">01</span><h3>Off-grid mesh messaging</h3><p>Nodes form a decentralized LoRa mesh. Messages hop node to node without internet, SIM cards or a mobile network. Board support and channel settings: see the <a href="https://meshtastic.org/docs/" rel="noopener">official docs</a> {{UP}}.</p></div>
  <div class="card"><div class="feature-icon">▤</div><span class="num">02</span><h3>Low-power E-Ink display</h3><p>E-Ink keeps the last screen visible with zero power draw, so a battery node can show messages and node info for weeks. Pin configs are defined upstream in the <a href="https://github.com/meshtastic/firmware" rel="noopener">firmware repository</a>.</p></div>
  <div class="card"><div class="feature-icon">✓</div><span class="num">03</span><h3>Verifiable firmware</h3><p>Every release ships a manifest with SHA-256 hashes, signed with post-quantum <b>ML-DSA-65 (FIPS 204)</b> plus Ed25519. A valid signature proves the release is authentic from its publisher; it is not an endorsement by any authority.</p></div>
  <a class="card" href="#/solar"><div class="feature-icon">☀</div><span class="num">04</span><h3>Runs on sunlight</h3><p>Today's small solar panels easily power a node off-grid. A 2–6 W panel and one 18650 cell keep it running through nights and cloudy days. →</p></a>
  <a class="card" href="#/hardware#pins"><div class="feature-icon">⚒</div><span class="num">05</span><h3>Delivered assembled, open to build</h3><p>Your node arrives ready to use: plug in the solar panel and mount it. Schematics, pinout and parts list are open if you'd rather build your own. →</p></a>
  <a class="card" href="#/access"><div class="feature-icon">⠿</div><span class="num">06</span><h3>Accessible for deaf and blind people</h3><p>Register for add-ons such as a Braille keyboard or a haptic skin band. They are open source too, so you can also build them yourself. →</p></a>
</div>

<div class="cta"><a class="btn accent" href="#/verify">Verify a firmware file</a><a class="btn" href="#/build">Build the firmware yourself</a><a class="btn" href="#/solar#lab">Open the Lab: airtime &amp; solar calculators →</a></div>

<div class="two">
  <div>
    <h2>How trust works here</h2>
    <p>The <a href="#/verify">Verify page</a> checks the SHA-256 hash of your <code>.bin</code> against the manifest and verifies the manifest's ML-DSA-65 and Ed25519 signatures against the publisher public key, all locally in your browser. You then compare the shown key fingerprint with one published through a second channel (the GitHub repo or a printed card). Details on the <a href="#/security">Security page</a>.</p>
    <p>Upstream sources of truth: the <a href="https://github.com/meshtastic/firmware" rel="noopener">Meshtastic firmware repository</a> and <a href="https://meshtastic.org/docs/" rel="noopener">meshtastic.org</a>. Anything that could change upstream (board lists, build targets, flashing steps) is marked {{UP}}.</p>
  </div>
  <div>
    <h2>How questions work here</h2>
    <p>You can ask the <b>central authority</b> anything, in English, Czech or Polish. Each question is translated automatically into all three languages and published, together with the official answer, in a <b>read-only channel</b>.</p>
    <p>Users cannot message each other on this site; there are no comment threads. That keeps answers authoritative and the channel free of noise. <a href="#/faq#ask">Ask a question →</a></p>
  </div>
</div>`,


    demo: `
<p class="eyebrow">simulation · Cieszyn (PL) / Český Těšín (CZ)</p>
<h1>Blackout on the Olza</h1>
<p class="lede">The power is out on both banks of the river. Cell towers last a few hours on battery, then go silent. A crisis centre in Cieszyn needs to tell residents in both countries where to find water and charging. Watch the same alert fail over the phone network, then reach every household node through a Meshtastic mesh, hop by hop.</p>
<div id="sim"></div>

<div class="two">
  <div class="card"><h2>Why the phones go quiet</h2>
    <p>A cell tower needs grid power and a working backhaul link to the core network. Most sites carry batteries sized for a few hours. In a long regional blackout they drain one by one, and SMS or cell-broadcast alerts have nothing left to travel on.</p>
    <p>The border adds a second gap. Each country runs warnings over its own operators, so a resident of Český Těšín on a Czech SIM may never see an alert issued by a Polish authority a few hundred metres away, across the bridge.</p></div>
  <div class="card"><h2>Why the mesh keeps working</h2>
    <p>Meshtastic nodes are small LoRa radios that sip power: one 18650 cell and a palm-sized <a href="#/solar">solar panel</a> keep one running for days. They need no tower, no SIM and no operator. The E-Ink screen shows the alert even with no phone at all.</p>
    <p>Poland and Czechia share the same licence-free EU868 band, so nodes on both banks join one channel. The river is a border for networks, not for radio.</p></div>
</div>

<h2>How a message propagates</h2>
<ol class="steps">
  <li><h3>The centre transmits once</h3><p>Its rooftop node broadcasts the encrypted packet with a hop limit, 3 by default. Every node in radio range, typically 1–5 km in town and much further from a hill: with clear line of sight, Meshtastic links have spanned over 300 km. Here the centre's rooftop antenna reaches nám. ČSA across the river directly, in one hop.</p></li>
  <li><h3>Each node relays it once</h3><p>This is <i>managed flooding</i>. A node that receives a new packet waits a short moment and then rebroadcasts it with the hop limit lowered by one. At zero, it stops.</p></li>
  <li><h3>Far nodes go first</h3><p>The wait depends on signal strength: a weak signal means the node is far from the sender, so it waits less. That pushes the message outward fastest.</p></li>
  <li><h3>Duplicates are ignored</h3><p>Every packet has an ID. A node that has already seen it drops copies. A regular node that hears a neighbour relay the packet before its own turn stays quiet, which saves airtime. Routers on high points, like Góra Zamkowa here, always relay.</p></li>
  <li><h3>The sender knows it got out</h3><p>When the centre hears its own packet relayed, it counts that as an implicit acknowledgement.</p></li>
  <li><h3>Lose a node, keep the network</h3><p>Knock out a router on the map and resend. Even with Těšín roof and Góra Zamkowa both down, the centre still reaches nám. ČSA directly, and Dolní Žukov carries the alert on to the south. Nodes far from the centre depend on their neighbours, so a missing node can still cut someone off: try it.</p></li>
  <li><h3>Every screen in its owner's language</h3><p>Each node has its own display language: Czech, Polish or English. Hover over a node in the simulation and change it. The crisis centre writes the alert once and chooses how it is translated: original only, automatically into the languages its recipients use, or into all languages. Translation happens at the centre before sending, because nodes have no internet in a blackout. If a language was not sent, the node shows the original. More languages mean more bytes: past 233 B the alert is split into several packets.</p></li>
</ol>

<h2>Cell network vs mesh during a blackout</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Cell network</th><th>Meshtastic mesh</th></tr></thead><tbody>
<tr><td>Needs grid power</td><td>Yes, batteries last hours</td><td><b>No</b>, battery and solar for days</td></tr>
<tr><td>Central point of failure</td><td>Towers, backhaul, core network</td><td><b>None</b>, every node is a relay</td></tr>
<tr><td>Across the PL–CZ border</td><td>Separate operators and alert systems</td><td><b>One shared channel</b> on both banks</td></tr>
<tr><td>Capacity</td><td>Voice, data, video</td><td>Short text only, about 200 bytes per message, shared airtime</td></tr>
<tr><td>Preparation</td><td>Already in every pocket</td><td>Nodes must be placed, charged and on the channel before the blackout: that is why every household gets one <a href="#/hardware#pins">delivered assembled</a></td></tr>
</tbody></table></div>
<p class="small">The mesh does not replace sirens, radio broadcasts or door-to-door teams. It adds a channel that survives when the others are down. Deaf and deafblind residents receive the same alert as vibration through the <a href="#/access">haptic band</a>. This simulation simplifies radio range and timing and ignores packet collisions; node locations are illustrative.</p>`,
    hardware: `
<p class="eyebrow">open hardware</p>
<h1>Delivered assembled. Open, so you can build it yourself.</h1>
<p class="lede">Every household receives a node <b>fully assembled, flashed and tested</b> by the state. You don't need to solder anything. The schematics, pinout and parts list are open so that anyone who wants to can build, repair or improve one at home.</p>
<div class="toc"><a href="#/hardware#box">What arrives</a><a href="#/hardware#paths">Three ways to get a node</a><a href="#/hardware#boards">Supported boards</a><a href="#/hardware#pins">Which pin goes where</a><a href="#/hardware#bom">Parts and where to buy</a><a href="#/hardware#connect">Connect a self-built node</a><a href="#/hardware#sign">Sign language: parts</a><a href="#/form#build">Build it yourself: tell us</a></div>

<h2 id="box">What arrives in the box</h2>
<div class="two">
  <div>
    <ul>
      <li><b>The node, assembled</b> in a weatherproof IP65 case: board, LoRa radio, E-Ink screen, battery, charger and regulator, all wired, soldered, flashed with <a href="#/verify">verified firmware</a> and already set to region <code>EU_868</code> and the network channel.</li>
      <li><b>Antenna</b> (screw-on SMA).</li>
      <li><b>Solar panel</b> with a keyed plug-in lead that can't be connected the wrong way round.</li>
      <li><b>Mounting bracket</b> and a printed quick guide (Braille or large print on request).</li>
    </ul>
  </div>
  <ol class="steps">
    <li><h3>Screw on the antenna</h3><p>Before anything else.</p></li>
    <li><h3>Plug in the solar panel</h3><p>The only connection you make yourself. No tools.</p></li>
    <li><h3>Mount it high, panel facing south</h3><p>Window sill, balcony or roof. Height matters more than anything.</p></li>
    <li><h3>Press the button</h3><p>The screen shows <code>MESH · n nodes</code>. Done.</p></li>
  </ol>
</div>

<h2 id="paths">Three ways to get a node</h2>
<div class="grid">
  <div class="card"><span class="num">A · DEFAULT</span><h3>Delivered assembled</h3><p>You don't need to do anything: every registered address receives an assembled node automatically. Soldering is never required. Delivery dates are published in the <a href="#/faq#channel">read-only channel</a>.</p></div>
  <a class="card" href="#/form#build"><span class="num">B · OPTIONAL</span><h3>Build it yourself</h3><p>Want to solder your own? Tell us with the form below, so the state doesn't send you one. Parts kits are available through the group purchase. →</p></a>
  <a class="card" href="#/access"><span class="num">C</span><h3>Deaf, blind or deafblind</h3><p>Delivered assembled with the add-ons that fit you. Deafblind people get an in-person handover and set-up. →</p></a>
</div>

<h2 id="boards">ESP32-S3 boards with E-Ink displays</h2>
<p>This build targets ESP32-S3 boards that pair the MCU with an E-Ink (e-paper) display, so the node can show messages and telemetry while drawing almost no power. Prefer to wire your own? See the <a href="#/hardware#pins">open-hardware DIY build</a>.</p>
<div class="callout warn"><p><b>We do not invent specifications.</b> Display sizes, radio chips, pin mappings and the supported board list live upstream and change over time. Confirm every {{UP}} item against the <a href="https://github.com/meshtastic/firmware" rel="noopener">firmware repository</a> (board definitions, <code>platformio.ini</code>) and <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">meshtastic.org</a> before you buy or flash.</p></div>

<h3>Candidate boards</h3>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Board</th><th>Env hint</th><th>Display</th><th>LoRa radio</th><th>Status</th></tr></thead><tbody>
<tr><td><b>Heltec Wireless Paper</b></td><td><code>heltec-wireless-paper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate · reference board for this site</td></tr>
<tr><td><b>Heltec Vision Master E213</b></td><td><code>heltec-vision-master-e213</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate</td></tr>
<tr><td><b>Heltec Vision Master E290</b></td><td><code>heltec-vision-master-e290</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate</td></tr>
<tr><td><b>LilyGO T5 S3 E-Paper</b></td><td><code>lilygo-t5-s3-epaper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate</td></tr>
<tr><td><b>DIY: ESP32-S3-DevKitC-1 + SX1262 + e-paper</b></td><td><code>diy-s3-eink</code> (this repo)</td><td>2.13″ / 2.9″ SPI</td><td>SX1262 module</td><td>open hardware · <a href="#/hardware#pins">build guide</a></td></tr>
</tbody></table></div>

<h3 id="heltec-pins">Heltec Wireless Paper: which pin does what</h3>
<p>Everything is already wired on the PCB. This map helps with debugging, add-ons and understanding the variant file. Source: <code>variants/heltec_wireless_paper/variant.h</code> {{UP}}.</p>
{{PINS_HELTEC}}
<p class="small">Free GPIOs for add-ons (Braille keyboard, haptic band) depend on the board revision. Check the header pinout printed on your board and the variant file before connecting anything.</p>

<h3>How to confirm a board yourself</h3>
<ol>
  <li>Open the <a href="https://github.com/meshtastic/firmware" rel="noopener">firmware repo</a> and search <code>platformio.ini</code> for <code>[env:…]</code> names matching your board.</li>
  <li>Check the board's variant files in <code>variants/</code> for display and pin definitions.</li>
  <li>Cross-check with the <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">official hardware docs</a> for supported devices and regional frequency notes.</li>
</ol>

<h2 id="pins">Which pin goes where</h2>
<p>Only needed if you build or repair a node yourself. Assembled nodes are already wired exactly like this.</p>
{{BOARD}}
<p>Full tables: <a href="#/faq#wiring">Q&amp;A → wiring</a> · Heltec Wireless Paper (the board inside the delivered node): <a href="#/hardware#heltec-pins">Hardware → pins</a>.</p>

<h2 id="bom">Parts and where to buy</h2>
{{BOM}}
<p>Design files: <code>hardware/</code> and <code>variants/diy_s3_eink/</code> in <a href="{{REPO}}">the repository</a>. Hardware licence CERN-OHL-S-2.0, firmware GPL-3.0 (as upstream). Accessibility add-on parts: <a href="#/access#build">Accessibility → build it yourself</a>.</p>

<h2 id="sign">Sign-language screen: parts and where to buy</h2>
<p>For Deaf people whose first language is a sign language, the hub can show mesh messages <b>in sign language</b>. It runs on the same <b>NVIDIA Jetson Orin Nano</b> as the live captions, so if you already have the listening hub you only add a screen, a battery and a button. The system is normally off; when a message arrives, the band vibrates and you know to switch it on. How it works: <a href="#/access#sign">Accessibility → messages in sign language</a>.</p>
{{BOM_SIGN}}
<p class="small">Sign-language screen kits are part of the group purchase: tick <b>Sign-language screen</b> in the <a href="#/form#build">self-build form</a>. To get one assembled and set up by the state, use the <a href="#/form#adapted">accessibility registration</a>.</p>

<h2 id="connect">Connect a self-built node</h2>
<p class="small">Delivered nodes are already configured. These steps are only for nodes you built yourself.</p>
<ol class="steps">
  <li><h3>Set the region</h3><p>In the Meshtastic app or CLI set LoRa region <code>EU_868</code> for Czechia and Poland (other countries: check upstream).</p><pre><code>meshtastic --set lora.region EU_868</code></pre></li>
  <li><h3>Add the network channel</h3><p>The central authority publishes the channel URL / QR code in the <a href="#/faq#channel">read-only channel</a>.</p><pre><code>meshtastic --seturl "&lt;channel URL from the read-only channel&gt;"</code></pre></li>
  <li><h3>Check you're in</h3><p>Within minutes your node list should show neighbours. No neighbours? Raise the antenna, check the region, and read the <a href="#/faq">Q&amp;A</a>.</p></li>
</ol>

<h2 id="selfhost">Build it yourself: tell us</h2>
<p>Want to build your own node or add-ons? Tell us in the <a href="#/form#build">registration form</a>, so the state doesn't send you a node and can reserve parts kits for you.</p>`,

    build: `
<p class="eyebrow">build</p>
<h1>Build the firmware yourself</h1>
<p class="lede">Building from source is the strongest form of verification: you compile the exact upstream commit yourself instead of trusting any prebuilt binary. Exact environment names, targets and flashing steps change upstream, so specific values are marked {{UP}}.</p>
<ol class="steps">
  <li><h3>Install PlatformIO</h3><p>The build system the Meshtastic firmware uses. Install the CLI (or the VS Code extension) as described at <a href="https://platformio.org" rel="noopener">platformio.org</a> {{UP}}.</p><pre><code>pip install platformio</code></pre></li>
  <li><h3>Clone the Meshtastic firmware repository</h3><p>Note the commit you build from; compare it with <code>upstream_commit</code> in the release manifest.</p><pre><code>git clone https://github.com/meshtastic/firmware.git
cd firmware
git rev-parse HEAD   # must match upstream_commit in the manifest</code></pre></li>
  <li><h3>Choose the environment for your board</h3><p>Environments are <code>[env:…]</code> sections in <code>platformio.ini</code>. For the DIY board, copy <code>variants/diy_s3_eink</code> from <a href="{{REPO}}">this repo</a> into the firmware tree first. Confirm the exact <code>&lt;env-name&gt;</code> {{UP}}.</p><pre><code>pio project config | grep "env:"   # or browse platformio.ini</code></pre></li>
  <li><h3>Build</h3><pre><code>pio run -e &lt;env-name&gt;</code></pre></li>
  <li><h3>Flash</h3><p>Flash over USB with PlatformIO, or use the official web flasher at <a href="https://flasher.meshtastic.org" rel="noopener">flasher.meshtastic.org</a> {{UP}}. <b>Attach the antenna first.</b></p><pre><code>pio run -e &lt;env-name&gt; --target upload</code></pre></li>
  <li><h3>Verify what you built or downloaded</h3><p>For a prebuilt <code>.bin</code>, use the <a href="#/verify">Verify page</a>. If you built from source, compare your binary's hash with the manifest hash for the same upstream commit.</p></li>
</ol>
<h2>Where the truth lives</h2>
<ul>
  <li>Source and build environments: <a href="https://github.com/meshtastic/firmware" rel="noopener">github.com/meshtastic/firmware</a> {{UP}}</li>
  <li>Documentation: <a href="https://meshtastic.org/docs/" rel="noopener">meshtastic.org/docs</a> {{UP}}</li>
  <li>Web flasher: <a href="https://flasher.meshtastic.org" rel="noopener">flasher.meshtastic.org</a> {{UP}}</li>
</ul>`,

    solar: `
<p class="eyebrow">off-grid power</p>
<h1>Today's solar panels run a node fully off-grid</h1>
<p class="lede">A mesh node needs very little energy. Modern monocrystalline panels are efficient, cheap and still produce useful power under clouds, so a small panel plus one Li-ion cell keeps a node running day and night with no grid connection at all.</p>

<div class="grid">
  <div class="card"><div class="feature-icon">⚡</div><h3>Tiny consumption</h3><p>An ESP32-S3 + SX1262 node mostly sleeps or listens. E-Ink only draws power while the image changes. A typical average is a few tens of milliamps, often less with power saving enabled.</p></div>
  <div class="card"><div class="feature-icon">☀</div><h3>Efficient panels</h3><p>Today's mono panels convert around 20 % of sunlight. Even a palm-sized 2 W panel produces more energy on an average day than a node uses.</p></div>
  <div class="card"><div class="feature-icon">🔋</div><h3>Battery buffer</h3><p>One 18650 cell (≈ 11 Wh) covers several days without sun. Add a second cell in parallel for winter or for router nodes.</p></div>
</div>

<h2>Sizing example (estimate, measure your own node)</h2>
<div class="math">Node average: 30 mA × 3.7 V ≈ 0.11 W → ≈ 2.7 Wh per day<br>
Battery: 1 × 18650, 3000 mAh × 3.7 V ≈ 11 Wh → ≈ 4 days without any sun<br>
Summer, 2 W panel: 2 W × 3 sun-hours × 0.7 losses ≈ 4.2 Wh per day ✓<br>
Central-European winter (≈ 1 sun-hour): use a 5–6 W panel and 2 cells ✓</div>
<div class="callout"><p><b>Try your own numbers:</b> the <a href="#/solar#solar-lab">solar calculator in the Lab</a> sizes a panel and battery for any month and simulates two weeks of weather.</p></div>
<p class="small">Numbers are rough planning values, not measurements of a specific board. Real draw depends on role (client or router), screen refreshes, Bluetooth, GPS and transmit power. Measure with a USB power meter before you size the system.</p>

<h2>Power chain</h2>
{{POWER_CHAIN}}
<p>Full wiring with pin numbers: <a href="#/faq#wiring">Q&amp;A → which pin goes where</a>.</p>

<h2>Practical tips</h2>
<ul>
  <li>Point the panel south (northern hemisphere), tilted around 45–60° for winter performance. Steeper sheds snow.</li>
  <li><b>Li-ion must not be charged below 0 °C.</b> For frost, use a charger with temperature cutoff or a LiFePO4 cell with a matching charger.</li>
  <li>Use a waterproof IP65 box, a breathable vent and an outdoor antenna mounted as high as possible: height matters more than power.</li>
  <li>Enable the firmware's power-saving options for solar clients {{UP}}.</li>
</ul>`,


    access: `
<p class="eyebrow">accessibility</p>
<h1>Mesh messaging for deaf, blind and deafblind people</h1>
<p class="lede">Every node arrives assembled. If you are deaf, blind or deafblind, the state supplies it with the add-ons that fit you, set up and tested. Deafblind people receive theirs <b>in person</b>, from an instructor who communicates the way they do.</p>
<div class="toc"><a href="#/access#who">Who gets what</a><a href="#/access#deafblind">How it works for deafblind people</a><a href="#/access#build">Haptic band Pro: build it yourself</a><a href="#/access#sign">Messages in sign language</a><a href="#/access#compute">Which computer or GPU</a><a href="#/form#adapted">Registration</a></div>

<h2 id="who">Who gets what</h2>
<div class="grid">
  <div class="card"><div class="feature-icon">⠿</div><h3>Blind or partially sighted</h3>
    <ul><li><b>Braille keyboard</b> (6- or 8-dot, chorded) that types straight into the node.</li><li>Messages read aloud by your phone's screen reader through the Meshtastic app {{UP}}.</li><li>Tactile markings on the case and buttons; quick guide in Braille and as audio.</li></ul>
    <p class="small">Delivery: courier, plus a phone walkthrough if you want one.</p></div>
  <div class="card"><div class="feature-icon">≋</div><h3>Deaf or hard of hearing</h3>
    <ul><li><b>Haptic band Pro</b>, supplied by the state: 8 motors around the wrist.</li><li>Recognises important sounds on the band itself (siren, smoke alarm, doorbell, knock, your name) and gives each its own vibration pattern.</li><li>Mesh messages vibrate and appear on the E-Ink screen.</li><li>Optional <b>listening hub</b>: live captions of speech in the room on the E-Ink and your phone.</li><li><b>Sign-language screen</b> for the hub: messages and alerts in Czech or Polish Sign Language. <a href="#/access#sign">How it works →</a></li></ul>
    <p class="small">Delivery: courier, with a set-up video in Czech or Polish sign language and as text.</p></div>
  <div class="card"><div class="feature-icon">✋</div><h3>Deafblind</h3>
    <ul><li><b>Haptic band Pro in Braille layout</b>: 6 motors on the forearm form one Braille cell, 2 more signal space and alerts. Messages are felt letter by letter.</li><li><b>Braille keyboard</b> to reply; every key is confirmed by vibration.</li><li>Nothing depends on sight or sound.</li></ul>
    <p class="small">Delivery: <b>in person</b>, see below.</p></div>
</div>

<h2 id="deafblind">How it works for deafblind people</h2>
<div class="two">
  <div>
    <h3>Delivery and set-up</h3>
    <ul>
      <li>No letters or calls to arrange it: we contact you through the channel you name in the form, usually a carer, an interpreter or your organisation.</li>
      <li>A trained instructor visits and communicates the way you prefer: tactile sign language, Lorm, print-on-palm or Braille.</li>
      <li>Together you set vibration strength and reading speed, practise the patterns, and mount the node. The case has tactile markings and a keyed solar plug.</li>
      <li>A trusted contact can be paired to receive your SOS. A follow-up visit after a few weeks.</li>
    </ul>
  </div>
  <ol class="steps">
    <li><h3>A message arrives</h3><p>The node passes it to the band. All motors give two long pulses: attention.</p></li>
    <li><h3>You start reading</h3><p>Tap the band. Letters play as Braille cells on the 2 × 3 motors, 1–4 per second as you set. Tap to pause, double-tap to repeat.</p></li>
    <li><h3>You reply</h3><p>Type on the Braille keyboard; each character is echoed as vibration. Enter sends it over the mesh.</p></li>
    <li><h3>Alerts can't be missed</h3><p>Warnings from the central authority use a strong repeating pattern that keeps going until you hold a key to confirm.</p></li>
    <li><h3>SOS</h3><p>Hold two keys for 3 seconds: an SOS goes to your trusted contacts and the central authority.</p></li>
  </ol>
</div>

<h2 id="build">Haptic band Pro: what it is, so you can build it yourself</h2>
<p>The state supplies the band, but it is open hardware like everything else. It is an ESP32-S3 with a microphone driving 8 linear resonant actuators (LRA) through haptic driver chips. It works with <b>standard Meshtastic</b>: received messages reach the band through the Serial module in <code>TEXTMSG</code> mode, and a simple single-motor band can use the External Notification module instead {{UP}}. No firmware fork needed.</p>
<div class="two">
  <div><h3>Wiring</h3><ul>
    <li>XIAO <code>D4/SDA</code>, <code>D5/SCL</code> → TCA9548A I²C mux → 8 × DRV2605L (one per mux channel) → 8 × LRA.</li>
    <li>XIAO <code>D6/TX</code> → node GPIO16, XIAO <code>D7/RX</code> ← node GPIO15, common GND. Or wireless over BLE.</li>
    <li>Wrist layout (deaf): 8 motors in a ring, so a sound can also show its direction. Braille layout (deafblind): 2 × 3 cell on the forearm + 2 control motors.</li>
    <li>1S LiPo 500–1000 mAh on the XIAO battery pads.</li>
  </ul></div>
  <div><h3>Node pins for add-ons</h3>{{PINS_ADDONS}}</div>
</div>
{{BOM_ADDONS}}
<div class="callout warn"><p><b>Status: reference design.</b> The band firmware and enclosure files will be published in <code>hardware/addons/</code> in the repository. Motors draw current spikes: power them from the battery through the drivers, never from a GPIO. Rounded, insulated housing; no continuous vibration longer than a few seconds.</p></div>

<h2 id="sign">Messages in sign language</h2>
<p>Written Czech or Polish isn't every Deaf person's first language. So the hub can show messages in <b>sign language</b>: Czech Sign Language (ČZJ), Polish Sign Language (PJM) or International Sign. It runs on the same NVIDIA Jetson Orin Nano as the listening hub, fully offline, on a 10″ screen.</p>
<div class="two">
  <ol class="steps">
    <li><h3>A message arrives</h3><p>The node passes it to the band. The band stores it and vibrates the <b>“sign language”</b> pattern: three waves running around the wrist. The text also appears on the E-Ink.</p></li>
    <li><h3>Switch the system on</h3><p>Press the big button on the screen stand. The Jetson boots in about a minute and pulls any messages that arrived while it was off from the band over BLE.</p></li>
    <li><h3>The message in sign language</h3><p>The screen plays the message in your sign language with captions. Tap = replay, hold = slower.</p></li>
    <li><h3>The system switches off again</h3><p>After 10 minutes without a touch the hub shuts down to save the battery. The band keeps watching the mesh and the sounds in the room.</p></li>
  </ol>
  <div>
    <h3>What you see in sign language</h3>
    <ul>
      <li><b>Central-authority alerts</b> (flood, evacuation, shelter, drinking water, power outage, all clear…): pre-recorded videos made by Deaf native signers together with Deaf organisations. Each alert carries a template code; place and time are added as text and fingerspelling.</li>
      <li><b>Other messages</b> are shown as large, readable text. Machine translation of free text into sign language isn't reliable enough yet to use for alerts.</li>
      <li>The central authority updates the video library through a <a href="#/verify">signed release</a>, just like the firmware.</li>
      <li>You choose the language in the <a href="#/form#adapted">registration</a>.</li>
    </ul>
  </div>
</div>
<div class="callout warn"><p><b>Status: reference design.</b> No video gets made without Deaf native signers; an avatar does not replace them. Alerts on the band and the E-Ink always arrive, even if you never switch the system on. Parts and where to buy: <a href="#/hardware#sign">Open hardware → sign language</a>.</p></div>

<h2 id="compute">Which computer or GPU runs it</h2>
<p>Sound recognition runs on the band itself, without a GPU, so it keeps working in a blackout. Turning speech into text needs more compute: that's the optional listening hub. The state-supplied hub is a Jetson Orin Nano; the table shows what else is enough if you build your own.</p>
{{COMPUTE}}
<p class="small">Rough planning values. Speech-to-text: <a href="https://github.com/ggml-org/whisper.cpp" rel="noopener">whisper.cpp</a> or <a href="https://github.com/SYSTRAN/faster-whisper" rel="noopener">faster-whisper</a>, both open source and running fully offline. The hub needs mains power or a large battery; during a blackout the band alone still delivers mesh messages and sound alerts.</p>

<div class="callout"><p><b>Prefer to build it yourself?</b> Use the <a href="#/form#build">self-build form</a>; parts kits are in the group purchase.</p></div>

<h2 id="register">Registration form</h2>
<p>Register for an adapted node with add-ons in the <a href="#/form#adapted">registration form</a>. There is one form for everything, and your data goes privately to the central authority only.</p>`,

    form: `
<p class="eyebrow">registration</p>
<h1>Registration form</h1>
<p class="lede">Every household receives a standard node, assembled, without filling in anything. Use this one form only if you need an adapted version because of a disability, or if you want to build your own node. Your data goes privately to the central authority and is never published.</p>
<div class="callout" id="adapted"><p><b>Have a disability? Ask for an adapted version.</b> The state delivers your node assembled, with the add-ons you need already connected and set up:</p>
<ul><li>Braille keyboard</li><li>Haptic band Pro</li><li>Listening hub (speech-to-text)</li><li>Sign-language screen (messages in sign language)</li><li>Tactile markings on the case and buttons, quick guide in Braille or as audio</li></ul>
<p class="small">What each add-on does: <a href="#/access">Accessibility</a>.</p></div>
<div class="card">
<form class="f reg" data-kind="registration">
  <div class="row2">
    <label><span class="lbl">Full name</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">Preferred language</span><select name="lang"><option>English</option><option>Čeština</option><option>Polski</option></select></label>
  </div>
  <div class="row2">
    <label><span class="lbl">E-mail</span><input type="email" name="email" autocomplete="email"></label>
    <label><span class="lbl">Phone (for SMS)</span><input type="tel" name="phone" autocomplete="tel"></label>
  </div>
  <div class="row2">
    <label><span class="lbl">Country</span><select name="country"><option>Czechia</option><option>Poland</option><option>Slovakia</option><option>Other</option></select></label>
    <label><span class="lbl">City / region</span><input type="text" name="region"></label>
  </div>
  <label><span class="lbl">Delivery address</span><textarea name="address" rows="3" autocomplete="street-address" required></textarea></label>
  <label><span class="lbl">How should we contact you?</span><select name="contact"><option>E-mail</option><option>SMS / text message</option><option>Through a carer, interpreter or assistant</option><option>Through my organisation for deaf, blind or deafblind people</option><option>Letter in Braille</option></select></label>
  <label><span class="lbl">What do you need?</span><select name="request"><option>Adapted version: assembled node with add-ons (disability)</option><option>Don't deliver one: I'll build my own</option><option>Deliver it anyway: I'm building an extra node</option></select></label>
  <h3 id="adapted-version">Adapted version: only if you have a disability</h3>
  <fieldset><legend>I am</legend>
    <label class="check"><input type="checkbox" name="deaf"> Deaf or hard of hearing</label>
    <label class="check"><input type="checkbox" name="blind"> Blind or partially sighted</label>
    <label class="check"><input type="checkbox" name="deafblind"> Deafblind</label>
  </fieldset>
  <fieldset><legend>Add-ons I need</legend>
    <label class="check"><input type="checkbox" name="braille"> Braille keyboard</label>
    <label class="check"><input type="checkbox" name="haptic"> Haptic band Pro</label>
    <label class="check"><input type="checkbox" name="hub"> Listening hub (speech-to-text)</label>
    <label class="check"><input type="checkbox" name="sign"> Sign-language screen (messages in sign language)</label>
    <label class="check"><input type="checkbox" name="tactile_marks"> Tactile markings and a quick guide in Braille or as audio</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Band layout</span><select name="band_layout"><option>Wrist ring (deaf)</option><option>Braille cell on the forearm (deafblind)</option><option>Not sure, decide at set-up</option></select></label>
    <label><span class="lbl">Braille layout</span><select name="braille_layout"><option>6-dot</option><option>8-dot</option><option>Not sure</option></select></label>
  </div>
  <label><span class="lbl">Sign language on the screen</span><select name="sign_lang"><option>Not applicable</option><option>Czech Sign Language (ČZJ)</option><option>Polish Sign Language (PJM)</option><option>International Sign</option></select></label>
  <label><span class="lbl">Deafblind: how should the instructor communicate with you?</span><select name="tactile"><option>Not applicable</option><option>Tactile sign language</option><option>Lorm</option><option>Print-on-palm</option><option>Braille</option><option>Through my interpreter or carer</option></select></label>
  <label><span class="lbl">Carer, interpreter or trusted contact (optional)</span><input type="text" name="trusted"></label>
  <h3 id="build">Build it yourself: only if you build</h3>
  <fieldset><legend>What will you build?</legend>
    <label class="check"><input type="checkbox" name="build_node" checked> Mesh node (ESP32-S3 + E-Ink + solar)</label>
    <label class="check"><input type="checkbox" name="build_braille"> Braille keyboard add-on</label>
    <label class="check"><input type="checkbox" name="build_haptic"> Haptic band Pro</label>
    <label class="check"><input type="checkbox" name="build_hub"> Listening hub (speech-to-text)</label>
    <label class="check"><input type="checkbox" name="build_sign"> Sign-language screen (messages in sign language)</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Join the group purchase?</span><select name="groupbuy"><option value="yes">Yes, reserve parts kits for me</option><option value="no">No, I'll buy the parts myself</option></select></label>
    <label><span class="lbl">Number of kits</span><input type="number" name="qty" min="1" max="50" value="1"></label>
  </div>
  <label><span class="lbl">Experience</span><select name="experience"><option>First electronics project</option><option>I can solder and flash boards</option><option>Experienced maker</option></select></label>
  <label><span class="lbl">Anything else we should know?</span><textarea name="notes" rows="3"></textarea></label>
  <label class="check"><input type="checkbox" name="consent" required> I agree that the central authority processes this data to supply my node and add-ons, adjust or cancel my delivery and organise the group purchase.</label>
  <button class="btn primary" type="submit">Send registration</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    faq: `
<p class="eyebrow">questions &amp; answers</p>
<h1>Q&amp;A: technical questions</h1>
<p class="lede">How to put it together, which pin is for what, and how to get on the network. Can't find your answer? <a href="#/faq#ask">Ask the central authority</a>; the answer is published in all three languages in the read-only channel.</p>
<div class="toc"><a href="#/faq#assembly">Assembly</a><a href="#/faq#wiring">Which pin goes where</a><a href="#/faq#ask">Ask a question</a><a href="#/faq#channel">Read-only channel</a></div>

<h2 id="assembly">When your node arrives</h2>
<details class="qa" open><summary>What do I have to do when the node arrives?</summary><div>
<p>Almost nothing. It arrives <b>assembled, soldered, flashed and configured</b>.</p>
<ol>
  <li>Screw on the antenna. Always before the node gets power.</li>
  <li>Plug in the solar panel (keyed connector, can't go in the wrong way).</li>
  <li>Mount it as high as you can, panel facing south.</li>
  <li>Press the button. The screen shows <code>MESH · n nodes</code>.</li>
</ol></div></details>
<details class="qa"><summary>Do I need to solder?</summary><div><p><b>No.</b> Every node is delivered fully assembled. Soldering is only for people who choose to build their own; that's why the schematics and pinout are published. If you want to, tell us with the <a href="#/form#build">self-build form</a> so the state doesn't send you one.</p></div></details>
<details class="qa"><summary>I want to build my own. How do I assemble it, step by step?</summary><div>
<ol>
  <li><b>Test on the bench first.</b> Plug the DevKitC into USB, flash the firmware (see <a href="#/build">Build</a>) and confirm the board boots before wiring anything else.</li>
  <li><b>Antenna on the radio module.</b> Always connect the antenna before the radio gets power. Transmitting without one can destroy the SX1262.</li>
  <li><b>Wire the radio</b> (SPI + BUSY, DIO1, RESET) using the <a href="#/faq#wiring">diagram below</a>. Keep wires short, under 10 cm.</li>
  <li><b>Wire the e-paper module</b> (SPI + DC, RST, BUSY). It shares 3V3 and GND.</li>
  <li><b>Flash the DIY variant</b> and check the screen draws and the radio initialises (serial log at 115200 baud).</li>
  <li><b>Add power:</b> panel → charger → battery → 3.3 V regulator → 3V3 pin. Add the 100k/100k battery divider to GPIO1.</li>
  <li><b>Box it:</b> IP65 enclosure, cable gland for the panel lead, antenna outside, mounted as high as possible.</li>
</ol>
<p>Parts and where to buy them: <a href="#/hardware#bom">Open hardware → parts</a>.</p></div></details>
<details class="qa"><summary>Can I use an SX1276 / RFM95 radio instead of the SX1262?</summary><div><p>Meshtastic supports several radios, but the pin set differs (DIO0 instead of BUSY/DIO1) and the variant file must be changed. SX1262 is recommended for lower power and better sensitivity. Check radio support upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Which frequency do I use in Czechia and Poland?</summary><div><p>The EU 868 MHz band, region <code>EU_868</code> in Meshtastic. Delivered nodes are already set. If you build your own, buy the 868 MHz version of the radio and antenna. Other countries: check your local rules and the upstream region list {{UP}}.</p></div></details>
<details class="qa"><summary>The screen stays blank. What now?</summary><div><p>Delivered node: check the solar plug and that the battery has charged in daylight for a few hours, then ask in the <a href="#/faq#ask">Q&amp;A</a>. Self-built: check BUSY and RST wiring, make sure the display model in the variant matches your panel (2.13″ and 2.9″ use different drivers), and verify 3.3 V on the module. On Heltec boards the display is powered through Vext (GPIO45, LOW = on).</p></div></details>
<details class="qa"><summary>How do I connect my node to the network?</summary><div><p>Delivered nodes are already connected. Self-built: set the region, then apply the channel URL published in the read-only channel. Step by step: <a href="#/hardware#connect">Open hardware → Connect</a>.</p></div></details>
<details class="qa"><summary>How do I know the firmware is genuine?</summary><div><p>Use the <a href="#/verify">Verify page</a>: it checks the SHA-256 hash and the ML-DSA-65 + Ed25519 signatures in your browser, then compare the key fingerprint with the one in the GitHub README.</p></div></details>
<details class="qa"><summary>Can I connect a Braille keyboard or a haptic band myself?</summary><div><p>Yes. Both add-ons are open hardware: the keyboard uses I²C on GPIO17/18, the haptic band Pro uses the serial module on GPIO15/16. See <a href="#/access#build">Accessibility → build it yourself</a>.</p></div></details>
<details class="qa"><summary>What does the mesh do in a blackout?</summary><div><p>It keeps delivering messages when cell towers go silent. See it in the <a href="#/demo">blackout demo</a>.</p></div></details>
<details class="qa"><summary>Can I chat with other users here?</summary><div><p>No. On this site you can only ask the central authority. Questions and official answers appear in the read-only channel; there are no replies or comments between users.</p></div></details>

<h2 id="wiring">Which pin goes where (DIY build)</h2>
<p>ESP32-S3-DevKitC-1 to SX1262 module and SPI e-paper module. GPIO numbers match the Heltec Wireless Paper layout, so the variant stays familiar. The matching firmware definition is in <code>variants/diy_s3_eink/variant.h</code> in the repo.</p>
{{BOARD}}
{{PINS_DIY}}
<div class="callout warn"><p><b>Before you power up:</b> antenna attached · radio and display on <b>3.3 V</b>, never 5 V · double-check that GND is shared · don't feed the 3V3 pin from the regulator while USB is plugged in unless your board has protection (disconnect the battery when flashing).</p></div>
<h3>Power wiring</h3>
{{POWER_CHAIN}}
<p>Heltec Wireless Paper pinout: <a href="#/hardware#heltec-pins">Hardware → pins</a>.</p>

<h2 id="ask">Ask the central authority</h2>
<div class="two">
  <div>
    <p>Write your question in English, Czech or Polish. When you submit, a pre-filled GitHub form opens; send it there (free GitHub account needed).</p>
    <ul>
      <li>Your question is <b>translated automatically</b> into EN, CS and PL.</li>
      <li>It is posted to the <b>read-only channel</b> below, and the official answer is added when it's ready.</li>
      <li>Only the central authority answers. The thread is locked, so <b>users cannot reply to each other</b>.</li>
      <li>Questions are public: <b>don't include personal data</b>. For personal matters use the <a href="#/access">registration form</a>.</li>
    </ul>
  </div>
  <div class="card">
    <form class="f" id="ask-form">
      <label><span class="lbl">Short title</span><input type="text" name="title" maxlength="80" placeholder="e.g. Display stays blank after flashing"></label>
      <label><span class="lbl">Topic</span><select name="topic"><option>Assembly / wiring</option><option>Firmware / flashing</option><option>Solar / power</option><option>Network / connecting</option><option>Accessibility add-ons</option><option>Group purchase</option><option>Other</option></select></label>
      <label><span class="lbl">Your question</span><textarea name="question" required></textarea></label>
      <button class="btn primary" type="submit">Ask the central authority →</button>
      <div class="form-msg" id="ask-msg" aria-live="polite"></div>
    </form>
  </div>
</div>

<h2 id="channel" class="channel-head">Read-only channel <span class="lock">🔒 read-only</span></h2>
<p class="small">Questions and official answers, automatically translated. Nobody can post here except the central authority.</p>
<div class="channel" id="channel"><p class="empty">…</p></div>`,

    verify: `
<p class="eyebrow">verify</p>
<h1>Verify a firmware build</h1>
<p class="lede">Drop the three release files below. Everything is checked locally in your browser with WebCrypto and a bundled post-quantum library. No file is ever uploaded.</p>
<p>Releases are signed with NIST-standardized post-quantum cryptography (<b>ML-DSA-65, FIPS 204</b>), plus <b>Ed25519</b> as a hybrid fallback. A valid signature means the release really comes from the publisher of this site. It proves authenticity, <b>not</b> endorsement by any government or other authority.</p>
<div class="drops">
  <label class="drop" data-kind="bin"><b>firmware.bin</b><span class="small">the binary you want to flash</span><span class="fname">drop file or click</span><input type="file" accept=".bin,application/octet-stream"></label>
  <label class="drop" data-kind="manifest"><b>manifest.json</b><span class="small">lists the file hash</span><span class="fname">drop file or click</span><input type="file" accept=".json,application/json"></label>
  <label class="drop" data-kind="sig"><b>manifest.sig</b><span class="small">{ "ML-DSA-65": "…", "Ed25519": "…" }</span><span class="fname">drop file or click</span><input type="file"></label>
</div>
<div class="cta" style="margin-top:0"><button class="btn" id="v-demo" type="button">Try with the demo release</button><button class="btn" id="v-reset" type="button">Reset</button><span class="small" id="v-status" style="align-self:center">waiting for files: 0/3</span></div>
<div id="v-result" aria-live="polite"></div>`,

    security: `
<p class="eyebrow">security model</p>
<h1>What the hash and the signatures actually protect</h1>
<h2>Hash vs. signature, in plain language</h2>
<p>A <b>SHA-256 hash</b> is a fingerprint of a file. If even one bit of the firmware changes, the hash changes completely. The manifest lists the expected hash, so the <a href="#/verify">Verify page</a> can tell you whether your <code>.bin</code> is bit-for-bit the file the publisher built. A hash alone cannot tell you <i>who</i> built it.</p>
<p>A <b>signature</b> is the publisher's cryptographic stamp on the manifest. If anyone edits the manifest or swaps the firmware, the signature stops matching. The Verify page checks it against the publisher key shipped with this site as <code>pubkey.json</code>.</p>
<h2>Why post-quantum</h2>
<p>Today's signatures (like Ed25519) rely on math that future large quantum computers could break. ML-DSA (FIPS 204) is NIST-standardized and designed to resist quantum attackers. Ed25519 is kept alongside as a hybrid fallback.</p>
<div class="callout"><p>A valid signature proves the release was published by the holder of this site's private key. It is <b>not</b> an endorsement by any government, regulator or authority, and it does not certify that the firmware is safe, legal in your country, or bug-free.</p></div>
<h2>Trusting the public key itself</h2>
<p>A signature is only as trustworthy as the key you check it against. The Verify page shows the SHA-256 fingerprint of each publisher key. Compare it with the fingerprint published through a second channel, such as the GitHub README or a printed card handed out in person. If they differ, do not trust any PASS.</p>
<h2>What firmware signing does NOT protect</h2>
<ul>
  <li><b>Message encryption is separate.</b> Mesh traffic is encrypted by Meshtastic's own per-channel mechanism; see the <a href="https://meshtastic.org/docs/overview/encryption/" rel="noopener">official docs</a> {{UP}}.</li>
  <li><b>Radio legality is on you.</b> Bands, power and duty-cycle rules vary by country.</li>
  <li><b>This site is unofficial.</b> The upstream source of truth is the <a href="https://github.com/meshtastic/firmware" rel="noopener">Meshtastic firmware repository</a>.</li>
</ul>
<h2>How verification works technically</h2>
<ol>
  <li><code>firmware.bin</code> is hashed with SHA-256 via WebCrypto and compared with the <code>sha256</code> field in <code>manifest.json</code>.</li>
  <li>The exact bytes of <code>manifest.json</code> are verified against <code>manifest.sig</code>: ML-DSA-65 and Ed25519 via a locally bundled library (noble). PASS requires the hash match <i>and</i> every algorithm in <code>signature_algs</code>.</li>
  <li>Key fingerprints (SHA-256 of each public key) are shown for second-channel comparison.</li>
  <li>Nothing is uploaded, no cookies, no trackers.</li>
</ol>
<p>Publishers sign releases with <code>node tools/sign.mjs</code>; see the README.</p>`,

    releases: `
<p class="eyebrow">releases</p>
<h1>Releases</h1>
<p class="lede">Generated from <code>releases.json</code>. Each release has a <code>firmware.bin</code>, <code>manifest.json</code> and <code>manifest.sig</code> you can check on the <a href="#/verify">Verify page</a>.</p>
<div class="callout warn"><p>The <b>demo</b> release contains random bytes, not real firmware. It exists so you can try the verifier. Never flash it.</p></div>
<div id="rel-list" class="grid" style="grid-template-columns:1fr"><p>…</p></div>`,
  },
};
