/* mlkem-native configuration for Holdline: ML-KEM-768, deterministic API only
 * (the caller supplies the randomness from the platform RNG).
 * SPDX-License-Identifier: GPL-3.0-only */
#ifndef HL_MLKEM_CONFIG_H
#define HL_MLKEM_CONFIG_H
#define MLK_CONFIG_PARAMETER_SET 768
#define MLK_CONFIG_NAMESPACE_PREFIX hl_mlkem
#define MLK_CONFIG_NO_RANDOMIZED_API
#define MLK_CONFIG_CUSTOM_ALLOC_FREE
#if !defined(__ASSEMBLER__)
#include <stdlib.h>
#define MLK_CUSTOM_ALLOC(v, T, N) T *(v) = (T *)aligned_alloc(MLK_DEFAULT_ALIGN, MLK_ALIGN_UP(sizeof(T) * (N)))
#define MLK_CUSTOM_FREE(v, T, N) free(v)
#endif
#endif
