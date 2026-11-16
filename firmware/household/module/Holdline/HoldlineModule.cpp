// Holdline module: the adapter between Meshtastic and the unit engine (core/hl_unit.h).
// SPDX-License-Identifier: GPL-3.0-only
//
// Everything that decides something lives in core/ and is tested on a host. This file
// only moves packets, applies the locked configuration and serves the local link.
// Upstream names used here were checked against the tag in firmware/household/UPSTREAM;
// NOT YET TESTED ON HARDWARE.
#include "HoldlineModule.h"
#include "HoldlineApplets.h"
#include "HoldlineLocal.h"
#include "HoldlinePinnedKeys.h"
#include "MeshService.h"
#include "NodeDB.h"
#include "Router.h"
#include "configuration.h"
#include "main.h"
#include "mesh/Channels.h"
#include <new>

HoldlineModule *holdlineModule = nullptr;

namespace
{
const meshtastic_PortNum kPort = (meshtastic_PortNum)hl::kPortNum;
constexpr uint8_t kHopLimit = 3; // SPEC 5.3: standard hop-limit handling; the authority's default
constexpr size_t kUploadMax = 24 * 1024;

inline hl::Bytes payloadOf(const meshtastic_MeshPacket &p) { return hl::Bytes(p.decoded.payload.bytes, p.decoded.payload.size); }
inline bool isDecoded(const meshtastic_MeshPacket *p) { return p->which_payload_variant == meshtastic_MeshPacket_decoded_tag; }
} // namespace

void setupHoldline()
{
    if (!holdlineModule)
        holdlineModule = new HoldlineModule();
}

// ------------------------------------------------------------------ hooks
__attribute__((weak)) bool holdlineGatewayMayOriginate(const meshtastic_MeshPacket *) { return false; }

bool holdlineIsOwnPort(const meshtastic_MeshPacket *p) { return isDecoded(p) && p->decoded.portnum == kPort; }

bool holdlineRelayAllowed(const meshtastic_MeshPacket *p)
{
    if (!holdlineModule || !holdlineIsOwnPort(p))
        return false; // SPEC 5.3: everything else is dropped without rebroadcast
    return holdlineModule->unit().shouldRelay(payloadOf(*p), getFrom(p), p->to, isBroadcast(p->to));
}

bool holdlineMayCancelDupe(const meshtastic_MeshPacket *p)
{
    // Only Holdline packets are ever queued for relay, so no port check is needed here
    // (and none is possible: duplicates are filtered before they are decrypted).
    return !holdlineModule || holdlineModule->unit().mayCancelRebroadcast(getFrom(p), p->id);
}

bool holdlineSendAllowed(meshtastic_MeshPacket *p)
{
    if (!isFromUs(p))
        return true; // a relay; holdlineRelayAllowed() already decided
    if (!holdlineModule || !isDecoded(p))
        return false;
    const hl::TrustStore &trust = holdlineModule->unit().trust();
    switch ((int)p->decoded.portnum) {
    case hl::kPortNum: {
        if (holdlineGatewayMayOriginate(p))
            return true;
        // The one thing a unit may originate: its own encrypted question, to a crisis-centre radio.
        hl::Header h;
        return holdlineModule->sendingOwnQuestion() && hl::parseHeader(payloadOf(*p), h) && h.type == hl::kQuestion && !isBroadcast(p->to) &&
               trust.isAuthorityNode(p->to);
    }
    case meshtastic_PortNum_ADMIN_APP:
    case meshtastic_PortNum_ROUTING_APP:
        // Replies and acknowledgements to the authority's remote administration.
        return trust.isAuthorityNode(p->to);
    case meshtastic_PortNum_TEXT_MESSAGE_APP:
        // A text the paired phone addresses to the authority becomes a question. Text to
        // anybody else is user-to-user messaging and stops here.
        if (!isBroadcast(p->to) && trust.isAuthorityNode(p->to) && p->decoded.payload.size > 0) {
            char text[hl::kQuestionTextMax + 1];
            size_t n = p->decoded.payload.size > hl::kQuestionTextMax ? hl::kQuestionTextMax : p->decoded.payload.size;
            memcpy(text, p->decoded.payload.bytes, n);
            text[n] = 0;
            uint32_t wait = 0;
            hl::Result r = holdlineModule->ask(text, 0, wait);
            meshtastic_ClientNotification *cn = clientNotificationPool.allocZeroed();
            if (cn) {
                cn->level = r == hl::Result::Ok ? meshtastic_LogRecord_Level_INFO : meshtastic_LogRecord_Level_WARNING;
                const char *lang = holdlineModule->unit().language();
                if (r == hl::Result::Ok)
                    snprintf(cn->message, sizeof(cn->message), "%s", hl::uiText(hl::Ui::QuestionWaiting, lang));
                else if (r == hl::Result::RateLimited)
                    snprintf(cn->message, sizeof(cn->message), hl::uiText(hl::Ui::QuestionTooSoon, lang), (unsigned)((wait + 59) / 60));
                else
                    snprintf(cn->message, sizeof(cn->message), "Holdline: %s", hl::resultName(r));
                service->sendClientNotification(cn);
            }
        }
        return false;
    default:
        return false; // position, telemetry, node info, waypoints, range test, ...
    }
}

bool holdlineDeliverAllowed(const meshtastic_MeshPacket &mp, RxSource src)
{
    if (holdlineModule)
        holdlineModule->noteSrc(src);
    if (!isDecoded(&mp))
        return false;
    switch ((int)mp.decoded.portnum) {
    case hl::kPortNum:
    case meshtastic_PortNum_ADMIN_APP:   // AdminModule enforces is_managed and the admin key
    case meshtastic_PortNum_ROUTING_APP: // acknowledgements and errors for our own packets
        return true;
    default:
        return false; // SPEC 5.2: foreign text and everything else is neither shown nor passed to the phone
    }
}

// ------------------------------------------------------------------ module
HoldlineModule::HoldlineModule() : SinglePortModule("holdline", kPort), concurrency::OSThread("Holdline")
{
    unit_ = new hl::Unit(holdline::storage(), holdline::platform(), *this);
    unit_->begin(holdline_pinned::kRoots, holdline_pinned::kRootCount);
    LOG_INFO("Holdline %s on %s: %s, unit %08x, %u root(s), %u operational key(s)%s", HOLDLINE_VERSION, HOLDLINE_BOARD,
             unit_->provisioned() ? "provisioned" : "NOT PROVISIONED", (unsigned)unit_->unitId(), (unsigned)unit_->trust().rootCount(),
             (unsigned)unit_->trust().keyCount(), holdline_pinned::kDevKeys ? " [DEVELOPMENT KEYS - NOT FOR DEPLOYMENT]" : "");
    applyLockedConfig();
    holdline::addonsBegin();
    setIntervalFromNow(2000);
}

// SPEC 5.1: region, channel and modem preset come from provisioning; the device is managed;
// position and telemetry are off; Wi-Fi is off. Runs before the radio is initialised.
void HoldlineModule::applyLockedConfig()
{
    bool changed = false, channelsChanged = false;
#define HL_SET(field, value)                                                                                                     \
    do {                                                                                                                         \
        if ((field) != (value)) {                                                                                                \
            (field) = (value);                                                                                                   \
            changed = true;                                                                                                      \
        }                                                                                                                        \
    } while (0)
    HL_SET(config.lora.region, meshtastic_Config_LoRaConfig_RegionCode_EU_868);
    HL_SET(config.lora.use_preset, true);
    HL_SET(config.lora.hop_limit, (uint32_t)kHopLimit);
    HL_SET(config.lora.override_duty_cycle, false);
    HL_SET(config.lora.ignore_mqtt, true);
    HL_SET(config.lora.config_ok_to_mqtt, false);
    HL_SET(config.position.gps_mode, meshtastic_Config_PositionConfig_GpsMode_NOT_PRESENT);
    HL_SET(config.position.position_broadcast_smart_enabled, false);
    HL_SET(config.position.fixed_position, false);
    HL_SET(config.position.position_broadcast_secs, (uint32_t)INT32_MAX);
    HL_SET(config.network.wifi_enabled, false);
    HL_SET(config.network.eth_enabled, false);
    HL_SET(config.device.rebroadcast_mode, meshtastic_Config_DeviceConfig_RebroadcastMode_ALL);
    HL_SET(config.device.node_info_broadcast_secs, (uint32_t)INT32_MAX);
    HL_SET(config.security.debug_log_api_enabled, false);
    HL_SET(config.security.admin_channel_enabled, false);
    HL_SET(moduleConfig.telemetry.device_telemetry_enabled, false);
    HL_SET(moduleConfig.telemetry.environment_measurement_enabled, false);
    HL_SET(moduleConfig.telemetry.air_quality_enabled, false);
    HL_SET(moduleConfig.telemetry.power_measurement_enabled, false);
    HL_SET(moduleConfig.telemetry.health_measurement_enabled, false);
    HL_SET(moduleConfig.mqtt.enabled, false);
    HL_SET(moduleConfig.serial.enabled, false);
    HL_SET(moduleConfig.store_forward.enabled, false);
    HL_SET(moduleConfig.range_test.enabled, false);
    HL_SET(moduleConfig.neighbor_info.enabled, false);
    HL_SET(moduleConfig.external_notification.enabled, false); // the add-ons are driven by this module
    HL_SET(moduleConfig.canned_message.enabled, false);

    hl::RadioConfig rc;
    if (unit_->radioConfig(rc)) {
        HL_SET(config.lora.modem_preset, (meshtastic_Config_LoRaConfig_ModemPreset)rc.modem_preset);
        HL_SET(config.lora.tx_enabled, true);
        HL_SET(config.device.role, rc.router ? meshtastic_Config_DeviceConfig_Role_ROUTER : meshtastic_Config_DeviceConfig_Role_CLIENT);
        if (rc.has_admin_key) {
            if (config.security.admin_key_count != 1 || config.security.admin_key[0].size != 32 ||
                memcmp(config.security.admin_key[0].bytes, rc.admin_key, 32) != 0) {
                config.security.admin_key_count = 1;
                config.security.admin_key[0].size = 32;
                memcpy(config.security.admin_key[0].bytes, rc.admin_key, 32);
                changed = true;
            }
            // Managed: local configuration changes are refused once the unit is locked.
            HL_SET(config.security.is_managed, unit_->provisioned());
        }
        meshtastic_Channel ch = channels.getByIndex(0);
        if (ch.role != meshtastic_Channel_Role_PRIMARY || strncmp(ch.settings.name, rc.channel_name, sizeof(ch.settings.name)) != 0 ||
            ch.settings.psk.size != 32 || memcmp(ch.settings.psk.bytes, rc.channel_psk, 32) != 0) {
            ch.index = 0;
            ch.has_settings = true;
            ch.role = meshtastic_Channel_Role_PRIMARY;
            memset(ch.settings.name, 0, sizeof(ch.settings.name));
            strncpy(ch.settings.name, rc.channel_name, sizeof(ch.settings.name) - 1);
            ch.settings.psk.size = 32;
            memcpy(ch.settings.psk.bytes, rc.channel_psk, 32);
            ch.settings.uplink_enabled = false;
            ch.settings.downlink_enabled = false;
            channels.setChannel(ch);
            channelsChanged = true;
        }
        for (ChannelIndex i = 1; i < channels.getNumChannels(); i++) {
            meshtastic_Channel other = channels.getByIndex(i);
            if (other.role != meshtastic_Channel_Role_DISABLED) {
                other.role = meshtastic_Channel_Role_DISABLED;
                channels.setChannel(other);
                channelsChanged = true;
            }
        }
    } else {
        // Not provisioned: listen only. Nothing leaves the antenna until a bundle is installed.
        HL_SET(config.lora.tx_enabled, false);
    }
#undef HL_SET
    if (channelsChanged)
        channels.onConfigChanged();
    if (changed || channelsChanged)
        nodeDB->saveToDisk(SEGMENT_CONFIG | SEGMENT_MODULECONFIG | SEGMENT_CHANNELS);
}

ProcessMessage HoldlineModule::handleReceived(const meshtastic_MeshPacket &mp)
{
    hl::Bytes payload = payloadOf(mp);
    if (payload.size && payload.data[0] == holdline::kLocalMagic) {
        // Local link frames are accepted from the USB / phone API only, never from the radio.
        if (currentSrc_ == RX_SRC_USER && isToUs(&mp))
            handleLocal(mp);
        return ProcessMessage::STOP;
    }
    if (currentSrc_ == RX_SRC_RADIO && isBroadcast(mp.to)) {
        hl::Result r = unit_->onPacket(payload);
        if (r != hl::Result::Incomplete && r != hl::Result::Duplicate)
            LOG_INFO("Holdline rx type %u from %08x: %s", payload.size > 1 ? payload.data[1] : 0, (unsigned)getFrom(&mp), hl::resultName(r));
    }
    return ProcessMessage::CONTINUE;
}

int32_t HoldlineModule::runOnce()
{
    holdline::addonsPoll();
    uint32_t up = holdline::platform().uptimeSeconds();
    if (rebootPending_ && up >= rebootAt_) {
        rebootPending_ = false;
        rebootAtMsec = millis() + 500; // upstream's deferred reboot
    }
    if (up != lastTick_ && up % 5 == 0) {
        lastTick_ = up;
        sendPendingQuestion();
        if (up % 60 == 0)
            unit_->tick();
    }
    return 100;
}

void HoldlineModule::sendPendingQuestion()
{
    if (!unit_->provisioned() || unit_->isRouter())
        return;
    uint8_t buf[hl::kMaxPayload];
    size_t n = 0;
    uint32_t to = 0, qid = 0;
    if (!unit_->nextOutgoing(buf, n, to, qid))
        return;
    meshtastic_MeshPacket *p = allocDataPacket();
    if (!p)
        return;
    p->to = to;
    p->channel = 0;
    p->want_ack = false; // acknowledgements would be user-to-authority chatter that relays drop anyway
    p->hop_limit = kHopLimit;
    p->decoded.payload.size = (pb_size_t)n;
    memcpy(p->decoded.payload.bytes, buf, n);
    sendingQuestion_ = true;
    ErrorCode e = service->sendToMesh(p, RX_SRC_LOCAL);
    sendingQuestion_ = false;
    if (e == ERRNO_OK) {
        unit_->markSent(qid);
        uiGeneration_++;
        holdlineUiChanged(0);
    } else
        LOG_WARN("Holdline: question %u not sent yet (error %d)", (unsigned)qid, (int)e);
}

hl::Result HoldlineModule::ask(const char *text, uint8_t category, uint32_t &waitSeconds)
{
    uint32_t qid = 0;
    hl::Result r = unit_->ask(hl::Str{text, strlen(text)}, category, holdline::batteryPercent(), qid, waitSeconds);
    uiGeneration_++;
    return r;
}

bool HoldlineModule::cycleLanguage()
{
    bool ok = unit_->setLanguage(hl::nextUiLang(unit_->language()));
    uiGeneration_++;
    return ok;
}

// ------------------------------------------------------------------ events from the engine
void HoldlineModule::announceAlert()
{
    static uint8_t buf[hl::kMaxSealedMessage];
    hl::AlertInfo info;
    hl::Alert a;
    if (!unit_->currentAlert(info, a, buf, sizeof(buf)))
        return;
    hl::Chosen c = hl::chooseText(a, unit_->language());
    // One line for the haptic band, the listening hub and the sign-language screen
    // (hardware/addons/README.md). `tpl` selects the pre-recorded sign-language clip.
    static char line[hl::kMaxMessage + 96];
    snprintf(line, sizeof(line), "HL ALERT sev=%u tpl=%u lang=%.*s orig=%u text=%.*s", info.severity, a.template_code, (int)c.lang.size, c.lang.data,
             c.is_fallback ? 1 : 0, (int)c.text.size, c.text.data);
    holdline::bandSend(line);
    meshtastic_ClientNotification *cn = clientNotificationPool.allocZeroed();
    if (cn) { // the paired phone, if any
        cn->level = info.severity >= hl::kWarning ? meshtastic_LogRecord_Level_WARNING : meshtastic_LogRecord_Level_INFO;
        snprintf(cn->message, sizeof(cn->message), "%.*s", (int)c.text.size, c.text.data);
        service->sendClientNotification(cn);
    }
}

void HoldlineModule::onAlert(uint32_t)
{
    lastEvent_ = Event::Alert;
    uiGeneration_++;
    holdline::haptic(1);
    announceAlert();
    holdlineUiChanged(1);
}

void HoldlineModule::onAlertCancelled(uint32_t msg_id)
{
    lastEvent_ = Event::Cancelled;
    uiGeneration_++;
    char line[48];
    snprintf(line, sizeof(line), "HL CANCEL id=%08x", (unsigned)msg_id);
    holdline::bandSend(line);
    holdlineUiChanged(0);
}

void HoldlineModule::onFaq(uint32_t faq_id, uint32_t question_id)
{
    lastEvent_ = question_id ? Event::Answered : Event::Faq;
    uiGeneration_++;
    holdline::haptic(0);
    static uint8_t buf[hl::kMaxSealedMessage];
    hl::Faq f;
    for (size_t i = 0; i < unit_->faqCount(); i++)
        if (unit_->faqAt(i, f, buf, sizeof(buf)) && f.faq_id == faq_id) {
            hl::ChosenFaq c = hl::chooseFaq(f, unit_->language());
            static char line[hl::kMaxMessage + 96];
            snprintf(line, sizeof(line), "HL FAQ id=%u own=%u lang=%.*s q=%.*s | a=%.*s", (unsigned)faq_id, question_id ? 1 : 0, (int)c.lang.size, c.lang.data,
                     (int)c.question.size, c.question.data, (int)c.answer.size, c.answer.data);
            holdline::bandSend(line);
            break;
        }
    holdlineUiChanged(0);
}

void HoldlineModule::onKeysUpdated(uint32_t root_id, uint32_t serial)
{
    LOG_INFO("Holdline: key bulletin of root %u updated to serial %u", (unsigned)root_id, (unsigned)serial);
    uiGeneration_++;
}

// ------------------------------------------------------------------ local link (firmware/protocol/README.md, "Local link")
void HoldlineModule::reply(uint8_t op, hl::Result status, uint16_t seq, uint16_t total, const uint8_t *data, size_t n)
{
    meshtastic_MeshPacket *p = allocDataPacket();
    if (!p)
        return;
    p->from = nodeDB->getNodeNum();
    p->to = nodeDB->getNodeNum();
    uint8_t *b = p->decoded.payload.bytes;
    b[0] = holdline::kLocalMagic;
    b[1] = (uint8_t)(op | 0x80);
    b[2] = (uint8_t)status;
    hl::wr16(b + 3, seq);
    hl::wr16(b + 5, total);
    if (n > holdline::kLocalReplyData)
        n = holdline::kLocalReplyData;
    if (n)
        memcpy(b + 7, data, n);
    p->decoded.payload.size = (pb_size_t)(7 + n);
    service->sendToPhone(p);
}

void HoldlineModule::handleLocal(const meshtastic_MeshPacket &mp)
{
    using namespace holdline;
    hl::Bytes in = payloadOf(mp);
    if (in.size < kLocalHeader)
        return;
    const uint8_t op = in.data[1];
    const uint16_t seq = hl::rd16(in.data + 2), total = hl::rd16(in.data + 4);
    hl::Bytes data = in.from(kLocalHeader);
    hl::Result r = hl::Result::Unsupported;
    uint8_t out[kLocalReplyData];
    size_t outLen = 0;
    uint16_t outTotal = 0;
    hl::Bytes up(upload_, uploadLen_);

    switch (op) {
    case kOpHello: {
        out[0] = (uint8_t)((unit_->provisioned() ? 1 : 0) | (unit_->hasUnitKey() ? 2 : 0) | (unit_->isRouter() ? 8 : 0) | (holdline_pinned::kDevKeys ? 0x80 : 0));
        hl::RadioConfig rc;
        if (unit_->radioConfig(rc))
            out[0] |= 4;
        hl::wr32(out + 1, unit_->unitId());
        hl::Version v;
        hl::parseVersion(HOLDLINE_VERSION, strlen(HOLDLINE_VERSION), v);
        hl::wr32(out + 5, hl::packVersion(v));
        memcpy(out + 9, unit_->language(), 2);
        hl::wr32(out + 11, nodeDB->getNodeNum());
        hl::wr32(out + 15, hl::packVersion(holdline::firmwareFloor()));
        size_t bl = strlen(HOLDLINE_BOARD);
        memcpy(out + 19, HOLDLINE_BOARD, bl);
        outLen = 19 + bl;
        r = hl::Result::Ok;
        break;
    }
    case kOpKemBegin:
        r = unit_->kemBegin();
        if (r == hl::Result::Ok) {
            delete[] download_;
            downloadLen_ = hl::kMlkemPubLen + 32;
            download_ = new (std::nothrow) uint8_t[downloadLen_];
            if (!download_) {
                r = hl::Result::Internal;
                break;
            }
            memcpy(download_, unit_->kem().mlkem_pub, hl::kMlkemPubLen);
            memcpy(download_ + hl::kMlkemPubLen, unit_->kem().x_pub, 32);
            outTotal = (uint16_t)((downloadLen_ + kLocalReplyData - 1) / kLocalReplyData);
        }
        break;
    case kOpRead: {
        size_t off = (size_t)seq * kLocalReplyData;
        if (!download_ || off >= downloadLen_) {
            r = hl::Result::Malformed;
            break;
        }
        outLen = downloadLen_ - off > kLocalReplyData ? kLocalReplyData : downloadLen_ - off;
        memcpy(out, download_ + off, outLen);
        outTotal = (uint16_t)((downloadLen_ + kLocalReplyData - 1) / kLocalReplyData);
        r = hl::Result::Ok;
        break;
    }
    case kOpWrite:
        if (seq == 0) {
            delete[] upload_;
            upload_ = nullptr;
            uploadLen_ = 0;
            uploadNext_ = 0;
            uploadCap_ = (size_t)total * kLocalData;
            if (total == 0 || uploadCap_ > kUploadMax) {
                r = hl::Result::TooLarge;
                break;
            }
            upload_ = new (std::nothrow) uint8_t[uploadCap_];
        }
        if (!upload_ || seq != uploadNext_ || uploadLen_ + data.size > uploadCap_) {
            r = hl::Result::Malformed;
            break;
        }
        memcpy(upload_ + uploadLen_, data.data, data.size);
        uploadLen_ += data.size;
        uploadNext_++;
        r = hl::Result::Ok;
        break;
    case kOpKemFinish:
        if (up.size != hl::kMlkemCtLen + 32 + 4) {
            r = hl::Result::Malformed;
            break;
        }
        r = unit_->kemFinish(up.data, up.data + hl::kMlkemCtLen, hl::rd32(up.data + hl::kMlkemCtLen + 32), out);
        if (r == hl::Result::Ok)
            outLen = hl::kKeyConfirmLen;
        break;
    case kOpBundle:
        r = unit_->installBundle(up);
        if (r == hl::Result::Ok)
            applyLockedConfig();
        break;
    case kOpSealed:
        r = unit_->onSealed(up);
        break;
    case kOpSetLang:
        if (data.size == 2) {
            char lang[3] = {(char)data.data[0], (char)data.data[1], 0};
            r = unit_->setLanguage(lang) ? hl::Result::Ok : hl::Result::Malformed;
            uiGeneration_++;
        } else
            r = hl::Result::Malformed;
        break;
    case kOpLock:
        r = unit_->lock();
        if (r == hl::Result::Ok) {
            applyLockedConfig();
            rebootPending_ = true; // the new channel and role take effect after a restart
            rebootAt_ = holdline::platform().uptimeSeconds() + 3;
        }
        break;
    case kOpAsk:
        if (data.size >= 2 && data.size <= 1 + hl::kQuestionTextMax) {
            char text[hl::kQuestionTextMax + 1];
            memcpy(text, data.data + 1, data.size - 1);
            text[data.size - 1] = 0;
            uint32_t wait = 0;
            r = ask(text, data.data[0], wait);
            hl::wr32(out, wait);
            outLen = 4;
        } else
            r = hl::Result::Malformed;
        break;
    case kOpUpdateBegin:
        if (data.size == 4 && hl::rd32(data.data) < up.size)
            r = holdline::updateBegin(hl::Bytes(up.data, hl::rd32(data.data)), up.from(hl::rd32(data.data)));
        else
            r = hl::Result::Malformed;
        break;
    case kOpUpdateData:
        r = holdline::updateWrite(data);
        break;
    case kOpUpdateEnd:
        r = holdline::updateFinish();
        if (r == hl::Result::Ok) {
            rebootPending_ = true;
            rebootAt_ = holdline::platform().uptimeSeconds() + 3;
        }
        break;
    default:
        break;
    }
    if (op != kOpWrite && op != kOpRead && op != kOpUpdateData && op != kOpHello)
        LOG_INFO("Holdline local op %02x: %s", op, hl::resultName(r));
    if (op == kOpKemFinish || op == kOpBundle || op == kOpSealed || op == kOpUpdateBegin) { // the upload is consumed
        delete[] upload_;
        upload_ = nullptr;
        uploadLen_ = 0;
    }
    reply(op, r, seq, outTotal, out, outLen);
}
