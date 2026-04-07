#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path

import pandas as pd


PREFIX_RULES = [
    r"^ภาพถ่ายของ",
    r"^ภาพของ",
    r"^รูปของ",
    r"^ของ",
    r"^จากภาพใกล้ชิดของ",
    r"^จากภาพใกล้เคียงของ",
    r"^จากการทําความใกล้เคียงของ",
    r"^จากการทำความใกล้เคียงของ",
    r"^close-up ของ",
]

REPLACE_RULES = [
    (r"สาขาต้นไม้", "กิ่งไม้"),
    (r"วิ่งผ่าน", "ไหลผ่าน"),
    (r"วิ่งระหว่าง", "ไหลระหว่าง"),
    (r"เป็นลําธารที่", "ลําธารที่"),
    (r"เป็นลำธารที่", "ลำธารที่"),
    (r"จานของซุปที่มี", "ซุปที่มี"),
    (r"ป่าเขียวเข้มงวด", "ป่าเขียว"),
    (r"ที่พักผ่อนบน", "บน"),
]


def normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def strip_prefixes(text: str) -> str:
    for pattern in PREFIX_RULES:
        text = re.sub(pattern, "", text).strip()
    return text


def apply_replacements(text: str) -> str:
    for pattern, replacement in REPLACE_RULES:
        text = re.sub(pattern, replacement, text)
    return text


def remove_duplicate_tokens(text: str) -> str:
    # Collapse immediate repeated tokens like "ดอกไม้ ดอกไม้".
    return re.sub(r"\b(\S+)(?:\s+\1\b)+", r"\1", text)


def clean_caption(text: str, min_chars: int) -> str:
    text = normalize_spaces(str(text))
    text = text.strip(" \"'")
    text = strip_prefixes(text)
    text = apply_replacements(text)
    text = remove_duplicate_tokens(text)
    text = normalize_spaces(text)
    text = text.rstrip(".,!?;: ")
    return text if len(text) >= min_chars else "ภาพ"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Postprocess Thai caption submission CSVs."
    )
    parser.add_argument("--input", required=True, help="Input CSV path")
    parser.add_argument("--output", required=True, help="Output CSV path")
    parser.add_argument(
        "--min-chars",
        type=int,
        default=2,
        help="Fallback to 'ภาพ' when cleaned caption is shorter than this",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    df = pd.read_csv(input_path, dtype={"image_id": str})
    if "caption" not in df.columns:
        raise ValueError("Input CSV must contain a 'caption' column")

    before = df["caption"].fillna("").astype(str)
    after = before.map(lambda x: clean_caption(x, args.min_chars))
    changed = int((before != after).sum())

    df["caption"] = after
    df.to_csv(output_path, index=False, encoding="utf-8-sig")

    print(f"rows: {len(df)}")
    print(f"changed: {changed}")
    print(f"saved: {output_path}")
    print(df.head(10).to_string(index=False))


if __name__ == "__main__":
    main()
