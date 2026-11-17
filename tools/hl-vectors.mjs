// Generates firmware/protocol/test-vectors/ from the reference codec.
// SPDX-License-Identifier: GPL-3.0-only
//
//   node tools/hl-vectors.mjs          write the vectors
//   node tools/hl-vectors.mjs --check  fail if the committed vectors differ
//
// EVERY KEY HERE IS A THROWAWAY derived from a public seed string. They exist so
// that the firmware, the authority tooling and the website test against the same
// bytes. Never use them, or anything derived from them, on a real unit.
import { ed25519, x25519 } from '@noble/curves/ed25519.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as hl from './hl/codec.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'firmware', 'protocol', 'test-vectors');
const { hex, sha256, concat, Type } = hl;
const seed = (s) => sha256(new TextEncoder().encode(`holdline throwaway test key: ${s}`));

// ---- throwaway keys
function mkRoot(root_id, name) {
  const edSecret = seed(`${name} ed25519`);
  const pq = ml_dsa65.keygen(seed(`${name} ml-dsa-65`));
  return { root_id, edSecret, edPublic: ed25519.getPublicKey(edSecret), mldsaSeed: seed(`${name} ml-dsa-65`), mldsaSecret: pq.secretKey, mldsaPublic: pq.publicKey, deterministic: true };
}
const rootCZ = mkRoot(1, 'root CZ');
const rootPL = mkRoot(2, 'root PL');
const mkOp = (name) => { const s = seed(name); return { secret: s, pub: ed25519.getPublicKey(s) }; };
const opCieszyn = mkOp('operational Cieszyn epoch 7');
const opTesin = mkOp('operational Cesky Tesin epoch 7');
const opRevoked = mkOp('operational revoked');
const opOutOfScope = mkOp('operational other region');
const UNIT_ID = 0x0a0b0c0d;

// ---- fixed clock: 2026-11-16 12:00:00 UTC
const NOW = 1794830400;
const DAY = 86400;
const NODE_CC_CIESZYN = [0x43430001, 0x43430002];
const NODE_CC_TESIN = [0x43430011];

const pubRoot = (r) => ({ ed25519: r.edPublic, mldsa65: r.mldsaPublic });
function rootSigned(type, r, serial, body, msg_id) {
  const h = { type, msg_id, key_id: r.root_id, epoch: serial };
  const message = hl.signRoot(h, body, r);
  return { header: h, body, message, sealed: hl.seal(h, message), packets: type === Type.BUNDLE ? [] : hl.split(h, message) }; // a bundle never goes on the radio
}
function opSigned(type, key_id, epoch, op, body, msg_id) {
  const h = { type, msg_id, key_id, epoch };
  const message = hl.signMessage(h, body, (t) => ed25519.sign(t, op.secret));
  return { header: h, body, message, sealed: hl.seal(h, message), packets: hl.split(h, message) };
}

// ---- KEYS bulletins
const keysCZ = { root_id: 1, serial: 12, issued_at: NOW - 10 * DAY, keys: [
  { key_id: 0x0101, epoch: 7, valid_from: NOW - 10 * DAY, valid_to: NOW + 20 * DAY, alg: 1, public_key: opTesin.pub, scope: ['CZ-0803', 'PL-2403'], node_ids: NODE_CC_TESIN },
  { key_id: 0x0103, epoch: 7, valid_from: NOW - 10 * DAY, valid_to: NOW + 20 * DAY, alg: 1, public_key: opOutOfScope.pub, scope: ['CZ-0100'], node_ids: [0x43430021] },
] };
const keysPL = { root_id: 2, serial: 5, issued_at: NOW - 9 * DAY, keys: [
  { key_id: 0x0201, epoch: 7, valid_from: NOW - 10 * DAY, valid_to: NOW + 20 * DAY, alg: 1, public_key: opCieszyn.pub, scope: ['PL-2403', 'CZ-0803'], node_ids: NODE_CC_CIESZYN },
] };
// An older PL bulletin that still lists the key revoked in serial 5.
const keysPLold = { root_id: 2, serial: 4, issued_at: NOW - 40 * DAY, keys: [
  ...keysPL.keys,
  { key_id: 0x0202, epoch: 6, valid_from: NOW - 40 * DAY, valid_to: NOW + 20 * DAY, alg: 1, public_key: opRevoked.pub, scope: [], node_ids: [0x43430003] },
] };
const bulletinCZ = rootSigned(Type.KEYS, rootCZ, keysCZ.serial, hl.encodeKeys(keysCZ), 0x4b000001);
const bulletinPL = rootSigned(Type.KEYS, rootPL, keysPL.serial, hl.encodeKeys(keysPL), 0x4b000002);
const bulletinPLold = rootSigned(Type.KEYS, rootPL, keysPLold.serial, hl.encodeKeys(keysPLold), 0x4b000003);
// A newer PL bulletin that rotates the Cieszyn key: 0x0201 is gone, i.e. revoked.
const opCieszynNext = mkOp('operational Cieszyn epoch 8');
const keysPLnext = { root_id: 2, serial: 6, issued_at: NOW - 30, keys: [
  { key_id: 0x0203, epoch: 8, valid_from: NOW - 60, valid_to: NOW + 30 * DAY, alg: 1, public_key: opCieszynNext.pub, scope: ['PL-2403', 'CZ-0803'], node_ids: NODE_CC_CIESZYN },
] };
const bulletinPLnext = rootSigned(Type.KEYS, rootPL, keysPLnext.serial, hl.encodeKeys(keysPLnext), 0x4b000004);

// ---- provisioning bundle (signed by the CZ root pinned in the dev firmware; adds the PL root)
const bundleFields = {
  root_id: 1, serial: 3, issued_at: NOW - 5 * DAY, regions: ['CZ-0803', 'CZ'], channel_name: 'OLZA', channel_psk: seed('channel psk'),
  modem_preset: 0, admin_key: x25519.getPublicKey(seed('admin x25519')),
  extra_roots: [{ root_id: 2, ed25519: rootPL.edPublic, mldsa65: rootPL.mldsaPublic }],
  keys: [bulletinCZ.sealed, bulletinPL.sealed], role: 0, question_min_interval_s: 600, question_max_per_day: 10,
};
const bundle = rootSigned(Type.BUNDLE, rootCZ, bundleFields.serial, hl.encodeBundle(bundleFields), 0x42000001);

// ---- alerts: the texts of the website demo (site/demo.js)
const T = {
  pl: 'Brak prądu do odwołania. Woda i ładowanie telefonów: Rynek i nám. ČSA, 10–18.',
  cs: 'Výpadek proudu do odvolání. Voda a nabíjení telefonů: Rynek a nám. ČSA, 10–18.',
  en: 'Power cut until further notice. Water and phone charging: Rynek and nám. ČSA, 10–18.',
};
const alertBase = { severity: 2, issued_at: NOW - 600, expires_at: NOW + DAY, template_code: 17, original_lang: 'pl' };
const mkAlert = (langs, extra = {}) => ({ ...alertBase, ...extra, texts: langs.map((l) => ({ lang: l, text: T[l] })) });
const alerts = {
  pl_only: { fields: mkAlert(['pl']), msg_id: 0xa1000001 },
  pl_cs: { fields: mkAlert(['pl', 'cs'], { issued_at: NOW - 500 }), msg_id: 0xa1000002 },
  all_langs: { fields: mkAlert(['pl', 'cs', 'en'], { issued_at: NOW - 400, severity: 3 }), msg_id: 0xa1000003 },
  expired: { fields: mkAlert(['pl'], { issued_at: NOW - 3 * DAY, expires_at: NOW - 2 * DAY }), msg_id: 0xa1000004 },
};
for (const a of Object.values(alerts)) Object.assign(a, opSigned(Type.ALERT, 0x0201, 7, opCieszyn, hl.encodeAlert(a.fields), a.msg_id));
const alertTesin = { fields: { severity: 1, issued_at: NOW - 300, expires_at: NOW + DAY, template_code: 0, original_lang: 'cs', texts: [{ lang: 'cs', text: 'Zkouška sirén ve středu ve 12:00.' }] }, msg_id: 0xa2000001 };
Object.assign(alertTesin, opSigned(Type.ALERT, 0x0101, 7, opTesin, hl.encodeAlert(alertTesin.fields), alertTesin.msg_id));

// ---- hybrid KEM at provisioning (unit side is in the public firmware).
// The per-unit key of every question vector below is the key this exchange produces.
const kemCoins = concat(seed('unit ml-kem d'), seed('unit ml-kem z'));
const unitKem = ml_kem768.keygen(kemCoins);
const unitX = seed('unit x25519');
const unitXpub = x25519.getPublicKey(unitX);
const station = hl.stationEncapsulate({ mlkemPk: unitKem.publicKey, x25519UnitPk: unitXpub, unitId: UNIT_ID }, { kemSeed: seed('station ml-kem m'), x25519Secret: seed('station x25519') });

const unitKey = station.key;

// ---- cancel (of all_langs) and FAQ
const cancelFields = { cancels_msg_id: alerts.all_langs.msg_id, issued_at: NOW - 100 };
const cancel = opSigned(Type.CANCEL, 0x0201, 7, opCieszyn, hl.encodeCancel(cancelFields), 0xc1000001);
const question = { unit_id: UNIT_ID, question_id: 1, lang: 'cs', category: 3, battery: 87, text: 'Kdy bude zase proud v ulici Hlavní? Mám doma kyslíkový koncentrátor.' };
const questionPacket = hl.sealQuestion(question, unitKey);
const questionRef = hl.questionRef(unitKey, UNIT_ID, question.question_id);
const faqFields = { faq_id: 9, answers_question_ref: questionRef, published_at: NOW - 60, entries: [
  { lang: 'cs', question: 'Kdy bude obnovena dodávka proudu?', answer: 'Odhad je do 48 hodin. Lidé závislí na přístrojích: přijďte do nemocnice, vchod B.' },
  { lang: 'pl', question: 'Kiedy wróci prąd?', answer: 'Szacujemy do 48 godzin. Osoby zależne od urządzeń: przyjdźcie do szpitala, wejście B.' },
  { lang: 'en', question: 'When will power be restored?', answer: 'Estimated within 48 hours. People who depend on medical devices: come to the hospital, entrance B.' },
] };
const faq = opSigned(Type.FAQ, 0x0201, 7, opCieszyn, hl.encodeFaq(faqFields), 0xf1000001);

// ---- negative cases: each must be rejected for the stated reason
const flip = (u8, i) => { const c = new Uint8Array(u8); c[i < 0 ? c.length + i : i] ^= 1; return c; };
const wrongKeySigned = opSigned(Type.ALERT, 0x0201, 7, opTesin, hl.encodeAlert(alerts.pl_only.fields), 0xa1000010);
const wrongEpoch = opSigned(Type.ALERT, 0x0201, 6, opCieszyn, hl.encodeAlert(alerts.pl_only.fields), 0xa1000011);
const revoked = opSigned(Type.ALERT, 0x0202, 6, opRevoked, hl.encodeAlert(alerts.pl_only.fields), 0xa1000012);
const outOfScope = opSigned(Type.ALERT, 0x0103, 7, opOutOfScope, hl.encodeAlert({ ...alertBase, original_lang: 'cs', texts: [{ lang: 'cs', text: 'Jiný region.' }] }), 0xa1000013);
const beforeKey = opSigned(Type.ALERT, 0x0201, 7, opCieszyn, hl.encodeAlert(mkAlert(['pl'], { issued_at: NOW - 30 * DAY, expires_at: NOW + DAY })), 0xa1000014);
const cancelByOther = opSigned(Type.CANCEL, 0x0101, 7, opTesin, hl.encodeCancel({ cancels_msg_id: alerts.pl_cs.msg_id, issued_at: NOW - 50 }), 0xc1000002);
const fakeRoot = mkRoot(1, 'attacker root');
const forgedBulletin = rootSigned(Type.KEYS, fakeRoot, 99, hl.encodeKeys({ ...keysCZ, serial: 99, keys: [{ ...keysCZ.keys[0], public_key: opRevoked.pub }] }), 0x4b0000ff);
// Valid Ed25519 half, broken ML-DSA half: a "classical-only" forgery must fail.
const halfBulletin = (() => { const m = new Uint8Array(bulletinCZ.message); m[m.length - 1] ^= 1; return { header: bulletinCZ.header, sealed: hl.seal(bulletinCZ.header, m) }; })();
const negative = {
  alert_bad_signature: { sealed: flip(alerts.pl_only.sealed, -1), expect: 'bad_signature' },
  alert_body_tampered: { sealed: flip(alerts.pl_only.sealed, 20), expect: 'bad_signature' },
  alert_header_msgid_tampered: { sealed: flip(alerts.pl_only.sealed, 2), expect: 'bad_signature' },
  alert_signed_by_other_key: { sealed: wrongKeySigned.sealed, expect: 'bad_signature' },
  alert_wrong_epoch: { sealed: wrongEpoch.sealed, expect: 'unknown_key' },
  alert_revoked_key: { sealed: revoked.sealed, expect: 'unknown_key' },
  alert_out_of_scope: { sealed: outOfScope.sealed, expect: 'out_of_scope' },
  alert_issued_before_key_validity: { sealed: beforeKey.sealed, expect: 'key_not_valid' },
  alert_expired: { sealed: alerts.expired.sealed, expect: 'expired' },
  cancel_by_other_key: { sealed: cancelByOther.sealed, expect: 'not_authorized' },
  keys_forged_root: { sealed: forgedBulletin.sealed, expect: 'bad_signature' },
  keys_only_ed25519_valid: { sealed: halfBulletin.sealed, expect: 'bad_signature' },
  keys_rollback: { sealed: bulletinPLold.sealed, expect: 'rollback' },
  question_tag_tampered: { packet: flip(questionPacket, -1), expect: 'bad_tag' },
  question_header_tampered: { packet: flip(questionPacket, 10), expect: 'bad_tag' },
};

// ---- the website demo's topology (site/demo.js), for the flooding simulator
const demo = readFileSync(join(root, 'site', 'demo.js'), 'utf8');
const RANGE = { hq: 300, router: 300, client: 160 };
const nodes = [...demo.matchAll(/\{ id: '(\w+)', name: [^,]+, x: (\d+), y: (\d+), role: '(\w+)', c: '(\w+)' \}/g)].map((m) => ({ id: m[1], x: +m[2], y: +m[3], role: m[4], c: m[5] }));
if (nodes.length !== 18) throw new Error(`expected 18 demo nodes, parsed ${nodes.length}: site/demo.js changed`);
const links = [];
for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
  const a = nodes[i], b = nodes[j];
  if (Math.hypot(a.x - b.x, a.y - b.y) <= (RANGE[a.role] + RANGE[b.role]) / 2) links.push([a.id, b.id]);
}

// ---- output
const pkt = (x) => ({ header: x.header, body: x.body, message: x.message, sealed: x.sealed, packets: x.packets });
const vectors = {
  comment: 'Holdline protocol v1 test vectors. ALL KEYS ARE THROWAWAY (derived from public seed strings in tools/hl-vectors.mjs). Byte strings are lower-case hex.',
  portnum: hl.PORTNUM, now: NOW,
  roots: Object.fromEntries([['cz', rootCZ], ['pl', rootPL]].map(([n, r]) => [n, { root_id: r.root_id, ed25519_public: r.edPublic, mldsa65_public: r.mldsaPublic, ed25519_secret: r.edSecret, mldsa65_seed: r.mldsaSeed }])),
  operational: { cieszyn: { key_id: 0x0201, epoch: 7, public: opCieszyn.pub, secret: opCieszyn.secret }, tesin: { key_id: 0x0101, epoch: 7, public: opTesin.pub, secret: opTesin.secret } },
  unit: { unit_id: UNIT_ID, key: unitKey, regions: ['CZ-0803', 'CZ'] },
  keys: { cz: { fields: keysCZ, ...pkt(bulletinCZ) }, pl: { fields: keysPL, ...pkt(bulletinPL) }, pl_old: { fields: keysPLold, ...pkt(bulletinPLold) }, pl_next: { fields: keysPLnext, ...pkt(bulletinPLnext) } },
  bundle: { fields: bundleFields, ...pkt(bundle) },
  alerts: { ...Object.fromEntries(Object.entries(alerts).map(([n, a]) => [n, { fields: a.fields, ...pkt(a) }])), tesin: { fields: alertTesin.fields, ...pkt(alertTesin) } },
  cancel: { fields: cancelFields, ...pkt(cancel) },
  faq: { fields: faqFields, ...pkt(faq) },
  question: { fields: question, packet: questionPacket, ref: questionRef },
  kem: { unit_mlkem_coins: kemCoins, unit_mlkem_public: unitKem.publicKey, unit_mlkem_secret: unitKem.secretKey, unit_x25519_secret: unitX, unit_x25519_public: unitXpub,
    station_mlkem_ciphertext: station.mlkemCt, station_x25519_public: station.x25519StationPk, unit_id: UNIT_ID, key: station.key, confirm: station.confirm },
  negative,
  topology: { ranges: RANGE, nodes, links },
};

// Self-check with the reference decoder before anything is written.
for (const [n, a] of Object.entries(vectors.alerts)) {
  const j = hl.join(a.packets);
  const pub = a.header.key_id === 0x0201 ? opCieszyn.pub : opTesin.pub;
  const body = hl.verifyMessage(j.header, j.message, pub);
  if (!body || JSON.stringify(hl.decodeAlert(body)) !== JSON.stringify(a.fields)) throw new Error(`self-check failed: alert ${n}`);
}
if (!hl.verifyRoot(bulletinCZ.header, bulletinCZ.message, pubRoot(rootCZ)) || hl.verifyRoot(halfBulletin.header, hl.unseal(halfBulletin.sealed).message, pubRoot(rootCZ))) throw new Error('self-check failed: bulletin');
{ const d = hl.decodeKeys(bulletinPLold.body); if (d.keys.length !== 2 || d.keys[1].node_ids[0] !== 0x43430003 || d.keys[0].scope[1] !== 'CZ-0803') throw new Error('self-check failed: keys decode'); }
{ const d = hl.decodeBundle(bundle.body); if (d.extra_roots[0].mldsa65.length !== 1952 || d.keys.length !== 2 || d.channel_name !== 'OLZA' || d.question_max_per_day !== 10) throw new Error('self-check failed: bundle decode'); }
{ const o = hl.openQuestion(questionPacket, unitKey); if (o.text !== question.text || o.battery !== 87 || o.lang !== 'cs') throw new Error('self-check failed: question'); }
{ const ss = ml_kem768.decapsulate(station.mlkemCt, unitKem.secretKey); const xs = x25519.getSharedSecret(unitX, station.x25519StationPk);
  const u = hl.deriveUnitKey({ mlkemPk: unitKem.publicKey, x25519UnitPk: unitXpub, mlkemCt: station.mlkemCt, x25519StationPk: station.x25519StationPk, mlkemSs: ss, x25519Ss: xs, unitId: UNIT_ID });
  if (hex(u.key) !== hex(station.key) || hex(u.confirm) !== hex(station.confirm)) throw new Error('self-check failed: kem'); }

const json = JSON.stringify(vectors, (k, v) => (v instanceof Uint8Array ? hex(v) : v), 1) + '\n';
// Flat "key = value" form for implementations without a JSON parser (the C++ core tests).
const flat = [];
(function walk(prefix, v) {
  if (v instanceof Uint8Array) flat.push(`${prefix} = ${hex(v)}`);
  else if (Array.isArray(v)) { flat.push(`${prefix}.# = ${v.length}`); v.forEach((x, i) => walk(`${prefix}.${i}`, x)); }
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(prefix ? `${prefix}.${k}` : k, x);
  else flat.push(`${prefix} = ${typeof v === 'string' ? hex(new TextEncoder().encode(v)) : v}`);
})('', vectors);
const txt = `# Flat form of vectors.json. Strings and byte strings are hex; "x.# = n" is an array length.\n${flat.join('\n')}\n`;

const files = { 'vectors.json': json, 'vectors.txt': txt };
if (process.argv.includes('--check')) {
  for (const [f, c] of Object.entries(files)) if (!existsSync(join(outDir, f)) || readFileSync(join(outDir, f), 'utf8') !== c) { console.error(`${f} is out of date: run node tools/hl-vectors.mjs`); process.exit(1); }
  console.log('test vectors are up to date');
} else {
  mkdirSync(outDir, { recursive: true });
  for (const [f, c] of Object.entries(files)) writeFileSync(join(outDir, f), c);
  const sz = (a) => `${a.body.length} B body, ${a.message.length} B signed, ${a.packets.length} packet(s)`;
  console.log(`alert PL: ${sz(alerts.pl_only)}\nalert PL+CS: ${sz(alerts.pl_cs)}\nalert PL+CS+EN: ${sz(alerts.all_langs)}\nFAQ: ${sz(faq)}\nKEYS CZ: ${sz(bulletinCZ)}\nbundle: ${bundle.sealed.length} B sealed\nquestion: ${questionPacket.length} B packet`);
}
