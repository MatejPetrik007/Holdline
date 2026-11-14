# Accessibility add-ons: open hardware, self-hostable

Both add-ons are designed to work with **existing** Meshtastic firmware features, so no fork is needed. Confirm the feature names against the current [Meshtastic docs](https://meshtastic.org/docs/) (*check upstream*).

## 1. Braille keyboard (blind and deafblind users)

A chorded 6- or 8-dot Braille keyboard with its own small microcontroller (e.g. RP2040 or ATmega32U4).

- The keyboard MCU reads the dot keys plus space, backspace and enter, converts each chord to a character (Grade 1 tables for EN / CS / PL) and **acts as an I²C keyboard compatible with the CardKB protocol** (address `0x5F`, one ASCII byte per read).
- Meshtastic already supports I²C keyboards for its canned-message / free-text input, so the node sees it as an ordinary keyboard (*check upstream* for the current input module name).
- Wiring to the node: `3V3`, `GND`, `SDA → GPIO17`, `SCL → GPIO18` (DIY build). On Heltec boards use the free I²C header pins from the board's pinout.
- Feedback: each typed character can trigger a short vibration on the haptic band, so deafblind users get confirmation without sound or sight.

## 2. Haptic skin band (deaf and deafblind users)

A wearable band with 1–4 vibration motors that turns messages and alerts into patterns on the skin.

- Simple version: one ERM or LRA motor driven by a logic-level MOSFET (or a DRV2605L haptic driver), input on **GPIO21**. Use Meshtastic's **External Notification** module with the *vibra* output set to that GPIO (*check upstream*).
- Patterns: short-short = new message, long = alert, repeating = SOS. Advanced builds can output messages as Morse or as Braille dot patterns across four motors.
- Wireless option: a separate BLE band (e.g. nRF52-based) paired with the node; firmware for this is planned.

## Safety

- Motors draw current spikes: power them from the battery rail through the driver, not from a GPIO directly. Add a flyback diode on ERM motors.
- Skin contact: use rounded, insulated enclosures; avoid continuous vibration longer than a few seconds.

## Get one

- **Supplied**: register on the website (Accessibility → registration form).
- **Self-build / group purchase**: Open hardware → self-build form.
