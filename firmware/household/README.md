# household/

The Holdline overlay for upstream `meshtastic/firmware`.

| Path | Contents |
|---|---|
| `UPSTREAM` | Pinned commits: Meshtastic, its Crypto library, mldsa-native, mlkem-native |
| `apply-overlay.sh` | Builds the source tree: upstream checkout + patches + module + keys |
| `build.sh` | `apply-overlay.sh`, then `pio run`, then the image hash |
| `fetch-deps.sh` | The crypto dependencies for the host tests |
| `core/` | Unit engine and host tests (`core/test/`) |
| `module/Holdline/` | Copied to `src/modules/optional/Holdline/`; upstream's optional-module mechanism registers it |
| `patches/0001-holdline-hooks.patch` | The hooks, all inside `#ifdef HOLDLINE` |
| `patch-applets.py` | Replaces each E-Ink board's applet list with the three Holdline screens |
| `platformio/holdline.ini` | Build environments `holdline-<board>` |
| `gen-pinned-keys.mjs`, `keys/` | The public keys compiled into the firmware |

## The five hooks

| Upstream function | Hook | Purpose |
|---|---|---|
| `NextHopRouter::perhapsRebroadcast` | `holdlineRelayAllowed` | Relay policy (SPEC 5.3) |
| `FloodingRouter::perhapsCancelDupe` | `holdlineMayCancelDupe` | Cancel a rebroadcast after two duplicates |
| `Router::send` | `holdlineSendAllowed` | Nothing a user could originate leaves the node, except a question (SPEC 5.2) |
| `wouldEncryptWithPKC` | `holdlineIsOwnPort` | Holdline packets stay readable for relays |
| `MeshModule::callModules` | `holdlineDeliverAllowed` | Foreign traffic reaches neither the modules nor the phone |

A sixth change lets `bin/platformio-custom.py` take the build time from `SOURCE_DATE_EPOCH`.

## Moving to a new upstream release

1. Change the pins in `UPSTREAM`.
2. Run `apply-overlay.sh`. If the patch no longer applies, redo the hunks by hand in a checkout and regenerate the patch with `git diff`.
3. Re-check every upstream name the module uses (`module/Holdline/*.cpp`); the files say which tag they were written against.
4. Run the host tests and the CI build of all boards before tagging.
