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
# Needs: git, node >= 20, python3, PlatformIO (pip install platformio).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
board="${1:?usage: build.sh <board> [build-dir]}"
build="${2:-$repo/build/firmware}"
export HOLDLINE_VERSION="${HOLDLINE_VERSION:-0.0.0-dev}"
# Reproducible builds: the embedded build time is the time of the Holdline commit.
export SOURCE_DATE_EPOCH="${SOURCE_DATE_EPOCH:-$(git -C "$repo" log -1 --format=%ct)}"

if [ -f "$here/keys/roots.json" ]; then
  "$here/apply-overlay.sh" "$build"
else
  echo "keys/roots.json not found: building with DEVELOPMENT keys" >&2
  "$here/apply-overlay.sh" "$build" --dev-keys
fi

(cd "$build" && pio run -e "holdline-$board")

out="$repo/build/out/$board"
mkdir -p "$out"
cp "$build/.pio/build/holdline-$board/firmware.bin" "$out/firmware.bin"
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
INFO
cat "$out/build-info.txt"
