#!/usr/bin/env bash
# Build tree of the Holdline public firmware = pinned upstream Meshtastic + this overlay.
# SPDX-License-Identifier: GPL-3.0-only
#
#   firmware/household/apply-overlay.sh <build-dir> [--dev-keys]
#
#   <build-dir>   created if missing; an existing upstream checkout there is reset first
#   --dev-keys    pin the published THROWAWAY root (test vectors) instead of the real root
#                 keys in firmware/household/keys/roots.json. Such a build says so on
#                 every boot and must never be deployed.
#
# Then:  cd <build-dir> && pio run -e holdline-heltec-wireless-paper
# What this does, in order:
#   1. checks out meshtastic/firmware at the pinned commit (UPSTREAM)
#   2. applies patches/*.patch (the five hooks, about 40 lines)
#   3. copies the module, the core and the board files into the tree
#   4. fetches mldsa-native / mlkem-native at their pinned commits into third_party/
#   5. generates the pinned-key source from the root and publisher public keys
#   6. replaces the stock applet list of each E-Ink board with the Holdline screens
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
# shellcheck disable=SC1091
source "$here/UPSTREAM"
build="${1:?usage: apply-overlay.sh <build-dir> [--dev-keys]}"
keys_mode="${2:-}"

if [ ! -d "$build/.git" ]; then
  git init -q "$build"
  git -C "$build" remote add origin "$MESHTASTIC_REPO"
fi
if [ "$(git -C "$build" rev-parse HEAD 2>/dev/null || true)" != "$MESHTASTIC_COMMIT" ]; then
  git -C "$build" fetch -q --depth 1 origin "$MESHTASTIC_COMMIT" || git -C "$build" fetch -q --depth 1 origin "refs/tags/$MESHTASTIC_TAG"
  git -C "$build" checkout -q -f FETCH_HEAD
fi
[ "$(git -C "$build" rev-parse HEAD)" = "$MESHTASTIC_COMMIT" ] || { echo "upstream commit mismatch" >&2; exit 1; }
git -C "$build" checkout -q -f . && git -C "$build" clean -q -fd -e .pio
# The generated protobuf sources are committed upstream; the protobufs submodule is not needed.

for p in "$here"/patches/*.patch; do
  git -C "$build" apply --whitespace=nowarn "$p"
  echo "applied $(basename "$p")"
done

mod="$build/src/modules/optional/Holdline"
mkdir -p "$mod/core/backend"
cp "$here"/module/Holdline/* "$mod/"
cp "$here"/core/hl_*.h "$here"/core/hl_*.cpp "$mod/core/"
cp "$here"/core/backend/* "$mod/core/backend/"
mkdir -p "$build/variants/esp32s3/holdline"
cp "$here"/platformio/holdline.ini "$build/variants/esp32s3/holdline/platformio.ini"
cp -r "$here"/variants/diy_s3_eink "$build/variants/esp32s3/holdline_diy_s3_eink"

"$here/fetch-deps.sh" "$build/third_party" >/dev/null
rm -rf "$build/third_party/Crypto" # the firmware takes Crypto from upstream's lib_deps

if [ "$keys_mode" = "--dev-keys" ]; then
  node "$here/gen-pinned-keys.mjs" --dev --out "$mod"
else
  node "$here/gen-pinned-keys.mjs" --roots "$here/keys/roots.json" --out "$mod"
fi

python3 "$here/patch-applets.py" "$build"
echo "overlay applied to $build (upstream $MESHTASTIC_TAG)"
