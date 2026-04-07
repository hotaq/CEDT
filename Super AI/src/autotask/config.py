from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal
import shlex
import tomllib


def _coerce_argv(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(part) for part in value]
    if isinstance(value, str):
        return shlex.split(value)
    raise TypeError(f"expected command to be a string or list, got {type(value)!r}")


def _resolve_optional_path(base: Path, raw: str | None) -> Path | None:
    if raw is None:
        return None
    path = Path(raw)
    return path if path.is_absolute() else (base / path).resolve()


@dataclass(slots=True)
class AgentConfig:
    command: list[str]
    timeout_sec: int = 900


@dataclass(slots=True)
class EvaluatorConfig:
    command: list[str]
    mode: Literal["exit_code", "regex"] = "exit_code"
    timeout_sec: int = 300
    success_exit_codes: list[int] = field(default_factory=lambda: [0])
    score_pattern: str | None = None
    score_direction: Literal["maximize", "minimize"] = "maximize"


@dataclass(slots=True)
class TaskConfig:
    path: Path
    name: str
    description: str
    workspace: Path
    editable_paths: list[str]
    shared_paths: list[str]
    ignored_paths: list[str]
    instructions_file: Path | None
    max_attempts: int
    artifacts_dir: Path
    agent: AgentConfig
    evaluator: EvaluatorConfig

    @property
    def config_dir(self) -> Path:
        return self.path.parent

    def instructions_text(self) -> str:
        if self.instructions_file is None:
            return ""
        return self.instructions_file.read_text(encoding="utf-8")

    @classmethod
    def load(cls, path: str | Path) -> "TaskConfig":
        config_path = Path(path).resolve()
        raw = tomllib.loads(config_path.read_text(encoding="utf-8"))
        base = config_path.parent

        task_data = raw["task"]
        agent_data = raw["agent"]
        evaluator_data = raw["evaluator"]

        workspace = _resolve_optional_path(base, str(task_data["workspace"]))
        if workspace is None:
            raise ValueError("task.workspace is required")

        instructions_file = _resolve_optional_path(
            base,
            task_data.get("instructions_file"),
        )

        default_artifacts = (base / "runs" / str(task_data["name"])).resolve()
        artifacts_dir = _resolve_optional_path(
            base,
            task_data.get("artifacts_dir"),
        ) or default_artifacts

        return cls(
            path=config_path,
            name=str(task_data["name"]),
            description=str(task_data.get("description", "")),
            workspace=workspace,
            editable_paths=[str(item) for item in task_data["editable_paths"]],
            shared_paths=[str(item) for item in task_data.get("shared_paths", [])],
            ignored_paths=[str(item) for item in task_data.get("ignored_paths", [])],
            instructions_file=instructions_file,
            max_attempts=int(task_data.get("max_attempts", 5)),
            artifacts_dir=artifacts_dir,
            agent=AgentConfig(
                command=_coerce_argv(agent_data["command"]),
                timeout_sec=int(agent_data.get("timeout_sec", 900)),
            ),
            evaluator=EvaluatorConfig(
                command=_coerce_argv(evaluator_data["command"]),
                mode=str(evaluator_data.get("mode", "exit_code")),
                timeout_sec=int(evaluator_data.get("timeout_sec", 300)),
                success_exit_codes=[
                    int(code)
                    for code in evaluator_data.get("success_exit_codes", [0])
                ],
                score_pattern=evaluator_data.get("score_pattern"),
                score_direction=str(
                    evaluator_data.get("score_direction", "maximize")
                ),
            ),
        )
