/* mldsa-native configuration for Holdline: ML-DSA-65, verification only.
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * A unit never signs and never generates ML-DSA keys, so those APIs are compiled out.
 * Large working buffers come from the heap instead of the (small) task stack. */
#ifndef HL_MLDSA_CONFIG_H
#define HL_MLDSA_CONFIG_H
#define MLD_CONFIG_PARAMETER_SET 65
#define MLD_CONFIG_NAMESPACE_PREFIX hl_mldsa
#define MLD_CONFIG_NO_KEYPAIR_API
#define MLD_CONFIG_NO_SIGN_API
#define MLD_CONFIG_NO_RANDOMIZED_API
#define MLD_CONFIG_REDUCE_RAM
#define MLD_CONFIG_CUSTOM_ALLOC_FREE
#if !defined(__ASSEMBLER__)
#include <stdlib.h>
#define MLD_CUSTOM_ALLOC(v, T, N) T *(v) = (T *)aligned_alloc(MLD_DEFAULT_ALIGN, MLD_ALIGN_UP(sizeof(T) * (N)))
#define MLD_CUSTOM_FREE(v, T, N) free(v)
#endif
#endif
