/* Single-compilation-unit build of mlkem-native with the Holdline configuration.
 * SPDX-License-Identifier: GPL-3.0-only
 * The include path must contain the mlkem-native checkout (see UPSTREAM). */
#define MLK_CONFIG_FILE "hl_mlkem_config.h"
#include "mlkem-native/mlkem/mlkem_native.c"
