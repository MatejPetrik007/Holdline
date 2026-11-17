# Holdline firmware (public)

The firmware for Holdline **household units** and the authority's **relay routers**. It is open source (GPL-3.0, like upstream [Meshtastic](https://github.com/meshtastic/firmware)) so that anyone can read it, rebuild it and check that the binary on their unit is the one that was published.

**Status: implemented, not yet run on hardware.** The unit engine is tested on a host against published test vectors. The Meshtastic module is built in CI for five boards. No board has been flashed with it, no root key ceremony has taken place, and builds pin a throwaway development root. Read [`DECISIONS.md`](DECISIONS.md) for what is still open.

## What a household unit does

- Receives authority alerts and shows them on the E-Ink screen in the unit's language: Czech, Polish or English.
- Relays authority packets to its neighbours, so the alert spreads through the whole town with no cell network.
- Lets the owner **ask the authority** a question. It does not let anyone message anyone else.
- Shows the authority's answers as a trilingual FAQ.
- Drives the accessibility add-ons: Braille keyboard, haptic band Pro, listening hub and sign-language screen.
- Installs only updates signed with the publisher's post-quantum (ML-DSA-65) and Ed25519 keys.

## What is not here

The crisis-centre firmware, the alert signing keys and the provisioning system are **not** in this repository. They are distributed through the authority's internal system to cleared staff only. The public firmware is designed so that publishing all of its code gives an attacker no way to forge an alert ([`SPEC.md`](SPEC.md), section 7): a unit holds public keys and its own per-unit key, nothing else.

## Layout

| Path | Contents |
|---|---|
| [`SPEC.md`](SPEC.md) | Build specification: behaviour, protocol, cryptography, tests |
| [`DECISIONS.md`](DECISIONS.md) | What was decided while implementing it, and what is not done |
| [`protocol/`](protocol/) | `holdline.proto`, the wire format and public test vectors |
| [`household/core/`](household/core/) | The unit engine: portable C++17, no Arduino. All decisions are made here |
| [`household/module/`](household/module/) | The Meshtastic module: a thin adapter around the engine |
| [`household/patches/`](household/patches/) | Five hooks into upstream Meshtastic, about 40 lines |
| [`household/variants/`](household/variants/) | The DIY board for the E-Ink UI |
| [`../tools/hl/`](../tools/hl/) | Reference codec in JavaScript; generates the test vectors |
| [`../tools/sign.mjs`](../tools/sign.mjs) | Release signing (ML-DSA-65 + Ed25519) |

## Test without hardware

Needs git, CMake, a C++17 compiler and Node.js 20 or newer.

```bash
npm ci
```

```bash
firmware/household/fetch-deps.sh build/deps
```

```bash
cmake -S firmware/household/core -B build/core -DHL_DEPS="$PWD/build/deps"
```

```bash
cmake --build build/core -j
```

```bash
ctest --test-dir build/core --output-on-failure
```

This runs about 640 checks against the test vectors (codec, signatures, bulletins and revocation, forged parts, relay policy and rate limits, questions, key agreement, the provisioning protocol of the local link, the signed demo release from `site/releases/`) and the flooding simulator on the website demo's topology. `build/core/hl_unit_sim` is a unit on stdin/stdout for testing other tooling; its commands are at the top of [`household/core/test/hl_unit_sim.cpp`](household/core/test/hl_unit_sim.cpp).

## Build the firmware

Needs the above plus Python 3 and the pinned build tools:

```bash
PIP_CONSTRAINT=firmware/household/constraints-build.txt pip install -r firmware/household/requirements-build.txt
```

```bash
firmware/household/build.sh heltec-wireless-paper
```

Boards: `heltec-wireless-paper` (reference), `heltec-vision-master-e213`, `heltec-vision-master-e290`, `lilygo-t5-s3-epaper`, `diy-s3-eink`. The script checks out upstream Meshtastic at the commit pinned in [`household/UPSTREAM`](household/UPSTREAM), applies the overlay, builds, and prints the SHA-256 of `build/out/<board>/firmware.bin` (the image a release signs). CI does the same for every push and shows the hashes in the run summary.

Without `household/keys/roots.json` the build pins the **throwaway development root** from the test vectors. Such a unit logs `DEVELOPMENT KEYS - NOT FOR DEPLOYMENT` at boot and must not be handed out: anyone can sign alerts for it. See [`household/keys/README.md`](household/keys/README.md).

## Flash

`build/out/<board>/firmware.factory.bin` is the complete image for a unit that is not provisioned yet (bootloader, partition table, application). Write it at offset 0:

```bash
esptool.py --chip esp32s3 write_flash 0x0 build/out/heltec-wireless-paper/firmware.factory.bin
```

`firmware.bin` is the application alone. It is what a release manifest signs and what a provisioned unit takes through the signed update path of the local link ([`protocol/README.md`](protocol/README.md), section 5): the manifest and both signatures are verified, then the board, the version (no rollback, no reinstall) and finally the SHA-256 of the image as written.

## Verify a release

Every release is a signed manifest. Check it in the browser on the website's **Verify** page, or rebuild the tagged source with `build.sh` and compare the SHA-256 with the manifest. The publisher key fingerprints are in the [main README](../README.md#publisher-key-fingerprints). The unit applies the same check as the website: the host tests verify the demo release in `site/releases/` with the unit's code.

## Production units

Before units are handed to households the authority has to:

1. Hold the root key ceremony and add the root **public** keys to `household/keys/roots.json`.
2. Build, compare hashes and sign the release with `tools/sign.mjs` on the offline machine.
3. Enable ESP32-S3 **Secure Boot V2** and **flash encryption** (including NVS encryption, which protects the anti-rollback counter and the per-unit key) and burn the eFuses. This is irreversible and not enabled by this repository. Secure Boot protects the boot chain and is not post-quantum; the ML-DSA-65 signature protects the update path. Units need both.
4. Provision each unit over USB: key agreement, bundle, language, lock.
