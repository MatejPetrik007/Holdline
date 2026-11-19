const DISCLAIMER = `<p><b>Upozornění:</b> toto je neoficiální komunitní build a dokumentační web. Není spojen s projektem Meshtastic, není jím schválen ani podporován. Jakýkoli firmware používáš na vlastní riziko. Provoz LoRa rádia je regulován: frekvenční pásma, výkonové limity a licenční pravidla se liší podle země. Před vysíláním si ověř pravidla pro své místo, například v <a href="https://meshtastic.org/docs/" rel="noopener">oficiální dokumentaci Meshtastic</a>.</p>`;

export default {
  ui: {
    brand: 'Holdline',
    nav: { home: 'Úvod', demo: 'Simulace blackoutu', hardware: 'Hardware', build: 'Sestavení FW', solar: 'Solár', lab: 'Laboratoř', openhw: 'Open hardware', access: 'Přístupnost', form: 'Formulář', faq: 'Otázky a odpovědi', verify: 'Ověření', security: 'Bezpečnost', releases: 'Vydání' },
    up: 'ověř upstream',
    copy: 'KOPÍROVAT', copied: 'ZKOPÍROVÁNO',
    pinCols: ['Součástka', 'Signál', 'Pin ESP32-S3', 'K čemu slouží'],
    bomCols: ["Díl", "Příklad", "Poznámka", "Kde koupit"],
    shopNote: "Odkazy na obchody jsou ukázkové vyhledávací stránky, ne doporučení. Před objednáním ověř dostupnost, cenu a verzi 868 MHz.",
    computeCols: ["Sestava", "Hardware", "GPU / akcelerátor", "Co dělá", "Příkon"],
    board: {
      aria: "Schéma pinů ESP32-S3-DevKitC-1 s GPIO pro e-paper displej, rádio SX1262, měření baterie a doplňky",
      sub: "DIY zapojení · najeď na skupinu nebo pin",
      v33: "3V3 → rádio, e-paper",
      gnd: "GND (společná)",
      groups: {
        epaper: ["E-paper displej", "SPI + DC, RST, BUSY · GPIO2–7"],
        radio: ["LoRa rádio SX1262", "SPI + NRST, BUSY, DIO1 · GPIO8–14"],
        power: ["Napájení 3,3 V", "z LDO, nikdy ne 5 V"],
        gnd: ["Zem", "společná pro všechny moduly"],
        battery: ["Měření baterie", "dělič 100k/100k · GPIO1"],
        addon: ["Doplňky přístupnosti", "I²C 17/18 · haptika 21 · sériová linka náramku 15/16"],
        ui: ["Tlačítko BOOT", "už na desce · GPIO0"],
      },
      note: "Pořadí pinů odpovídá ESP32-S3-DevKitC-1 v1.1. Před pájením zkontroluj potisk své desky. Dodané uzly jsou už zapojené; tohle je pro ty, kdo si staví nebo opravují vlastní.",
    },
    demo: {
      translate: "Automatický překlad", modes: ["Žádný · originál PL", "Jazyky příjemců", "Všechny jazyky"],
      packets: "{n} B · {p} pakety", autoTag: "auto",
      trNote: "Překládá se v centru před odesláním: uzly při blackoutu nemají internet.",
      nodeScreen: "Displej uzlu", nodeLang: "Jazyk displeje", nodeHint: "Najeďte na uzel nebo na něj klepněte a uvidíte jeho displej.",
      langNames: { cs: "Čeština", pl: "Polski", en: "English" }, nodeOff: "vypnuto",
      who: "Krizové centrum · Cieszyn", outgoing: "Odchozí varování", fits: "{n} B · vejde se do jednoho paketu",
      channelLine: "Kanál OLZA · AES-256 · EU868", preset: "Preset LongFast · hop limit",
      routeCell: "SMS / cell broadcast", routeMesh: "Meshtastic mesh",
      mapLabel: "Mapa Cieszyna a Českého Těšína s mesh uzly na obou březích Olše",
      riverLabel: "Olše · hranice",
      legend: ["domácnost · varování přijato", "domácnost · čeká", "router na vyvýšeném místě", "BTS vysílač", "obecní relé"],
      replay: "Přehrát znovu", resend: "Odeslat znovu přes mesh", hopLimit: "Hop limit", speed: "Rychlost", speeds: ["Pomalu", "Normálně", "Rychle"],
      restore: "Obnovit všechny uzly", hint: "Klikni na router nebo pojmenovaný dům, vypneš ho, pak odešli znovu.", base: "základnová stanice",
      statsLabel: "Souhrn doručení", stats: ["Mobilní síť", "Domácnosti", "Max. skoků", "Vysílání", "Doba doručení"],
      nodes: { hq: "Krizové centrum", hospital: "Nemocnice", roof: "Střecha Těšín" },
      tipHq: "Krizové centrum: vysílá i routuje (ROUTER, stožár na střeše)", tipNode: "{name} ({c}) · {role} · kliknutím vypneš / zapneš",
      router: "router na vyvýšeném místě (ROUTER)", household: "domácí uzel (CLIENT_MUTE)", local: "obecní relé (místní anténa, CLIENT)",
      pills: { waiting: "čeká", sending: "odesílá", failed: "selhalo", delivered: "doručeno {r}/{t}" },
      phases: { normal: "SÍŤ V PROVOZU", blackout: "BLACKOUT · OBA BŘEHY", drained: "BATERIE VYSÍLAČŮ VYBITÉ", cell: "VAROVÁNÍ PŘES MOBILNÍ SÍŤ", mesh: "MESHTASTIC · ŘÍZENÝ FLOODING", done: "VAROVÁNÍ DORUČENO PŘES MESH" },
      log: {
        grid: "Síť v provozu · 3 BTS napájené ze sítě",
        meshReady: "Mesh: {r} vyvýšené routery + {n} domácích uzlů na baterii/solár, kanál OLZA",
        lost: "Výpadek proudu v Cieszyně i Českém Těšíně",
        battery: "BTS přešly na záložní baterie",
        depleted: "{t}: baterie vybitá, vysílač offline",
        sms: "SMS / cell broadcast → brány operátorů",
        noCell: "Žádný vysílač nedostupný · 0 obyvatel varováno",
        switching: "Přepínám na základnovou stanici Meshtastic…",
        resend: "──── nové odeslání přes mesh ────",
        translate: "Automatický překlad {from} → {to}",
        tx: "TX varování id=0x4F1A · {b} B · {p} pkt · hop_limit={h} · kanál OLZA",
        ack: "implicitní ACK · {from} přeposlal náš paket",
        quiet: "{n}: {from} to přeposlal dřív, mlčí",
        rx: "{n} ({c}) rx skok {hop} · SNR {snr} dB · přeposlání za {ms} ms",
        rxLimit: "{n} ({c}) rx skok {hop} · SNR {snr} dB · hop limit 0, nepřeposílá",
        rxHomes: "{k} domácností slyší {from} přímo · skok {hop} · CLIENT_MUTE, nepřeposílá",
        all: "Doručeno všem {t} domácnostem · {tx} vysílání · {q} obecních relé mlčelo",
        missed: "Nedoručeno: {n} domácností · pojmenované: {list}", offCount: " ({n} vypnuto)",
        tip: "Tip: zapni router zpět, nebo přidej druhé vyvýšené místo, které pokryje stejné ulice, a odešli znovu.",
      },
    },
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
    <p class="lede">Open-hardware LoRa uzel s firmwarem <a href="https://meshtastic.org" rel="noopener">Meshtastic</a> a E-Ink displejem. Každá domácnost ho dostane od státu <b>kompletně složený</b>, takže pájení je jen volitelné: schémata jsou otevřená pro každého, kdo si chce postavit vlastní. Pokud jsi neslyšící, nevidomý nebo hluchoslepý, zaregistruj se pro doplňky jako Braillova klávesnice nebo haptický pásek na kůži. Každé vydání firmwaru si před nahráním ověříš přímo v prohlížeči.</p>
    <div class="cta">
      <a class="btn primary" href="#/demo">Podívej se, jak funguje při blackoutu →</a>
      <a class="btn" href="#/hardware#pins">Postav si ho sám</a>
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
  <a class="card" href="#/hardware#pins"><div class="feature-icon">⚒</div><span class="num">05</span><h3>Dojde složený, otevřený ke stavbě</h3><p>Uzel dorazí připravený: zapojíš solární panel a umístíš ho. Schéma, zapojení pinů a seznam dílů jsou otevřené, pokud si chceš postavit vlastní. →</p></a>
  <a class="card" href="#/access"><div class="feature-icon">⠿</div><span class="num">06</span><h3>Přístupné pro neslyšící a nevidomé</h3><p>Zaregistruj se pro doplňky jako Braillova klávesnice nebo haptický pásek na kůži. Jsou také open source, takže si je můžeš postavit i sám. →</p></a>
</div>

<div class="cta"><a class="btn accent" href="#/verify">Ověřit soubor firmwaru</a><a class="btn" href="#/build">Sestavit firmware sám</a><a class="btn" href="#/solar#lab">Otevřít laboratoř: kalkulačky vysílání a soláru →</a></div>

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


    demo: `
<p class="eyebrow">simulace · Cieszyn (PL) / Český Těšín (CZ)</p>
<h1>Blackout na Olši</h1>
<p class="lede">Na obou březích řeky vypadl proud. Mobilní vysílače vydrží na baterie pár hodin a pak utichnou. Krizové centrum v Cieszyně potřebuje říct zhruba 300 domácnostem v obou zemích, kde najdou vodu a nabíjení. Podívej se, jak stejné varování selže v mobilní síti a pak se dostane do každého domu ze střešního stožáru krizového centra a ze dvou dalších vyvýšených míst: vysoké střechy v Českém Těšíně a vodojemu v Mnisztwu.</p>
<div id="sim"></div>

<div class="two">
  <div class="card"><h2>Proč telefony utichnou</h2>
    <p>Vysílač potřebuje proud ze sítě a funkční páteřní spojení. Většina má baterie na pár hodin. Při dlouhém regionálním blackoutu se vybijí jedna po druhé a SMS ani cell broadcast nemají kudy projít.</p>
    <p>Hranice přidává druhou mezeru. Každá země varuje přes vlastní operátory, takže obyvatel Českého Těšína s českou SIM nemusí varování polského úřadu vůbec dostat, i když je pár set metrů daleko za mostem.</p></div>
  <div class="card"><h2>Proč mesh funguje dál</h2>
    <p>Uzly Meshtastic jsou malá LoRa rádia s minimální spotřebou: jeden článek 18650 a <a href="#/solar">solární panel</a> velikosti dlaně je udrží v chodu celé dny. Nepotřebují vysílač, SIM ani operátora. E-Ink displej ukáže varování i bez telefonu.</p>
    <p>Polsko i Česko sdílí stejné bezlicenční pásmo EU868, takže uzly na obou březích jsou v jednom kanálu. Řeka je hranicí pro sítě, ne pro rádio.</p></div>
</div>

<h2>Jak se zpráva šíří</h2>
<ol class="steps">
  <li><h3>Centrum vysílá i routuje</h3><p>Uzel krizového centra je na vysokém stožáru na střeše a běží jako router: varování napíše, odvysílá s hop limitem (výchozí je 3) a přeposílá provoz pro celé okolí. Všechny uzly v dosahu ho uslyší ve stejný okamžik, ve městě typicky 1–5 km, z vyvýšeného místa mnohem dál: při přímé viditelnosti zvládly spoje Meshtasticu přes 300 km. Tady samotné centrum dosáhne přímo na 291 z 314 domů.</p></li>
  <li><h3>Vyvýšená místa doplní mezery, domy poslouchají</h3><p>Dva další routery, na střeše v Těšíně a na vodojemu v Mnisztwu, paket jednou přepošlou. Pokryjí ulice, na které anténa centra nevidí, třeba Mosty a Koňákov. Většina domů ho dostane na jeden nebo dva skoky, ať má město 30 domů, nebo 3 000.</p></li>
  <li><h3>Domácnosti nepřeposílají, obecní relé ano</h3><p>Běžné domácí uzly běží v roli <code>CLIENT_MUTE</code>: varování přijmou a zobrazí, ale nikdy ho nevysílají dál. Kdyby stovky domů opakovaly každý paket, zahltily by sdílený kanál. Okrajové vesnice mají jeden dům s místní anténou v běžné roli <code>CLIENT</code> (trojúhelníky na mapě): chvíli počká a varování pošle dál, pokud předtím neuslyší, že ho už přeposlal router nebo soused.</p></li>
  <li><h3>Duplikáty se zahazují</h3><p>Každý paket má ID. Uzel, který ho už viděl, kopie zahodí, takže dům, který slyší centrum i router, ukáže varování jednou. Hop limit (nejvýš 7) omezuje, kolikrát se paket přepošle; nepočítá domy.</p></li>
  <li><h3>Odesílatel ví, že zpráva odešla</h3><p>Když centrum uslyší svůj paket přeposlaný, bere to jako implicitní potvrzení.</p></li>
  <li><h3>Počítej se ztrátou jednoho bodu</h3><p>Vypni střechu v Těšíně a odešli znovu: varování do Mostů a Koňákova stejně dojde, skok po skoku přes obecní relé ve Stanislavicích a v Koňákově. Vypni k tomu i Stanislavice: řetěz se přeruší a 19 domů varování nedostane. S vypnutou střechou nastav hop limit na 1 a bez varování zůstanou i domy kolem Koňákova. Ve skutečné obci by měla každá ulice ležet aspoň ve dvou kruzích a centrum potřebuje vlastní záložní napájení: když vypadne, neodejde nic.</p></li>
  <li><h3>Každý displej v jazyce svého majitele</h3><p>Každý uzel má vlastní jazyk displeje: češtinu, polštinu nebo angličtinu. V simulaci na uzel najeď a jazyk změň. Krizové centrum napíše varování jednou a zvolí, jak se přeloží: jen originál, automaticky do jazyků, které používají příjemci, nebo do všech jazyků. Překládá se v centru před odesláním, protože uzly při blackoutu nemají internet. Pokud jazyk uzlu odeslán nebyl, uzel ukáže originál. Víc jazyků znamená víc bajtů: nad 233 B se varování rozdělí do několika paketů.</p></li>
</ol>

<h2>Mobilní síť vs. mesh při blackoutu</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Mobilní síť</th><th>Meshtastic mesh</th></tr></thead><tbody>
<tr><td>Potřebuje proud ze sítě</td><td>Ano, baterie vydrží hodiny</td><td><b>Ne</b>, baterie a solár na dny</td></tr>
<tr><td>Centrální bod selhání</td><td>Vysílače, páteř, jádro sítě</td><td><b>Žádný</b>, pokud každou ulici pokrývají dvě vyvýšená místa</td></tr>
<tr><td>Přes hranici PL–CZ</td><td>Oddělení operátoři i varovné systémy</td><td><b>Jeden společný kanál</b> na obou březích</td></tr>
<tr><td>Kapacita</td><td>Hlas, data, video</td><td>Jen krátký text, asi 200 bajtů na zprávu, sdílený vysílací čas</td></tr>
<tr><td>Příprava</td><td>Už je v každé kapse</td><td>Uzly musí být rozmístěné, nabité a v kanálu ještě před blackoutem: proto každá domácnost jeden <a href="#/hardware#pins">dostane složený</a></td></tr>
</tbody></table></div>
<p class="small">Mesh nenahrazuje sirény, rozhlas ani pochůzky dům od domu. Přidává kanál, který přežije, když ostatní vypadnou. Neslyšící a hluchoslepí obyvatelé dostanou stejné varování jako vibrace přes <a href="#/access">haptický náramek</a>. Simulace zjednodušuje dosah a časování, ignoruje terén a kolize paketů; polohy uzlů jsou ilustrační.</p>`,
    hardware: `
<p class="eyebrow">open hardware</p>
<h1>Dojde složený. Otevřený, takže si ho můžeš postavit sám.</h1>
<p class="lede">Každá domácnost dostane uzel od státu <b>kompletně složený, nahraný a otestovaný</b>. Nic nemusíš pájet. Schémata, zapojení pinů a seznam dílů jsou otevřené, aby si ho kdokoli, kdo chce, mohl postavit, opravit nebo vylepšit doma.</p>
<div class="toc"><a href="#/hardware#box">Co dorazí</a><a href="#/hardware#paths">Tři cesty k uzlu</a><a href="#/hardware#boards">Podporované desky</a><a href="#/hardware#pins">Který pin kam</a><a href="#/hardware#bom">Díly a kde koupit</a><a href="#/hardware#connect">Připojení vlastního uzlu</a><a href="#/hardware#sign">Znakový jazyk: díly</a><a href="#/form#build">Postavím si sám: dej vědět</a></div>

<h2 id="box">Co dorazí v krabici</h2>
<div class="two">
  <div>
    <ul>
      <li><b>Složený uzel</b> v odolné krabičce IP65: deska, LoRa rádio, E-Ink displej, baterie, nabíječka a regulátor, vše zapojené, zapájené, nahrané <a href="#/verify">ověřeným firmwarem</a> a nastavené na region <code>EU_868</code> a kanál sítě.</li>
      <li><b>Anténa</b> (šroubovací SMA).</li>
      <li><b>Solární panel</b> s konektorem, který nejde zapojit obráceně.</li>
      <li><b>Držák</b> a tištěný rychlý návod (na požádání v Braillově písmu nebo velkým písmem).</li>
    </ul>
  </div>
  <ol class="steps">
    <li><h3>Našroubuj anténu</h3><p>Jako první.</p></li>
    <li><h3>Zapoj solární panel</h3><p>Jediné spojení, které děláš sám. Bez nářadí.</p></li>
    <li><h3>Umísti ho vysoko, panelem na jih</h3><p>Parapet, balkon nebo střecha. Výška je nejdůležitější.</p></li>
    <li><h3>Stiskni tlačítko</h3><p>Displej ukáže <code>MESH · n nodes</code>. Hotovo.</p></li>
  </ol>
</div>

<h2 id="paths">Tři cesty k uzlu</h2>
<div class="grid">
  <div class="card"><span class="num">A · VÝCHOZÍ</span><h3>Dojde složený</h3><p>Nemusíš nic dělat: každá registrovaná adresa dostane složený uzel automaticky. Pájení není nikdy potřeba. Termíny doručení zveřejňujeme v <a href="#/faq#channel">kanálu jen pro čtení</a>.</p></div>
  <a class="card" href="#/form#build"><span class="num">B · VOLITELNĚ</span><h3>Postav si ho sám</h3><p>Chceš si ho zapájet sám? Dej nám vědět formulářem níže, ať ti stát žádný neposílá. Sady dílů jsou ve společném nákupu. →</p></a>
  <a class="card" href="#/access"><span class="num">C</span><h3>Neslyšící, nevidomí, hluchoslepí</h3><p>Dojde složený s doplňky, které ti sedí. Hluchoslepí ho dostanou osobně i s nastavením. →</p></a>
</div>

<h2 id="boards">Desky ESP32-S3 s E-Ink displejem</h2>
<p>Tento build cílí na desky ESP32-S3 s E-Ink (e-paper) displejem, takže uzel ukazuje zprávy a telemetrii a skoro nic nespotřebuje. Chceš si to zapojit sám? Viz <a href="#/hardware#pins">open-hardware DIY sestava</a>.</p>
<div class="callout warn"><p><b>Specifikace si nevymýšlíme.</b> Velikosti displejů, rádiové čipy, mapování pinů a seznam podporovaných desek žijí upstream a mění se. Každou položku {{UP}} si před nákupem nebo nahráním ověř v <a href="https://github.com/meshtastic/firmware" rel="noopener">repozitáři firmwaru</a> (definice desek, <code>platformio.ini</code>) a na <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">meshtastic.org</a>.</p></div>

<h3>Kandidátní desky</h3>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Deska</th><th>Env</th><th>Displej</th><th>LoRa rádio</th><th>Stav</th></tr></thead><tbody>
<tr><td><b>Heltec Wireless Paper</b></td><td><code>heltec-wireless-paper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát · referenční deska webu</td></tr>
<tr><td><b>Heltec Vision Master E213</b></td><td><code>heltec-vision-master-e213</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát</td></tr>
<tr><td><b>Heltec Vision Master E290</b></td><td><code>heltec-vision-master-e290</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát</td></tr>
<tr><td><b>LilyGO T5 S3 E-Paper</b></td><td><code>lilygo-t5-s3-epaper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandidát</td></tr>
<tr><td><b>DIY: ESP32-S3-DevKitC-1 + SX1262 + e-paper</b></td><td><code>diy-s3-eink</code> (toto repo)</td><td>2,13″ / 2,9″ SPI</td><td>modul SX1262</td><td>open hardware · <a href="#/hardware#pins">návod</a></td></tr>
</tbody></table></div>

<h3 id="heltec-pins">Heltec Wireless Paper: který pin je k čemu</h3>
<p>Vše je už zapojené na desce. Mapa pomáhá při ladění, připojení doplňků a čtení variant souboru. Zdroj: <code>variants/heltec_wireless_paper/variant.h</code> {{UP}}.</p>
{{PINS_HELTEC}}
<p class="small">Volné GPIO pro doplňky (Braillova klávesnice, haptický pásek) závisí na revizi desky. Před připojením čehokoli zkontroluj potisk konektoru na desce a variant soubor.</p>

<h3>Jak si desku ověřit sám</h3>
<ol>
  <li>Otevři <a href="https://github.com/meshtastic/firmware" rel="noopener">repo firmwaru</a> a v <code>platformio.ini</code> hledej sekce <code>[env:…]</code> odpovídající tvé desce.</li>
  <li>Ve složce <code>variants/</code> zkontroluj definice displeje a pinů pro svou desku.</li>
  <li>Porovnej s <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">oficiální dokumentací hardwaru</a> (podporovaná zařízení a regionální frekvence).</li>
</ol>

<h2 id="pins">Který pin kam</h2>
<p>Potřebuješ jen, když si uzel stavíš nebo opravuješ sám. Dodané uzly jsou zapojené přesně takhle.</p>
{{BOARD}}
<p>Celé tabulky: <a href="#/faq#wiring">Otázky a odpovědi → zapojení</a> · Heltec Wireless Paper (deska v dodaném uzlu): <a href="#/hardware#heltec-pins">Hardware → piny</a>.</p>

<h2 id="bom">Díly a kde je koupit</h2>
{{BOM}}
<p>Návrhové soubory: <code>hardware/</code> a <code>variants/diy_s3_eink/</code> v <a href="{{REPO}}">repozitáři</a>. Licence hardwaru CERN-OHL-S-2.0, firmware GPL-3.0 (jako upstream). Díly pro doplňky přístupnosti: <a href="#/access#build">Přístupnost → postav si sám</a>.</p>

<h2 id="sign">Znakový jazyk na displeji: díly a nákup</h2>
<p>Pro neslyšící, jejichž prvním jazykem je znakový jazyk, umí hub ukázat zprávy z mesh <b>ve znakovém jazyce</b>. Běží na stejném <b>NVIDIA Jetson Orin Nano</b> jako živé titulky, takže pokud poslechový hub už máš, přidáváš jen displej, baterii a tlačítko. Systém je normálně vypnutý; když přijde zpráva, náramek zavibruje a ty víš, že ho máš zapnout. Jak to funguje: <a href="#/access#sign">Přístupnost → zprávy ve znakovém jazyce</a>.</p>
{{BOM_SIGN}}
<p class="small">Sady dílů pro znakový displej jsou ve společném nákupu: zaškrtni <b>Znakový displej</b> ve <a href="#/form#build">formuláři pro vlastní stavbu</a>. Od státu ho dostaneš složený a nastavený přes <a href="#/form#adapted">registraci přístupnosti</a>.</p>

<h2 id="connect">Připojení vlastního uzlu</h2>
<p class="small">Dodané uzly jsou už nastavené. Tyto kroky jsou jen pro uzly, které sis postavil sám.</p>
<ol class="steps">
  <li><h3>Nastav region</h3><p>V aplikaci Meshtastic nebo v CLI nastav LoRa region <code>EU_868</code> pro Česko a Polsko (jiné země: ověř upstream).</p><pre><code>meshtastic --set lora.region EU_868</code></pre></li>
  <li><h3>Přidej kanál sítě</h3><p>Centrální autorita zveřejňuje URL / QR kód kanálu v <a href="#/faq#channel">kanálu jen pro čtení</a>.</p><pre><code>meshtastic --seturl "&lt;URL kanálu z kanálu jen pro čtení&gt;"</code></pre></li>
  <li><h3>Ověř, že jsi v síti</h3><p>Během pár minut by se v seznamu uzlů měli objevit sousedé. Nikdo? Dej anténu výš, zkontroluj region a přečti si <a href="#/faq">otázky a odpovědi</a>.</p></li>
</ol>

<h2 id="selfhost">Postavím si sám: dej vědět</h2>
<p>Chceš si postavit vlastní uzel nebo doplňky? Dej vědět v <a href="#/form#build">registračním formuláři</a>, aby ti stát uzel neposílal a mohl ti rezervovat sady dílů.</p>`,

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
<div class="callout"><p><b>Zkuste vlastní čísla:</b> <a href="#/solar#solar-lab">solární kalkulačka v laboratoři</a> navrhne panel a baterii pro libovolný měsíc a nasimuluje dva týdny počasí.</p></div>
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


    access: `
<p class="eyebrow">přístupnost</p>
<h1>Mesh zprávy pro neslyšící, nevidomé a hluchoslepé</h1>
<p class="lede">Každý uzel dorazí složený. Pokud jsi neslyšící, nevidomý nebo hluchoslepý, stát ho dodá s doplňky, které ti sedí, nastavené a otestované. Hluchoslepí lidé ho dostanou <b>osobně</b> od instruktora, který komunikuje tak jako oni.</p>
<div class="toc"><a href="#/access#who">Kdo dostane co</a><a href="#/access#deafblind">Jak to funguje pro hluchoslepé</a><a href="#/access#build">Haptický náramek Pro: postav si sám</a><a href="#/access#sign">Zprávy ve znakovém jazyce</a><a href="#/access#compute">Jaký počítač nebo GPU</a><a href="#/form#adapted">Registrace</a></div>

<h2 id="who">Kdo dostane co</h2>
<div class="grid">
  <div class="card"><div class="feature-icon">⠿</div><h3>Nevidomí a slabozrací</h3>
    <ul><li><b>Braillova klávesnice</b> (6- nebo 8bodová, akordová), která píše přímo do uzlu.</li><li>Zprávy čte nahlas odečítač obrazovky v telefonu přes aplikaci Meshtastic {{UP}}.</li><li>Hmatové značky na krabičce a tlačítkách; rychlý návod v Braillově písmu a jako audio.</li></ul>
    <p class="small">Doručení: kurýr, a pokud chceš, provedení po telefonu.</p></div>
  <div class="card"><div class="feature-icon">≋</div><h3>Neslyšící a nedoslýchaví</h3>
    <ul><li><b>Haptický náramek Pro</b> od státu: 8 motorků kolem zápěstí.</li><li>Přímo v náramku rozpozná důležité zvuky (siréna, požární hlásič, zvonek, klepání, tvoje jméno) a každému dá vlastní vibrační vzor.</li><li>Zprávy z mesh zavibrují a objeví se na E-Ink displeji.</li><li>Volitelný <b>poslechový hub</b>: živé titulky řeči v místnosti na E-Ink a v telefonu.</li><li><b>Znakový displej</b> k hubu: zprávy a varování v českém nebo polském znakovém jazyce. <a href="#/access#sign">Jak to funguje →</a></li></ul>
    <p class="small">Doručení: kurýr, s videem nastavení v českém znakovém jazyce a textem.</p></div>
  <div class="card"><div class="feature-icon">✋</div><h3>Hluchoslepí</h3>
    <ul><li><b>Haptický náramek Pro v Braillově rozložení</b>: 6 motorků na předloktí tvoří jeden Braillův znak, další 2 hlásí mezeru a poplach. Zprávy cítíš písmeno po písmenu.</li><li><b>Braillova klávesnice</b> pro odpověď; každou klávesu potvrdí vibrace.</li><li>Nic nezávisí na zraku ani sluchu.</li></ul>
    <p class="small">Doručení: <b>osobně</b>, viz níže.</p></div>
</div>

<h2 id="deafblind">Jak to funguje pro hluchoslepé</h2>
<div class="two">
  <div>
    <h3>Doručení a nastavení</h3>
    <ul>
      <li>Žádné dopisy ani telefonáty: ozveme se přes kanál, který uvedeš ve formuláři, obvykle přes asistenta, tlumočníka nebo tvou organizaci.</li>
      <li>Přijde vyškolený instruktor a komunikuje tak, jak ti vyhovuje: taktilní znakový jazyk, Lormova abeceda, psaní do dlaně nebo Braillovo písmo.</li>
      <li>Společně nastavíte sílu vibrací a rychlost čtení, procvičíte vzory a namontujete uzel. Krabička má hmatové značky a solární konektor nejde zapojit obráceně.</li>
      <li>Lze spárovat důvěryhodnou osobu, která dostane tvoje SOS. Po pár týdnech následná návštěva.</li>
    </ul>
  </div>
  <ol class="steps">
    <li><h3>Přijde zpráva</h3><p>Uzel ji předá náramku. Všechny motorky dají dva dlouhé pulzy: pozor.</p></li>
    <li><h3>Začneš číst</h3><p>Ťukni na náramek. Písmena běží jako Braillovy znaky na motorcích 2 × 3, 1–4 za sekundu podle nastavení. Ťuknutí = pauza, dvojí ťuknutí = znovu.</p></li>
    <li><h3>Odpovíš</h3><p>Piš na Braillově klávesnici; každý znak se vrátí jako vibrace. Enter ho odešle do mesh.</p></li>
    <li><h3>Varování nepřehlédneš</h3><p>Varování centrální autority má silný opakovaný vzor, který běží, dokud ho nepotvrdíš podržením klávesy.</p></li>
    <li><h3>SOS</h3><p>Podrž dvě klávesy 3 sekundy: SOS odejde tvým důvěryhodným osobám a centrální autoritě.</p></li>
  </ol>
</div>

<h2 id="build">Haptický náramek Pro: co to je, aby sis ho mohl postavit sám</h2>
<p>Náramek dodává stát, ale je to open hardware jako všechno ostatní. Je to ESP32-S3 s mikrofonem, který přes haptické budiče ovládá 8 lineárních rezonančních aktuátorů (LRA). Funguje se <b>standardním Meshtasticem</b>: přijaté zprávy jdou do náramku přes Serial modul v režimu <code>TEXTMSG</code>, jednoduchý náramek s jedním motorkem může místo toho použít modul External Notification {{UP}}. Žádný fork firmwaru.</p>
<div class="two">
  <div><h3>Zapojení</h3><ul>
    <li>XIAO <code>D4/SDA</code>, <code>D5/SCL</code> → I²C mux TCA9548A → 8 × DRV2605L (jeden na kanál muxu) → 8 × LRA.</li>
    <li>XIAO <code>D6/TX</code> → GPIO16 uzlu, XIAO <code>D7/RX</code> ← GPIO15 uzlu, společná GND. Nebo bezdrátově přes BLE.</li>
    <li>Rozložení na zápěstí (neslyšící): 8 motorků v kruhu, takže zvuk ukáže i směr. Braillovo rozložení (hluchoslepí): znak 2 × 3 na předloktí + 2 ovládací motorky.</li>
    <li>1S LiPo 500–1000 mAh na bateriové plošky XIAO.</li>
  </ul></div>
  <div><h3>Piny uzlu pro doplňky</h3>{{PINS_ADDONS}}</div>
</div>
{{BOM_ADDONS}}
<div class="callout warn"><p><b>Stav: referenční návrh.</b> Firmware náramku a soubory krabičky zveřejníme v <code>hardware/addons/</code> v repozitáři. Motorky mají proudové špičky: napájej je z baterie přes budiče, nikdy z GPIO. Zaoblená izolovaná krabička; žádná nepřetržitá vibrace delší než pár sekund.</p></div>

<h2 id="sign">Zprávy ve znakovém jazyce</h2>
<p>Psaná čeština nebo polština není pro každého neslyšícího prvním jazykem. Proto hub umí ukázat zprávy ve <b>znakovém jazyce</b>: českém (ČZJ), polském (PJM) nebo v mezinárodním znakovém systému. Běží na stejném NVIDIA Jetson Orin Nano jako poslechový hub, úplně offline, a zobrazuje se na 10″ displeji.</p>
<div class="two">
  <ol class="steps">
    <li><h3>Přijde zpráva</h3><p>Uzel ji předá náramku. Náramek si ji uloží a zavibruje vzorem <b>„znakový jazyk“</b>: tři vlny dokola kolem zápěstí. Text se zároveň objeví na E-Ink.</p></li>
    <li><h3>Zapneš systém</h3><p>Stiskni velké tlačítko na stojanu displeje. Jetson naběhne zhruba za minutu a přes BLE si z náramku stáhne zprávy, které přišly, když byl vypnutý.</p></li>
    <li><h3>Zpráva ve znakovém jazyce</h3><p>Displej přehraje zprávu ve tvém znakovém jazyce s titulky. Dotkni se displeje = znovu, podrž = pomaleji.</p></li>
    <li><h3>Systém se zase vypne</h3><p>Po 10 minutách bez dotyku se hub sám vypne a šetří baterii. Náramek dál hlídá mesh i zvuky v místnosti.</p></li>
  </ol>
  <div>
    <h3>Co uvidíš ve znakovém jazyce</h3>
    <ul>
      <li><b>Varování centrální autority</b> (povodeň, evakuace, úkryt, pitná voda, výpadek proudu, konec nebezpečí…): předtočená videa, která natáčejí neslyšící rodilí mluvčí s organizacemi neslyšících. Varování nese kód šablony; místo a čas se doplní textem a prstovou abecedou.</li>
      <li><b>Ostatní zprávy</b> uvidíš jako velký čitelný text. Strojový překlad volného textu do znakového jazyka zatím není dost spolehlivý na to, abychom ho používali na varování.</li>
      <li>Knihovnu videí aktualizuje centrální autorita <a href="#/verify">podepsaným vydáním</a>, stejně jako firmware.</li>
      <li>Jazyk vybereš v <a href="#/form#adapted">registraci</a>.</li>
    </ul>
  </div>
</div>
<div class="callout warn"><p><b>Stav: referenční návrh.</b> Žádné video nevznikne bez neslyšících rodilých mluvčích; avatar je nenahradí. Varování na náramku a na E-Ink dorazí vždy, i když systém nezapneš. Díly a nákup: <a href="#/hardware#sign">Open hardware → znakový jazyk</a>.</p></div>

<h2 id="compute">Jaký počítač nebo GPU to utáhne</h2>
<p>Rozpoznávání zvuků běží přímo v náramku bez GPU, takže funguje i při blackoutu. Převod řeči na text potřebuje víc výkonu: to je volitelný poslechový hub. Hub od státu je Jetson Orin Nano; tabulka ukazuje, co dalšího stačí, když si ho postavíš sám.</p>
{{COMPUTE}}
<p class="small">Orientační hodnoty. Převod řeči na text: <a href="https://github.com/ggml-org/whisper.cpp" rel="noopener">whisper.cpp</a> nebo <a href="https://github.com/SYSTRAN/faster-whisper" rel="noopener">faster-whisper</a>, obojí open source a běží úplně offline. Hub potřebuje síť nebo velkou baterii; při blackoutu náramek sám dál doručuje zprávy z mesh i zvuková upozornění.</p>

<div class="callout"><p><b>Raději si ho postavíš sám?</b> Použij <a href="#/form#build">formulář pro vlastní stavbu</a>; sady dílů jsou ve společném nákupu.</p></div>

<h2 id="register">Registrační formulář</h2>
<p>O upravený uzel s doplňky požádáš v <a href="#/form#adapted">registračním formuláři</a>. Je jeden pro všechno a údaje jdou soukromě jen centrální autoritě.</p>`,

    form: `
<p class="eyebrow">registrace</p>
<h1>Registrační formulář</h1>
<p class="lede">Běžný uzel dostane každá domácnost složený, aniž by cokoli vyplňovala. Tento jediný formulář vyplň, jen pokud kvůli zdravotnímu postižení potřebuješ upravenou verzi, nebo pokud si chceš uzel postavit sám. Údaje jdou soukromě centrální autoritě a nikdy se nezveřejňují.</p>
<div class="callout" id="adapted"><p><b>Máš zdravotní postižení? Požádej o upravenou verzi.</b> Stát ti dodá uzel složený, s doplňky, které potřebuješ, už připojenými a nastavenými:</p>
<ul><li>Braillova klávesnice</li><li>Haptický náramek Pro</li><li>Poslechový hub (řeč na text)</li><li>Znakový displej (zprávy ve znakovém jazyce)</li><li>Hmatové značky na krabičce a tlačítkách, stručný návod v Braillově písmu nebo jako audio</li></ul>
<p class="small">Co který doplněk umí: <a href="#/access">Přístupnost</a>.</p></div>
<div class="card">
<form class="f reg" data-kind="registration">
  <div class="row2">
    <label><span class="lbl">Celé jméno</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">Preferovaný jazyk</span><select name="lang"><option>Čeština</option><option>Polski</option><option>English</option></select></label>
  </div>
  <div class="row2">
    <label><span class="lbl">E-mail</span><input type="email" name="email" autocomplete="email"></label>
    <label><span class="lbl">Telefon (pro SMS)</span><input type="tel" name="phone" autocomplete="tel"></label>
  </div>
  <div class="row2">
    <label><span class="lbl">Země</span><select name="country"><option>Česko</option><option>Polsko</option><option>Slovensko</option><option>Jiná</option></select></label>
    <label><span class="lbl">Město / region</span><input type="text" name="region"></label>
  </div>
  <label><span class="lbl">Doručovací adresa</span><textarea name="address" rows="3" autocomplete="street-address" required></textarea></label>
  <label><span class="lbl">Jak tě máme kontaktovat?</span><select name="contact"><option>E-mail</option><option>SMS</option><option>Přes asistenta, tlumočníka nebo pečovatele</option><option>Přes mou organizaci neslyšících, nevidomých nebo hluchoslepých</option><option>Dopis v Braillově písmu</option></select></label>
  <label><span class="lbl">Co potřebuješ?</span><select name="request"><option>Upravenou verzi: složený uzel s doplňky (zdravotní postižení)</option><option>Neposílejte: postavím si vlastní</option><option>Pošlete i tak: stavím další uzel navíc</option></select></label>
  <h3 id="adapted-version">Upravená verze: jen při zdravotním postižení</h3>
  <fieldset><legend>Jsem</legend>
    <label class="check"><input type="checkbox" name="deaf"> Neslyšící nebo nedoslýchavý</label>
    <label class="check"><input type="checkbox" name="blind"> Nevidomý nebo slabozraký</label>
    <label class="check"><input type="checkbox" name="deafblind"> Hluchoslepý</label>
  </fieldset>
  <fieldset><legend>Potřebuji doplňky</legend>
    <label class="check"><input type="checkbox" name="braille"> Braillova klávesnice</label>
    <label class="check"><input type="checkbox" name="haptic"> Haptický náramek Pro</label>
    <label class="check"><input type="checkbox" name="hub"> Poslechový hub (řeč na text)</label>
    <label class="check"><input type="checkbox" name="sign"> Znakový displej (zprávy ve znakovém jazyce)</label>
    <label class="check"><input type="checkbox" name="tactile_marks"> Hmatové značky a stručný návod v Braillově písmu nebo jako audio</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Rozložení náramku</span><select name="band_layout"><option>Kruh na zápěstí (neslyšící)</option><option>Braillův znak na předloktí (hluchoslepí)</option><option>Nevím, rozhodneme při nastavení</option></select></label>
    <label><span class="lbl">Braillovo rozložení</span><select name="braille_layout"><option>6bodové</option><option>8bodové</option><option>Nevím</option></select></label>
  </div>
  <label><span class="lbl">Znakový jazyk na displeji</span><select name="sign_lang"><option>Netýká se</option><option>Český znakový jazyk (ČZJ)</option><option>Polský znakový jazyk (PJM)</option><option>Mezinárodní znakový systém</option></select></label>
  <label><span class="lbl">Hluchoslepí: jak s tebou má instruktor komunikovat?</span><select name="tactile"><option>Netýká se</option><option>Taktilní znakový jazyk</option><option>Lormova abeceda</option><option>Psaní do dlaně</option><option>Braillovo písmo</option><option>Přes mého tlumočníka nebo asistenta</option></select></label>
  <label><span class="lbl">Asistent, tlumočník nebo důvěryhodná osoba (nepovinné)</span><input type="text" name="trusted"></label>
  <h3 id="build">Postavím si sám: jen pokud stavíš</h3>
  <fieldset><legend>Co si postavíš?</legend>
    <label class="check"><input type="checkbox" name="build_node" checked> Mesh uzel (ESP32-S3 + E-Ink + solár)</label>
    <label class="check"><input type="checkbox" name="build_braille"> Braillova klávesnice</label>
    <label class="check"><input type="checkbox" name="build_haptic"> Haptický náramek Pro</label>
    <label class="check"><input type="checkbox" name="build_hub"> Poslechový hub (řeč na text)</label>
    <label class="check"><input type="checkbox" name="build_sign"> Znakový displej (zprávy ve znakovém jazyce)</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Přidáš se ke společnému nákupu?</span><select name="groupbuy"><option value="yes">Ano, rezervujte mi sady dílů</option><option value="no">Ne, díly si koupím sám</option></select></label>
    <label><span class="lbl">Počet sad</span><input type="number" name="qty" min="1" max="50" value="1"></label>
  </div>
  <label><span class="lbl">Zkušenosti</span><select name="experience"><option>První projekt s elektronikou</option><option>Umím pájet a nahrávat desky</option><option>Zkušený maker</option></select></label>
  <label><span class="lbl">Něco dalšího, co bychom měli vědět?</span><textarea name="notes" rows="3"></textarea></label>
  <label class="check"><input type="checkbox" name="consent" required> Souhlasím, že centrální autorita zpracuje tyto údaje, aby mi dodala uzel a doplňky, upravila nebo zrušila mé doručení a zorganizovala společný nákup.</label>
  <button class="btn primary" type="submit">Odeslat registraci</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    faq: `
<p class="eyebrow">otázky a odpovědi</p>
<h1>Otázky a odpovědi: technické dotazy</h1>
<p class="lede">Jak to složit dohromady, který pin je k čemu a jak se dostat do sítě. Nenašel jsi odpověď? <a href="#/faq#ask">Zeptej se centrální autority</a>; odpověď se zveřejní ve všech třech jazycích v kanálu jen pro čtení.</p>
<div class="toc"><a href="#/faq#assembly">Sestavení</a><a href="#/faq#wiring">Který pin kam</a><a href="#/faq#ask">Položit otázku</a><a href="#/faq#channel">Kanál jen pro čtení</a></div>

<h2 id="assembly">Když uzel dorazí</h2>
<details class="qa" open><summary>Co mám udělat, když uzel dorazí?</summary><div>
<p>Skoro nic. Dorazí <b>složený, zapájený, nahraný a nastavený</b>.</p>
<ol>
  <li>Našroubuj anténu. Vždy dřív, než uzel dostane napájení.</li>
  <li>Zapoj solární panel (konektor nejde zapojit obráceně).</li>
  <li>Umísti ho co nejvýš, panelem na jih.</li>
  <li>Stiskni tlačítko. Displej ukáže <code>MESH · n nodes</code>.</li>
</ol></div></details>
<details class="qa"><summary>Musím pájet?</summary><div><p><b>Ne.</b> Každý uzel dorazí kompletně složený. Pájení je jen pro ty, kdo se rozhodnou postavit si vlastní; proto jsou schémata a zapojení pinů zveřejněné. Pokud chceš, dej vědět <a href="#/form#build">formulářem pro vlastní stavbu</a>, ať ti stát žádný neposílá.</p></div></details>
<details class="qa"><summary>Chci si postavit vlastní. Jak ho sestavit krok za krokem?</summary><div>
<ol>
  <li><b>Nejdřív test na stole.</b> Připoj DevKitC přes USB, nahraj firmware (viz <a href="#/build">Sestavení FW</a>) a ověř, že deska nabootuje, než cokoli zapojíš.</li>
  <li><b>Anténa na rádiový modul.</b> Anténu připoj vždy dřív, než rádio dostane napájení. Vysílání bez ní může zničit SX1262.</li>
  <li><b>Zapoj rádio</b> (SPI + BUSY, DIO1, RESET) podle <a href="#/faq#wiring">schématu níže</a>. Vodiče krátké, pod 10 cm.</li>
  <li><b>Zapoj e-paper modul</b> (SPI + DC, RST, BUSY). Sdílí 3V3 a GND.</li>
  <li><b>Nahraj DIY variantu</b> a ověř, že displej kreslí a rádio se inicializuje (sériový log na 115200 baud).</li>
  <li><b>Přidej napájení:</b> panel → nabíječka → baterie → regulátor 3,3 V → pin 3V3. Přidej dělič baterie 100k/100k na GPIO1.</li>
  <li><b>Do krabičky:</b> IP65, kabelová průchodka pro panel, anténa venku, co nejvýš.</li>
</ol>
<p>Díly a kde je koupit: <a href="#/hardware#bom">Open hardware → díly</a>.</p></div></details>
<details class="qa"><summary>Můžu místo SX1262 použít SX1276 / RFM95?</summary><div><p>Meshtastic podporuje víc rádií, ale sada pinů se liší (DIO0 místo BUSY/DIO1) a variantu je nutné upravit. SX1262 doporučujeme kvůli nižší spotřebě a lepší citlivosti. Podporu rádií ověř upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Jakou frekvenci použít v Česku a Polsku?</summary><div><p>Pásmo EU 868 MHz, region <code>EU_868</code> v Meshtasticu. Dodané uzly jsou už nastavené. Když stavíš vlastní, kup verzi rádia a antény na 868 MHz. Jiné země: ověř místní pravidla a seznam regionů upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Displej zůstává prázdný. Co teď?</summary><div><p>Dodaný uzel: zkontroluj solární konektor a nech baterii pár hodin nabíjet na denním světle, pak se zeptej v <a href="#/faq#ask">otázkách</a>. Vlastní stavba: zkontroluj zapojení BUSY a RST, ověř, že model displeje ve variantě odpovídá tvému panelu (2,13″ a 2,9″ mají jiné ovladače), a změř 3,3 V na modulu. Na deskách Heltec se displej napájí přes Vext (GPIO45, LOW = zap.).</p></div></details>
<details class="qa"><summary>Jak připojím uzel do sítě?</summary><div><p>Dodané uzly jsou už připojené. Vlastní stavba: nastav region a pak použij URL kanálu zveřejněnou v kanálu jen pro čtení. Krok za krokem: <a href="#/hardware#connect">Open hardware → Připojení</a>.</p></div></details>
<details class="qa"><summary>Jak poznám, že je firmware pravý?</summary><div><p>Použij stránku <a href="#/verify">Ověření</a>: zkontroluje hash SHA-256 a podpisy ML-DSA-65 + Ed25519 v prohlížeči, pak porovnej otisk klíče s tím v README na GitHubu.</p></div></details>
<details class="qa"><summary>Můžu si Braillovu klávesnici nebo haptický náramek připojit sám?</summary><div><p>Ano. Oba doplňky jsou open hardware: klávesnice používá I²C na GPIO17/18, haptický náramek Pro sériový modul na GPIO15/16. Viz <a href="#/access#build">Přístupnost → postav si sám</a>.</p></div></details>
<details class="qa"><summary>Co mesh dělá při blackoutu?</summary><div><p>Doručuje zprávy dál, i když mobilní vysílače utichnou. Podívej se na <a href="#/demo">simulaci blackoutu</a>.</p></div></details>
<details class="qa"><summary>Můžu tu chatovat s ostatními uživateli?</summary><div><p>Ne. Na tomto webu se můžeš ptát jen centrální autority. Otázky a oficiální odpovědi se objevují v kanálu jen pro čtení; mezi uživateli nejsou odpovědi ani komentáře.</p></div></details>

<h2 id="wiring">Který pin kam (DIY sestava)</h2>
<p>ESP32-S3-DevKitC-1 k modulu SX1262 a SPI e-paper modulu. Čísla GPIO odpovídají rozložení Heltec Wireless Paper, takže varianta zůstává povědomá. Odpovídající definice pro firmware je v repu v <code>variants/diy_s3_eink/variant.h</code>.</p>
{{BOARD}}
{{PINS_DIY}}
<div class="callout warn"><p><b>Než zapneš napájení:</b> anténa připojená · rádio i displej na <b>3,3 V</b>, nikdy 5 V · zkontroluj společnou zem GND · nenapájej pin 3V3 z regulátoru, když je zapojené USB, pokud deska nemá ochranu (při nahrávání odpoj baterii).</p></div>
<h3>Zapojení napájení</h3>
{{POWER_CHAIN}}
<p>Piny Heltec Wireless Paper: <a href="#/hardware#heltec-pins">Hardware → piny</a>.</p>

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
