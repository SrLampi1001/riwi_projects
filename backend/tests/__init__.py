"""Backend test package."""

import sys
from pathlib import Path

# Make the in-tree ``app`` package importable when running ``pytest`` from
# any working directory (compose, container, host).
_BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))