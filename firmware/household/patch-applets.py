#!/usr/bin/env python3
# Replace the stock InkHUD applet list of every E-Ink board with the Holdline screens.
# SPDX-License-Identifier: GPL-3.0-only
#
# Each variant's nicheGraphics.h registers a dozen chat, map and position applets. A
# Holdline unit shows only its own three screens, so those registrations (and their
# includes) are removed and holdlineAddApplets() is called instead. Done by script and
# not by a .patch so that a board added upstream needs no new hunk.
import glob
import re
import sys

build = sys.argv[1]
changed = 0
for path in sorted(glob.glob(f"{build}/variants/*/*/nicheGraphics.h")):
    src = open(path, encoding="utf-8").read()
    if "holdlineAddApplets" in src or "inkhud->begin();" not in src:
        continue
    out = re.sub(r'^\s*#include "graphics/niche/InkHUD/Applets/User/[^"]+"\s*\n', "", src, flags=re.M)
    out = re.sub(r"^\s*inkhud->addApplet\(.*\n", "", out, flags=re.M)
    out = out.replace(
        '#include "graphics/niche/InkHUD/InkHUD.h"',
        '#include "graphics/niche/InkHUD/InkHUD.h"\n#ifdef HOLDLINE\n#include "modules/optional/Holdline/HoldlineApplets.h"\n#endif',
        1,
    )
    out, n = re.subn(
        r"^(\s*)inkhud->begin\(\);",
        r"\1holdlineAddApplets(inkhud); // Holdline: alert, FAQ, ask\n\1inkhud->begin();",
        out,
        count=1,
        flags=re.M,
    )
    if n != 1 or "addApplet(" in out:
        sys.exit(f"{path}: unexpected layout, applet list not replaced")
    open(path, "w", encoding="utf-8").write(out)
    changed += 1
print(f"Holdline screens installed in {changed} variant(s)")
if changed == 0:
    sys.exit("no nicheGraphics.h was patched: upstream layout changed?")
