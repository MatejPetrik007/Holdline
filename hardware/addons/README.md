# Accessibility add-ons: open hardware, self-hostable

Both add-ons are designed to work with **existing** Meshtastic firmware features, so no fork is needed. Confirm the feature names against the current [Meshtastic docs](https://meshtastic.org/docs/) (*check upstream*).

## 1. Braille keyboard (blind and deafblind users)

A chorded 6- or 8-dot Braille keyboard with its own small microcontroller (e.g. RP2040 or ATmega32U4).

- The keyboard MCU reads the dot keys plus space, backspace and enter, converts each chord to a character (Grade 1 tables for EN / CS / PL) and **acts as an I²C keyboard compatible with the CardKB protocol** (address `0x5F`, one ASCII byte per read).
- Meshtastic already supports I²C keyboards for its canned-message / free-text input, so the node sees it as an ordinary keyboard (*check upstream* for the current input module name).
- Wiring to the node: `3V3`, `GND`, `SDA → GPIO17`, `SCL → GPIO18` (DIY build). On Heltec boards use the free I²C header pins from the board's pinout.
- Feedback: each typed character can trigger a short vibration on the haptic band, so deafblind users get confirmation without sound or sight.

## 2. Haptic band Pro (deaf and deafblind users, supplied by the state)

An ESP32-S3 band with a microphone and 8 linear resonant actuators (LRA). It works with **standard Meshtastic**, no fork:

- **Link to the node:** Meshtastic **Serial module** in `TEXTMSG` mode (*check upstream*). Node GPIO15 (TX) → band RX, node GPIO16 (RX) ← band TX, common GND. Received text messages arrive on the band; text typed on the band is sent to the mesh. Wireless BLE link planned.
- **Hardware:** Seeed XIAO ESP32S3 Sense (built-in mic, 8 MB PSRAM) → I²C (D4/D5) → TCA9548A mux → 8 × DRV2605L → 8 × 10 mm LRA. 1S LiPo 500–1000 mAh on the XIAO battery pads.
- **Deaf layout:** 8 motors in a ring around the wrist. On-device sound recognition (siren, smoke alarm, doorbell, knock, own name) with a small TensorFlow Lite Micro / ESP-DL model; each sound gets its own pattern, and the ring can show direction.
- **Deafblind layout:** 6 motors as one Braille cell (2 × 3) on the forearm + 2 control motors (space, alert). Messages are played letter by letter, 1–4 characters per second; tap to pause, double-tap to repeat. Replies on the Braille keyboard, each key echoed as vibration. Central-authority alerts repeat until acknowledged; holding two keys for 3 s sends SOS.
- **Deafblind delivery:** in person, by an instructor who communicates in the person's preferred way (tactile sign language, Lorm, print-on-palm, Braille), with a follow-up visit.

### Simple version

One ERM or LRA motor via a logic-level MOSFET or a DRV2605L on **GPIO21**, driven by Meshtastic's **External Notification** module (*vibra* output). Patterns: short-short = message, long = alert, repeating = SOS.

### Optional listening hub (live captions)

Speech-to-text runs on a separate hub, shown on the E-Ink screen and the phone, with keywords sent to the band:

| Setup | Hardware | GPU / accelerator | Notes |
|---|---|---|---|
| Band only | XIAO ESP32S3 Sense | none | sound recognition only, works in a blackout |
| Hub, CPU | Raspberry Pi 5, 8 GB | none | whisper.cpp tiny / base |
| Hub, GPU (state-supplied) | NVIDIA Jetson Orin Nano Super, 8 GB | 1024-core Ampere, 67 TOPS INT8 | Whisper small in real time |
| Home PC | any | NVIDIA ≥ 4 GB VRAM for small, ≥ 6 GB for large-v3-turbo, or Apple M1+ | mains power only |

Rough planning values. Software: [whisper.cpp](https://github.com/ggml-org/whisper.cpp), [faster-whisper](https://github.com/SYSTRAN/faster-whisper), fully offline.

### Optional sign-language screen (same Jetson hub)

For Deaf users whose first language is a sign language (Czech ČZJ, Polish PJM, International Sign). Runs on the **same NVIDIA Jetson Orin Nano** as the listening hub, fully offline.

- **Flow:** the node passes a message to the band → the band stores it and vibrates the *sign language* pattern (three waves around the wrist) → the user presses the big power button on the screen stand → the Jetson boots (about a minute), pulls stored messages from the band over BLE and plays them in sign language with captions → it shuts down after 10 minutes idle to save the battery.
- **Content:** central-authority alerts use pre-recorded clips made by Deaf native signers with Deaf organisations, selected by a template code; place and time are added as text and fingerspelling. Other messages are shown as large text: free-text machine translation into sign language is not reliable enough for alerts. The clip library is updated as a signed release, like the firmware.
- **Parts:** Jetson Orin Nano Super 8 GB (shared with the hub), 10.1″ HDMI touchscreen, 256 GB NVMe SSD for the clip library, 12 V LiFePO4 20–50 Ah for blackouts (check the dev kit input range upstream), large latching power button on the Jetson power header.
- The band and E-Ink always deliver alerts, even if the screen is never switched on.

Status: reference design. Band firmware and enclosure files will be published here.

## Safety

- Motors draw current spikes: power them from the battery rail through the driver, not from a GPIO directly. Add a flyback diode on ERM motors.
- Skin contact: use rounded, insulated enclosures; avoid continuous vibration longer than a few seconds.

## Get one

- **Supplied (default)**: register on the website (Accessibility → registration form). Delivered assembled and set up; in person for deafblind people.
- **Self-build / group purchase**: Open hardware → self-build form.
