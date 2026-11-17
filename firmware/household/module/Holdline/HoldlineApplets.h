// E-Ink screens of a Holdline unit, as InkHUD applets.
// SPDX-License-Identifier: GPL-3.0-only
//
// InkHUD is upstream's E-Ink user interface. Its Windows-1250 fonts (selected by the
// OLED_CS build flag) cover Czech and Polish at the same time, which the older screen
// stack cannot do. One button: short press = next screen, long press = the screen's action.
// NOT YET TESTED ON HARDWARE.
#pragma once
#include "configuration.h"

#ifdef MESHTASTIC_INCLUDE_INKHUD
#include "graphics/niche/InkHUD/Applet.h"
#include "graphics/niche/InkHUD/InkHUD.h"

namespace NicheGraphics::InkHUD
{
// The current alert in the unit's language (SPEC 5.4). Long press: text size.
class HoldlineAlertApplet : public Applet
{
  public:
    // Called by the module when something changed. bringToFront: show this screen now, with a full refresh.
    void refresh(bool bringToFront = false)
    {
        if (bringToFront) {
            requestAutoshow();
            requestUpdate(Drivers::EInk::UpdateTypes::FULL); // SPEC 5.4: full refresh for an alert
        } else
            requestUpdate();
    }
    void onActivate() override { setInputsSubscribed(BUTTON_LONG, true); }
    void onRender(bool full) override;
    void onButtonLongPress() override;
};

// The authority's answers (SPEC 5.5). Long press: next entry.
class HoldlineFaqApplet : public Applet
{
  public:
    // Called by the module when something changed. bringToFront: show this screen now, with a full refresh.
    void refresh(bool bringToFront = false)
    {
        if (bringToFront) {
            requestAutoshow();
            requestUpdate(Drivers::EInk::UpdateTypes::FULL); // SPEC 5.4: full refresh for an alert
        } else
            requestUpdate();
    }
    void onActivate() override { setInputsSubscribed(BUTTON_LONG, true); }
    void onRender(bool full) override;
    void onButtonLongPress() override;

  private:
    size_t index = 0;
};

// Ask the authority with predefined questions, see the state of own questions, and
// change the display language (SPEC 5.5, 5.6). Long press opens the list; then short
// press = next item, long press = choose.
class HoldlineAskApplet : public Applet
{
  public:
    // Called by the module when something changed. bringToFront: show this screen now, with a full refresh.
    void refresh(bool bringToFront = false)
    {
        if (bringToFront) {
            requestAutoshow();
            requestUpdate(Drivers::EInk::UpdateTypes::FULL); // SPEC 5.4: full refresh for an alert
        } else
            requestUpdate();
    }
    void onActivate() override { setInputsSubscribed(BUTTON_LONG, true); }
    void onBackground() override { setSelecting(false); }
    void onRender(bool full) override;
    void onButtonLongPress() override;
    void onButtonShortPress() override;

  private:
    void setSelecting(bool on);
    bool selecting = false;
    uint8_t item = 0;         // 0..4 = question category 1..5, 5 = language, 6 = back
    std::string lastResult;   // feedback line after sending
};
} // namespace NicheGraphics::InkHUD

// Called from the variant's nicheGraphics.h (patched by apply-overlay.sh) in place of the
// stock applet list.
void holdlineAddApplets(NicheGraphics::InkHUD::InkHUD *inkhud);
#endif

// The module tells the screens that something changed. kind: 1 = new alert (bring it to
// the front with a full refresh), 0 = anything else. A no-op on builds without InkHUD.
void holdlineUiChanged(uint8_t kind);
