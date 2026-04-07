# Benchmark and Dataset Plan

## Objective
Measure whether the v1 prototype can accurately read **English printed text** on **CPU** while keeping latency and model size visible as secondary metrics.

## v1 dataset choice
### Primary benchmark corpus: curated in-repo synthetic fixtures
Files live under `fixtures/english-printed/` and are rendered from the same uppercase glyph bank used by the prototype recognizer.

**Why this is acceptable for v1**
- deterministic and easy to run in a greenfield repo
- no external downloads or licensing blockers
- matches the chosen inference-first prototype scope
- lets us validate end-to-end accuracy, latency, and model-size reporting now

**What this corpus can prove**
- the OCR seams work correctly on CPU
- the model and decoder agree on expected glyph outputs
- the benchmark/reporting path is wired correctly

**What this corpus cannot prove**
- generalization to multiple fonts
- robustness to noisy scans or scene text
- production-grade OCR quality

## Metrics to report
1. **Character accuracy** — primary metric
2. **Word accuracy** — sanity check for full-string success
3. **Average latency (microseconds)** — secondary metric
4. **Max latency (microseconds)** — tail-latency sanity check
5. **Model size (bytes)** — secondary footprint metric

## Command path
```bash
cargo run --bin benchmark_report
```

Output artifact:
- `artifacts/benchmark-v1.json`

## Stronger future benchmark candidates
Once the crate moves beyond the deterministic baseline, evaluate against stronger English printed-text datasets such as:
- IIIT5K / similar cropped word benchmarks
- ICDAR Robust Reading style datasets
- internally generated multi-font synthetic corpora with held-out fonts/noise

## Decision rule for v1
The prototype is considered successful if:
- accuracy is reported and prioritized in the artifact
- CPU inference works on all curated fixtures
- latency and model size are tracked even if not yet hard-gated
- the repo remains honest that this is a research prototype rather than a production benchmark leader
