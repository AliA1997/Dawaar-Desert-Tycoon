"""
Render every deployment-architecture diagram into `diagrams/` at the repo root.

    python scripts/diagrams/render_all.py          # from the repo root
    pnpm --filter @workspace/scripts diagrams      # same thing

Requires Python 3.10+ and Pillow (`pip install Pillow`). Nothing else — no
Graphviz, no headless browser. The PNGs are committed, so a reader never has to
run this; regenerate and commit whenever a script changes.
"""

from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
OUT_DIR = REPO_ROOT / "diagrams"

# The diagram modules import `_canvas` as a sibling top-level module, so this
# has to work regardless of the directory the command was run from.
sys.path.insert(0, str(HERE))

import d01_logical  # noqa: E402
import d02_aws  # noqa: E402
import d03_azure  # noqa: E402
import d04_lifecycle  # noqa: E402

DIAGRAMS = (d01_logical, d02_aws, d03_azure, d04_lifecycle)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for module in DIAGRAMS:
        path = module.render(OUT_DIR)
        size_kb = path.stat().st_size / 1024
        print(f"  {path.relative_to(REPO_ROOT).as_posix():<52} {size_kb:>7.0f} KB")
    print(f"\n{len(DIAGRAMS)} diagrams written to {OUT_DIR.relative_to(REPO_ROOT).as_posix()}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
