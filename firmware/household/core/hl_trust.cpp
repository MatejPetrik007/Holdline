// SPDX-License-Identifier: GPL-3.0-only
#include "hl_trust.h"
#include "hl_crypto.h"
#include <new>

namespace hl
{
static const char kCtxMsg[] = "HLv1-msg";   // 8 bytes, no NUL on the wire
static const char kCtxRoot[] = "HLv1-root"; // 9 bytes

// To-be-signed bytes: context || version || type || msg_id || key_id || epoch || body.
// `part`/`parts` are left out: how a message was split does not change what was signed.
static size_t writeTbs(const char *ctx, size_t ctx_len, const Header &h, Bytes body, uint8_t *out)
{
    memcpy(out, ctx, ctx_len);
    uint8_t *p = out + ctx_len;
    p[0] = h.version;
    p[1] = h.type;
    wr32(p + 2, h.msg_id);
    wr16(p + 6, h.key_id);
    wr32(p + 8, h.epoch);
    memcpy(p + 12, body.data, body.size);
    return ctx_len + 12 + body.size;
}

Result verifyRootSigned(const RootKey &root, const Header &h, Bytes message, Bytes &body)
{
    if (h.type != kKeys && h.type != kBundle)
        return Result::Unsupported;
    if (message.size <= kEdSigLen + kMldsaSigLen)
        return Result::Malformed;
    if (h.key_id != root.root_id)
        return Result::UnknownKey;
    size_t bodyLen = message.size - kEdSigLen - kMldsaSigLen;
    uint8_t *tbs = new (std::nothrow) uint8_t[9 + 12 + bodyLen];
    if (!tbs)
        return Result::Internal;
    size_t n = writeTbs(kCtxRoot, 9, h, Bytes(message.data, bodyLen), tbs);
    // Evaluate both: a release is trusted only if the classical AND the post-quantum signature hold.
    bool okEd = ed25519Verify(message.data + bodyLen, root.ed25519, Bytes(tbs, n));
    bool okPq = mldsa65Verify(message.data + bodyLen + kEdSigLen, kMldsaSigLen, root.mldsa65, Bytes(tbs, n));
    delete[] tbs;
    if (!(okEd && okPq))
        return Result::BadSignature;
    body = Bytes(message.data, bodyLen);
    return Result::Ok;
}

bool verifyOperational(const KeyEntry &key, const Header &h, Bytes message, uint8_t *scratch, size_t scratch_len, Bytes &body)
{
    if (key.alg != 1 || message.size <= kEdSigLen || scratch_len < 20 + message.size - kEdSigLen)
        return false;
    size_t bodyLen = message.size - kEdSigLen;
    size_t n = writeTbs(kCtxMsg, 8, h, Bytes(message.data, bodyLen), scratch);
    if (!ed25519Verify(message.data + bodyLen, key.public_key, Bytes(scratch, n)))
        return false;
    body = Bytes(message.data, bodyLen);
    return true;
}

bool scopeCovers(const KeyEntry &key, const char regions[][kRegionLen], size_t n_regions)
{
    if (key.n_scope == 0)
        return true;
    for (size_t i = 0; i < key.n_scope; i++)
        for (size_t j = 0; j < n_regions; j++)
            if (strcmp(key.scope[i], regions[j]) == 0)
                return true;
    return false;
}

bool TrustStore::addRoot(const RootKey &r)
{
    if (r.root_id == 0 || r.root_id > 0xffff) // must fit the header's key_id field
        return false;
    for (size_t i = 0; i < n_roots_; i++)
        if (roots_[i].root_id == r.root_id)
            return memcmp(roots_[i].ed25519, r.ed25519, kEdPubLen) == 0 && memcmp(roots_[i].mldsa65, r.mldsa65, kMldsaPubLen) == 0;
    if (n_roots_ == kMaxRoots)
        return false;
    roots_[n_roots_] = r;
    bulletins_[n_roots_].serial = 0;
    bulletins_[n_roots_].n_keys = 0;
    n_roots_++;
    return true;
}

const RootKey *TrustStore::root(uint32_t root_id) const
{
    for (size_t i = 0; i < n_roots_; i++)
        if (roots_[i].root_id == root_id)
            return &roots_[i];
    return nullptr;
}

Result TrustStore::installKeys(const Header &h, Bytes message)
{
    if (h.type != kKeys)
        return Result::Unsupported;
    size_t idx = 0;
    for (; idx < n_roots_; idx++)
        if (roots_[idx].root_id == h.key_id)
            break;
    if (idx == n_roots_)
        return Result::UnknownKey;
    // Cheap rejection of old bulletins before the expensive signature check. The header is
    // covered by the signature, so a forged low serial only gets a forged packet dropped.
    if (bulletins_[idx].serial != 0 && h.epoch < bulletins_[idx].serial)
        return Result::Rollback;
    if (bulletins_[idx].serial != 0 && h.epoch == bulletins_[idx].serial)
        return Result::Duplicate;
    Bytes body;
    Result r = verifyRootSigned(roots_[idx], h, message, body);
    if (r != Result::Ok)
        return r;
    Keys *k = new (std::nothrow) Keys();
    if (!k)
        return Result::Internal;
    // The body repeats root_id and serial; they must agree with the signed header.
    bool ok = decodeKeys(body, *k) && k->root_id == h.key_id && k->serial == h.epoch;
    if (ok)
        bulletins_[idx] = *k;
    delete k;
    return ok ? Result::Ok : Result::Malformed;
}

uint32_t TrustStore::serial(uint32_t root_id) const
{
    for (size_t i = 0; i < n_roots_; i++)
        if (roots_[i].root_id == root_id)
            return bulletins_[i].serial;
    return 0;
}

uint32_t TrustStore::newestIssuedAt() const
{
    uint32_t t = 0;
    for (size_t i = 0; i < n_roots_; i++)
        if (bulletins_[i].serial && bulletins_[i].issued_at > t)
            t = bulletins_[i].issued_at;
    return t;
}

size_t TrustStore::findKeys(uint16_t key_id, uint32_t epoch, const KeyEntry *out[], size_t cap) const
{
    size_t n = 0;
    for (size_t i = 0; i < n_roots_; i++)
        for (size_t j = 0; j < bulletins_[i].n_keys && n < cap; j++)
            if (bulletins_[i].keys[j].key_id == key_id && bulletins_[i].keys[j].epoch == epoch)
                out[n++] = &bulletins_[i].keys[j];
    return n;
}

bool TrustStore::isAuthorityNode(uint32_t node) const
{
    for (size_t i = 0; i < n_roots_; i++)
        for (size_t j = 0; j < bulletins_[i].n_keys; j++)
            for (size_t k = 0; k < bulletins_[i].keys[j].n_nodes; k++)
                if (bulletins_[i].keys[j].node_ids[k] == node)
                    return true;
    return false;
}

bool TrustStore::authorityNodeFor(const char regions[][kRegionLen], size_t n_regions, size_t skip, uint32_t &node) const
{
    // Prefer keys that name the unit's region explicitly over keys with an empty (any) scope.
    for (int pass = 0; pass < 2; pass++)
        for (size_t i = 0; i < n_roots_; i++)
            for (size_t j = 0; j < bulletins_[i].n_keys; j++) {
                const KeyEntry &e = bulletins_[i].keys[j];
                bool explicitScope = e.n_scope > 0;
                if ((pass == 0) != explicitScope || !scopeCovers(e, regions, n_regions))
                    continue;
                for (size_t k = 0; k < e.n_nodes; k++) {
                    if (skip == 0) {
                        node = e.node_ids[k];
                        return true;
                    }
                    skip--;
                }
            }
    return false;
}

size_t TrustStore::keyCount() const
{
    size_t n = 0;
    for (size_t i = 0; i < n_roots_; i++)
        n += bulletins_[i].n_keys;
    return n;
}
} // namespace hl
