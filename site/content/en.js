const DISCLAIMER = `<p><b>Disclaimer:</b> this is an unofficial community build and documentation site. It is not affiliated with, endorsed by, or connected to the Meshtastic project. Use any firmware at your own risk. LoRa radio use is regulated: frequency bands, power limits and licensing rules vary by country. Check the rules for your location before transmitting, for example in the <a href="https://meshtastic.org/docs/" rel="noopener">official Meshtastic documentation</a>.</p>`;

export default {
  ui: {
    brand: 'Meshtastic E-Ink Node',
    nav: { home: 'Home', hardware: 'Hardware', build: 'Build', solar: 'Solar', openhw: 'Open hardware', access: 'Accessibility', faq: 'Q&A', verify: 'Verify', security: 'Security', releases: 'Releases' },
    up: 'check upstream',
    copy: 'COPY', copied: 'COPIED',
    pinCols: ['Part', 'Signal', 'ESP32-S3 pin', 'What it does'],
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
    <p class="lede">An open-hardware LoRa node running <a href="https://meshtastic.org" rel="noopener">Meshtastic</a> with an E-Ink screen. Build it yourself and join the network, receive a ready-made one from the state, or register for accessibility add-ons such as a Braille keyboard or a haptic skin band. Every firmware release can be verified in your browser before you flash it.</p>
    <div class="cta">
      <a class="btn primary" href="#/openhw">Build it yourself →</a>
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
  <a class="card" href="#/openhw"><div class="feature-icon">⚒</div><span class="num">05</span><h3>Open hardware, built at home</h3><p>Schematics, pinout and parts list are open. Anyone can build a node at home and connect to the network. Join the group purchase for cheaper parts. →</p></a>
  <a class="card" href="#/access"><div class="feature-icon">⠿</div><span class="num">06</span><h3>Accessible for deaf and blind people</h3><p>Register for add-ons such as a Braille keyboard or a haptic skin band. They are open source too, so you can also build them yourself. →</p></a>
</div>

<div class="cta"><a class="btn accent" href="#/verify">Verify a firmware file</a><a class="btn" href="#/build">Build the firmware yourself</a></div>

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

    hardware: `
<p class="eyebrow">hardware</p>
<h1>ESP32-S3 boards with E-Ink displays</h1>
<p class="lede">This build targets ESP32-S3 boards that pair the MCU with an E-Ink (e-paper) display, so the node can show messages and telemetry while drawing almost no power. Prefer to wire your own? See the <a href="#/openhw">open-hardware DIY build</a>.</p>
<div class="callout warn"><p><b>We do not invent specifications.</b> Display sizes, radio chips, pin mappings and the supported board list live upstream and change over time. Confirm every {{UP}} item against the <a href="https://github.com/meshtastic/firmware" rel="noopener">firmware repository</a> (board definitions, <code>platformio.ini</code>) and <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">meshtastic.org</a> before you buy or flash.</p></div>

<h2>Candidate boards</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Board</th><th>Env hint</th><th>Display</th><th>LoRa radio</th><th>Status</th></tr></thead><tbody>
<tr><td><b>Heltec Wireless Paper</b></td><td><code>heltec-wireless-paper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate · reference board for this site</td></tr>
<tr><td><b>Heltec Vision Master E213</b></td><td><code>heltec-vision-master-e213</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate</td></tr>
<tr><td><b>Heltec Vision Master E290</b></td><td><code>heltec-vision-master-e290</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate</td></tr>
<tr><td><b>LilyGO T5 S3 E-Paper</b></td><td><code>lilygo-t5-s3-epaper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>candidate</td></tr>
<tr><td><b>DIY: ESP32-S3-DevKitC-1 + SX1262 + e-paper</b></td><td><code>diy-s3-eink</code> (this repo)</td><td>2.13″ / 2.9″ SPI</td><td>SX1262 module</td><td>open hardware · <a href="#/openhw">build guide</a></td></tr>
</tbody></table></div>

<h2 id="pins">Heltec Wireless Paper: which pin does what</h2>
<p>Everything is already wired on the PCB. This map helps with debugging, add-ons and understanding the variant file. Source: <code>variants/heltec_wireless_paper/variant.h</code> {{UP}}.</p>
{{PINS_HELTEC}}
<p class="small">Free GPIOs for add-ons (Braille keyboard, haptic band) depend on the board revision. Check the header pinout printed on your board and the variant file before connecting anything.</p>

<h2>How to confirm a board yourself</h2>
<ol>
  <li>Open the <a href="https://github.com/meshtastic/firmware" rel="noopener">firmware repo</a> and search <code>platformio.ini</code> for <code>[env:…]</code> names matching your board.</li>
  <li>Check the board's variant files in <code>variants/</code> for display and pin definitions.</li>
  <li>Cross-check with the <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">official hardware docs</a> for supported devices and regional frequency notes.</li>
</ol>`,

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

    openhw: `
<p class="eyebrow">open hardware</p>
<h1>Open hardware: anyone can build one at home</h1>
<p class="lede">Firmware, schematics, pinout, parts list and accessibility add-ons are all open. Build a node at home, flash verified firmware and connect to the network. If you don't want to build one, the state supplies a ready-made node automatically.</p>
<div class="toc"><a href="#/openhw#paths">Three ways to get a node</a><a href="#/openhw#bom">Parts list</a><a href="#/openhw#connect">Connect to the network</a><a href="#/openhw#selfhost">Self-build add-ons and group purchase</a></div>

<h2 id="paths">Three ways to get a node</h2>
<div class="grid">
  <div class="card"><span class="num">A</span><h3>Build it yourself</h3><p>Follow the parts list and <a href="#/faq#wiring">wiring guide</a>, flash firmware, join the mesh. Open hardware means you may copy, modify and share the design.</p></div>
  <div class="card"><span class="num">B</span><h3>Supplied by the state</h3><p>Everyone else gets a standard, pre-flashed solar node supplied automatically by the state. Details about delivery are published by the central authority in the <a href="#/faq#channel">read-only channel</a>.</p></div>
  <a class="card" href="#/access"><span class="num">C</span><h3>Deaf, blind or deafblind</h3><p>Register to receive accessibility add-ons such as a Braille keyboard or a haptic skin band with your node. →</p></a>
</div>

<h2 id="bom">Parts list (DIY reference build)</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Part</th><th>Example</th><th>Notes</th></tr></thead><tbody>
<tr><td>MCU board</td><td>ESP32-S3-DevKitC-1 (N8R8 or N16R8)</td><td>PSRAM recommended</td></tr>
<tr><td>LoRa radio</td><td>SX1262 module with TCXO, e.g. Waveshare Core1262 or Ebyte E22</td><td>Pick the band for your region (EU: 868 MHz). E22 needs RXEN/TXEN wiring, see datasheet</td></tr>
<tr><td>Display</td><td>2.13″ or 2.9″ SPI e-paper module (black/white)</td><td>Must match the display driver set in the variant {{UP}}</td></tr>
<tr><td>Antenna</td><td>Tuned 868 MHz antenna, u.FL→SMA pigtail</td><td>Never power the radio without it</td></tr>
<tr><td>Solar panel</td><td>6 V, 2–6 W</td><td>See <a href="#/solar">Solar</a></td></tr>
<tr><td>Charger</td><td>CN3791 (MPPT) or TP4056 with protection</td><td>1S Li-ion, 4.2 V</td></tr>
<tr><td>Battery</td><td>1–2 × 18650 protected, or LiFePO4</td><td>LiFePO4 needs a 3.6 V charger</td></tr>
<tr><td>Regulator</td><td>3.3 V LDO, low quiescent (ME6211, HT7333)</td><td>Feeds the 3V3 pin</td></tr>
<tr><td>Misc.</td><td>2 × 100 kΩ resistors, IP65 box, cable glands</td><td>Battery voltage divider on GPIO1</td></tr>
</tbody></table></div>
<p>Design files live in the repo under <code>hardware/</code> and <code>variants/diy_s3_eink/</code>: <a href="{{REPO}}">{{REPO}}</a>. Hardware licence CERN-OHL-S-2.0, firmware GPL-3.0 (as upstream).</p>

<h2 id="connect">Connect to the network</h2>
<ol class="steps">
  <li><h3>Set the region</h3><p>In the Meshtastic app or CLI set LoRa region <code>EU_868</code> for Czechia and Poland (other countries: check upstream).</p><pre><code>meshtastic --set lora.region EU_868</code></pre></li>
  <li><h3>Add the network channel</h3><p>The central authority publishes the channel URL / QR code in the <a href="#/faq#channel">read-only channel</a>. Open it in the app or apply it with the CLI.</p><pre><code>meshtastic --seturl "&lt;channel URL from the read-only channel&gt;"</code></pre></li>
  <li><h3>Check you're in</h3><p>Within minutes your node list should show neighbours. No neighbours? Raise the antenna, check the region, and read the <a href="#/faq">Q&amp;A</a>.</p></li>
</ol>

<h2 id="selfhost">Self-build add-ons and group purchase</h2>
<p>The Braille keyboard and haptic skin band are open source and open hardware, so you can build and run (self-host) them yourself instead of waiting for a supplied unit. Join the <b>group purchase</b> to get parts kits at bulk prices. Registrations are sent privately to the central authority, never published.</p>
<div class="card">
<form class="f reg" data-kind="self-build / group purchase">
  <div class="row2">
    <label><span class="lbl">Name</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">E-mail</span><input type="email" name="email" required autocomplete="email"></label>
  </div>
  <div class="row2">
    <label><span class="lbl">Country</span><select name="country"><option>Czechia</option><option>Poland</option><option>Slovakia</option><option>Other</option></select></label>
    <label><span class="lbl">City / region</span><input type="text" name="region"></label>
  </div>
  <fieldset><legend>What do you want to build?</legend>
    <label class="check"><input type="checkbox" name="node"> Mesh node (ESP32-S3 + E-Ink + solar)</label>
    <label class="check"><input type="checkbox" name="braille"> Braille keyboard add-on</label>
    <label class="check"><input type="checkbox" name="haptic"> Haptic skin band add-on</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Join the group purchase?</span><select name="groupbuy"><option value="yes">Yes, reserve kits for me</option><option value="no">No, I'll source parts myself</option></select></label>
    <label><span class="lbl">Number of kits</span><input type="number" name="qty" min="1" max="50" value="1"></label>
  </div>
  <label><span class="lbl">Experience</span><select name="experience"><option>First electronics project</option><option>I can solder and flash boards</option><option>Experienced maker</option></select></label>
  <label class="check"><input type="checkbox" name="consent" required> I agree that the central authority processes this data to organise the group purchase.</label>
  <button class="btn primary" type="submit">Send registration</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    access: `
<p class="eyebrow">accessibility</p>
<h1>Mesh messaging for deaf, blind and deafblind people</h1>
<p class="lede">Off-grid communication must work for everyone. If you are deaf, hard of hearing, blind, partially sighted or deafblind, register below to receive your node with accessibility add-ons supplied by the state.</p>

<div class="grid">
  <div class="card"><div class="feature-icon">⠿</div><h3>Braille keyboard</h3><p>A 6- or 8-dot Braille input that types messages straight into the node. Paired with screen-reader-friendly status output from the companion app. For blind and deafblind users.</p></div>
  <div class="card"><div class="feature-icon">≋</div><h3>Haptic skin band</h3><p>A wearable band that turns incoming messages and alerts into vibration patterns on the skin, so nothing depends on sound or sight. For deaf and deafblind users.</p></div>
  <div class="card"><div class="feature-icon">▤</div><h3>High-contrast E-Ink</h3><p>The E-Ink screen is readable in direct sunlight and shows alerts visually, with no sound needed. Large-font layouts are planned.</p></div>
</div>

<div class="callout"><p><b>Open source, so you can also self-host.</b> Both add-ons are open hardware. If you or someone helping you prefers to build them, use the <a href="#/openhw#selfhost">self-build and group purchase form</a>.</p></div>

<h2 id="register">Registration form</h2>
<p>Your data goes privately to the central authority only. It is never published and never shown to other users.</p>
<div class="card">
<form class="f reg" data-kind="accessibility registration">
  <div class="row2">
    <label><span class="lbl">Full name</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">Preferred language</span><select name="lang"><option>English</option><option>Čeština</option><option>Polski</option></select></label>
  </div>
  <div class="row2">
    <label><span class="lbl">E-mail</span><input type="email" name="email" autocomplete="email"></label>
    <label><span class="lbl">Phone (for SMS)</span><input type="tel" name="phone" autocomplete="tel"></label>
  </div>
  <label><span class="lbl">How should we contact you?</span><select name="contact"><option>E-mail</option><option>SMS / text message</option><option>Through a carer or assistant</option><option>Letter in Braille</option></select></label>
  <fieldset><legend>I am</legend>
    <label class="check"><input type="checkbox" name="deaf"> Deaf or hard of hearing</label>
    <label class="check"><input type="checkbox" name="blind"> Blind or partially sighted</label>
    <label class="check"><input type="checkbox" name="deafblind"> Deafblind</label>
  </fieldset>
  <fieldset><legend>Add-ons I need</legend>
    <label class="check"><input type="checkbox" name="braille"> Braille keyboard</label>
    <label class="check"><input type="checkbox" name="haptic"> Haptic skin band (vibration)</label>
  </fieldset>
  <label><span class="lbl">Braille layout (if relevant)</span><select name="braille_layout"><option>6-dot</option><option>8-dot</option><option>Not sure</option></select></label>
  <label><span class="lbl">Delivery address</span><textarea name="address" rows="3" autocomplete="street-address" required></textarea></label>
  <label><span class="lbl">Anything else we should know?</span><textarea name="notes" rows="3"></textarea></label>
  <label class="check"><input type="checkbox" name="consent" required> I agree that the central authority processes this data to supply my device and add-ons.</label>
  <button class="btn primary" type="submit">Send registration</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    faq: `
<p class="eyebrow">questions &amp; answers</p>
<h1>Q&amp;A: technical questions</h1>
<p class="lede">How to put it together, which pin is for what, and how to get on the network. Can't find your answer? <a href="#/faq#ask">Ask the central authority</a>; the answer is published in all three languages in the read-only channel.</p>
<div class="toc"><a href="#/faq#assembly">Assembly</a><a href="#/faq#wiring">Which pin goes where</a><a href="#/faq#ask">Ask a question</a><a href="#/faq#channel">Read-only channel</a></div>

<h2 id="assembly">Putting it together</h2>
<details class="qa" open><summary>How do I assemble the node, step by step?</summary><div>
<ol>
  <li><b>Test on the bench first.</b> Plug the DevKitC into USB, flash the firmware (see <a href="#/build">Build</a>) and confirm the board boots before wiring anything else.</li>
  <li><b>Antenna on the radio module.</b> Always connect the antenna before the radio gets power. Transmitting without one can destroy the SX1262.</li>
  <li><b>Wire the radio</b> (SPI + BUSY, DIO1, RESET) using the table below. Keep wires short, under 10 cm.</li>
  <li><b>Wire the e-paper module</b> (SPI + DC, RST, BUSY). It shares 3V3 and GND.</li>
  <li><b>Flash the DIY variant</b> and check the screen draws and the radio initialises (serial log at 115200 baud).</li>
  <li><b>Add power:</b> panel → charger → battery → 3.3 V regulator → 3V3 pin. Add the 100k/100k battery divider to GPIO1.</li>
  <li><b>Box it:</b> IP65 enclosure, cable gland for the panel lead, antenna outside, mounted as high as possible.</li>
</ol></div></details>
<details class="qa"><summary>Do I need to solder?</summary><div><p>With a Heltec Wireless Paper, no: it is one board. You only plug in the antenna and battery. The DIY build needs basic soldering of header pins and the power chain, or jumper wires on a breadboard for a first test.</p></div></details>
<details class="qa"><summary>Can I use an SX1276 / RFM95 radio instead of the SX1262?</summary><div><p>Meshtastic supports several radios, but the pin set differs (DIO0 instead of BUSY/DIO1) and the variant file must be changed. SX1262 is recommended for lower power and better sensitivity. Check radio support upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Which frequency do I use in Czechia and Poland?</summary><div><p>The EU 868 MHz band, region <code>EU_868</code> in Meshtastic. Buy the 868 MHz version of the radio and antenna. Other countries: check your local rules and the upstream region list {{UP}}.</p></div></details>
<details class="qa"><summary>The screen stays blank. What now?</summary><div><p>Check BUSY and RST wiring, make sure the display model in the variant matches your panel (2.13″ and 2.9″ use different drivers), and verify 3.3 V on the module. On Heltec boards the display is powered through Vext (GPIO45, LOW = on).</p></div></details>
<details class="qa"><summary>How do I connect my node to the network?</summary><div><p>Set the region, then apply the channel URL published by the central authority in the read-only channel. Step by step: <a href="#/openhw#connect">Open hardware → Connect</a>.</p></div></details>
<details class="qa"><summary>How do I know the firmware is genuine?</summary><div><p>Use the <a href="#/verify">Verify page</a>: it checks the SHA-256 hash and the ML-DSA-65 + Ed25519 signatures in your browser, then compare the key fingerprint with the one in the GitHub README.</p></div></details>
<details class="qa"><summary>Can I connect a Braille keyboard or a haptic band myself?</summary><div><p>Yes. Both add-ons are open hardware. They connect to free GPIOs or via I²C; pin assignments are in <code>hardware/addons/</code> in the repo. See <a href="#/access">Accessibility</a> and the <a href="#/openhw#selfhost">self-build form</a>.</p></div></details>
<details class="qa"><summary>Can I chat with other users here?</summary><div><p>No. On this site you can only ask the central authority. Questions and official answers appear in the read-only channel; there are no replies or comments between users.</p></div></details>

<h2 id="wiring">Which pin goes where (DIY build)</h2>
<p>ESP32-S3-DevKitC-1 to SX1262 module and SPI e-paper module. GPIO numbers match the Heltec Wireless Paper layout, so the variant stays familiar. The matching firmware definition is in <code>variants/diy_s3_eink/variant.h</code> in the repo.</p>
{{PINS_DIY}}
<div class="callout warn"><p><b>Before you power up:</b> antenna attached · radio and display on <b>3.3 V</b>, never 5 V · double-check that GND is shared · don't feed the 3V3 pin from the regulator while USB is plugged in unless your board has protection (disconnect the battery when flashing).</p></div>
<h3>Power wiring</h3>
{{POWER_CHAIN}}
<p>Heltec Wireless Paper pinout: <a href="#/hardware#pins">Hardware → pins</a>.</p>

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
