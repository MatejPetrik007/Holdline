# Host build of the Holdline core and its tests (no Arduino, no radio).
# SPDX-License-Identifier: GPL-3.0-only
#
#   cmake -S firmware/household/core -B build/core -DHL_DEPS=<dir with Crypto/, mldsa-native/, mlkem-native/>
#   cmake --build build/core && ctest --test-dir build/core --output-on-failure
#
# firmware/household/fetch-deps.sh creates that directory at the pinned commits (UPSTREAM).
cmake_minimum_required(VERSION 3.16)
project(holdline_core C CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE RelWithDebInfo)
endif()
set(HL_DEPS "" CACHE PATH "Directory with the pinned Crypto, mldsa-native and mlkem-native checkouts")
if(NOT EXISTS "${HL_DEPS}/Crypto/Ed25519.cpp")
  message(FATAL_ERROR "HL_DEPS must point to the dependency checkouts; run firmware/household/fetch-deps.sh")
endif()
option(HL_SANITIZE "Build with AddressSanitizer and UBSan" ON)

set(REPO_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../..")
set(CRYPTO "${HL_DEPS}/Crypto")

add_library(holdline_core STATIC
  hl_codec.cpp hl_kem.cpp hl_manifest.cpp hl_question.cpp hl_reasm.cpp hl_relay.cpp
  hl_sha256.cpp hl_text.cpp hl_trust.cpp hl_unit.cpp
  backend/hl_crypto_meshtastic.cpp backend/hl_mldsa.c backend/hl_mlkem.c
  # The same Crypto library sources the firmware links, built for the host.
  ${CRYPTO}/Ed25519.cpp ${CRYPTO}/Curve25519.cpp ${CRYPTO}/SHA512.cpp ${CRYPTO}/BigNumberUtil.cpp
  ${CRYPTO}/Hash.cpp ${CRYPTO}/Crypto.cpp ${CRYPTO}/GCM.cpp ${CRYPTO}/GHASH.cpp ${CRYPTO}/GF128.cpp
  ${CRYPTO}/AES256.cpp ${CRYPTO}/AESCommon.cpp ${CRYPTO}/AuthenticatedCipher.cpp ${CRYPTO}/Cipher.cpp
  ${CRYPTO}/BlockCipher.cpp
  test/host/host_platform.cpp)
target_include_directories(holdline_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR} PRIVATE backend ${HL_DEPS} ${CRYPTO})
target_compile_options(holdline_core PRIVATE -Wall -Wextra)
set_source_files_properties(
  ${CRYPTO}/Ed25519.cpp ${CRYPTO}/Curve25519.cpp ${CRYPTO}/SHA512.cpp ${CRYPTO}/BigNumberUtil.cpp
  ${CRYPTO}/Hash.cpp ${CRYPTO}/Crypto.cpp ${CRYPTO}/GCM.cpp ${CRYPTO}/GHASH.cpp ${CRYPTO}/GF128.cpp
  ${CRYPTO}/AES256.cpp ${CRYPTO}/AESCommon.cpp ${CRYPTO}/AuthenticatedCipher.cpp ${CRYPTO}/Cipher.cpp
  ${CRYPTO}/BlockCipher.cpp backend/hl_mldsa.c backend/hl_mlkem.c
  PROPERTIES COMPILE_OPTIONS "-w")
if(HL_SANITIZE)
  target_compile_options(holdline_core PUBLIC -fsanitize=address,undefined -fno-omit-frame-pointer)
  target_link_options(holdline_core PUBLIC -fsanitize=address,undefined)
endif()
find_package(Threads REQUIRED)

enable_testing()
set(VECTORS "${REPO_ROOT}/firmware/protocol/test-vectors/vectors.txt")
add_executable(test_core test/test_core.cpp)
target_link_libraries(test_core holdline_core Threads::Threads)
add_test(NAME core COMMAND test_core ${VECTORS} ${REPO_ROOT})
add_executable(test_sim test/test_sim.cpp)
target_link_libraries(test_sim holdline_core Threads::Threads)
add_test(NAME flooding_simulator COMMAND test_sim ${VECTORS} ${REPO_ROOT})
