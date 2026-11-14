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
};
