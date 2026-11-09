"""Compatibility entrypoint: refresh both GitHub and OpenRank data."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name("update-galaxy-openrank.py")), run_name="__main__")
