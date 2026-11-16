// SPDX-License-Identifier: GPL-3.0-only
#include "hl_kem.h"
#include "hl_sha256.h"

namespace hl
{
bool kemBegin(KemState &st, const uint8_t *seed)
{
    uint8_t rnd[96];
    if (seed)
        memcpy(rnd, seed, sizeof(rnd));
    else
        randomBytes(rnd, sizeof(rnd));
    bool ok = mlkem768Keypair(rnd, st.mlkem_pub, st.mlkem_sec);
    memcpy(st.x_sec, rnd + 64, 32);
    x25519Public(st.x_sec, st.x_pub);
    wipe(rnd, sizeof(rnd));
    st.active = ok;
    return ok;
}

bool kemFinish(KemState &st, const uint8_t mlkem_ct[kMlkemCtLen], const uint8_t station_x_pub[32], uint32_t unit_id,
               uint8_t unit_key[32], uint8_t confirm[kKeyConfirmLen])
{
    if (!st.active)
        return false;
    uint8_t ikm[64];
    bool ok = mlkem768Decaps(mlkem_ct, st.mlkem_sec, ikm) && x25519Shared(st.x_sec, station_x_pub, ikm + 32);
    if (ok) {
        // salt binds the key to the whole transcript; info binds it to the unit.
        uint8_t salt[32];
        Sha256 s;
        s.update((const uint8_t *)"HLv1 unit-key", 13);
        s.update(st.mlkem_pub, kMlkemPubLen);
        s.update(st.x_pub, 32);
        s.update(mlkem_ct, kMlkemCtLen);
        s.update(station_x_pub, 32);
        s.finish(salt);
        uint8_t info[24];
        memcpy(info, "holdline unit key v1", 20);
        wr32(info + 20, unit_id);
        hkdfSha256(Bytes(ikm, 64), Bytes(salt, 32), Bytes(info, 24), unit_key, 32);
        uint8_t mac[32];
        HmacSha256 h(unit_key, 32);
        h.update((const uint8_t *)"HLv1-kc", 7);
        h.update(salt, 32);
        h.finish(mac);
        memcpy(confirm, mac, kKeyConfirmLen);
    }
    wipe(ikm, sizeof(ikm));
    wipe(st.mlkem_sec, sizeof(st.mlkem_sec));
    wipe(st.x_sec, sizeof(st.x_sec));
    st.active = false;
    return ok;
}
} // namespace hl
