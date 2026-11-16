# keys/

Public keys that a **deployable** build pins. Private keys never come near this repository.

`roots.json` does not exist yet: the authority has not held its root key ceremony. Until it does, only development builds are possible (`apply-overlay.sh <dir> --dev-keys`), and they pin the throwaway root of the test vectors, whose private key is published. A development build prints `DEVELOPMENT KEYS - NOT FOR DEPLOYMENT` on every boot and reports it in the local-link `HELLO` reply.

When the root public keys exist, add `roots.json`:

```json
[
  { "root_id": 1, "ed25519": "<64 hex chars>", "mldsa65": "<3904 hex chars>" }
]
```

- `root_id`: 1 to 65535, the value in the `key_id` field of KEYS and BUNDLE headers.
- Up to 4 roots. A unit accepts a provisioning bundle only from a root in this file; further roots (the neighbouring country's, in the cross-border pilot) can be added by a bundle and are then trusted for key bulletins only.
- `gen-pinned-keys.mjs` prints the SHA-256 fingerprint of every key it pins. Compare them with the fingerprints the authority publishes before signing a release.

The firmware publisher keys are taken from [`site/pubkey.json`](../../../site/pubkey.json), the same file the website's verifier uses.
