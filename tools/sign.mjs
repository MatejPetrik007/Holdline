#!/usr/bin/env node
// Release signing tool: ML-DSA-65 (FIPS 204) + Ed25519 hybrid.
//
//   node tools/sign.mjs keygen                       -> keys/private.json (NEVER commit) + site/pubkey.json
//   node tools/sign.mjs sign <firmware.bin> <outDir> --version 1.0.0 --board heltec-wireless-paper --commit <sha>
//                                                     -> <outDir>/firmware.bin, manifest.json, manifest.sig
//                                                        and an entry appended to site/releases.json
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hex = (u8) => Buffer.from(u8).toString('hex');
const unhex = (s) => new Uint8Array(Buffer.from(s, 'hex'));
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'keygen') {
  const keyFile = arg('out', join(root, 'keys', 'private.json'));
  if (existsSync(keyFile) && !process.argv.includes('--force')) {
    console.error(`${keyFile} exists. Use --force to overwrite.`);
    process.exit(1);
  }
  const pq = ml_dsa65.keygen(randomBytes(32));
  const edSecret = ed25519.utils.randomSecretKey();
  const edPublic = ed25519.getPublicKey(edSecret);
  mkdirSync(dirname(keyFile), { recursive: true });
  writeFileSync(keyFile, JSON.stringify({ 'ML-DSA-65': hex(pq.secretKey), Ed25519: hex(edSecret) }, null, 2), { mode: 0o600 });
  const pub = { 'ML-DSA-65': hex(pq.publicKey), Ed25519: hex(edPublic) };
  writeFileSync(join(root, 'site', 'pubkey.json'), JSON.stringify(pub, null, 2) + '\n');
  console.log('Private key  ->', keyFile, '(keep offline, never commit)');
  console.log('Public key   -> site/pubkey.json');
  for (const [alg, k] of Object.entries(pub)) console.log(`Fingerprint ${alg}: ${sha256(unhex(k))}`);
} else if (cmd === 'sign') {
  const [bin, outDir] = rest;
  if (!bin || !outDir) { console.error('usage: sign <firmware.bin> <outDir> --version X --board Y --commit SHA'); process.exit(1); }
  const priv = JSON.parse(readFileSync(arg('key', join(root, 'keys', 'private.json')), 'utf8'));
  const data = readFileSync(bin);
  const manifest = {
    name: 'holdline',
    version: arg('version', '0.0.0'),
    board: arg('board', 'unknown'),
    upstream_commit: arg('commit', 'unknown'),
    built_at: new Date().toISOString(),
    signature_algs: ['ML-DSA-65', 'Ed25519'],
    files: [{ name: 'firmware.bin', size: data.length, sha256: sha256(data) }],
    note: arg('note', undefined),
  };
  const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest, null, 2) + '\n');
  const sig = {
    'ML-DSA-65': hex(ml_dsa65.sign(manifestBytes, unhex(priv['ML-DSA-65']))),
    Ed25519: hex(ed25519.sign(manifestBytes, unhex(priv.Ed25519))),
  };
  mkdirSync(outDir, { recursive: true });
  copyFileSync(bin, join(outDir, 'firmware.bin'));
  writeFileSync(join(outDir, 'manifest.json'), manifestBytes);
  writeFileSync(join(outDir, 'manifest.sig'), JSON.stringify(sig, null, 2) + '\n');

  const relFile = join(root, 'site', 'releases.json');
  const releases = existsSync(relFile) ? JSON.parse(readFileSync(relFile, 'utf8')) : [];
  const base = outDir.replace(/^.*?site\//, '');
  releases.unshift({ ...manifest, path: base });
  writeFileSync(relFile, JSON.stringify(releases, null, 2) + '\n');
  console.log(`Signed ${basename(bin)} -> ${outDir}`);
} else {
  console.log('usage: node tools/sign.mjs keygen | sign <firmware.bin> <outDir> [--version --board --commit --note]');
}
