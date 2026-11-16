// SHA-256, HMAC-SHA-256 and HKDF (RFC 5869). Self-contained so that the core
// needs no backend for hashing and behaves identically on the unit and on a host.
// SPDX-License-Identifier: GPL-3.0-only
#pragma once
#include "hl_base.h"

namespace hl
{
class Sha256
{
  public:
    Sha256() { reset(); }
    void reset();
    void update(const uint8_t *data, size_t n);
    void update(Bytes b) { update(b.data, b.size); }
    void finish(uint8_t out[32]);

  private:
    void block(const uint8_t *p);
    uint32_t h_[8];
    uint64_t len_;
    uint8_t buf_[64];
    size_t fill_;
};
void sha256(Bytes data, uint8_t out[32]);

class HmacSha256
{
  public:
    HmacSha256(const uint8_t *key, size_t n);
    void update(const uint8_t *d, size_t n) { inner_.update(d, n); }
    void update(Bytes b) { inner_.update(b); }
    void finish(uint8_t out[32]);

  private:
    Sha256 inner_;
    uint8_t opad_[64];
};
// out_len <= 32 * 255.
void hkdfSha256(Bytes ikm, Bytes salt, Bytes info, uint8_t *out, size_t out_len);

bool hexDecode(const char *s, size_t n, uint8_t *out, size_t out_len); // exactly out_len bytes
void hexEncode(const uint8_t *in, size_t n, char *out);               // writes 2n chars + NUL
} // namespace hl
