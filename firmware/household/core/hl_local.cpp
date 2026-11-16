// SPDX-License-Identifier: GPL-3.0-only
#include "hl_local.h"
#include <new>

namespace hl
{
LocalLink::~LocalLink()
{
    delete[] upload_;
    delete[] download_;
}

size_t LocalLink::handle(Bytes in, uint8_t reply[kMaxPayload])
{
    if (in.size < kLocalHeader || in.size > kMaxPayload || in.data[0] != kLocalMagic || (in.data[1] & 0x80))
        return 0;
    const uint8_t op = in.data[1];
    const uint16_t seq = rd16(in.data + 2), total = rd16(in.data + 4);
    Bytes data = in.from(kLocalHeader);
    Result r = Result::Unsupported;
    uint8_t *out = reply + kLocalReplyHeader;
    size_t outLen = 0;
    uint16_t outTotal = 0;
    Bytes up(upload_, upload_len_);

    switch (op) {
    case kOpHello: {
        RadioConfig rc;
        out[0] = (uint8_t)((unit_.provisioned() ? kHelloProvisioned : 0) | (unit_.hasUnitKey() ? kHelloHasKey : 0) |
                           (unit_.radioConfig(rc) ? kHelloHasBundle : 0) | (unit_.isRouter() ? kHelloRouter : 0) | (host_.devKeys() ? kHelloDevKeys : 0));
        wr32(out + 1, unit_.unitId());
        Version v;
        parseVersion(host_.version(), strlen(host_.version()), v);
        wr32(out + 5, packVersion(v));
        memcpy(out + 9, unit_.language(), 2);
        wr32(out + 11, host_.nodeNumber());
        wr32(out + 15, packVersion(host_.firmwareFloor()));
        size_t bl = strlen(host_.board());
        if (bl > 48)
            bl = 48;
        memcpy(out + 19, host_.board(), bl);
        outLen = 19 + bl;
        r = Result::Ok;
        break;
    }
    case kOpKemBegin:
        r = unit_.kemBegin();
        if (r == Result::Ok) {
            delete[] download_;
            download_len_ = kMlkemPubLen + 32;
            download_ = new (std::nothrow) uint8_t[download_len_];
            if (!download_) {
                r = Result::Internal;
                break;
            }
            memcpy(download_, unit_.kem().mlkem_pub, kMlkemPubLen);
            memcpy(download_ + kMlkemPubLen, unit_.kem().x_pub, 32);
            outTotal = (uint16_t)((download_len_ + kLocalReplyData - 1) / kLocalReplyData);
        }
        break;
    case kOpRead: {
        size_t off = (size_t)seq * kLocalReplyData;
        if (!download_ || off >= download_len_) {
            r = Result::Malformed;
            break;
        }
        outLen = download_len_ - off > kLocalReplyData ? kLocalReplyData : download_len_ - off;
        memcpy(out, download_ + off, outLen);
        outTotal = (uint16_t)((download_len_ + kLocalReplyData - 1) / kLocalReplyData);
        r = Result::Ok;
        break;
    }
    case kOpWrite:
        if (seq == 0) {
            delete[] upload_;
            upload_ = nullptr;
            upload_len_ = 0;
            upload_next_ = 0;
            upload_cap_ = (size_t)total * kLocalData;
            if (total == 0 || upload_cap_ > kLocalUploadMax) {
                r = Result::TooLarge;
                break;
            }
            upload_ = new (std::nothrow) uint8_t[upload_cap_];
        }
        if (!upload_ || seq != upload_next_ || data.size == 0 || upload_len_ + data.size > upload_cap_) {
            r = Result::Malformed;
            break;
        }
        memcpy(upload_ + upload_len_, data.data, data.size);
        upload_len_ += data.size;
        upload_next_++;
        r = Result::Ok;
        break;
    case kOpKemFinish:
        if (up.size != kMlkemCtLen + 32 + 4) {
            r = Result::Malformed;
            break;
        }
        r = unit_.kemFinish(up.data, up.data + kMlkemCtLen, rd32(up.data + kMlkemCtLen + 32), out);
        if (r == Result::Ok)
            outLen = kKeyConfirmLen;
        break;
    case kOpBundle:
        r = unit_.installBundle(up);
        if (r == Result::Ok)
            host_.configChanged();
        break;
    case kOpSealed:
        r = unit_.onSealed(up);
        break;
    case kOpSetLang:
        if (data.size == 2) {
            char lang[3] = {(char)data.data[0], (char)data.data[1], 0};
            r = unit_.setLanguage(lang) ? Result::Ok : Result::Malformed;
            host_.languageChanged();
        } else
            r = Result::Malformed;
        break;
    case kOpLock:
        r = unit_.lock();
        if (r == Result::Ok) {
            host_.configChanged();
            host_.restartSoon(); // the new channel and role take effect after a restart
        }
        break;
    case kOpAsk:
        if (data.size >= 2 && data.size <= 1 + kQuestionTextMax) {
            char text[kQuestionTextMax + 1];
            memcpy(text, data.data + 1, data.size - 1);
            text[data.size - 1] = 0;
            uint32_t wait = 0;
            r = host_.ask(text, data.data[0], wait);
            wr32(out, wait);
            outLen = 4;
        } else
            r = Result::Malformed;
        break;
    case kOpUpdateBegin:
        if (data.size == 4 && rd32(data.data) > 0 && rd32(data.data) < up.size)
            r = host_.updateBegin(Bytes(up.data, rd32(data.data)), up.from(rd32(data.data)));
        else
            r = Result::Malformed;
        break;
    case kOpUpdateData:
        r = host_.updateWrite(data);
        break;
    case kOpUpdateEnd:
        r = host_.updateFinish();
        if (r == Result::Ok)
            host_.restartSoon();
        break;
    default:
        break;
    }
    if (op == kOpKemFinish || op == kOpBundle || op == kOpSealed || op == kOpUpdateBegin) { // the upload is consumed
        delete[] upload_;
        upload_ = nullptr;
        upload_len_ = 0;
    }
    reply[0] = kLocalMagic;
    reply[1] = (uint8_t)(op | 0x80);
    reply[2] = (uint8_t)r;
    wr16(reply + 3, seq);
    wr16(reply + 5, outTotal);
    return kLocalReplyHeader + outLen;
}
} // namespace hl
