// Host-only glue for the core tests: RNG and the one symbol the Crypto library
// expects from an Arduino environment. Not part of the firmware.
// SPDX-License-Identifier: GPL-3.0-only
#include "../../hl_crypto.h"
#include <RNG.h>
#include <sys/random.h>

namespace hl
{
bool randomBytes(uint8_t *out, size_t n)
{
    while (n) {
        ssize_t r = getrandom(out, n, 0);
        if (r <= 0)
            continue;
        out += r;
        n -= (size_t)r;
    }
    return true;
}
} // namespace hl

// The Crypto library's key-generation helpers reference a global RNG. The core never
// calls them (it passes its own randomness), but the linker needs the symbols.
RNGClass::RNGClass() {}
RNGClass::~RNGClass() {}
void RNGClass::rand(uint8_t *data, size_t len) { hl::randomBytes(data, len); }
RNGClass CryptRNG;
