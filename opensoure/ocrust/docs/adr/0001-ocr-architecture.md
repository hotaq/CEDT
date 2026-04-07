# ADR 0001: Start with a deterministic template-based OCR vertical slice

## Status
Accepted

## Context
The repository is greenfield and the approved PRD calls for a **research prototype** proving a **Rust-owned OCR architecture** for **English printed text** on **CPU**. The user explicitly deferred PDF and multilingual OCR and prioritized **accuracy** plus **full Rust ownership** over faster delivery.

## Decision
Start with a deterministic template-based recognizer implemented entirely in Rust:
- ASCII PGM fixture input
- binary preprocessing
- whitespace-based glyph segmentation
- compact uppercase template bank
- direct decoder producing text output
- evaluation path that reports accuracy, latency, and model size

## Drivers
- proves end-to-end ownership immediately
- keeps scope narrow and reversible
- requires minimal dependency surface
- makes benchmark and verification artifacts easy to establish

## Alternatives considered
1. **CRNN-style OCR first** — stronger long-term path, but too much training/runtime complexity for the first milestone
2. **Transformer OCR first** — highest ambition, but largest risk and slowest route to first proof
3. **External OCR wrapper baseline** — rejected because it violates the Rust-owned architecture goal

## Consequences
- The first milestone is intentionally narrow and deterministic.
- The current recognizer is a proof-of-architecture, not the final OCR model.
- Future work can replace the model internals without discarding the crate seams or verification path.

## Follow-ups
- deepen dataset quality beyond curated in-repo fixtures
- evaluate a stronger Rust-native learned recognizer next
- revisit public API ergonomics only after the prototype is technically convincing
