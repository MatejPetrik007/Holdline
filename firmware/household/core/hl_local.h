// Local link: frames between a unit and the device on its USB port or its paired phone
// (provisioning station, updater, phone app). Portable, so that the same code runs on
// the unit and in the host simulator the authority tooling is tested against.
// SPDX-License-Identifier: GPL-3.0-only
//
// Frames travel inside the ordinary Meshtastic client API as data packets on the Holdline
// port addressed to the unit's own node number. A unit accepts them from that API only,
// never from the radio. Format (firmware/protocol/README.md, "Local link"):
//
//   request:  A1 | op      | seq u16le | total u16le | data (<= 227 B)
//   reply:    A1 | op|0x80 | status    | seq u16le   | total u16le | data (<= 226 B)
#pragma once
#include "hl_manifest.h"
#include "hl_unit.h"

namespace hl
{
constexpr uint8_t kLocalMagic = 0xA1;
constexpr size_t kLocalHeader = 6;
constexpr size_t kLocalReplyHeader = 7;
constexpr size_t kLocalData = kMaxPayload - kLocalHeader;           // 227
constexpr size_t kLocalReplyData = kMaxPayload - kLocalReplyHeader; // 226
constexpr size_t kLocalUploadMax = 24 * 1024;

enum LocalOp : uint8_t {
    kOpHello = 0x01,       // -> flags, unit_id, version, language, node number, version floor, board
    kOpKemBegin = 0x02,    // generate ML-KEM-768 + X25519 key pairs; reply `total` = chunks to READ
    kOpRead = 0x03,        // chunk `seq` of the pending download (the public keys)
    kOpWrite = 0x04,       // chunk `seq` of `total` of an upload
    kOpKemFinish = 0x05,   // upload = mlkem_ct(1088) || station_x25519_pub(32) || unit_id(4) -> confirm(16)
    kOpBundle = 0x06,      // upload = sealed provisioning bundle
    kOpSetLang = 0x07,     // data = 2-letter language code
    kOpLock = 0x08,        // latch the provisioned state, then restart
    kOpAsk = 0x09,         // data = category(1) || UTF-8 text -> wait seconds(4)
    kOpSealed = 0x0a,      // upload = sealed KEYS (or other) message, e.g. shipped with an update
    kOpUpdateBegin = 0x10, // data = manifest length(4); upload = manifest.json || manifest.sig
    kOpUpdateData = 0x11,  // data = next bytes of the firmware image
    kOpUpdateEnd = 0x12,   // verify size and SHA-256, switch boot partition, restart
};

// HELLO flags
constexpr uint8_t kHelloProvisioned = 1, kHelloHasKey = 2, kHelloHasBundle = 4, kHelloRouter = 8, kHelloDevKeys = 0x80;

// What the link needs from the board.
class LocalHost
{
  public:
    virtual ~LocalHost() {}
    virtual uint32_t nodeNumber() = 0;
    virtual const char *version() = 0; // "1.2.3"
    virtual const char *board() = 0;
    virtual bool devKeys() = 0;
    virtual Version firmwareFloor() = 0;
    // The bundle or the lock changed what the radio must be configured to.
    virtual void configChanged() = 0;
    virtual void restartSoon() = 0;
    virtual Result ask(const char *text, uint8_t category, uint32_t &wait_s) = 0;
    virtual void languageChanged() {}
    // Signed update (SPEC 7.1); the host owns the flash.
    virtual Result updateBegin(Bytes manifest, Bytes signature) = 0;
    virtual Result updateWrite(Bytes chunk) = 0;
    virtual Result updateFinish() = 0;
};

class LocalLink
{
  public:
    LocalLink(Unit &unit, LocalHost &host) : unit_(unit), host_(host) {}
    ~LocalLink();
    // Handle one request frame; writes the reply frame (<= kMaxPayload bytes) and returns its length.
    // Returns 0 for something that is not a local-link request.
    size_t handle(Bytes request, uint8_t reply[kMaxPayload]);

  private:
    Unit &unit_;
    LocalHost &host_;
    uint8_t *upload_ = nullptr;
    size_t upload_len_ = 0, upload_cap_ = 0;
    uint16_t upload_next_ = 0;
    uint8_t *download_ = nullptr;
    size_t download_len_ = 0;
};
} // namespace hl
