from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import subprocess
import sys

from autotask.config import TaskConfig


@dataclass(slots=True)
class AgentRunResult:
    argv: list[str]
    exit_code: int
    stdout: str
    stderr: str


def render_command(parts: list[str], context: dict[str, str]) -> list[str]:
    return [part.format(**context) for part in parts]


def run_agent(
    task: TaskConfig,
    workspace: Path,
    prompt_file: Path,
    attempt: int,
    launcher_cwd: Path,
) -> AgentRunResult:
    context = {
        "workspace": str(workspace),
        "prompt_file": str(prompt_file),
        "attempt": str(attempt),
        "task_name": task.name,
        "launcher_cwd": str(launcher_cwd),
        "python_executable": sys.executable,
    }
    argv = render_command(task.agent.command, context)
    completed = subprocess.run(
        argv,
        cwd=workspace,
        capture_output=True,
        text=True,
        timeout=task.agent.timeout_sec,
        check=False,
    )
    return AgentRunResult(
        argv=argv,
        exit_code=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
    )
