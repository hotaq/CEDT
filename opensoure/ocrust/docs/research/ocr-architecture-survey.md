# OCR Architecture Survey

## Goal
Choose the smallest architecture that still proves a **Rust-owned OCR stack** for English printed text on CPU.

## Evaluation principles
1. Must preserve end-to-end Rust ownership.
2. Must produce a runnable inference path quickly in a greenfield repo.
3. Must keep accuracy as the primary quality axis.
4. Must keep PDFs and multilingual OCR out of the first milestone.
5. Must leave room for stronger future training-backed models.

## Candidate options

### Option A — Deterministic template recognizer (chosen for v1)
**Shape:** binarize image → segment glyphs by whitespace → match each glyph against a compact 5x7 template bank.

**Pros**
- zero external OCR runtime
- extremely small and explainable model surface
- easy to verify on CPU with deterministic fixtures
- fastest route to proving the crate seams: preprocess → model → decoder → eval

**Cons**
- narrow alphabet/font support
- weak robustness to real-world scene text variations
- no true training loop yet

**Why it fits v1**
The user prioritized **full Rust ownership** and a **research prototype** over faster shipping or broader scope. A deterministic recognizer is the quickest honest proof that the repository can host a Rust OCR stack without outsourcing recognition to an external runtime.

### Option B — CRNN-style sequence recognizer in Rust
**Shape:** CNN feature extractor + recurrent sequence model + CTC decoding.

**Pros**
- much stronger path toward real printed-text OCR
- compatible with fixed-height word images and sequence decoding
- widely used OCR baseline family

**Cons**
- significantly more implementation and training complexity
- forces earlier choices about tensor runtime, training loop, and serialization
- too large for the first proof-of-architecture milestone in this repo

**Why not first**
This is likely the strongest next step after the current prototype proves the repository seams, but it is too expensive as the very first vertical slice.

### Option C — Transformer encoder-decoder OCR
**Shape:** vision encoder + autoregressive decoder or seq2seq text recognizer.

**Pros**
- strongest long-term accuracy ceiling
- flexible for richer text layouts and future multilingual work
- aligns with the user’s high-level “Whisper for OCR” ambition

**Cons**
- largest dependency and research burden
- highest CPU cost and slowest time to first green proof
- easy to over-scope a greenfield repository

**Why not first**
This direction belongs in the long-term roadmap, not the first milestone, because the current priority is to prove architecture ownership under strict scope.

## Chosen v1 architecture
Use **Option A** now, but shape the module boundaries (`preprocess`, `model`, `decoder`, `infer`, `eval`) so the repository can later swap in a CRNN-style or transformer recognizer without rewriting the whole crate.

## Deferred work
- real training loop
- broader font generalization
- PDF OCR
- multilingual OCR
- API polish for external developers

## Future transition criteria
Move beyond the deterministic template recognizer once the repo can already prove:
- stable CPU inference plumbing
- repeatable evaluation/benchmark reporting
- ADR-backed architecture and dataset choices
- test harnesses that make later model swaps measurable
