// Trust store: pinned roots, root-signed key bulletins, signature checks.
// SPDX-License-Identifier: GPL-3.0-only
//
// Two levels (SPEC 7.2). A root key (Ed25519 + ML-DSA-65, both must verify)
// signs KEYS bulletins and provisioning bundles; it never signs alerts. The
// operational keys listed in a bulletin sign ALERT / FAQ / CANCEL with Ed25519.
// Nothing in here is secret: a unit holds public keys only.
#pragma once
#include "hl_codec.h"

namespace hl
{
struct RootKey {
    uint32_t root_id = 0;
    uint8_t ed25519[kEdPubLen] = {0};
    uint8_t mldsa65[kMldsaPubLen] = {0};
};

// message = body || ed25519_sig || mldsa65_sig. Both signatures must verify.
Result verifyRootSigned(const RootKey &root, const Header &h, Bytes message, Bytes &body);

// message = body || ed25519_sig, checked against one operational key.
// `scratch` must hold at least 20 + message.size bytes.
bool verifyOperational(const KeyEntry &key, const Header &h, Bytes message, uint8_t *scratch, size_t scratch_len, Bytes &body);

bool scopeCovers(const KeyEntry &key, const char regions[][kRegionLen], size_t n_regions);

class TrustStore
{
  public:
    // False when the table is full or the id is already present with a different key.
    bool addRoot(const RootKey &r);
    const RootKey *root(uint32_t root_id) const;
    size_t rootCount() const { return n_roots_; }

    // Verify a KEYS message against its root and install it. Ok: installed.
    // Duplicate: same serial as installed. Rollback: older serial. A bulletin
    // with a higher serial replaces the old one entirely, which is how keys are revoked.
    Result installKeys(const Header &h, Bytes message);
    uint32_t serial(uint32_t root_id) const;
    uint32_t newestIssuedAt() const;

    // Operational keys matching the header fields; several roots may use the same key_id.
    size_t findKeys(uint16_t key_id, uint32_t epoch, const KeyEntry *out[], size_t cap) const;
    bool isAuthorityNode(uint32_t node) const;
    // The crisis-centre radio a unit in `regions` sends its questions to: the first
    // node of the first key (in root, then bulletin order) whose scope covers the unit.
    // `skip` selects the next candidate, so a unit can alternate between radios.
    bool authorityNodeFor(const char regions[][kRegionLen], size_t n_regions, size_t skip, uint32_t &node) const;
    size_t keyCount() const;

  private:
    RootKey roots_[kMaxRoots];
    Keys bulletins_[kMaxRoots]; // index-aligned with roots_; serial 0 = none
    size_t n_roots_ = 0;
};
} // namespace hl
