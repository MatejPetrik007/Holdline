// Storage, clock, randomness and battery for the unit engine.
// SPDX-License-Identifier: GPL-3.0-only
#include "FSCommon.h"
#include "HoldlineModule.h"
#include "PowerStatus.h"
#include "RTC.h"
#include "configuration.h"
#include "core/hl_crypto.h"
#include "main.h"
#include "mesh/HardwareRNG.h"

namespace
{
#ifdef FSCom
// Blobs live in /hl/<name>. A write goes to a temporary file first and is renamed over the
// old one, so a power cut leaves either the old or the new content, never half of each.
class FsStorage : public hl::Storage
{
  public:
    bool read(const char *name, uint8_t *buf, size_t cap, size_t &n) override
    {
        char path[40];
        snprintf(path, sizeof(path), "/hl/%s", name);
        auto f = FSCom.open(path, FILE_O_READ);
        if (!f)
            return false;
        size_t size = f.size();
        bool ok = size <= cap && (size_t)f.read(buf, size) == size;
        f.close();
        n = size;
        return ok;
    }
    bool write(const char *name, hl::Bytes data) override
    {
        char path[40], tmp[44];
        snprintf(path, sizeof(path), "/hl/%s", name);
        snprintf(tmp, sizeof(tmp), "/hl/%s.tmp", name);
        FSCom.mkdir("/hl");
        auto f = FSCom.open(tmp, FILE_O_WRITE);
        if (!f)
            return false;
        bool ok = f.write(data.data, data.size) == data.size;
        f.flush();
        f.close();
        if (!ok) {
            FSCom.remove(tmp);
            return false;
        }
        return renameFile(tmp, path);
    }
    void remove(const char *name) override
    {
        char path[40];
        snprintf(path, sizeof(path), "/hl/%s", name);
        FSCom.remove(path);
    }
};
#else
class FsStorage : public hl::Storage // boards without a filesystem keep nothing
{
  public:
    bool read(const char *, uint8_t *, size_t, size_t &) override { return false; }
    bool write(const char *, hl::Bytes) override { return false; }
    void remove(const char *) override {}
};
#endif

class DevicePlatform : public hl::Platform
{
  public:
    uint32_t uptimeSeconds() override
    {
        // millis() wraps after 49 days; count the wraps.
        uint32_t ms = millis();
        if (ms < lastMs_)
            wraps_++;
        lastMs_ = ms;
        return (uint32_t)((((uint64_t)wraps_ << 32) | ms) / 1000);
    }
    // Only a clock set by GPS, NTP or the phone counts; the bare RTC of a unit that lost
    // power does not.
    uint32_t rtcSeconds() override { return getValidTime(RTCQualityFromNet); }

  private:
    uint32_t lastMs_ = 0, wraps_ = 0;
};
} // namespace

namespace holdline
{
hl::Storage &storage()
{
    static FsStorage s;
    return s;
}
hl::Platform &platform()
{
    static DevicePlatform p;
    return p;
}
uint8_t batteryPercent()
{
    if (!powerStatus || !powerStatus->getHasBattery())
        return hl::kBatteryUnknown;
    uint8_t pct = powerStatus->getBatteryChargePercent();
    return pct > 100 ? 100 : pct;
}
} // namespace holdline

namespace hl
{
bool randomBytes(uint8_t *out, size_t n)
{
    // Upstream's hardware RNG wrapper (ESP32: esp_fill_random with the radio's entropy).
    // No fallback: without secure randomness the key agreement is refused.
    return HardwareRNG::fill(out, n, true);
}
} // namespace hl
