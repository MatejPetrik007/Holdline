# protocol/

The Holdline application protocol, shared by the public household firmware and the authority firmware:

- `holdline.proto`: packet header, ALERT, FAQ, QUESTION, CANCEL and KEYS messages
- `test-vectors/`: encoded packets, multi-part splits and signatures made with **throwaway** keys, so both firmwares and the website can test against the same bytes

Production keys never go in this folder. Not written yet. Specified in [`../SPEC.md`](../SPEC.md), sections 6 and 7.
