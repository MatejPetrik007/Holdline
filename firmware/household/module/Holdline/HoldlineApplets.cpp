// SPDX-License-Identifier: GPL-3.0-only
#include "HoldlineApplets.h"
#include "HoldlineModule.h"

#ifndef MESHTASTIC_INCLUDE_INKHUD
void holdlineUiChanged(uint8_t) {}
#else

using namespace NicheGraphics;

namespace
{
InkHUD::HoldlineAlertApplet *alertApplet = nullptr;
InkHUD::HoldlineFaqApplet *faqApplet = nullptr;
InkHUD::HoldlineAskApplet *askApplet = nullptr;
uint8_t messageBuf[hl::kMaxSealedMessage];

std::string s(hl::Str v) { return std::string(v.data, v.size); }
const char *lang() { return holdlineModule->unit().language(); }
std::string ui(hl::Ui id) { return hl::uiText(id, lang()); }
} // namespace

void holdlineAddApplets(InkHUD::InkHUD *inkhud)
{
    alertApplet = new InkHUD::HoldlineAlertApplet;
    faqApplet = new InkHUD::HoldlineFaqApplet;
    askApplet = new InkHUD::HoldlineAskApplet;
    inkhud->addApplet("Holdline", alertApplet, true, true, 0); // active, shown automatically, tile 0
    inkhud->addApplet("Holdline FAQ", faqApplet, true, false);
    inkhud->addApplet("Holdline Ask", askApplet, true, false);
}

void holdlineUiChanged(uint8_t kind)
{
    if (kind == 1 && alertApplet) {
        alertApplet->requestAutoshow();
        alertApplet->requestUpdate(Drivers::EInk::UpdateTypes::FULL); // SPEC 5.4: full refresh for an alert
    } else if (alertApplet)
        alertApplet->requestUpdate();
    if (faqApplet)
        faqApplet->requestUpdate();
    if (askApplet)
        askApplet->requestUpdate();
}

// ------------------------------------------------------------------ alert
void InkHUD::HoldlineAlertApplet::onRender(bool)
{
    hl::Unit &unit = holdlineModule->unit();
    const int16_t top = getHeaderHeight() + 2;
    if (!unit.provisioned()) {
        drawHeader("Holdline");
        setFont(fontMedium);
        printWrapped(0, top, width(), parse(ui(hl::Ui::NotProvisioned)));
        return;
    }
    hl::AlertInfo info;
    hl::Alert alert;
    if (!unit.currentAlert(info, alert, messageBuf, sizeof(messageBuf))) {
        drawHeader("Holdline");
        setFont(fontMedium);
        printWrapped(0, top, width(), parse(ui(hl::Ui::NoMessages)));
        return;
    }
    std::string title = ui(info.severity >= hl::kWarning ? hl::Ui::AlertTitle : hl::Ui::InfoTitle);
    if (info.expired)
        title += " · " + ui(hl::Ui::Expired);
    drawHeader(parse(title));

    hl::Chosen chosen = hl::chooseText(alert, lang());
    std::string text = parse(s(chosen.text));
    char note[96] = {0};
    if (chosen.is_fallback) // "original PL · no translation was sent"
        hl::originalNote(lang(), chosen.lang, note, sizeof(note));
    setFont(fontSmall);
    const int16_t noteHeight = note[0] ? (int16_t)getWrappedTextHeight(0, width(), parse(note)) + 2 : 0;
    // The largest font that fits; the user can force the small one (accessibility: more text at once).
    setFont(fontMedium);
    if (holdlineModule->textSizeSmall || top + (int32_t)getWrappedTextHeight(0, width(), text) > height() - noteHeight)
        setFont(fontSmall);
    printWrapped(0, top, width(), text);
    if (note[0]) {
        setFont(fontSmall);
        printWrapped(0, height() - noteHeight, width(), parse(note));
    }
}

void InkHUD::HoldlineAlertApplet::onButtonLongPress()
{
    holdlineModule->textSizeSmall = !holdlineModule->textSizeSmall;
    requestUpdate();
}

// ------------------------------------------------------------------ FAQ
void InkHUD::HoldlineFaqApplet::onRender(bool)
{
    hl::Unit &unit = holdlineModule->unit();
    const size_t count = unit.faqCount();
    const int16_t top = getHeaderHeight() + 2;
    hl::Faq faq;
    if (index >= count)
        index = 0;
    if (count == 0 || !unit.faqAt(index, faq, messageBuf, sizeof(messageBuf))) {
        drawHeader(parse(ui(hl::Ui::FaqTitle)));
        setFont(fontSmall);
        printWrapped(0, top, width(), parse(ui(hl::Ui::FaqEmpty)));
        return;
    }
    drawHeader(parse(ui(hl::Ui::FaqTitle)) + " " + std::to_string(index + 1) + "/" + std::to_string(count));
    hl::ChosenFaq chosen = hl::chooseFaq(faq, lang());
    setFont(fontSmall);
    std::string q = parse(s(chosen.question));
    printWrapped(0, top, width(), q);
    int16_t y = top + (int16_t)getWrappedTextHeight(0, width(), q) + 3;
    drawLine(0, y - 2, width() / 3, y - 2, BLACK);
    printWrapped(0, y, width(), parse(s(chosen.answer)));
}

void InkHUD::HoldlineFaqApplet::onButtonLongPress()
{
    index++;
    requestUpdate();
}

// ------------------------------------------------------------------ ask / status / language
void InkHUD::HoldlineAskApplet::setSelecting(bool on)
{
    selecting = on;
    setInputsSubscribed(BUTTON_SHORT, on); // while the list is open, a short press moves the marker
}

void InkHUD::HoldlineAskApplet::onRender(bool)
{
    hl::Unit &unit = holdlineModule->unit();
    drawHeader(parse(ui(hl::Ui::AskTitle)));
    setFont(fontSmall);
    const int16_t line = fontSmall.lineHeight();
    int16_t y = getHeaderHeight() + 2;
    if (!selecting) {
        // State of the unit's own questions, newest last.
        for (size_t i = 0; i < hl::kQuestionSlots; i++) {
            hl::QuestionInfo q = unit.questionAt(i);
            if (q.state == hl::QuestionState::Empty)
                continue;
            hl::Ui id = q.state == hl::QuestionState::Answered ? hl::Ui::QuestionAnswered
                        : q.state == hl::QuestionState::Sent ? hl::Ui::QuestionSent
                                                             : hl::Ui::QuestionWaiting;
            if (y + line > height() - 2 * line)
                break;
            printAt(0, y, parse("#" + std::to_string(q.question_id) + " " + ui(id)));
            y += line;
        }
        if (!lastResult.empty())
            printAt(0, height() - 2 * line, parse(lastResult));
        printAt(0, height() - line, parse(ui(hl::Ui::Language)));
        return;
    }
    const uint8_t first = unit.isRouter() ? hl::kQuestionCategories : 0; // a router asks nothing
    for (uint8_t i = first; i < hl::kQuestionCategories + 2 && y + line <= height(); i++) {
        std::string label = i < hl::kQuestionCategories ? hl::categoryLabel(i + 1, lang()) : i == hl::kQuestionCategories ? ui(hl::Ui::Language) : ui(hl::Ui::Back);
        printAt(0, y, parse((i == item ? "> " : "  ") + label));
        y += line;
    }
}

void InkHUD::HoldlineAskApplet::onButtonShortPress()
{
    item = (uint8_t)((item + 1) % (hl::kQuestionCategories + 2));
    if (holdlineModule->unit().isRouter() && item < hl::kQuestionCategories)
        item = hl::kQuestionCategories;
    requestUpdate();
}

void InkHUD::HoldlineAskApplet::onButtonLongPress()
{
    if (!selecting) {
        item = holdlineModule->unit().isRouter() ? hl::kQuestionCategories : 0;
        lastResult.clear();
        setSelecting(true);
    } else if (item < hl::kQuestionCategories) {
        uint32_t wait = 0;
        hl::Result r = holdlineModule->ask(hl::categoryQuestion(item + 1, lang()), item + 1, wait);
        char buf[80];
        if (r == hl::Result::Ok)
            snprintf(buf, sizeof(buf), "%s", hl::uiText(hl::Ui::QuestionWaiting, lang()));
        else if (r == hl::Result::RateLimited)
            snprintf(buf, sizeof(buf), hl::uiText(hl::Ui::QuestionTooSoon, lang()), (unsigned)((wait + 59) / 60));
        else if (r == hl::Result::NotProvisioned)
            snprintf(buf, sizeof(buf), "%s", hl::uiText(hl::Ui::NotProvisioned, lang()));
        else
            snprintf(buf, sizeof(buf), "%s", hl::resultName(r));
        lastResult = buf;
        setSelecting(false);
    } else if (item == hl::kQuestionCategories) {
        holdlineModule->cycleLanguage(); // SPEC 5.6: the one setting a user may change here
    } else
        setSelecting(false);
    requestUpdate();
}
#endif
