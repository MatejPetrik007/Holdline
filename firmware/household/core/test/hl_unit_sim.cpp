// A Holdline unit on stdin/stdout: the real unit engine and local link, without a radio.
// SPDX-License-Identifier: GPL-3.0-only
//
//   hl_unit_sim <vectors.txt> [node-number-hex]
//
// For testing tooling that talks to units (provisioning stations, consoles, updaters)
// without hardware. It pins the THROWAWAY root of the test vectors. One command per line,
// byte strings in hex; every command answers with exactly one line starting with its name,
// preceded by any "event ..." lines it caused.
//
//   local <frame>            local-link request (core/hl_local.h)      -> local <reply frame>
//   radio <packet>           a Holdline broadcast heard on the radio   -> radio <result>
//   relay <from> <to> <pkt>  would the unit rebroadcast it? (to = ffffffff for broadcast) -> relay 0|1
//   tx                       next packet the unit wants to transmit    -> tx <to> <packet> | tx none
//   show                     what the alert screen shows               -> show <msg_id> <severity> <lang> <fallback 0|1> <expired 0|1> <text> | show none
//   faq <index>              FAQ entry, 0 = newest                     -> faq <faq_id> <lang> <question> <answer> | faq none
//   questions                state of the unit's own questions         -> questions <id>:<state>,...
//   state                                                              -> state provisioned=0|1 key=0|1 router=0|1 unit=<hex> lang=<xx> roots=<n> keys=<n> restart=<n>
//   rtc <unix seconds>       set the wall clock (0 = none)             -> rtc ok
//   advance <seconds>        let time pass                             -> advance ok
//   reboot                   power cycle, keeping the flash            -> reboot ok
#include "../hl_local.h"
#include "test_util.h"
#include <iostream>

using namespace hl;

namespace
{
struct SimHost : LocalHost, Listener {
    Unit *unit = nullptr;
    uint32_t node = 0x51a70001;
    int restarts = 0;
    uint32_t nodeNumber() override { return node; }
    const char *version() override { return "0.0.0-sim"; }
    const char *board() override { return "host-sim"; }
    bool devKeys() override { return true; }
    Version firmwareFloor() override { return Version(); }
    void configChanged() override {}
    void restartSoon() override { restarts++; }
    Result ask(const char *text, uint8_t category, uint32_t &wait) override
    {
        uint32_t qid;
        return unit->ask(Str{text, strlen(text)}, category, 77, qid, wait);
    }
    Result updateBegin(Bytes, Bytes) override { return Result::Unsupported; }
    Result updateWrite(Bytes) override { return Result::Unsupported; }
    Result updateFinish() override { return Result::Unsupported; }
    void onAlert(uint32_t id) override { printf("event alert %08x\n", id); }
    void onAlertCancelled(uint32_t id) override { printf("event cancelled %08x\n", id); }
    void onFaq(uint32_t id, uint32_t q) override { printf("event faq %u %u\n", id, q); }
    void onKeysUpdated(uint32_t root, uint32_t serial) override { printf("event keys %u %u\n", root, serial); }
};

std::string hexOf(const uint8_t *p, size_t n) { return n ? tohex(p, n) : std::string("-"); }
std::string hexOf(Str s) { return hexOf((const uint8_t *)s.data, s.size); }
} // namespace

int main(int argc, char **argv)
{
    if (argc < 2) {
        fprintf(stderr, "usage: %s <vectors.txt> [node-number-hex]\n", argv[0]);
        return 2;
    }
    V.load(argv[1]);
    static MemStorage storage;
    static FakePlatform platform;
    static SimHost host;
    if (argc > 2)
        host.node = (uint32_t)strtoul(argv[2], nullptr, 16);
    static RootKey pinned;
    pinned.root_id = V.num("roots.cz.root_id");
    memcpy(pinned.ed25519, V.bytes("roots.cz.ed25519_public").data(), kEdPubLen);
    memcpy(pinned.mldsa65, V.bytes("roots.cz.mldsa65_public").data(), kMldsaPubLen);
    LocalLink *link = nullptr;
    auto boot = [&]() {
        delete link;
        delete host.unit;
        host.unit = new Unit(storage, platform, host);
        host.unit->begin(&pinned, 1);
        link = new LocalLink(*host.unit, host);
    };
    boot();
    setvbuf(stdout, nullptr, _IOLBF, 0);
    static uint8_t buf[kMaxSealedMessage];
    std::string line;
    while (std::getline(std::cin, line)) {
        std::istringstream in(line);
        std::string cmd, a, b, c;
        in >> cmd >> a >> b >> c;
        Unit &u = *host.unit;
        if (cmd == "local") {
            auto req = unhex(a);
            uint8_t reply[kMaxPayload];
            size_t n = link->handle(B(req), reply);
            printf("local %s\n", hexOf(reply, n).c_str());
        } else if (cmd == "radio") {
            auto p = unhex(a);
            printf("radio %s\n", resultName(u.onPacket(B(p))));
        } else if (cmd == "relay") {
            auto p = unhex(c);
            uint32_t to = (uint32_t)strtoul(b.c_str(), nullptr, 16);
            printf("relay %d\n", u.shouldRelay(B(p), (uint32_t)strtoul(a.c_str(), nullptr, 16), to, to == 0xffffffffu) ? 1 : 0);
        } else if (cmd == "tx") {
            uint8_t out[kMaxPayload];
            size_t n = 0;
            uint32_t to = 0, qid = 0;
            if (u.nextOutgoing(out, n, to, qid)) {
                u.markSent(qid);
                printf("tx %08x %s\n", to, hexOf(out, n).c_str());
            } else
                printf("tx none\n");
        } else if (cmd == "show") {
            AlertInfo info;
            Alert al;
            if (u.currentAlert(info, al, buf, sizeof(buf))) {
                Chosen ch = chooseText(al, u.language());
                printf("show %08x %u %.*s %d %d %s\n", info.msg_id, info.severity, (int)ch.lang.size, ch.lang.data, ch.is_fallback ? 1 : 0, info.expired ? 1 : 0, hexOf(ch.text).c_str());
            } else
                printf("show none\n");
        } else if (cmd == "faq") {
            Faq f;
            if (u.faqAt((size_t)strtoul(a.c_str(), nullptr, 10), f, buf, sizeof(buf))) {
                ChosenFaq ch = chooseFaq(f, u.language());
                printf("faq %u %.*s %s %s\n", f.faq_id, (int)ch.lang.size, ch.lang.data, hexOf(ch.question).c_str(), hexOf(ch.answer).c_str());
            } else
                printf("faq none\n");
        } else if (cmd == "questions") {
            static const char *names[] = {"empty", "waiting", "sent", "answered"};
            std::string out;
            for (size_t i = 0; i < kQuestionSlots; i++) {
                QuestionInfo q = u.questionAt(i);
                if (q.state != QuestionState::Empty)
                    out += (out.empty() ? "" : ",") + std::to_string(q.question_id) + ":" + names[(int)q.state];
            }
            printf("questions %s\n", out.empty() ? "-" : out.c_str());
        } else if (cmd == "state") {
            printf("state provisioned=%d key=%d router=%d unit=%08x lang=%s roots=%zu keys=%zu restart=%d\n", u.provisioned(), u.hasUnitKey(), u.isRouter(), u.unitId(),
                   u.language(), u.trust().rootCount(), u.trust().keyCount(), host.restarts);
        } else if (cmd == "rtc") {
            platform.rtc = (uint32_t)strtoul(a.c_str(), nullptr, 10);
            printf("rtc ok\n");
        } else if (cmd == "advance") {
            uint32_t d = (uint32_t)strtoul(a.c_str(), nullptr, 10);
            platform.uptime += d;
            if (platform.rtc)
                platform.rtc += d;
            u.tick();
            printf("advance ok\n");
        } else if (cmd == "reboot") {
            boot();
            printf("reboot ok\n");
        } else if (!cmd.empty())
            printf("%s error unknown command\n", cmd.c_str());
    }
    delete link;
    delete host.unit;
    return 0;
}
