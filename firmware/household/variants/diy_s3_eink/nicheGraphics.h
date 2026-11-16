// InkHUD setup of the Holdline DIY node. SPDX-License-Identifier: GPL-3.0-only
#pragma once

#include "configuration.h"

#ifdef MESHTASTIC_INCLUDE_NICHE_GRAPHICS

#include "graphics/niche/InkHUD/InkHUD.h"
#ifdef HOLDLINE
#include "modules/optional/Holdline/HoldlineApplets.h"
#endif

#include "graphics/niche/Drivers/EInk/DEPG0213BNS800.h" // 2.13" 250x122, the "GxEPD2_213_BN" panel
#include "graphics/niche/Inputs/TwoButton.h"

void setupNicheGraphics()
{
    using namespace NicheGraphics;

    SPIClass *hspi = new SPIClass(HSPI);
    hspi->begin(PIN_EINK_SCLK, -1, PIN_EINK_MOSI, PIN_EINK_CS);

    Drivers::EInk *driver = new Drivers::DEPG0213BNS800;
    driver->begin(hspi, PIN_EINK_DC, PIN_EINK_CS, PIN_EINK_BUSY, PIN_EINK_RES);

    InkHUD::InkHUD *inkhud = InkHUD::InkHUD::getInstance();
    inkhud->setDriver(driver);
    inkhud->setDisplayResilience(10, 1.5);

    InkHUD::Applet::fontLarge = FREESANS_12PT;
    InkHUD::Applet::fontMedium = FREESANS_9PT;
    InkHUD::Applet::fontSmall = FREESANS_6PT;

    inkhud->persistence->settings.userTiles.maxCount = 1;
    inkhud->persistence->settings.rotation = 3;
    inkhud->persistence->settings.userTiles.count = 1;

    holdlineAddApplets(inkhud); // Holdline: alert, FAQ, ask
    inkhud->begin();

    Inputs::TwoButton *buttons = Inputs::TwoButton::getInstance();
    buttons->setWiring(0, Inputs::TwoButton::getUserButtonPin());
    buttons->setHandlerShortPress(0, [inkhud]() { inkhud->shortpress(); });
    buttons->setHandlerLongPress(0, [inkhud]() { inkhud->longpress(); });
    buttons->start();
}

#endif
