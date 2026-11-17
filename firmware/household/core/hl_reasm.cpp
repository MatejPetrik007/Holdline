// SPDX-License-Identifier: GPL-3.0-only
#include "hl_reasm.h"
#include <new>

namespace hl
{
Reassembler::Reassembler() {}
Reassembler::~Reassembler()
{
    for (auto &s : slots_)
        delete[] s.chunks;
}

bool Reassembler::complete(const Slot &s) const
{
    for (uint8_t i = 0; i < s.h.parts; i++)
        if (s.count[i] == 0)
            return false;
    return true;
}

void Reassembler::release(int slot)
{
    if (slot < 0 || slot > (int)kSlots)
        return;
    Slot &s = slots_[slot];
    delete[] s.chunks;
    s = Slot();
}

void Reassembler::expire(uint32_t now_s)
{
    for (int i = 0; i <= (int)kSlots; i++)
        if (slots_[i].used && now_s - slots_[i].touched > kTimeoutS)
            release(i);
}

size_t Reassembler::active() const
{
    size_t n = 0;
    for (auto &s : slots_)
        n += s.used;
    return n;
}

Reassembler::Add Reassembler::add(const Header &h, Bytes chunk, uint32_t now_s, int &slot)
{
    slot = -1;
    if (h.type != kAlert && h.type != kFaq && h.type != kCancel && h.type != kKeys)
        return Add::Rejected;
    if (h.parts == 0 || h.parts > maxPartsFor(h.type) || h.part >= h.parts || chunk.size == 0 || chunk.size > kMaxChunk)
        return Add::Rejected;
    // Every part but the last is full. This removes any freedom in how a message is split.
    if (h.part + 1 < h.parts && chunk.size != kMaxChunk)
        return Add::Rejected;
    expire(now_s);

    const bool isKeys = h.type == kKeys;
    const int first = isKeys ? (int)kSlots : 0, last = isKeys ? (int)kSlots : (int)kSlots - 1;
    int found = -1, freeSlot = -1, oldest = first;
    for (int i = first; i <= last; i++) {
        Slot &s = slots_[i];
        if (!s.used) {
            if (freeSlot < 0)
                freeSlot = i;
            continue;
        }
        if (s.h.type == h.type && s.h.msg_id == h.msg_id && s.h.key_id == h.key_id && s.h.epoch == h.epoch && s.h.parts == h.parts) {
            found = i;
            break;
        }
        if (s.touched < slots_[oldest].touched || !slots_[oldest].used)
            oldest = i;
    }
    if (found < 0) {
        found = freeSlot >= 0 ? freeSlot : oldest;
        release(found);
        Slot &s = slots_[found];
        s.alts = isKeys ? 1 : (uint8_t)kAlternatives;
        s.chunks = new (std::nothrow) Chunk[(size_t)h.parts * s.alts];
        if (!s.chunks)
            return Add::Rejected;
        s.used = true;
        s.h = h;
        s.h.part = 0;
    }
    Slot &s = slots_[found];
    s.touched = now_s;
    Chunk *row = s.chunks + (size_t)h.part * s.alts;
    for (uint8_t a = 0; a < s.count[h.part]; a++)
        if (row[a].len == chunk.size && memcmp(row[a].data, chunk.data, chunk.size) == 0)
            return Add::Duplicate;
    uint8_t a = s.count[h.part];
    if (a == s.alts) {
        if (isKeys)
            return Add::Rejected; // first chunk wins; a failed bulletin slot is released by the caller
        a = (uint8_t)((s.last_part == h.part && s.last_alt == 0) ? 1 : 0); // overwrite, but never the newest chunk
    } else
        s.count[h.part]++;
    row[a].len = (uint16_t)chunk.size;
    memcpy(row[a].data, chunk.data, chunk.size);
    s.last_part = h.part;
    s.last_alt = a;
    slot = found;
    return complete(s) ? Add::Complete : Add::Stored;
}

size_t Reassembler::tries(int slot) const
{
    const Slot &s = slots_[slot];
    size_t n = 1;
    for (uint8_t i = 0; i < s.h.parts; i++)
        if (i != s.last_part) {
            n *= s.count[i];
            if (n >= kMaxTries)
                return kMaxTries;
        }
    return n;
}

bool Reassembler::assemble(int slot, size_t idx, uint8_t *out, size_t cap, size_t &n) const
{
    const Slot &s = slots_[slot];
    if (!s.used || !complete(s))
        return false;
    n = 0;
    for (uint8_t i = 0; i < s.h.parts; i++) {
        uint8_t a;
        if (i == s.last_part)
            a = s.last_alt;
        else {
            a = (uint8_t)(idx % s.count[i]);
            idx /= s.count[i];
        }
        const Chunk &c = s.chunks[(size_t)i * s.alts + a];
        if (n + c.len > cap)
            return false;
        memcpy(out + n, c.data, c.len);
        n += c.len;
    }
    return true;
}
} // namespace hl
