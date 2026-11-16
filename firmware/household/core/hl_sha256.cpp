// SPDX-License-Identifier: GPL-3.0-only
#include "hl_sha256.h"

namespace hl
{
static const uint32_t K[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be,
    0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa,
    0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85,
    0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
    0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};

static inline uint32_t ror(uint32_t x, int n) { return (x >> n) | (x << (32 - n)); }

void Sha256::reset()
{
    static const uint32_t iv[8] = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};
    memcpy(h_, iv, sizeof(h_));
    len_ = 0;
    fill_ = 0;
}

void Sha256::block(const uint8_t *p)
{
    uint32_t w[64];
    for (int i = 0; i < 16; i++)
        w[i] = ((uint32_t)p[4 * i] << 24) | ((uint32_t)p[4 * i + 1] << 16) | ((uint32_t)p[4 * i + 2] << 8) | p[4 * i + 3];
    for (int i = 16; i < 64; i++) {
        uint32_t s0 = ror(w[i - 15], 7) ^ ror(w[i - 15], 18) ^ (w[i - 15] >> 3);
        uint32_t s1 = ror(w[i - 2], 17) ^ ror(w[i - 2], 19) ^ (w[i - 2] >> 10);
        w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }
    uint32_t a = h_[0], b = h_[1], c = h_[2], d = h_[3], e = h_[4], f = h_[5], g = h_[6], h = h_[7];
    for (int i = 0; i < 64; i++) {
        uint32_t t1 = h + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i];
        uint32_t t2 = (ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c));
        h = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2;
    }
    h_[0] += a; h_[1] += b; h_[2] += c; h_[3] += d; h_[4] += e; h_[5] += f; h_[6] += g; h_[7] += h;
}

void Sha256::update(const uint8_t *data, size_t n)
{
    len_ += n;
    while (n) {
        if (fill_ == 0 && n >= 64) {
            block(data);
            data += 64;
            n -= 64;
            continue;
        }
        size_t take = 64 - fill_;
        if (take > n)
            take = n;
        memcpy(buf_ + fill_, data, take);
        fill_ += take;
        data += take;
        n -= take;
        if (fill_ == 64) {
            block(buf_);
            fill_ = 0;
        }
    }
}

void Sha256::finish(uint8_t out[32])
{
    uint64_t bits = len_ * 8;
    uint8_t pad[72] = {0x80};
    size_t padLen = (fill_ < 56) ? (56 - fill_) : (120 - fill_);
    for (int i = 0; i < 8; i++)
        pad[padLen + i] = (uint8_t)(bits >> (56 - 8 * i));
    update(pad, padLen + 8);
    for (int i = 0; i < 8; i++) {
        out[4 * i] = (uint8_t)(h_[i] >> 24);
        out[4 * i + 1] = (uint8_t)(h_[i] >> 16);
        out[4 * i + 2] = (uint8_t)(h_[i] >> 8);
        out[4 * i + 3] = (uint8_t)h_[i];
    }
}

void sha256(Bytes data, uint8_t out[32])
{
    Sha256 s;
    s.update(data);
    s.finish(out);
}

HmacSha256::HmacSha256(const uint8_t *key, size_t n)
{
    uint8_t k[64] = {0};
    if (n > 64)
        sha256(Bytes(key, n), k);
    else
        memcpy(k, key, n);
    uint8_t ipad[64];
    for (int i = 0; i < 64; i++) {
        ipad[i] = k[i] ^ 0x36;
        opad_[i] = k[i] ^ 0x5c;
    }
    inner_.update(ipad, 64);
    wipe(k, sizeof(k));
    wipe(ipad, sizeof(ipad));
}

void HmacSha256::finish(uint8_t out[32])
{
    uint8_t ih[32];
    inner_.finish(ih);
    Sha256 o;
    o.update(opad_, 64);
    o.update(ih, 32);
    o.finish(out);
    wipe(opad_, sizeof(opad_));
}

void hkdfSha256(Bytes ikm, Bytes salt, Bytes info, uint8_t *out, size_t out_len)
{
    uint8_t prk[32];
    static const uint8_t zeroSalt[32] = {0};
    {
        HmacSha256 ex(salt.size ? salt.data : zeroSalt, salt.size ? salt.size : 32);
        ex.update(ikm);
        ex.finish(prk);
    }
    uint8_t t[32];
    size_t tLen = 0, done = 0;
    for (uint8_t counter = 1; done < out_len; counter++) {
        HmacSha256 h(prk, 32);
        h.update(t, tLen);
        h.update(info);
        h.update(&counter, 1);
        h.finish(t);
        tLen = 32;
        size_t take = out_len - done < 32 ? out_len - done : 32;
        memcpy(out + done, t, take);
        done += take;
    }
    wipe(prk, sizeof(prk));
    wipe(t, sizeof(t));
}

static int nibble(char c)
{
    if (c >= '0' && c <= '9')
        return c - '0';
    if (c >= 'a' && c <= 'f')
        return c - 'a' + 10;
    if (c >= 'A' && c <= 'F')
        return c - 'A' + 10;
    return -1;
}

bool hexDecode(const char *s, size_t n, uint8_t *out, size_t out_len)
{
    if (n != out_len * 2)
        return false;
    for (size_t i = 0; i < out_len; i++) {
        int hi = nibble(s[2 * i]), lo = nibble(s[2 * i + 1]);
        if (hi < 0 || lo < 0)
            return false;
        out[i] = (uint8_t)(hi << 4 | lo);
    }
    return true;
}

void hexEncode(const uint8_t *in, size_t n, char *out)
{
    static const char d[] = "0123456789abcdef";
    for (size_t i = 0; i < n; i++) {
        out[2 * i] = d[in[i] >> 4];
        out[2 * i + 1] = d[in[i] & 15];
    }
    out[2 * n] = 0;
}

void wipe(void *p, size_t n)
{
    volatile uint8_t *v = (volatile uint8_t *)p;
    while (n--)
        *v++ = 0;
}

} // namespace hl
