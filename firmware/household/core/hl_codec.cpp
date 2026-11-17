// SPDX-License-Identifier: GPL-3.0-only
#include "hl_codec.h"

namespace hl
{
const char *resultName(Result r)
{
    static const char *const names[] = {"ok", "duplicate", "incomplete", "malformed", "unsupported", "too_large", "unknown_key",
                                        "bad_signature", "key_not_valid", "expired", "out_of_scope", "rollback", "not_authorized",
                                        "bad_tag", "rate_limited", "not_provisioned", "storage", "internal"};
    return (size_t)r < sizeof(names) / sizeof(names[0]) ? names[(size_t)r] : "?";
}

bool parseHeader(Bytes p, Header &h)
{
    if (p.size < kHeaderLen || p.data[0] != kVersion)
        return false;
    h.version = p.data[0];
    h.type = p.data[1];
    h.msg_id = rd32(p.data + 2);
    h.part = p.data[6];
    h.parts = p.data[7];
    h.key_id = rd16(p.data + 8);
    h.epoch = rd32(p.data + 10);
    return true;
}

void writeHeader(const Header &h, uint8_t out[kHeaderLen])
{
    out[0] = h.version;
    out[1] = h.type;
    wr32(out + 2, h.msg_id);
    out[6] = h.part;
    out[7] = h.parts;
    wr16(out + 8, h.key_id);
    wr32(out + 10, h.epoch);
}

bool unseal(Bytes sealed, Header &h, Bytes &message)
{
    if (!parseHeader(sealed, h) || h.part != 0)
        return false;
    message = sealed.from(kHeaderLen);
    return true;
}

bool utf8Valid(const char *sp, size_t n)
{
    const uint8_t *s = (const uint8_t *)sp;
    size_t i = 0;
    while (i < n) {
        uint8_t c = s[i];
        size_t len;
        uint32_t cp, min;
        if (c < 0x80) {
            if (c == 0)
                return false; // no embedded NUL: texts end up in C strings
            i++;
            continue;
        } else if ((c & 0xe0) == 0xc0) {
            len = 2; cp = c & 0x1f; min = 0x80;
        } else if ((c & 0xf0) == 0xe0) {
            len = 3; cp = c & 0x0f; min = 0x800;
        } else if ((c & 0xf8) == 0xf0) {
            len = 4; cp = c & 0x07; min = 0x10000;
        } else
            return false;
        if (i + len > n)
            return false;
        for (size_t k = 1; k < len; k++) {
            if ((s[i + k] & 0xc0) != 0x80)
                return false;
            cp = (cp << 6) | (s[i + k] & 0x3f);
        }
        if (cp < min || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff))
            return false;
        i += len;
    }
    return true;
}

bool langValid(Str s)
{
    if (s.size < 2 || s.size > 3)
        return false;
    for (size_t i = 0; i < s.size; i++)
        if (s.data[i] < 'a' || s.data[i] > 'z')
            return false;
    return true;
}

namespace
{
enum Wire { kVarint = 0, kFixed64 = 1, kLen = 2, kFixed32 = 5 };

struct Field {
    uint32_t num;
    uint8_t wire;
    uint64_t value; // varint / fixed32
    Bytes bytes;    // length-delimited
};

class Reader
{
  public:
    explicit Reader(Bytes b) : p_(b.data), end_(b.data + b.size) {}
    bool ok() const { return ok_; }
    // Returns false at the end of the buffer or on a malformed field (then ok() is false).
    bool next(Field &f)
    {
        if (!ok_ || p_ == end_)
            return false;
        uint64_t key;
        if (!varint(key))
            return fail();
        f.num = (uint32_t)(key >> 3);
        f.wire = (uint8_t)(key & 7);
        if (f.num == 0 || (key >> 3) > 0x1fffffff)
            return fail();
        switch (f.wire) {
        case kVarint:
            return varint(f.value) || fail();
        case kFixed32:
            if (end_ - p_ < 4)
                return fail();
            f.value = rd32(p_);
            p_ += 4;
            return true;
        case kFixed64:
            if (end_ - p_ < 8)
                return fail();
            p_ += 8;
            f.value = 0;
            return true;
        case kLen: {
            uint64_t n;
            if (!varint(n) || n > (uint64_t)(end_ - p_))
                return fail();
            f.bytes = Bytes(p_, (size_t)n);
            p_ += n;
            return true;
        }
        default:
            return fail(); // groups are not supported
        }
    }

  private:
    bool fail()
    {
        ok_ = false;
        return false;
    }
    bool varint(uint64_t &v)
    {
        v = 0;
        for (int shift = 0; shift < 64; shift += 7) {
            if (p_ == end_)
                return false;
            uint8_t c = *p_++;
            v |= (uint64_t)(c & 0x7f) << shift;
            if (!(c & 0x80))
                return true;
        }
        return false;
    }
    const uint8_t *p_, *end_;
    bool ok_ = true;
};

bool asStr(const Field &f, Str &out)
{
    if (!utf8Valid((const char *)f.bytes.data, f.bytes.size))
        return false;
    out.data = (const char *)f.bytes.data;
    out.size = f.bytes.size;
    return true;
}
bool u32(const Field &f, uint32_t &out)
{
    if (f.value > 0xffffffffull)
        return false;
    out = (uint32_t)f.value;
    return true;
}
bool copyRegion(const Field &f, char out[kRegionLen])
{
    Str s;
    if (!asStr(f, s) || s.size == 0 || s.size >= kRegionLen)
        return false;
    memcpy(out, s.data, s.size);
    out[s.size] = 0;
    return true;
}
} // namespace

bool decodeAlert(Bytes body, Alert &a)
{
    a = Alert();
    Reader r(body);
    Field f;
    uint32_t v;
    while (r.next(f)) {
        if (f.num == 1 && f.wire == kVarint) {
            if (!u32(f, v) || v > 255)
                return false;
            a.severity = (uint8_t)v;
        } else if (f.num == 2 && f.wire == kFixed32)
            a.issued_at = (uint32_t)f.value;
        else if (f.num == 3 && f.wire == kFixed32)
            a.expires_at = (uint32_t)f.value;
        else if (f.num == 4 && f.wire == kVarint) {
            if (!u32(f, v) || v > 0xffff)
                return false;
            a.template_code = (uint16_t)v;
        } else if (f.num == 5 && f.wire == kLen) {
            if (!asStr(f, a.original_lang))
                return false;
        } else if (f.num == 6 && f.wire == kLen) {
            if (a.n_texts == kMaxTexts)
                return false;
            LangText &t = a.texts[a.n_texts++];
            Reader rr(f.bytes);
            Field g;
            while (rr.next(g)) {
                if (g.wire != kLen)
                    continue;
                if (g.num == 1 && !asStr(g, t.lang))
                    return false;
                if (g.num == 2 && !asStr(g, t.text))
                    return false;
            }
            if (!rr.ok() || !langValid(t.lang) || t.text.size == 0)
                return false;
        }
    }
    if (!r.ok() || a.n_texts == 0 || a.severity < kInfo || a.severity > kDanger || !langValid(a.original_lang))
        return false;
    // The original language must be present, and no language may appear twice.
    bool haveOriginal = false;
    for (size_t i = 0; i < a.n_texts; i++) {
        haveOriginal = haveOriginal || a.texts[i].lang.equals(a.original_lang);
        for (size_t j = 0; j < i; j++)
            if (a.texts[i].lang.equals(a.texts[j].lang))
                return false;
    }
    return haveOriginal && a.issued_at != 0 && a.expires_at > a.issued_at;
}

bool decodeFaq(Bytes body, Faq &q)
{
    q = Faq();
    Reader r(body);
    Field f;
    while (r.next(f)) {
        if (f.num == 1 && f.wire == kVarint) {
            if (!u32(f, q.faq_id))
                return false;
        } else if (f.num == 2 && f.wire == kFixed32)
            q.answers_question_ref = (uint32_t)f.value;
        else if (f.num == 3 && f.wire == kFixed32)
            q.published_at = (uint32_t)f.value;
        else if (f.num == 4 && f.wire == kLen) {
            if (q.n_entries == kMaxTexts)
                return false;
            FaqEntry &e = q.entries[q.n_entries++];
            Reader rr(f.bytes);
            Field g;
            while (rr.next(g)) {
                if (g.wire != kLen)
                    continue;
                if (g.num == 1 && !asStr(g, e.lang))
                    return false;
                if (g.num == 2 && !asStr(g, e.question))
                    return false;
                if (g.num == 3 && !asStr(g, e.answer))
                    return false;
            }
            if (!rr.ok() || !langValid(e.lang) || e.answer.size == 0)
                return false;
        }
    }
    return r.ok() && q.n_entries > 0 && q.faq_id != 0 && q.published_at != 0;
}

bool decodeCancel(Bytes body, Cancel &c)
{
    c = Cancel();
    Reader r(body);
    Field f;
    while (r.next(f)) {
        if (f.wire != kFixed32)
            continue;
        if (f.num == 1)
            c.cancels_msg_id = (uint32_t)f.value;
        else if (f.num == 2)
            c.issued_at = (uint32_t)f.value;
    }
    return r.ok() && c.issued_at != 0;
}

static bool decodeKeyEntry(Bytes b, KeyEntry &e)
{
    e = KeyEntry();
    Reader r(b);
    Field f;
    uint32_t v;
    bool havePub = false;
    while (r.next(f)) {
        if (f.num == 1 && f.wire == kVarint) {
            if (!u32(f, v) || v == 0 || v > 0xffff)
                return false;
            e.key_id = (uint16_t)v;
        } else if (f.num == 2 && f.wire == kVarint) {
            if (!u32(f, e.epoch))
                return false;
        } else if (f.num == 3 && f.wire == kFixed32)
            e.valid_from = (uint32_t)f.value;
        else if (f.num == 4 && f.wire == kFixed32)
            e.valid_to = (uint32_t)f.value;
        else if (f.num == 5 && f.wire == kVarint) {
            if (!u32(f, v) || v > 255)
                return false;
            e.alg = (uint8_t)v;
        } else if (f.num == 6 && f.wire == kLen) {
            // Keys of an algorithm this firmware does not know are kept as "present but unusable".
            if (f.bytes.size == kEdPubLen) {
                memcpy(e.public_key, f.bytes.data, kEdPubLen);
                havePub = true;
            }
        } else if (f.num == 7 && f.wire == kLen) {
            if (e.n_scope == kMaxScope || !copyRegion(f, e.scope[e.n_scope]))
                return false;
            e.n_scope++;
        } else if (f.num == 8 && f.wire == kFixed32) {
            if (e.n_nodes == kMaxNodeIds)
                return false;
            e.node_ids[e.n_nodes++] = (uint32_t)f.value;
        } else if (f.num == 8 && f.wire == kLen) { // packed
            if (f.bytes.size % 4 || e.n_nodes + f.bytes.size / 4 > kMaxNodeIds)
                return false;
            for (size_t i = 0; i < f.bytes.size; i += 4)
                e.node_ids[e.n_nodes++] = rd32(f.bytes.data + i);
        }
    }
    if (!r.ok() || e.key_id == 0 || e.valid_to <= e.valid_from)
        return false;
    if (e.alg == 1 && !havePub)
        return false;
    return true;
}

bool decodeKeys(Bytes body, Keys &k)
{
    k.root_id = k.serial = k.issued_at = 0;
    k.n_keys = 0;
    Reader r(body);
    Field f;
    while (r.next(f)) {
        if (f.num == 1 && f.wire == kVarint) {
            if (!u32(f, k.root_id))
                return false;
        } else if (f.num == 2 && f.wire == kVarint) {
            if (!u32(f, k.serial))
                return false;
        } else if (f.num == 3 && f.wire == kFixed32)
            k.issued_at = (uint32_t)f.value;
        else if (f.num == 4 && f.wire == kLen) {
            if (k.n_keys == kMaxKeysPerBulletin || !decodeKeyEntry(f.bytes, k.keys[k.n_keys]))
                return false;
            k.n_keys++;
        }
    }
    return r.ok() && k.root_id != 0 && k.serial != 0 && k.issued_at != 0;
}

bool decodeBundle(Bytes body, Bundle &b)
{
    b = Bundle();
    Reader r(body);
    Field f;
    uint32_t v;
    while (r.next(f)) {
        if (f.wire == kVarint) {
            if (!u32(f, v))
                return false;
            if (f.num == 1)
                b.root_id = v;
            else if (f.num == 2)
                b.serial = v;
            else if (f.num == 7)
                b.modem_preset = v;
            else if (f.num == 11)
                b.role = (uint8_t)(v > 255 ? 255 : v);
            else if (f.num == 12)
                b.question_min_interval_s = v;
            else if (f.num == 13)
                b.question_max_per_day = v;
        } else if (f.wire == kFixed32) {
            if (f.num == 3)
                b.issued_at = (uint32_t)f.value;
        } else if (f.wire == kLen) {
            if (f.num == 4) {
                if (b.n_regions == kMaxRegions || !asStr(f, b.regions[b.n_regions]) || b.regions[b.n_regions].size == 0 ||
                    b.regions[b.n_regions].size >= kRegionLen)
                    return false;
                b.n_regions++;
            } else if (f.num == 5) {
                if (!asStr(f, b.channel_name) || b.channel_name.size > 11)
                    return false;
            } else if (f.num == 6)
                b.channel_psk = f.bytes;
            else if (f.num == 8)
                b.admin_key = f.bytes;
            else if (f.num == 9) {
                if (b.n_extra_roots == kMaxRoots)
                    return false;
                RootKeyView &rk = b.extra_roots[b.n_extra_roots++];
                Reader rr(f.bytes);
                Field g;
                while (rr.next(g)) {
                    if (g.num == 1 && g.wire == kVarint) {
                        if (!u32(g, rk.root_id))
                            return false;
                    } else if (g.num == 2 && g.wire == kLen)
                        rk.ed25519 = g.bytes;
                    else if (g.num == 3 && g.wire == kLen)
                        rk.mldsa65 = g.bytes;
                }
                if (!rr.ok() || rk.root_id == 0 || rk.ed25519.size != kEdPubLen || rk.mldsa65.size != kMldsaPubLen)
                    return false;
            } else if (f.num == 10) {
                if (b.n_keys == kMaxRoots)
                    return false;
                b.keys[b.n_keys++] = f.bytes;
            }
        }
    }
    return r.ok() && b.root_id != 0 && b.serial != 0 && b.issued_at != 0 && b.channel_psk.size == 32 && b.n_regions > 0 &&
           (b.admin_key.size == 0 || b.admin_key.size == 32) && b.role <= 1;
}

} // namespace hl
