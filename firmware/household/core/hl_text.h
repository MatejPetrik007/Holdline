// Display languages: choosing the text to show and the unit's own UI strings.
// SPDX-License-Identifier: GPL-3.0-only
//
// Units never translate (SPEC 5.4). They show the version in the display language
// if the crisis centre sent one, else the original with a note.
#pragma once
#include "hl_codec.h"

namespace hl
{
enum class Ui : uint8_t {
    AlertTitle,     // "! ALERT"
    InfoTitle,
    NoMessages,
    OriginalNote,   // "original %s - no translation was sent"; %s = language code in upper case
    Cancelled,
    Expired,
    FaqTitle,
    FaqEmpty,
    Question,
    Answer,
    QuestionSent,
    QuestionWaiting,
    QuestionAnswered,
    QuestionTooSoon, // "%u min"
    NotProvisioned,
    Language,
    AskTitle,     // "Ask the authority"
    AskHint,      // how to use the one button
    Back,
    Count
};

// Predefined questions a household can send with the unit's one button (SPEC 5.5).
// The category number travels encrypted with the text; 0 means free text.
constexpr uint8_t kQuestionCategories = 5;
const char *categoryLabel(uint8_t category, const char *lang); // short, for the list; category 1..5
const char *categoryQuestion(uint8_t category, const char *lang);
// `lang` is "cs", "pl" or "en"; anything else falls back to English.
const char *uiText(Ui id, const char *lang);

constexpr size_t kUiLangs = 3;
extern const char *const kUiLangCodes[kUiLangs]; // "cs", "pl", "en"
const char *nextUiLang(const char *lang);

struct Chosen {
    Str text;
    Str lang;        // language actually shown
    bool is_fallback; // true: `lang` is the original, not the display language
};
Chosen chooseText(const Alert &a, const char *display_lang);
struct ChosenFaq {
    Str question, answer, lang;
    bool is_fallback;
};
ChosenFaq chooseFaq(const Faq &f, const char *display_lang);

// "original PL - no translation was sent" in the display language. Returns the length.
size_t originalNote(const char *display_lang, Str original_lang, char *out, size_t cap);
} // namespace hl
