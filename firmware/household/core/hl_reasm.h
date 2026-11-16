// Multi-part reassembly that survives forged parts.
// SPDX-License-Identifier: GPL-3.0-only
//
// The signature covers the whole message, so a single part cannot be checked on
// its own. A device on the frequency could therefore send a fake "part 1 of 2"
// with the msg_id of a real alert and spoil the reassembly. To make that harder
// than one packet, a slot keeps up to kAlternatives different chunks per part
// and the caller tries the combinations until one verifies (bounded).
// KEYS bulletins are large and rare; they get one slot without alternatives and
// are also delivered with firmware updates and at provisioning.
#pragma once
#include "hl_base.h"

namespace hl
{
class Reassembler
{
  public:
    static constexpr size_t kSlots = 6;
    static constexpr size_t kAlternatives = 2;
    static constexpr uint32_t kTimeoutS = 900;
    static constexpr size_t kMaxTries = 16;

    Reassembler();
    ~Reassembler();
    Reassembler(const Reassembler &) = delete;
    Reassembler &operator=(const Reassembler &) = delete;

    enum class Add { Stored, Duplicate, Rejected, Complete };
    // Feed one radio packet (header already parsed, `chunk` = bytes after the header).
    // On Complete, `slot` identifies the message; iterate tries() candidates with assemble().
    Add add(const Header &h, Bytes chunk, uint32_t now_s, int &slot);
    // Number of candidate assemblies that include the chunk stored last (<= kMaxTries).
    size_t tries(int slot) const;
    // Writes candidate `i` to out (capacity kMaxRootMessage is always enough).
    bool assemble(int slot, size_t i, uint8_t *out, size_t cap, size_t &n) const;
    void release(int slot); // the message verified (or is permanently useless)
    void expire(uint32_t now_s);
    size_t active() const;

  private:
    struct Chunk {
        uint16_t len;
        uint8_t data[kMaxChunk];
    };
    struct Slot {
        bool used = false;
        Header h;            // part unused
        uint32_t touched = 0;
        uint8_t alts = 1;    // alternatives per part
        uint8_t count[kMaxPartsRoot] = {0};
        uint8_t last_part = 0, last_alt = 0;
        Chunk *chunks = nullptr; // parts * alts
    };
    Slot slots_[kSlots + 1]; // the last slot is reserved for KEYS
    bool complete(const Slot &s) const;
};
} // namespace hl
