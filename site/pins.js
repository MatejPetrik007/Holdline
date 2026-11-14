// Pin maps. Pin numbers are ESP32-S3 GPIOs. Function text is translated per language.
// Heltec values follow the upstream variant file at the time of writing; always re-check
// variants/<board>/variant.h in github.com/meshtastic/firmware before wiring or flashing.

export const PINS = {
  // Heltec Wireless Paper: everything is already on the PCB, this is for reference / debugging.
  heltec: [
    ['E-Ink', 'MOSI', 2, { en: 'SPI data to display', cs: 'SPI data do displeje', pl: 'Dane SPI do wyświetlacza' }],
    ['E-Ink', 'SCLK', 3, { en: 'SPI clock', cs: 'SPI hodiny', pl: 'Zegar SPI' }],
    ['E-Ink', 'CS', 4, { en: 'Chip select', cs: 'Výběr čipu (CS)', pl: 'Wybór układu (CS)' }],
    ['E-Ink', 'DC', 5, { en: 'Data / command', cs: 'Data / příkaz', pl: 'Dane / polecenie' }],
    ['E-Ink', 'RST', 6, { en: 'Display reset', cs: 'Reset displeje', pl: 'Reset wyświetlacza' }],
    ['E-Ink', 'BUSY', 7, { en: 'Display busy (input)', cs: 'Displej zaneprázdněn (vstup)', pl: 'Wyświetlacz zajęty (wejście)' }],
    ['LoRa SX1262', 'NSS / CS', 8, { en: 'Radio chip select', cs: 'Výběr rádia (CS)', pl: 'Wybór radia (CS)' }],
    ['LoRa SX1262', 'SCK', 9, { en: 'Radio SPI clock', cs: 'SPI hodiny rádia', pl: 'Zegar SPI radia' }],
    ['LoRa SX1262', 'MOSI', 10, { en: 'Radio SPI data out', cs: 'SPI data do rádia', pl: 'Dane SPI do radia' }],
    ['LoRa SX1262', 'MISO', 11, { en: 'Radio SPI data in', cs: 'SPI data z rádia', pl: 'Dane SPI z radia' }],
    ['LoRa SX1262', 'RST', 12, { en: 'Radio reset', cs: 'Reset rádia', pl: 'Reset radia' }],
    ['LoRa SX1262', 'BUSY', 13, { en: 'Radio busy (input)', cs: 'Rádio zaneprázdněno (vstup)', pl: 'Radio zajęte (wejście)' }],
    ['LoRa SX1262', 'DIO1', 14, { en: 'Radio interrupt (input)', cs: 'Přerušení z rádia (vstup)', pl: 'Przerwanie radia (wejście)' }],
    ['Power', 'Vext ctrl', 45, { en: 'Switches power to display (LOW = on)', cs: 'Spíná napájení displeje (LOW = zap.)', pl: 'Włącza zasilanie wyświetlacza (LOW = wł.)' }],
    ['Power', 'ADC ctrl', 19, { en: 'Enables battery divider', cs: 'Zapíná dělič baterie', pl: 'Włącza dzielnik baterii' }],
    ['Power', 'VBAT ADC', 20, { en: 'Battery voltage sense', cs: 'Měření napětí baterie', pl: 'Pomiar napięcia baterii' }],
    ['UI', 'BUTTON', 0, { en: 'User / PRG button', cs: 'Uživatelské tlačítko PRG', pl: 'Przycisk użytkownika PRG' }],
    ['UI', 'LED', 18, { en: 'Status LED', cs: 'Stavová LED', pl: 'Dioda statusu' }],
  ],

  // DIY build: ESP32-S3-DevKitC-1 + SX1262 module + SPI e-paper module.
  // Same GPIOs as the Heltec layout where possible, so the variant file stays familiar.
  diy: [
    ['E-paper', 'VCC', '3V3', { en: '3.3 V supply', cs: 'Napájení 3,3 V', pl: 'Zasilanie 3,3 V' }],
    ['E-paper', 'GND', 'GND', { en: 'Ground', cs: 'Zem', pl: 'Masa' }],
    ['E-paper', 'DIN', 2, { en: 'SPI data (MOSI)', cs: 'SPI data (MOSI)', pl: 'Dane SPI (MOSI)' }],
    ['E-paper', 'CLK', 3, { en: 'SPI clock', cs: 'SPI hodiny', pl: 'Zegar SPI' }],
    ['E-paper', 'CS', 4, { en: 'Chip select', cs: 'Výběr čipu', pl: 'Wybór układu' }],
    ['E-paper', 'DC', 5, { en: 'Data / command', cs: 'Data / příkaz', pl: 'Dane / polecenie' }],
    ['E-paper', 'RST', 6, { en: 'Reset', cs: 'Reset', pl: 'Reset' }],
    ['E-paper', 'BUSY', 7, { en: 'Busy (input)', cs: 'Zaneprázdněn (vstup)', pl: 'Zajęty (wejście)' }],
    ['SX1262', 'VCC', '3V3', { en: '3.3 V supply (check module max!)', cs: 'Napájení 3,3 V (ověř max. modulu!)', pl: 'Zasilanie 3,3 V (sprawdź max. modułu!)' }],
    ['SX1262', 'GND', 'GND', { en: 'Ground', cs: 'Zem', pl: 'Masa' }],
    ['SX1262', 'NSS', 8, { en: 'Chip select', cs: 'Výběr čipu', pl: 'Wybór układu' }],
    ['SX1262', 'SCK', 9, { en: 'SPI clock', cs: 'SPI hodiny', pl: 'Zegar SPI' }],
    ['SX1262', 'MOSI', 10, { en: 'SPI data out', cs: 'SPI data ven', pl: 'Dane SPI wyjście' }],
    ['SX1262', 'MISO', 11, { en: 'SPI data in', cs: 'SPI data dovnitř', pl: 'Dane SPI wejście' }],
    ['SX1262', 'NRST', 12, { en: 'Reset', cs: 'Reset', pl: 'Reset' }],
    ['SX1262', 'BUSY', 13, { en: 'Busy (input)', cs: 'Zaneprázdněn (vstup)', pl: 'Zajęty (wejście)' }],
    ['SX1262', 'DIO1', 14, { en: 'Interrupt (input)', cs: 'Přerušení (vstup)', pl: 'Przerwanie (wejście)' }],
    ['SX1262', 'ANT', 'u.FL / SMA', { en: 'Antenna: connect BEFORE powering up', cs: 'Anténa: připoj PŘED zapnutím', pl: 'Antena: podłącz PRZED włączeniem' }],
    ['Battery', 'BAT+ → 100k → GPIO1 → 100k → GND', 1, { en: 'Battery voltage divider (ADC1)', cs: 'Dělič napětí baterie (ADC1)', pl: 'Dzielnik napięcia baterii (ADC1)' }],
    ['Button', 'one leg → GPIO, other → GND', 0, { en: 'BOOT button already on DevKitC', cs: 'Tlačítko BOOT je už na DevKitC', pl: 'Przycisk BOOT jest już na DevKitC' }],
  ],

  // Solar power chain, in order of the current flow.
  power: [
    ['1', { en: 'Solar panel 6 V, 2–6 W', cs: 'Solární panel 6 V, 2–6 W', pl: 'Panel słoneczny 6 V, 2–6 W' },
      { en: '+ / − into the charger SOLAR / IN input', cs: '+ / − do vstupu SOLAR / IN nabíječky', pl: '+ / − do wejścia SOLAR / IN ładowarki' }],
    ['2', { en: 'Solar charger for 1S Li-ion (e.g. CN3791 MPPT, or TP4056 with protection)', cs: 'Solární nabíječka pro 1S Li-ion (např. CN3791 MPPT nebo TP4056 s ochranou)', pl: 'Ładowarka solarna 1S Li-ion (np. CN3791 MPPT lub TP4056 z zabezpieczeniem)' },
      { en: 'BAT+ / BAT− to the cell; OUT+ / OUT− to the regulator', cs: 'BAT+ / BAT− na článek; OUT+ / OUT− na regulátor', pl: 'BAT+ / BAT− do ogniwa; OUT+ / OUT− do regulatora' }],
    ['3', { en: '18650 Li-ion cell(s) in parallel, or LiFePO4 for frost', cs: 'Článek(y) 18650 Li-ion paralelně, nebo LiFePO4 na mráz', pl: 'Ogniwo(a) 18650 Li-ion równolegle lub LiFePO4 na mróz' },
      { en: 'Use protected cells or a BMS', cs: 'Použij chráněné články nebo BMS', pl: 'Użyj ogniw z zabezpieczeniem lub BMS' }],
    ['4', { en: 'Low-quiescent 3.3 V LDO (e.g. ME6211, HT7333)', cs: 'LDO 3,3 V s malým klidovým proudem (např. ME6211, HT7333)', pl: 'LDO 3,3 V o małym prądzie spoczynkowym (np. ME6211, HT7333)' },
      { en: 'VOUT to DevKitC 3V3, GND to GND', cs: 'VOUT na 3V3 DevKitC, GND na GND', pl: 'VOUT do 3V3 DevKitC, GND do GND' }],
  ],

  // Add-on connections on the DIY node (all optional). Heltec boards: use the free header pins of your revision.
  addons: [
    ['Braille keyboard', 'SDA', 17, { en: 'I²C data (CardKB-compatible, address 0x5F)', cs: 'I²C data (kompatibilní s CardKB, adresa 0x5F)', pl: 'Dane I²C (zgodne z CardKB, adres 0x5F)' }],
    ['Braille keyboard', 'SCL', 18, { en: 'I²C clock', cs: 'I²C hodiny', pl: 'Zegar I²C' }],
    ['Haptic band (basic)', 'IN', 21, { en: 'Motor driver input (External Notification, vibra)', cs: 'Vstup budiče motoru (External Notification, vibra)', pl: 'Wejście sterownika silnika (External Notification, vibra)' }],
    ['Haptic band Pro', 'TX → band RX', 15, { en: 'Serial module TEXTMSG: received messages to the band', cs: 'Sériový modul TEXTMSG: přijaté zprávy do náramku', pl: 'Moduł szeregowy TEXTMSG: odebrane wiadomości do opaski' }],
    ['Haptic band Pro', 'RX ← band TX', 16, { en: 'Band → node: text typed or recognised on the band', cs: 'Náramek → uzel: text napsaný nebo rozpoznaný v náramku', pl: 'Opaska → węzeł: tekst wpisany lub rozpoznany w opasce' }],
  ],

  // ESP32-S3-DevKitC-1 headers, top to bottom (USB ports at the bottom). Check the silkscreen of your board revision.
  header: {
    J1: ['3V3', '3V3', 'RST', 4, 5, 6, 7, 15, 16, 17, 18, 8, 3, 46, 9, 10, 11, 12, 13, 14, '5V', 'GND'],
    J3: ['GND', 43, 44, 1, 2, 42, 41, 40, 39, 38, 37, 36, 35, 0, 45, 48, 47, 21, 20, 19, 'GND', 'GND'],
  },
};

// Example shops (search links, no affiliation; stock and prices change). [label, url]
const SHOP = {
  mouser: (q) => ['Mouser', `https://www.mouser.com/c/?q=${encodeURIComponent(q)}`],
  laska: (q) => ['LaskaKit (CZ)', `https://www.laskakit.cz/vyhledavani/?string=${encodeURIComponent(q)}`],
  botland: (q) => ['Botland (PL)', `https://botland.com.pl/szukaj?s=${encodeURIComponent(q)}`],
  ali: (q) => ['AliExpress', `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(q.replace(/\s+/g, '-'))}.html`],
  wave: (q) => ['Waveshare', `https://www.waveshare.com/catalogsearch/result/?q=${encodeURIComponent(q)}`],
};
const L = (en, cs, pl) => ({ en, cs, pl });

// Parts for the node. Every node is delivered assembled; this list is for people who build their own.
export const BOM = [
  { part: L('Ready-made board (no soldering)', 'Hotová deska (bez pájení)', 'Gotowa płytka (bez lutowania)'), ex: 'Heltec Wireless Paper (868 MHz)',
    note: L('ESP32-S3 + SX1262 + 2.13″ E-Ink on one PCB. Same board as the state-supplied node.', 'ESP32-S3 + SX1262 + 2,13″ E-Ink na jedné desce. Stejná deska jako ve státem dodaném uzlu.', 'ESP32-S3 + SX1262 + 2,13″ E-Ink na jednej płytce. Ta sama płytka co w węźle od państwa.'),
    buy: [['Heltec', 'https://heltec.org/project/wireless-paper/'], SHOP.ali('Heltec Wireless Paper'), SHOP.laska('Heltec')] },
  { part: L('MCU board (DIY)', 'Deska MCU (DIY)', 'Płytka MCU (DIY)'), ex: 'ESP32-S3-DevKitC-1 N8R8 / N16R8',
    note: L('PSRAM recommended', 'Doporučena PSRAM', 'Zalecana PSRAM'), buy: [SHOP.mouser('ESP32-S3-DevKitC-1'), SHOP.laska('ESP32-S3'), SHOP.botland('ESP32-S3'), SHOP.ali('ESP32-S3-DevKitC-1')] },
  { part: L('LoRa radio', 'LoRa rádio', 'Radio LoRa'), ex: 'Waveshare Core1262-868M / Ebyte E22-900M',
    note: L('868 MHz for EU. E22 needs RXEN/TXEN wiring', '868 MHz pro EU. E22 potřebuje zapojit RXEN/TXEN', '868 MHz dla UE. E22 wymaga podłączenia RXEN/TXEN'), buy: [SHOP.wave('Core1262'), SHOP.laska('SX1262'), SHOP.botland('SX1262'), SHOP.ali('SX1262 868MHz')] },
  { part: L('E-paper display', 'E-paper displej', 'Wyświetlacz e-paper'), ex: '2.13″ / 2.9″ SPI, B/W',
    note: L('Must match the driver in the variant', 'Musí odpovídat ovladači ve variantě', 'Musi pasować do sterownika w wariancie'), buy: [SHOP.wave('2.13inch e-Paper Module'), SHOP.laska('e-paper'), SHOP.botland('e-paper 2,13'), SHOP.ali('2.13 inch e-paper SPI')] },
  { part: L('Antenna', 'Anténa', 'Antena'), ex: '868 MHz + u.FL→SMA pigtail',
    note: L('Never power the radio without it', 'Nikdy nezapínej rádio bez ní', 'Nigdy nie zasilaj radia bez niej'), buy: [SHOP.laska('anténa 868'), SHOP.botland('antena 868MHz'), SHOP.ali('868MHz antenna SMA')] },
  { part: L('Solar panel', 'Solární panel', 'Panel słoneczny'), ex: '6 V, 2–6 W',
    note: L('Delivered with a plug-in lead: the only part you connect yourself', 'Dodává se s konektorem: jediná část, kterou připojuješ sám', 'Dostarczany z wtyczką: jedyna część, którą podłączasz sam'), buy: [SHOP.laska('solární panel 6V'), SHOP.botland('panel słoneczny 6V'), SHOP.ali('6V solar panel 3W')] },
  { part: L('Charger', 'Nabíječka', 'Ładowarka'), ex: 'CN3791 MPPT / TP4056 + protection',
    note: L('1S Li-ion, 4.2 V', '1S Li-ion, 4,2 V', '1S Li-ion, 4,2 V'), buy: [SHOP.laska('CN3791'), SHOP.botland('TP4056'), SHOP.ali('CN3791 MPPT')] },
  { part: L('Battery', 'Baterie', 'Akumulator'), ex: '1–2 × protected 18650 / LiFePO4',
    note: L('Li-ion: no charging below 0 °C', 'Li-ion: nenabíjet pod 0 °C', 'Li-ion: nie ładować poniżej 0 °C'), buy: [SHOP.laska('18650'), SHOP.botland('18650 zabezpieczeniem')] },
  { part: L('Regulator', 'Regulátor', 'Regulator'), ex: 'ME6211 / HT7333 3.3 V LDO',
    note: L('Low quiescent current', 'Malý klidový proud', 'Mały prąd spoczynkowy'), buy: [SHOP.mouser('HT7333'), SHOP.ali('ME6211 3.3V')] },
  { part: L('Misc.', 'Ostatní', 'Inne'), ex: '2 × 100 kΩ, IP65 box, cable glands',
    note: L('Battery divider on GPIO1', 'Dělič baterie na GPIO1', 'Dzielnik baterii na GPIO1'), buy: [SHOP.laska('IP65 krabička'), SHOP.botland('obudowa IP65')] },
];

// Haptic band Pro (deaf / deafblind) and its optional listening hub.
export const BOM_ADDONS = [
  { part: L('Band MCU', 'MCU náramku', 'MCU opaski'), ex: 'Seeed XIAO ESP32S3 Sense',
    note: L('ESP32-S3, 8 MB PSRAM, built-in digital microphone, BLE; runs on-device sound recognition', 'ESP32-S3, 8 MB PSRAM, vestavěný digitální mikrofon, BLE; rozpoznává zvuky přímo v náramku', 'ESP32-S3, 8 MB PSRAM, wbudowany mikrofon cyfrowy, BLE; rozpoznaje dźwięki bezpośrednio w opasce'),
    buy: [['Seeed', 'https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html'], SHOP.laska('XIAO ESP32S3'), SHOP.botland('XIAO ESP32S3 Sense'), SHOP.ali('XIAO ESP32S3 Sense')] },
  { part: L('Haptic drivers', 'Haptické budiče', 'Sterowniki haptyczne'), ex: '8 × DRV2605L',
    note: L('One per motor, 100+ built-in effects, LRA auto-resonance', 'Jeden na motor, 100+ vestavěných efektů, automatická rezonance LRA', 'Jeden na silnik, 100+ wbudowanych efektów, automatyczny rezonans LRA'),
    buy: [['Adafruit', 'https://www.adafruit.com/product/2305'], SHOP.mouser('DRV2605L'), SHOP.ali('DRV2605L module')] },
  { part: L('I²C multiplexer', 'I²C multiplexer', 'Multiplekser I²C'), ex: 'TCA9548A',
    note: L('DRV2605L has a fixed address; the mux addresses all 8', 'DRV2605L má pevnou adresu; mux adresuje všech 8', 'DRV2605L ma stały adres; mux adresuje wszystkie 8'),
    buy: [SHOP.laska('TCA9548A'), SHOP.botland('TCA9548A'), SHOP.ali('TCA9548A')] },
  { part: L('Motors', 'Motory', 'Silniki'), ex: '8 × LRA coin, 10 mm (e.g. 1030 / 0832)',
    note: L('LRA: crisper and more distinguishable than ERM', 'LRA: ostřejší a lépe rozlišitelné než ERM', 'LRA: wyraźniejsze i łatwiejsze do odróżnienia niż ERM'),
    buy: [SHOP.ali('LRA vibration motor 1030'), SHOP.mouser('linear resonant actuator')] },
  { part: L('Band power', 'Napájení náramku', 'Zasilanie opaski'), ex: '1S LiPo 500–1000 mAh',
    note: L('XIAO has a built-in LiPo charger', 'XIAO má vestavěnou nabíječku LiPo', 'XIAO ma wbudowaną ładowarkę LiPo'),
    buy: [SHOP.laska('LiPo 1000mAh'), SHOP.botland('LiPo 1000mAh')] },
  { part: L('Listening hub (CPU)', 'Poslechový hub (CPU)', 'Hub nasłuchowy (CPU)'), ex: 'Raspberry Pi 5, 8 GB + USB microphone',
    note: L('Speech-to-text with whisper.cpp (tiny / base model)', 'Převod řeči na text s whisper.cpp (model tiny / base)', 'Mowa na tekst z whisper.cpp (model tiny / base)'),
    buy: [['Raspberry Pi', 'https://www.raspberrypi.com/products/raspberry-pi-5/'], SHOP.laska('Raspberry Pi 5'), SHOP.botland('Raspberry Pi 5 8GB')] },
  { part: L('Listening hub (GPU)', 'Poslechový hub (GPU)', 'Hub nasłuchowy (GPU)'), ex: 'NVIDIA Jetson Orin Nano Super Developer Kit, 8 GB',
    note: L('State-supplied version. 1024-core Ampere GPU, runs Whisper small in real time', 'Verze dodávaná státem. GPU Ampere s 1024 jádry, Whisper small v reálném čase', 'Wersja od państwa. GPU Ampere z 1024 rdzeniami, Whisper small w czasie rzeczywistym'),
    buy: [['NVIDIA', 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/nano-super-developer-kit/'], SHOP.mouser('Jetson Orin Nano Super'), SHOP.botland('Jetson Orin Nano')] },
];

// What compute runs which part of the haptic pipeline. Rough planning values, measure your own setup.
export const COMPUTE = [
  { tier: L('Band only', 'Jen náramek', 'Tylko opaska'), hw: 'ESP32-S3 (XIAO ESP32S3 Sense)', gpu: L('none', 'žádné', 'brak'),
    does: L('Mesh messages as vibration; on-device sound recognition (siren, smoke alarm, doorbell, knock, own name) with a small TensorFlow Lite Micro / ESP-DL model', 'Zprávy z mesh jako vibrace; rozpoznání zvuků přímo v zařízení (siréna, požární hlásič, zvonek, klepání, vlastní jméno) malým modelem TensorFlow Lite Micro / ESP-DL', 'Wiadomości z mesh jako wibracje; rozpoznawanie dźwięków w urządzeniu (syrena, czujnik dymu, dzwonek, pukanie, własne imię) małym modelem TensorFlow Lite Micro / ESP-DL'), power: '≈ 0.3–0.5 W' },
  { tier: L('Hub, CPU', 'Hub, CPU', 'Hub, CPU'), hw: 'Raspberry Pi 5, 8 GB', gpu: L('none (4 × Cortex-A76)', 'žádné (4 × Cortex-A76)', 'brak (4 × Cortex-A76)'),
    does: L('Speech-to-text with whisper.cpp tiny / base, a few seconds behind live speech; captions on the phone and E-Ink, keywords as vibration', 'Převod řeči na text s whisper.cpp tiny / base, pár sekund za živou řečí; titulky v telefonu a na E-Ink, klíčová slova jako vibrace', 'Mowa na tekst z whisper.cpp tiny / base, kilka sekund za mową na żywo; napisy w telefonie i na E-Ink, słowa kluczowe jako wibracje'), power: '≈ 5–10 W' },
  { tier: L('Hub, GPU (state-supplied)', 'Hub, GPU (dodává stát)', 'Hub, GPU (od państwa)'), hw: 'NVIDIA Jetson Orin Nano Super, 8 GB', gpu: L('1024-core Ampere GPU, 67 TOPS (INT8)', 'GPU Ampere, 1024 jader, 67 TOPS (INT8)', 'GPU Ampere, 1024 rdzenie, 67 TOPS (INT8)'),
    does: L('Real-time captions with Whisper small (faster-whisper / whisper.cpp CUDA), speaker direction, better accuracy in CS and PL', 'Titulky v reálném čase s Whisper small (faster-whisper / whisper.cpp CUDA), směr mluvčího, lepší přesnost v CS a PL', 'Napisy w czasie rzeczywistym z Whisper small (faster-whisper / whisper.cpp CUDA), kierunek mówcy, lepsza dokładność w CS i PL'), power: '≈ 7–25 W' },
  { tier: L('Home PC', 'Domácí PC', 'Domowy PC'), hw: L('Any PC or laptop', 'Jakékoli PC nebo notebook', 'Dowolny PC lub laptop'), gpu: L('NVIDIA ≥ 4 GB VRAM (GTX 1650, RTX 3050) for small; ≥ 6 GB (RTX 3060, RTX 4060) for large-v3-turbo; or Apple M1 or newer', 'NVIDIA ≥ 4 GB VRAM (GTX 1650, RTX 3050) pro small; ≥ 6 GB (RTX 3060, RTX 4060) pro large-v3-turbo; nebo Apple M1 a novější', 'NVIDIA ≥ 4 GB VRAM (GTX 1650, RTX 3050) dla small; ≥ 6 GB (RTX 3060, RTX 4060) dla large-v3-turbo; lub Apple M1 i nowsze'),
    does: L('Best accuracy, but needs mains power: fine at home, not in a blackout', 'Nejlepší přesnost, ale potřebuje síť: doma v pohodě, při blackoutu ne', 'Najlepsza dokładność, ale wymaga zasilania z sieci: w domu tak, przy blackoucie nie'), power: '≈ 60–250 W' },
];
