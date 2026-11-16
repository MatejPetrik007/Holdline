// Crypto backend of the Holdline core.
// SPDX-License-Identifier: GPL-3.0-only
//
//   Ed25519, X25519, AES-256-GCM: the Crypto library that upstream Meshtastic links
//                                 (github.com/meshtastic/Crypto, a fork of rweather/arduinolibs)
//   ML-DSA-65 verification:       mldsa-native (FIPS 204), backend/hl_mldsa.c
//   ML-KEM-768:                   mlkem-native (FIPS 203), backend/hl_mlkem.c
//
// Pinned versions: firmware/household/UPSTREAM. randomBytes() is provided by the platform.
#include "../hl_crypto.h"

#include <AES.h>
#include <Curve25519.h>
#include <Ed25519.h>
#include <GCM.h>

extern "C" {
int hl_mldsa_verify(const uint8_t *sig, const uint8_t *m, size_t mlen, const uint8_t *ctx, size_t ctxlen, const uint8_t *pk);
int hl_mlkem_keypair_derand(uint8_t *pk, uint8_t *sk, const uint8_t *coins);
int hl_mlkem_dec(uint8_t *ss, const uint8_t *ct, const uint8_t *sk);
}

namespace hl
{
bool ed25519Verify(const uint8_t sig[kEdSigLen], const uint8_t pub[kEdPubLen], Bytes msg)
{
    return Ed25519::verify(sig, pub, msg.data, msg.size);
}

bool mldsa65Verify(const uint8_t *sig, size_t sig_len, const uint8_t pub[kMldsaPubLen], Bytes msg)
{
    if (sig_len != kMldsaSigLen)
        return false;
    return hl_mldsa_verify(sig, msg.data, msg.size, nullptr, 0, pub) == 0;
}

static bool gcmSetup(GCM<AES256> &gcm, const uint8_t key[32], const uint8_t nonce[12], Bytes aad)
{
    if (!gcm.setKey(key, 32) || !gcm.setIV(nonce, 12))
        return false;
    if (aad.size)
        gcm.addAuthData(aad.data, aad.size);
    return true;
}

bool aes256GcmSeal(const uint8_t key[32], const uint8_t nonce[12], Bytes aad, Bytes in, uint8_t *out, uint8_t tag[kGcmTagLen])
{
    GCM<AES256> gcm;
    if (!gcmSetup(gcm, key, nonce, aad))
        return false;
    gcm.encrypt(out, in.data, in.size);
    gcm.computeTag(tag, kGcmTagLen);
    gcm.clear();
    return true;
}

bool aes256GcmOpen(const uint8_t key[32], const uint8_t nonce[12], Bytes aad, Bytes in, const uint8_t tag[kGcmTagLen], uint8_t *out)
{
    GCM<AES256> gcm;
    if (!gcmSetup(gcm, key, nonce, aad))
        return false;
    gcm.decrypt(out, in.data, in.size);
    bool ok = gcm.checkTag(tag, kGcmTagLen);
    gcm.clear();
    if (!ok)
        wipe(out, in.size);
    return ok;
}

static void clamp(const uint8_t in[32], uint8_t out[32])
{
    memcpy(out, in, 32);
    out[0] &= 248;
    out[31] &= 127;
    out[31] |= 64;
}

void x25519Public(const uint8_t secret[32], uint8_t pub[32])
{
    uint8_t s[32];
    clamp(secret, s);
    Curve25519::eval(pub, s, nullptr);
    wipe(s, sizeof(s));
}

bool x25519Shared(const uint8_t secret[32], const uint8_t peer[32], uint8_t out[32])
{
    uint8_t s[32];
    clamp(secret, s);
    Curve25519::eval(out, s, peer);
    wipe(s, sizeof(s));
    uint8_t acc = 0;
    for (int i = 0; i < 32; i++)
        acc |= out[i];
    return acc != 0; // all-zero output: the peer sent a small-order point
}

bool mlkem768Keypair(const uint8_t coins[64], uint8_t pub[kMlkemPubLen], uint8_t sec[kMlkemSecLen])
{
    return hl_mlkem_keypair_derand(pub, sec, coins) == 0;
}

bool mlkem768Decaps(const uint8_t ct[kMlkemCtLen], const uint8_t sec[kMlkemSecLen], uint8_t ss[32])
{
    return hl_mlkem_dec(ss, ct, sec) == 0;
}
} // namespace hl
