# Decisions taken while implementing the public firmware

[`SPEC.md`](SPEC.md) section 9 lists open decisions. The project owner chose "use the proposed values"; this file records what was built, plus the decisions that only came up during implementation. Each one is a constant in one place and can be changed.

## From SPEC section 9

| # | Decision | Value | Where |
|---|---|---|---|
| 1 | Port number | 300, a dedicated number in the private range (256 is `PRIVATE_APP`, 257 is taken by ATAK) | `kPortNum`, `hl_base.h` |
| 2 | Relay limit for questions | 6 per hour per source node | `kRelayQuestionsPerSourcePerHour` |
| 2 | Question limits | 1 per 10 minutes, 10 per 24 hours; the bundle can override | `kQuestionMinIntervalS`, `kQuestionMaxPerDay` |
| 3 | Router build | none: one image per board, the role comes from the bundle | `Bundle.role` |
| 4 | BLE OTA | not implemented; signed update over the local link (USB or paired phone) only | `hl_local.h` |
| 5 | Epoch length | set by the authority per key (`valid_from`, `valid_to`); the firmware imposes none | KEYS bulletin |
| 6 | GPL review of the private fork | not a firmware matter; see the authority hand-off | |

## New decisions

**Wire format.** A fixed 14-byte binary header, protobuf bodies, QUESTION fully binary. The header is binary so that a relay classifies a packet from its first bytes; the question is binary because 200 bytes of text, a 12-byte tag and a protobuf envelope do not fit in 219 bytes.

**KEYS uses up to 24 parts.** SPEC 6.1 says at most 8, but a hybrid root signature alone is 3,373 bytes.

**Question reference instead of a question id in the FAQ.** A plain `answers_question_id` would make every unit with the same counter value believe it was answered, and adding the `unit_id` would publish who asked. The 32-bit HMAC reference avoids both.

**Rebroadcast cancellation: two duplicates, not one.** Found by the flooding simulator (`core/test/test_sim.cpp`) on the website demo's topology. In stock Meshtastic a router always transmits before a household, and a household that hears one rebroadcast cancels its own. With the Těšín roof router off and the Góra Zamkowa router on, the router's rebroadcast silences the unit at nám. ČSA, which is the only bridge to five nodes west of it; they never get the alert. (The website demo does not show this because it models a 700 ms airtime before the duplicate is heard.) Cancelling only after two duplicates gives full reach in all three scenarios, at 24 instead of 16 transmissions for a two-part alert in the normal case. This is a simulation result: **confirm it in the field test** and revert with `kCancelAfterDupes = 1` if airtime matters more.

**Extra rate limit on authority packets.** SPEC 5.3 limits relayed questions only. Because forged alerts are relayed unverified, a unit also relays at most 40 authority packets in a burst and 120 per hour.

**Forged-part tolerance.** Two alternative chunks per part, at most 16 verification attempts per completed message.

**Time.** Described in the protocol README, section 3. Consequence: a unit without any clock can show an alert that expired recently.

**Stored alerts.** Up to 4, re-verified at every boot; an alert stays on screen after expiry, marked as no longer valid, until a newer alert or a CANCEL replaces it (SPEC 5.4).

**Unprovisioned units do not transmit** (`tx_enabled` is off until a bundle is installed).

**Remote administration reaches one hop.** Admin packets are PKI-encrypted, so relays cannot classify them and drop them, as SPEC 5.3 requires. The authority administers units in direct range of a crisis-centre radio or through a wired link.

**Display.** The screens are InkHUD applets, because only InkHUD's Windows-1250 fonts show Czech and Polish at the same time. One button: short press = next screen, long press = that screen's action (text size, next FAQ entry, ask / language).

**Predefined questions.** Five categories with a fixed sentence each (medical help, water and food, power and heating, evacuation and shelter, other). Free text comes from the Braille keyboard, the haptic band or the phone.

**Phone.** A text the paired phone sends to a crisis-centre node becomes a question; any other text is dropped. The phone receives alerts as client notifications.

**Updates.** Versions are `major.minor.patch`; a suffix (`-rc1`) marks a pre-release, which only development builds install. Reinstalling the same version is refused. The version floor is kept in NVS.

## Not done, and why

- **Hardware tests.** Nothing here has run on a board. The core is tested on a host; the Meshtastic module is compiled in CI only.
- **Secure Boot V2 and flash encryption.** Burning eFuses is irreversible and is listed as the authority's decision. See [`README.md`](README.md), "Production units".
- **Reproducible builds across machines.** The inputs are pinned (upstream commit, dependency commits, `SOURCE_DATE_EPOCH`) and CI publishes the hash of every image. That two machines produce the same hash has not been demonstrated yet, and the PlatformIO core version is not pinned.
- **Real root keys.** `household/keys/roots.json` does not exist; builds pin the throwaway root and say so at boot.
- **KEYS re-broadcast schedule** is the authority's choice; the unit accepts a bulletin whenever it arrives.
