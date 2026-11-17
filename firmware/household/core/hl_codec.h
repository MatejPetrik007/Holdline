// Decoders for Holdline message bodies (firmware/protocol/holdline.proto).
// SPDX-License-Identifier: GPL-3.0-only
//
// Hand-written protobuf reader: the unit only ever decodes, and only these few
// messages. Views point into the caller's buffer; nothing is copied or allocated.
// Decoders are strict where it matters for display and trust (UTF-8, lengths,
// counts) and skip unknown fields so that newer authorities stay compatible.
#pragma once
#include "hl_base.h"

namespace hl
{
constexpr size_t kMaxTexts = 4;
constexpr size_t kMaxScope = 6;
constexpr size_t kMaxNodeIds = 4;
constexpr size_t kMaxKeysPerBulletin = 16;
constexpr size_t kRegionLen = 12; // including the terminating NUL
constexpr size_t kMaxRoots = 4;
constexpr size_t kMaxRegions = 4;

struct LangText {
    Str lang, text;
};
struct Alert {
    uint8_t severity = 0;
    uint32_t issued_at = 0, expires_at = 0;
    uint16_t template_code = 0;
    Str original_lang;
    LangText texts[kMaxTexts];
    size_t n_texts = 0;
};
struct FaqEntry {
    Str lang, question, answer;
};
struct Faq {
    uint32_t faq_id = 0, answers_question_ref = 0, published_at = 0;
    FaqEntry entries[kMaxTexts];
    size_t n_entries = 0;
};
struct Cancel {
    uint32_t cancels_msg_id = 0, issued_at = 0;
};
// Owned (copied) because bulletins outlive the packet buffers.
struct KeyEntry {
    uint16_t key_id = 0;
    uint32_t epoch = 0, valid_from = 0, valid_to = 0;
    uint8_t alg = 0;
    uint8_t public_key[kEdPubLen] = {0};
    char scope[kMaxScope][kRegionLen] = {{0}};
    uint8_t n_scope = 0;
    uint32_t node_ids[kMaxNodeIds] = {0};
    uint8_t n_nodes = 0;
};
struct Keys {
    uint32_t root_id = 0, serial = 0, issued_at = 0;
    KeyEntry keys[kMaxKeysPerBulletin];
    size_t n_keys = 0;
};
struct RootKeyView {
    uint32_t root_id = 0;
    Bytes ed25519, mldsa65;
};
struct Bundle {
    uint32_t root_id = 0, serial = 0, issued_at = 0;
    Str regions[kMaxRegions];
    size_t n_regions = 0;
    Str channel_name;
    Bytes channel_psk, admin_key;
    uint32_t modem_preset = 0;
    RootKeyView extra_roots[kMaxRoots];
    size_t n_extra_roots = 0;
    Bytes keys[kMaxRoots]; // sealed KEYS messages
    size_t n_keys = 0;
    uint8_t role = 0;
    uint32_t question_min_interval_s = 0, question_max_per_day = 0;
};

bool decodeAlert(Bytes body, Alert &out);
bool decodeFaq(Bytes body, Faq &out);
bool decodeCancel(Bytes body, Cancel &out);
bool decodeKeys(Bytes body, Keys &out);
bool decodeBundle(Bytes body, Bundle &out);

bool utf8Valid(const char *s, size_t n);
// A language code: 2 or 3 lower-case ASCII letters.
bool langValid(Str s);

// Sealed form (at rest / wired): 14-byte header with part 0, then the whole message.
bool unseal(Bytes sealed, Header &h, Bytes &message);
} // namespace hl
