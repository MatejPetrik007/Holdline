// Holdline DIY node: ESP32-S3-DevKitC-1 + SX1262 module + 2.13" SPI e-paper (250x122, SSD1680).
// Open hardware, CERN-OHL-S-2.0. Pin map as on the website's Hardware page (site/pins.js);
// it mirrors the Heltec Wireless Paper so that the two stay interchangeable.
// NOT YET TESTED ON HARDWARE.

#define BUTTON_PIN 0 // BOOT button on the DevKitC

// I2C: Braille keyboard (CardKB-compatible, address 0x5F)
#define I2C_SDA 17
#define I2C_SCL 18

// Display (E-Ink), powered straight from 3V3 (no Vext switch)
#define PIN_EINK_CS 4
#define PIN_EINK_BUSY 7
#define PIN_EINK_DC 5
#define PIN_EINK_RES 6
#define PIN_EINK_SCLK 3
#define PIN_EINK_MOSI 2

// SPI (LoRa)
#define SPI_INTERFACES_COUNT 2
#define PIN_SPI_MISO 11
#define PIN_SPI_MOSI 10
#define PIN_SPI_SCK 9

// Power: BAT+ -> 100k -> GPIO1 -> 100k -> GND
#define BATTERY_PIN 1
#define ADC_CHANNEL ADC_CHANNEL_0
#define ADC_MULTIPLIER 2

#define NO_EXT_GPIO 1
#define NO_GPS 1

// LoRa SX1262
#define USE_SX1262
#define LORA_DIO0 RADIOLIB_NC
#define LORA_RESET 12
#define LORA_DIO1 14 // IRQ
#define LORA_DIO2 13 // BUSY
#define LORA_SCK 9
#define LORA_MISO 11
#define LORA_MOSI 10
#define LORA_CS 8
#define SX126X_CS LORA_CS
#define SX126X_DIO1 LORA_DIO1
#define SX126X_BUSY LORA_DIO2
#define SX126X_RESET LORA_RESET
#define SX126X_DIO2_AS_RF_SWITCH     // true for Core1262-style modules; an E22 needs RXEN/TXEN instead
#define SX126X_DIO3_TCXO_VOLTAGE 1.8 // check your module's datasheet
