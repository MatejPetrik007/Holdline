// Signed firmware releases (SPEC 7.1): the unit accepts exactly what the website's
// verifier accepts: the manifest bytes signed with ML-DSA-65 AND Ed25519 by the publisher
// keys (tools/sign.mjs), plus the SHA-256 of the image, the board and anti-rollback.
// SPDX-License-Identifier: GPL-3.0-only
#pragma once
#include "hl_base.h"

namespace hl
{
struct PublisherKeys {
    const uint8_t *ed25519; // 32 bytes
    const uint8_t *mldsa65; // 1952 bytes
};

struct Version {
    uint16_t major = 0, minor = 0, patch = 0;
    bool prerelease = false; // "1.2.3-anything"
};
bool parseVersion(const char *s, size_t n, Version &v);
// <0, 0, >0. A pre-release sorts before the release with the same numbers.
int compareVersion(const Version &a, const Version &b);
uint32_t packVersion(const Version &v);   // for a monotonic counter; 0xffffffff if out of range
Version unpackVersion(uint32_t packed);

struct ReleaseInfo {
    Version version;
    char board[48] = {0};
    char file[32] = {0};
    uint32_t size = 0;
    uint8_t sha256[32] = {0};
};

// 1. Verify both signatures over the exact manifest bytes (manifest.sig is the JSON
//    {"ML-DSA-65": hex, "Ed25519": hex}). 2. Only then parse the manifest.
Result verifyManifest(Bytes manifest_json, Bytes sig_json, const PublisherKeys &keys, ReleaseInfo &out);

// Policy for installing a verified release on this unit.
//   board:            must equal the manifest's board
//   installed_floor:  highest version ever installed (anti-rollback counter); equal is refused too
//   allow_prerelease: only development builds accept "-suffix" versions
Result checkInstallable(const ReleaseInfo &rel, const char *board, const Version &installed_floor, bool allow_prerelease);

// Minimal JSON access used above; exposed for tests. Finds `key` in the top level of the
// object `obj` and returns its raw value (string contents without quotes, or the token).
bool jsonGet(Bytes obj, const char *key, Bytes &value, char *type = nullptr);
} // namespace hl
