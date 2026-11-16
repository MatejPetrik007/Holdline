// Holdline module for Meshtastic: entry point and the hooks the patch set calls.
// SPDX-License-Identifier: GPL-3.0-only
//
// Dropped into src/modules/optional/Holdline/ by firmware/household/apply-overlay.sh.
// bin/optional-modules.py finds this header and makes Modules.cpp call setupHoldline().
#pragma once
#include "mesh/MeshTypes.h"
#include "mesh/generated/meshtastic/mesh.pb.h"

void setupHoldline();

// ---- hooks called from the patched upstream code (firmware/household/patches)

// NextHopRouter::perhapsRebroadcast: may this received packet be rebroadcast? (SPEC 5.3)
bool holdlineRelayAllowed(const meshtastic_MeshPacket *p);
// FloodingRouter::perhapsCancelDupe: a duplicate was heard; may the pending rebroadcast be dropped?
bool holdlineMayCancelDupe(const meshtastic_MeshPacket *p);
// Router::send: may this packet go on the air? Blocks everything a user could originate
// except a question to the authority (SPEC 5.2). The packet is still decoded here.
bool holdlineSendAllowed(meshtastic_MeshPacket *p);
// MeshModule::callModules: may modules (and through them the phone) see this packet?
bool holdlineDeliverAllowed(const meshtastic_MeshPacket &mp, RxSource src);
// Router.cpp wouldEncryptWithPKC: Holdline packets are never PKI-wrapped, so that relays
// can read the header. Questions carry their own AES-256-GCM layer (SPEC 7.3).
bool holdlineIsOwnPort(const meshtastic_MeshPacket *p);

// Authority gateway (crisis-centre radio). The public firmware defines this weak and
// returning false; the authority's private build overrides it. A unit therefore has no
// code path that lets it originate ALERT, FAQ, CANCEL or KEYS.
bool holdlineGatewayMayOriginate(const meshtastic_MeshPacket *p);
