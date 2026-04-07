#!/usr/bin/env python3
"""Validate OpenCode SKILL.md essentials quickly.

Usage:
  python scripts/quick_validate.py <path/to/skill-folder>
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def parse_frontmatter(skill_md: Path) -> dict[str, str]:
    text = skill_md.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise ValueError("SKILL.md must start with YAML frontmatter")

    end = text.find("\n---\n", 4)
    if end == -1:
        raise ValueError("Missing closing frontmatter delimiter")

    raw = text[4:end].splitlines()
    result: dict[str, str] = {}
    for line in raw:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if ":" not in stripped:
            continue
        key, value = stripped.split(":", 1)
        result[key.strip()] = value.strip()
    return result


def validate(skill_dir: Path) -> list[str]:
    errors: list[str] = []

    if not skill_dir.is_dir():
        return [f"Not a directory: {skill_dir}"]

    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return [f"Missing file: {skill_md}"]

    try:
        fm = parse_frontmatter(skill_md)
    except Exception as exc:  # noqa: BLE001
        return [str(exc)]

    name = fm.get("name", "")
    description = fm.get("description", "")

    if not name:
        errors.append("Frontmatter missing required 'name'")
    if not description:
        errors.append("Frontmatter missing required 'description'")

    if name:
        if not (1 <= len(name) <= 64):
            errors.append("name must be 1-64 characters")
        if not NAME_RE.fullmatch(name):
            errors.append("name must match ^[a-z0-9]+(-[a-z0-9]+)*$")
        if name != skill_dir.name:
            errors.append("name must match containing directory name")

    if description and not (1 <= len(description) <= 1024):
        errors.append("description must be 1-1024 characters")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate OpenCode skill folder")
    parser.add_argument("skill_folder", help="Path to skill directory")
    args = parser.parse_args()

    skill_dir = Path(args.skill_folder).expanduser().resolve()
    errors = validate(skill_dir)
    if errors:
        print("Validation failed:")
        for err in errors:
            print(f"- {err}")
        return 1

    print("Validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
