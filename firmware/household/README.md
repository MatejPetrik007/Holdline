# household/

The Holdline overlay for upstream `meshtastic/firmware`. This folder will hold:

- `HoldlineModule.*`: alert and FAQ display, question queue, relay policy, signature and bulletin checks
- the locked default configuration (managed mode, region, channel, disabled modules)
- per-board variant overrides for the target boards
- `UPSTREAM`: the pinned upstream tag, plus a script that applies this overlay to it

Not written yet. Specified in [`../SPEC.md`](../SPEC.md), sections 4, 5 and 7.
