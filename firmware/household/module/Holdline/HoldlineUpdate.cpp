// Signed firmware update over the local link (SPEC 7.1).
// SPDX-License-Identifier: GPL-3.0-only
//
// Order of checks: (1) both publisher signatures over the manifest bytes, (2) board,
// pre-release and anti-rollback policy, (3) the image is written to the inactive app
// partition while its SHA-256 is computed, (4) size and hash must equal the manifest,
// (5) ESP-IDF validates the image, and only then (6) the boot partition is switched and
// the version floor is raised. A failure at any step leaves the running firmware untouched.
//
// Secure Boot V2 protects the boot chain; it is not post-quantum. The ML-DSA-65 signature
// checked here protects the update path. Production units need both (firmware/README.md).
// NOT YET TESTED ON HARDWARE.
#include "HoldlineModule.h"
#include "HoldlinePinnedKeys.h"
#include "configuration.h"
#include "core/hl_sha256.h"

#if defined(ARCH_ESP32)
#include <Preferences.h>
#include <esp_ota_ops.h>

namespace
{
hl::ReleaseInfo release;
hl::Sha256 hash;
esp_ota_handle_t handle = 0;
const esp_partition_t *target = nullptr;
uint32_t written = 0;
bool active = false;

// The highest version ever installed. Kept in NVS; with flash encryption enabled the NVS
// partition must be encrypted too, or this becomes the weak point of anti-rollback.
uint32_t readFloor()
{
    Preferences prefs;
    prefs.begin("holdline", true);
    uint32_t v = prefs.getUInt("fwfloor", 0);
    prefs.end();
    return v;
}
void writeFloor(uint32_t v)
{
    Preferences prefs;
    prefs.begin("holdline", false);
    if (prefs.getUInt("fwfloor", 0) < v)
        prefs.putUInt("fwfloor", v);
    prefs.end();
}
void abortUpdate()
{
    if (active && handle)
        esp_ota_abort(handle);
    active = false;
    handle = 0;
}
} // namespace

namespace holdline
{
hl::Version firmwareFloor()
{
    // The running version counts as installed: a unit never goes below what it runs.
    hl::Version own;
    hl::parseVersion(HOLDLINE_VERSION, strlen(HOLDLINE_VERSION), own);
    uint32_t stored = readFloor(), mine = hl::packVersion(own);
    if (mine != 0xffffffffu && mine > stored) {
        writeFloor(mine);
        stored = mine;
    }
    return hl::unpackVersion(stored);
}

hl::Result updateBegin(hl::Bytes manifest, hl::Bytes signature)
{
    abortUpdate();
    hl::PublisherKeys keys{holdline_pinned::kPublisherEd25519, holdline_pinned::kPublisherMldsa65};
    hl::Result r = hl::verifyManifest(manifest, signature, keys, release);
    if (r != hl::Result::Ok)
        return r;
    // Development builds (throwaway keys) accept pre-release versions; deployed builds do not.
    r = hl::checkInstallable(release, HOLDLINE_BOARD, firmwareFloor(), holdline_pinned::kDevKeys);
    if (r != hl::Result::Ok)
        return r;
    target = esp_ota_get_next_update_partition(nullptr);
    if (!target || release.size > target->size)
        return hl::Result::TooLarge;
    if (esp_ota_begin(target, release.size, &handle) != ESP_OK)
        return hl::Result::Storage;
    hash.reset();
    written = 0;
    active = true;
    LOG_INFO("Holdline update: %u.%u.%u for %s, %u bytes", release.version.major, release.version.minor, release.version.patch, release.board, (unsigned)release.size);
    return hl::Result::Ok;
}

hl::Result updateWrite(hl::Bytes chunk)
{
    if (!active)
        return hl::Result::NotAuthorized;
    if (written + chunk.size > release.size) {
        abortUpdate();
        return hl::Result::TooLarge;
    }
    if (esp_ota_write(handle, chunk.data, chunk.size) != ESP_OK) {
        abortUpdate();
        return hl::Result::Storage;
    }
    hash.update(chunk);
    written += chunk.size;
    return hl::Result::Ok;
}

hl::Result updateFinish()
{
    if (!active)
        return hl::Result::NotAuthorized;
    uint8_t digest[32];
    hash.finish(digest);
    if (written != release.size || !hl::ctEqual(digest, release.sha256, 32)) {
        abortUpdate();
        return hl::Result::BadSignature; // not the image the publisher signed
    }
    active = false;
    if (esp_ota_end(handle) != ESP_OK)
        return hl::Result::Malformed;
    if (esp_ota_set_boot_partition(target) != ESP_OK)
        return hl::Result::Storage;
    writeFloor(hl::packVersion(release.version));
    return hl::Result::Ok;
}
} // namespace holdline

#else // other architectures: no in-field update yet

namespace holdline
{
hl::Version firmwareFloor()
{
    hl::Version own;
    hl::parseVersion(HOLDLINE_VERSION, strlen(HOLDLINE_VERSION), own);
    return own;
}
hl::Result updateBegin(hl::Bytes, hl::Bytes) { return hl::Result::Unsupported; }
hl::Result updateWrite(hl::Bytes) { return hl::Result::Unsupported; }
hl::Result updateFinish() { return hl::Result::Unsupported; }
} // namespace holdline
#endif
