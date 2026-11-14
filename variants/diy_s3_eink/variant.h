// DIY ESP32-S3 E-Ink node: ESP32-S3-DevKitC-1 + SX1262 module + SPI e-paper.
// Open hardware, CERN-OHL-S-2.0. Pin map mirrors the Heltec Wireless Paper so the
// layout stays familiar. STARTING POINT, NOT YET TESTED ON HARDWARE: compare every
// macro name with variants/heltec_wireless_paper/variant.h in the upstream
// meshtastic/firmware tree before building - macro names change upstream.

// ---------- E-Ink display (SPI) ----------
#define USE_EINK
#define PIN_EINK_MOSI 2
#define PIN_EINK_SCLK 3
#define PIN_EINK_CS 4
#define PIN_EINK_DC 5
#define PIN_EINK_RES 6
#define PIN_EINK_BUSY 7
// No Vext switch on the DIY build: the display is powered straight from 3V3.

// ---------- LoRa SX1262 (SPI) ----------
#define USE_SX1262
#define LORA_CS 8
#define LORA_SCK 9
#define LORA_MOSI 10
#define LORA_MISO 11
#define LORA_RESET 12
#define LORA_DIO1 14

#define SX126X_CS LORA_CS
#define SX126X_DIO1 LORA_DIO1
#define SX126X_BUSY 13
#define SX126X_RESET LORA_RESET
#define SX126X_DIO2_AS_RF_SWITCH   // true for Core1262-style modules; E22 needs RXEN/TXEN instead
#define SX126X_DIO3_TCXO_VOLTAGE 1.8 // check your module's datasheet

// ---------- Power ----------
#define BATTERY_PIN 1                 // BAT+ -> 100k -> GPIO1 -> 100k -> GND
#define ADC_CHANNEL ADC1_GPIO1_CHANNEL
#define ADC_MULTIPLIER 2.0            // 1:1 divider

// ---------- UI ----------
#define BUTTON_PIN 0                  // BOOT button on the DevKitC

// ---------- Accessibility add-ons (see hardware/addons/README.md) ----------
#define I2C_SDA 17                    // Braille keyboard (CardKB-compatible, addr 0x5F)
#define I2C_SCL 18
#define EXT_NOTIFY_VIBRA_PIN 21       // haptic band driver input (set in ExternalNotification config)
