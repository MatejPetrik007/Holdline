// SPDX-License-Identifier: GPL-3.0-only
#pragma once
#include "Holdline.h"
#include "concurrency/OSThread.h"
#include "core/hl_manifest.h"
#include "core/hl_unit.h"
#include "mesh/SinglePortModule.h"

#ifndef HOLDLINE_VERSION
#define HOLDLINE_VERSION "0.0.0-dev"
#endif
#ifndef HOLDLINE_BOARD
#define HOLDLINE_BOARD "unknown"
#endif

class HoldlineModule : public SinglePortModule, private concurrency::OSThread, private hl::Listener
{
  public:
    HoldlineModule();
    hl::Unit &unit() { return *unit_; }

    // Generation counter: UI code redraws when it changes.
    uint32_t uiGeneration() const { return uiGeneration_; }
    // Last notable event, for the applets.
    enum class Event : uint8_t { None, Alert, Cancelled, Faq, Answered };
    Event lastEvent() const { return lastEvent_; }

    // Ask a predefined (category 1..5) or free-text (category 0) question. Returns the
    // result and, when rate limited, the wait in seconds.
    hl::Result ask(const char *text, uint8_t category, uint32_t &waitSeconds);
    bool cycleLanguage();
    void noteSrc(RxSource src) { currentSrc_ = src; }
    bool sendingOwnQuestion() const { return sendingQuestion_; }
    bool textSizeSmall = false; // accessibility setting (SPEC 5.6), toggled on the alert screen

  protected:
    ProcessMessage handleReceived(const meshtastic_MeshPacket &mp) override;
    int32_t runOnce() override;

  private:
    // hl::Listener
    void onAlert(uint32_t msg_id) override;
    void onAlertCancelled(uint32_t msg_id) override;
    void onFaq(uint32_t faq_id, uint32_t question_id) override;
    void onKeysUpdated(uint32_t root_id, uint32_t serial) override;

    void applyLockedConfig();
    void sendPendingQuestion();
    void handleLocal(const meshtastic_MeshPacket &mp);
    void reply(uint8_t op, hl::Result status, uint16_t seq, uint16_t total, const uint8_t *data, size_t n);
    void announceAlert();

    hl::Unit *unit_ = nullptr;
    RxSource currentSrc_ = RX_SRC_RADIO;
    bool sendingQuestion_ = false;
    uint32_t uiGeneration_ = 1;
    Event lastEvent_ = Event::None;
    uint32_t lastTick_ = 0;
    bool rebootPending_ = false;
    uint32_t rebootAt_ = 0;

    // Local link (USB / paired phone): one upload buffer and one download buffer.
    uint8_t *upload_ = nullptr;
    size_t uploadLen_ = 0, uploadCap_ = 0;
    uint16_t uploadNext_ = 0;
    uint8_t *download_ = nullptr;
    size_t downloadLen_ = 0;
};

extern HoldlineModule *holdlineModule;

// ---- board glue implemented in the other files of this directory
namespace holdline
{
hl::Storage &storage();
hl::Platform &platform();
void addonsBegin();
void addonsPoll(); // called about every 100 ms
// kind: 0 = message (short-short), 1 = alert (long), 2 = character echo (one short pulse)
void haptic(uint8_t kind);
void bandSend(const char *line);
uint8_t batteryPercent();

// Signed update (SPEC 7.1). begin(): manifest || signature JSON, as uploaded.
hl::Result updateBegin(hl::Bytes manifest, hl::Bytes signature);
hl::Result updateWrite(hl::Bytes chunk);
hl::Result updateFinish(); // verifies size and SHA-256, switches the boot partition
hl::Version firmwareFloor();
} // namespace holdline
