// Shared helpers of the host tests: vector loader, in-memory platform, check macros.
// SPDX-License-Identifier: GPL-3.0-only
#pragma once
#include "../hl_crypto.h"
#include "../hl_manifest.h"
#include "../hl_sha256.h"
#include "../hl_unit.h"

#include <fstream>
#include <map>
#include <pthread.h>
#include <sstream>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <vector>

inline int g_failed = 0, g_checks = 0;
inline std::string repoRoot;

#define CHECK_MSG(cond, msg)                                                                                                     \
    do {                                                                                                                         \
        g_checks++;                                                                                                              \
        if (!(cond)) {                                                                                                           \
            g_failed++;                                                                                                          \
            printf("    FAIL %s:%d: %s  [%s]\n", __FILE__, __LINE__, #cond, std::string(msg).c_str());                           \
        }                                                                                                                        \
    } while (0)
#define CHECK(cond) CHECK_MSG(cond, "")
#define CHECK_EQ(a, b)                                                                                                           \
    do {                                                                                                                         \
        long long _a = (long long)(a), _b = (long long)(b);                                                                      \
        CHECK_MSG(_a == _b, std::to_string(_a) + " != " + std::to_string(_b));                                                   \
    } while (0)
#define CHECK_HEX(ptr, n, hexstr) CHECK_MSG(tohex(ptr, n) == std::string(hexstr), tohex(ptr, n))
#define RUN(fn)                                                                                                                  \
    do {                                                                                                                         \
        int before = g_failed;                                                                                                   \
        printf("%s\n", #fn);                                                                                                     \
        fn();                                                                                                                    \
        printf("  %s\n", g_failed == before ? "ok" : "FAILED");                                                                  \
    } while (0)

inline int finish()
{
    printf("\n%d checks, %d failed\n", g_checks, g_failed);
    return g_failed ? 1 : 0;
}

inline std::string tohex(const uint8_t *p, size_t n)
{
    std::string s(n * 2, '0');
    static const char d[] = "0123456789abcdef";
    for (size_t i = 0; i < n; i++) {
        s[2 * i] = d[p[i] >> 4];
        s[2 * i + 1] = d[p[i] & 15];
    }
    return s;
}
inline std::vector<uint8_t> unhex(const std::string &s)
{
    std::vector<uint8_t> out(s.size() / 2);
    if (!hl::hexDecode(s.data(), s.size(), out.data(), out.size())) {
        fprintf(stderr, "bad hex\n");
        exit(2);
    }
    return out;
}
inline hl::Bytes B(const std::vector<uint8_t> &v) { return hl::Bytes(v.data(), v.size()); }
inline std::string str(hl::Str s) { return std::string(s.data, s.size); }
inline std::vector<uint8_t> readFile(const std::string &path)
{
    std::ifstream f(path, std::ios::binary);
    if (!f) {
        fprintf(stderr, "cannot read %s\n", path.c_str());
        exit(2);
    }
    return std::vector<uint8_t>((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
}

// vectors.txt: "dotted.key = value"; strings and byte strings are hex, numbers decimal.
struct Vectors {
    std::map<std::string, std::string> kv;
    void load(const char *path)
    {
        std::ifstream f(path);
        if (!f) {
            fprintf(stderr, "cannot read %s\n", path);
            exit(2);
        }
        std::string line;
        while (std::getline(f, line)) {
            size_t eq = line.find(" = ");
            if (line.empty() || line[0] == '#' || eq == std::string::npos)
                continue;
            kv[line.substr(0, eq)] = line.substr(eq + 3);
        }
    }
    const std::string &raw(const std::string &k) const
    {
        auto it = kv.find(k);
        if (it == kv.end()) {
            fprintf(stderr, "missing vector: %s\n", k.c_str());
            exit(2);
        }
        return it->second;
    }
    std::vector<uint8_t> bytes(const std::string &k) const { return unhex(raw(k)); }
    std::string str(const std::string &k) const
    {
        auto b = bytes(k);
        return std::string(b.begin(), b.end());
    }
    uint32_t num(const std::string &k) const { return (uint32_t)strtoul(raw(k).c_str(), nullptr, 10); }
};
inline Vectors V;

struct MemStorage : hl::Storage {
    std::map<std::string, std::vector<uint8_t>> files;
    bool fail_writes = false;
    int writes = 0;
    bool read(const char *name, uint8_t *buf, size_t cap, size_t &n) override
    {
        auto it = files.find(name);
        if (it == files.end() || it->second.size() > cap)
            return false;
        n = it->second.size();
        memcpy(buf, it->second.data(), n);
        return true;
    }
    bool write(const char *name, hl::Bytes data) override
    {
        if (fail_writes)
            return false;
        writes++;
        files[name] = std::vector<uint8_t>(data.data, data.data + data.size);
        return true;
    }
    void remove(const char *name) override { files.erase(name); }
};

struct FakePlatform : hl::Platform {
    uint32_t uptime = 100, rtc = 0;
    uint32_t uptimeSeconds() override { return uptime; }
    uint32_t rtcSeconds() override { return rtc; }
};

struct RecListener : hl::Listener {
    std::vector<uint32_t> alerts, cancelled;
    std::vector<std::pair<uint32_t, uint32_t>> faqs, keys;
    hl::Result probe = hl::Result::Internal;
    void onAlert(uint32_t id) override { alerts.push_back(id); }
    void onAlertCancelled(uint32_t id) override { cancelled.push_back(id); }
    void onFaq(uint32_t id, uint32_t q) override { faqs.push_back({id, q}); }
    void onKeysUpdated(uint32_t root, uint32_t serial) override { keys.push_back({root, serial}); }
};
