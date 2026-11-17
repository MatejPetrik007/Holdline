#!/usr/bin/env bash
# Build one board of the Holdline public firmware and print the SHA-256 of the image.
# SPDX-License-Identifier: GPL-3.0-only
#
#   firmware/household/build.sh <board> [build-dir]
#
#   <board>      heltec-wireless-paper | heltec-vision-master-e213 | heltec-vision-master-e290 |
#                lilygo-t5-s3-epaper | diy-s3-eink
#   HOLDLINE_VERSION   version string compiled in (default 0.0.0-dev)
#
# Real root keys are pinned when firmware/household/keys/roots.json exists; otherwise the
# build pins the throwaway development root and is not deployable.
# Needs: git, node >= 20, python3 and the pinned build tools:
#   PIP_CONSTRAINT=firmware/household/constraints-build.txt pip install -r firmware/household/requirements-build.txt
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
board="${1:?usage: build.sh <board> [build-dir]}"
build="${2:-$repo/build/firmware}"
export HOLDLINE_VERSION="${HOLDLINE_VERSION:-0.0.0-dev}"
# Reproducible builds: the embedded build time is the time of the Holdline commit.
export SOURCE_DATE_EPOCH="${SOURCE_DATE_EPOCH:-$(git -C "$repo" log -1 --format=%ct)}"
# Keep the Python environment pioarduino creates for itself on the pinned core version.
export PIP_CONSTRAINT="${PIP_CONSTRAINT:-$here/constraints-build.txt}"
export UV_CONSTRAINT="${UV_CONSTRAINT:-$here/constraints-build.txt}"
export PLATFORMIO_SETTING_ENABLE_TELEMETRY=0

if [ -f "$here/keys/roots.json" ]; then
  "$here/apply-overlay.sh" "$build"
else
  echo "keys/roots.json not found: building with DEVELOPMENT keys" >&2
  "$here/apply-overlay.sh" "$build" --dev-keys
fi

(cd "$build" && pio run -e "holdline-$board")

out="$repo/build/out/$board"
mkdir -p "$out"
# Upstream names the images firmware-<env>-<upstream version>.bin (application, what a signed
# update carries) and ...factory.bin (bootloader + partitions + application, for a first flash).
bdir="$build/.pio/build/holdline-$board"
app="$(ls "$bdir"/firmware-holdline-"$board"-*.bin | grep -v '\.factory\.bin$' | head -1)"
cp "$app" "$out/firmware.bin"
cp "${app%.bin}.factory.bin" "$out/firmware.factory.bin"
# shellcheck disable=SC1091
source "$here/UPSTREAM"
sha="$(sha256sum "$out/firmware.bin" | cut -d' ' -f1)"
cat > "$out/build-info.txt" <<INFO
board=$board
version=$HOLDLINE_VERSION
holdline_commit=$(git -C "$repo" rev-parse HEAD)
upstream=$MESHTASTIC_TAG ($MESHTASTIC_COMMIT)
source_date_epoch=$SOURCE_DATE_EPOCH
platformio=$(pio --version)
size=$(stat -c %s "$out/firmware.bin")
sha256=$sha
factory_sha256=$(sha256sum "$out/firmware.factory.bin" | cut -d' ' -f1)
INFO
cat "$out/build-info.txt"
