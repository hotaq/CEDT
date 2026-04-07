# ocrust

`ocrust` is a **Rust-owned OCR research prototype** for **English printed text** on **CPU**.

Current prototype goals:
- prove a pure-Rust OCR architecture end to end
- keep the scope narrow and reversible
- optimize for **accuracy first** on curated fixtures
- defer production polish until the architecture is proven

## Current scope
- image-to-text OCR for curated English printed-text fixtures
- CPU-only inference
- deterministic template-based recognizer as the first proof-of-architecture

## Explicit non-goals for v1
- PDF OCR
- multilingual OCR
- production-ready public API guarantees
- strict hard caps for model size or latency before deeper research

## Why this prototype exists
The approved plan prioritized **full Rust ownership** over fastest delivery and chose an **inference-first vertical slice** before any larger training pipeline. This prototype therefore proves the seams — preprocessing, model, decoding, evaluation, docs, and verification — with a narrow but real OCR pipeline.

## Repository layout
- `src/` — OCR pipeline modules
- `examples/infer_image.rs` — example CLI for single-image inference
- `src/bin/benchmark_report.rs` — evaluation/metric reporter
- `fixtures/english-printed/` — curated deterministic fixture corpus
- `docs/research/` — architecture survey, benchmark plan, findings
- `docs/adr/0001-ocr-architecture.md` — architecture decision record

## Verification commands
```bash
cargo fmt --check
cargo check
cargo test
cargo run --example infer_image -- fixtures/english-printed/hello.pgm
cargo run --bin benchmark_report
cargo bench --bench cpu_inference
```

## Example output
```bash
cargo run --example infer_image -- fixtures/english-printed/rust_ocr.pgm
text: RUST OCR
avg_confidence: 1.00
model_bytes: 385
```

## Benchmark artifact
Running `cargo run --bin benchmark_report` writes:
- `artifacts/benchmark-v1.json`

The report records:
- character accuracy
- word accuracy
- average latency on CPU
- max latency on CPU
- model size in bytes

## Research posture
This is intentionally a **research prototype**, not a promise that the current deterministic recognizer is the final architecture. The docs compare stronger future options (for example CRNN-style or transformer-based OCR) while preserving the current pure-Rust proof-of-architecture.
