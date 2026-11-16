/* Single-compilation-unit build of mldsa-native with the Holdline configuration.
 * SPDX-License-Identifier: GPL-3.0-only
 * The include path must contain the mldsa-native checkout (see UPSTREAM). */
#define MLD_CONFIG_FILE "hl_mldsa_config.h"
#include "mldsa-native/mldsa/mldsa_native.c"
