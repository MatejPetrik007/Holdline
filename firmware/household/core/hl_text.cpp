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
    {"Dotaz krizovému štábu", "Pytanie do sztabu kryzysowego", "Ask the crisis centre"},
    {"krátce: další · dlouze: odeslat", "krótko: dalej · długo: wyślij", "short: next · long: send"},
    {"Zpět", "Wstecz", "Back"},
};

static const char *const kCatLabel[kQuestionCategories][kUiLangs] = {
    {"Zdravotní pomoc", "Pomoc medyczna", "Medical help"},
    {"Voda a jídlo", "Woda i żywność", "Water and food"},
    {"Elektřina a teplo", "Prąd i ogrzewanie", "Power and heating"},
    {"Evakuace a úkryt", "Ewakuacja i schronienie", "Evacuation and shelter"},
    {"Jiný dotaz", "Inne pytanie", "Other question"},
};
static const char *const kCatQuestion[kQuestionCategories][kUiLangs] = {
    {"Potřebuji zdravotní pomoc. Kam se mám obrátit?", "Potrzebuję pomocy medycznej. Gdzie mam się zgłosić?", "I need medical help. Where should I go?"},
    {"Kde je pitná voda a jídlo?", "Gdzie jest woda pitna i żywność?", "Where can I get drinking water and food?"},
    {"Kdy bude obnovena elektřina a kde se lze ohřát?", "Kiedy wróci prąd i gdzie można się ogrzać?", "When will power be back and where can I get warm?"},
    {"Mám se evakuovat? Kde je úkryt?", "Czy mam się ewakuować? Gdzie jest schronienie?", "Should I evacuate? Where is the shelter?"},
    {"Mám jiný dotaz. Kde dostanu informace?", "Mam inne pytanie. Gdzie uzyskam informacje?", "I have another question. Where can I get information?"},
};

static size_t langIndex(const char *lang)
{
    for (size_t i = 0; i < kUiLangs; i++)
        if (lang && strncmp(lang, kUiLangCodes[i], 3) == 0)
            return i;
    return 2;
}

const char *uiText(Ui id, const char *lang) { return kUi[(size_t)id][langIndex(lang)]; }

const char *categoryLabel(uint8_t c, const char *lang) { return (c >= 1 && c <= kQuestionCategories) ? kCatLabel[c - 1][langIndex(lang)] : ""; }
const char *categoryQuestion(uint8_t c, const char *lang) { return (c >= 1 && c <= kQuestionCategories) ? kCatQuestion[c - 1][langIndex(lang)] : ""; }

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
