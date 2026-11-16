#!/usr/bin/env bash
# Fetch the pinned crypto dependencies (UPSTREAM) into a directory.
# SPDX-License-Identifier: GPL-3.0-only
#
#   firmware/household/fetch-deps.sh <dir>
#
# Result: <dir>/Crypto, <dir>/mldsa-native, <dir>/mlkem-native, each at the pinned commit.
# The commit hash is verified after checkout, so a moved tag cannot slip in.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$here/UPSTREAM"
dest="${1:?usage: fetch-deps.sh <dir>}"
mkdir -p "$dest"

fetch() { # name repo commit
  local dir="$dest/$1"
  if [ "$(git -C "$dir" rev-parse HEAD 2>/dev/null || true)" != "$3" ]; then
    rm -rf "$dir"
    git init -q "$dir"
    git -C "$dir" remote add origin "$2"
    git -C "$dir" fetch -q --depth 1 origin "$3"
    git -C "$dir" checkout -q FETCH_HEAD
  fi
  [ "$(git -C "$dir" rev-parse HEAD)" = "$3" ] || { echo "$1: commit mismatch" >&2; exit 1; }
  echo "$1 @ $3"
}
fetch Crypto "$CRYPTO_REPO" "$CRYPTO_COMMIT"
fetch mldsa-native "$MLDSA_REPO" "$MLDSA_COMMIT"
fetch mlkem-native "$MLKEM_REPO" "$MLKEM_COMMIT"
