// SPDX-License-Identifier: GPL-3.0-only
#include "hl_relay.h"

namespace hl
{
bool Bucket::take(uint32_t now)
{
    if (last == 0 || now < last)
        last = now;
    uint32_t gained = (now - last) / refill_s;
    if (gained) {
        tokens = (uint16_t)((tokens + gained > burst) ? burst : tokens + gained);
        last += gained * refill_s;
    }
    if (tokens == 0)
        return false;
    tokens--;
    return true;
}

bool DupeCounter::heard(uint32_t from, uint32_t packet_id, uint8_t threshold)
{
    for (auto &e : entries_)
        if (e.count && e.from == from && e.id == packet_id) {
            if (e.count < 255)
                e.count++;
            return e.count >= threshold;
        }
    Entry &e = entries_[next_];
    next_ = (next_ + 1) % kEntries;
    e.from = from;
    e.id = packet_id;
    e.count = 1;
    return threshold <= 1;
}

bool RelayPolicy::permitted(Bytes payload, uint32_t to, bool to_broadcast) const
{
    Header h;
    if (!parseHeader(payload, h) || payload.size > kMaxPayload)
        return false;
    size_t chunk = payload.size - kHeaderLen;
    if (h.parts == 0 || h.part >= h.parts || chunk == 0)
        return false;
    switch (h.type) {
    case kAlert:
    case kFaq:
    case kCancel:
    case kKeys:
        if (!to_broadcast || h.parts > maxPartsFor(h.type) || h.key_id == 0)
            return false;
        return h.part + 1 == h.parts || chunk == kMaxChunk;
    case kQuestion:
        // Single packet, the reserved key_id field is 0, and it must go to a crisis-centre radio.
        return !to_broadcast && h.parts == 1 && h.key_id == 0 && chunk > kGcmTagLen && trust_.isAuthorityNode(to);
    default:
        return false; // BUNDLE and unknown types never travel by radio
    }
}

bool RelayPolicy::sourceAllows(uint32_t from, uint32_t now_s)
{
    Source *s = nullptr, *victim = &sources_[0];
    for (auto &e : sources_) {
        if (e.node == from) {
            s = &e;
            break;
        }
        uint32_t newestE = 0, newestV = 0;
        for (uint32_t t : e.times)
            newestE = t > newestE ? t : newestE;
        for (uint32_t t : victim->times)
            newestV = t > newestV ? t : newestV;
        if (newestE < newestV)
            victim = &e;
    }
    if (!s) {
        s = victim;
        *s = Source();
        s->node = from;
    }
    // Sliding window: allow when one of the N slots is free or older than an hour.
    for (uint32_t &t : s->times)
        if (t == 0 || now_s < t || now_s - t >= 3600) {
            t = now_s ? now_s : 1;
            return true;
        }
    return false;
}

RelayPolicy::Decision RelayPolicy::decide(Bytes payload, uint32_t from, uint32_t to, bool to_broadcast, uint32_t now_s)
{
    if (!permitted(payload, to, to_broadcast))
        return Decision::Drop;
    bool ok;
    if (payload.data[1] == kQuestion)
        ok = sourceAllows(from, now_s) && questions_.take(now_s);
    else
        ok = authority_.take(now_s);
    if (!ok) {
        dropped_rate_++;
        return Decision::Drop;
    }
    return Decision::Relay;
}
} // namespace hl
