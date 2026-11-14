const DISCLAIMER = `<p><b>Zastrzeżenie:</b> to nieoficjalny, społecznościowy build i strona z dokumentacją. Nie jest powiązana z projektem Meshtastic, nie jest przez niego zatwierdzona ani wspierana. Każdego firmware'u używasz na własne ryzyko. Korzystanie z radia LoRa jest regulowane: pasma, limity mocy i zasady licencyjne różnią się w zależności od kraju. Przed nadawaniem sprawdź przepisy dla swojej lokalizacji, np. w <a href="https://meshtastic.org/docs/" rel="noopener">oficjalnej dokumentacji Meshtastic</a>.</p>`;

export default {
  ui: {
    brand: 'Węzeł Meshtastic E-Ink',
    nav: { home: 'Start', hardware: 'Sprzęt', build: 'Kompilacja', solar: 'Solar', openhw: 'Open hardware', access: 'Dostępność', faq: 'Pytania i odpowiedzi', verify: 'Weryfikacja', security: 'Bezpieczeństwo', releases: 'Wydania' },
    up: 'sprawdź upstream',
    copy: 'KOPIUJ', copied: 'SKOPIOWANO',
    pinCols: ['Element', 'Sygnał', 'Pin ESP32-S3', 'Do czego służy'],
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
    <p class="lede">Węzeł LoRa typu open hardware z firmware'em <a href="https://meshtastic.org" rel="noopener">Meshtastic</a> i wyświetlaczem E-Ink. Zbuduj go sam i dołącz do sieci albo otrzymaj gotowy od państwa. Jeśli jesteś osobą głuchą lub niewidomą, zarejestruj się po dodatki takie jak klawiatura brajlowska czy haptyczna opaska na skórę. Każde wydanie firmware'u zweryfikujesz w przeglądarce przed wgraniem.</p>
    <div class="cta">
      <a class="btn primary" href="#/openhw">Zbuduj go sam →</a>
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
  <a class="card" href="#/openhw"><div class="feature-icon">⚒</div><span class="num">05</span><h3>Open hardware, budowany w domu</h3><p>Schemat, pinout i lista części są otwarte. Każdy może zbudować węzeł w domu i podłączyć się do sieci. Dołącz do wspólnego zakupu, by mieć tańsze części. →</p></a>
  <a class="card" href="#/access"><div class="feature-icon">⠿</div><span class="num">06</span><h3>Dostępny dla osób głuchych i niewidomych</h3><p>Zarejestruj się po dodatki takie jak klawiatura brajlowska lub haptyczna opaska na skórę. Są również open source, więc możesz je zbudować sam. →</p></a>
</div>

<div class="cta"><a class="btn accent" href="#/verify">Zweryfikuj plik firmware'u</a><a class="btn" href="#/build">Skompiluj firmware sam</a></div>

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
<h1>Open hardware: każdy może zbudować go w domu</h1>
<p class="lede">Firmware, schemat, pinout, lista części i dodatki dostępności są otwarte. Zbuduj węzeł w domu, wgraj zweryfikowany firmware i dołącz do sieci. Jeśli nie chcesz budować, państwo automatycznie dostarczy Ci gotowy węzeł.</p>
<div class="toc"><a href="#/openhw#paths">Trzy drogi do węzła</a><a href="#/openhw#bom">Lista części</a><a href="#/openhw#connect">Podłączenie do sieci</a><a href="#/openhw#selfhost">Dodatki DIY i wspólny zakup</a></div>

<h2 id="paths">Trzy drogi do węzła</h2>
<div class="grid">
  <div class="card"><span class="num">A</span><h3>Zbuduj sam</h3><p>Skorzystaj z listy części i <a href="#/faq#wiring">instrukcji połączeń</a>, wgraj firmware i dołącz do sieci. Open hardware oznacza, że możesz projekt kopiować, modyfikować i udostępniać.</p></div>
  <div class="card"><span class="num">B</span><h3>Dostarczy państwo</h3><p>Wszyscy pozostali otrzymają standardowy węzeł solarny z wgranym firmware'em, dostarczany automatycznie przez państwo. Szczegóły dostawy centralny organ publikuje w <a href="#/faq#channel">kanale tylko do odczytu</a>.</p></div>
  <a class="card" href="#/access"><span class="num">C</span><h3>Osoby głuche, niewidome, głuchoniewidome</h3><p>Zarejestruj się, a razem z węzłem otrzymasz dodatki dostępności, takie jak klawiatura brajlowska lub haptyczna opaska na skórę. →</p></a>
</div>

<h2 id="bom">Lista części (referencyjny zestaw DIY)</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Część</th><th>Przykład</th><th>Uwagi</th></tr></thead><tbody>
<tr><td>Płytka MCU</td><td>ESP32-S3-DevKitC-1 (N8R8 lub N16R8)</td><td>Zalecana PSRAM</td></tr>
<tr><td>Radio LoRa</td><td>Moduł SX1262 z TCXO, np. Waveshare Core1262 lub Ebyte E22</td><td>Wybierz pasmo dla swojego regionu (UE: 868 MHz). E22 wymaga podłączenia RXEN/TXEN, zob. datasheet</td></tr>
<tr><td>Wyświetlacz</td><td>Moduł e-papieru SPI 2,13″ lub 2,9″ (czarno-biały)</td><td>Musi odpowiadać sterownikowi wyświetlacza w wariancie {{UP}}</td></tr>
<tr><td>Antena</td><td>Dostrojona antena 868 MHz, pigtail u.FL→SMA</td><td>Nigdy nie włączaj radia bez anteny</td></tr>
<tr><td>Panel słoneczny</td><td>6 V, 2–6 W</td><td>Zob. <a href="#/solar">Solar</a></td></tr>
<tr><td>Ładowarka</td><td>CN3791 (MPPT) lub TP4056 z zabezpieczeniem</td><td>1S Li-ion, 4,2 V</td></tr>
<tr><td>Bateria</td><td>1–2 × 18650 z zabezpieczeniem lub LiFePO4</td><td>LiFePO4 wymaga ładowarki 3,6 V</td></tr>
<tr><td>Regulator</td><td>LDO 3,3 V o małym prądzie spoczynkowym (ME6211, HT7333)</td><td>Zasila pin 3V3</td></tr>
<tr><td>Inne</td><td>2 × rezystor 100 kΩ, obudowa IP65, dławiki kablowe</td><td>Dzielnik napięcia baterii na GPIO1</td></tr>
</tbody></table></div>
<p>Pliki projektu są w repo w katalogach <code>hardware/</code> i <code>variants/diy_s3_eink/</code>: <a href="{{REPO}}">{{REPO}}</a>. Licencja sprzętu CERN-OHL-S-2.0, firmware GPL-3.0 (jak upstream).</p>

<h2 id="connect">Podłączenie do sieci</h2>
<ol class="steps">
  <li><h3>Ustaw region</h3><p>W aplikacji Meshtastic lub CLI ustaw region LoRa <code>EU_868</code> dla Polski i Czech (inne kraje: sprawdź upstream).</p><pre><code>meshtastic --set lora.region EU_868</code></pre></li>
  <li><h3>Dodaj kanał sieci</h3><p>Centralny organ publikuje URL / kod QR kanału w <a href="#/faq#channel">kanale tylko do odczytu</a>. Otwórz go w aplikacji lub zastosuj przez CLI.</p><pre><code>meshtastic --seturl "&lt;URL kanału z kanału tylko do odczytu&gt;"</code></pre></li>
  <li><h3>Sprawdź, czy jesteś w sieci</h3><p>W ciągu kilku minut na liście węzłów powinni pojawić się sąsiedzi. Nikogo? Podnieś antenę wyżej, sprawdź region i przeczytaj <a href="#/faq">pytania i odpowiedzi</a>.</p></li>
</ol>

<h2 id="selfhost">Dodatki DIY i wspólny zakup</h2>
<p>Klawiatura brajlowska i opaska haptyczna są open source i open hardware, więc możesz je zbudować i uruchomić (self-hostować) samodzielnie, zamiast czekać na dostarczony egzemplarz. Dołącz do <b>wspólnego zakupu</b>, aby otrzymać zestawy części w cenach hurtowych. Rejestracja trafia prywatnie do centralnego organu i nigdy nie jest publikowana.</p>
<div class="card">
<form class="f reg" data-kind="DIY / wspólny zakup">
  <div class="row2">
    <label><span class="lbl">Imię i nazwisko</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">E-mail</span><input type="email" name="email" required autocomplete="email"></label>
  </div>
  <div class="row2">
    <label><span class="lbl">Kraj</span><select name="country"><option>Polska</option><option>Czechy</option><option>Słowacja</option><option>Inny</option></select></label>
    <label><span class="lbl">Miasto / region</span><input type="text" name="region"></label>
  </div>
  <fieldset><legend>Co chcesz zbudować?</legend>
    <label class="check"><input type="checkbox" name="node"> Węzeł mesh (ESP32-S3 + E-Ink + solar)</label>
    <label class="check"><input type="checkbox" name="braille"> Dodatek: klawiatura brajlowska</label>
    <label class="check"><input type="checkbox" name="haptic"> Dodatek: haptyczna opaska na skórę</label>
  </fieldset>
  <div class="row2">
    <label><span class="lbl">Dołączyć do wspólnego zakupu?</span><select name="groupbuy"><option value="yes">Tak, zarezerwujcie dla mnie zestawy</option><option value="no">Nie, sam kupię części</option></select></label>
    <label><span class="lbl">Liczba zestawów</span><input type="number" name="qty" min="1" max="50" value="1"></label>
  </div>
  <label><span class="lbl">Doświadczenie</span><select name="experience"><option>Pierwszy projekt elektroniczny</option><option>Umiem lutować i wgrywać firmware</option><option>Doświadczony majsterkowicz</option></select></label>
  <label class="check"><input type="checkbox" name="consent" required> Zgadzam się, aby centralny organ przetwarzał te dane w celu organizacji wspólnego zakupu.</label>
  <button class="btn primary" type="submit">Wyślij rejestrację</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    access: `
<p class="eyebrow">dostępność</p>
<h1>Komunikacja mesh dla osób głuchych, niewidomych i głuchoniewidomych</h1>
<p class="lede">Komunikacja poza siecią musi działać dla każdego. Jeśli jesteś osobą głuchą, niedosłyszącą, niewidomą, słabowidzącą lub głuchoniewidomą, zarejestruj się poniżej, a państwo dostarczy Ci węzeł z dodatkami dostępności.</p>

<div class="grid">
  <div class="card"><div class="feature-icon">⠿</div><h3>Klawiatura brajlowska</h3><p>Sześcio- lub ośmiopunktowe wejście brajlowskie, którym piszesz wiadomości bezpośrednio do węzła. Uzupełnione o komunikaty stanu przyjazne czytnikom ekranu w aplikacji towarzyszącej. Dla osób niewidomych i głuchoniewidomych.</p></div>
  <div class="card"><div class="feature-icon">≋</div><h3>Haptyczna opaska na skórę</h3><p>Opaska do noszenia, która zamienia przychodzące wiadomości i alerty na wzory wibracji na skórze, więc nic nie zależy od słuchu ani wzroku. Dla osób głuchych i głuchoniewidomych.</p></div>
  <div class="card"><div class="feature-icon">▤</div><h3>Kontrastowy E-Ink</h3><p>Ekran E-Ink jest czytelny nawet w pełnym słońcu i pokazuje alerty wizualnie, bez dźwięku. Planowane są układy z dużą czcionką.</p></div>
</div>

<div class="callout"><p><b>Open source, więc również samodzielnie.</b> Oba dodatki są open hardware. Jeśli Ty lub ktoś, kto Ci pomaga, wolicie je zbudować, użyjcie <a href="#/openhw#selfhost">formularza DIY i wspólnego zakupu</a>.</p></div>

<h2 id="register">Formularz rejestracyjny</h2>
<p>Twoje dane trafiają prywatnie wyłącznie do centralnego organu. Nigdy nie są publikowane ani pokazywane innym użytkownikom.</p>
<div class="card">
<form class="f reg" data-kind="rejestracja – dostępność">
  <div class="row2">
    <label><span class="lbl">Imię i nazwisko</span><input type="text" name="name" required autocomplete="name"></label>
    <label><span class="lbl">Preferowany język</span><select name="lang"><option>Polski</option><option>English</option><option>Čeština</option></select></label>
  </div>
  <div class="row2">
    <label><span class="lbl">E-mail</span><input type="email" name="email" autocomplete="email"></label>
    <label><span class="lbl">Telefon (do SMS)</span><input type="tel" name="phone" autocomplete="tel"></label>
  </div>
  <label><span class="lbl">Jak mamy się z Tobą kontaktować?</span><select name="contact"><option>E-mail</option><option>SMS</option><option>Przez asystenta lub opiekuna</option><option>List w brajlu</option></select></label>
  <fieldset><legend>Jestem osobą</legend>
    <label class="check"><input type="checkbox" name="deaf"> Głuchą lub niedosłyszącą</label>
    <label class="check"><input type="checkbox" name="blind"> Niewidomą lub słabowidzącą</label>
    <label class="check"><input type="checkbox" name="deafblind"> Głuchoniewidomą</label>
  </fieldset>
  <fieldset><legend>Potrzebne dodatki</legend>
    <label class="check"><input type="checkbox" name="braille"> Klawiatura brajlowska</label>
    <label class="check"><input type="checkbox" name="haptic"> Haptyczna opaska na skórę (wibracje)</label>
  </fieldset>
  <label><span class="lbl">Układ brajla (jeśli dotyczy)</span><select name="braille_layout"><option>6-punktowy</option><option>8-punktowy</option><option>Nie wiem</option></select></label>
  <label><span class="lbl">Adres dostawy</span><textarea name="address" rows="3" autocomplete="street-address" required></textarea></label>
  <label><span class="lbl">Coś jeszcze, o czym powinniśmy wiedzieć?</span><textarea name="notes" rows="3"></textarea></label>
  <label class="check"><input type="checkbox" name="consent" required> Zgadzam się, aby centralny organ przetwarzał te dane w celu dostarczenia urządzenia i dodatków.</label>
  <button class="btn primary" type="submit">Wyślij rejestrację</button>
  <div class="form-msg" aria-live="polite"></div>
</form>
</div>`,

    faq: `
<p class="eyebrow">pytania i odpowiedzi</p>
<h1>Pytania i odpowiedzi: kwestie techniczne</h1>
<p class="lede">Jak to złożyć, który pin do czego i jak dostać się do sieci. Nie znalazłeś odpowiedzi? <a href="#/faq#ask">Zapytaj centralny organ</a>; odpowiedź zostanie opublikowana we wszystkich trzech językach w kanale tylko do odczytu.</p>
<div class="toc"><a href="#/faq#assembly">Montaż</a><a href="#/faq#wiring">Który pin gdzie</a><a href="#/faq#ask">Zadaj pytanie</a><a href="#/faq#channel">Kanał tylko do odczytu</a></div>

<h2 id="assembly">Jak to złożyć</h2>
<details class="qa" open><summary>Jak zmontować węzeł krok po kroku?</summary><div>
<ol>
  <li><b>Najpierw test na biurku.</b> Podłącz DevKitC przez USB, wgraj firmware (zob. <a href="#/build">Kompilacja</a>) i sprawdź, czy płytka się uruchamia, zanim podłączysz cokolwiek innego.</li>
  <li><b>Antena na moduł radiowy.</b> Zawsze podłącz antenę, zanim radio dostanie zasilanie. Nadawanie bez anteny może zniszczyć SX1262.</li>
  <li><b>Podłącz radio</b> (SPI + BUSY, DIO1, RESET) według tabeli poniżej. Przewody krótkie, poniżej 10 cm.</li>
  <li><b>Podłącz moduł e-papieru</b> (SPI + DC, RST, BUSY). Współdzieli 3V3 i GND.</li>
  <li><b>Wgraj wariant DIY</b> i sprawdź, czy wyświetlacz rysuje obraz, a radio się inicjalizuje (log szeregowy 115200 baud).</li>
  <li><b>Dodaj zasilanie:</b> panel → ładowarka → bateria → regulator 3,3 V → pin 3V3. Dodaj dzielnik baterii 100k/100k na GPIO1.</li>
  <li><b>Zamknij w obudowie:</b> obudowa IP65, dławik kablowy na przewód panelu, antena na zewnątrz i jak najwyżej.</li>
</ol></div></details>
<details class="qa"><summary>Czy muszę lutować?</summary><div><p>Z Heltec Wireless Paper nie: to jedna płytka. Podłączasz tylko antenę i baterię. Zestaw DIY wymaga podstawowego lutowania listew goldpin i zasilania albo, na pierwszy test, przewodów połączeniowych na płytce stykowej.</p></div></details>
<details class="qa"><summary>Czy zamiast SX1262 mogę użyć radia SX1276 / RFM95?</summary><div><p>Meshtastic obsługuje kilka radiów, ale zestaw pinów jest inny (DIO0 zamiast BUSY/DIO1) i trzeba zmienić plik wariantu. SX1262 zalecamy ze względu na mniejszy pobór i lepszą czułość. Obsługę radiów sprawdź upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Jakiej częstotliwości używać w Polsce i Czechach?</summary><div><p>Pasma UE 868 MHz, w Meshtastic region <code>EU_868</code>. Kupuj wersję radia i anteny na 868 MHz. Inne kraje: sprawdź lokalne przepisy i listę regionów upstream {{UP}}.</p></div></details>
<details class="qa"><summary>Ekran pozostaje pusty. Co teraz?</summary><div><p>Sprawdź połączenia BUSY i RST, upewnij się, że model wyświetlacza w wariancie odpowiada Twojemu panelowi (2,13″ i 2,9″ mają różne sterowniki), i zmierz 3,3 V na module. Na płytkach Heltec wyświetlacz jest zasilany przez Vext (GPIO45, LOW = wł.).</p></div></details>
<details class="qa"><summary>Jak podłączyć mój węzeł do sieci?</summary><div><p>Ustaw region, a następnie zastosuj URL kanału publikowany przez centralny organ w kanale tylko do odczytu. Krok po kroku: <a href="#/openhw#connect">Open hardware → Podłączenie</a>.</p></div></details>
<details class="qa"><summary>Skąd mam wiedzieć, że firmware jest prawdziwy?</summary><div><p>Użyj strony <a href="#/verify">Weryfikacja</a>: sprawdza hash SHA-256 i podpisy ML-DSA-65 + Ed25519 w przeglądarce. Następnie porównaj odcisk klucza z tym w README na GitHubie.</p></div></details>
<details class="qa"><summary>Czy mogę sam podłączyć klawiaturę brajlowską lub opaskę haptyczną?</summary><div><p>Tak. Oba dodatki są open hardware. Podłącza się je do wolnych GPIO lub przez I²C; przypisanie pinów jest w repo w <code>hardware/addons/</code>. Zob. <a href="#/access">Dostępność</a> i <a href="#/openhw#selfhost">formularz DIY</a>.</p></div></details>
<details class="qa"><summary>Czy mogę tu pisać z innymi użytkownikami?</summary><div><p>Nie. Na tej stronie możesz pytać tylko centralny organ. Pytania i oficjalne odpowiedzi pojawiają się w kanale tylko do odczytu; między użytkownikami nie ma tu odpowiedzi ani komentarzy.</p></div></details>

<h2 id="wiring">Który pin gdzie (zestaw DIY)</h2>
<p>ESP32-S3-DevKitC-1 do modułu SX1262 i modułu e-papieru SPI. Numery GPIO odpowiadają układowi Heltec Wireless Paper, więc wariant pozostaje znajomy. Odpowiednia definicja firmware'u jest w repo w <code>variants/diy_s3_eink/variant.h</code>.</p>
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
