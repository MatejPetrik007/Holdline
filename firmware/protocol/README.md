# Holdline protocol, version 1

The application protocol shared by the public household firmware and the authority firmware. This document and [`holdline.proto`](holdline.proto) are normative; [`test-vectors/`](test-vectors/) fixes the bytes.

| File | Contents |
|---|---|
| `holdline.proto` | Message bodies (ALERT, FAQ, CANCEL, KEYS, BUNDLE) |
| `test-vectors/vectors.json` | Encoded packets, signatures, a key agreement and negative cases, made with **throwaway** keys |
| `test-vectors/vectors.txt` | The same data as flat `key = value` lines, for implementations without a JSON parser |
| [`../../tools/hl/codec.mjs`](../../tools/hl/codec.mjs) | Reference codec (JavaScript). `node tools/hl-vectors.mjs` regenerates the vectors from it |

Every key in the vectors is derived from a public seed string. Never use them on a real unit.

## 1. Transport

A Holdline packet is the payload of one Meshtastic data packet on port **300** (private application range). The payload limit is 233 bytes (`DATA_PAYLOAD_LEN`). All multi-byte integers are little-endian.

- ALERT, FAQ, CANCEL and KEYS are sent as a **broadcast** on the authority channel.
- QUESTION is sent to the **node number of a crisis-centre radio**, taken from the key bulletin.
- Holdline packets are encrypted with the channel key only, never wrapped in Meshtastic's per-peer PKI: relays must be able to read the header.

## 2. Packet header (14 bytes, every radio packet)

| Offset | Field | Size | Notes |
|---|---|---|---|
| 0 | `version` | 1 | 1 |
| 1 | `type` | 1 | 1 ALERT, 2 FAQ, 3 QUESTION, 4 CANCEL, 5 KEYS, 6 BUNDLE (wired only) |
| 2 | `msg_id` | 4 | unique per sender; reassembly and dedup key |
| 6 | `part` | 1 | 0-based |
| 7 | `parts` | 1 | total; at most 8 for ALERT / FAQ / CANCEL, 24 for KEYS, 1 for QUESTION |
| 8 | `key_id` | 2 | operational key (ALERT / FAQ / CANCEL), root id (KEYS / BUNDLE), 0 (QUESTION) |
| 10 | `epoch` | 4 | key epoch (ALERT / FAQ / CANCEL), bulletin serial (KEYS / BUNDLE), `unit_id` (QUESTION) |

Up to 219 bytes of chunk follow. Every part except the last carries exactly 219 bytes, so a message can be split in only one way. The chunks in order form the **message**.

KEYS needs more than 8 parts because a hybrid root signature is 3,373 bytes; the limit of 8 in SPEC 6.1 applies to the frequent message types.

**Sealed form** (at rest and on wired links): one header with `part` = 0, followed by the whole message.

## 3. Signed messages

| Type | Message | Signed by |
|---|---|---|
| ALERT, FAQ, CANCEL | `body \|\| ed25519_sig(64)` | an operational key from a key bulletin |
| KEYS, BUNDLE | `body \|\| ed25519_sig(64) \|\| mldsa65_sig(3309)` | a root key; **both** signatures must verify |

`body` is the protobuf message from `holdline.proto`. The signed bytes are

```
context || version(1) || type(1) || msg_id(4) || key_id(2) || epoch(4) || body
```

with `context` = ASCII `HLv1-msg` for operational signatures and `HLv1-root` for root signatures. `part` and `parts` are not signed. Signatures cover the body bytes as sent; a verifier never re-encodes. ML-DSA-65 is used in FIPS 204 pure mode with an empty context string.

### What a unit checks before it shows anything

1. All parts are present; the message reassembles.
2. `key_id` and `epoch` name a key in a root-verified bulletin (a key missing from the newest bulletin is revoked).
3. The Ed25519 signature verifies.
4. The body decodes: valid UTF-8, 1 to 4 languages, the original language is among them.
5. `issued_at` (or `published_at`) lies inside the key's validity window; an alert lives at most 7 days.
6. The key's `scope` covers one of the unit's region codes (empty scope = any).
7. ALERT: not expired, not cancelled, not already held. CANCEL: signed by the same `key_id` as the alert. FAQ: newer than a stored entry with the same `faq_id`.

Relaying happens **before** all of this, on the header alone (section 6).

### Forged parts

A part cannot be verified alone. So that one forged "part 1 of 2" does not block a real alert, a unit keeps up to two different chunks per part and tries the combinations (at most 16) until one verifies.

### Time without a clock

Most units have no battery-backed clock. A unit's time is the maximum of its RTC (if set by GPS or the phone) and the newest authentic timestamp it has seen plus the uptime since. It is stored in flash and never goes back. Without any clock a unit may accept an alert that expired after the newest message it knows.

## 4. QUESTION (type 3)

A single packet; `msg_id` is the unit's question counter and `epoch` carries the `unit_id`.

```
header(14) || AES-256-GCM ciphertext || tag(12)
plaintext = lang(2 ASCII) || category(1) || battery(1; 0..100, 255 = unknown) || text (UTF-8, at most 200 bytes)
nonce     = unit_id(4) || question_id(4) || 00 00 00 01
AAD       = the 14 header bytes
key       = the per-unit key from provisioning (section 5)
```

The language and the category are inside the ciphertext. The question counter is the nonce counter: a unit reserves counter values in flash in blocks of 16 before using them, so a power cut cannot make it reuse one.

**Question reference.** The authority answers by publishing an FAQ entry. `Faq.answers_question_ref` = the first 4 bytes (little-endian; 0 is replaced by 1) of `HMAC-SHA-256(unit_key, "HLv1-qref" || unit_id(4) || question_id(4))`. Only the asking unit and the authority can compute it, so the public FAQ does not say who asked.

Limits (defaults; the bundle can change the first two): 1 question per 10 minutes and 10 per 24 hours per unit; each question is transmitted at most 3 times (at once, after 10 minutes, after 1 hour).

## 5. Provisioning (wired)

### Key agreement

Hybrid ML-KEM-768 + X25519. The unit generates both key pairs and sends the public keys; the station encapsulates and sends `mlkem_ct(1088) || x25519_station_pub(32) || unit_id(4)`.

```
salt     = SHA-256("HLv1 unit-key" || mlkem_pub || x25519_unit_pub || mlkem_ct || x25519_station_pub)
unit_key = HKDF-SHA-256(ikm = mlkem_ss || x25519_ss, salt, info = "holdline unit key v1" || unit_id(4), 32 bytes)
confirm  = HMAC-SHA-256(unit_key, "HLv1-kc" || salt)[0..16]
```

The unit returns `confirm`; the station compares it with its own.

### Bundle

Type 6, root-signed, sealed form. It carries the regions, the channel name and key, the modem preset, the remote-admin key, additional roots, the current key bulletins, the role and the question limits. A unit accepts a bundle only from a root **compiled into its firmware**; roots added by a bundle are trusted for key bulletins, not for bundles. After `LOCK` a unit refuses a new key agreement; a bundle with a higher serial from the same root is still accepted.

### Local link

Requests and replies travel in the Meshtastic client API (USB serial or the paired phone) as data packets on port 300 addressed to the unit's own node number. A unit accepts them from that API only, never from the radio.

```
request:  A1 | op      | seq u16 | total u16 | data (at most 227 B)
reply:    A1 | op|0x80 | status  | seq u16   | total u16 | data (at most 226 B)
```

| Op | Name | Request | Reply data |
|---|---|---|---|
| 01 | HELLO | | flags, `unit_id`, version, language, node number, version floor, board |
| 02 | KEM_BEGIN | | `total` = number of chunks to read |
| 03 | READ | `seq` | chunk of `mlkem_pub(1184) \|\| x25519_pub(32)` |
| 04 | WRITE | `seq`, `total`, data | upload buffer, at most 24 KiB |
| 05 | KEM_FINISH | (upload) | `confirm(16)` |
| 06 | BUNDLE | (upload: sealed bundle) | |
| 07 | SET_LANG | 2-letter code | |
| 08 | LOCK | | unit restarts |
| 09 | ASK | `category(1) \|\| text` | seconds to wait, if rate limited |
| 0a | SEALED | (upload: sealed KEYS) | |
| 10 | UPDATE_BEGIN | manifest length; upload = `manifest.json \|\| manifest.sig` | |
| 11 | UPDATE_DATA | image bytes | |
| 12 | UPDATE_END | | unit restarts |

`status` is the result code of the unit engine (`hl::Result` in [`../household/core/hl_base.h`](../household/core/hl_base.h)); 0 is success.

## 6. Relay policy

A unit rebroadcasts a received packet only if it is on port 300, its header is well formed and it is either

- type ALERT, FAQ, CANCEL or KEYS, sent as a broadcast, or
- type QUESTION, a single part, addressed to a crisis-centre node number from a verified bulletin.

Rate limits, per relaying unit: authority packets 40 in a burst, then 120 per hour; questions 6 per hour per source node and 20 in a burst, then 60 per hour in total. Everything else is dropped. A forged alert may therefore be relayed, but it is never displayed.

A household drops its pending rebroadcast after it has heard **two** other rebroadcasts of the same packet (stock Meshtastic: one). See [`../DECISIONS.md`](../DECISIONS.md).

## 7. Sizes

The alert of the website demo, as real packets (header and signature included):

| Languages | Body | Signed message | Packets |
|---|---|---|---|
| PL | 111 B | 175 B | 1 |
| PL + CS | 207 B | 271 B | 2 |
| PL + CS + EN | 303 B | 367 B | 2 |

The website demo counts text bytes only (89 / 182 / 275 B) and therefore shows PL + CS as one packet. A KEYS bulletin with two keys is 3,527 bytes: 17 packets.
