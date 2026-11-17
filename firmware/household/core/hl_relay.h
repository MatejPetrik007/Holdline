// Relay policy (SPEC 5.3): what a unit rebroadcasts, decided without verifying.
// SPDX-License-Identifier: GPL-3.0-only
//
// A unit relays only (1) authority packets (ALERT, FAQ, KEYS, CANCEL) sent as a
// broadcast on the Holdline port and (2) QUESTION packets addressed to an
// authority node. Signatures need the whole message, so relaying cannot wait for
// them: the decision uses the header, the addressing and rate limits. A forged
// alert may be relayed; it is never displayed.
#pragma once
#include "hl_trust.h"

namespace hl
{
// Token bucket in whole tokens; time in seconds.
struct Bucket {
    uint16_t burst, tokens;
    uint16_t refill_s; // one token per refill_s
    uint32_t last = 0;
    Bucket(uint16_t b, uint16_t r) : burst(b), tokens(b), refill_s(r) {}
    bool take(uint32_t now);
};

// Counter-based suppression of rebroadcasts (Ni et al., "The broadcast storm problem in a
// mobile ad hoc network", 1999): cancel only after `threshold` duplicates were heard.
class DupeCounter
{
  public:
    static constexpr size_t kEntries = 24;
    // Call for every duplicate of (from, packet_id) heard while a rebroadcast of it is pending.
    // True when the pending rebroadcast should now be cancelled.
    bool heard(uint32_t from, uint32_t packet_id, uint8_t threshold = kCancelAfterDupes);

  private:
    struct Entry {
        uint32_t from = 0, id = 0;
        uint8_t count = 0;
    } entries_[kEntries];
    size_t next_ = 0;
};

class RelayPolicy
{
  public:
    static constexpr size_t kSources = 32;
    explicit RelayPolicy(const TrustStore &trust) : trust_(trust) {}

    enum class Decision { Drop, Relay };
    // `payload` is the decoded Meshtastic payload of a packet on kPortNum that is neither
    // from us nor addressed to us. Anything on another port must be dropped by the caller.
    Decision decide(Bytes payload, uint32_t from, uint32_t to, bool to_broadcast, uint32_t now_s);

    // Classification only (no rate limiting, no state): is this packet of a relayable kind?
    bool permitted(Bytes payload, uint32_t to, bool to_broadcast) const;

    uint32_t droppedByRate() const { return dropped_rate_; }

  private:
    const TrustStore &trust_;
    Bucket authority_{40, 30}; // burst 40, then 120 packets per hour
    Bucket questions_{20, 60}; // burst 20, then 60 packets per hour, all sources together
    struct Source {
        uint32_t node = 0;
        uint32_t times[kRelayQuestionsPerSourcePerHour] = {0};
    } sources_[kSources];
    uint32_t dropped_rate_ = 0;
    bool sourceAllows(uint32_t from, uint32_t now_s);
};
} // namespace hl
