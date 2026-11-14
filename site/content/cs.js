const DISCLAIMER = `<p><b>Upozornění:</b> toto je neoficiální komunitní build a dokumentační web. Není spojen s projektem Meshtastic, není jím schválen ani podporován. Jakýkoli firmware používáš na vlastní riziko. Provoz LoRa rádia je regulován: frekvenční pásma, výkonové limity a licenční pravidla se liší podle země. Před vysíláním si ověř pravidla pro své místo, například v <a href="https://meshtastic.org/docs/" rel="noopener">oficiální dokumentaci Meshtastic</a>.</p>`;

export default {
  ui: {
    brand: 'Meshtastic E-Ink uzel',
    nav: { home: 'Úvod', hardware: 'Hardware', build: 'Sestavení FW', solar: 'Solár', openhw: 'Open hardware', access: 'Přístupnost', faq: 'Otázky a odpovědi', verify: 'Ověření', security: 'Bezpečnost', releases: 'Vydání' },
    up: 'ověř upstream',
    copy: 'KOPÍROVAT', copied: 'ZKOPÍROVÁNO',
    pinCols: ['Součástka', 'Signál', 'Pin ESP32-S3', 'K čemu slouží'],
    verify: {
      waiting: 'čekám na soubory: {n}/3',
      hash: 'SHA-256 firmwaru odpovídá manifestu', sig: 'Podpis', sigOk: 'platný pro klíč vydavatele', sigBad: 'NEPLATNÝ nebo chybí',
      fp: 'Otisk klíče vydavatele', meta: 'Vydání', error: 'Nelze ověřit',
      pass: 'PASS · pravé vydání', fail: 'FAIL · nenahrávat',
      compare: 'Porovnej otisky klíčů výše s otisky zveřejněnými druhým kanálem (README na GitHubu nebo tištěná kartička). Pokud se liší, výsledku PASS nevěř.',
    },
    releases: { board: 'Deska', commit: 'Upstream commit', built: 'Sestaveno', algs: 'Podpisové algoritmy', file: 'Soubor', size: 'Velikost', verify: 'Ověřit toto vydání', none: 'Zatím žádná vydání.' },
    ask: { tooShort: 'Napiš prosím trochu víc (alespoň 10 znaků).', opened: 'V nové záložce se otevřel formulář na GitHubu. Odešli ho tam; otázka se přeloží a objeví v kanálu níže.' },
    channel: { answered: 'zodpovězeno', pending: 'čeká na odpověď', authority: 'Centrální autorita', translatedFrom: 'přeloženo z', empty: 'Zatím nejsou zveřejněné žádné otázky. Zeptej se jako první.' },
    form: {
      sent: 'Otevřela se tvoje e-mailová aplikace s vyplněnou registrací. Stiskni tam Odeslat a registrace dorazí centrální autoritě.',
      noInbox: '<b>Registrační schránka zatím není nastavená.</b> Tvoje odpovědi jsou níže (a pokud to prohlížeč dovolí, i ve schránce). Uschovej si je; odeslat je můžeš, jakmile bude adresa zveřejněna v kanálu.',
      copied: 'Zkopírováno do schránky.',
    },
    footer: DISCLAIMER + `<p class="stamp">žádné cookies · žádné sledování · žádné požadavky třetím stranám · ověření běží lokálně v prohlížeči · <a href="{{REPO}}">zdrojový kód na GitHubu</a> · hardware CERN-OHL-S-2.0 · firmware GPL-3.0</p>`,
  },

  pages: {
    home: `
<section class="hero">
  <div>
    <p class="eyebrow">open hardware · off-grid · ESP32-S3 + E-Ink</p>
    <h1>Solární mesh uzel, který si postavíš doma.</h1>
    <p class="lede">Open-hardware LoRa uzel s firmwarem <a href="https://meshtastic.org" rel="noopener">Meshtastic</a> a E-Ink displejem. Postav si ho sám a připoj se do sítě, nebo dostaneš hotový od státu. Pokud jsi neslyšící nebo nevidomý, zaregistruj se pro doplňky jako Braillova klávesnice nebo haptický pásek na kůži. Každé vydání firmwaru si před nahráním ověříš přímo v prohlížeči.</p>
    <div class="cta">
      <a class="btn primary" href="#/openhw">Postav si ho sám →</a>
      <a class="btn" href="#/faq">Otázky a zapojení pinů</a>
      <a class="btn" href="#/access">Registrace – přístupnost</a>
    </div>
  </div>
  {{DEVICE}}
</section>

<div class="grid">
  <div class="card"><div class="feature-icon">⌁</div><span class="num">01</span><h3>Zprávy mimo síť</h3><p>Uzly tvoří decentralizovanou LoRa síť. Zprávy přeskakují z uzlu na uzel bez internetu, SIM karet a mobilní sítě. Podporované desky a nastavení kanálů: <a href="https://meshtastic.org/docs/" rel="noopener">oficiální dokumentace</a> {{UP}}.</p></div>
  <div class="card"><div class="feature-icon">▤</div><span class="num">02</span><h3>Úsporný E-Ink displej</h3><p>E-Ink drží poslední obraz bez jakékoli spotřeby, takže uzel na baterii ukazuje zprávy a stav celé týdny. Konfigurace pinů je v <a href="https://github.com/meshtastic/firmware" rel="noopener">repozitáři firmwaru</a>.</p></div>
  <div class="card"><div class="feature-icon">✓</div><span class="num">03</span><h3>Ověřitelný firmware</h3><p>Každé vydání má manifest s SHA-256 hashi, podepsaný postkvantovým <b>ML-DSA-65 (FIPS 204)</b> a Ed25519. Platný podpis dokazuje pravost od vydavatele; není to schválení žádnou autoritou.</p></div>
  <a class="card" href="#/solar"><div class="feature-icon">☀</div><span class="num">04</span><h3>Běží na slunce</h3><p>Dnešní malé solární panely uzel bez problému napájí mimo síť. Panel 2–6 W a jeden článek 18650 ho udrží v chodu i v noci a za zataženo. →</p></a>
  <a class="card" href="#/openhw"><div class="feature-icon">⚒</div><span class="num">05</span><h3>Open hardware, postavený doma</h3><p>Schéma, zapojení pinů a seznam dílů jsou otevřené. Kdokoli si může postavit uzel doma a připojit se do sítě. Přidej se ke společnému nákupu za levnější díly. →</p></a>
  <a class="card" href="#/access"><div class="feature-icon">⠿</div><span class="num">06</span><h3>Přístupné pro neslyšící a nevidomé</h3><p>Zaregistruj se pro doplňky jako Braillova klávesnice nebo haptický pásek na kůži. Jsou také open source, takže si je můžeš postavit i sám. →</p></a>
</div>

<div class="cta"><a class="btn accent" href="#/verify">Ověřit soubor firmwaru</a><a class="btn" href="#/build">Sestavit firmware sám</a></div>

<div class="two">
  <div>
    <h2>Jak tu funguje důvěra</h2>
    <p>Stránka <a href="#/verify">Ověření</a> spočítá SHA-256 hash tvého <code>.bin</code>, porovná ho s manifestem a ověří podpisy ML-DSA-65 a Ed25519 vůči veřejnému klíči vydavatele, vše lokálně v prohlížeči. Zobrazený otisk klíče pak porovnáš s otiskem zveřejněným druhým kanálem (repozitář na GitHubu nebo tištěná kartička). Podrobnosti na stránce <a href="#/security">Bezpečnost</a>.</p>
    <p>Zdroje pravdy upstream: <a href="https://github.com/meshtastic/firmware" rel="noopener">repozitář firmwaru Meshtastic</a> a <a href="https://meshtastic.org/docs/" rel="noopener">meshtastic.org</a>. Vše, co se může upstream změnit (seznam desek, build targety, postup nahrání), je označeno {{UP}}.</p>
  </div>
  <div>
    <h2>Jak tu fungují otázky</h2>
    <p>Na cokoli se můžeš zeptat <b>centrální autority</b>, anglicky, česky nebo polsky. Každá otázka se automaticky přeloží do všech tří jazyků a spolu s oficiální odpovědí se zveřejní v <b>kanálu jen pro čtení</b>.</p>
    <p>Uživatelé si na tomto webu nemohou psát mezi sebou; nejsou tu žádná vlákna ani komentáře. Odpovědi tak zůstávají oficiální a kanál bez šumu. <a href="#/faq#ask">Položit otázku →</a></p>
  </div>
</div>`,

    hardware: `
<p class="eyebrow">hardware</p>
<h1>Desky ESP32-S3 s E-Ink displejem</h1>
<p class="lede">Tento build cílí na desky ESP32-S3 s E-Ink (e-paper) displejem, takže uzel ukazuje zprávy a telemetrii a skoro nic nespotřebuje. Chceš si to zapojit sám? Viz <a href="#/openhw">open-hardware DIY sestava</a>.</p>
<div class="callout warn"><p><b>Specifikace si nevymýšlíme.</b> Velikosti displejů, rádiové čipy, mapování pinů a seznam podporovaných desek žijí upstream a mění se. Každou položku {{UP}} si před nákupem nebo nahráním ověř v <a href="https://github.com/meshtastic/firmware" rel="noopener">repozitáři firmwaru</a> (definice desek, <code>platformio.ini</code>) a na <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">meshtastic.org</a>.</p></div>

<h2>Kandidátní desky</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Deska</th><th>Env</th><th>Displej</th><th>LoRa rádio</th><th>Stav</th></tr></thead><tbody>
<tr><td><b>Heltec Wireless Paper</b></td><td><code>heltec-wireless-paper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát · referenční deska webu</td></tr>
<tr><td><b>Heltec Vision Master E213</b></td><td><code>heltec-vision-master-e213</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát</td></tr>
<tr><td><b>Heltec Vision Master E290</b></td><td><code>heltec-vision-master-e290</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát</td></tr>
<tr><td><b>LilyGO T5 S3 E-Paper</b></td><td><code>lilygo-t5-s3-epaper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát</td></tr>
<tr><td><b>DIY: ESP32-S3-DevKitC-1 + SX1262 + e-paper</b></td><td><code>diy-s3-eink</code> (toto repo)</td><td>2,13″ / 2,9″ SPI</td><td>modul SX1262</td><td>open hardware · <a href="#/openhw">návod</a></td></tr>
</tbody></table></div>

<h2 id="pins">Heltec Wireless Paper: který pin je k čemu</h2>
<p>Vše je už zapojené na desce. Mapa pomáhá při ladění, připojení doplňků a čtení variant souboru. Zdroj: <code>variants/heltec_wireless_paper/variant.h</code> {{UP}}.</p>
{{PINS_HELTEC}}
<p class="small">Volné GPIO pro doplňky (Braillova klávesnice, haptický pásek) závisí na revizi desky. Před připojením čehokoli zkontroluj potisk konektoru na desce a variant soubor.</p>

<h2>Jak si desku ověřit sám</h2>
<ol>
  <li>Otevři <a href="https://github.com/meshtastic/firmware" rel="noopener">repo firmwaru</a> a v <code>platformio.ini</code> hledej sekce <code>[env:…]</code> odpovídající tvé desce.</li>
  <li>Ve složce <code>variants/</code> zkontroluj definice displeje a pinů pro svou desku.</li>
  <li>Porovnej s <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">oficiální dokumentací hardwaru</a> (podporovaná zařízení a regionální frekvence).</li>
</ol>`,

    build: `
<p class="eyebrow">sestavení</p>
<h1>Sestav si firmware sám</h1>
<p class="lede">Sestavení ze zdrojových kódů je nejsilnější forma ověření: přeložíš přesně daný upstream commit sám a nemusíš věřit žádné hotové binárce. Názvy prostředí, cíle a postup nahrání se upstream mění, proto jsou konkrétní hodnoty označené {{UP}}.</p>
<ol class="steps">
  <li><h3>Nainstaluj PlatformIO</h3><p>Build systém, který firmware Meshtastic používá. Nainstaluj CLI (nebo rozšíření pro VS Code) podle <a href="https://platformio.org" rel="noopener">platformio.org</a> {{UP}}.</p><pre><code>pip install platformio</code></pre></li>
  <li><h3>Naklonuj repozitář firmwaru Meshtastic</h3><p>Poznamenej si commit, ze kterého stavíš; porovnej ho s <code>upstream_commit</code> v manifestu vydání.</p><pre><code>git clone https://github.com/meshtastic/firmware.git
cd firmware
git rev-parse HEAD   # musí odpovídat upstream_commit v manifestu</code></pre></li>
  <li><h3>Vyber prostředí pro svou desku</h3><p>Prostředí jsou sekce <code>[env:…]</code> v <code>platformio.ini</code>. Pro DIY desku nejdřív zkopíruj <code>variants/diy_s3_eink</code> z <a href="{{REPO}}">tohoto repa</a> do stromu firmwaru. Přesný <code>&lt;env-name&gt;</code> ověř {{UP}}.</p><pre><code>pio project config | grep "env:"   # nebo projdi platformio.ini</code></pre></li>
  <li><h3>Sestav</h3><pre><code>pio run -e &lt;env-name&gt;</code></pre></li>
  <li><h3>Nahraj</h3><p>Nahraj přes USB pomocí PlatformIO, nebo použij oficiální webový flasher <a href="https://flasher.meshtastic.org" rel="noopener">flasher.meshtastic.org</a> {{UP}}. <b>Nejdřív připoj anténu.</b></p><pre><code>pio run -e &lt;env-name&gt; --target upload</code></pre></li>
  <li><h3>Ověř, co jsi sestavil nebo stáhl</h3><p>Hotový <code>.bin</code> ověř na stránce <a href="#/verify">Ověření</a>. Pokud jsi stavěl ze zdrojů, porovnej hash své binárky s hashem v manifestu pro stejný upstream commit.</p></li>
</ol>
<h2>Kde je pravda</h2>
<ul>
  <li>Zdrojový kód a build prostředí: <a href="https://github.com/meshtastic/firmware" rel="noopener">github.com/meshtastic/firmware</a> {{UP}}</li>
  <li>Dokumentace: <a href="https://meshtastic.org/docs/" rel="noopener">meshtastic.org/docs</a> {{UP}}</li>
  <li>Webový flasher: <a href="https://flasher.meshtastic.org" rel="noopener">flasher.meshtastic.org</a> {{UP}}</li>
</ul>`,

    solar: `
<p class="eyebrow">napájení mimo síť</p>
<h1>Dnešní solární panely utáhnou uzel úplně mimo síť</h1>
<p class="lede">Mesh uzel potřebuje velmi málo energie. Moderní monokrystalické panely jsou účinné, levné a i pod mraky dávají použitelný výkon. Malý panel a jeden Li-ion článek udrží uzel v chodu ve dne i v noci bez jakéhokoli připojení k elektrické síti.</p>

<div class="grid">
  <div class="card"><div class="feature-icon">⚡</div><h3>Nepatrná spotřeba</h3><p>Uzel ESP32-S3 + SX1262 většinu času spí nebo poslouchá. E-Ink odebírá proud jen při změně obrazu. Typický průměr je pár desítek miliampér, s úsporným režimem často méně.</p></div>
  <div class="card"><div class="feature-icon">☀</div><h3>Účinné panely</h3><p>Dnešní mono panely přemění zhruba 20 % slunečního světla. I panel 2 W o velikosti dlaně vyrobí za průměrný den víc energie, než uzel spotřebuje.</p></div>
  <div class="card"><div class="feature-icon">🔋</div><h3>Baterie jako zásobník</h3><p>Jeden článek 18650 (≈ 11 Wh) pokryje několik dní bez slunce. Na zimu nebo pro routery přidej druhý článek paralelně.</p></div>
</div>

<h2>Příklad dimenzování (odhad, změř si svůj uzel)</h2>
<div class="math">Průměr uzlu: 30 mA × 3,7 V ≈ 0,11 W → ≈ 2,7 Wh za den<br>
Baterie: 1 × 18650, 3000 mAh × 3,7 V ≈ 11 Wh → ≈ 4 dny úplně bez slunce<br>
Léto, panel 2 W: 2 W × 3 sluneční hodiny × 0,7 ztráty ≈ 4,2 Wh za den ✓<br>
Středoevropská zima (≈ 1 sluneční hodina): panel 5–6 W a 2 články ✓</div>
<p class="small">Čísla jsou hrubé plánovací hodnoty, ne měření konkrétní desky. Skutečná spotřeba závisí na roli (klient nebo router), překreslování displeje, Bluetooth, GPS a vysílacím výkonu. Před dimenzováním změř spotřebu USB měřákem.</p>

<h2>Napájecí řetězec</h2>
{{POWER_CHAIN}}
<p>Kompletní zapojení s čísly pinů: <a href="#/faq#wiring">Otázky a odpovědi → který pin kam</a>.</p>

<h2>Praktické tipy</h2>
<ul>
  <li>Natoč panel na jih, se sklonem kolem 45–60° kvůli zimě. Strmější panel lépe shodí sníh.</li>
  <li><b>Li-ion se nesmí nabíjet pod 0 °C.</b> Na mráz použij nabíječku s teplotní ochranou, nebo článek LiFePO4 s odpovídající nabíječkou.</li>
  <li>Použij vodotěsnou krabičku IP65, odvětrávací ventilek a venkovní anténu co nejvýš: výška je důležitější než výkon.</li>
  <li>Pro solární klienty zapni ve firmwaru úsporné režimy {{UP}}.</li>
</ul>`,

    openhw: `
<p class="eyebrow">open hardware</p>
<h1>Open hardware: postavit si ho může každý doma</h1>
<p class="lede">Firmware, schéma, zapojení pinů, seznam dílů i doplňky pro přístupnost jsou otevřené. Postav si uzel doma, nahraj ověřený firmware a připoj se do sítě. Pokud si ho stavět nechceš, stát ti hotový uzel dodá automaticky.</p>
<div class="toc"><a href="#/openhw#paths">Tři cesty k uzlu</a><a href="#/openhw#bom">Seznam dílů</a><a href="#/openhw#connect">Připojení do sítě</a><a href="#/openhw#selfhost">Doplňky svépomocí a společný nákup</a></div>

<h2 id="paths">Tři cesty k uzlu</h2>
<div class="grid">
  <div class="card"><span class="num">A</span><h3>Postav si ho sám</h3><p>Řiď se seznamem dílů a <a href="#/faq#wiring">návodem na zapojení</a>, nahraj firmware a připoj se do sítě. Open hardware znamená, že návrh smíš kopírovat, upravovat a sdílet.</p></div>
  <div class="card"><span class="num">B</span><h3>Dodá ho stát</h3><p>Všichni ostatní dostanou standardní solární uzel s nahraným firmwarem, který stát dodá automaticky. Podrobnosti o doručení zveřejňuje centrální autorita v <a href="#/faq#channel">kanálu jen pro čtení</a>.</p></div>
  <a class="card" href="#/access"><span class="num">C</span><h3>Neslyšící, nevidomí, hluchoslepí</h3><p>Zaregistruj se a k uzlu dostaneš doplňky pro přístupnost, jako je Braillova klávesnice nebo haptický pásek na kůži. →</p></a>
</div>

<h2 id="bom">Seznam dílů (referenční DIY sestava)</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Díl</th><th>Příklad</th><th>Poznámka</th></tr></thead><tbody>
<tr><td>Deska MCU</td><td>ESP32-S3-DevKitC-1 (N8R8 nebo N16R8)</td><td>Doporučena PSRAM</td></tr>
<tr><td>LoRa rádio</td><td>Modul SX1262 s TCXO, např. Waveshare Core1262 nebo Ebyte E22</td><td>Zvol pásmo pro svůj region (EU: 868 MHz). E22 potřebuje zapojit RXEN/TXEN, viz datasheet</td></tr>
<tr><td>Displej</td><td>SPI e-paper modul 2,13″ nebo 2,9″ (černobílý)</td><td>Musí odpovídat ovladači displeje ve variantě {{UP}}</td></tr>
<tr><td>Anténa</td><td>Naladěná anténa 868 MHz, kablík u.FL→SMA</td><td>Rádio nikdy nezapínej bez antény</td></tr>
<tr><td>Solární panel</td><td>6 V, 2–6 W</td><td>Viz <a href="#/solar">Solár</a></td></tr>
<tr><td>Nabíječka</td><td>CN3791 (MPPT) nebo TP4056 s ochranou</td><td>1S Li-ion, 4,2 V</td></tr>
<tr><td>Baterie</td><td>1–2 × 18650 s ochranou, nebo LiFePO4</td><td>LiFePO4 potřebuje nabíječku na 3,6 V</td></tr>
<tr><td>Regulátor</td><td>LDO 3,3 V s malým klidovým proudem (ME6211, HT7333)</td><td>Napájí pin 3V3</td></tr>
<tr><td>Ostatní</td><td>2 × rezistor 100 kΩ, krabička IP65, kabelové vývodky</td><td>Dělič napětí baterie na GPIO1</td></tr>
</tbody></table></div>
<p>Návrhové soubory jsou v repu ve složkách <code>hardware/</code> a <code>variants/diy_s3_eink/</code>: <a href="{{REPO}}">{{REPO}}</a>. Licence hardwaru CERN-OHL-S-2.0, firmware GPL-3.0 (stejně jako upstream).</p>

<h2 id="connect">Připojení do sítě</h2>
<ol class="steps">
  <li><h3>Nastav region</h3><p>V aplikaci Meshtastic nebo v CLI nastav LoRa region <code>EU_868</code> pro Česko i Polsko (jiné země: ověř upstream).</p><pre><code>meshtastic --set lora.region EU_868</code></pre></li>
  <li><h3>Přidej kanál sítě</h3><p>Centrální autorita zveřejňuje URL / QR kód kanálu v <a href="#/faq#channel">kanálu jen pro čtení</a>. Otevři ho v aplikaci nebo použij CLI.</p><pre><code>meshtastic --seturl "&lt;URL kanálu z kanálu jen pro čtení&gt;"</code></pre></li>
  <li><h3>Zkontroluj, že jsi v síti</h3><p>Během pár minut by se v seznamu uzlů měli objevit sousedé. Nikdo? Dej anténu výš, zkontroluj region a projdi <a href="#/faq">otázky a odpovědi</a>.</p></li>
</ol>

<h2 id="selfhost">Doplňky svépomocí a společný nákup</h2>
<p>Braillova klávesnice i haptický pásek jsou open source a open hardware, takže si je můžeš postavit a provozovat (selfhostovat) sám a nemusíš čekat na dodaný kus. Přidej se ke <b>společnému nákupu</b> a získáš sady dílů za velkoobchodní ceny. Registrace jde soukromě centrální autoritě a nikdy se nezveřejňuje.</p>
<div class="card">
<form class="f reg" data-kind="svépomoc / společný nákup">
  <div class="row2">
    <label><span class="lbl">Jméno</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">E-mail</span><input type="email" name="email" required autocomplete="email"></label>
  </div>
  <div class="row2">
    <label><span class="lbl">Země</span><select name="country"><option>Česko</option><option>Polsko</option><option>Slovensko</option><option>Jiná</option></select></label>
    <label><span class="lbl">Město / kraj</span><input type="text" name="region"></label>
  </div>
  <fieldset><legend>Co chceš postavit?</legend>
    <label class="check"><input type="checkbox" name="node"> Mesh uzel (ESP32-S3 + E-Ink + solár)</label>
    <label class="check"><input type="checkbox" name="braille"> Doplněk Braillova klávesnice</label>
    <label class="check"><input type="checkbox" name="haptic"> Doplněk haptický pásek na kůži</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Zapojit se do společného nákupu?</span><select name="groupbuy"><option value="yes">Ano, rezervujte mi sady</option><option value="no">Ne, díly si seženu sám</option></select></label>
    <label><span class="lbl">Počet sad</span><input type="number" name="qty" min="1" max="50" value="1"></label>
  </div>
  <label><span class="lbl">Zkušenosti</span><select name="experience"><option>První projekt s elektronikou</option><option>Umím pájet a nahrávat firmware</option><option>Zkušený kutil</option></select></label>
  <label class="check"><input type="checkbox" name="consent" required> Souhlasím, aby centrální autorita zpracovala tyto údaje za účelem organizace společného nákupu.</label>
  <button class="btn primary" type="submit">Odeslat registraci</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    access: `
<p class="eyebrow">přístupnost</p>
<h1>Mesh komunikace pro neslyšící, nevidomé a hluchoslepé</h1>
<p class="lede">Komunikace mimo síť musí fungovat pro každého. Pokud jsi neslyšící, nedoslýchavý, nevidomý, slabozraký nebo hluchoslepý, zaregistruj se níže a stát ti dodá uzel s doplňky pro přístupnost.</p>

<div class="grid">
  <div class="card"><div class="feature-icon">⠿</div><h3>Braillova klávesnice</h3><p>Šesti- nebo osmibodový Braillův vstup, kterým píšeš zprávy rovnou do uzlu. Doplněný o výstup stavu vhodný pro čtečky obrazovky v doprovodné aplikaci. Pro nevidomé a hluchoslepé.</p></div>
  <div class="card"><div class="feature-icon">≋</div><h3>Haptický pásek na kůži</h3><p>Nositelný pásek, který příchozí zprávy a výstrahy převádí na vibrační vzory na kůži, takže nic nezávisí na zvuku ani zraku. Pro neslyšící a hluchoslepé.</p></div>
  <div class="card"><div class="feature-icon">▤</div><h3>Kontrastní E-Ink</h3><p>E-Ink displej je čitelný i na přímém slunci a výstrahy ukazuje vizuálně, bez zvuku. Rozložení s velkým písmem je v plánu.</p></div>
</div>

<div class="callout"><p><b>Open source, takže i svépomocí.</b> Oba doplňky jsou open hardware. Pokud si je ty nebo někdo, kdo ti pomáhá, chcete postavit sami, použijte <a href="#/openhw#selfhost">formulář pro svépomoc a společný nákup</a>.</p></div>

<h2 id="register">Registrační formulář</h2>
<p>Tvoje údaje jdou soukromě pouze centrální autoritě. Nikdy se nezveřejňují a nikdy se neukazují ostatním uživatelům.</p>
<div class="card">
<form class="f reg" data-kind="registrace – přístupnost">
  <div class="row2">
    <label><span class="lbl">Celé jméno</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">Preferovaný jazyk</span><select name="lang"><option>Čeština</option><option>English</option><option>Polski</option></select></label>
  </div>
  <div class="row2">
    <label><span class="lbl">E-mail</span><input type="email" name="email" autocomplete="email"></label>
    <label><span class="lbl">Telefon (pro SMS)</span><input type="tel" name="phone" autocomplete="tel"></label>
  </div>
  <label><span class="lbl">Jak tě máme kontaktovat?</span><select name="contact"><option>E-mail</option><option>SMS</option><option>Přes asistenta nebo pečovatele</option><option>Dopis v Braillově písmu</option></select></label>
  <fieldset><legend>Jsem</legend>
    <label class="check"><input type="checkbox" name="deaf"> Neslyšící nebo nedoslýchavý</label>
    <label class="check"><input type="checkbox" name="blind"> Nevidomý nebo slabozraký</label>
    <label class="check"><input type="checkbox" name="deafblind"> Hluchoslepý</label>
  </fieldset>
  <fieldset><legend>Doplňky, které potřebuji</legend>
    <label class="check"><input type="checkbox" name="braille"> Braillova klávesnice</label>
    <label class="check"><input type="checkbox" name="haptic"> Haptický pásek na kůži (vibrace)</label>
  </fieldset>
  <label><span class="lbl">Rozložení Braillova písma (pokud se týká)</span><select name="braille_layout"><option>6bodové</option><option>8bodové</option><option>Nevím</option></select></label>
  <label><span class="lbl">Doručovací adresa</span><textarea name="address" rows="3" autocomplete="street-address" required></textarea></label>
  <label><span class="lbl">Něco dalšího, co bychom měli vědět?</span><textarea name="notes" rows="3"></textarea></label>
  <label class="check"><input type="checkbox" name="consent" required> Souhlasím, aby centrální autorita zpracovala tyto údaje za účelem dodání zařízení a doplňků.</label>
  <button class="btn primary" type="submit">Odeslat registraci</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    faq: `
<p class="eyebrow">otázky a odpovědi</p>
<h1>Otázky a odpovědi: technické dotazy</h1>
<p class="lede">Jak to složit dohromady, který pin je k čemu a jak se dostat do sítě. Nenašel jsi odpověď? <a href="#/faq#ask">Zeptej se centrální autority</a>; odpověď se zveřejní ve všech třech jazycích v kanálu jen pro čtení.</p>
<div class="toc"><a href="#/faq#assembly">Sestavení</a><a href="#/faq#wiring">Který pin kam</a><a href="#/faq#ask">Položit otázku</a><a href="#/faq#channel">Kanál jen pro čtení</a></div>

<h2 id="assembly">Jak to složit dohromady</h2>
<details class="qa" open><summary>Jak uzel sestavit, krok za krokem?</summary><div>
<ol>
  <li><b>Nejdřív test na stole.</b> Připoj DevKitC přes USB, nahraj firmware (viz <a href="#/build">Sestavení FW</a>) a ověř, že deska nabootuje, než zapojíš cokoli dalšího.</li>
  <li><b>Anténa na rádiový modul.</b> Anténu připoj vždy dřív, než rádio dostane napájení. Vysílání bez antény může SX1262 zničit.</li>
  <li><b>Zapoj rádio</b> (SPI + BUSY, DIO1, RESET) podle tabulky níže. Vodiče drž krátké, pod 10 cm.</li>
  <li><b>Zapoj e-paper modul</b> (SPI + DC, RST, BUSY). Sdílí 3V3 a GND.</li>
  <li><b>Nahraj DIY variantu</b> a zkontroluj, že se displej vykreslí a rádio se inicializuje (sériový log, 115200 baud).</li>
  <li><b>Přidej napájení:</b> panel → nabíječka → baterie → regulátor 3,3 V → pin 3V3. Přidej dělič baterie 100k/100k na GPIO1.</li>
  <li><b>Zabal to:</b> krabička IP65, kabelová vývodka pro kabel od panelu, anténa venku a co nejvýš.</li>
</ol></div></details>
<details class="qa"><summary>Musím pájet?</summary><div><p>S Heltec Wireless Paper ne: je to jedna deska. Připojíš jen anténu a baterii. DIY sestava vyžaduje základní pájení kolíkových lišt a napájení, nebo na první test propojovací kablíky na nepájivém poli.</p></div></details>
<details class="qa"><summary>Můžu místo SX1262 použít rádio SX1276 / RFM95?</summary><div><p>Meshtastic podporuje více rádií, ale sada pinů je jiná (DIO0 místo BUSY/DIO1) a variant soubor je potřeba upravit. SX1262 doporučujeme kvůli nižší spotřebě a lepší citlivosti. Podporu rádií ověř upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Jakou frekvenci použít v Česku a Polsku?</summary><div><p>Pásmo EU 868 MHz, v Meshtasticu region <code>EU_868</code>. Kupuj verzi rádia a antény na 868 MHz. Jiné země: ověř místní pravidla a seznam regionů upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Displej zůstává prázdný. Co teď?</summary><div><p>Zkontroluj zapojení BUSY a RST, ověř, že model displeje ve variantě odpovídá tvému panelu (2,13″ a 2,9″ mají různé ovladače), a změř 3,3 V na modulu. U desek Heltec je displej napájen přes Vext (GPIO45, LOW = zapnuto).</p></div></details>
<details class="qa"><summary>Jak připojím svůj uzel do sítě?</summary><div><p>Nastav region a pak použij URL kanálu, kterou centrální autorita zveřejňuje v kanálu jen pro čtení. Krok za krokem: <a href="#/openhw#connect">Open hardware → Připojení</a>.</p></div></details>
<details class="qa"><summary>Jak poznám, že je firmware pravý?</summary><div><p>Použij stránku <a href="#/verify">Ověření</a>: zkontroluje SHA-256 hash a podpisy ML-DSA-65 + Ed25519 přímo v prohlížeči. Pak porovnej otisk klíče s tím v README na GitHubu.</p></div></details>
<details class="qa"><summary>Můžu si Braillovu klávesnici nebo haptický pásek připojit sám?</summary><div><p>Ano. Oba doplňky jsou open hardware. Připojují se na volné GPIO nebo přes I²C; přiřazení pinů je v repu ve složce <code>hardware/addons/</code>. Viz <a href="#/access">Přístupnost</a> a <a href="#/openhw#selfhost">formulář pro svépomoc</a>.</p></div></details>
<details class="qa"><summary>Můžu si tu psát s ostatními uživateli?</summary><div><p>Ne. Na tomto webu se můžeš ptát jen centrální autority. Otázky a oficiální odpovědi se objevují v kanálu jen pro čtení; mezi uživateli tu nejsou žádné odpovědi ani komentáře.</p></div></details>

<h2 id="wiring">Který pin kam (DIY sestava)</h2>
<p>ESP32-S3-DevKitC-1 k modulu SX1262 a SPI e-paper modulu. Čísla GPIO odpovídají rozložení Heltec Wireless Paper, takže varianta zůstává povědomá. Odpovídající definice pro firmware je v repu v <code>variants/diy_s3_eink/variant.h</code>.</p>
{{PINS_DIY}}
<div class="callout warn"><p><b>Než zapneš napájení:</b> anténa připojená · rádio i displej na <b>3,3 V</b>, nikdy 5 V · zkontroluj společnou zem GND · nenapájej pin 3V3 z regulátoru, když je zapojené USB, pokud deska nemá ochranu (při nahrávání odpoj baterii).</p></div>
<h3>Zapojení napájení</h3>
{{POWER_CHAIN}}
<p>Piny Heltec Wireless Paper: <a href="#/hardware#pins">Hardware → piny</a>.</p>

<h2 id="ask">Zeptej se centrální autority</h2>
<div class="two">
  <div>
    <p>Napiš otázku anglicky, česky nebo polsky. Po odeslání se otevře předvyplněný formulář na GitHubu; odešli ho tam (potřebuješ bezplatný účet GitHub).</p>
    <ul>
      <li>Otázka se <b>automaticky přeloží</b> do EN, CS a PL.</li>
      <li>Zveřejní se v <b>kanálu jen pro čtení</b> níže a oficiální odpověď se doplní, jakmile bude hotová.</li>
      <li>Odpovídá jen centrální autorita. Vlákno je zamčené, takže si <b>uživatelé nemohou odpovídat mezi sebou</b>.</li>
      <li>Otázky jsou veřejné: <b>nepiš osobní údaje</b>. Na osobní záležitosti použij <a href="#/access">registrační formulář</a>.</li>
    </ul>
  </div>
  <div class="card">
    <form class="f" id="ask-form">
      <label><span class="lbl">Krátký název</span><input type="text" name="title" maxlength="80" placeholder="např. Po nahrání zůstává displej prázdný"></label>
      <label><span class="lbl">Téma</span><select name="topic"><option>Sestavení / zapojení</option><option>Firmware / nahrávání</option><option>Solár / napájení</option><option>Síť / připojení</option><option>Doplňky pro přístupnost</option><option>Společný nákup</option><option>Jiné</option></select></label>
      <label><span class="lbl">Tvoje otázka</span><textarea name="question" required></textarea></label>
      <button class="btn primary" type="submit">Zeptat se centrální autority →</button>
      <div class="form-msg" id="ask-msg" aria-live="polite"></div>
    </form>
  </div>
</div>

<h2 id="channel" class="channel-head">Kanál jen pro čtení <span class="lock">🔒 jen pro čtení</span></h2>
<p class="small">Otázky a oficiální odpovědi, automaticky přeložené. Kromě centrální autority sem nikdo nepíše.</p>
<div class="channel" id="channel"><p class="empty">…</p></div>`,

    verify: `
<p class="eyebrow">ověření</p>
<h1>Ověř build firmwaru</h1>
<p class="lede">Přetáhni sem tři soubory vydání. Vše se kontroluje lokálně v prohlížeči pomocí WebCrypto a přibalené postkvantové knihovny. Žádný soubor se nikam nenahrává.</p>
<p>Vydání jsou podepsaná postkvantovou kryptografií standardizovanou NIST (<b>ML-DSA-65, FIPS 204</b>) a navíc <b>Ed25519</b> jako hybridní záloha. Platný podpis znamená, že vydání opravdu pochází od vydavatele tohoto webu. Dokazuje pravost, <b>ne</b> schválení vládou nebo jinou autoritou.</p>
<div class="drops">
  <label class="drop" data-kind="bin"><b>firmware.bin</b><span class="small">binárka, kterou chceš nahrát</span><span class="fname">přetáhni soubor nebo klikni</span><input type="file" accept=".bin,application/octet-stream"></label>
  <label class="drop" data-kind="manifest"><b>manifest.json</b><span class="small">obsahuje hash souboru</span><span class="fname">přetáhni soubor nebo klikni</span><input type="file" accept=".json,application/json"></label>
  <label class="drop" data-kind="sig"><b>manifest.sig</b><span class="small">{ "ML-DSA-65": "…", "Ed25519": "…" }</span><span class="fname">přetáhni soubor nebo klikni</span><input type="file"></label>
</div>
<div class="cta" style="margin-top:0"><button class="btn" id="v-demo" type="button">Vyzkoušet na demo vydání</button><button class="btn" id="v-reset" type="button">Reset</button><span class="small" id="v-status" style="align-self:center">čekám na soubory: 0/3</span></div>
<div id="v-result" aria-live="polite"></div>`,

    security: `
<p class="eyebrow">bezpečnostní model</p>
<h1>Co hash a podpisy skutečně chrání</h1>
<h2>Hash vs. podpis, srozumitelně</h2>
<p><b>SHA-256 hash</b> je otisk souboru. Změní-li se ve firmwaru jediný bit, hash se úplně změní. Manifest obsahuje očekávaný hash, takže stránka <a href="#/verify">Ověření</a> pozná, jestli je tvůj <code>.bin</code> bit po bitu ten soubor, který vydavatel sestavil. Samotný hash ale neřekne, <i>kdo</i> ho sestavil.</p>
<p><b>Podpis</b> je kryptografické razítko vydavatele na manifestu. Když někdo manifest upraví nebo firmware vymění, podpis přestane sedět. Stránka Ověření ho kontroluje vůči klíči vydavatele, který je součástí webu jako <code>pubkey.json</code>.</p>
<h2>Proč postkvantová kryptografie</h2>
<p>Dnešní podpisy (např. Ed25519) stojí na matematice, kterou by budoucí velké kvantové počítače mohly prolomit. ML-DSA (FIPS 204) je standardizovaný NIST a navržený tak, aby odolal i kvantovému útočníkovi. Ed25519 zůstává vedle něj jako hybridní záloha.</p>
<div class="callout"><p>Platný podpis dokazuje, že vydání zveřejnil držitel soukromého klíče tohoto webu. <b>Není</b> to schválení vládou, regulátorem ani jinou autoritou a nepotvrzuje, že je firmware bezpečný, legální ve tvé zemi nebo bez chyb.</p></div>
<h2>Důvěra v samotný veřejný klíč</h2>
<p>Podpis je jen tak důvěryhodný jako klíč, vůči kterému ho ověřuješ. Stránka Ověření ukazuje SHA-256 otisk každého klíče vydavatele. Porovnej ho s otiskem zveřejněným druhým kanálem, například v README na GitHubu nebo na tištěné kartičce předané osobně. Pokud se liší, žádnému PASS nevěř.</p>
<h2>Co podepisování firmwaru NECHRÁNÍ</h2>
<ul>
  <li><b>Šifrování zpráv je samostatná věc.</b> Provoz v síti šifruje Meshtastic vlastním mechanismem pro každý kanál; viz <a href="https://meshtastic.org/docs/overview/encryption/" rel="noopener">oficiální dokumentace</a> {{UP}}.</li>
  <li><b>Za legalitu vysílání odpovídáš ty.</b> Pásma, výkon a pravidla střídy se liší podle země.</li>
  <li><b>Tento web je neoficiální.</b> Zdrojem pravdy je <a href="https://github.com/meshtastic/firmware" rel="noopener">repozitář firmwaru Meshtastic</a>.</li>
</ul>
<h2>Jak ověření technicky funguje</h2>
<ol>
  <li><code>firmware.bin</code> se zahashuje SHA-256 přes WebCrypto a porovná s polem <code>sha256</code> v <code>manifest.json</code>.</li>
  <li>Přesné bajty <code>manifest.json</code> se ověří vůči <code>manifest.sig</code>: ML-DSA-65 a Ed25519 přes lokálně přibalenou knihovnu (noble). PASS vyžaduje shodu hashe <i>a</i> platnost všech algoritmů ze <code>signature_algs</code>.</li>
  <li>Otisky klíčů (SHA-256 každého veřejného klíče) se zobrazí pro porovnání druhým kanálem.</li>
  <li>Nic se nenahrává, žádné cookies, žádné trackery.</li>
</ol>
<p>Vydavatelé podepisují vydání pomocí <code>node tools/sign.mjs</code>; viz README.</p>`,

    releases: `
<p class="eyebrow">vydání</p>
<h1>Vydání</h1>
<p class="lede">Generováno z <code>releases.json</code>. Každé vydání má <code>firmware.bin</code>, <code>manifest.json</code> a <code>manifest.sig</code>, které ověříš na stránce <a href="#/verify">Ověření</a>.</p>
<div class="callout warn"><p><b>Demo</b> vydání obsahuje náhodné bajty, ne skutečný firmware. Slouží jen k vyzkoušení ověřovače. Nikdy ho nenahrávej.</p></div>
<div id="rel-list" class="grid" style="grid-template-columns:1fr"><p>…</p></div>`,
  },
};
