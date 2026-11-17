// SPDX-License-Identifier: GPL-3.0-only
#include "hl_question.h"
#include "hl_crypto.h"
#include "hl_sha256.h"

namespace hl
{
static void questionNonce(uint32_t unit_id, uint32_t question_id, uint8_t nonce[12])
{
    wr32(nonce, unit_id);
    wr32(nonce + 4, question_id);
    nonce[8] = nonce[9] = nonce[10] = 0;
    nonce[11] = 1; // direction: unit -> authority
}

Result sealQuestion(const uint8_t unit_key[32], uint32_t unit_id, uint32_t question_id, const char lang[2], uint8_t category,
                    uint8_t battery, Str text, uint8_t out[kMaxPayload], size_t &out_len)
{
    if (text.size == 0 || text.size > kQuestionTextMax)
        return Result::TooLarge;
    Header h;
    h.type = kQuestion;
    h.msg_id = question_id;
    h.part = 0;
    h.parts = 1;
    h.key_id = 0;
    h.epoch = unit_id; // for QUESTION this field selects the per-unit key
    writeHeader(h, out);
    uint8_t *pt = out + kHeaderLen;
    pt[0] = (uint8_t)lang[0];
    pt[1] = (uint8_t)lang[1];
    pt[2] = category;
    pt[3] = battery;
    memcpy(pt + 4, text.data, text.size);
    size_t ptLen = 4 + text.size;
    uint8_t nonce[12];
    questionNonce(unit_id, question_id, nonce);
    if (!aes256GcmSeal(unit_key, nonce, Bytes(out, kHeaderLen), Bytes(pt, ptLen), pt, pt + ptLen))
        return Result::Internal;
    out_len = kHeaderLen + ptLen + kGcmTagLen;
    return Result::Ok;
}

uint32_t questionRef(const uint8_t unit_key[32], uint32_t unit_id, uint32_t question_id)
{
    uint8_t in[8], mac[32];
    wr32(in, unit_id);
    wr32(in + 4, question_id);
    HmacSha256 h(unit_key, 32);
    h.update((const uint8_t *)"HLv1-qref", 9);
    h.update(in, 8);
    h.finish(mac);
    uint32_t v = rd32(mac);
    return v ? v : 1;
}

void QuestionLimiter::configure(uint32_t min_interval_s, uint32_t max_per_day)
{
    min_interval_ = min_interval_s ? min_interval_s : kQuestionMinIntervalS;
    max_per_day_ = max_per_day ? max_per_day : kQuestionMaxPerDay;
    if (max_per_day_ > kHistory)
        max_per_day_ = kHistory;
}

uint32_t QuestionLimiter::waitSeconds(uint32_t now_s) const
{
    uint32_t wait = 0, inDay = 0, oldestInDay = now_s;
    for (uint32_t t : times_) {
        if (t == 0 || now_s - t >= 86400)
            continue;
        inDay++;
        if (t < oldestInDay)
            oldestInDay = t;
        if (now_s - t < min_interval_ && min_interval_ - (now_s - t) > wait)
            wait = min_interval_ - (now_s - t);
    }
    if (inDay >= max_per_day_) {
        uint32_t w = 86400 - (now_s - oldestInDay);
        if (w > wait)
            wait = w;
    }
    return wait;
}

void QuestionLimiter::record(uint32_t now_s)
{
    size_t oldest = 0;
    for (size_t i = 0; i < kHistory; i++)
        if (times_[i] < times_[oldest])
            oldest = i;
    times_[oldest] = now_s ? now_s : 1;
}

void QuestionLimiter::restore(const uint32_t *times, uint32_t now_s)
{
    // The clock may have gone back across a reboot (no RTC battery). A stored time in the
    // future still counts as a question asked "just now", so a power cycle resets nothing.
    for (size_t i = 0; i < kHistory; i++)
        times_[i] = times[i] > now_s ? now_s : times[i];
}
} // namespace hl
