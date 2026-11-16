// Holdline protocol v1: reference codec in JavaScript.
// SPDX-License-Identifier: GPL-3.0-only
//
// This file is the reference the published test vectors are generated from
// (tools/hl-vectors.mjs). The firmware (firmware/household/core) is a separate
// implementation tested against those vectors. Wire format: firmware/protocol/README.md.
import { ed25519, x25519 } from '@noble/curves/ed25519.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { createHash, createHmac, createCipheriv, createDecipheriv, hkdfSync } from 'node:crypto';

export const PORTNUM = 300;
export const VERSION = 1;
export const HEADER_LEN = 14;
export const MAX_PAYLOAD = 233;
export const MAX_CHUNK = MAX_PAYLOAD - HEADER_LEN; // 219
export const MAX_PARTS = 8;
export const MAX_PARTS_ROOT = 24;
export const ED_SIG_LEN = 64;
export const MLDSA_SIG_LEN = 3309;
export const MLDSA_PK_LEN = 1952;
export const GCM_TAG_LEN = 12;
export const QUESTION_TEXT_MAX = 200;
export const Type = { ALERT: 1, FAQ: 2, QUESTION: 3, CANCEL: 4, KEYS: 5, BUNDLE: 6 };
export const Severity = { INFO: 1, WARNING: 2, DANGER: 3 };
export const BATTERY_UNKNOWN = 0xff;

const te = new TextEncoder();
const td = new TextDecoder('utf-8', { fatal: true });
const CTX_MSG = te.encode('HLv1-msg');
const CTX_ROOT = te.encode('HLv1-root');
const CTX_QREF = te.encode('HLv1-qref');
const CTX_UNITKEY_SALT = te.encode('HLv1 unit-key');
const CTX_UNITKEY_INFO = te.encode('holdline unit key v1');
const CTX_KEYCONFIRM = te.encode('HLv1-kc');

export const hex = (u8) => Buffer.from(u8).toString('hex');
export const unhex = (s) => new Uint8Array(Buffer.from(s, 'hex'));
export const concat = (...a) => new Uint8Array(Buffer.concat(a.map((x) => Buffer.from(x))));
export const sha256 = (...a) => new Uint8Array(createHash('sha256').update(concat(...a)).digest());
const u32le = (v) => { const b = Buffer.alloc(4); b.writeUInt32LE(v >>> 0); return new Uint8Array(b); };
const u16le = (v) => { const b = Buffer.alloc(2); b.writeUInt16LE(v); return new Uint8Array(b); };

// ---------------------------------------------------------------- protobuf
class Writer {
  constructor() { this.b = []; }
  varint(v) { v = Number(v); if (v < 0 || !Number.isSafeInteger(v)) throw new Error('varint range'); while (v > 0x7f) { this.b.push((v % 128) | 0x80); v = Math.floor(v / 128); } this.b.push(v); return this; }
  tag(field, wt) { return this.varint(field * 8 + wt); }
  uint(field, v) { if (v) this.tag(field, 0).varint(v); return this; }
  fixed32(field, v) { if (v) { this.tag(field, 5); this.b.push(...u32le(v)); } return this; }
  bytes(field, u8) { if (u8 && u8.length) { this.tag(field, 2).varint(u8.length); this.b.push(...u8); } return this; }
  str(field, s) { return this.bytes(field, te.encode(s ?? '')); }
  // Sub-messages and repeated elements are always written, even when empty.
  msg(field, u8) { this.tag(field, 2).varint(u8.length); this.b.push(...u8); return this; }
  done() { return new Uint8Array(this.b); }
}

function* fields(u8) {
  let p = 0;
  const varint = () => { let v = 0, m = 1; for (let i = 0; i < 10; i++) { if (p >= u8.length) throw new Error('truncated varint'); const c = u8[p++]; v += (c & 0x7f) * m; m *= 128; if (!(c & 0x80)) return v; } throw new Error('varint too long'); };
  while (p < u8.length) {
    const key = varint(); const field = Math.floor(key / 8); const wt = key & 7;
    if (field === 0) throw new Error('field 0');
    if (wt === 0) yield { field, wt, value: varint() };
    else if (wt === 5) { if (p + 4 > u8.length) throw new Error('truncated'); yield { field, wt, value: Buffer.from(u8.buffer, u8.byteOffset + p, 4).readUInt32LE() }; p += 4; }
    else if (wt === 1) { if (p + 8 > u8.length) throw new Error('truncated'); p += 8; }
    else if (wt === 2) { const n = varint(); if (p + n > u8.length) throw new Error('truncated'); yield { field, wt, value: u8.subarray(p, p + n) }; p += n; }
    else throw new Error('unsupported wire type');
  }
}

// ---------------------------------------------------------------- bodies
export function encodeAlert(a) {
  const w = new Writer().uint(1, a.severity).fixed32(2, a.issued_at).fixed32(3, a.expires_at).uint(4, a.template_code).str(5, a.original_lang);
  for (const t of a.texts) w.msg(6, new Writer().str(1, t.lang).str(2, t.text).done());
  return w.done();
}
export function decodeAlert(u8) {
  const a = { severity: 0, issued_at: 0, expires_at: 0, template_code: 0, original_lang: '', texts: [] };
  for (const f of fields(u8)) {
    if (f.field === 1 && f.wt === 0) a.severity = f.value;
    else if (f.field === 2 && f.wt === 5) a.issued_at = f.value;
    else if (f.field === 3 && f.wt === 5) a.expires_at = f.value;
    else if (f.field === 4 && f.wt === 0) a.template_code = f.value;
    else if (f.field === 5 && f.wt === 2) a.original_lang = td.decode(f.value);
    else if (f.field === 6 && f.wt === 2) { const t = { lang: '', text: '' }; for (const g of fields(f.value)) { if (g.field === 1 && g.wt === 2) t.lang = td.decode(g.value); else if (g.field === 2 && g.wt === 2) t.text = td.decode(g.value); } a.texts.push(t); }
  }
  return a;
}
export function encodeFaq(q) {
  const w = new Writer().uint(1, q.faq_id).fixed32(2, q.answers_question_ref).fixed32(3, q.published_at);
  for (const e of q.entries) w.msg(4, new Writer().str(1, e.lang).str(2, e.question).str(3, e.answer).done());
  return w.done();
}
export function decodeFaq(u8) {
  const q = { faq_id: 0, answers_question_ref: 0, published_at: 0, entries: [] };
  for (const f of fields(u8)) {
    if (f.field === 1 && f.wt === 0) q.faq_id = f.value;
    else if (f.field === 2 && f.wt === 5) q.answers_question_ref = f.value;
    else if (f.field === 3 && f.wt === 5) q.published_at = f.value;
    else if (f.field === 4 && f.wt === 2) { const e = { lang: '', question: '', answer: '' }; for (const g of fields(f.value)) { if (g.wt !== 2) continue; if (g.field === 1) e.lang = td.decode(g.value); else if (g.field === 2) e.question = td.decode(g.value); else if (g.field === 3) e.answer = td.decode(g.value); } q.entries.push(e); }
  }
  return q;
}
export const encodeCancel = (c) => new Writer().fixed32(1, c.cancels_msg_id).fixed32(2, c.issued_at).done();
export function decodeCancel(u8) {
  const c = { cancels_msg_id: 0, issued_at: 0 };
  for (const f of fields(u8)) { if (f.wt !== 5) continue; if (f.field === 1) c.cancels_msg_id = f.value; else if (f.field === 2) c.issued_at = f.value; }
  return c;
}
export function encodeKeys(k) {
  const w = new Writer().uint(1, k.root_id).uint(2, k.serial).fixed32(3, k.issued_at);
  for (const e of k.keys) {
    const x = new Writer().uint(1, e.key_id).uint(2, e.epoch).fixed32(3, e.valid_from).fixed32(4, e.valid_to).uint(5, e.alg ?? 1).bytes(6, e.public_key);
    for (const s of e.scope ?? []) x.msg(7, te.encode(s));
    if (e.node_ids?.length) x.bytes(8, concat(...e.node_ids.map(u32le))); // packed, as proto3 encoders do
    w.msg(4, x.done());
  }
  return w.done();
}
export function decodeKeys(u8) {
  const k = { root_id: 0, serial: 0, issued_at: 0, keys: [] };
  for (const f of fields(u8)) {
    if (f.field === 1 && f.wt === 0) k.root_id = f.value;
    else if (f.field === 2 && f.wt === 0) k.serial = f.value;
    else if (f.field === 3 && f.wt === 5) k.issued_at = f.value;
    else if (f.field === 4 && f.wt === 2) {
      const e = { key_id: 0, epoch: 0, valid_from: 0, valid_to: 0, alg: 0, public_key: new Uint8Array(0), scope: [], node_ids: [] };
      for (const g of fields(f.value)) {
        if (g.field === 1 && g.wt === 0) e.key_id = g.value; else if (g.field === 2 && g.wt === 0) e.epoch = g.value;
        else if (g.field === 3 && g.wt === 5) e.valid_from = g.value; else if (g.field === 4 && g.wt === 5) e.valid_to = g.value;
        else if (g.field === 5 && g.wt === 0) e.alg = g.value; else if (g.field === 6 && g.wt === 2) e.public_key = new Uint8Array(g.value);
        else if (g.field === 7 && g.wt === 2) e.scope.push(td.decode(g.value));
        else if (g.field === 8 && g.wt === 5) e.node_ids.push(g.value);
        else if (g.field === 8 && g.wt === 2) for (let i = 0; i + 4 <= g.value.length; i += 4) e.node_ids.push(Buffer.from(g.value).readUInt32LE(i)); // packed
      }
      k.keys.push(e);
    }
  }
  return k;
}
export function encodeBundle(b) {
  const w = new Writer().uint(1, b.root_id).uint(2, b.serial).fixed32(3, b.issued_at);
  for (const r of b.regions ?? []) w.msg(4, te.encode(r));
  w.str(5, b.channel_name).bytes(6, b.channel_psk).uint(7, b.modem_preset).bytes(8, b.admin_key);
  for (const r of b.extra_roots ?? []) w.msg(9, new Writer().uint(1, r.root_id).bytes(2, r.ed25519).bytes(3, r.mldsa65).done());
  for (const k of b.keys ?? []) w.msg(10, k);
  return w.uint(11, b.role).uint(12, b.question_min_interval_s).uint(13, b.question_max_per_day).done();
}
export function decodeBundle(u8) {
  const b = { root_id: 0, serial: 0, issued_at: 0, regions: [], channel_name: '', channel_psk: new Uint8Array(0), modem_preset: 0, admin_key: new Uint8Array(0), extra_roots: [], keys: [], role: 0, question_min_interval_s: 0, question_max_per_day: 0 };
  for (const f of fields(u8)) {
    if (f.wt === 0) { if (f.field === 1) b.root_id = f.value; else if (f.field === 2) b.serial = f.value; else if (f.field === 7) b.modem_preset = f.value; else if (f.field === 11) b.role = f.value; else if (f.field === 12) b.question_min_interval_s = f.value; else if (f.field === 13) b.question_max_per_day = f.value; }
    else if (f.wt === 5) { if (f.field === 3) b.issued_at = f.value; }
    else if (f.wt === 2) {
      if (f.field === 4) b.regions.push(td.decode(f.value)); else if (f.field === 5) b.channel_name = td.decode(f.value);
      else if (f.field === 6) b.channel_psk = new Uint8Array(f.value); else if (f.field === 8) b.admin_key = new Uint8Array(f.value);
      else if (f.field === 9) { const r = { root_id: 0, ed25519: new Uint8Array(0), mldsa65: new Uint8Array(0) }; for (const g of fields(f.value)) { if (g.field === 1 && g.wt === 0) r.root_id = g.value; else if (g.field === 2 && g.wt === 2) r.ed25519 = new Uint8Array(g.value); else if (g.field === 3 && g.wt === 2) r.mldsa65 = new Uint8Array(g.value); } b.extra_roots.push(r); }
      else if (f.field === 10) b.keys.push(new Uint8Array(f.value));
    }
  }
  return b;
}

// ---------------------------------------------------------------- header, split, sealed form
export function encodeHeader(h) {
  return concat([VERSION, h.type], u32le(h.msg_id), [h.part, h.parts], u16le(h.key_id), u32le(h.epoch));
}
export function decodeHeader(u8) {
  if (u8.length < HEADER_LEN) throw new Error('short packet');
  const b = Buffer.from(u8.buffer, u8.byteOffset, u8.length);
  const h = { version: b[0], type: b[1], msg_id: b.readUInt32LE(2), part: b[6], parts: b[7], key_id: b.readUInt16LE(8), epoch: b.readUInt32LE(10) };
  if (h.version !== VERSION) throw new Error('unsupported version');
  return h;
}
export const maxParts = (type) => (type === Type.KEYS || type === Type.BUNDLE ? MAX_PARTS_ROOT : type === Type.QUESTION ? 1 : MAX_PARTS);

/** Split a message into radio packets (header + chunk each). */
export function split(h, message) {
  const parts = Math.max(1, Math.ceil(message.length / MAX_CHUNK));
  if (parts > maxParts(h.type)) throw new Error(`message of ${message.length} B needs ${parts} parts, max ${maxParts(h.type)}`);
  const out = [];
  for (let i = 0; i < parts; i++) out.push(concat(encodeHeader({ ...h, part: i, parts }), message.subarray(i * MAX_CHUNK, (i + 1) * MAX_CHUNK)));
  return out;
}
/** Reassemble packets (any order, no duplicates) into { header, message }. */
export function join(packets) {
  const hs = packets.map((p) => ({ h: decodeHeader(p), chunk: p.subarray(HEADER_LEN) })).sort((a, b) => a.h.part - b.h.part);
  const h0 = hs[0].h;
  if (hs.length !== h0.parts) throw new Error('missing parts');
  hs.forEach((x, i) => { if (x.h.part !== i || x.h.parts !== h0.parts || x.h.msg_id !== h0.msg_id || x.h.type !== h0.type || x.h.key_id !== h0.key_id || x.h.epoch !== h0.epoch) throw new Error('inconsistent parts'); });
  return { header: { ...h0, part: 0 }, message: concat(...hs.map((x) => x.chunk)) };
}
/** Sealed form: one header (part 0) followed by the whole message. Used at rest and on wired links. */
export function seal(h, message) {
  const parts = Math.max(1, Math.ceil(message.length / MAX_CHUNK));
  if (parts > 255) throw new Error('message too long to seal');
  return concat(encodeHeader({ ...h, part: 0, parts }), message);
}
export function unseal(sealed) {
  const header = decodeHeader(sealed);
  return { header, message: sealed.subarray(HEADER_LEN) };
}

// ---------------------------------------------------------------- signatures
const tbs = (ctx, h, body) => concat(ctx, [VERSION, h.type], u32le(h.msg_id), u16le(h.key_id), u32le(h.epoch), body);

/** ALERT / FAQ / CANCEL: returns message = body || sig. `sign(tbsBytes)` returns a 64-byte Ed25519 signature. */
export function signMessage(h, body, sign) { return concat(body, sign(tbs(CTX_MSG, h, body))); }
export function tbsMessage(h, body) { return tbs(CTX_MSG, h, body); }
export function tbsRoot(h, body) { return tbs(CTX_ROOT, h, body); }
export function verifyMessage(h, message, edPub) {
  if (message.length < ED_SIG_LEN) return null;
  const body = message.subarray(0, message.length - ED_SIG_LEN);
  return ed25519.verify(message.subarray(message.length - ED_SIG_LEN), tbs(CTX_MSG, h, body), edPub) ? body : null;
}
/** KEYS / BUNDLE: message = body || ed_sig || mldsa_sig. */
export function signRoot(h, body, root) {
  const t = tbs(CTX_ROOT, h, body);
  return concat(body, ed25519.sign(t, root.edSecret), ml_dsa65.sign(t, root.mldsaSecret, { extraEntropy: root.deterministic ? false : undefined }));
}
export function verifyRoot(h, message, rootPub) {
  const n = message.length - ED_SIG_LEN - MLDSA_SIG_LEN;
  if (n < 0) return null;
  const body = message.subarray(0, n); const t = tbs(CTX_ROOT, h, body);
  const okEd = ed25519.verify(message.subarray(n, n + ED_SIG_LEN), t, rootPub.ed25519);
  const okPq = ml_dsa65.verify(message.subarray(n + ED_SIG_LEN), t, rootPub.mldsa65);
  return okEd && okPq ? body : null;
}

// ---------------------------------------------------------------- questions
const questionNonce = (unitId, questionId) => concat(u32le(unitId), u32le(questionId), [0, 0, 0, 1]);
/** Returns the single radio packet of a QUESTION. */
export function sealQuestion({ unit_id, question_id, lang, category, battery = BATTERY_UNKNOWN, text }, unitKey) {
  const t = te.encode(text);
  if (t.length > QUESTION_TEXT_MAX) throw new Error('question text too long');
  const l = te.encode(lang); if (l.length !== 2) throw new Error('lang must be 2 bytes');
  const header = encodeHeader({ type: Type.QUESTION, msg_id: question_id, part: 0, parts: 1, key_id: 0, epoch: unit_id });
  const c = createCipheriv('aes-256-gcm', unitKey, questionNonce(unit_id, question_id), { authTagLength: GCM_TAG_LEN });
  c.setAAD(header);
  const ct = Buffer.concat([c.update(concat(l, [category & 0xff, battery & 0xff], t)), c.final()]);
  return concat(header, ct, c.getAuthTag());
}
/** Authority side. `packet` is header + chunk. Throws when the tag does not verify. */
export function openQuestion(packet, unitKey) {
  const h = decodeHeader(packet);
  if (h.type !== Type.QUESTION || h.parts !== 1 || h.part !== 0 || h.key_id !== 0) throw new Error('not a question packet');
  const body = packet.subarray(HEADER_LEN);
  if (body.length < GCM_TAG_LEN + 4) throw new Error('short question');
  const d = createDecipheriv('aes-256-gcm', unitKey, questionNonce(h.epoch, h.msg_id), { authTagLength: GCM_TAG_LEN });
  d.setAAD(packet.subarray(0, HEADER_LEN));
  d.setAuthTag(body.subarray(body.length - GCM_TAG_LEN));
  const pt = Buffer.concat([d.update(body.subarray(0, body.length - GCM_TAG_LEN)), d.final()]);
  return { unit_id: h.epoch, question_id: h.msg_id, lang: pt.subarray(0, 2).toString('latin1'), category: pt[2], battery: pt[3], text: td.decode(pt.subarray(4)) };
}
/** 32-bit reference to a question, computable only with the per-unit key. Never 0. */
export function questionRef(unitKey, unitId, questionId) {
  const v = createHmac('sha256', unitKey).update(concat(CTX_QREF, u32le(unitId), u32le(questionId))).digest().readUInt32LE(0);
  return v === 0 ? 1 : v;
}

// ---------------------------------------------------------------- per-unit key agreement (provisioning)
/** Both sides: derive the per-unit AES-256 key and the key-confirmation tag. */
export function deriveUnitKey({ mlkemPk, x25519UnitPk, mlkemCt, x25519StationPk, mlkemSs, x25519Ss, unitId }) {
  const salt = sha256(CTX_UNITKEY_SALT, mlkemPk, x25519UnitPk, mlkemCt, x25519StationPk);
  const key = new Uint8Array(hkdfSync('sha256', concat(mlkemSs, x25519Ss), salt, concat(CTX_UNITKEY_INFO, u32le(unitId)), 32));
  const confirm = new Uint8Array(createHmac('sha256', key).update(concat(CTX_KEYCONFIRM, salt)).digest().subarray(0, 16));
  return { key, confirm };
}
/** Station side of the hybrid KEM (reference; the real station is part of the authority system). */
export function stationEncapsulate({ mlkemPk, x25519UnitPk, unitId }, rnd = {}) {
  const { cipherText, sharedSecret } = ml_kem768.encapsulate(mlkemPk, rnd.kemSeed);
  const xs = rnd.x25519Secret ?? x25519.utils.randomSecretKey();
  const x25519StationPk = x25519.getPublicKey(xs);
  const x25519Ss = x25519.getSharedSecret(xs, x25519UnitPk);
  return { mlkemCt: cipherText, x25519StationPk, ...deriveUnitKey({ mlkemPk, x25519UnitPk, mlkemCt: cipherText, x25519StationPk, mlkemSs: sharedSecret, x25519Ss, unitId }) };
}
