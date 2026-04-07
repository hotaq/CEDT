from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
import hashlib
import json
import os
import shutil
import sys

from autotask.agent import AgentRunResult, run_agent
from autotask.config import TaskConfig
from autotask.evaluation import EvaluationResult, evaluate, is_better
from autotask.prompts import build_prompt


DEFAULT_IGNORED_NAMES = {
    ".git",
    ".venv",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
}


@dataclass(slots=True)
class AttemptRecord:
    attempt: int
    accepted: bool
    rejected_reason: str | None
    illegal_changes: list[str]
    agent: dict[str, object]
    evaluation: dict[str, object] | None


@dataclass(slots=True)
class RunSummary:
    task_name: str
    baseline: EvaluationResult
    best: EvaluationResult
    accepted_attempts: int
    attempts_run: int
    artifacts_dir: Path


def _write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def _file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _capture_manifest(root: Path) -> dict[str, str]:
    manifest: dict[str, str] = {}
    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = Path(dirpath).relative_to(root).as_posix()
        dirnames[:] = [name for name in dirnames if name not in DEFAULT_IGNORED_NAMES]
        if rel_dir.startswith("runs/"):
            continue
        for filename in filenames:
            file_path = Path(dirpath) / filename
            rel_path = _relative(file_path, root)
            manifest[rel_path] = _file_hash(file_path)
    return manifest


def _changed_paths(before: dict[str, str], after: dict[str, str]) -> list[str]:
    changed: list[str] = []
    for path in sorted(set(before) | set(after)):
        if before.get(path) != after.get(path):
            changed.append(path)
    return changed


def _matches_scope(path: str, scopes: list[str]) -> bool:
    for scope in scopes:
        normalized = scope.strip("/")
        if not normalized:
            continue
        if path == normalized or path.startswith(normalized + "/"):
            return True
    return False


def _illegal_changes(changed_paths: list[str], task: TaskConfig) -> list[str]:
    illegal: list[str] = []
    for path in changed_paths:
        if _matches_scope(path, task.ignored_paths):
            continue
        if _matches_scope(path, task.editable_paths):
            continue
        illegal.append(path)
    return illegal


def _remove_path(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)


def _sync_allowed_path(source_workspace: Path, dest_workspace: Path, relative_path: str) -> None:
    source = source_workspace / relative_path
    dest = dest_workspace / relative_path

    if dest.exists():
        _remove_path(dest)

    if not source.exists():
        return

    dest.parent.mkdir(parents=True, exist_ok=True)
    if source.is_dir():
        shutil.copytree(source, dest)
    else:
        shutil.copy2(source, dest)


def _build_copy_ignore(task: TaskConfig):
    def ignore(dirpath: str, names: list[str]) -> list[str]:
        ignored: list[str] = []
        rel_dir = Path(dirpath).resolve().relative_to(task.workspace).as_posix()
        for name in names:
            if name in DEFAULT_IGNORED_NAMES:
                ignored.append(name)
                continue
            rel_path = name if rel_dir == "." else f"{rel_dir}/{name}"
            if _matches_scope(rel_path, task.shared_paths):
                ignored.append(name)
        return ignored

    return ignore


def _link_shared_paths(task: TaskConfig, candidate_workspace: Path) -> None:
    for relative_path in task.shared_paths:
        source = task.workspace / relative_path
        dest = candidate_workspace / relative_path
        if dest.exists() or dest.is_symlink():
            _remove_path(dest)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.symlink_to(source, target_is_directory=source.is_dir())


def run_task(task_path: str | Path, max_attempts: int | None = None, dry_run: bool = False) -> RunSummary:
    task = TaskConfig.load(task_path)
    launcher_cwd = Path.cwd().resolve()
    task.artifacts_dir.mkdir(parents=True, exist_ok=True)
    shared_context = {
        "launcher_cwd": str(launcher_cwd),
        "task_name": task.name,
        "python_executable": sys.executable,
    }

    baseline = evaluate(
        task.workspace,
        task.evaluator,
        context={**shared_context, "workspace": str(task.workspace), "attempt": "0"},
    )
    _write_json(task.artifacts_dir / "baseline.json", asdict(baseline))

    best = baseline
    accepted_attempts = 0
    attempts_limit = max_attempts or task.max_attempts
    attempts_executed = 0

    if task.evaluator.mode == "exit_code" and baseline.ok:
        return RunSummary(
            task_name=task.name,
            baseline=baseline,
            best=best,
            accepted_attempts=0,
            attempts_run=0,
            artifacts_dir=task.artifacts_dir,
        )

    for attempt in range(1, attempts_limit + 1):
        attempts_executed += 1
        attempt_dir = task.artifacts_dir / f"attempt-{attempt:02d}"
        candidate_workspace = attempt_dir / "workspace"
        if candidate_workspace.exists():
            shutil.rmtree(candidate_workspace)
        shutil.copytree(
            task.workspace,
            candidate_workspace,
            ignore=_build_copy_ignore(task),
        )
        _link_shared_paths(task, candidate_workspace)

        prompt = build_prompt(task, attempt, best)
        prompt_path = attempt_dir / "prompt.md"
        prompt_path.parent.mkdir(parents=True, exist_ok=True)
        prompt_path.write_text(prompt, encoding="utf-8")

        if dry_run:
            agent_result = AgentRunResult(
                argv=[],
                exit_code=0,
                stdout="dry-run: agent command skipped",
                stderr="",
            )
            evaluation = None
            illegal = []
            accepted = False
            rejected_reason = "dry-run"
        else:
            agent_result = run_agent(
                task=task,
                workspace=candidate_workspace,
                prompt_file=prompt_path,
                attempt=attempt,
                launcher_cwd=launcher_cwd,
            )

            before_manifest = _capture_manifest(task.workspace)
            after_manifest = _capture_manifest(candidate_workspace)
            changed = _changed_paths(before_manifest, after_manifest)
            illegal = _illegal_changes(changed, task)

            evaluation = None
            accepted = False
            rejected_reason = None

            if agent_result.exit_code != 0:
                rejected_reason = "agent_failed"
            elif illegal:
                rejected_reason = "illegal_changes"
            else:
                evaluation = evaluate(
                    candidate_workspace,
                    task.evaluator,
                    context={
                        **shared_context,
                        "workspace": str(candidate_workspace),
                        "attempt": str(attempt),
                    },
                )
                if is_better(evaluation, best, task.evaluator):
                    for editable_path in task.editable_paths:
                        _sync_allowed_path(candidate_workspace, task.workspace, editable_path)
                    best = evaluation
                    accepted = True
                    accepted_attempts += 1
                else:
                    rejected_reason = "not_better"

        record = AttemptRecord(
            attempt=attempt,
            accepted=accepted,
            rejected_reason=rejected_reason,
            illegal_changes=illegal,
            agent=asdict(agent_result),
            evaluation=asdict(evaluation) if evaluation else None,
        )
        _write_json(attempt_dir / "result.json", asdict(record))

        if task.evaluator.mode == "exit_code" and best.ok:
            break

    summary_payload = {
        "task_name": task.name,
        "created_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "baseline": asdict(baseline),
        "best": asdict(best),
        "accepted_attempts": accepted_attempts,
        "attempts_run": attempts_executed,
    }
    _write_json(task.artifacts_dir / "summary.json", summary_payload)

    return RunSummary(
        task_name=task.name,
        baseline=baseline,
        best=best,
        accepted_attempts=accepted_attempts,
        attempts_run=attempts_executed,
        artifacts_dir=task.artifacts_dir,
    )
