// Accessibility add-ons (SPEC 5.8, hardware/addons/README.md).
// SPDX-License-Identifier: GPL-3.0-only
//
//   vibration motor   GPIO, patterns: short-short = message, long = alert, one short = key echo
//   Braille keyboard  I2C, CardKB-compatible, address 0x5F: free-text questions
//   haptic band Pro   UART, one text line per event; lines from the band are questions
//
// Pins come from the variant (HOLDLINE_VIBRA_PIN, HOLDLINE_BAND_RX/TX); a board without
// them simply has no such add-on. NOT YET TESTED ON HARDWARE.
#include "HoldlineModule.h"
#include "configuration.h"
#include <Wire.h>

namespace
{
constexpr uint8_t kKeyboardAddr = 0x5F;
char typed[hl::kQuestionTextMax + 1];
size_t typedLen = 0;
char bandLine[hl::kQuestionTextMax + 8];
size_t bandLen = 0;
bool keyboardPresent = false;

// Vibration pattern as on/off durations in units of 100 ms; 0 ends it.
const uint8_t kPatternMessage[] = {2, 2, 2, 0};
const uint8_t kPatternAlert[] = {15, 0};
const uint8_t kPatternKey[] = {1, 0};
const uint8_t *pattern = nullptr;
uint8_t patternStep = 0, patternLeft = 0;

void motor(bool on)
{
#ifdef HOLDLINE_VIBRA_PIN
    digitalWrite(HOLDLINE_VIBRA_PIN, on ? HIGH : LOW);
#else
    (void)on;
#endif
}

void submit(char *text, size_t &len)
{
    while (len && (text[len - 1] == ' ' || text[len - 1] == '\r'))
        len--;
    text[len] = 0;
    if (len && holdlineModule) {
        uint32_t wait = 0;
        hl::Result r = holdlineModule->ask(text, 0, wait);
        // Feedback the user can feel: accepted = message pattern, refused = long buzz.
        holdline::haptic(r == hl::Result::Ok ? 0 : 1);
        char line[64];
        snprintf(line, sizeof(line), "HL ASK result=%s wait=%u", hl::resultName(r), (unsigned)wait);
        holdline::bandSend(line);
    }
    len = 0;
}
} // namespace

namespace holdline
{
void addonsBegin()
{
#ifdef HOLDLINE_VIBRA_PIN
    pinMode(HOLDLINE_VIBRA_PIN, OUTPUT);
    digitalWrite(HOLDLINE_VIBRA_PIN, LOW);
#endif
#if defined(HOLDLINE_BAND_RX) && defined(HOLDLINE_BAND_TX)
    Serial1.begin(9600, SERIAL_8N1, HOLDLINE_BAND_RX, HOLDLINE_BAND_TX);
#endif
#if defined(I2C_SDA) && !defined(HOLDLINE_NO_BRAILLE_KEYBOARD)
    Wire.beginTransmission(kKeyboardAddr);
    keyboardPresent = Wire.endTransmission() == 0;
#endif
}

void haptic(uint8_t kind)
{
    pattern = kind == 1 ? kPatternAlert : kind == 2 ? kPatternKey : kPatternMessage;
    patternStep = 0;
    patternLeft = pattern[0];
    motor(true);
}

void bandSend(const char *line)
{
#if defined(HOLDLINE_BAND_RX) && defined(HOLDLINE_BAND_TX)
    Serial1.print(line);
    Serial1.print('\n');
#else
    (void)line;
#endif
}

void addonsPoll() // every 100 ms
{
    if (pattern) {
        if (patternLeft)
            patternLeft--;
        if (patternLeft == 0) {
            patternStep++;
            if (pattern[patternStep] == 0) {
                pattern = nullptr;
                motor(false);
            } else {
                patternLeft = pattern[patternStep];
                motor(patternStep % 2 == 0);
            }
        }
    }
    if (keyboardPresent) {
        // CardKB protocol: one byte per key press, 0 when nothing was typed.
        while (Wire.requestFrom((int)kKeyboardAddr, 1) == 1) {
            int c = Wire.read();
            if (c <= 0)
                break;
            if (c == '\r' || c == '\n')
                submit(typed, typedLen);
            else if (c == 0x08 || c == 0x7f) {
                while (typedLen && ((uint8_t)typed[typedLen - 1] & 0xc0) == 0x80)
                    typedLen--; // step back over a whole UTF-8 character
                if (typedLen)
                    typedLen--;
                haptic(2);
            } else if (c >= 0x20 && typedLen < hl::kQuestionTextMax) {
                typed[typedLen++] = (char)c;
                haptic(2); // echo each character as a pulse
            }
        }
    }
#if defined(HOLDLINE_BAND_RX) && defined(HOLDLINE_BAND_TX)
    while (Serial1.available()) {
        int c = Serial1.read();
        if (c == '\n') {
            // The band sends "ASK <text>"; anything else is ignored.
            bandLine[bandLen] = 0;
            if (bandLen > 4 && strncmp(bandLine, "ASK ", 4) == 0) {
                size_t n = bandLen - 4;
                memmove(bandLine, bandLine + 4, n);
                submit(bandLine, n);
            }
            bandLen = 0;
        } else if (c >= 0 && bandLen < sizeof(bandLine) - 1)
            bandLine[bandLen++] = (char)c;
    }
#endif
}
} // namespace holdline
