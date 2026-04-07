from __future__ import annotations

from pathlib import Path
import sys


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: demo_agent.py <workspace> <prompt_file>", file=sys.stderr)
        return 2

    workspace = Path(sys.argv[1]).resolve()
    prompt_file = Path(sys.argv[2]).resolve()

    target = workspace / "calculator.py"
    text = target.read_text(encoding="utf-8")
    replacement = text.replace("result = 1", "result = 0")
    if replacement == text:
        print("demo agent found no known fix pattern", file=sys.stderr)
        return 1

    target.write_text(replacement, encoding="utf-8")
    print(f"updated {target}")
    print(f"prompt_source={prompt_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
