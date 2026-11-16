# Holdline public firmware: build specification

This is the hand-off brief for building the **public firmware** of Holdline: the firmware that runs on every household unit and on the authority's relay routers. It is written for an engineer or a coding model that has not seen the project before. Everything here is public and lives in this repository.

The crisis-centre (authority) firmware is **not** part of this repository. It is specified separately and distributed through an internal system. This document only defines the interface the public firmware must speak to it (section 6).

---

## 1. What Holdline is

Holdline is a civil-protection alert network for households, built on [Meshtastic](https://meshtastic.org) LoRa mesh radios:

- Every household receives a **unit**, assembled by the state: an ESP32-S3 board with an SX1262 LoRa radio, an E-Ink screen, an 18650 cell and a small solar panel. It works for days without mains power, phone network or internet.
- During a blackout the cell network fails within hours (tower batteries drain). A **crisis centre** then sends alerts over LoRa. Units relay them hop by hop (Meshtastic managed flooding) until every household has them.
- Units **cannot chat**. People can only **ask the authority** a question. The authority answers and publishes the answer to everyone as an FAQ entry, translated into Czech, Polish and English. Nobody can message anybody else.
- The pilot region is the twin town of **Cieszyn (PL) / Český Těšín (CZ)** on the Olza river, so everything is trilingual: **CS / PL / EN**.
- Accessibility is a first-class requirement: Braille keyboard, haptic band Pro, listening hub (speech-to-text) and a sign-language screen connect to the unit (section 5.8).

The public website (`site/`, deployed to GitHub Pages) explains the system, runs a blackout simulation, verifies firmware signatures in the browser and hosts the registration form. Its blackout demo (`site/demo.js`) is the behavioural reference for sections 5.3 to 5.5.

## 2. Two firmwares, two distribution channels

| | Public firmware (this repo) | Authority firmware (not in this repo) |
|---|---|---|
| Runs on | household units, authority relay routers | crisis-centre base stations |
| Source | public on GitHub, GPL-3.0 | private repository in the authority's internal system |
| Binaries | signed releases on the website and GitHub | signed packages, distributed internally from the national level to regions (kraje / województwa) and then to cities, only to cleared staff |
| Can originate alerts | **no** | yes |
| Holds private keys | only its own per-unit keys (section 7.3) | alert signing keys in a hardware token / HSM |
| Verification | anyone can rebuild it and compare hashes; the website verifies signatures | verified by authority tooling; never published |

Security must **not** depend on keeping the public firmware secret. A unit that is fully reverse-engineered must still be unable to forge an alert or impersonate the authority.

## 3. Starting point in this repository

| Path | Use |
|---|---|
| `variants/diy_s3_eink/` | Meshtastic variant for the DIY board (ESP32-S3-DevKitC-1 + SX1262 + SPI e-paper). Pin map in `variant.h`; marked "not yet tested on hardware". |
| `site/pins.js` | Pin maps for the DIY board and the Heltec Wireless Paper, plus add-on pins |
| `hardware/`, `hardware/addons/README.md` | Parts list, wiring, Braille keyboard and haptic band Pro reference designs |
| `tools/sign.mjs` | Release signing: ML-DSA-65 (FIPS 204) + Ed25519 over a JSON manifest with SHA-256 per file |
| `site/app.js` (`runVerify`), `site/vendor/noble.js` | In-browser verifier; the unit's update check must accept exactly what this accepts |
| `site/pubkey.json`, `README.md` | Current publisher public keys and fingerprints |
| `site/demo.js` | Reference behaviour: managed flooding, hop limit, per-node display language, translation modes, packet splitting |

Target boards (the "env hint" names on the website's Hardware page): `heltec-wireless-paper` (reference), `heltec-vision-master-e213`, `heltec-vision-master-e290`, `lilygo-t5-s3-epaper`, `diy-s3-eink`. Confirm each against upstream `platformio.ini` before relying on it.

## 4. Approach

Build the public firmware as a **thin fork of upstream `meshtastic/firmware`**: keep the radio stack, routing and drivers, and add one Holdline module plus a locked configuration. Prefer an overlay (module source, variant files, patches) in `firmware/household/` that applies to a pinned upstream tag, over copying the whole upstream tree. Rebasing onto new upstream releases must stay cheap.

Upstream names change. Every Meshtastic feature named below (roles, rebroadcast modes, admin key, managed mode, Serial module, External Notification, port numbers, payload limit) must be checked against the pinned upstream tag; mark anything not confirmed as such in code comments.

## 5. Household unit: required behaviour

### 5.1 Locked configuration

- Region `EU_868`, the authority channel (name, PSK) and modem preset come from provisioning (section 7.3), not from the user.
- The device is **managed**: local config changes via app, BLE, serial or buttons are refused, except the display language and accessibility settings (section 5.6). Remote admin is accepted only from the authority admin key.
- Position, environment and device telemetry broadcasting: **off** (privacy). Battery level may be reported only inside a question packet (section 5.5), if the authority asks for it.
- Wi-Fi: off. BLE: allowed only to pair the owner's phone or an add-on, and only for the operations in 5.5 to 5.8.

### 5.2 No user-to-user messaging

Remove or block at the send path, not only in the UI:

- text messages to the public channel,
- direct messages to any node except the authority node IDs from the trust store (section 7),
- range test, store-and-forward client requests, remote hardware, waypoints, and any other module that lets a user originate traffic to other users.

Incoming user-to-user text from non-Holdline devices on the same frequency is ignored: not displayed, not relayed.

### 5.3 Relay policy

Units **do relay**. Without relaying, only units in direct range of the crisis centre or a router would get alerts.

A unit rebroadcasts (managed flooding, standard hop-limit handling) **only**:

1. Holdline authority packets (ALERT, FAQ, KEYS, CANCEL) on the authority channel, and
2. QUESTION packets addressed to an authority node ID.

Everything else is dropped without rebroadcast. Apply rate limits so that a malicious device cannot use units as an amplifier: per source node ID, at most N relayed QUESTION packets per hour (proposed N = 6), and drop duplicates by message ID as Meshtastic already does.

Signature checks (section 7.2) need the whole message. Relaying must therefore **not wait for verification**: relay by type, channel and addressing, verify at display time. A forged ALERT may get relayed, but it is never shown.

Authority routers run this same firmware in a router role: they always rebroadcast permitted packets, have no screen UI and accept no questions locally.

### 5.4 Alerts on the screen

An ALERT carries the same text in up to three languages (section 6.2). The unit:

1. reassembles all parts, verifies the signature (section 7.2) and checks expiry and the epoch,
2. shows the text in the **unit's display language**; if that language was not sent, it shows the original with the note "original {LANG}, no translation was sent" in the display language (as in the website demo),
3. triggers the alert notification: E-Ink full refresh, LED, External Notification vibra pattern "long", Serial output to the haptic band,
4. keeps the alert on screen until a newer alert or a CANCEL replaces it; E-Ink keeps the image with no power.

The **crisis centre** chooses the translation mode, never the unit: original only, the languages its recipients use, or all languages. Units never translate: they have no internet in a blackout.

### 5.5 Asking the authority (QUESTION) and the FAQ

- The user writes a question with the Braille keyboard, the buttons (predefined categories plus short text) or the paired phone.
- Limits: at most 200 UTF-8 bytes of text; at most 1 question per unit per 10 minutes and 10 per day (proposed; configurable by the authority).
- The unit encrypts the question to the authority (section 7.3), sends it addressed to the authority node ID, keeps it in a local queue and shows "sent" or "waiting".
- The authority answers by publishing an **FAQ** entry to everyone: the question (anonymised and edited by the authority) and the official answer in CS / PL / EN. The unit stores the last 50 FAQ entries in flash and lets the user browse them in the display language.
- If an FAQ entry answers this unit's own question (`answers_question_id` matches its queue), the unit marks the question "answered" and notifies the user.

This mirrors the website's read-only Q&A channel: people ask only the authority, answers are public and translated, and there is no thread between users.

### 5.6 Display language and accessibility settings

The user may change, and only these: display language (`cs`, `pl`, `en`; default from provisioning by country), font size, haptic and Braille add-on settings, and Braille table (6- or 8-dot, Grade 1 EN / CS / PL). The language list must be extensible without a protocol change.

### 5.7 Power

Target: at least 6 days without sun on one 18650 cell with a 2–6 W panel (the website's Solar page has the planning model). The radio must stay in receive mode to relay; save power on screen refreshes, the CPU and BLE instead.

### 5.8 Accessibility add-ons (state-supplied adapted units)

Defined in `hardware/addons/README.md`; the firmware must support:

| Add-on | Interface on the unit | Firmware duty |
|---|---|---|
| Braille keyboard | I²C, CardKB-compatible, address `0x5F` (DIY: SDA 17, SCL 18) | text input for questions; echo each character as a haptic pulse |
| Haptic band Pro | Serial module `TEXTMSG` (DIY: TX 15, RX 16) | send alerts and FAQ text; receive typed questions |
| Simple vibration motor | GPIO 21, External Notification (vibra) | patterns: short-short = message, long = alert, repeating = SOS |
| Listening hub / sign-language screen (Jetson) | via the band or serial | forward the alert's `template_code` so the sign-language screen can play the right pre-recorded clip |

## 6. Protocol (shared with the authority firmware)

Carried as Meshtastic data packets on the private-application port number (`PRIVATE_APP` / 256, or a Holdline-specific number above 256; decide and document). Payload limit per packet: upstream `DATA_PAYLOAD_LEN`, about 233 bytes; confirm. All multi-byte integers little-endian. Define the schema as a protobuf in `firmware/protocol/holdline.proto` and generate code for both firmwares from it.

### 6.1 Common header (every Holdline packet)

| Field | Size | Notes |
|---|---|---|
| `version` | 1 B | 1 |
| `type` | 1 B | ALERT, FAQ, QUESTION, CANCEL, KEYS |
| `msg_id` | 4 B | unique per sender; reassembly and dedup key |
| `part` / `parts` | 1 B + 1 B | 0-based part index and total, max 8 parts |
| `key_id` | 2 B | which authority key signed it (section 7.2) |
| `epoch` | 4 B | authority key epoch / replay protection |

### 6.2 ALERT body (after reassembly)

`severity` (info / warning / danger), `issued_at`, `expires_at`, `template_code` (2 B, for sign-language clips; 0 = none), `original_lang`, then 1 to 3 entries `{lang (2 B), text (UTF-8)}`, then `signature`. The website demo's real sizes: PL alone 89 B, PL+CS 182 B (1 packet), all three 275 B (2 packets), before header and signature.

### 6.3 FAQ body

`faq_id`, `answers_question_id` (0 if none), `published_at`, `entries[{lang, question, answer}]`, `signature`. Usually multi-part.

### 6.4 QUESTION body

`question_id` (unit-local counter), `unit_id`, `lang`, `category`, `ciphertext` (section 7.3), `tag`. Addressed (Meshtastic `to`) to an authority node ID. Single packet only.

### 6.5 CANCEL and KEYS

CANCEL: `cancels_msg_id`, `signature`. KEYS: authority key bulletin (section 7.2), multi-part, signed by the root.

## 7. Cryptography

### 7.1 Firmware authenticity (post-quantum)

- Every public release is a manifest (`tools/sign.mjs` format: name, version, board, upstream commit, build time, files with SHA-256) signed with **both ML-DSA-65 and Ed25519**. A release is valid only if **both** signatures verify against the publisher keys pinned in the currently installed firmware.
- The unit accepts an update (USB serial; BLE OTA optional) only after verifying the manifest and the image hash. Anti-rollback: refuse a version lower than the one stored in a monotonic counter (eFuse or protected NVS).
- Use ESP32-S3 **Secure Boot V2** and flash encryption on production units. Secure Boot is not post-quantum; it protects the boot chain, and the PQ signature protects the update path. Document this clearly.
- **Reproducible builds**: a pinned toolchain (PlatformIO platform and package versions, Docker image digest) so that anyone can rebuild a tagged release and get the same SHA-256 as the signed manifest. CI publishes the hash for every tag.
- The website verifier (`site/app.js` → `runVerify`) and the unit must agree byte for byte on what is signed: the exact `manifest.json` bytes.

### 7.2 Alert authenticity over LoRa

ML-DSA-65 signatures are 3,309 bytes and public keys 1,952 bytes, about 15 LoRa packets per signature, which is too much airtime for every alert in EU868 duty-cycle limits. Use a two-level scheme:

1. **Root key** (authority, offline, ML-DSA-65 + Ed25519 hybrid): its public halves are pinned in the public firmware at build time. The root key never signs alerts.
2. **Operational alert keys** (Ed25519, 32 B public, 64 B signature), one per crisis centre, rotated per epoch. The authority publishes them in a **KEYS bulletin**: a list of `{key_id, epoch, valid_from, valid_to, ed25519_pub, scope}` signed by the root with both algorithms. The bulletin is distributed rarely (with firmware, at provisioning, and as a multi-part LoRa broadcast during quiet periods) and stored in flash.
3. Each ALERT, FAQ and CANCEL is signed once over the reassembled message with an operational key (64 B, in the last part). The unit accepts it only if `key_id` is in a root-verified bulletin, the epoch is current and the time window is valid.

A future quantum attacker would have to forge an Ed25519 signature live, within one epoch, and the root (which can revoke and rotate) stays post-quantum. Keep an `alg` byte reserved in KEYS so that a compact PQ signature can replace Ed25519 later without a protocol version bump.

### 7.3 Confidentiality and per-unit keys

- Alerts and FAQ are public information: confidentiality is not required, authenticity is. The Meshtastic channel PSK (AES-256) still applies so that casual listeners don't see the traffic.
- **Questions contain personal data** and must stay confidential, including against "store now, decrypt later". At provisioning, each unit and the authority agree on a per-unit symmetric key with a **hybrid KEM (ML-KEM-768 + X25519)** over the wired provisioning link, not over LoRa. QUESTION payloads are then encrypted with AES-256-GCM under that key (unique nonce from `unit_id` + `question_id`, truncated 12 B tag) and fit in one packet.
- The provisioning station is part of the authority system. The public firmware only implements the unit side: generate the keypair, export the public keys, accept the provisioning bundle signed by the root.

## 8. Testing and deliverables

- Unit tests for the protocol codec (encode, split, reassemble, oversize rejection), signature and bulletin verification, relay policy and rate limits, using **published test vectors** in `firmware/protocol/test-vectors/` (generated with throwaway keys, never production keys).
- A host-side simulator, or the existing `site/demo.js` topology, to test managed flooding with the relay policy: alert reach with 1 or 2 routers off, question delivery from the farthest node.
- Hardware-in-the-loop on at least the reference board and the DIY board.
- Deliverables: `firmware/household/` overlay and module, `firmware/protocol/holdline.proto` plus test vectors, a CI workflow (build all target boards, publish hashes), signing integration with `tools/sign.mjs`, and an updated `firmware/README.md` with build, flash and verify steps.
