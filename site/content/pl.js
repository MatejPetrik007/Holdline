const DISCLAIMER = `<p><b>Zastrzeżenie:</b> to nieoficjalny, społecznościowy build i strona z dokumentacją. Nie jest powiązana z projektem Meshtastic, nie jest przez niego zatwierdzona ani wspierana. Każdego firmware'u używasz na własne ryzyko. Korzystanie z radia LoRa jest regulowane: pasma, limity mocy i zasady licencyjne różnią się w zależności od kraju. Przed nadawaniem sprawdź przepisy dla swojej lokalizacji, np. w <a href="https://meshtastic.org/docs/" rel="noopener">oficjalnej dokumentacji Meshtastic</a>.</p>`;

export default {
  ui: {
    brand: 'Holdline',
    nav: { home: 'Start', demo: 'Symulacja blackoutu', hardware: 'Sprzęt', build: 'Kompilacja', solar: 'Solar', lab: 'Laboratorium', openhw: 'Open hardware', access: 'Dostępność', faq: 'Pytania i odpowiedzi', verify: 'Weryfikacja', security: 'Bezpieczeństwo', releases: 'Wydania' },
    up: 'sprawdź upstream',
    copy: 'KOPIUJ', copied: 'SKOPIOWANO',
    pinCols: ['Element', 'Sygnał', 'Pin ESP32-S3', 'Do czego służy'],
    bomCols: ["Część", "Przykład", "Uwagi", "Gdzie kupić"],
    shopNote: "Linki do sklepów to przykładowe strony wyszukiwania, nie rekomendacje. Przed zamówieniem sprawdź dostępność, cenę i wersję 868 MHz.",
    computeCols: ["Zestaw", "Sprzęt", "GPU / akcelerator", "Co robi", "Pobór mocy"],
    board: {
      aria: "Schemat pinów ESP32-S3-DevKitC-1 z GPIO dla wyświetlacza e-paper, radia SX1262, pomiaru baterii i dodatków",
      sub: "połączenia DIY · najedź na grupę lub pin",
      v33: "3V3 → radio, e-paper",
      gnd: "GND (wspólna)",
      groups: {
        epaper: ["Wyświetlacz e-paper", "SPI + DC, RST, BUSY · GPIO2–7"],
        radio: ["Radio LoRa SX1262", "SPI + NRST, BUSY, DIO1 · GPIO8–14"],
        power: ["Zasilanie 3,3 V", "z LDO, nigdy 5 V"],
        gnd: ["Masa", "wspólna dla wszystkich modułów"],
        battery: ["Pomiar baterii", "dzielnik 100k/100k · GPIO1"],
        addon: ["Dodatki dostępności", "I²C 17/18 · haptyka 21 · łącze szeregowe opaski 15/16"],
        ui: ["Przycisk BOOT", "już na płytce · GPIO0"],
      },
      note: "Kolejność pinów jak w ESP32-S3-DevKitC-1 v1.1. Przed lutowaniem sprawdź nadruk na swojej płytce. Dostarczone węzły są już połączone; to dla tych, którzy budują lub naprawiają własne.",
    },
    demo: {
      who: "Centrum kryzysowe · Cieszyn", outgoing: "Wychodzący alert", fits: "{n} B · mieści się w jednym pakiecie",
      channelLine: "Kanał OLZA · AES-256 · EU868", preset: "Preset LongFast · hop limit",
      routeCell: "SMS / cell broadcast", routeMesh: "Meshtastic mesh",
      mapLabel: "Mapa Cieszyna i Czeskiego Cieszyna z węzłami mesh po obu stronach Olzy",
      riverLabel: "Olza · granica",
      legend: ["węzeł · alert odebrany", "węzeł · jeszcze nie", "router na dachu", "stacja BTS"],
      replay: "Odtwórz ponownie", resend: "Wyślij ponownie przez mesh", hopLimit: "Hop limit", speed: "Prędkość", speeds: ["Wolno", "Normalnie", "Szybko"],
      restore: "Przywróć wszystkie węzły", hint: "Kliknij węzeł, aby go wyłączyć, potem wyślij ponownie.", base: "stacja bazowa",
      statsLabel: "Podsumowanie dostarczenia", stats: ["Sieć komórkowa", "Mesh dotarł", "Maks. skoków", "Transmisje", "Czas dostarczenia"],
      nodes: { hq: "Centrum kryzysowe", hospital: "Szpital", roof: "Dach Těšín" },
      tipHq: "Stacja bazowa centrum kryzysowego (Cieszyn)", tipNode: "{name} ({c}) · {role} · kliknij, aby wyłączyć / włączyć",
      router: "router na dachu", household: "węzeł domowy",
      pills: { waiting: "czeka", sending: "wysyła", failed: "błąd", delivered: "dostarczono {r}/{t}" },
      phases: { normal: "SIEĆ DZIAŁA", blackout: "BLACKOUT · OBA BRZEGI", drained: "BATERIE BTS ROZŁADOWANE", cell: "ALERT PRZEZ SIEĆ KOMÓRKOWĄ", mesh: "MESHTASTIC · STEROWANY FLOODING", done: "ALERT DOSTARCZONY PRZEZ MESH" },
      log: {
        grid: "Sieć działa · 3 stacje BTS zasilane z sieci",
        meshReady: "Mesh: {n} węzłów na baterii/solarze, kanał OLZA",
        lost: "Brak prądu w Cieszynie i Czeskim Cieszynie",
        battery: "Stacje BTS przeszły na baterie zapasowe",
        depleted: "{t}: bateria rozładowana, stacja offline",
        sms: "SMS / cell broadcast → bramki operatorów",
        noCell: "Żadna stacja nieosiągalna · 0 mieszkańców powiadomionych",
        switching: "Przełączam na stację bazową Meshtastic…",
        resend: "──── ponowne wysłanie przez mesh ────",
        tx: "TX alert id=0x4F1A · {b} B · hop_limit={h} · kanał OLZA",
        ack: "niejawne ACK · {from} przekazał nasz pakiet",
        quiet: "{n}: {from} przekazał go pierwszy, milczy",
        rx: "{n} ({c}) rx skok {hop} · SNR {snr} dB · przekazanie za {ms} ms",
        rxLimit: "{n} ({c}) rx skok {hop} · SNR {snr} dB · hop limit 0, nie przekazuje",
        all: "Dostarczono do wszystkich {t} węzłów · {tx} transmisji · {q} milczało",
        missed: "Nie dotarło do: {list}", offCount: " ({n} wyłączonych)",
        tip: "Wskazówka: zwiększ hop limit lub przywróć router i wyślij ponownie.",
      },
    },
    verify: {
      waiting: 'czekam na pliki: {n}/3',
      hash: 'SHA-256 firmware\'u zgadza się z manifestem', sig: 'Podpis', sigOk: 'ważny dla klucza wydawcy', sigBad: 'NIEWAŻNY lub brak',
      fp: 'Odcisk klucza wydawcy', meta: 'Wydanie', error: 'Nie można zweryfikować',
      pass: 'PASS · autentyczne wydanie', fail: 'FAIL · nie wgrywaj',
      compare: 'Porównaj powyższe odciski kluczy z odciskami opublikowanymi drugim kanałem (README na GitHubie lub wydrukowana karta). Jeśli się różnią, nie ufaj wynikowi PASS.',
    },
    releases: { board: 'Płytka', commit: 'Commit upstream', built: 'Zbudowano', algs: 'Algorytmy podpisu', file: 'Plik', size: 'Rozmiar', verify: 'Zweryfikuj to wydanie', none: 'Brak wydań.' },
    ask: { tooShort: 'Napisz proszę trochę więcej (co najmniej 10 znaków).', opened: 'W nowej karcie otworzył się formularz na GitHubie. Wyślij go tam; pytanie zostanie przetłumaczone i pojawi się w kanale poniżej.' },
    channel: { answered: 'odpowiedziano', pending: 'czeka na odpowiedź', authority: 'Centralny organ', translatedFrom: 'przetłumaczono z', empty: 'Nie opublikowano jeszcze żadnych pytań. Zapytaj jako pierwszy.' },
    form: {
      sent: 'Otworzyła się Twoja aplikacja pocztowa z wypełnioną rejestracją. Naciśnij tam Wyślij, aby dostarczyć ją do centralnego organu.',
      noInbox: '<b>Skrzynka rejestracyjna nie jest jeszcze skonfigurowana.</b> Twoje odpowiedzi są poniżej (i w schowku, jeśli przeglądarka na to pozwala). Zachowaj je; możesz je wysłać, gdy tylko adres zostanie opublikowany w kanale.',
      copied: 'Skopiowano do schowka.',
    },
    footer: DISCLAIMER + `<p class="stamp">bez cookies · bez śledzenia · bez zapytań do stron trzecich · weryfikacja działa lokalnie w przeglądarce · <a href="{{REPO}}">kod źródłowy na GitHubie</a> · sprzęt CERN-OHL-S-2.0 · firmware GPL-3.0</p>`,
  },

  pages: {
    home: `
<section class="hero">
  <div>
    <p class="eyebrow">open hardware · off-grid · ESP32-S3 + E-Ink</p>
    <h1>Solarny węzeł mesh, który zbudujesz w domu.</h1>
    <p class="lede">Węzeł LoRa typu open hardware z firmware'em <a href="https://meshtastic.org" rel="noopener">Meshtastic</a> i wyświetlaczem E-Ink. Każde gospodarstwo domowe dostaje go od państwa <b>całkowicie złożonego</b>, więc lutowanie jest opcjonalne: schematy są otwarte dla każdego, kto chce zbudować własny. Jeśli jesteś osobą głuchą, niewidomą lub głuchoniewidomą, zarejestruj się po dodatki takie jak klawiatura brajlowska czy haptyczna opaska na skórę. Każde wydanie firmware'u zweryfikujesz w przeglądarce przed wgraniem.</p>
    <div class="cta">
      <a class="btn primary" href="#/demo">Zobacz, jak działa podczas blackoutu →</a>
      <a class="btn" href="#/openhw">Zbuduj go sam</a>
      <a class="btn" href="#/faq">Pytania i pinout</a>
      <a class="btn" href="#/access">Rejestracja – dostępność</a>
    </div>
  </div>
  {{DEVICE}}
</section>

<div class="grid">
  <div class="card"><div class="feature-icon">⌁</div><span class="num">01</span><h3>Wiadomości poza siecią</h3><p>Węzły tworzą zdecentralizowaną sieć LoRa. Wiadomości przeskakują od węzła do węzła bez internetu, kart SIM i sieci komórkowej. Obsługiwane płytki i ustawienia kanałów: <a href="https://meshtastic.org/docs/" rel="noopener">oficjalna dokumentacja</a> {{UP}}.</p></div>
  <div class="card"><div class="feature-icon">▤</div><span class="num">02</span><h3>Energooszczędny E-Ink</h3><p>E-Ink utrzymuje ostatni obraz bez poboru prądu, więc węzeł na baterii pokazuje wiadomości i stan przez tygodnie. Konfiguracja pinów jest w <a href="https://github.com/meshtastic/firmware" rel="noopener">repozytorium firmware'u</a>.</p></div>
  <div class="card"><div class="feature-icon">✓</div><span class="num">03</span><h3>Weryfikowalny firmware</h3><p>Każde wydanie ma manifest z hashami SHA-256, podpisany postkwantowym <b>ML-DSA-65 (FIPS 204)</b> oraz Ed25519. Ważny podpis dowodzi autentyczności od wydawcy; nie jest to zatwierdzenie przez żaden organ.</p></div>
  <a class="card" href="#/solar"><div class="feature-icon">☀</div><span class="num">04</span><h3>Działa na słońce</h3><p>Dzisiejsze małe panele słoneczne bez problemu zasilą węzeł poza siecią. Panel 2–6 W i jedno ogniwo 18650 utrzymają go w pracy w nocy i w pochmurne dni. →</p></a>
  <a class="card" href="#/openhw"><div class="feature-icon">⚒</div><span class="num">05</span><h3>Przychodzi złożony, otwarty do budowy</h3><p>Węzeł przychodzi gotowy: podłączasz panel słoneczny i montujesz. Schemat, pinout i lista części są otwarte, jeśli wolisz zbudować własny. →</p></a>
  <a class="card" href="#/access"><div class="feature-icon">⠿</div><span class="num">06</span><h3>Dostępny dla osób głuchych i niewidomych</h3><p>Zarejestruj się po dodatki takie jak klawiatura brajlowska lub haptyczna opaska na skórę. Są również open source, więc możesz je zbudować sam. →</p></a>
</div>

<div class="cta"><a class="btn accent" href="#/verify">Zweryfikuj plik firmware'u</a><a class="btn" href="#/build">Skompiluj firmware sam</a><a class="btn" href="#/lab">Otwórz laboratorium: kalkulatory nadawania i fotowoltaiki →</a></div>

<div class="two">
  <div>
    <h2>Jak działa tu zaufanie</h2>
    <p>Strona <a href="#/verify">Weryfikacja</a> sprawdza hash SHA-256 Twojego <code>.bin</code> względem manifestu i weryfikuje podpisy ML-DSA-65 oraz Ed25519 kluczem publicznym wydawcy, wszystko lokalnie w przeglądarce. Następnie porównujesz pokazany odcisk klucza z odciskiem opublikowanym drugim kanałem (repozytorium na GitHubie lub wydrukowana karta). Szczegóły na stronie <a href="#/security">Bezpieczeństwo</a>.</p>
    <p>Źródła prawdy upstream: <a href="https://github.com/meshtastic/firmware" rel="noopener">repozytorium firmware'u Meshtastic</a> i <a href="https://meshtastic.org/docs/" rel="noopener">meshtastic.org</a>. Wszystko, co może się zmienić upstream (lista płytek, cele kompilacji, kroki wgrywania), jest oznaczone {{UP}}.</p>
  </div>
  <div>
    <h2>Jak działają tu pytania</h2>
    <p>O wszystko możesz zapytać <b>centralny organ</b>, po angielsku, czesku lub polsku. Każde pytanie jest automatycznie tłumaczone na wszystkie trzy języki i publikowane razem z oficjalną odpowiedzią w <b>kanale tylko do odczytu</b>.</p>
    <p>Użytkownicy nie mogą tu pisać do siebie nawzajem; nie ma wątków ani komentarzy. Dzięki temu odpowiedzi pozostają oficjalne, a kanał bez szumu. <a href="#/faq#ask">Zadaj pytanie →</a></p>
  </div>
</div>`,


    demo: `
<p class="eyebrow">symulacja · Cieszyn (PL) / Český Těšín (CZ)</p>
<h1>Blackout nad Olzą</h1>
<p class="lede">Na obu brzegach rzeki nie ma prądu. Stacje komórkowe wytrzymują na bateriach kilka godzin, potem milkną. Centrum kryzysowe w Cieszynie musi powiedzieć mieszkańcom obu krajów, gdzie jest woda i ładowanie. Zobacz, jak ten sam alert zawodzi w sieci komórkowej, a potem dociera do każdego domowego węzła przez mesh Meshtastic, skok po skoku.</p>
<div id="sim"></div>

<div class="two">
  <div class="card"><h2>Dlaczego telefony milkną</h2>
    <p>Stacja bazowa potrzebuje prądu z sieci i działającego łącza do sieci szkieletowej. Większość ma baterie na kilka godzin. Przy długim regionalnym blackoucie rozładowują się jedna po drugiej i SMS-y ani cell broadcast nie mają już którędy przejść.</p>
    <p>Granica dodaje drugą lukę. Każdy kraj ostrzega przez własnych operatorów, więc mieszkaniec Czeskiego Cieszyna z czeską kartą SIM może nie zobaczyć alertu polskiego urzędu, choć jest kilkaset metrów dalej, za mostem.</p></div>
  <div class="card"><h2>Dlaczego mesh działa dalej</h2>
    <p>Węzły Meshtastic to małe radia LoRa o minimalnym poborze prądu: jedno ogniwo 18650 i <a href="#/solar">panel słoneczny</a> wielkości dłoni utrzymują je przez wiele dni. Nie potrzebują stacji, karty SIM ani operatora. Ekran E-Ink pokaże alert nawet bez telefonu.</p>
    <p>Polska i Czechy dzielą to samo pasmo bez licencji EU868, więc węzły na obu brzegach są w jednym kanale. Rzeka jest granicą dla sieci, nie dla radia.</p></div>
</div>

<h2>Jak rozchodzi się wiadomość</h2>
<ol class="steps">
  <li><h3>Centrum nadaje raz</h3><p>Jego węzeł na dachu nadaje zaszyfrowany pakiet z hop limitem, domyślnie 3. Odbiera go każdy węzeł w zasięgu, w mieście zwykle 1–5 km, ze wzgórza dużo dalej.</p></li>
  <li><h3>Każdy węzeł przekazuje go raz</h3><p>To <i>sterowany flooding</i>. Węzeł, który odbierze nowy pakiet, czeka chwilę, a potem nadaje go dalej z hop limitem zmniejszonym o jeden. Na zerze się zatrzymuje.</p></li>
  <li><h3>Dalekie węzły idą pierwsze</h3><p>Czas oczekiwania zależy od siły sygnału: słaby sygnał oznacza, że węzeł jest daleko od nadawcy, więc czeka krócej. Dzięki temu wiadomość najszybciej rozchodzi się na zewnątrz.</p></li>
  <li><h3>Duplikaty są ignorowane</h3><p>Każdy pakiet ma ID. Węzeł, który już go widział, odrzuca kopie. Zwykły węzeł, który usłyszy sąsiada przekazującego pakiet przed swoją kolejką, milczy i oszczędza czas antenowy. Routery w wysokich punktach, tu Góra Zamkowa, przekazują zawsze.</p></li>
  <li><h3>Nadawca wie, że poszło</h3><p>Gdy centrum usłyszy swój pakiet przekazany dalej, traktuje to jako niejawne potwierdzenie.</p></li>
  <li><h3>Tracisz węzeł, sieć zostaje</h3><p>Wyłącz na mapie router Góra Zamkowa i wyślij ponownie: węzeł Bulwary nad rzeką, który normalnie milczy, przenosi teraz alert do Czeskiego Cieszyna.</p></li>
</ol>

<h2>Sieć komórkowa a mesh podczas blackoutu</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Sieć komórkowa</th><th>Meshtastic mesh</th></tr></thead><tbody>
<tr><td>Potrzebuje prądu z sieci</td><td>Tak, baterie na godziny</td><td><b>Nie</b>, bateria i solar na dni</td></tr>
<tr><td>Centralny punkt awarii</td><td>Stacje, łącza szkieletowe, rdzeń sieci</td><td><b>Brak</b>, każdy węzeł przekazuje</td></tr>
<tr><td>Przez granicę PL–CZ</td><td>Osobni operatorzy i systemy ostrzegania</td><td><b>Jeden wspólny kanał</b> na obu brzegach</td></tr>
<tr><td>Pojemność</td><td>Głos, dane, wideo</td><td>Tylko krótki tekst, ok. 200 bajtów na wiadomość, wspólny czas antenowy</td></tr>
<tr><td>Przygotowanie</td><td>Już w każdej kieszeni</td><td>Węzły muszą być rozmieszczone, naładowane i w kanale przed blackoutem: dlatego każde gospodarstwo dostaje jeden <a href="#/openhw">złożony</a></td></tr>
</tbody></table></div>
<p class="small">Mesh nie zastępuje syren, radia ani patroli od drzwi do drzwi. Dodaje kanał, który przetrwa, gdy inne padną. Osoby głuche i głuchoniewidome dostają ten sam alert jako wibrację przez <a href="#/access">opaskę haptyczną</a>. Symulacja upraszcza zasięg i czasy oraz pomija kolizje pakietów; położenie węzłów jest poglądowe.</p>`,
    hardware: `
<p class="eyebrow">sprzęt</p>
<h1>Płytki ESP32-S3 z wyświetlaczem E-Ink</h1>
<p class="lede">Ten build jest przeznaczony dla płytek ESP32-S3 z wyświetlaczem E-Ink (e-papier), dzięki czemu węzeł pokazuje wiadomości i telemetrię, prawie nie pobierając prądu. Wolisz połączyć wszystko sam? Zobacz <a href="#/openhw">zestaw DIY open hardware</a>.</p>
<div class="callout warn"><p><b>Nie wymyślamy specyfikacji.</b> Rozmiary wyświetlaczy, układy radiowe, mapowanie pinów i lista obsługiwanych płytek są utrzymywane upstream i się zmieniają. Każdą pozycję {{UP}} sprawdź przed zakupem lub wgraniem w <a href="https://github.com/meshtastic/firmware" rel="noopener">repozytorium firmware'u</a> (definicje płytek, <code>platformio.ini</code>) i na <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">meshtastic.org</a>.</p></div>

<h2>Płytki kandydujące</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Płytka</th><th>Env</th><th>Wyświetlacz</th><th>Radio LoRa</th><th>Status</th></tr></thead><tbody>
<tr><td><b>Heltec Wireless Paper</b></td><td><code>heltec-wireless-paper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandydat · płytka referencyjna strony</td></tr>
<tr><td><b>Heltec Vision Master E213</b></td><td><code>heltec-vision-master-e213</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandydat</td></tr>
<tr><td><b>Heltec Vision Master E290</b></td><td><code>heltec-vision-master-e290</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandydat</td></tr>
<tr><td><b>LilyGO T5 S3 E-Paper</b></td><td><code>lilygo-t5-s3-epaper</code></td><td>{{UP}}</td><td>{{UP}}</td><td>kandydat</td></tr>
<tr><td><b>DIY: ESP32-S3-DevKitC-1 + SX1262 + e-papier</b></td><td><code>diy-s3-eink</code> (to repo)</td><td>2,13″ / 2,9″ SPI</td><td>moduł SX1262</td><td>open hardware · <a href="#/openhw">instrukcja</a></td></tr>
</tbody></table></div>

<h2 id="pins">Heltec Wireless Paper: który pin do czego</h2>
<p>Wszystko jest już połączone na płytce. Mapa pomaga przy debugowaniu, podłączaniu dodatków i czytaniu pliku wariantu. Źródło: <code>variants/heltec_wireless_paper/variant.h</code> {{UP}}.</p>
{{PINS_HELTEC}}
<p class="small">Wolne GPIO dla dodatków (klawiatura brajlowska, opaska haptyczna) zależą od rewizji płytki. Przed podłączeniem czegokolwiek sprawdź opis złącza na płytce i plik wariantu.</p>

<h2>Jak samodzielnie potwierdzić płytkę</h2>
<ol>
  <li>Otwórz <a href="https://github.com/meshtastic/firmware" rel="noopener">repozytorium firmware'u</a> i wyszukaj w <code>platformio.ini</code> sekcje <code>[env:…]</code> pasujące do Twojej płytki.</li>
  <li>W katalogu <code>variants/</code> sprawdź definicje wyświetlacza i pinów.</li>
  <li>Porównaj z <a href="https://meshtastic.org/docs/hardware/devices/" rel="noopener">oficjalną dokumentacją sprzętu</a> (obsługiwane urządzenia i częstotliwości regionalne).</li>
</ol>`,

    build: `
<p class="eyebrow">kompilacja</p>
<h1>Skompiluj firmware sam</h1>
<p class="lede">Kompilacja ze źródeł to najsilniejsza forma weryfikacji: sam kompilujesz dokładnie ten commit upstream i nie musisz ufać żadnej gotowej binarce. Nazwy środowisk, cele i kroki wgrywania zmieniają się upstream, dlatego konkretne wartości są oznaczone {{UP}}.</p>
<ol class="steps">
  <li><h3>Zainstaluj PlatformIO</h3><p>System kompilacji używany przez firmware Meshtastic. Zainstaluj CLI (lub rozszerzenie VS Code) zgodnie z <a href="https://platformio.org" rel="noopener">platformio.org</a> {{UP}}.</p><pre><code>pip install platformio</code></pre></li>
  <li><h3>Sklonuj repozytorium firmware'u Meshtastic</h3><p>Zanotuj commit, z którego budujesz; porównaj go z <code>upstream_commit</code> w manifeście wydania.</p><pre><code>git clone https://github.com/meshtastic/firmware.git
cd firmware
git rev-parse HEAD   # musi zgadzać się z upstream_commit w manifeście</code></pre></li>
  <li><h3>Wybierz środowisko dla swojej płytki</h3><p>Środowiska to sekcje <code>[env:…]</code> w <code>platformio.ini</code>. Dla płytki DIY najpierw skopiuj <code>variants/diy_s3_eink</code> z <a href="{{REPO}}">tego repo</a> do drzewa firmware'u. Dokładną nazwę <code>&lt;env-name&gt;</code> sprawdź {{UP}}.</p><pre><code>pio project config | grep "env:"   # lub przejrzyj platformio.ini</code></pre></li>
  <li><h3>Skompiluj</h3><pre><code>pio run -e &lt;env-name&gt;</code></pre></li>
  <li><h3>Wgraj</h3><p>Wgraj przez USB za pomocą PlatformIO albo użyj oficjalnego flashera webowego <a href="https://flasher.meshtastic.org" rel="noopener">flasher.meshtastic.org</a> {{UP}}. <b>Najpierw podłącz antenę.</b></p><pre><code>pio run -e &lt;env-name&gt; --target upload</code></pre></li>
  <li><h3>Zweryfikuj, co zbudowałeś lub pobrałeś</h3><p>Gotowy <code>.bin</code> sprawdź na stronie <a href="#/verify">Weryfikacja</a>. Jeśli kompilowałeś ze źródeł, porównaj hash swojej binarki z hashem w manifeście dla tego samego commita upstream.</p></li>
</ol>
<h2>Gdzie jest prawda</h2>
<ul>
  <li>Kod źródłowy i środowiska: <a href="https://github.com/meshtastic/firmware" rel="noopener">github.com/meshtastic/firmware</a> {{UP}}</li>
  <li>Dokumentacja: <a href="https://meshtastic.org/docs/" rel="noopener">meshtastic.org/docs</a> {{UP}}</li>
  <li>Flasher webowy: <a href="https://flasher.meshtastic.org" rel="noopener">flasher.meshtastic.org</a> {{UP}}</li>
</ul>`,

    solar: `
<p class="eyebrow">zasilanie poza siecią</p>
<h1>Dzisiejsze panele słoneczne zasilą węzeł całkowicie poza siecią</h1>
<p class="lede">Węzeł mesh potrzebuje bardzo mało energii. Nowoczesne panele monokrystaliczne są wydajne, tanie i nawet pod chmurami dają użyteczną moc. Mały panel i jedno ogniwo Li-ion utrzymają węzeł w pracy w dzień i w nocy bez żadnego podłączenia do sieci energetycznej.</p>

<div class="grid">
  <div class="card"><div class="feature-icon">⚡</div><h3>Znikome zużycie</h3><p>Węzeł ESP32-S3 + SX1262 przez większość czasu śpi lub nasłuchuje. E-Ink pobiera prąd tylko przy zmianie obrazu. Typowa średnia to kilkadziesiąt miliamperów, w trybie oszczędzania często mniej.</p></div>
  <div class="card"><div class="feature-icon">☀</div><h3>Wydajne panele</h3><p>Dzisiejsze panele mono przetwarzają około 20 % światła słonecznego. Nawet panel 2 W wielkości dłoni wytwarza w przeciętny dzień więcej energii, niż węzeł zużywa.</p></div>
  <div class="card"><div class="feature-icon">🔋</div><h3>Bateria jako bufor</h3><p>Jedno ogniwo 18650 (≈ 11 Wh) wystarcza na kilka dni bez słońca. Na zimę lub dla routerów dodaj drugie ogniwo równolegle.</p></div>
</div>

<h2>Przykład doboru (szacunek, zmierz swój węzeł)</h2>
<div class="math">Średnia węzła: 30 mA × 3,7 V ≈ 0,11 W → ≈ 2,7 Wh na dobę<br>
Bateria: 1 × 18650, 3000 mAh × 3,7 V ≈ 11 Wh → ≈ 4 dni zupełnie bez słońca<br>
Lato, panel 2 W: 2 W × 3 godziny słoneczne × 0,7 straty ≈ 4,2 Wh na dobę ✓<br>
Zima w Europie Środkowej (≈ 1 godzina słoneczna): panel 5–6 W i 2 ogniwa ✓</div>
<div class="callout"><p><b>Sprawdź własne liczby:</b> <a href="#/lab#solar-lab">kalkulator solarny w laboratorium</a> dobierze panel i akumulator na dowolny miesiąc i zasymuluje dwa tygodnie pogody.</p></div>
<p class="small">Liczby to zgrubne wartości planistyczne, a nie pomiary konkretnej płytki. Rzeczywisty pobór zależy od roli (klient lub router), odświeżania ekranu, Bluetooth, GPS i mocy nadawania. Przed doborem zmierz pobór miernikiem USB.</p>

<h2>Łańcuch zasilania</h2>
{{POWER_CHAIN}}
<p>Pełne połączenia z numerami pinów: <a href="#/faq#wiring">Pytania i odpowiedzi → który pin gdzie</a>.</p>

<h2>Praktyczne wskazówki</h2>
<ul>
  <li>Skieruj panel na południe, pod kątem około 45–60° z myślą o zimie. Bardziej stromy panel lepiej zrzuca śnieg.</li>
  <li><b>Ogniw Li-ion nie wolno ładować poniżej 0 °C.</b> Na mróz użyj ładowarki z odcięciem temperaturowym lub ogniwa LiFePO4 z odpowiednią ładowarką.</li>
  <li>Użyj wodoszczelnej obudowy IP65, zaworu odpowietrzającego i zewnętrznej anteny zamontowanej jak najwyżej: wysokość ma większe znaczenie niż moc.</li>
  <li>Dla klientów solarnych włącz w firmwarze tryby oszczędzania energii {{UP}}.</li>
</ul>`,

    openhw: `
<p class="eyebrow">open hardware</p>
<h1>Przychodzi złożony. Otwarty, więc możesz zbudować go sam.</h1>
<p class="lede">Każde gospodarstwo domowe dostaje od państwa węzeł <b>całkowicie złożony, wgrany i przetestowany</b>. Nie musisz niczego lutować. Schematy, pinout i lista części są otwarte, aby każdy, kto chce, mógł zbudować, naprawić lub ulepszyć węzeł w domu.</p>
<div class="toc"><a href="#/openhw#box">Co przychodzi</a><a href="#/openhw#paths">Trzy drogi do węzła</a><a href="#/openhw#pins">Który pin gdzie</a><a href="#/openhw#bom">Części i gdzie kupić</a><a href="#/openhw#connect">Podłączenie własnego węzła</a><a href="#/openhw#sign">Język migowy: części</a><a href="#/openhw#selfhost">Zbuduję sam: daj znać</a></div>

<h2 id="box">Co przychodzi w pudełku</h2>
<div class="two">
  <div>
    <ul>
      <li><b>Złożony węzeł</b> w szczelnej obudowie IP65: płytka, radio LoRa, ekran E-Ink, bateria, ładowarka i regulator, wszystko połączone, zlutowane, wgrane <a href="#/verify">zweryfikowanym firmware'em</a> i ustawione na region <code>EU_868</code> oraz kanał sieci.</li>
      <li><b>Antena</b> (przykręcana SMA).</li>
      <li><b>Panel słoneczny</b> z wtyczką, której nie da się włożyć odwrotnie.</li>
      <li><b>Uchwyt montażowy</b> i drukowana skrócona instrukcja (na życzenie w brajlu lub dużym drukiem).</li>
    </ul>
  </div>
  <ol class="steps">
    <li><h3>Przykręć antenę</h3><p>Przed wszystkim innym.</p></li>
    <li><h3>Podłącz panel słoneczny</h3><p>Jedyne połączenie, które robisz sam. Bez narzędzi.</p></li>
    <li><h3>Zamontuj wysoko, panelem na południe</h3><p>Parapet, balkon lub dach. Wysokość jest najważniejsza.</p></li>
    <li><h3>Naciśnij przycisk</h3><p>Ekran pokaże <code>MESH · n nodes</code>. Gotowe.</p></li>
  </ol>
</div>

<h2 id="paths">Trzy drogi do węzła</h2>
<div class="grid">
  <div class="card"><span class="num">A · DOMYŚLNIE</span><h3>Przychodzi złożony</h3><p>Nie musisz nic robić: każdy zarejestrowany adres dostaje złożony węzeł automatycznie. Lutowanie nigdy nie jest wymagane. Terminy dostaw publikujemy w <a href="#/faq#channel">kanale tylko do odczytu</a>.</p></div>
  <a class="card" href="#/openhw#selfhost"><span class="num">B · OPCJONALNIE</span><h3>Zbuduj go sam</h3><p>Chcesz zlutować własny? Daj nam znać formularzem poniżej, żeby państwo nie wysyłało ci węzła. Zestawy części są we wspólnym zakupie. →</p></a>
  <a class="card" href="#/access"><span class="num">C</span><h3>Osoby głuche, niewidome, głuchoniewidome</h3><p>Przychodzi złożony z dodatkami, które ci pasują. Osoby głuchoniewidome dostają go osobiście, razem z konfiguracją. →</p></a>
</div>

<h2 id="pins">Który pin gdzie</h2>
<p>Potrzebne tylko, jeśli budujesz lub naprawiasz węzeł sam. Dostarczone węzły są połączone dokładnie tak.</p>
{{BOARD}}
<p>Pełne tabele: <a href="#/faq#wiring">Pytania i odpowiedzi → połączenia</a> · Heltec Wireless Paper (płytka w dostarczonym węźle): <a href="#/hardware#pins">Sprzęt → piny</a>.</p>

<h2 id="bom">Części i gdzie je kupić</h2>
{{BOM}}
<p>Pliki projektowe: <code>hardware/</code> i <code>variants/diy_s3_eink/</code> w <a href="{{REPO}}">repozytorium</a>. Licencja sprzętu CERN-OHL-S-2.0, firmware GPL-3.0 (jak upstream). Części do dodatków dostępności: <a href="#/access#build">Dostępność → zbuduj sam</a>.</p>

<h2 id="sign">Ekran z językiem migowym: części i gdzie kupić</h2>
<p>Dla osób Głuchych, których pierwszym językiem jest język migowy, hub potrafi pokazać wiadomości z mesh <b>w języku migowym</b>. Działa na tym samym <b>NVIDIA Jetson Orin Nano</b> co napisy na żywo, więc jeśli masz już hub nasłuchowy, dokładasz tylko ekran, akumulator i przycisk. System jest normalnie wyłączony; gdy przychodzi wiadomość, opaska wibruje i wiesz, że trzeba go włączyć. Jak to działa: <a href="#/access#sign">Dostępność → wiadomości w języku migowym</a>.</p>
{{BOM_SIGN}}
<p class="small">Zestawy części do ekranu z językiem migowym są we wspólnym zakupie: zaznacz <b>Ekran z językiem migowym</b> w <a href="#/openhw#selfhost">formularzu własnej budowy</a>. Złożony i skonfigurowany od państwa dostaniesz przez <a href="#/access#register">rejestrację dostępności</a>.</p>

<h2 id="connect">Podłączenie własnego węzła</h2>
<p class="small">Dostarczone węzły są już skonfigurowane. Te kroki dotyczą tylko węzłów zbudowanych samodzielnie.</p>
<ol class="steps">
  <li><h3>Ustaw region</h3><p>W aplikacji Meshtastic lub CLI ustaw region LoRa <code>EU_868</code> dla Polski i Czech (inne kraje: sprawdź upstream).</p><pre><code>meshtastic --set lora.region EU_868</code></pre></li>
  <li><h3>Dodaj kanał sieci</h3><p>Centralny organ publikuje URL / kod QR kanału w <a href="#/faq#channel">kanale tylko do odczytu</a>.</p><pre><code>meshtastic --seturl "&lt;URL kanału z kanału tylko do odczytu&gt;"</code></pre></li>
  <li><h3>Sprawdź, czy jesteś w sieci</h3><p>W ciągu kilku minut na liście węzłów powinni pojawić się sąsiedzi. Nikogo? Podnieś antenę, sprawdź region i przeczytaj <a href="#/faq">pytania i odpowiedzi</a>.</p></li>
</ol>

<h2 id="selfhost">Zbuduję sam: daj znać</h2>
<p>Wypełnij tylko, jeśli chcesz zbudować własny. Wszyscy inni dostają złożony węzeł automatycznie i nie muszą nic robić. Dane trafiają prywatnie do centralnego organu i nigdy nie są publikowane.</p>
<div class="card">
<form class="f reg" data-kind="self-build / opt-out of assembled delivery">
  <div class="row2">
    <label><span class="lbl">Imię i nazwisko</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">E-mail</span><input type="email" name="email" required autocomplete="email"></label>
  </div>
  <div class="row2">
    <label><span class="lbl">Kraj</span><select name="country"><option>Polska</option><option>Czechy</option><option>Słowacja</option><option>Inny</option></select></label>
    <label><span class="lbl">Miasto / region</span><input type="text" name="region"></label>
  </div>
  <label><span class="lbl">Adres gospodarstwa (żeby dopasować twoją dostawę)</span><textarea name="address" rows="2" autocomplete="street-address" required></textarea></label>
  <label><span class="lbl">Złożony węzeł od państwa</span><select name="delivery"><option>Nie wysyłajcie: zbuduję własny</option><option>Wyślijcie mimo to: buduję dodatkowy węzeł</option></select></label>
  <fieldset><legend>Co zbudujesz?</legend>
    <label class="check"><input type="checkbox" name="node" checked> Węzeł mesh (ESP32-S3 + E-Ink + solar)</label>
    <label class="check"><input type="checkbox" name="braille"> Klawiatura brajlowska</label>
    <label class="check"><input type="checkbox" name="haptic"> Opaska haptyczna Pro</label>
    <label class="check"><input type="checkbox" name="hub"> Hub nasłuchowy (mowa na tekst)</label>
    <label class="check"><input type="checkbox" name="sign"> Ekran z językiem migowym (wiadomości w języku migowym)</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Dołączasz do wspólnego zakupu?</span><select name="groupbuy"><option value="yes">Tak, zarezerwujcie mi zestawy części</option><option value="no">Nie, kupię części sam</option></select></label>
    <label><span class="lbl">Liczba zestawów</span><input type="number" name="qty" min="1" max="50" value="1"></label>
  </div>
  <label><span class="lbl">Doświadczenie</span><select name="experience"><option>Pierwszy projekt elektroniczny</option><option>Umiem lutować i wgrywać płytki</option><option>Doświadczony maker</option></select></label>
  <label class="check"><input type="checkbox" name="consent" required> Zgadzam się, aby centralny organ przetwarzał te dane w celu anulowania lub zmiany mojej dostawy i organizacji wspólnego zakupu.</label>
  <button class="btn primary" type="submit">Wyślij</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    access: `
<p class="eyebrow">dostępność</p>
<h1>Wiadomości mesh dla osób głuchych, niewidomych i głuchoniewidomych</h1>
<p class="lede">Każdy węzeł przychodzi złożony. Jeśli jesteś osobą głuchą, niewidomą lub głuchoniewidomą, państwo dostarcza go z dodatkami, które ci pasują, skonfigurowany i przetestowany. Osoby głuchoniewidome dostają go <b>osobiście</b> od instruktora, który komunikuje się tak jak one.</p>
<div class="toc"><a href="#/access#who">Kto dostaje co</a><a href="#/access#deafblind">Jak to działa dla osób głuchoniewidomych</a><a href="#/access#build">Opaska haptyczna Pro: zbuduj sam</a><a href="#/access#sign">Wiadomości w języku migowym</a><a href="#/access#compute">Jaki komputer lub GPU</a><a href="#/access#register">Rejestracja</a></div>

<h2 id="who">Kto dostaje co</h2>
<div class="grid">
  <div class="card"><div class="feature-icon">⠿</div><h3>Osoby niewidome i słabowidzące</h3>
    <ul><li><b>Klawiatura brajlowska</b> (6- lub 8-punktowa, akordowa), która pisze prosto do węzła.</li><li>Wiadomości czyta na głos czytnik ekranu w telefonie przez aplikację Meshtastic {{UP}}.</li><li>Oznaczenia dotykowe na obudowie i przyciskach; skrócona instrukcja w brajlu i jako audio.</li></ul>
    <p class="small">Dostawa: kurier, a jeśli chcesz, instruktaż przez telefon.</p></div>
  <div class="card"><div class="feature-icon">≋</div><h3>Osoby głuche i słabosłyszące</h3>
    <ul><li><b>Opaska haptyczna Pro</b> od państwa: 8 silniczków wokół nadgarstka.</li><li>Sama rozpoznaje ważne dźwięki (syrena, czujnik dymu, dzwonek, pukanie, twoje imię) i nadaje każdemu własny wzór wibracji.</li><li>Wiadomości z mesh wibrują i pojawiają się na ekranie E-Ink.</li><li>Opcjonalny <b>hub nasłuchowy</b>: napisy na żywo z mowy w pomieszczeniu na E-Ink i w telefonie.</li><li><b>Ekran z językiem migowym</b> do hubu: wiadomości i ostrzeżenia w polskim lub czeskim języku migowym. <a href="#/access#sign">Jak to działa →</a></li></ul>
    <p class="small">Dostawa: kurier, z filmem konfiguracji w polskim języku migowym i tekstem.</p></div>
  <div class="card"><div class="feature-icon">✋</div><h3>Osoby głuchoniewidome</h3>
    <ul><li><b>Opaska haptyczna Pro w układzie brajlowskim</b>: 6 silniczków na przedramieniu tworzy jedną komórkę brajla, 2 kolejne sygnalizują spację i alarm. Wiadomości czujesz litera po literze.</li><li><b>Klawiatura brajlowska</b> do odpowiedzi; każdy klawisz potwierdza wibracja.</li><li>Nic nie zależy od wzroku ani słuchu.</li></ul>
    <p class="small">Dostawa: <b>osobiście</b>, patrz niżej.</p></div>
</div>

<h2 id="deafblind">Jak to działa dla osób głuchoniewidomych</h2>
<div class="two">
  <div>
    <h3>Dostawa i konfiguracja</h3>
    <ul>
      <li>Bez listów i telefonów: kontaktujemy się przez kanał wskazany w formularzu, zwykle przez asystenta, tłumacza-przewodnika lub twoją organizację.</li>
      <li>Przychodzi przeszkolony instruktor i komunikuje się tak, jak ci odpowiada: dotykowy język migowy, alfabet Lorma, pisanie na dłoni lub brajl.</li>
      <li>Razem ustawiacie siłę wibracji i tempo czytania, ćwiczycie wzory i montujecie węzeł. Obudowa ma oznaczenia dotykowe, a wtyczki solarnej nie da się włożyć odwrotnie.</li>
      <li>Można sparować zaufaną osobę, która otrzyma twoje SOS. Po kilku tygodniach wizyta kontrolna.</li>
    </ul>
  </div>
  <ol class="steps">
    <li><h3>Przychodzi wiadomość</h3><p>Węzeł przekazuje ją opasce. Wszystkie silniczki dają dwa długie impulsy: uwaga.</p></li>
    <li><h3>Zaczynasz czytać</h3><p>Stuknij w opaskę. Litery płyną jako komórki brajla na silniczkach 2 × 3, 1–4 na sekundę wg ustawień. Stuknięcie = pauza, podwójne = powtórz.</p></li>
    <li><h3>Odpowiadasz</h3><p>Pisz na klawiaturze brajlowskiej; każdy znak wraca jako wibracja. Enter wysyła go do mesh.</p></li>
    <li><h3>Alertu nie przegapisz</h3><p>Ostrzeżenia centralnego organu mają silny, powtarzający się wzór, który trwa, dopóki nie potwierdzisz go przytrzymaniem klawisza.</p></li>
    <li><h3>SOS</h3><p>Przytrzymaj dwa klawisze przez 3 sekundy: SOS trafia do twoich zaufanych osób i centralnego organu.</p></li>
  </ol>
</div>

<h2 id="build">Opaska haptyczna Pro: co to jest, żeby można ją zbudować samemu</h2>
<p>Opaskę dostarcza państwo, ale jak wszystko tutaj jest to open hardware. To ESP32-S3 z mikrofonem, który przez sterowniki haptyczne steruje 8 liniowymi aktuatorami rezonansowymi (LRA). Działa ze <b>standardowym Meshtastic</b>: odebrane wiadomości trafiają do opaski przez moduł Serial w trybie <code>TEXTMSG</code>, a prosta opaska z jednym silniczkiem może zamiast tego użyć modułu External Notification {{UP}}. Bez forka firmware'u.</p>
<div class="two">
  <div><h3>Połączenia</h3><ul>
    <li>XIAO <code>D4/SDA</code>, <code>D5/SCL</code> → multiplekser I²C TCA9548A → 8 × DRV2605L (jeden na kanał) → 8 × LRA.</li>
    <li>XIAO <code>D6/TX</code> → GPIO16 węzła, XIAO <code>D7/RX</code> ← GPIO15 węzła, wspólna GND. Albo bezprzewodowo przez BLE.</li>
    <li>Układ na nadgarstek (osoby głuche): 8 silniczków w pierścieniu, więc dźwięk pokazuje też kierunek. Układ brajlowski (osoby głuchoniewidome): komórka 2 × 3 na przedramieniu + 2 silniczki sterujące.</li>
    <li>1S LiPo 500–1000 mAh na padach baterii XIAO.</li>
  </ul></div>
  <div><h3>Piny węzła dla dodatków</h3>{{PINS_ADDONS}}</div>
</div>
{{BOM_ADDONS}}
<div class="callout warn"><p><b>Status: projekt referencyjny.</b> Firmware opaski i pliki obudowy opublikujemy w <code>hardware/addons/</code> w repozytorium. Silniczki mają skoki prądu: zasilaj je z baterii przez sterowniki, nigdy z GPIO. Zaokrąglona, izolowana obudowa; bez ciągłej wibracji dłuższej niż kilka sekund.</p></div>

<h2 id="sign">Wiadomości w języku migowym</h2>
<p>Pisany polski czy czeski nie jest dla każdej osoby Głuchej pierwszym językiem. Dlatego hub potrafi pokazać wiadomości w <b>języku migowym</b>: polskim (PJM), czeskim (ČZJ) lub w International Sign. Działa na tym samym NVIDIA Jetson Orin Nano co hub nasłuchowy, całkowicie offline, na ekranie 10″.</p>
<div class="two">
  <ol class="steps">
    <li><h3>Przychodzi wiadomość</h3><p>Węzeł przekazuje ją opasce. Opaska ją zapisuje i wibruje wzorem <b>„język migowy”</b>: trzy fale biegnące wokół nadgarstka. Tekst pojawia się też na E-Ink.</p></li>
    <li><h3>Włączasz system</h3><p>Naciśnij duży przycisk na stojaku ekranu. Jetson uruchamia się w około minutę i przez BLE pobiera z opaski wiadomości, które przyszły, gdy był wyłączony.</p></li>
    <li><h3>Wiadomość w języku migowym</h3><p>Ekran odtwarza wiadomość w twoim języku migowym z napisami. Dotknij = powtórz, przytrzymaj = wolniej.</p></li>
    <li><h3>System sam się wyłącza</h3><p>Po 10 minutach bez dotyku hub się wyłącza i oszczędza akumulator. Opaska dalej pilnuje mesh i dźwięków w pomieszczeniu.</p></li>
  </ol>
  <div>
    <h3>Co zobaczysz w języku migowym</h3>
    <ul>
      <li><b>Ostrzeżenia centralnego organu</b> (powódź, ewakuacja, schronienie, woda pitna, brak prądu, koniec zagrożenia…): nagrane wcześniej filmy, które tworzą Głusi rodzimi użytkownicy języka migowego razem z organizacjami Głuchych. Ostrzeżenie niesie kod szablonu; miejsce i czas są dodawane tekstem i alfabetem palcowym.</li>
      <li><b>Pozostałe wiadomości</b> zobaczysz jako duży, czytelny tekst. Maszynowe tłumaczenie dowolnego tekstu na język migowy nie jest jeszcze na tyle niezawodne, żeby używać go do ostrzeżeń.</li>
      <li>Bibliotekę filmów centralny organ aktualizuje <a href="#/verify">podpisanym wydaniem</a>, tak jak firmware.</li>
      <li>Język wybierasz w <a href="#/access#register">rejestracji</a>.</li>
    </ul>
  </div>
</div>
<div class="callout warn"><p><b>Status: projekt referencyjny.</b> Żaden film nie powstanie bez Głuchych rodzimych użytkowników języka migowego; awatar ich nie zastąpi. Ostrzeżenia na opasce i E-Ink docierają zawsze, nawet jeśli nie włączysz systemu. Części i gdzie kupić: <a href="#/openhw#sign">Open hardware → język migowy</a>.</p></div>

<h2 id="compute">Jaki komputer lub GPU to uciągnie</h2>
<p>Rozpoznawanie dźwięków działa w samej opasce, bez GPU, więc działa też podczas blackoutu. Zamiana mowy na tekst wymaga więcej mocy: to opcjonalny hub nasłuchowy. Hub od państwa to Jetson Orin Nano; tabela pokazuje, co jeszcze wystarczy, jeśli budujesz własny.</p>
{{COMPUTE}}
<p class="small">Wartości orientacyjne. Mowa na tekst: <a href="https://github.com/ggml-org/whisper.cpp" rel="noopener">whisper.cpp</a> lub <a href="https://github.com/SYSTRAN/faster-whisper" rel="noopener">faster-whisper</a>, oba open source i działają całkowicie offline. Hub potrzebuje zasilania z sieci lub dużej baterii; podczas blackoutu sama opaska nadal dostarcza wiadomości z mesh i alerty dźwiękowe.</p>

<div class="callout"><p><b>Wolisz zbudować sam?</b> Użyj <a href="#/openhw#selfhost">formularza samodzielnej budowy</a>; zestawy części są we wspólnym zakupie.</p></div>

<h2 id="register">Formularz rejestracyjny</h2>
<p>Dane trafiają prywatnie tylko do centralnego organu. Nigdy nie są publikowane ani pokazywane innym użytkownikom.</p>
<div class="card">
<form class="f reg" data-kind="accessibility registration">
  <div class="row2">
    <label><span class="lbl">Imię i nazwisko</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">Preferowany język</span><select name="lang"><option>Polski</option><option>Čeština</option><option>English</option></select></label>
  </div>
  <div class="row2">
    <label><span class="lbl">E-mail</span><input type="email" name="email" autocomplete="email"></label>
    <label><span class="lbl">Telefon (do SMS)</span><input type="tel" name="phone" autocomplete="tel"></label>
  </div>
  <label><span class="lbl">Jak mamy się z tobą kontaktować?</span><select name="contact"><option>E-mail</option><option>SMS</option><option>Przez asystenta, tłumacza lub opiekuna</option><option>Przez moją organizację osób głuchych, niewidomych lub głuchoniewidomych</option><option>List w brajlu</option></select></label>
  <fieldset><legend>Jestem osobą</legend>
    <label class="check"><input type="checkbox" name="deaf"> Głuchą lub słabosłyszącą</label>
    <label class="check"><input type="checkbox" name="blind"> Niewidomą lub słabowidzącą</label>
    <label class="check"><input type="checkbox" name="deafblind"> Głuchoniewidomą</label>
  </fieldset>
  <fieldset><legend>Potrzebuję dodatków</legend>
    <label class="check"><input type="checkbox" name="braille"> Klawiatura brajlowska</label>
    <label class="check"><input type="checkbox" name="haptic"> Opaska haptyczna Pro</label>
    <label class="check"><input type="checkbox" name="hub"> Hub nasłuchowy (napisy na żywo)</label>
    <label class="check"><input type="checkbox" name="sign"> Ekran z językiem migowym (wiadomości w języku migowym)</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Układ opaski</span><select name="band_layout"><option>Pierścień na nadgarstku (osoby głuche)</option><option>Komórka brajla na przedramieniu (osoby głuchoniewidome)</option><option>Nie wiem, ustalimy przy konfiguracji</option></select></label>
    <label><span class="lbl">Układ brajla</span><select name="braille_layout"><option>6-punktowy</option><option>8-punktowy</option><option>Nie wiem</option></select></label>
  </div>
  <label><span class="lbl">Język migowy na ekranie</span><select name="sign_lang"><option>Nie dotyczy</option><option>Polski język migowy (PJM)</option><option>Czeski język migowy (ČZJ)</option><option>International Sign</option></select></label>
  <label><span class="lbl">Osoby głuchoniewidome: jak instruktor ma się z tobą komunikować?</span><select name="tactile"><option>Nie dotyczy</option><option>Dotykowy język migowy</option><option>Alfabet Lorma</option><option>Pisanie na dłoni</option><option>Brajl</option><option>Przez mojego tłumacza-przewodnika lub asystenta</option></select></label>
  <label><span class="lbl">Adres dostawy</span><textarea name="address" rows="3" autocomplete="street-address" required></textarea></label>
  <label><span class="lbl">Asystent, tłumacz lub zaufana osoba (opcjonalnie)</span><input type="text" name="trusted"></label>
  <label><span class="lbl">Coś jeszcze, o czym powinniśmy wiedzieć?</span><textarea name="notes" rows="3"></textarea></label>
  <label class="check"><input type="checkbox" name="consent" required> Zgadzam się, aby centralny organ przetwarzał te dane w celu dostarczenia mi urządzenia i dodatków.</label>
  <button class="btn primary" type="submit">Wyślij rejestrację</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    faq: `
<p class="eyebrow">pytania i odpowiedzi</p>
<h1>Pytania i odpowiedzi: kwestie techniczne</h1>
<p class="lede">Jak to złożyć, który pin do czego i jak dostać się do sieci. Nie znalazłeś odpowiedzi? <a href="#/faq#ask">Zapytaj centralny organ</a>; odpowiedź zostanie opublikowana we wszystkich trzech językach w kanale tylko do odczytu.</p>
<div class="toc"><a href="#/faq#assembly">Montaż</a><a href="#/faq#wiring">Który pin gdzie</a><a href="#/faq#ask">Zadaj pytanie</a><a href="#/faq#channel">Kanał tylko do odczytu</a></div>

<h2 id="assembly">Gdy węzeł dotrze</h2>
<details class="qa" open><summary>Co muszę zrobić, gdy węzeł dotrze?</summary><div>
<p>Prawie nic. Przychodzi <b>złożony, zlutowany, wgrany i skonfigurowany</b>.</p>
<ol>
  <li>Przykręć antenę. Zawsze zanim węzeł dostanie zasilanie.</li>
  <li>Podłącz panel słoneczny (wtyczki nie da się włożyć odwrotnie).</li>
  <li>Zamontuj go jak najwyżej, panelem na południe.</li>
  <li>Naciśnij przycisk. Ekran pokaże <code>MESH · n nodes</code>.</li>
</ol></div></details>
<details class="qa"><summary>Czy muszę lutować?</summary><div><p><b>Nie.</b> Każdy węzeł przychodzi całkowicie złożony. Lutowanie jest tylko dla tych, którzy zdecydują się zbudować własny; dlatego schematy i pinout są publiczne. Jeśli chcesz, daj znać <a href="#/openhw#selfhost">formularzem samodzielnej budowy</a>, żeby państwo nie wysyłało ci węzła.</p></div></details>
<details class="qa"><summary>Chcę zbudować własny. Jak go złożyć krok po kroku?</summary><div>
<ol>
  <li><b>Najpierw test na biurku.</b> Podłącz DevKitC przez USB, wgraj firmware (zob. <a href="#/build">Kompilacja</a>) i sprawdź, czy płytka startuje, zanim cokolwiek podłączysz.</li>
  <li><b>Antena na moduł radiowy.</b> Zawsze podłącz antenę, zanim radio dostanie zasilanie. Nadawanie bez niej może zniszczyć SX1262.</li>
  <li><b>Podłącz radio</b> (SPI + BUSY, DIO1, RESET) według <a href="#/faq#wiring">schematu poniżej</a>. Krótkie przewody, poniżej 10 cm.</li>
  <li><b>Podłącz moduł e-paper</b> (SPI + DC, RST, BUSY). Dzieli 3V3 i GND.</li>
  <li><b>Wgraj wariant DIY</b> i sprawdź, czy ekran rysuje, a radio się inicjalizuje (log szeregowy 115200 baud).</li>
  <li><b>Dodaj zasilanie:</b> panel → ładowarka → bateria → regulator 3,3 V → pin 3V3. Dodaj dzielnik baterii 100k/100k na GPIO1.</li>
  <li><b>Do obudowy:</b> IP65, dławik kablowy na przewód panelu, antena na zewnątrz, jak najwyżej.</li>
</ol>
<p>Części i gdzie je kupić: <a href="#/openhw#bom">Open hardware → części</a>.</p></div></details>
<details class="qa"><summary>Czy mogę użyć SX1276 / RFM95 zamiast SX1262?</summary><div><p>Meshtastic obsługuje kilka radiów, ale zestaw pinów jest inny (DIO0 zamiast BUSY/DIO1) i trzeba zmienić wariant. SX1262 zalecamy ze względu na mniejszy pobór prądu i lepszą czułość. Obsługę radiów sprawdź upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Jakiej częstotliwości używać w Polsce i Czechach?</summary><div><p>Pasmo EU 868 MHz, region <code>EU_868</code> w Meshtastic. Dostarczone węzły są już ustawione. Jeśli budujesz własny, kup wersję radia i anteny na 868 MHz. Inne kraje: sprawdź lokalne przepisy i listę regionów upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Ekran pozostaje pusty. Co teraz?</summary><div><p>Dostarczony węzeł: sprawdź wtyczkę panelu i pozwól baterii ładować się kilka godzin w świetle dziennym, potem zapytaj w <a href="#/faq#ask">pytaniach</a>. Własna budowa: sprawdź połączenia BUSY i RST, upewnij się, że model wyświetlacza w wariancie pasuje do twojego panelu (2,13″ i 2,9″ mają inne sterowniki), i zmierz 3,3 V na module. Na płytkach Heltec wyświetlacz jest zasilany przez Vext (GPIO45, LOW = wł.).</p></div></details>
<details class="qa"><summary>Jak podłączyć węzeł do sieci?</summary><div><p>Dostarczone węzły są już podłączone. Własna budowa: ustaw region, potem użyj URL kanału opublikowanego w kanale tylko do odczytu. Krok po kroku: <a href="#/openhw#connect">Open hardware → Podłączenie</a>.</p></div></details>
<details class="qa"><summary>Skąd mam wiedzieć, że firmware jest autentyczny?</summary><div><p>Użyj strony <a href="#/verify">Weryfikacja</a>: sprawdza hash SHA-256 i podpisy ML-DSA-65 + Ed25519 w przeglądarce, potem porównaj odcisk klucza z tym w README na GitHubie.</p></div></details>
<details class="qa"><summary>Czy mogę sam podłączyć klawiaturę brajlowską lub opaskę haptyczną?</summary><div><p>Tak. Oba dodatki to open hardware: klawiatura używa I²C na GPIO17/18, opaska haptyczna Pro modułu szeregowego na GPIO15/16. Zob. <a href="#/access#build">Dostępność → zbuduj sam</a>.</p></div></details>
<details class="qa"><summary>Co robi mesh podczas blackoutu?</summary><div><p>Dalej dostarcza wiadomości, gdy stacje komórkowe milkną. Zobacz <a href="#/demo">symulację blackoutu</a>.</p></div></details>
<details class="qa"><summary>Czy mogę tu czatować z innymi użytkownikami?</summary><div><p>Nie. Na tej stronie możesz pytać tylko centralny organ. Pytania i oficjalne odpowiedzi pojawiają się w kanale tylko do odczytu; między użytkownikami nie ma odpowiedzi ani komentarzy.</p></div></details>

<h2 id="wiring">Który pin gdzie (zestaw DIY)</h2>
<p>ESP32-S3-DevKitC-1 do modułu SX1262 i modułu e-papieru SPI. Numery GPIO odpowiadają układowi Heltec Wireless Paper, więc wariant pozostaje znajomy. Odpowiednia definicja firmware'u jest w repo w <code>variants/diy_s3_eink/variant.h</code>.</p>
{{BOARD}}
{{PINS_DIY}}
<div class="callout warn"><p><b>Przed włączeniem zasilania:</b> antena podłączona · radio i wyświetlacz na <b>3,3 V</b>, nigdy 5 V · sprawdź wspólną masę GND · nie zasilaj pinu 3V3 z regulatora przy podłączonym USB, jeśli płytka nie ma zabezpieczenia (przy wgrywaniu odłącz baterię).</p></div>
<h3>Połączenia zasilania</h3>
{{POWER_CHAIN}}
<p>Pinout Heltec Wireless Paper: <a href="#/hardware#pins">Sprzęt → piny</a>.</p>

<h2 id="ask">Zapytaj centralny organ</h2>
<div class="two">
  <div>
    <p>Napisz pytanie po angielsku, czesku lub polsku. Po wysłaniu otworzy się wstępnie wypełniony formularz na GitHubie; wyślij go tam (potrzebne darmowe konto GitHub).</p>
    <ul>
      <li>Pytanie zostanie <b>automatycznie przetłumaczone</b> na EN, CS i PL.</li>
      <li>Zostanie opublikowane w <b>kanale tylko do odczytu</b> poniżej, a oficjalna odpowiedź zostanie dodana, gdy będzie gotowa.</li>
      <li>Odpowiada wyłącznie centralny organ. Wątek jest zablokowany, więc <b>użytkownicy nie mogą odpowiadać sobie nawzajem</b>.</li>
      <li>Pytania są publiczne: <b>nie podawaj danych osobowych</b>. W sprawach osobistych użyj <a href="#/access">formularza rejestracyjnego</a>.</li>
    </ul>
  </div>
  <div class="card">
    <form class="f" id="ask-form">
      <label><span class="lbl">Krótki tytuł</span><input type="text" name="title" maxlength="80" placeholder="np. Ekran pusty po wgraniu"></label>
      <label><span class="lbl">Temat</span><select name="topic"><option>Montaż / połączenia</option><option>Firmware / wgrywanie</option><option>Solar / zasilanie</option><option>Sieć / podłączenie</option><option>Dodatki dostępności</option><option>Wspólny zakup</option><option>Inne</option></select></label>
      <label><span class="lbl">Twoje pytanie</span><textarea name="question" required></textarea></label>
      <button class="btn primary" type="submit">Zapytaj centralny organ →</button>
      <div class="form-msg" id="ask-msg" aria-live="polite"></div>
    </form>
  </div>
</div>

<h2 id="channel" class="channel-head">Kanał tylko do odczytu <span class="lock">🔒 tylko do odczytu</span></h2>
<p class="small">Pytania i oficjalne odpowiedzi, automatycznie tłumaczone. Nikt poza centralnym organem nie może tu pisać.</p>
<div class="channel" id="channel"><p class="empty">…</p></div>`,

    verify: `
<p class="eyebrow">weryfikacja</p>
<h1>Zweryfikuj build firmware'u</h1>
<p class="lede">Upuść tutaj trzy pliki wydania. Wszystko sprawdzane jest lokalnie w przeglądarce za pomocą WebCrypto i dołączonej biblioteki postkwantowej. Żaden plik nie jest nigdzie wysyłany.</p>
<p>Wydania są podpisane kryptografią postkwantową standaryzowaną przez NIST (<b>ML-DSA-65, FIPS 204</b>) oraz <b>Ed25519</b> jako hybrydowe zabezpieczenie. Ważny podpis oznacza, że wydanie naprawdę pochodzi od wydawcy tej strony. Dowodzi autentyczności, a <b>nie</b> zatwierdzenia przez rząd czy inny organ.</p>
<div class="drops">
  <label class="drop" data-kind="bin"><b>firmware.bin</b><span class="small">binarka, którą chcesz wgrać</span><span class="fname">upuść plik lub kliknij</span><input type="file" accept=".bin,application/octet-stream"></label>
  <label class="drop" data-kind="manifest"><b>manifest.json</b><span class="small">zawiera hash pliku</span><span class="fname">upuść plik lub kliknij</span><input type="file" accept=".json,application/json"></label>
  <label class="drop" data-kind="sig"><b>manifest.sig</b><span class="small">{ "ML-DSA-65": "…", "Ed25519": "…" }</span><span class="fname">upuść plik lub kliknij</span><input type="file"></label>
</div>
<div class="cta" style="margin-top:0"><button class="btn" id="v-demo" type="button">Wypróbuj na wydaniu demo</button><button class="btn" id="v-reset" type="button">Reset</button><span class="small" id="v-status" style="align-self:center">czekam na pliki: 0/3</span></div>
<div id="v-result" aria-live="polite"></div>`,

    security: `
<p class="eyebrow">model bezpieczeństwa</p>
<h1>Co naprawdę chronią hash i podpisy</h1>
<h2>Hash a podpis, prostymi słowami</h2>
<p><b>Hash SHA-256</b> to odcisk pliku. Jeśli w firmwarze zmieni się choćby jeden bit, hash zmienia się całkowicie. Manifest zawiera oczekiwany hash, więc strona <a href="#/verify">Weryfikacja</a> powie Ci, czy Twój <code>.bin</code> jest bit w bit plikiem zbudowanym przez wydawcę. Sam hash nie powie jednak, <i>kto</i> go zbudował.</p>
<p><b>Podpis</b> to kryptograficzna pieczęć wydawcy na manifeście. Jeśli ktoś zmieni manifest lub podmieni firmware, podpis przestanie się zgadzać. Strona Weryfikacja sprawdza go względem klucza wydawcy dołączonego do strony jako <code>pubkey.json</code>.</p>
<h2>Dlaczego postkwantowo</h2>
<p>Dzisiejsze podpisy (np. Ed25519) opierają się na matematyce, którą przyszłe duże komputery kwantowe mogłyby złamać. ML-DSA (FIPS 204) jest standaryzowany przez NIST i zaprojektowany tak, by oprzeć się atakującemu z komputerem kwantowym. Ed25519 pozostaje obok jako hybrydowe zabezpieczenie.</p>
<div class="callout"><p>Ważny podpis dowodzi, że wydanie opublikował posiadacz klucza prywatnego tej strony. <b>Nie</b> jest to zatwierdzenie przez rząd, regulatora ani inny organ i nie poświadcza, że firmware jest bezpieczny, legalny w Twoim kraju czy wolny od błędów.</p></div>
<h2>Zaufanie do samego klucza publicznego</h2>
<p>Podpis jest tyle wart, co klucz, którym go sprawdzasz. Strona Weryfikacja pokazuje odcisk SHA-256 każdego klucza wydawcy. Porównaj go z odciskiem opublikowanym drugim kanałem, np. w README na GitHubie lub na wydrukowanej karcie przekazanej osobiście. Jeśli się różnią, nie ufaj żadnemu PASS.</p>
<h2>Czego podpisywanie firmware'u NIE chroni</h2>
<ul>
  <li><b>Szyfrowanie wiadomości to osobna sprawa.</b> Ruch w sieci szyfruje Meshtastic własnym mechanizmem dla każdego kanału; zob. <a href="https://meshtastic.org/docs/overview/encryption/" rel="noopener">oficjalną dokumentację</a> {{UP}}.</li>
  <li><b>Za legalność nadawania odpowiadasz Ty.</b> Pasma, moc i wypełnienie cyklu różnią się w zależności od kraju.</li>
  <li><b>Ta strona jest nieoficjalna.</b> Źródłem prawdy jest <a href="https://github.com/meshtastic/firmware" rel="noopener">repozytorium firmware'u Meshtastic</a>.</li>
</ul>
<h2>Jak technicznie działa weryfikacja</h2>
<ol>
  <li><code>firmware.bin</code> jest hashowany SHA-256 przez WebCrypto i porównywany z polem <code>sha256</code> w <code>manifest.json</code>.</li>
  <li>Dokładne bajty <code>manifest.json</code> są weryfikowane względem <code>manifest.sig</code>: ML-DSA-65 i Ed25519 przez lokalnie dołączoną bibliotekę (noble). PASS wymaga zgodności hasha <i>oraz</i> ważności każdego algorytmu z <code>signature_algs</code>.</li>
  <li>Odciski kluczy (SHA-256 każdego klucza publicznego) są wyświetlane do porównania drugim kanałem.</li>
  <li>Nic nie jest wysyłane, bez cookies, bez trackerów.</li>
</ol>
<p>Wydawcy podpisują wydania za pomocą <code>node tools/sign.mjs</code>; zob. README.</p>`,

    releases: `
<p class="eyebrow">wydania</p>
<h1>Wydania</h1>
<p class="lede">Generowane z <code>releases.json</code>. Każde wydanie ma <code>firmware.bin</code>, <code>manifest.json</code> i <code>manifest.sig</code>, które sprawdzisz na stronie <a href="#/verify">Weryfikacja</a>.</p>
<div class="callout warn"><p>Wydanie <b>demo</b> zawiera losowe bajty, a nie prawdziwy firmware. Służy tylko do wypróbowania weryfikatora. Nigdy go nie wgrywaj.</p></div>
<div id="rel-list" class="grid" style="grid-template-columns:1fr"><p>…</p></div>`,
  },
};
