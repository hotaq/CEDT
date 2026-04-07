from __future__ import annotations

from pathlib import Path
import json
import sys


FIRST_CROSS = ["Contract", "InternetService"]
SECOND_CROSS = ["PaperlessBilling", "PaymentMethod"]


def load_settings(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_settings(path: Path, payload: dict[str, object]) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def normalize_crosses(settings: dict[str, object]) -> list[list[str]]:
    raw = settings.get("categorical_crosses", [])
    normalized: list[list[str]] = []
    if not isinstance(raw, list):
        return normalized
    for item in raw:
        if isinstance(item, list) and len(item) == 2:
            normalized.append([str(item[0]), str(item[1])])
    return normalized


def next_candidate(settings: dict[str, object]) -> tuple[dict[str, object], str] | None:
    candidate = dict(settings)
    crosses = normalize_crosses(settings)

    if int(settings.get("numeric_bin_count", 0)) < 8:
        candidate["numeric_bin_count"] = 8
        candidate["categorical_crosses"] = crosses
        return candidate, "enabled numeric_bin_count=8"

    if FIRST_CROSS not in crosses:
        candidate["categorical_crosses"] = [*crosses, FIRST_CROSS]
        return candidate, "added Contract x InternetService cross"

    if SECOND_CROSS not in crosses:
        candidate["categorical_crosses"] = [*crosses, SECOND_CROSS]
        return candidate, "added PaperlessBilling x PaymentMethod cross"

    return None


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: competition_tuner_agent.py <workspace> <prompt_file>", file=sys.stderr)
        return 2

    workspace = Path(sys.argv[1]).resolve()
    prompt_file = Path(sys.argv[2]).resolve()
    settings_path = workspace / "baseline_settings.json"
    settings = load_settings(settings_path)
    candidate = next_candidate(settings)
    if candidate is None:
        print("competition tuner: no further preset candidates")
        print(f"prompt_source={prompt_file}")
        return 0

    payload, message = candidate
    write_settings(settings_path, payload)
    print(f"competition tuner: {message}")
    print(f"updated={settings_path}")
    print(f"prompt_source={prompt_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
