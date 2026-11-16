// SPDX-License-Identifier: GPL-3.0-only
#include "hl_text.h"
#include <stdio.h>

namespace hl
{
const char *const kUiLangCodes[kUiLangs] = {"cs", "pl", "en"};

// Order: cs, pl, en. Wording of the alert screen follows the website demo (site/demo.js).
static const char *const kUi[(size_t)Ui::Count][kUiLangs] = {
    {"! VÝSTRAHA", "! ALERT", "! ALERT"},
    {"INFORMACE", "INFORMACJA", "INFORMATION"},
    {"Zatím žádná zpráva.", "Brak wiadomości.", "No messages yet."},
    {"originál %s · překlad nebyl odeslán", "oryginał %s · tłumaczenie nie zostało wysłane", "original %s · no translation was sent"},
    {"ODVOLÁNO", "ODWOŁANO", "CANCELLED"},
    {"platnost skončila", "ważność wygasła", "no longer valid"},
    {"Otázky a odpovědi", "Pytania i odpowiedzi", "Questions and answers"},
    {"Zatím žádné odpovědi.", "Brak odpowiedzi.", "No answers yet."},
    {"Otázka", "Pytanie", "Question"},
    {"Odpověď", "Odpowiedź", "Answer"},
    {"Dotaz odeslán", "Pytanie wysłane", "Question sent"},
    {"Dotaz čeká na odeslání", "Pytanie czeka na wysłanie", "Question waiting to be sent"},
    {"Na váš dotaz přišla odpověď", "Jest odpowiedź na Twoje pytanie", "Your question was answered"},
    {"Další dotaz za %u min", "Kolejne pytanie za %u min", "Next question in %u min"},
    {"Jednotka není aktivována", "Urządzenie nie jest aktywowane", "Unit is not activated"},
    {"Jazyk: čeština", "Język: polski", "Language: English"},
};

static size_t langIndex(const char *lang)
{
    for (size_t i = 0; i < kUiLangs; i++)
        if (lang && strncmp(lang, kUiLangCodes[i], 3) == 0)
            return i;
    return 2;
}

const char *uiText(Ui id, const char *lang) { return kUi[(size_t)id][langIndex(lang)]; }

const char *nextUiLang(const char *lang) { return kUiLangCodes[(langIndex(lang) + 1) % kUiLangs]; }

Chosen chooseText(const Alert &a, const char *display_lang)
{
    Chosen c{{}, {}, false};
    const LangText *orig = nullptr;
    for (size_t i = 0; i < a.n_texts; i++) {
        if (a.texts[i].lang.equals(display_lang)) {
            c.text = a.texts[i].text;
            c.lang = a.texts[i].lang;
            return c;
        }
        if (a.texts[i].lang.equals(a.original_lang))
            orig = &a.texts[i];
    }
    if (!orig && a.n_texts)
        orig = &a.texts[0];
    if (orig) {
        c.text = orig->text;
        c.lang = orig->lang;
        c.is_fallback = true;
    }
    return c;
}

ChosenFaq chooseFaq(const Faq &f, const char *display_lang)
{
    ChosenFaq c{{}, {}, {}, false};
    for (size_t i = 0; i < f.n_entries; i++)
        if (f.entries[i].lang.equals(display_lang)) {
            c.question = f.entries[i].question;
            c.answer = f.entries[i].answer;
            c.lang = f.entries[i].lang;
            return c;
        }
    if (f.n_entries) { // FAQ has no "original" marker: the authority puts the original first
        c.question = f.entries[0].question;
        c.answer = f.entries[0].answer;
        c.lang = f.entries[0].lang;
        c.is_fallback = true;
    }
    return c;
}

size_t originalNote(const char *display_lang, Str original_lang, char *out, size_t cap)
{
    char code[4] = {0};
    for (size_t i = 0; i < original_lang.size && i < 3; i++)
        code[i] = (char)(original_lang.data[i] - 'a' + 'A');
    int n = snprintf(out, cap, uiText(Ui::OriginalNote, display_lang), code);
    return n < 0 ? 0 : ((size_t)n >= cap ? cap - 1 : (size_t)n);
}
} // namespace hl
