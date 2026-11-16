// Local link: frames between a unit and the device on its USB port or its paired phone.
// SPDX-License-Identifier: GPL-3.0-only
//
// They travel inside the ordinary Meshtastic client API (ToRadio / FromRadio) as data
// packets on the Holdline port addressed to the unit's own node number. A unit accepts
// them from that API only, never from the radio. Format: firmware/protocol/README.md.
//
//   request:  A1 | op      | seq u16le | total u16le | data (<= 227 B)
//   reply:    A1 | op|0x80 | status    | seq u16le   | total u16le | data (<= 226 B)
#pragma once
#include <stddef.h>
#include <stdint.h>

namespace holdline
{
constexpr uint8_t kLocalMagic = 0xA1;
constexpr size_t kLocalHeader = 6;
constexpr size_t kLocalData = 233 - kLocalHeader;      // 227
constexpr size_t kLocalReplyData = 233 - 7;            // 226

enum LocalOp : uint8_t {
    kOpHello = 0x01,      // -> flags, unit_id, version, language, node number, version floor, board
    kOpKemBegin = 0x02,   // generate ML-KEM-768 + X25519 key pairs; `total` = chunks to READ
    kOpRead = 0x03,       // chunk `seq` of the pending download (the public keys)
    kOpWrite = 0x04,      // chunk `seq` of `total` of an upload
    kOpKemFinish = 0x05,  // upload = mlkem_ct(1088) || station_x25519_pub(32) || unit_id(4) -> confirm(16)
    kOpBundle = 0x06,     // upload = sealed provisioning bundle
    kOpSetLang = 0x07,    // data = 2-letter language code
    kOpLock = 0x08,       // latch the provisioned state, then restart
    kOpAsk = 0x09,        // data = category(1) || UTF-8 text -> wait seconds(4)
    kOpSealed = 0x0a,     // upload = sealed KEYS (or other) message, e.g. shipped with an update
    kOpUpdateBegin = 0x10, // data = manifest length(4); upload = manifest.json || manifest.sig
    kOpUpdateData = 0x11,  // data = next bytes of the firmware image
    kOpUpdateEnd = 0x12,   // verify size and SHA-256, switch boot partition, restart
};
} // namespace holdline
