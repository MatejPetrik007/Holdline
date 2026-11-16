// The Holdline unit engine: everything a household unit or relay router decides,
// independent of Meshtastic, the radio and the display.
// SPDX-License-Identifier: GPL-3.0-only
//
// The Meshtastic module (firmware/household/module) is a thin adapter around this
// class, and the host tests and the flooding simulator drive the same code.
#pragma once
#include "hl_kem.h"
#include "hl_question.h"
#include "hl_reasm.h"
#include "hl_relay.h"
#include "hl_text.h"
#include "hl_trust.h"

namespace hl
{
// Small named blobs in flash. Writes must be atomic per blob (the adapter uses a
// temp file and rename). Names are short ASCII: "unit", "state", "alert0", "faq07", ...
class Storage
{
  public:
    virtual ~Storage() {}
    virtual bool read(const char *name, uint8_t *buf, size_t cap, size_t &n) = 0;
    virtual bool write(const char *name, Bytes data) = 0;
    virtual void remove(const char *name) = 0;
};

class Platform
{
  public:
    virtual ~Platform() {}
    virtual uint32_t uptimeSeconds() = 0;
    // Wall-clock time if the unit has a trustworthy one (GPS, phone), else 0.
    virtual uint32_t rtcSeconds() = 0;
};

class Listener
{
  public:
    virtual ~Listener() {}
    virtual void onAlert(uint32_t /*msg_id*/) {}
    virtual void onAlertCancelled(uint32_t /*msg_id*/) {}
    // question_id != 0: this entry answers one of this unit's own questions.
    virtual void onFaq(uint32_t /*faq_id*/, uint32_t /*question_id*/) {}
    virtual void onKeysUpdated(uint32_t /*root_id*/, uint32_t /*serial*/) {}
};

constexpr size_t kAlertSlots = 4;
constexpr size_t kQuestionSlots = 8;
constexpr size_t kMaxSealedMessage = kHeaderLen + kMaxMessage;

struct AlertInfo {
    uint32_t msg_id = 0;
    uint16_t key_id = 0;
    uint8_t severity = 0;
    uint32_t issued_at = 0, expires_at = 0;
    bool expired = false;
};

enum class QuestionState : uint8_t { Empty = 0, Waiting = 1, Sent = 2, Answered = 3 };
struct QuestionInfo {
    uint32_t question_id = 0;
    QuestionState state = QuestionState::Empty;
    uint32_t asked_at = 0;
    uint32_t faq_id = 0; // set when answered
};

// What the adapter applies to the Meshtastic configuration after a bundle is installed.
struct RadioConfig {
    char channel_name[12] = {0};
    uint8_t channel_psk[32] = {0};
    uint32_t modem_preset = 0;
    uint8_t admin_key[32] = {0};
    bool has_admin_key = false;
    bool router = false;
};

class Unit
{
  public:
    Unit(Storage &storage, Platform &platform, Listener &listener);
    ~Unit() { delete kem_; }
    Unit(const Unit &) = delete;
    Unit &operator=(const Unit &) = delete;

    // `pinned` are the root keys compiled into the firmware. Loads and re-verifies
    // everything in storage. Call once at boot.
    void begin(const RootKey *pinned, size_t n_pinned);

    // ---- radio
    // Relay decision for a packet on kPortNum that is not addressed to this node.
    bool shouldRelay(Bytes payload, uint32_t from, uint32_t to, bool to_broadcast);
    // A duplicate of a packet whose rebroadcast is pending was heard: may the pending
    // rebroadcast be cancelled? Routers never cancel; that is decided by the caller's role.
    bool mayCancelRebroadcast(uint32_t from, uint32_t packet_id) { return dupes_.heard(from, packet_id); }
    // Process a received Holdline packet (reassemble, verify, update state).
    // Result::Incomplete means "stored, waiting for more parts".
    Result onPacket(Bytes payload);
    // Sealed message (header + whole message), e.g. a bulletin shipped with a firmware update.
    Result onSealed(Bytes sealed);

    // ---- alerts and FAQ for the display
    // The alert to show: the newest stored one. False when there is none.
    // `buf` (kMaxSealedMessage bytes) receives the message; `view` points into it.
    bool currentAlert(AlertInfo &info, Alert &view, uint8_t *buf, size_t cap);
    size_t alertCount() const;
    size_t faqCount() const { return n_faq_; }
    // index 0 = newest.
    bool faqAt(size_t index, Faq &view, uint8_t *buf, size_t cap);

    // ---- questions
    // Encrypts and queues a question. RateLimited: `wait_s` says how long to wait.
    Result ask(Str text, uint8_t category, uint8_t battery, uint32_t &question_id, uint32_t &wait_s);
    // A packet that should go on the air now (first transmission or a repeat), and its destination.
    bool nextOutgoing(uint8_t out[kMaxPayload], size_t &n, uint32_t &to_node, uint32_t &question_id);
    void markSent(uint32_t question_id);
    QuestionInfo questionAt(size_t slot) const;

    // ---- settings the user may change (SPEC 5.6)
    const char *language() const { return cfg_.lang; }
    bool setLanguage(const char *lang);

    // ---- provisioning over the wired link (SPEC 7.3). Refused once locked, except bundle updates.
    bool provisioned() const { return cfg_.locked; }
    bool isRouter() const { return cfg_.router; }
    uint32_t unitId() const { return cfg_.unit_id; }
    bool hasUnitKey() const { return cfg_.has_key; }
    // Step 1: generate key pairs; the caller sends kem().mlkem_pub and kem().x_pub to the station.
    // `seed` (96 bytes) is for tests only; nullptr draws from the platform RNG.
    Result kemBegin(const uint8_t *seed = nullptr);
    const KemState &kem() const { return *kem_; }
    // Step 2: the station's reply. Stores the unit key; `confirm` goes back to the station.
    Result kemFinish(const uint8_t mlkem_ct[kMlkemCtLen], const uint8_t station_x_pub[32], uint32_t unit_id,
                     uint8_t confirm[kKeyConfirmLen]);
    // Root-signed bundle: trust store, channel, regions, role. Must be signed by a PINNED root.
    Result installBundle(Bytes sealed);
    bool radioConfig(RadioConfig &out) const;
    // Latches the provisioned state. Needs a bundle, and a unit key unless the unit is a router.
    Result lock();

    // ---- time
    // Best estimate of "now": the RTC if there is one, else the newest authentic timestamp
    // seen plus the uptime since. Never goes backwards across reboots.
    uint32_t now();

    const TrustStore &trust() const { return trust_; }
    RelayPolicy &relay() { return relay_; }
    void tick(); // housekeeping; call about once a minute

  private:
    struct Config {
        bool locked = false, has_key = false, has_bundle = false, router = false;
        uint32_t unit_id = 0;
        uint8_t unit_key[32] = {0};
        char lang[4] = "en";
        char regions[kMaxRegions][kRegionLen] = {{0}};
        uint8_t n_regions = 0;
        uint32_t bundle_serial = 0, bundle_root = 0;
        uint32_t q_min_interval = 0, q_max_per_day = 0;
        RadioConfig radio;
    };
    struct AlertSlot {
        bool used = false;
        uint32_t epoch = 0;
        AlertInfo info;
    };
    struct FaqSlot {
        uint32_t faq_id = 0, published_at = 0;
    };
    struct Question {
        QuestionInfo info;
        uint32_t ref = 0, last_tx = 0;
        uint8_t tx_count = 0;
        uint8_t packet[kMaxPayload];
        uint8_t len = 0;
    };
    struct Seen {
        uint8_t type = 0;
        uint16_t key_id = 0;
        uint32_t msg_id = 0;
    };

    Result handleMessage(const Header &h, Bytes message, bool from_storage);
    Result handleAlert(const Header &h, Bytes body, const KeyEntry &key, Bytes message, bool from_storage);
    Result handleFaq(const Header &h, Bytes body, const KeyEntry &key, Bytes message, bool from_storage);
    Result handleCancel(const Header &h, Bytes body, const KeyEntry &key);
    Result applyBundle(Bytes sealed, bool from_storage);
    void advanceTime(uint32_t authentic_time);
    bool wasSeen(const Header &h) const;
    void markSeen(const Header &h);
    bool isCancelled(uint16_t key_id, uint32_t msg_id) const;
    void loadConfig();
    void saveConfig();
    void loadState();
    bool saveState();
    void saveQuestions();
    void loadQuestions();
    bool writeSealed(const char *name, const Header &h, Bytes message);

    Storage &storage_;
    Platform &platform_;
    Listener &listener_;
    TrustStore trust_;
    Reassembler reasm_;
    RelayPolicy relay_;
    DupeCounter dupes_;
    QuestionLimiter limiter_;
    Config cfg_;
    KemState *kem_ = nullptr;
    size_t n_pinned_ = 0;
    uint32_t pinned_ids_[kMaxRoots] = {0};

    AlertSlot alerts_[kAlertSlots];
    FaqSlot faq_[kFaqCapacity];
    size_t n_faq_ = 0;
    Question questions_[kQuestionSlots];
    Seen seen_[32];
    size_t seen_next_ = 0;
    struct {
        uint16_t key_id;
        uint32_t msg_id;
    } cancelled_[16] = {};
    size_t cancelled_next_ = 0;

    uint32_t time_floor_ = 0, floor_uptime_ = 0;
    uint32_t next_question_id_ = 1, reserved_question_id_ = 1;
    bool state_dirty_ = false;
    int load_slot_ = -1; // >= 0 while begin() restores alerts into fixed slots

    uint8_t msg_[kMaxRootMessage];           // reassembly output
    uint8_t scratch_[20 + kMaxMessage];      // to-be-signed bytes
};
} // namespace hl
