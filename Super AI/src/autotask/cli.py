from __future__ import annotations

import argparse
from pathlib import Path

from autotask.engine import run_task


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Task-agnostic autonomous improvement runner")
    subparsers = parser.add_subparsers(dest="command", required=True)

    run_parser = subparsers.add_parser("run", help="run a task config")
    run_parser.add_argument("task", type=Path, help="path to task TOML file")
    run_parser.add_argument("--max-attempts", type=int, default=None, help="override task max attempts")
    run_parser.add_argument("--dry-run", action="store_true", help="render prompts and layout without executing the agent")
    return parser


def main() -> int:
    parser = _build_parser()
    args = parser.parse_args()

    if args.command == "run":
        summary = run_task(
            task_path=args.task,
            max_attempts=args.max_attempts,
            dry_run=args.dry_run,
        )
        print(f"task={summary.task_name}")
        print(f"baseline={summary.baseline.summary}")
        print(f"best={summary.best.summary}")
        print(f"accepted_attempts={summary.accepted_attempts}")
        print(f"attempts_run={summary.attempts_run}")
        print(f"artifacts={summary.artifacts_dir}")
        return 0

    parser.error(f"unknown command: {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
