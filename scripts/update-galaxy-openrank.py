"""Compatibility command: recompute from locally collected GitHub history only."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('compute-galaxy-openrank.py')),run_name='__main__')
