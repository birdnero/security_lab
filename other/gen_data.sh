#!/usr/bin/env python3
from __future__ import annotations

import os
from pathlib import Path


BYTES_IN_KB = 1024
BYTES_IN_MB = 1024 * 1024
BYTES_IN_GB = 1024 * 1024 * 1024


def _read_int(prompt: str) -> int:
    while True:
        raw = input(prompt).strip()
        if raw == "":
            return 0
        try:
            value = int(raw)
        except ValueError:
            print("Please enter an integer (or leave empty for 0).")
            continue
        if value < 0:
            print("Value must be >= 0.")
            continue
        return value


def _default_name(gb: int, mb: int, kb: int, b: int, total_bytes: int) -> str:
    nonzero = [("gb", gb), ("mb", mb), ("kb", kb), ("b", b)]
    nonzero = [(p, v) for p, v in nonzero if v > 0]
    if len(nonzero) == 1:
        prefix, value = nonzero[0]
        return f"gen_{value}_{prefix}.data"
    return f"gen_{total_bytes}_bytes.data"


def _write_random(path: Path, total_bytes: int) -> None:
    chunk_size = 4 * 1024 * 1024
    remaining = total_bytes
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        while remaining > 0:
            take = chunk_size if remaining >= chunk_size else remaining
            f.write(os.urandom(take))
            remaining -= take


def main() -> None:
    print("Enter sizes (leave empty for 0):")
    gb = _read_int("GB: ")
    mb = _read_int("MB: ")
    kb = _read_int("KB: ")
    b = _read_int("B: ")

    total_bytes = gb * BYTES_IN_GB + mb * BYTES_IN_MB + kb * BYTES_IN_KB + b
    if total_bytes <= 0:
        print("Total size must be greater than 0 bytes.")
        return

    default_name = _default_name(gb, mb, kb, b, total_bytes)
    default_path = Path("./gen_data") / default_name

    out_raw = input(f"Output path (empty for {default_path}): ").strip()
    out_path = Path(out_raw) if out_raw else default_path

    print(f"Creating file: {out_path} ({total_bytes} bytes)")
    _write_random(out_path, total_bytes)
    print("Done.")


if __name__ == "__main__":
    main()
