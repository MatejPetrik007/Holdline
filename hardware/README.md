# DIY ESP32-S3 E-Ink solar node: open hardware

Licence: **CERN-OHL-S-2.0** (see `LICENSE-HARDWARE`). You may build, modify, sell and share this design, as long as you share your modifications under the same licence.

> **Every household receives this node fully assembled, flashed and configured.** The only connection people make themselves is the keyed solar plug. Everything below is for those who choose to build or repair their own (and should tell the central authority via the self-build form on the website, so no assembled node is sent).

> Status: reference wiring. It has not yet been validated as a PCB. Check every item marked *check upstream* against [meshtastic/firmware](https://github.com/meshtastic/firmware) before building.

## Parts list

| Part | Example | Notes |
|---|---|---|
| MCU board | ESP32-S3-DevKitC-1 (N8R8 / N16R8) | PSRAM recommended |
| LoRa radio | SX1262 module with TCXO (Waveshare Core1262, Ebyte E22) | 868 MHz for EU. E22: wire RXEN/TXEN per datasheet |
| Display | 2.13" or 2.9" SPI e-paper module, B/W | Must match `EINK_DISPLAY_MODEL` |
| Antenna | Tuned 868 MHz + u.FL→SMA pigtail | **Never power the radio without it** |
| Solar panel | 6 V, 2–6 W | 5–6 W for Central-European winter |
| Charger | CN3791 MPPT or TP4056 with protection | 1S Li-ion 4.2 V |
| Battery | 1–2 × protected 18650, or LiFePO4 + 3.6 V charger | Li-ion: no charging below 0 °C |
| Regulator | ME6211 / HT7333 3.3 V LDO | Low quiescent current |
| Misc | 2 × 100 kΩ, IP65 box, cable glands, vent | |

## Wiring (ESP32-S3-DevKitC-1)

| Part | Signal | ESP32-S3 | Notes |
|---|---|---|---|
| E-paper | VCC / GND | 3V3 / GND | |
| E-paper | DIN (MOSI) | GPIO2 | |
| E-paper | CLK | GPIO3 | |
| E-paper | CS | GPIO4 | |
| E-paper | DC | GPIO5 | |
| E-paper | RST | GPIO6 | |
| E-paper | BUSY | GPIO7 | input |
| SX1262 | VCC / GND | 3V3 / GND | |
| SX1262 | NSS | GPIO8 | |
| SX1262 | SCK | GPIO9 | |
| SX1262 | MOSI | GPIO10 | |
| SX1262 | MISO | GPIO11 | |
| SX1262 | NRST | GPIO12 | |
| SX1262 | BUSY | GPIO13 | input |
| SX1262 | DIO1 | GPIO14 | interrupt |
| Battery sense | BAT+ → 100k → **GPIO1** → 100k → GND | GPIO1 | ADC1 |
| Button | BOOT | GPIO0 | on board |
| Add-on bus | I²C SDA / SCL | GPIO17 / GPIO18 | Braille keyboard |
| Haptic | vibration driver input | GPIO21 | basic haptic band |
| Band serial | TX / RX | GPIO15 / GPIO16 | haptic band Pro (Serial module, TEXTMSG) |

Power chain: **panel → charger SOLAR/IN → battery (BAT±) → charger OUT± → 3.3 V LDO → DevKitC 3V3**. Disconnect the battery while flashing over USB unless your board has back-feed protection.

An interactive pin diagram and shop links are on the website (Open hardware → Which pin goes where / Parts and where to buy).

Firmware definition: [`variants/diy_s3_eink/`](../variants/diy_s3_eink/).

Accessibility add-ons: [`addons/`](addons/README.md).
