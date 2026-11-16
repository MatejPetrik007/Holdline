// QUESTION packets: the only traffic a household unit can originate (SPEC 5.5, 6.4, 7.3).
// SPDX-License-Identifier: GPL-3.0-only
#pragma once
#include "hl_base.h"

namespace hl
{
// Build the single radio packet of a question, encrypted with the per-unit key.
// `question_id` is the AES-GCM nonce counter: it must never repeat for a key.
Result sealQuestion(const uint8_t unit_key[32], uint32_t unit_id, uint32_t question_id, const char lang[2], uint8_t category,
                    uint8_t battery, Str text, uint8_t out[kMaxPayload], size_t &out_len);

// 32-bit reference to a question, computable only with the per-unit key. The authority
// puts it into the FAQ entry that answers the question; nobody else can link the two.
uint32_t questionRef(const uint8_t unit_key[32], uint32_t unit_id, uint32_t question_id);

// Per-unit sending limits: a minimum interval and a maximum per 24 hours.
class QuestionLimiter
{
  public:
    static constexpr size_t kHistory = 32;
    void configure(uint32_t min_interval_s, uint32_t max_per_day);
    // 0 when a question may be sent now, else the seconds to wait.
    uint32_t waitSeconds(uint32_t now_s) const;
    void record(uint32_t now_s);
    // Persistence: `kHistory` timestamps.
    const uint32_t *history() const { return times_; }
    void restore(const uint32_t *times, uint32_t now_s);

  private:
    uint32_t min_interval_ = kQuestionMinIntervalS, max_per_day_ = kQuestionMaxPerDay;
    uint32_t times_[kHistory] = {0};
};
} // namespace hl
