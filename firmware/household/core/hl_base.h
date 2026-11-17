// Holdline core: shared types and constants. Portable C++17, no Arduino, no heap in the hot path.
// SPDX-License-Identifier: GPL-3.0-only
#pragma once
#include <stddef.h>
#include <stdint.h>
#include <string.h>

namespace hl
{

// ---- protocol constants (firmware/protocol/README.md)
constexpr uint16_t kPortNum = 300;   // Meshtastic port number, private range 256..511
constexpr uint8_t kVersion = 1;
constexpr size_t kHeaderLen = 14;
constexpr size_t kMaxPayload = 233;  // upstream meshtastic_Constants_DATA_PAYLOAD_LEN
constexpr size_t kMaxChunk = kMaxPayload - kHeaderLen; // 219
constexpr uint8_t kMaxParts = 8;     // ALERT, FAQ, CANCEL
constexpr uint8_t kMaxPartsRoot = 24; // KEYS over LoRa
constexpr size_t kEdSigLen = 64;
constexpr size_t kEdPubLen = 32;
constexpr size_t kMldsaSigLen = 3309;
constexpr size_t kMldsaPubLen = 1952;
constexpr size_t kGcmTagLen = 12;
constexpr size_t kQuestionTextMax = 200;
constexpr size_t kMaxMessage = kMaxParts * kMaxChunk;         // 1752
constexpr size_t kMaxRootMessage = kMaxPartsRoot * kMaxChunk; // 5256
constexpr uint8_t kBatteryUnknown = 0xff;

// ---- policy defaults (firmware/DECISIONS.md); the provisioning bundle can override the question limits
constexpr uint32_t kQuestionMinIntervalS = 600;
constexpr uint32_t kQuestionMaxPerDay = 10;
constexpr uint32_t kRelayQuestionsPerSourcePerHour = 6;
constexpr uint32_t kMaxAlertLifetimeS = 7 * 86400;
constexpr uint32_t kKeyGraceS = 86400;
constexpr size_t kFaqCapacity = 50;
// A household drops its pending rebroadcast of an authority packet only after it has heard
// this many other rebroadcasts of it. Upstream Meshtastic uses 1; the flooding simulator
// (test/test_sim.cpp) shows that 1 lets a router silence the only household that bridges to
// the next part of town. See firmware/DECISIONS.md, "Rebroadcast cancellation".
constexpr uint8_t kCancelAfterDupes = 2;

enum PacketType : uint8_t { kAlert = 1, kFaq = 2, kQuestion = 3, kCancel = 4, kKeys = 5, kBundle = 6 };
enum Severity : uint8_t { kInfo = 1, kWarning = 2, kDanger = 3 };

enum class Result : uint8_t {
    Ok = 0,
    Duplicate,     // already have it; not an error
    Incomplete,    // more parts needed
    Malformed,
    Unsupported,
    TooLarge,
    UnknownKey,    // key_id/epoch not in a root-verified bulletin (includes revoked keys)
    BadSignature,
    KeyNotValid,   // message time outside the key's validity window
    Expired,
    OutOfScope,    // authentic, but the key may not alert this unit's region
    Rollback,      // bulletin, bundle or firmware older than the installed one
    NotAuthorized,
    BadTag,
    RateLimited,
    NotProvisioned,
    Storage,
    Internal,
};
const char *resultName(Result r);

struct Bytes {
    const uint8_t *data = nullptr;
    size_t size = 0;
    Bytes() = default;
    Bytes(const uint8_t *d, size_t n) : data(d), size(n) {}
    Bytes sub(size_t off, size_t n) const { return Bytes(data + off, n); }
    Bytes from(size_t off) const { return Bytes(data + off, size - off); }
};

// UTF-8 text view into a message buffer; not NUL-terminated.
struct Str {
    const char *data = nullptr;
    size_t size = 0;
    bool equals(const char *s) const { return strlen(s) == size && memcmp(s, data, size) == 0; }
    bool equals(Str o) const { return o.size == size && memcmp(o.data, data, size) == 0; }
};

inline uint16_t rd16(const uint8_t *p) { return (uint16_t)(p[0] | (p[1] << 8)); }
inline uint32_t rd32(const uint8_t *p) { return (uint32_t)p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24); }
inline void wr16(uint8_t *p, uint16_t v) { p[0] = (uint8_t)v; p[1] = (uint8_t)(v >> 8); }
inline void wr32(uint8_t *p, uint32_t v) { p[0] = (uint8_t)v; p[1] = (uint8_t)(v >> 8); p[2] = (uint8_t)(v >> 16); p[3] = (uint8_t)(v >> 24); }

// Constant-time comparison for tags and confirmation values.
inline bool ctEqual(const uint8_t *a, const uint8_t *b, size_t n)
{
    uint8_t d = 0;
    for (size_t i = 0; i < n; i++)
        d |= (uint8_t)(a[i] ^ b[i]);
    return d == 0;
}
void wipe(void *p, size_t n);

struct Header {
    uint8_t version = kVersion;
    uint8_t type = 0;
    uint32_t msg_id = 0;
    uint8_t part = 0;
    uint8_t parts = 1;
    uint16_t key_id = 0;
    uint32_t epoch = 0;
};
// False when the packet is shorter than a header or the version is not ours.
bool parseHeader(Bytes packet, Header &h);
void writeHeader(const Header &h, uint8_t out[kHeaderLen]);
inline uint8_t maxPartsFor(uint8_t type) { return type == kKeys ? kMaxPartsRoot : type == kQuestion ? 1 : kMaxParts; }

} // namespace hl
