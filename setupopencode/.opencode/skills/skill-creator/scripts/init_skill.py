#!/usr/bin/env python3
"""Initialize a new OpenCode skill scaffold.

Usage:
  python scripts/init_skill.py <skill-name> --path <output-directory>
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def validate_name(name: str) -> None:
    if not (1 <= len(name) <= 64):
        raise ValueError("Skill name must be 1-64 characters")
    if not NAME_RE.fullmatch(name):
        raise ValueError("Skill name must match ^[a-z0-9]+(-[a-z0-9]+)*$")


def build_skill_md(name: str) -> str:
    return f"""---
name: {name}
description: TODO: Describe what this skill does and when it should trigger.
compatibility: opencode
---

# {name}

## Core Rules

- Keep instructions concise and executable.
- Put trigger cues in frontmatter description.

## Workflow

1. Define scope from user examples.
2. Apply the required process.
3. Validate output and constraints.

## Resources

- Add extra docs under `references/` when details are long.
- Add deterministic helpers under `scripts/` when repeated.
- Add templates under `assets/` when needed.
"""


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Initialize an OpenCode skill scaffold"
    )
    parser.add_argument(
        "skill_name", help="Skill name (must match OpenCode naming rules)"
    )
    parser.add_argument(
        "--path",
        required=True,
        help="Base output directory where <skill-name>/ will be created",
    )
    args = parser.parse_args()

    validate_name(args.skill_name)

    base = Path(args.path).expanduser().resolve()
    skill_dir = base / args.skill_name
    if skill_dir.exists():
        raise SystemExit(f"Error: target exists: {skill_dir}")

    (skill_dir / "scripts").mkdir(parents=True)
    (skill_dir / "references").mkdir(parents=True)
    (skill_dir / "assets").mkdir(parents=True)
    (skill_dir / "SKILL.md").write_text(
        build_skill_md(args.skill_name), encoding="utf-8"
    )

    print(f"Created skill scaffold: {skill_dir}")
    print("Next: edit SKILL.md, then run quick_validate.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
