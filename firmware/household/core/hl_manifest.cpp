// SPDX-License-Identifier: GPL-3.0-only
#include "hl_manifest.h"
#include "hl_crypto.h"
#include "hl_sha256.h"
#include <new>

namespace hl
{
namespace
{
struct Cur {
    const uint8_t *p, *end;
    void ws()
    {
        while (p < end && (*p == ' ' || *p == '\n' || *p == '\r' || *p == '\t'))
            p++;
    }
    bool eat(char c)
    {
        ws();
        if (p < end && *p == (uint8_t)c) {
            p++;
            return true;
        }
        return false;
    }
};

// Skips one JSON value; reports its extent (for strings: the contents) and kind.
bool skipValue(Cur &c, Bytes &v, char &type, int depth = 0)
{
    c.ws();
    if (c.p >= c.end || depth > 8)
        return false;
    const uint8_t *start = c.p;
    char ch = (char)*c.p;
    if (ch == '"') {
        c.p++;
        const uint8_t *s = c.p;
        while (c.p < c.end && *c.p != '"') {
            if (*c.p == '\\') {
                c.p++;
                if (c.p >= c.end)
                    return false;
            }
            c.p++;
        }
        if (c.p >= c.end)
            return false;
        v = Bytes(s, (size_t)(c.p - s));
        c.p++;
        type = 's';
        return true;
    }
    if (ch == '{' || ch == '[') {
        char close = ch == '{' ? '}' : ']';
        c.p++;
        c.ws();
        if (c.p < c.end && *c.p == (uint8_t)close) {
            c.p++;
        } else {
            for (;;) {
                Bytes tmp;
                char t;
                if (ch == '{') {
                    if (!skipValue(c, tmp, t, depth + 1) || t != 's' || !c.eat(':'))
                        return false;
                }
                if (!skipValue(c, tmp, t, depth + 1))
                    return false;
                if (c.eat(','))
                    continue;
                if (c.eat(close))
                    break;
                return false;
            }
        }
        v = Bytes(start, (size_t)(c.p - start));
        type = ch == '{' ? 'o' : 'a';
        return true;
    }
    while (c.p < c.end && *c.p != ',' && *c.p != '}' && *c.p != ']' && *c.p != ' ' && *c.p != '\n' && *c.p != '\r' && *c.p != '\t')
        c.p++;
    if (c.p == start)
        return false;
    v = Bytes(start, (size_t)(c.p - start));
    type = 'n'; // number, true, false or null
    return true;
}

bool copyStr(Bytes v, char *out, size_t cap)
{
    if (v.size == 0 || v.size >= cap)
        return false;
    for (size_t i = 0; i < v.size; i++)
        if (v.data[i] < 0x20 || v.data[i] > 0x7e || v.data[i] == '\\')
            return false; // names and versions are plain printable ASCII
    memcpy(out, v.data, v.size);
    out[v.size] = 0;
    return true;
}
} // namespace

bool jsonGet(Bytes obj, const char *key, Bytes &value, char *type)
{
    Cur c{obj.data, obj.data + obj.size};
    if (!c.eat('{'))
        return false;
    size_t klen = strlen(key);
    c.ws();
    if (c.p < c.end && *c.p == '}')
        return false;
    for (;;) {
        Bytes k, v;
        char kt, vt;
        if (!skipValue(c, k, kt) || kt != 's' || !c.eat(':') || !skipValue(c, v, vt))
            return false;
        if (k.size == klen && memcmp(k.data, key, klen) == 0) {
            value = v;
            if (type)
                *type = vt;
            return true;
        }
        if (!c.eat(','))
            return false;
    }
}

bool parseVersion(const char *s, size_t n, Version &v)
{
    v = Version();
    uint32_t parts[3] = {0, 0, 0};
    size_t i = 0;
    for (int k = 0; k < 3; k++) {
        size_t digits = 0;
        while (i < n && s[i] >= '0' && s[i] <= '9') {
            parts[k] = parts[k] * 10 + (uint32_t)(s[i] - '0');
            if (parts[k] > 65535)
                return false;
            i++;
            digits++;
        }
        if (digits == 0)
            return false;
        if (k < 2) {
            if (i >= n || s[i] != '.')
                return false;
            i++;
        }
    }
    if (i < n) {
        if (s[i] != '-' || i + 1 == n)
            return false;
        v.prerelease = true;
    }
    v.major = (uint16_t)parts[0];
    v.minor = (uint16_t)parts[1];
    v.patch = (uint16_t)parts[2];
    return true;
}

int compareVersion(const Version &a, const Version &b)
{
    if (a.major != b.major)
        return a.major < b.major ? -1 : 1;
    if (a.minor != b.minor)
        return a.minor < b.minor ? -1 : 1;
    if (a.patch != b.patch)
        return a.patch < b.patch ? -1 : 1;
    if (a.prerelease != b.prerelease)
        return a.prerelease ? -1 : 1;
    return 0;
}

// major: 10 bits, minor: 10 bits, patch: 11 bits, release flag: 1 bit (pre-release sorts lower).
uint32_t packVersion(const Version &v)
{
    if (v.major > 1023 || v.minor > 1023 || v.patch > 2047)
        return 0xffffffffu;
    return ((uint32_t)v.major << 22) | ((uint32_t)v.minor << 12) | ((uint32_t)v.patch << 1) | (v.prerelease ? 0u : 1u);
}

Version unpackVersion(uint32_t p)
{
    Version v;
    v.major = (uint16_t)(p >> 22);
    v.minor = (uint16_t)((p >> 12) & 1023);
    v.patch = (uint16_t)((p >> 1) & 2047);
    v.prerelease = !(p & 1);
    return v;
}

Result verifyManifest(Bytes manifest, Bytes sig_json, const PublisherKeys &keys, ReleaseInfo &out)
{
    Bytes pqHex, edHex;
    char t1, t2;
    if (!jsonGet(sig_json, "ML-DSA-65", pqHex, &t1) || !jsonGet(sig_json, "Ed25519", edHex, &t2) || t1 != 's' || t2 != 's')
        return Result::Malformed;
    uint8_t edSig[kEdSigLen];
    uint8_t *pqSig = new (std::nothrow) uint8_t[kMldsaSigLen];
    if (!pqSig)
        return Result::Internal;
    Result r = Result::Ok;
    if (!hexDecode((const char *)edHex.data, edHex.size, edSig, kEdSigLen) ||
        !hexDecode((const char *)pqHex.data, pqHex.size, pqSig, kMldsaSigLen))
        r = Result::Malformed;
    else {
        bool okEd = ed25519Verify(edSig, keys.ed25519, manifest);
        bool okPq = mldsa65Verify(pqSig, kMldsaSigLen, keys.mldsa65, manifest);
        if (!(okEd && okPq))
            r = Result::BadSignature;
    }
    delete[] pqSig;
    if (r != Result::Ok)
        return r;

    // The manifest is authentic from here on; parsing failures mean a publisher mistake.
    out = ReleaseInfo();
    Bytes v, files;
    char t;
    if (!jsonGet(manifest, "name", v, &t) || t != 's' || v.size != 8 || memcmp(v.data, "holdline", 8) != 0)
        return Result::Malformed;
    if (!jsonGet(manifest, "version", v, &t) || t != 's' || !parseVersion((const char *)v.data, v.size, out.version))
        return Result::Malformed;
    if (!jsonGet(manifest, "board", v, &t) || t != 's' || !copyStr(v, out.board, sizeof(out.board)))
        return Result::Malformed;
    if (!jsonGet(manifest, "files", files, &t) || t != 'a')
        return Result::Malformed;
    // The first entry of "files" is the application image.
    Cur c{files.data, files.data + files.size};
    Bytes entry;
    if (!c.eat('[') || !skipValue(c, entry, t) || t != 'o')
        return Result::Malformed;
    if (!jsonGet(entry, "name", v, &t) || t != 's' || !copyStr(v, out.file, sizeof(out.file)))
        return Result::Malformed;
    if (!jsonGet(entry, "size", v, &t) || t != 'n' || v.size > 9)
        return Result::Malformed;
    for (size_t i = 0; i < v.size; i++) {
        if (v.data[i] < '0' || v.data[i] > '9')
            return Result::Malformed;
        out.size = out.size * 10 + (uint32_t)(v.data[i] - '0');
    }
    if (!jsonGet(entry, "sha256", v, &t) || t != 's' || !hexDecode((const char *)v.data, v.size, out.sha256, 32) || out.size == 0)
        return Result::Malformed;
    return Result::Ok;
}

Result checkInstallable(const ReleaseInfo &rel, const char *board, const Version &floor, bool allow_prerelease)
{
    if (strcmp(rel.board, board) != 0)
        return Result::Unsupported;
    if (rel.version.prerelease && !allow_prerelease)
        return Result::NotAuthorized;
    if (packVersion(rel.version) == 0xffffffffu)
        return Result::Malformed;
    if (compareVersion(rel.version, floor) <= 0)
        return Result::Rollback;
    return Result::Ok;
}
} // namespace hl
