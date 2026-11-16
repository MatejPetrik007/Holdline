# Holdline firmware (public)

The firmware for Holdline **household units** and the authority's **relay routers**. It is open source (GPL-3.0, like upstream [Meshtastic](https://github.com/meshtastic/firmware)) so that anyone can read it, rebuild it and check that the binary on their unit is the one that was published.

**Status: specification stage.** The code has not been written yet. Read [`SPEC.md`](SPEC.md) for the full build brief.

## What a household unit does

- Receives authority alerts and shows them on the E-Ink screen in the unit's language: Czech, Polish or English.
- Relays authority packets to its neighbours, so the alert spreads through the whole town with no cell network.
- Lets the owner **ask the authority** a question. It does not let anyone message anyone else.
- Shows the authority's answers as a trilingual FAQ.
- Drives the accessibility add-ons: Braille keyboard, haptic band Pro, listening hub and sign-language screen.
- Installs only updates signed with the publisher's post-quantum (ML-DSA-65) and Ed25519 keys.

## What is not here

The crisis-centre firmware, the alert signing keys and the provisioning system are **not** in this repository. They are distributed through the authority's internal system to cleared staff only. The public firmware is designed so that publishing all of its code gives an attacker no way to forge an alert (see [`SPEC.md`](SPEC.md), section 7).

## Layout

| Path | Contents |
|---|---|
| [`SPEC.md`](SPEC.md) | Build specification: behaviour, protocol, cryptography, tests |
| [`household/`](household/) | Meshtastic overlay: Holdline module, locked configuration, variant files |
| [`protocol/`](protocol/) | `holdline.proto` (shared with the authority firmware) and public test vectors |
| [`../variants/diy_s3_eink/`](../variants/diy_s3_eink/) | DIY board variant |
| [`../tools/sign.mjs`](../tools/sign.mjs) | Release signing (ML-DSA-65 + Ed25519) |

## Verify a release

Every release is a signed manifest. Check it in the browser on the website's **Verify** page, or rebuild it from the tagged source and compare the SHA-256 with the manifest. The publisher key fingerprints are in the [main README](../README.md#publisher-key-fingerprints).
