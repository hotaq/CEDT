from __future__ import annotations

from autotask.config import TaskConfig
from autotask.evaluation import EvaluationResult


def build_prompt(
    task: TaskConfig,
    attempt: int,
    best_result: EvaluationResult,
) -> str:
    editable_block = "\n".join(f"- {path}" for path in task.editable_paths)
    shared_block = "\n".join(f"- {path}" for path in task.shared_paths) or "- none"
    ignored_block = "\n".join(f"- {path}" for path in task.ignored_paths) or "- none"
    instructions = task.instructions_text().strip() or "No extra task instructions provided."

    return f"""You are working inside an isolated task workspace.

Task name: {task.name}
Task description: {task.description or "No description provided."}
Attempt: {attempt}
Current best evaluation: {best_result.summary}

You may edit only these paths relative to the workspace:
{editable_block}

These paths are shared from the original workspace and must be treated as read-only:
{shared_block}

These paths are ignored by change validation:
{ignored_block}

Hard rules:
- Do not modify files outside the editable paths.
- Leave the workspace runnable after your changes.
- Do not touch the evaluator or test harness unless they are explicitly editable.
- Stop after making the code changes. The outer harness will run evaluation.

Task-specific instructions:
{instructions}
"""
