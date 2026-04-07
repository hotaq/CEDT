from __future__ import annotations

from pathlib import Path
import sys


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: noop_agent.py <workspace> <prompt_file>", file=sys.stderr)
        return 2

    workspace = Path(sys.argv[1]).resolve()
    prompt_file = Path(sys.argv[2]).resolve()
    print(f"noop agent: no changes made in {workspace}")
    print(f"prompt_source={prompt_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
