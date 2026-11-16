// SPDX-License-Identifier: GPL-3.0-only
#include "hl_unit.h"
#include <new>
#include <stdio.h>

namespace hl
{
namespace
{
constexpr size_t kMaxBundle = 20 * 1024;
constexpr uint8_t kFmt = 1;
constexpr uint32_t kRepeatAfterS[] = {600, 3600}; // 2nd and 3rd transmission of a question
constexpr uint8_t kMaxTransmissions = 3;

void alertName(size_t i, char out[12]) { snprintf(out, 12, "alert%u", (unsigned)(i % 10)); }
void faqName(size_t i, char out[12]) { snprintf(out, 12, "faq%02u", (unsigned)(i % 100)); }
void keysName(uint32_t root_id, char out[16]) { snprintf(out, 16, "keys%u", (unsigned)root_id); }
} // namespace

Unit::Unit(Storage &storage, Platform &platform, Listener &listener)
    : storage_(storage), platform_(platform), listener_(listener), relay_(trust_)
{
}

// ------------------------------------------------------------------ time
uint32_t Unit::now()
{
    uint32_t est = time_floor_ ? time_floor_ + (platform_.uptimeSeconds() - floor_uptime_) : 0;
    uint32_t rtc = platform_.rtcSeconds();
    return rtc > est ? rtc : est;
}

void Unit::advanceTime(uint32_t t)
{
    uint32_t est = time_floor_ ? time_floor_ + (platform_.uptimeSeconds() - floor_uptime_) : 0;
    if (t > est) {
        time_floor_ = t;
        floor_uptime_ = platform_.uptimeSeconds();
        state_dirty_ = true;
    }
}

// ------------------------------------------------------------------ persistence
void Unit::saveConfig()
{
    uint8_t b[2 + 4 + 32 + 4];
    b[0] = kFmt;
    b[1] = (uint8_t)((cfg_.locked ? 1 : 0) | (cfg_.has_key ? 2 : 0));
    wr32(b + 2, cfg_.unit_id);
    memcpy(b + 6, cfg_.unit_key, 32);
    memcpy(b + 38, cfg_.lang, 4);
    storage_.write("unit", Bytes(b, sizeof(b)));
    wipe(b, sizeof(b));
}

void Unit::loadConfig()
{
    uint8_t b[2 + 4 + 32 + 4];
    size_t n = 0;
    if (!storage_.read("unit", b, sizeof(b), n) || n != sizeof(b) || b[0] != kFmt)
        return;
    cfg_.locked = b[1] & 1;
    cfg_.has_key = b[1] & 2;
    cfg_.unit_id = rd32(b + 2);
    memcpy(cfg_.unit_key, b + 6, 32);
    memcpy(cfg_.lang, b + 38, 4);
    cfg_.lang[3] = 0;
    if (!langValid(Str{cfg_.lang, strlen(cfg_.lang)}))
        strcpy(cfg_.lang, "en");
    wipe(b, sizeof(b));
}

bool Unit::saveState()
{
    uint8_t b[1 + 4 + 4 + 16 * 6 + QuestionLimiter::kHistory * 4];
    b[0] = kFmt;
    // Persist the current estimate, so that the clock does not fall back across a reboot.
    uint32_t est = time_floor_ ? time_floor_ + (platform_.uptimeSeconds() - floor_uptime_) : 0;
    wr32(b + 1, est);
    wr32(b + 5, reserved_question_id_);
    uint8_t *p = b + 9;
    for (auto &c : cancelled_) {
        wr16(p, c.key_id);
        wr32(p + 2, c.msg_id);
        p += 6;
    }
    for (size_t i = 0; i < QuestionLimiter::kHistory; i++, p += 4)
        wr32(p, limiter_.history()[i]);
    if (!storage_.write("state", Bytes(b, sizeof(b))))
        return false;
    state_dirty_ = false;
    return true;
}

void Unit::loadState()
{
    uint8_t b[1 + 4 + 4 + 16 * 6 + QuestionLimiter::kHistory * 4];
    size_t n = 0;
    if (!storage_.read("state", b, sizeof(b), n) || n != sizeof(b) || b[0] != kFmt)
        return;
    time_floor_ = rd32(b + 1);
    floor_uptime_ = platform_.uptimeSeconds();
    reserved_question_id_ = rd32(b + 5);
    if (reserved_question_id_ == 0)
        reserved_question_id_ = 1;
    const uint8_t *p = b + 9;
    for (auto &c : cancelled_) {
        c.key_id = rd16(p);
        c.msg_id = rd32(p + 2);
        p += 6;
    }
    uint32_t times[QuestionLimiter::kHistory];
    for (size_t i = 0; i < QuestionLimiter::kHistory; i++, p += 4)
        times[i] = rd32(p);
    limiter_.restore(times, now());
}

static constexpr size_t kQuestionRec = 4 + 1 + 4 + 4 + 4 + 4 + 1 + 1 + kMaxPayload;

void Unit::saveQuestions()
{
    uint8_t *b = new (std::nothrow) uint8_t[1 + kQuestionSlots * kQuestionRec];
    if (!b)
        return;
    b[0] = kFmt;
    uint8_t *p = b + 1;
    for (auto &q : questions_) {
        wr32(p, q.info.question_id);
        p[4] = (uint8_t)q.info.state;
        wr32(p + 5, q.info.asked_at);
        wr32(p + 9, q.info.faq_id);
        wr32(p + 13, q.ref);
        wr32(p + 17, q.last_tx);
        p[21] = q.tx_count;
        p[22] = q.len;
        memcpy(p + 23, q.packet, kMaxPayload);
        p += kQuestionRec;
    }
    storage_.write("quest", Bytes(b, 1 + kQuestionSlots * kQuestionRec));
    delete[] b;
}

void Unit::loadQuestions()
{
    const size_t total = 1 + kQuestionSlots * kQuestionRec;
    uint8_t *b = new (std::nothrow) uint8_t[total];
    size_t n = 0;
    if (b && storage_.read("quest", b, total, n) && n == total && b[0] == kFmt) {
        const uint8_t *p = b + 1;
        for (auto &q : questions_) {
            q.info.question_id = rd32(p);
            q.info.state = p[4] <= 3 ? (QuestionState)p[4] : QuestionState::Empty;
            q.info.asked_at = rd32(p + 5);
            q.info.faq_id = rd32(p + 9);
            q.ref = rd32(p + 13);
            q.last_tx = 0; // uptime-based; a reboot makes repeats due again
            q.tx_count = p[21];
            q.len = p[22];
            memcpy(q.packet, p + 23, kMaxPayload);
            p += kQuestionRec;
        }
    }
    delete[] b;
}

bool Unit::writeSealed(const char *name, const Header &h, Bytes message)
{
    uint8_t *b = new (std::nothrow) uint8_t[kHeaderLen + message.size];
    if (!b)
        return false;
    Header hh = h;
    hh.part = 0;
    writeHeader(hh, b);
    memcpy(b + kHeaderLen, message.data, message.size);
    bool ok = storage_.write(name, Bytes(b, kHeaderLen + message.size));
    delete[] b;
    return ok;
}

// ------------------------------------------------------------------ boot
void Unit::begin(const RootKey *pinned, size_t n_pinned)
{
    for (size_t i = 0; i < n_pinned && i < kMaxRoots; i++)
        if (trust_.addRoot(pinned[i]))
            pinned_ids_[n_pinned_++] = pinned[i].root_id;
    loadConfig();
    loadState();
    next_question_id_ = reserved_question_id_;

    uint8_t *big = new (std::nothrow) uint8_t[kMaxBundle];
    if (!big)
        return;
    size_t n = 0;
    if (storage_.read("bundle", big, kMaxBundle, n))
        applyBundle(Bytes(big, n), true);
    // Bulletins received by radio may be newer than the ones inside the bundle.
    uint32_t ids[kMaxRoots];
    size_t nIds = 0;
    for (uint32_t id = 1; id <= 0xffff && nIds < trust_.rootCount(); id++)
        if (trust_.root(id))
            ids[nIds++] = id;
    for (size_t i = 0; i < nIds; i++) {
        char name[16];
        keysName(ids[i], name);
        Header h;
        Bytes m;
        if (storage_.read(name, big, kMaxBundle, n) && unseal(Bytes(big, n), h, m))
            trust_.installKeys(h, m);
    }
    advanceTime(trust_.newestIssuedAt());

    // Stored alerts are verified again: a key revoked since then takes its alerts with it.
    for (size_t i = 0; i < kAlertSlots; i++) {
        char name[12];
        alertName(i, name);
        Header h;
        Bytes m;
        if (!storage_.read(name, big, kMaxBundle, n))
            continue;
        load_slot_ = (int)i;
        if (!unseal(Bytes(big, n), h, m) || handleMessage(h, m, true) != Result::Ok)
            storage_.remove(name);
    }
    load_slot_ = -1;

    uint8_t idx[2 + kFaqCapacity * 8];
    if (storage_.read("faqidx", idx, sizeof(idx), n) && n >= 2 && idx[0] == kFmt && idx[1] <= kFaqCapacity && n == 2 + (size_t)idx[1] * 8) {
        n_faq_ = idx[1];
        for (size_t i = 0; i < n_faq_; i++) {
            faq_[i].faq_id = rd32(idx + 2 + i * 8);
            faq_[i].published_at = rd32(idx + 6 + i * 8);
        }
    }
    loadQuestions();
    limiter_.configure(cfg_.q_min_interval, cfg_.q_max_per_day);
    delete[] big;
}

void Unit::tick()
{
    reasm_.expire(platform_.uptimeSeconds());
    if (state_dirty_)
        saveState();
}

// ------------------------------------------------------------------ radio
bool Unit::shouldRelay(Bytes payload, uint32_t from, uint32_t to, bool to_broadcast)
{
    return relay_.decide(payload, from, to, to_broadcast, platform_.uptimeSeconds()) == RelayPolicy::Decision::Relay;
}

bool Unit::wasSeen(const Header &h) const
{
    for (auto &s : seen_)
        if (s.type == h.type && s.msg_id == h.msg_id && s.key_id == h.key_id)
            return true;
    return false;
}

void Unit::markSeen(const Header &h)
{
    seen_[seen_next_] = Seen{h.type, h.key_id, h.msg_id};
    seen_next_ = (seen_next_ + 1) % (sizeof(seen_) / sizeof(seen_[0]));
}

bool Unit::isCancelled(uint16_t key_id, uint32_t msg_id) const
{
    for (auto &c : cancelled_)
        if (c.key_id == key_id && c.msg_id == msg_id && key_id != 0)
            return true;
    return false;
}

Result Unit::onPacket(Bytes payload)
{
    Header h;
    if (!parseHeader(payload, h) || payload.size > kMaxPayload)
        return Result::Malformed;
    if (h.type != kAlert && h.type != kFaq && h.type != kCancel && h.type != kKeys)
        return Result::Unsupported; // a unit never processes QUESTION, and BUNDLE is wired-only
    if (h.type == kKeys) {
        if (!trust_.root(h.key_id))
            return Result::UnknownKey;
        uint32_t have = trust_.serial(h.key_id);
        if (have && h.epoch <= have) // do not even buffer 17 parts of a bulletin we already have
            return h.epoch == have ? Result::Duplicate : Result::Rollback;
    } else if (wasSeen(h))
        return Result::Duplicate;

    int slot;
    switch (reasm_.add(h, payload.from(kHeaderLen), platform_.uptimeSeconds(), slot)) {
    case Reassembler::Add::Rejected:
        return Result::Malformed;
    case Reassembler::Add::Duplicate:
        return Result::Duplicate;
    case Reassembler::Add::Stored:
        return Result::Incomplete;
    case Reassembler::Add::Complete:
        break;
    }
    Header mh = h;
    mh.part = 0;
    Result result = Result::BadSignature;
    size_t tries = reasm_.tries(slot);
    for (size_t i = 0; i < tries; i++) {
        size_t n;
        if (!reasm_.assemble(slot, i, msg_, sizeof(msg_), n))
            break;
        result = handleMessage(mh, Bytes(msg_, n), false);
        if (result != Result::BadSignature)
            break;
    }
    // A bad signature keeps the slot: the authentic part may still arrive next to a forged one.
    if (result != Result::BadSignature || h.type == kKeys)
        reasm_.release(slot);
    if (h.type != kKeys && result != Result::BadSignature && result != Result::UnknownKey && result != Result::Internal &&
        result != Result::Storage)
        markSeen(h);
    return result;
}

Result Unit::onSealed(Bytes sealed)
{
    Header h;
    Bytes m;
    if (!unseal(sealed, h, m))
        return Result::Malformed;
    if (h.type == kBundle)
        return installBundle(sealed);
    if (h.type != kAlert && h.type != kFaq && h.type != kCancel && h.type != kKeys)
        return Result::Unsupported;
    return handleMessage(h, m, false);
}

Result Unit::handleMessage(const Header &h, Bytes message, bool from_storage)
{
    if (h.type == kKeys) {
        Result r = trust_.installKeys(h, message);
        if (r != Result::Ok)
            return r;
        if (!from_storage) {
            char name[16];
            keysName(h.key_id, name);
            writeSealed(name, h, message);
        }
        advanceTime(trust_.newestIssuedAt());
        // Revocation: drop stored alerts whose key is no longer listed.
        for (size_t i = 0; i < kAlertSlots; i++) {
            const KeyEntry *c[1];
            if (alerts_[i].used && trust_.findKeys(alerts_[i].info.key_id, alerts_[i].epoch, c, 1) == 0) {
                char name[12];
                alertName(i, name);
                storage_.remove(name);
                uint32_t id = alerts_[i].info.msg_id;
                alerts_[i] = AlertSlot();
                listener_.onAlertCancelled(id);
            }
        }
        if (!from_storage)
            listener_.onKeysUpdated(h.key_id, h.epoch);
        return Result::Ok;
    }
    if (message.size > kMaxMessage)
        return Result::TooLarge;
    const KeyEntry *cands[kMaxRoots];
    size_t n = trust_.findKeys(h.key_id, h.epoch, cands, kMaxRoots);
    if (n == 0)
        return Result::UnknownKey;
    const KeyEntry *key = nullptr;
    Bytes body;
    for (size_t i = 0; i < n && !key; i++)
        if (verifyOperational(*cands[i], h, message, scratch_, sizeof(scratch_), body))
            key = cands[i];
    if (!key)
        return Result::BadSignature;
    switch (h.type) {
    case kAlert:
        return handleAlert(h, body, *key, message, from_storage);
    case kFaq:
        return handleFaq(h, body, *key, message, from_storage);
    case kCancel:
        return handleCancel(h, body, *key);
    default:
        return Result::Unsupported;
    }
}

Result Unit::handleAlert(const Header &h, Bytes body, const KeyEntry &key, Bytes message, bool from_storage)
{
    Alert a;
    if (!decodeAlert(body, a))
        return Result::Malformed;
    if (a.issued_at < key.valid_from || a.issued_at > key.valid_to)
        return Result::KeyNotValid;
    if (a.expires_at - a.issued_at > kMaxAlertLifetimeS)
        return Result::Malformed;
    advanceTime(a.issued_at); // authentic, whether or not it is for this region
    if (!scopeCovers(key, cfg_.regions, cfg_.n_regions))
        return Result::OutOfScope;
    if (isCancelled(h.key_id, h.msg_id))
        return Result::Duplicate;
    for (auto &s : alerts_)
        if (s.used && s.info.msg_id == h.msg_id && s.info.key_id == h.key_id)
            return Result::Duplicate;
    if (!from_storage && now() >= a.expires_at)
        return Result::Expired;

    int slot = load_slot_;
    if (slot < 0) {
        int oldest = 0;
        for (int i = 0; i < (int)kAlertSlots; i++) {
            if (!alerts_[i].used) {
                slot = i;
                break;
            }
            if (alerts_[i].info.issued_at < alerts_[oldest].info.issued_at)
                oldest = i;
        }
        if (slot < 0) {
            if (alerts_[oldest].info.issued_at >= a.issued_at)
                return Result::Duplicate; // older than everything we keep
            slot = oldest;
        }
        char name[12];
        alertName((size_t)slot, name);
        if (!writeSealed(name, h, message))
            return Result::Storage;
    }
    AlertSlot &s = alerts_[slot];
    s.used = true;
    s.epoch = h.epoch;
    s.info.msg_id = h.msg_id;
    s.info.key_id = h.key_id;
    s.info.severity = a.severity;
    s.info.issued_at = a.issued_at;
    s.info.expires_at = a.expires_at;
    if (!from_storage) {
        saveState();
        listener_.onAlert(h.msg_id);
    }
    return Result::Ok;
}

Result Unit::handleCancel(const Header &h, Bytes body, const KeyEntry &key)
{
    Cancel c;
    if (!decodeCancel(body, c))
        return Result::Malformed;
    if (c.issued_at < key.valid_from || c.issued_at > key.valid_to)
        return Result::KeyNotValid;
    advanceTime(c.issued_at);
    int found = -1;
    for (int i = 0; i < (int)kAlertSlots; i++)
        if (alerts_[i].used && alerts_[i].info.msg_id == c.cancels_msg_id) {
            // Only the crisis centre that issued an alert may cancel it.
            if (alerts_[i].info.key_id != h.key_id)
                return Result::NotAuthorized;
            found = i;
        }
    if (!isCancelled(h.key_id, c.cancels_msg_id)) {
        cancelled_[cancelled_next_].key_id = h.key_id;
        cancelled_[cancelled_next_].msg_id = c.cancels_msg_id;
        cancelled_next_ = (cancelled_next_ + 1) % (sizeof(cancelled_) / sizeof(cancelled_[0]));
    }
    if (found >= 0) {
        char name[12];
        alertName((size_t)found, name);
        storage_.remove(name);
        alerts_[found] = AlertSlot();
    }
    saveState();
    if (found >= 0)
        listener_.onAlertCancelled(c.cancels_msg_id);
    return Result::Ok;
}

Result Unit::handleFaq(const Header &h, Bytes body, const KeyEntry &key, Bytes message, bool from_storage)
{
    Faq f;
    if (!decodeFaq(body, f))
        return Result::Malformed;
    if (f.published_at < key.valid_from || f.published_at > key.valid_to)
        return Result::KeyNotValid;
    advanceTime(f.published_at);
    // An FAQ entry never expires, so an old key must not be able to add entries for ever.
    if (!from_storage && now() > key.valid_to + kKeyGraceS)
        return Result::KeyNotValid;
    if (!scopeCovers(key, cfg_.regions, cfg_.n_regions))
        return Result::OutOfScope;

    size_t idx = n_faq_;
    for (size_t i = 0; i < n_faq_; i++)
        if (faq_[i].faq_id == f.faq_id) {
            if (faq_[i].published_at >= f.published_at)
                return Result::Duplicate;
            idx = i;
        }
    if (idx == n_faq_) {
        if (n_faq_ < kFaqCapacity)
            n_faq_++;
        else {
            idx = 0;
            for (size_t i = 1; i < n_faq_; i++)
                if (faq_[i].published_at < faq_[idx].published_at)
                    idx = i;
            if (faq_[idx].published_at >= f.published_at)
                return Result::Duplicate;
        }
    }
    char name[12];
    faqName(idx, name);
    if (!writeSealed(name, h, message))
        return Result::Storage;
    faq_[idx].faq_id = f.faq_id;
    faq_[idx].published_at = f.published_at;
    uint8_t ix[2 + kFaqCapacity * 8];
    ix[0] = kFmt;
    ix[1] = (uint8_t)n_faq_;
    for (size_t i = 0; i < n_faq_; i++) {
        wr32(ix + 2 + i * 8, faq_[i].faq_id);
        wr32(ix + 6 + i * 8, faq_[i].published_at);
    }
    storage_.write("faqidx", Bytes(ix, 2 + n_faq_ * 8));

    uint32_t answered = 0;
    if (f.answers_question_ref != 0)
        for (auto &q : questions_)
            if ((q.info.state == QuestionState::Waiting || q.info.state == QuestionState::Sent) && q.ref == f.answers_question_ref) {
                q.info.state = QuestionState::Answered;
                q.info.faq_id = f.faq_id;
                answered = q.info.question_id;
            }
    if (answered)
        saveQuestions();
    listener_.onFaq(f.faq_id, answered);
    return Result::Ok;
}

// ------------------------------------------------------------------ display access
size_t Unit::alertCount() const
{
    size_t n = 0;
    for (auto &s : alerts_)
        n += s.used;
    return n;
}

bool Unit::currentAlert(AlertInfo &info, Alert &view, uint8_t *buf, size_t cap)
{
    int best = -1;
    for (int i = 0; i < (int)kAlertSlots; i++)
        if (alerts_[i].used && (best < 0 || alerts_[i].info.issued_at > alerts_[best].info.issued_at))
            best = i;
    if (best < 0)
        return false;
    char name[12];
    alertName((size_t)best, name);
    size_t n;
    Header h;
    Bytes m;
    if (!storage_.read(name, buf, cap, n) || !unseal(Bytes(buf, n), h, m) || m.size <= kEdSigLen ||
        !decodeAlert(Bytes(m.data, m.size - kEdSigLen), view))
        return false;
    info = alerts_[best].info;
    uint32_t t = now();
    info.expired = t != 0 && t >= info.expires_at;
    return true;
}

bool Unit::faqAt(size_t index, Faq &view, uint8_t *buf, size_t cap)
{
    if (index >= n_faq_)
        return false;
    // Select the index-th newest entry (n <= 50, so a quadratic scan is fine).
    size_t pick = 0;
    for (size_t i = 0; i < n_faq_; i++) {
        size_t newer = 0;
        for (size_t j = 0; j < n_faq_; j++)
            if (faq_[j].published_at > faq_[i].published_at || (faq_[j].published_at == faq_[i].published_at && j < i))
                newer++;
        if (newer == index)
            pick = i;
    }
    char name[12];
    faqName(pick, name);
    size_t n;
    Header h;
    Bytes m;
    return storage_.read(name, buf, cap, n) && unseal(Bytes(buf, n), h, m) && m.size > kEdSigLen &&
           decodeFaq(Bytes(m.data, m.size - kEdSigLen), view);
}

// ------------------------------------------------------------------ questions
Result Unit::ask(Str text, uint8_t category, uint8_t battery, uint32_t &question_id, uint32_t &wait_s)
{
    wait_s = 0;
    if (!cfg_.locked || !cfg_.has_key)
        return Result::NotProvisioned;
    if (cfg_.router)
        return Result::NotAuthorized;
    if (text.size == 0 || text.size > kQuestionTextMax || !utf8Valid(text.data, text.size))
        return Result::Malformed;
    uint32_t t = now();
    wait_s = limiter_.waitSeconds(t);
    if (wait_s)
        return Result::RateLimited;

    Question *slot = nullptr;
    for (auto &q : questions_)
        if (q.info.state == QuestionState::Empty) {
            slot = &q;
            break;
        }
    if (!slot)
        for (auto &q : questions_) // reuse the oldest answered one, else the oldest of all
            if (q.info.state == QuestionState::Answered && (!slot || q.info.asked_at < slot->info.asked_at))
                slot = &q;
    if (!slot)
        for (auto &q : questions_)
            if (!slot || q.info.asked_at < slot->info.asked_at)
                slot = &q;

    // The question id is the AES-GCM nonce counter. Ids are reserved in flash in blocks
    // BEFORE use, so that no power cut, however timed, can make the unit reuse one.
    if (next_question_id_ >= reserved_question_id_) {
        reserved_question_id_ = next_question_id_ + 16;
        if (!saveState()) {
            reserved_question_id_ = next_question_id_;
            return Result::Storage;
        }
    }
    uint32_t id = next_question_id_++;
    size_t len = 0;
    Result r = sealQuestion(cfg_.unit_key, cfg_.unit_id, id, cfg_.lang, category, battery, text, slot->packet, len);
    if (r != Result::Ok)
        return r;
    slot->len = (uint8_t)len;
    slot->info = QuestionInfo();
    slot->info.question_id = id;
    slot->info.state = QuestionState::Waiting;
    slot->info.asked_at = t;
    slot->ref = questionRef(cfg_.unit_key, cfg_.unit_id, id);
    slot->tx_count = 0;
    slot->last_tx = 0;
    limiter_.record(t);
    saveQuestions();
    saveState();
    question_id = id;
    return Result::Ok;
}

bool Unit::nextOutgoing(uint8_t out[kMaxPayload], size_t &n, uint32_t &to_node, uint32_t &question_id)
{
    uint32_t up = platform_.uptimeSeconds();
    for (auto &q : questions_) {
        bool due = q.info.state == QuestionState::Waiting;
        if (q.info.state == QuestionState::Sent && q.tx_count < kMaxTransmissions)
            due = q.last_tx == 0 || up - q.last_tx >= kRepeatAfterS[q.tx_count - 1 < 2 ? q.tx_count - 1 : 1];
        if (!due)
            continue;
        // Repeats go to the next crisis-centre radio, if there is more than one.
        if (!trust_.authorityNodeFor(cfg_.regions, cfg_.n_regions, q.tx_count, to_node) &&
            !trust_.authorityNodeFor(cfg_.regions, cfg_.n_regions, 0, to_node))
            return false;
        memcpy(out, q.packet, q.len);
        n = q.len;
        question_id = q.info.question_id;
        return true;
    }
    return false;
}

void Unit::markSent(uint32_t question_id)
{
    for (auto &q : questions_)
        if (q.info.question_id == question_id && q.info.state != QuestionState::Empty) {
            if (q.info.state == QuestionState::Waiting)
                q.info.state = QuestionState::Sent;
            q.tx_count++;
            q.last_tx = platform_.uptimeSeconds();
            if (q.last_tx == 0)
                q.last_tx = 1;
            saveQuestions();
            return;
        }
}

QuestionInfo Unit::questionAt(size_t slot) const { return slot < kQuestionSlots ? questions_[slot].info : QuestionInfo(); }

// ------------------------------------------------------------------ settings and provisioning
bool Unit::setLanguage(const char *lang)
{
    size_t n = strlen(lang);
    if (!langValid(Str{lang, n}))
        return false;
    memcpy(cfg_.lang, lang, n + 1);
    saveConfig();
    return true;
}

Result Unit::kemBegin(const uint8_t *seed)
{
    if (cfg_.locked)
        return Result::NotAuthorized;
    if (!kem_)
        kem_ = new (std::nothrow) KemState();
    if (!kem_)
        return Result::Internal;
    return hl::kemBegin(*kem_, seed) ? Result::Ok : Result::Internal;
}

Result Unit::kemFinish(const uint8_t ct[kMlkemCtLen], const uint8_t station_x_pub[32], uint32_t unit_id, uint8_t confirm[kKeyConfirmLen])
{
    if (cfg_.locked)
        return Result::NotAuthorized;
    if (!kem_ || !kem_->active || unit_id == 0)
        return Result::Malformed;
    uint8_t key[32];
    bool ok = hl::kemFinish(*kem_, ct, station_x_pub, unit_id, key, confirm);
    delete kem_;
    kem_ = nullptr;
    if (!ok)
        return Result::BadTag;
    memcpy(cfg_.unit_key, key, 32);
    wipe(key, sizeof(key));
    cfg_.unit_id = unit_id;
    cfg_.has_key = true;
    saveConfig();
    return Result::Ok;
}

Result Unit::installBundle(Bytes sealed) { return applyBundle(sealed, false); }

Result Unit::applyBundle(Bytes sealed, bool from_storage)
{
    Header h;
    Bytes m, body;
    if (!unseal(sealed, h, m) || h.type != kBundle)
        return Result::Malformed;
    // Only a root compiled into this firmware may configure the unit. Roots that an
    // earlier bundle added are trusted for key bulletins, not for bundles.
    bool pinned = false;
    for (size_t i = 0; i < n_pinned_; i++)
        pinned = pinned || pinned_ids_[i] == h.key_id;
    const RootKey *root = pinned ? trust_.root(h.key_id) : nullptr;
    if (!root)
        return Result::UnknownKey;
    if (!from_storage && cfg_.has_bundle && cfg_.bundle_root == h.key_id && h.epoch <= cfg_.bundle_serial)
        return h.epoch == cfg_.bundle_serial ? Result::Duplicate : Result::Rollback;
    Result r = verifyRootSigned(*root, h, m, body);
    if (r != Result::Ok)
        return r;
    Bundle *b = new (std::nothrow) Bundle();
    if (!b)
        return Result::Internal;
    if (!decodeBundle(body, *b) || b->root_id != h.key_id || b->serial != h.epoch) {
        delete b;
        return Result::Malformed;
    }
    if (!from_storage && !storage_.write("bundle", sealed)) {
        delete b;
        return Result::Storage;
    }
    for (size_t i = 0; i < b->n_extra_roots; i++) {
        RootKey *rk = new (std::nothrow) RootKey();
        if (!rk)
            break;
        rk->root_id = b->extra_roots[i].root_id;
        memcpy(rk->ed25519, b->extra_roots[i].ed25519.data, kEdPubLen);
        memcpy(rk->mldsa65, b->extra_roots[i].mldsa65.data, kMldsaPubLen);
        trust_.addRoot(*rk);
        delete rk;
    }
    for (size_t i = 0; i < b->n_keys; i++) {
        Header kh;
        Bytes km;
        if (unseal(b->keys[i], kh, km))
            trust_.installKeys(kh, km); // Duplicate / Rollback are fine: we keep the newer one
    }
    cfg_.n_regions = (uint8_t)b->n_regions;
    for (size_t i = 0; i < b->n_regions; i++) {
        memcpy(cfg_.regions[i], b->regions[i].data, b->regions[i].size);
        cfg_.regions[i][b->regions[i].size] = 0;
    }
    cfg_.router = b->role == 1;
    cfg_.q_min_interval = b->question_min_interval_s;
    cfg_.q_max_per_day = b->question_max_per_day;
    limiter_.configure(cfg_.q_min_interval, cfg_.q_max_per_day);
    cfg_.radio = RadioConfig();
    memcpy(cfg_.radio.channel_name, b->channel_name.data, b->channel_name.size);
    memcpy(cfg_.radio.channel_psk, b->channel_psk.data, 32);
    cfg_.radio.modem_preset = b->modem_preset;
    cfg_.radio.has_admin_key = b->admin_key.size == 32;
    if (cfg_.radio.has_admin_key)
        memcpy(cfg_.radio.admin_key, b->admin_key.data, 32);
    cfg_.radio.router = cfg_.router;
    cfg_.has_bundle = true;
    cfg_.bundle_serial = h.epoch;
    cfg_.bundle_root = h.key_id;
    advanceTime(b->issued_at);
    advanceTime(trust_.newestIssuedAt());
    delete b;
    return Result::Ok;
}

bool Unit::radioConfig(RadioConfig &out) const
{
    if (!cfg_.has_bundle)
        return false;
    out = cfg_.radio;
    return true;
}

Result Unit::lock()
{
    if (cfg_.locked)
        return Result::Duplicate;
    if (!cfg_.has_bundle || trust_.keyCount() == 0 || (!cfg_.router && !cfg_.has_key))
        return Result::NotProvisioned;
    cfg_.locked = true;
    saveConfig();
    saveState();
    return Result::Ok;
}
} // namespace hl
