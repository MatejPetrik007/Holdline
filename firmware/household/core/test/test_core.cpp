// Host tests of the Holdline core against the published test vectors.
// SPDX-License-Identifier: GPL-3.0-only
//
//   test_core <vectors.txt> <repo-root>
//
// Everything is checked against firmware/protocol/test-vectors/vectors.txt, which the
// JavaScript reference codec generates: two independent implementations, same bytes.
#include "test_util.h"

using namespace hl;

static void testHash()
{
    uint8_t d[32];
    sha256(Bytes((const uint8_t *)"abc", 3), d);
    CHECK_HEX(d, 32, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    std::vector<uint8_t> big(1000000, 'a');
    sha256(Bytes(big.data(), big.size()), d);
    CHECK_HEX(d, 32, "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0");
    // RFC 4231 test case 2
    HmacSha256 h((const uint8_t *)"Jefe", 4);
    h.update((const uint8_t *)"what do ya want for nothing?", 28);
    h.finish(d);
    CHECK_HEX(d, 32, "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843");
    // RFC 5869 test case 1
    auto ikm = unhex("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b"), salt = unhex("000102030405060708090a0b0c"), info = unhex("f0f1f2f3f4f5f6f7f8f9");
    uint8_t okm[42];
    hkdfSha256(B(ikm), B(salt), B(info), okm, 42);
    CHECK_HEX(okm, 42, "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865");
}

static void testHeaderAndDecode()
{
    auto p = V.bytes("alerts.pl_only.packets.0");
    Header h;
    CHECK(parseHeader(B(p), h));
    CHECK_EQ(h.type, kAlert);
    CHECK_EQ(h.msg_id, V.num("alerts.pl_only.header.msg_id"));
    CHECK_EQ(h.key_id, V.num("alerts.pl_only.header.key_id"));
    CHECK_EQ(h.epoch, V.num("alerts.pl_only.header.epoch"));
    CHECK_EQ(h.parts, 1);
    uint8_t out[kHeaderLen];
    writeHeader(h, out);
    CHECK(memcmp(out, p.data(), kHeaderLen) == 0);
    p[0] = 2; // other protocol version
    CHECK(!parseHeader(B(p), h));
    CHECK(!parseHeader(Bytes(p.data(), 13), h));

    for (const char *name : {"pl_only", "pl_cs", "all_langs", "tesin"}) {
        std::string k = std::string("alerts.") + name;
        auto body = V.bytes(k + ".body");
        Alert a;
        CHECK(decodeAlert(B(body), a));
        CHECK_EQ(a.severity, V.num(k + ".fields.severity"));
        CHECK_EQ(a.issued_at, V.num(k + ".fields.issued_at"));
        CHECK_EQ(a.expires_at, V.num(k + ".fields.expires_at"));
        CHECK_EQ(a.template_code, V.num(k + ".fields.template_code"));
        CHECK(str(a.original_lang) == V.str(k + ".fields.original_lang"));
        CHECK_EQ(a.n_texts, V.num(k + ".fields.texts.#"));
        for (size_t i = 0; i < a.n_texts; i++) {
            CHECK(str(a.texts[i].lang) == V.str(k + ".fields.texts." + std::to_string(i) + ".lang"));
            CHECK(str(a.texts[i].text) == V.str(k + ".fields.texts." + std::to_string(i) + ".text"));
        }
        // Truncating the body anywhere must never crash and never decode to the same alert.
        for (size_t cut = 0; cut < body.size(); cut += 7) {
            Alert t;
            decodeAlert(Bytes(body.data(), cut), t);
        }
    }
    auto fb = V.bytes("faq.body");
    Faq f;
    CHECK(decodeFaq(B(fb), f));
    CHECK_EQ(f.faq_id, V.num("faq.fields.faq_id"));
    CHECK_EQ(f.answers_question_ref, V.num("faq.fields.answers_question_ref"));
    CHECK_EQ(f.n_entries, 3);
    CHECK(str(f.entries[1].answer) == V.str("faq.fields.entries.1.answer"));
    auto kb = V.bytes("keys.pl_old.body");
    Keys *k = new Keys();
    CHECK(decodeKeys(B(kb), *k));
    CHECK_EQ(k->serial, 4);
    CHECK_EQ(k->n_keys, 2);
    CHECK_EQ(k->keys[1].key_id, 0x0202);
    CHECK_EQ(k->keys[1].node_ids[0], 0x43430003u);
    CHECK(strcmp(k->keys[0].scope[1], "CZ-0803") == 0);
    CHECK(memcmp(k->keys[0].public_key, V.bytes("operational.cieszyn.public").data(), 32) == 0);
    delete k;
    auto bb = V.bytes("bundle.body");
    Bundle *b = new Bundle();
    CHECK(decodeBundle(B(bb), *b));
    CHECK(str(b->channel_name) == "OLZA");
    CHECK_EQ(b->n_extra_roots, 1);
    CHECK_EQ(b->n_keys, 2);
    CHECK_EQ(b->question_max_per_day, 10);
    delete b;

    CHECK(utf8Valid("Žluťoučký kůň", strlen("Žluťoučký kůň")));
    CHECK(!utf8Valid("\xc3\x28", 2));
    CHECK(!utf8Valid("\xed\xa0\x80", 3)); // surrogate
    CHECK(!utf8Valid("\xc0\xaf", 2));     // overlong
    CHECK(!utf8Valid("a\0b", 3));
}

static RootKey rootFromVectors(const std::string &name)
{
    RootKey r;
    r.root_id = V.num("roots." + name + ".root_id");
    memcpy(r.ed25519, V.bytes("roots." + name + ".ed25519_public").data(), kEdPubLen);
    memcpy(r.mldsa65, V.bytes("roots." + name + ".mldsa65_public").data(), kMldsaPubLen);
    return r;
}

static void testTrust()
{
    TrustStore *t = new TrustStore();
    RootKey cz = rootFromVectors("cz"), pl = rootFromVectors("pl");
    CHECK(t->addRoot(cz));
    CHECK(t->addRoot(cz)); // same key again is fine
    RootKey bad = cz;
    bad.ed25519[0] ^= 1;
    CHECK(!t->addRoot(bad)); // same id, different key

    Header h;
    Bytes m;
    // Valid Ed25519 half, broken ML-DSA half: must fail. (Checked before the real bulletin
    // is installed; afterwards the same serial is dropped as a duplicate without any crypto.)
    auto half = V.bytes("negative.keys_only_ed25519_valid.sealed");
    CHECK(unseal(B(half), h, m));
    CHECK(t->installKeys(h, m) == Result::BadSignature);
    CHECK_EQ(t->serial(1), 0);
    auto czB = V.bytes("keys.cz.sealed");
    CHECK(unseal(B(czB), h, m));
    CHECK(t->installKeys(h, m) == Result::Ok);
    CHECK(t->installKeys(h, m) == Result::Duplicate);
    CHECK_EQ(t->serial(1), 12);
    const KeyEntry *c[4];
    CHECK_EQ(t->findKeys(0x0101, 7, c, 4), 1);
    CHECK_EQ(t->findKeys(0x0101, 8, c, 4), 0);
    CHECK(t->isAuthorityNode(0x43430011));
    CHECK(!t->isAuthorityNode(0x43430001)); // PL root not trusted yet

    auto plB = V.bytes("keys.pl.sealed");
    CHECK(unseal(B(plB), h, m));
    CHECK(t->installKeys(h, m) == Result::UnknownKey);
    CHECK(t->addRoot(pl));
    CHECK(t->installKeys(h, m) == Result::Ok);
    CHECK(t->isAuthorityNode(0x43430001));

    for (const char *n : {"keys_forged_root", "keys_rollback"}) {
        auto s = V.bytes(std::string("negative.") + n + ".sealed");
        CHECK(unseal(B(s), h, m));
        Result r = t->installKeys(h, m);
        CHECK_MSG(V.str(std::string("negative.") + n + ".expect") == resultName(r), n);
    }
    // The forged bulletin carried serial 99: it must not have moved the serial.
    CHECK_EQ(t->serial(1), 12);

    const char regions[2][kRegionLen] = {"CZ-0803", "CZ"};
    uint32_t node = 0;
    CHECK(t->authorityNodeFor(regions, 2, 0, node));
    CHECK_EQ(node, 0x43430011u); // Český Těšín's own crisis centre first
    CHECK(t->authorityNodeFor(regions, 2, 1, node));
    CHECK_EQ(node, 0x43430001u); // then Cieszyn, whose scope also covers CZ-0803
    delete t;
}

static void testQuestionAndKem()
{
    // Unit side of the hybrid KEM with the vector's randomness.
    KemState *st = new KemState();
    std::vector<uint8_t> seed = V.bytes("kem.unit_mlkem_coins"), xs = V.bytes("kem.unit_x25519_secret");
    seed.insert(seed.end(), xs.begin(), xs.end());
    CHECK(kemBegin(*st, seed.data()));
    CHECK(memcmp(st->mlkem_pub, V.bytes("kem.unit_mlkem_public").data(), kMlkemPubLen) == 0);
    CHECK(memcmp(st->x_pub, V.bytes("kem.unit_x25519_public").data(), 32) == 0);
    uint8_t key[32], confirm[kKeyConfirmLen];
    CHECK(kemFinish(*st, V.bytes("kem.station_mlkem_ciphertext").data(), V.bytes("kem.station_x25519_public").data(), V.num("kem.unit_id"), key, confirm));
    CHECK_HEX(key, 32, V.raw("kem.key").c_str());
    CHECK_HEX(confirm, kKeyConfirmLen, V.raw("kem.confirm").c_str());
    CHECK(!st->active);
    // A small-order X25519 point from the "station" must be refused.
    CHECK(kemBegin(*st, seed.data()));
    uint8_t zero[32] = {0};
    CHECK(!kemFinish(*st, V.bytes("kem.station_mlkem_ciphertext").data(), zero, 1, key, confirm));
    delete st;

    auto ukey = V.bytes("unit.key");
    std::string text = V.str("question.fields.text");
    uint8_t pkt[kMaxPayload];
    size_t n = 0;
    CHECK(sealQuestion(ukey.data(), V.num("unit.unit_id"), V.num("question.fields.question_id"), "cs", (uint8_t)V.num("question.fields.category"),
                       (uint8_t)V.num("question.fields.battery"), Str{text.data(), text.size()}, pkt, n) == Result::Ok);
    auto expect = V.bytes("question.packet");
    CHECK_EQ(n, expect.size());
    CHECK(memcmp(pkt, expect.data(), n) == 0);
    CHECK_EQ(questionRef(ukey.data(), V.num("unit.unit_id"), V.num("question.fields.question_id")), V.num("question.ref"));

    // 200 bytes of text is the limit and still fits one packet.
    std::string longText(200, 'x');
    CHECK(sealQuestion(ukey.data(), 1, 1, "cs", 0, kBatteryUnknown, Str{longText.data(), 200}, pkt, n) == Result::Ok);
    CHECK(n <= kMaxPayload);
    longText.push_back('x');
    CHECK(sealQuestion(ukey.data(), 1, 1, "cs", 0, kBatteryUnknown, Str{longText.data(), 201}, pkt, n) == Result::TooLarge);

    // Authority-side opening (test only): the tampered vectors must fail authentication.
    auto open = [&](const std::vector<uint8_t> &p) {
        Header h;
        if (!parseHeader(B(p), h) || h.type != kQuestion)
            return false;
        uint8_t nonce[12] = {0};
        wr32(nonce, h.epoch);
        wr32(nonce + 4, h.msg_id);
        nonce[11] = 1;
        size_t ct = p.size() - kHeaderLen - kGcmTagLen;
        std::vector<uint8_t> pt(ct);
        return aes256GcmOpen(ukey.data(), nonce, Bytes(p.data(), kHeaderLen), Bytes(p.data() + kHeaderLen, ct), p.data() + p.size() - kGcmTagLen, pt.data()) &&
               std::string((char *)pt.data() + 4, ct - 4) == text && pt[3] == 87;
    };
    CHECK(open(expect));
    CHECK(!open(V.bytes("negative.question_tag_tampered.packet")));
    CHECK(!open(V.bytes("negative.question_header_tampered.packet")));

    QuestionLimiter lim;
    lim.configure(600, 3);
    CHECK_EQ(lim.waitSeconds(1000), 0);
    lim.record(1000);
    CHECK_EQ(lim.waitSeconds(1001), 599);
    CHECK_EQ(lim.waitSeconds(1600), 0);
    lim.record(1600);
    lim.record(2200);
    CHECK_EQ(lim.waitSeconds(2800), 86400 - 1800); // 3 per day used up; the first one frees at 1000 + 86400
    CHECK_EQ(lim.waitSeconds(1000 + 86400), 0);
}

// ------------------------------------------------------------------ the unit engine
struct Fixture {
    MemStorage storage;
    FakePlatform platform;
    RecListener listener;
    Unit *unit = nullptr;
    RootKey pinned = rootFromVectors("cz");
    Fixture() { boot(); }
    ~Fixture() { delete unit; }
    void boot()
    {
        delete unit;
        unit = new Unit(storage, platform, listener);
        unit->begin(&pinned, 1);
    }
    void provision(bool withClock = true)
    {
        if (withClock)
            platform.rtc = V.num("now");
        auto bundle = V.bytes("bundle.sealed");
        CHECK(unit->installBundle(B(bundle)) == Result::Ok);
        std::vector<uint8_t> seed = V.bytes("kem.unit_mlkem_coins"), xs = V.bytes("kem.unit_x25519_secret");
        seed.insert(seed.end(), xs.begin(), xs.end());
        CHECK(unit->kemBegin(seed.data()) == Result::Ok);
        uint8_t confirm[kKeyConfirmLen];
        CHECK(unit->kemFinish(V.bytes("kem.station_mlkem_ciphertext").data(), V.bytes("kem.station_x25519_public").data(), V.num("kem.unit_id"), confirm) == Result::Ok);
        CHECK(unit->setLanguage("cs"));
        CHECK(unit->lock() == Result::Ok);
    }
    Result feed(const std::string &key, std::vector<size_t> order = {})
    {
        size_t n = V.num(key + ".packets.#");
        if (order.empty())
            for (size_t i = 0; i < n; i++)
                order.push_back(i);
        Result r = Result::Internal;
        for (size_t i : order) {
            auto p = V.bytes(key + ".packets." + std::to_string(i));
            r = unit->onPacket(B(p));
        }
        return r;
    }
    std::string shownText(bool *fallback = nullptr, AlertInfo *infoOut = nullptr)
    {
        static uint8_t buf[kMaxSealedMessage];
        AlertInfo info;
        Alert a;
        if (!unit->currentAlert(info, a, buf, sizeof(buf)))
            return "";
        Chosen c = chooseText(a, unit->language());
        if (fallback)
            *fallback = c.is_fallback;
        if (infoOut)
            *infoOut = info;
        return str(c.text);
    }
};

static void testProvisioning()
{
    Fixture f;
    CHECK(!f.unit->provisioned());
    uint32_t qid, wait;
    CHECK(f.unit->ask(Str{"x", 1}, 0, 0, qid, wait) == Result::NotProvisioned);
    CHECK(f.unit->lock() == Result::NotProvisioned);
    // An unprovisioned unit trusts only the pinned root: the PL alert is unknown to it.
    CHECK(f.feed("alerts.pl_only") == Result::UnknownKey);

    // A bundle signed by a root that is not pinned (here: a valid PL-signed bulletin posing as a bundle) is refused.
    auto notBundle = V.bytes("keys.pl.sealed");
    CHECK(f.unit->installBundle(B(notBundle)) == Result::Malformed);
    auto bundle = V.bytes("bundle.sealed");
    auto tampered = bundle;
    tampered[100] ^= 1;
    CHECK(f.unit->installBundle(B(tampered)) == Result::BadSignature);

    f.provision();
    CHECK(f.unit->provisioned());
    CHECK_EQ(f.unit->unitId(), V.num("unit.unit_id"));
    CHECK_EQ(f.unit->trust().rootCount(), 2);
    CHECK_EQ(f.unit->trust().keyCount(), 3);
    RadioConfig rc;
    CHECK(f.unit->radioConfig(rc));
    CHECK(strcmp(rc.channel_name, "OLZA") == 0);
    CHECK(memcmp(rc.channel_psk, V.bytes("bundle.fields.channel_psk").data(), 32) == 0);
    CHECK(rc.has_admin_key && !rc.router);
    // Locked: no second key agreement, no downgrade of the bundle.
    CHECK(f.unit->kemBegin() == Result::NotAuthorized);
    CHECK(f.unit->installBundle(B(bundle)) == Result::Duplicate);

    // Everything survives a reboot (and is verified again from flash).
    f.boot();
    CHECK(f.unit->provisioned());
    CHECK_EQ(f.unit->trust().keyCount(), 3);
    CHECK(strcmp(f.unit->language(), "cs") == 0);
    CHECK(f.unit->hasUnitKey());
    // Flash tampering with the stored bundle: the unit comes up with nothing trusted beyond the pinned root.
    f.storage.files["bundle"][200] ^= 1;
    f.boot();
    CHECK_EQ(f.unit->trust().rootCount(), 1);
}

static void testAlerts()
{
    Fixture f;
    f.provision();
    bool fb = false;
    CHECK(f.shownText() == "");

    CHECK(f.feed("alerts.pl_only") == Result::Ok);
    CHECK_EQ(f.listener.alerts.size(), 1);
    // The unit shows Czech; only Polish was sent: original with a note.
    CHECK(f.shownText(&fb) == V.str("alerts.pl_only.fields.texts.0.text"));
    CHECK(fb);
    char note[96];
    originalNote("cs", Str{"pl", 2}, note, sizeof(note));
    CHECK(std::string(note) == "originál PL · překlad nebyl odeslán");
    CHECK(f.feed("alerts.pl_only") == Result::Duplicate);

    // Two parts, arriving in reverse order, with a duplicate in between.
    CHECK(f.feed("alerts.pl_cs", {1, 1}) == Result::Duplicate);
    CHECK(f.feed("alerts.pl_cs", {0}) == Result::Ok);
    CHECK(f.shownText(&fb) == V.str("alerts.pl_cs.fields.texts.1.text"));
    CHECK(!fb);

    AlertInfo info;
    CHECK(f.feed("alerts.all_langs") == Result::Ok);
    CHECK(f.shownText(&fb, &info) == V.str("alerts.all_langs.fields.texts.1.text"));
    CHECK_EQ(info.severity, kDanger);
    CHECK(!info.expired);
    CHECK(f.unit->setLanguage("en"));
    CHECK(f.shownText() == V.str("alerts.all_langs.fields.texts.2.text"));
    CHECK(f.unit->setLanguage("cs"));
    CHECK(!f.unit->setLanguage("C5"));

    // The Český Těšín centre (other root, other key) alerts as well; it is the newest.
    CHECK(f.feed("alerts.tesin") == Result::Ok);
    CHECK(f.shownText() == V.str("alerts.tesin.fields.texts.0.text"));
    CHECK_EQ(f.unit->alertCount(), 4);

    // CANCEL of all_langs by its own centre.
    CHECK(f.feed("cancel") == Result::Ok);
    CHECK_EQ(f.listener.cancelled.size(), 1);
    CHECK_EQ(f.listener.cancelled[0], V.num("alerts.all_langs.header.msg_id"));
    CHECK_EQ(f.unit->alertCount(), 3);
    // A late copy of the cancelled alert (e.g. a slow relay) must not bring it back, also after a reboot.
    auto late = V.bytes("alerts.all_langs.sealed");
    CHECK(f.unit->onSealed(B(late)) == Result::Duplicate);
    f.boot();
    CHECK(f.unit->onSealed(B(late)) == Result::Duplicate);
    CHECK_EQ(f.unit->alertCount(), 3);
    CHECK(f.shownText() == V.str("alerts.tesin.fields.texts.0.text"));

    // The alert stays on screen after it expires, marked as no longer valid (SPEC 5.4).
    f.platform.rtc = V.num("now") + 2 * 86400;
    CHECK(f.shownText(nullptr, &info) != "");
    CHECK(info.expired);
}

static void testNegativeVectors()
{
    Fixture f;
    f.provision();
    CHECK(f.feed("alerts.pl_cs") == Result::Ok);
    for (const char *n : {"alert_bad_signature", "alert_body_tampered", "alert_header_msgid_tampered", "alert_signed_by_other_key", "alert_wrong_epoch",
                          "alert_revoked_key", "alert_out_of_scope", "alert_issued_before_key_validity", "alert_expired", "cancel_by_other_key",
                          "keys_forged_root", "keys_rollback"}) {
        auto s = V.bytes(std::string("negative.") + n + ".sealed");
        Result r = f.unit->onSealed(B(s));
        CHECK_MSG(V.str(std::string("negative.") + n + ".expect") == resultName(r), std::string(n) + " -> " + resultName(r));
    }
    CHECK_EQ(f.listener.alerts.size(), 1);
    CHECK_EQ(f.unit->alertCount(), 1); // the foreign CANCEL did not remove pl_cs
    CHECK_EQ(f.listener.cancelled.size(), 0);
    // Garbage of every length must be handled without crashing.
    std::vector<uint8_t> junk(300);
    for (size_t i = 0; i < junk.size(); i++)
        junk[i] = (uint8_t)(i * 37 + 11);
    for (size_t n = 0; n < junk.size(); n++) {
        junk[0] = 1;
        junk[1] = (uint8_t)(n % 8);
        f.unit->onPacket(Bytes(junk.data(), n));
        f.unit->onSealed(Bytes(junk.data(), n));
    }
}

static void testForgedParts()
{
    // An attacker races the real second part with a forged one carrying the same msg_id.
    for (int scenario = 0; scenario < 3; scenario++) {
        Fixture f;
        f.provision();
        auto p0 = V.bytes("alerts.pl_cs.packets.0"), p1 = V.bytes("alerts.pl_cs.packets.1");
        auto fake1 = p1, fake0 = p0, fake1b = p1;
        fake1[kHeaderLen + 3] ^= 0x55;
        fake0[kHeaderLen + 9] ^= 0x55;
        fake1b[kHeaderLen + 4] ^= 0x33;
        if (scenario == 0) { // forged last part first
            CHECK(f.unit->onPacket(B(fake1)) == Result::Incomplete);
            CHECK(f.unit->onPacket(B(p0)) == Result::BadSignature);
            CHECK(f.unit->onPacket(B(p1)) == Result::Ok);
        } else if (scenario == 1) { // forged first part first
            CHECK(f.unit->onPacket(B(fake0)) == Result::Incomplete);
            CHECK(f.unit->onPacket(B(p1)) == Result::BadSignature);
            CHECK(f.unit->onPacket(B(p0)) == Result::Ok);
        } else { // forgeries of both parts, and a second forgery replacing the first
            CHECK(f.unit->onPacket(B(fake1)) == Result::Incomplete);
            CHECK(f.unit->onPacket(B(fake0)) == Result::BadSignature);
            CHECK(f.unit->onPacket(B(p0)) == Result::BadSignature);
            CHECK(f.unit->onPacket(B(fake1b)) == Result::BadSignature);
            CHECK(f.unit->onPacket(B(p1)) == Result::Ok);
        }
        CHECK_EQ(f.listener.alerts.size(), 1);
        CHECK(f.shownText() == V.str("alerts.pl_cs.fields.texts.1.text"));
    }
    // A complete forgery is never shown.
    Fixture f;
    f.provision();
    auto s = V.bytes("negative.alert_body_tampered.sealed");
    std::vector<uint8_t> pkt(s.begin(), s.end());
    pkt[7] = 1;
    CHECK(f.unit->onPacket(B(pkt)) == Result::BadSignature);
    CHECK(f.shownText() == "");
}

static void testFaqAndQuestions()
{
    Fixture f;
    f.provision();
    std::string text = V.str("question.fields.text");
    uint32_t qid = 0, wait = 0;
    CHECK(f.unit->ask(Str{text.data(), text.size()}, 3, 87, qid, wait) == Result::Ok);
    CHECK_EQ(qid, 1);
    uint8_t out[kMaxPayload];
    size_t n = 0;
    uint32_t to = 0, id = 0;
    CHECK(f.unit->nextOutgoing(out, n, to, id));
    // A freshly provisioned unit's first question is, byte for byte, the published vector.
    auto expect = V.bytes("question.packet");
    CHECK_EQ(n, expect.size());
    CHECK(memcmp(out, expect.data(), n) == 0);
    CHECK_EQ(to, 0x43430011u);
    CHECK(f.unit->questionAt(0).state == QuestionState::Waiting);
    f.unit->markSent(id);
    CHECK(f.unit->questionAt(0).state == QuestionState::Sent);
    CHECK(!f.unit->nextOutgoing(out, n, to, id)); // repeat not due yet
    f.platform.uptime += 601;
    f.platform.rtc += 601;
    CHECK(f.unit->nextOutgoing(out, n, to, id));
    CHECK_EQ(to, 0x43430001u); // the repeat goes to the other crisis-centre radio
    f.unit->markSent(id);

    // Limits: 1 per 10 minutes (from the bundle).
    f.platform.rtc = V.num("now") + 10;
    CHECK(f.unit->ask(Str{"a", 1}, 0, kBatteryUnknown, qid, wait) == Result::RateLimited);
    CHECK(wait > 0 && wait <= 600);

    // The answer arrives as an FAQ entry for everybody; only this unit can tell it is its own.
    f.platform.rtc = V.num("now");
    CHECK(f.feed("faq") == Result::Ok);
    CHECK_EQ(f.listener.faqs.size(), 1);
    CHECK_EQ(f.listener.faqs[0].second, 1); // question id 1 answered
    CHECK(f.unit->questionAt(0).state == QuestionState::Answered);
    CHECK_EQ(f.unit->questionAt(0).faq_id, 9);
    CHECK(!f.unit->nextOutgoing(out, n, to, id));
    CHECK(f.feed("faq") == Result::Duplicate);
    static uint8_t buf[kMaxSealedMessage];
    Faq q;
    CHECK(f.unit->faqAt(0, q, buf, sizeof(buf)));
    ChosenFaq c = chooseFaq(q, "cs");
    CHECK(str(c.answer) == V.str("faq.fields.entries.0.answer"));
    CHECK(!c.is_fallback);
    c = chooseFaq(q, "de");
    CHECK(c.is_fallback && str(c.lang) == "cs");

    // Reboot: the FAQ, the question state and the nonce counter survive.
    f.boot();
    CHECK_EQ(f.unit->faqCount(), 1);
    CHECK(f.unit->questionAt(0).state == QuestionState::Answered);
    f.platform.rtc = V.num("now") + 700;
    CHECK(f.unit->ask(Str{"b", 1}, 0, kBatteryUnknown, qid, wait) == Result::Ok);
    CHECK_EQ(qid, 17); // ids are reserved in blocks of 16 before use: no nonce is ever reused
    // 10 per day.
    for (int i = 0; i < 8; i++) {
        f.platform.rtc += 601;
        CHECK(f.unit->ask(Str{"c", 1}, 0, kBatteryUnknown, qid, wait) == Result::Ok);
    }
    f.platform.rtc += 601;
    CHECK(f.unit->ask(Str{"d", 1}, 0, kBatteryUnknown, qid, wait) == Result::RateLimited);
    CHECK(wait > 3600);
    // A power cycle does not reset the limits.
    f.boot();
    CHECK(f.unit->ask(Str{"d", 1}, 0, kBatteryUnknown, qid, wait) == Result::RateLimited);
    // A flash that cannot be written must not hand out a question id (it is the nonce counter).
    Fixture g;
    g.provision();
    g.storage.fail_writes = true;
    CHECK(g.unit->ask(Str{"e", 1}, 0, kBatteryUnknown, qid, wait) == Result::Storage);
    g.storage.fail_writes = false;
    CHECK(g.unit->ask(Str{"e", 1}, 0, kBatteryUnknown, qid, wait) == Result::Ok);
    CHECK_EQ(qid, 1);

    // FAQ capacity: 50 entries are kept.
    CHECK_EQ(kFaqCapacity, 50);
}

static void testRevocationAndTime()
{
    Fixture f;
    f.provision();
    CHECK(f.feed("alerts.pl_cs") == Result::Ok);
    CHECK(f.feed("alerts.tesin") == Result::Ok);
    CHECK_EQ(f.unit->alertCount(), 2);
    // A new PL bulletin arrives over LoRa in 17 parts and no longer lists key 0x0201.
    CHECK(f.feed("keys.pl_next") == Result::Ok);
    CHECK_EQ(f.listener.keys.size(), 1);
    CHECK_EQ(f.unit->trust().serial(2), 6);
    CHECK_EQ(f.unit->alertCount(), 1); // the alert signed with the revoked key is gone
    CHECK(f.feed("alerts.pl_only") == Result::UnknownKey);
    CHECK(f.feed("keys.pl") == Result::Rollback);
    f.boot(); // the newer bulletin wins over the one inside the bundle
    CHECK_EQ(f.unit->trust().serial(2), 6);
    CHECK(f.feed("alerts.pl_only") == Result::UnknownKey);

    // No clock at all (no GPS, no phone): time only moves forward with authentic messages.
    Fixture g;
    g.provision(false);
    CHECK(g.unit->now() >= V.num("bundle.fields.issued_at"));
    CHECK(g.unit->now() < V.num("now"));
    CHECK(g.feed("alerts.pl_only") == Result::Ok); // issued 10 minutes "ago"
    CHECK(g.unit->now() >= V.num("alerts.pl_only.fields.issued_at"));
    auto expired = V.bytes("alerts.expired.sealed");
    CHECK(g.unit->onSealed(B(expired)) == Result::Expired);
    uint32_t before = g.unit->now();
    g.unit->tick();
    g.boot();
    CHECK(g.unit->now() >= before); // persisted: never falls back
    g.platform.uptime += 1000;
    CHECK(g.unit->now() >= before + 1000);
}

static void testRelayPolicy()
{
    Fixture f;
    f.provision();
    const uint32_t bc = 0xffffffffu, hq = 0x43430001u, someone = 0x12345678u;
    auto alert = V.bytes("alerts.pl_cs.packets.0"), q = V.bytes("question.packet"), keys = V.bytes("keys.pl_next.packets.3");
    auto forged = V.bytes("negative.alert_body_tampered.sealed");
    forged[7] = 1;
    RelayPolicy &rp = f.unit->relay();
    CHECK(rp.permitted(B(alert), bc, true));
    CHECK(rp.permitted(B(keys), bc, true));
    CHECK(rp.permitted(B(forged), bc, true)); // relayed (cannot be verified per part) ...
    CHECK(f.unit->onPacket(B(forged)) == Result::BadSignature); // ... but never shown
    CHECK(!rp.permitted(B(alert), someone, false)); // authority packets are broadcasts
    CHECK(rp.permitted(B(q), hq, false));
    CHECK(!rp.permitted(B(q), someone, false)); // a "question" to anybody else is user-to-user traffic
    CHECK(!rp.permitted(B(q), bc, true));
    auto bundleLike = alert;
    bundleLike[1] = kBundle;
    CHECK(!rp.permitted(B(bundleLike), bc, true));
    auto badPart = alert;
    badPart[6] = 5; // part >= parts
    CHECK(!rp.permitted(B(badPart), bc, true));
    auto shortFirst = alert;
    shortFirst.resize(100); // a non-final part must be full
    CHECK(!rp.permitted(B(shortFirst), bc, true));
    const uint8_t text[] = "hello neighbour";
    CHECK(!rp.permitted(Bytes(text, sizeof(text)), bc, true));

    // Per source: 6 relayed questions per hour.
    f.platform.uptime = 10000;
    for (int i = 0; i < 6; i++)
        CHECK(f.unit->shouldRelay(B(q), 0xaaaa0001, hq, false));
    CHECK(!f.unit->shouldRelay(B(q), 0xaaaa0001, hq, false));
    CHECK(f.unit->shouldRelay(B(q), 0xaaaa0002, hq, false));
    f.platform.uptime += 3601;
    CHECK(f.unit->shouldRelay(B(q), 0xaaaa0001, hq, false));
    // Spoofing many source ids runs into the global question budget.
    int passed = 0;
    for (uint32_t i = 0; i < 200; i++)
        passed += f.unit->shouldRelay(B(q), 0xbbbb0000 + i, hq, false);
    CHECK(passed <= 20);
    // Authority-type packets: a flood of forgeries is cut off by the global budget.
    passed = 0;
    for (int i = 0; i < 500; i++)
        passed += f.unit->shouldRelay(B(alert), someone, bc, true);
    CHECK_EQ(passed, 40);
    f.platform.uptime += 3600;
    passed = 0;
    for (int i = 0; i < 500; i++)
        passed += f.unit->shouldRelay(B(alert), someone, bc, true);
    CHECK_EQ(passed, 40); // refilled to the burst size, not beyond
}

static void testManifest()
{
    auto manifest = readFile(repoRoot + "/site/releases/demo-0.0.1/manifest.json");
    auto sig = readFile(repoRoot + "/site/releases/demo-0.0.1/manifest.sig");
    auto pub = readFile(repoRoot + "/site/pubkey.json");
    auto image = readFile(repoRoot + "/site/releases/demo-0.0.1/firmware.bin");
    Bytes edHex, pqHex;
    CHECK(jsonGet(B(pub), "Ed25519", edHex) && jsonGet(B(pub), "ML-DSA-65", pqHex));
    std::vector<uint8_t> ed(32), pq(kMldsaPubLen);
    CHECK(hexDecode((const char *)edHex.data, edHex.size, ed.data(), 32));
    CHECK(hexDecode((const char *)pqHex.data, pqHex.size, pq.data(), kMldsaPubLen));
    PublisherKeys keys{ed.data(), pq.data()};

    // The unit accepts the very release the website's verifier accepts.
    ReleaseInfo rel;
    CHECK(verifyManifest(B(manifest), B(sig), keys, rel) == Result::Ok);
    CHECK(strcmp(rel.board, "heltec-wireless-paper") == 0);
    CHECK(strcmp(rel.file, "firmware.bin") == 0);
    CHECK_EQ(rel.size, image.size());
    uint8_t d[32];
    sha256(B(image), d);
    CHECK(memcmp(d, rel.sha256, 32) == 0);
    CHECK(rel.version.prerelease && rel.version.patch == 1);

    auto m2 = manifest;
    m2[30] ^= 1;
    CHECK(verifyManifest(B(m2), B(sig), keys, rel) == Result::BadSignature);
    // Each signature alone is not enough.
    auto pq2 = pq;
    pq2[5] ^= 1;
    PublisherKeys k2{ed.data(), pq2.data()};
    CHECK(verifyManifest(B(manifest), B(sig), k2, rel) == Result::BadSignature);
    auto ed2 = ed;
    ed2[5] ^= 1;
    PublisherKeys k3{ed2.data(), pq.data()};
    CHECK(verifyManifest(B(manifest), B(sig), k3, rel) == Result::BadSignature);
    std::string junk = "{\"Ed25519\": 5}";
    CHECK(verifyManifest(B(manifest), Bytes((const uint8_t *)junk.data(), junk.size()), keys, rel) == Result::Malformed);

    CHECK(verifyManifest(B(manifest), B(sig), keys, rel) == Result::Ok);
    Version floor;
    CHECK(checkInstallable(rel, "heltec-wireless-paper", floor, true) == Result::Ok);
    CHECK(checkInstallable(rel, "heltec-wireless-paper", floor, false) == Result::NotAuthorized); // demo/pre-release on a production unit
    CHECK(checkInstallable(rel, "diy-s3-eink", floor, true) == Result::Unsupported);
    Version v;
    CHECK(parseVersion("1.4.2", 5, v) && v.major == 1 && v.minor == 4 && v.patch == 2 && !v.prerelease);
    CHECK(checkInstallable(rel, "heltec-wireless-paper", v, true) == Result::Rollback);
    ReleaseInfo same = rel;
    same.version = v;
    CHECK(checkInstallable(same, "heltec-wireless-paper", v, false) == Result::Rollback); // reinstalling the same version is refused too
    Version next;
    parseVersion("1.4.3", 5, next);
    same.version = next;
    CHECK(checkInstallable(same, "heltec-wireless-paper", v, false) == Result::Ok);
    CHECK(!parseVersion("1.4", 3, v) && !parseVersion("1.4.x", 5, v) && !parseVersion("1.4.2-", 6, v) && !parseVersion("99999.1.1", 9, v));
    Version a, b;
    parseVersion("1.0.0-rc1", 9, a);
    parseVersion("1.0.0", 5, b);
    CHECK(compareVersion(a, b) < 0 && packVersion(a) < packVersion(b));
    CHECK(compareVersion(unpackVersion(packVersion(next)), next) == 0);
}

// ML-DSA verification must not need a large stack: the unit runs it on a small task stack.
static void *stackProbe(void *arg)
{
    Fixture *f = (Fixture *)arg;
    auto bundle = V.bytes("bundle.sealed");
    f->platform.rtc = V.num("now");
    *(Result *)&f->listener.probe = f->unit->installBundle(B(bundle));
    return nullptr;
}

static void testStackUse()
{
    Fixture f;
    const size_t size = 256 * 1024;
    uint8_t *stack = (uint8_t *)aligned_alloc(4096, size);
    memset(stack, 0xa5, size);
    pthread_attr_t attr;
    pthread_attr_init(&attr);
    pthread_attr_setstack(&attr, stack, size);
    pthread_t th;
    CHECK(pthread_create(&th, &attr, stackProbe, &f) == 0);
    pthread_join(th, nullptr);
    CHECK(f.listener.probe == Result::Ok);
    size_t untouched = 0;
    while (untouched < size && stack[untouched] == 0xa5)
        untouched++;
    size_t used = size - untouched;
    printf("    stack used by bundle + 3 ML-DSA-65 verifications (host, x86-64): %zu bytes\n", used);
    CHECK(used < 16 * 1024);
    free(stack);
}

int main(int argc, char **argv)
{
    if (argc < 3) {
        fprintf(stderr, "usage: %s <vectors.txt> <repo-root>\n", argv[0]);
        return 2;
    }
    V.load(argv[1]);
    repoRoot = argv[2];
    RUN(testHash);
    RUN(testHeaderAndDecode);
    RUN(testTrust);
    RUN(testQuestionAndKem);
    RUN(testProvisioning);
    RUN(testAlerts);
    RUN(testNegativeVectors);
    RUN(testForgedParts);
    RUN(testFaqAndQuestions);
    RUN(testRevocationAndTime);
    RUN(testRelayPolicy);
    RUN(testManifest);
    RUN(testStackUse);
    return finish();
}
