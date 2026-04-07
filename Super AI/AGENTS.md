# AGENTS.md

## Project Overview

- This repository is `autotask-lab`, a task-agnostic improvement harness.
- The main runner lives in `src/autotask/`.
- The active ML competition workspace lives in `Competetion/playground-series-s6e3/`.
- Keep the existing folder name `Competetion/` as-is unless the user explicitly asks to rename it.

## Primary Goals In This Repo

- Maintain the generic `autotask` framework.
- Improve real task workspaces through evaluator-driven iteration.
- For the churn competition workspace, optimize leaderboard performance without breaking local evaluation discipline.

## Command Conventions

- Use `uv` for Python workflows in this repo.
- Prefer `uv run ...` over raw `python` when running project code manually.
- Prefer `rg` for search and `rg --files` for file listing.

## Important Paths

- Core runner: `src/autotask/`
- Example toy task: `tasks/calculator_fix/`
- Competition task config: `tasks/competition_playground_s6e3/task.toml`
- Competition workspace: `Competetion/playground-series-s6e3/`
- Competition artifacts: `Competetion/playground-series-s6e3/artifacts/`
- Current best upload file: `Competetion/playground-series-s6e3/artifacts/best_submission.csv`

## Competition Rules

- Do not modify raw dataset files:
  - `train.csv`
  - `test.csv`
  - `sample_submission.csv`
- Keep evaluation aligned with `competition.json`.
- Preserve fixed folds unless there is a strong reason to change them.
- Prefer storing new model branches as separate scripts rather than overwriting unrelated baselines.
- Every serious model branch should write:
  - `oof_predictions.csv`
  - `test_predictions.csv`
  - `summary.json`
  - a submission CSV

## Submission Rules

- For AUC-style competitions, prefer probability submissions, not thresholded labels.
- Treat `submission_label.csv` as debug-only unless the competition explicitly requires class labels.
- When multiple candidates exist, update `artifacts/best_submission.csv` and `artifacts/best_summary.json`.

## Modeling Guidance

- Favor diversity over tiny tuning changes to one model family.
- Prefer new branches such as CatBoost, logistic regression with encodings, MLP, XGBoost, or GNN over endless micro-tuning of one baseline.
- Track the relation between local CV and public leaderboard movement.
- Treat very small CV gains as low-confidence if leaderboard behavior stops matching local improvements.

## Editing Guardrails

- Do not remove historical artifacts unless the user asks.
- Do not rewrite large generated artifact trees just to clean them up.
- Do not change `competition.json` metric or target semantics without explicit confirmation.
- Preserve existing file layout and current workflows unless there is a concrete reason to change them.

## Validation Checklist

- For framework edits, run the smallest relevant command that proves behavior.
- For competition edits, prefer validating with local CV and artifact generation.
- If a new best candidate is found, update the canonical best submission artifacts.

## Communication

- Be concise and practical.
- Explain whether a gain is high-confidence or low-confidence.
- If leaderboard chasing starts to diverge from CV, say so explicitly.
