// Crypto backend interface of the Holdline core.
// SPDX-License-Identifier: GPL-3.0-only
//
// The core calls only these functions for public-key and AEAD operations. One
// implementation ships: backend/hl_crypto_meshtastic.cpp, built on the Crypto
// library that upstream Meshtastic already links (Ed25519, X25519, AES-GCM) and
// on mldsa-native / mlkem-native (FIPS 204 / FIPS 203). The host tests compile
// that same file, so the unit and the tests run the same code.
#pragma once
#include "hl_base.h"

namespace hl
{
constexpr size_t kMlkemPubLen = 1184;
constexpr size_t kMlkemSecLen = 2400;
constexpr size_t kMlkemCtLen = 1088;

bool ed25519Verify(const uint8_t sig[kEdSigLen], const uint8_t pub[kEdPubLen], Bytes msg);
// ML-DSA-65, FIPS 204 "pure" mode with an empty context string.
bool mldsa65Verify(const uint8_t *sig, size_t sig_len, const uint8_t pub[kMldsaPubLen], Bytes msg);

// AES-256-GCM with a 12-byte nonce and a truncated 12-byte tag. `out` may equal `in`.
bool aes256GcmSeal(const uint8_t key[32], const uint8_t nonce[12], Bytes aad, Bytes in, uint8_t *out, uint8_t tag[kGcmTagLen]);
bool aes256GcmOpen(const uint8_t key[32], const uint8_t nonce[12], Bytes aad, Bytes in, const uint8_t tag[kGcmTagLen], uint8_t *out);

void x25519Public(const uint8_t secret[32], uint8_t pub[32]);
// False when the result is all-zero (small-order peer key).
bool x25519Shared(const uint8_t secret[32], const uint8_t peer[32], uint8_t out[32]);

// ML-KEM-768, FIPS 203. Key generation is deterministic in `coins` (64 random bytes).
bool mlkem768Keypair(const uint8_t coins[64], uint8_t pub[kMlkemPubLen], uint8_t sec[kMlkemSecLen]);
bool mlkem768Decaps(const uint8_t ct[kMlkemCtLen], const uint8_t sec[kMlkemSecLen], uint8_t ss[32]);

// Cryptographically secure random bytes. Provided by the platform, not by the
// crypto backend: the unit uses the ESP32 hardware RNG, the host tests getrandom().
// False when no secure randomness is available; callers must then abort.
bool randomBytes(uint8_t *out, size_t n);
} // namespace hl
