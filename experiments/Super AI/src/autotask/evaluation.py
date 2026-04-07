from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
import subprocess

from autotask.config import EvaluatorConfig
from autotask.agent import render_command


@dataclass(slots=True)
class EvaluationResult:
    argv: list[str]
    exit_code: int
    stdout: str
    stderr: str
    ok: bool
    score: float | None
    summary: str


def evaluate(
    workspace: Path,
    evaluator: EvaluatorConfig,
    context: dict[str, str] | None = None,
) -> EvaluationResult:
    argv = render_command(evaluator.command, context or {})
    completed = subprocess.run(
        argv,
        cwd=workspace,
        capture_output=True,
        text=True,
        timeout=evaluator.timeout_sec,
        check=False,
    )
    combined = "\n".join(part for part in [completed.stdout, completed.stderr] if part)
    ok = completed.returncode in evaluator.success_exit_codes
    score: float | None = None

    if evaluator.mode == "regex":
        if not evaluator.score_pattern:
            raise ValueError("evaluator.score_pattern is required in regex mode")
        match = re.search(evaluator.score_pattern, combined)
        if match:
            score = float(match.group(1))
        else:
            ok = False

    if evaluator.mode == "exit_code":
        summary = "pass" if ok else "fail"
    elif score is not None:
        summary = f"score={score}"
    else:
        summary = "score unavailable"

    summary = f"{summary}, exit_code={completed.returncode}"
    return EvaluationResult(
        argv=argv,
        exit_code=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
        ok=ok,
        score=score,
        summary=summary,
    )


def is_better(candidate: EvaluationResult, incumbent: EvaluationResult, evaluator: EvaluatorConfig) -> bool:
    if evaluator.mode == "exit_code":
        return candidate.ok and not incumbent.ok

    if not candidate.ok or candidate.score is None:
        return False
    if incumbent.score is None:
        return True
    if evaluator.score_direction == "maximize":
        return candidate.score > incumbent.score
    return candidate.score < incumbent.score
