// Unit side of the provisioning key agreement (SPEC 7.3): hybrid ML-KEM-768 + X25519
// over the wired link. The result is the per-unit AES-256 key that encrypts questions.
// SPDX-License-Identifier: GPL-3.0-only
#pragma once
#include "hl_crypto.h"

namespace hl
{
constexpr size_t kKeyConfirmLen = 16;

struct KemState {
    uint8_t mlkem_pub[kMlkemPubLen];
    uint8_t mlkem_sec[kMlkemSecLen];
    uint8_t x_pub[32];
    uint8_t x_sec[32];
    bool active = false;
    ~KemState() { wipe(mlkem_sec, sizeof(mlkem_sec)); wipe(x_sec, sizeof(x_sec)); }
};

// Generate fresh key pairs. `seed` is 96 random bytes (64 ML-KEM coins, 32 X25519 secret);
// pass nullptr to draw them from randomBytes().
bool kemBegin(KemState &st, const uint8_t *seed = nullptr);
// Decapsulate the station's reply and derive the unit key and the key-confirmation tag.
// Wipes the ephemeral secrets whatever the outcome.
bool kemFinish(KemState &st, const uint8_t mlkem_ct[kMlkemCtLen], const uint8_t station_x_pub[32], uint32_t unit_id,
               uint8_t unit_key[32], uint8_t confirm[kKeyConfirmLen]);
} // namespace hl
