# CLI Audio Visualizer

## TL;DR

> **Quick Summary**: Build a Rust CLI audio visualizer that captures system audio (loopback), processes it with FFT, and displays real-time frequency bars in the terminal using Termion.
>
> **Deliverables**:
> - Working Rust project with Cargo.toml and source code
> - Cross-platform system audio capture (macOS: CoreAudio loopback/BlackHole, Windows: WASAPI loopback, Linux: PipeWire/PulseAudio monitor)
> - Real-time FFT spectrum analysis using realfft with Hann windowing
> - Terminal visualization with 60 FPS frequency bars, color gradients, resize handling
> - Test infrastructure with automated tests and agent-executed QA
>
> **Estimated Effort**: Medium (2-3 weeks for polished MVP)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (setup) → Task 3 (audio capture) → Task 5 (FFT pipeline) → Task 7 (visualization)

---

## Context

### Original Request
"what i dea we need to build to day" → User wants to build a CLI audio visualizer in Rust. After clarification: Tool should capture system audio (what user is listening to) and display frequency bars in terminal.

### Interview Summary
**Key Discussions**:
- **Project type**: CLI/TUI tool (confirmed)
- **Language**: Rust (user requested, accepted alternative if needed)
- **Audio source**: System audio capture (user insisted on this despite complexity warnings)
- **Visualization style**: Frequency bars/spectrum analyzer (confirmed)
- **TUI library**: Termion (user choice over Ratatui recommendation)
- **Platform support**: Cross-platform (macOS, Linux, Windows)
- **Repository**: https://github.com/hotaq/sound-specto.git (completely empty, build from scratch)
- **Test approach**: TDD with Agent-Executed QA scenarios

**Technical Decisions**:
- **Audio capture**: CPAL 0.17.1 - cross-platform with loopback support
- **FFT processing**: realfft 3.5 - optimized for real-valued audio data
- **UI framework**: Termion - as requested, proven 60 FPS capable
- **Buffer strategy**: Arc<Mutex<Vec<f32>>> thread-safe circular buffer
- **Performance**: 2048-4096 sample buffer, 1024-2048 FFT, 30-60 FPS target
- **Windowing**: Hann window to reduce spectral leakage
- **Overlap**: 50% overlap for STFT smooth transitions

### Research Findings
**Termion Performance**:
- 60 FPS achievable with proper optimization techniques
- Key techniques: alternate screen mode, cursor hiding, double buffering, differential rendering (only update changed cells), batch writes with single flush, frame timing control

**CPAL Audio Capture**:
- Cross-platform (488K+ downloads/month)
- System audio (loopback) support on all platforms:
  - macOS: CoreAudio loopback native for 14.6+, requires BlackHole virtual device for older versions
  - Windows: WASAPI loopback native support
  - Linux: PipeWire/PulseAudio monitor sources
- Platform-specific references found: note67 (Windows WASAPI), meeting-minutes (macOS Core Audio)

**FFT Libraries**:
- realfft 3.5 recommended for audio (2x faster than rustfft for real-valued data)
- Pure Rust, actively maintained

**Existing Projects**:
- crav: audioviz + cpal + termion (microphone only)
- vibes: cpal + crossterm (microphone only)
- cavii: PulseAudio/WASAPI dual backend, FFT implementation pattern
- System audio examples: note67 (Windows), meeting-minutes (macOS Core Audio)

### Metis Review
Metis consultation attempted but encountered technical system issues. Proceeding with comprehensive research findings that covered all critical aspects including:
- Audio capture feasibility across platforms
- TUI performance capabilities
- FFT processing requirements
- Existing implementation patterns
- Platform-specific considerations (BlackHole for older macOS, etc.)

---

## Work Objectives

### Core Objective
Create a working CLI audio visualizer in Rust that captures system audio in real-time, processes it with FFT to extract frequency data, and renders frequency bars as a spectrum analyzer in the terminal using Termion at 60 FPS.

### Concrete Deliverables
- `Cargo.toml` with dependencies: cpal, realfft, termion
- `src/main.rs` - main entry point with CLI argument parsing
- `src/audio/` module - platform-specific audio capture implementations
- `src/fft/` module - FFT processing with realfft and windowing
- `src/visualizer/` module - Termion UI with frequency bar rendering
- Test infrastructure with TDD workflow

### Definition of Done
- [ ] `cargo build` completes without errors on all target platforms
- [ ] `cargo test` passes all unit tests
- [ ] Application launches and captures system audio
- [ ] Terminal displays frequency bars responding to music in real-time
- [ ] Frame rate maintains 30+ FPS on typical hardware
- [ ] Application exits cleanly on 'q' keypress

### Must Have
- System audio capture (loopback mode) on macOS, Linux, Windows
- Real-time FFT spectrum analysis with configurable buffer size
- Frequency bar visualization with color gradients
- Terminal resize handling
- Clean exit on user input (q key)
- Error handling with meaningful messages
- Platform-specific audio capture with fallback to BlackHole on older macOS

### Must NOT Have (Guardrails)
- No microphone-only audio capture (must be system audio loopback)
- No GPU rendering (Termion terminal only)
- No file-based playback (real-time capture only)
- No unnecessary dependencies (keep it minimal)
- No hardcoded device names (use CPAL enumeration)
- No AI-slop bloat (no excessive comments, no premature abstractions)
- No blocking UI rendering loop (async input handling required)

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.
>
> **FORBIDDEN** — acceptance criteria that require:
> - "User manually tests..." / "사용자가 직접 테스트..."
> - "User visually confirms..." / "사용자가 눈으로 확인..."
> - "User interacts with..." / "사용자가 직접 조작..."
> - "Ask user to verify..." / "사용자에게 확인 요청..."
> - ANY step where a human must perform an action
>
> **ALL verification is executed by the agent** using tools (interactive_bash, bash, tmux). No exceptions.

### Test Decision
- **Infrastructure exists**: NO (empty repository)
- **Automated tests**: YES (TDD)
- **Framework**: Rust built-in `cargo test` with standard test assertions

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure**:
1. **RED**: Write failing test first
   - Test file: `src/module/tests.rs` or `tests/module.rs`
   - Test command: `cargo test module_name`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `cargo test module_name`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `cargo test module_name`
   - Expected: PASS (still)

**Test Setup Task**:
- [ ] 0. Setup Test Infrastructure
  - Verify: `cargo test --help` → shows help
  - Example: Create `src/lib.rs` with basic test
  - Verify: `cargo test` → 1 test passes

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Whether TDD is enabled or not, EVERY task MUST include Agent-Executed QA Scenarios.
> - **With TDD**: QA scenarios complement unit tests at integration/E2E level
> - **Without TDD**: QA scenarios are the PRIMARY verification method
>
> These describe how the executing agent DIRECTLY verifies the deliverable
> by running it — launching the binary, sending keystrokes, checking output.

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **CLI/TUI** | interactive_bash (tmux) | Run command, send keystrokes, validate output, check exit code |
| **Library/Module** | Bash (cargo/test) | Import, call functions, compare output |
| **Config/Infra** | Bash (cargo check) | Apply config, run state checks, validate |

**Each Scenario MUST Follow This Format:**

```
Scenario: [Descriptive name — what user action/flow is being verified]
  Tool: interactive_bash (tmux) / Bash (cargo)
  Preconditions: [What must be true before this scenario runs]
  Steps:
    1. [Exact action with specific command/keystroke/selector]
    2. [Next action with expected intermediate state]
    3. [Assertion with exact expected value]
  Expected Result: [Concrete, observable outcome]
  Failure Indicators: [What would indicate failure]
  Evidence: [Screenshot path / output capture / response body path]
```

**Scenario Detail Requirements:**
- **Commands**: Specific (`cargo run --release`, not "run the app")
- **Data**: Concrete test data (play test audio, send "q" keystroke, not "user input")
- **Assertions**: Exact values (`"Press 'q' to quit"`, `fps >= 30`, not "verify it works")
- **Timing**: Include wait conditions where relevant (`Wait for "Listening..." in stdout (timeout: 5s)`)
- **Negative Scenarios**: At least ONE failure/error scenario per feature
- **Evidence Paths**: Specific file paths (`.sisyphus/evidence/task-N-scenario-name.log`)

**Anti-patterns (NEVER write scenarios like this):**
- ❌ "Verify the audio visualizer works correctly"
- ❌ "Check that the visualization responds to music"
- ❌ "Test the terminal rendering"
- ❌ "User runs the tool and confirms..."

**Write scenarios like this instead:**
- ✅ `cargo run --release → Wait for "Press 'q' to quit" → Send 'q' → Assert exit code 0`
- ✅ `Play test audio → Observe frequency bars → Assert bars move in response to audio`
- ✅ `Resize terminal → Assert layout recalculates → Assert no crashes`

**Evidence Requirements:**
- Terminal output: Captured for all CLI/TUI verifications
- Screenshot: Not needed for CLI (output capture is sufficient)
- All evidence referenced by specific file path in acceptance criteria

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.

```
Wave 1 (Start Immediately):
├── Task 1: Initialize project structure
└── Task 2: Setup test infrastructure

Wave 2 (After Wave 1):
├── Task 3: Audio capture (CPAL setup)
└── Task 4: FFT module skeleton

Wave 3 (After Wave 2):
├── Task 5: FFT implementation
└── Task 6: Visualization structure

Wave 4 (After Wave 3):
├── Task 7: Termion rendering
├── Task 8: Platform-specific audio backends
└── Task 9: Integration wiring

Wave 5 (After Wave 4):
├── Task 10: Performance optimization
└── Task 11: Polish and edge cases
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | None (setup) |
| 2 | 1 | 3, 4, 5, 6 | None (testing) |
| 3 | 1, 2 | 5, 8 | 4 |
| 4 | 1, 2 | 5, 6 | 3 |
| 5 | 3, 4 | 7 | 6 |
| 6 | 2 | 7 | 3, 4, 5 |
| 7 | 5, 6 | 8, 9 | None |
| 8 | 3 | 9, 10 | 5, 7 |
| 9 | 7, 8 | 10, 11 | 7, 8 |
| 10 | 7, 9 | 11 | 8, 9 |
| 11 | 10 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 2 | 3, 4 | delegate_task(category="unspecified-low", load_skills=[], run_in_background=true) |
| 3 | 5, 6 | delegate_task(category="unspecified-low", load_skills=[], run_in_background=true) |
| 4 | 7, 8, 9 | delegate_task(category="visual-engineering", load_skills=[], run_in_background=true) |
| 5 | 10, 11 | delegate_task(category="quick", load_skills=[], run_in_background=false) |

Critical Path: Task 1 → Task 2 → Task 3 → Task 5 → Task 7
Parallel Speedup: ~40% faster than sequential

---

## TODOs

- [ ] 1. Initialize Rust Project Structure

  **What to do**:
  - Run `cargo init` in the repository root
  - Create module structure: `src/audio/`, `src/fft/`, `src/visualizer/`
  - Add dependencies to `Cargo.toml`: cpal, realfft, termion
  - Create placeholder modules with `pub mod` declarations in `src/lib.rs`

  **Must NOT do**:
  - Do NOT commit any generated boilerplate beyond structure
  - Do NOT add any README files (user didn't request)
  - Do NOT include example code that's not part of the implementation

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple project initialization, well-defined cargo commands
  - **Skills**: `[]`
    - No special skills needed for basic cargo operations
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed yet (commits after implementation)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (foundational)
  - **Blocks**: All subsequent tasks
  - **Blocked By**: None

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - None required (this is new project setup)

  **API/Type References** (contracts to implement against):
  - `cpal` 0.17.1 API: https://docs.rs/cpal/latest/cpal/ - Audio capture API patterns
  - `realfft` 3.5 API: https://docs.rs/realfft/latest/realfft/ - Real-to-complex FFT planning and processing
  - `termion` 0.1 API: https://docs.rs/termion/latest/termion/ - Terminal manipulation API

  **Test References** (testing patterns to follow):
  - Rust book testing chapter: https://doc.rust-lang.org/book/ch11-00-testing.html - Standard Rust test patterns

  **Documentation References** (specs and requirements):
  - None (new project)

  **External References** (libraries and frameworks):
  - Rust Cargo book: https://doc.rust-lang.org/cargo/guide/ - Cargo configuration reference
  - CPAL examples: https://github.com/RustAudio/cpal/tree/master/examples - Audio capture patterns

  **WHY Each Reference Matters** (explain the relevance):
  - CPAL API docs: Required to understand stream building, device enumeration, and callback patterns for audio capture
  - realfft API docs: Essential for RealFftPlanner usage, make_output_vec, and process methods for FFT
  - termion API docs: Critical for alternate screen mode, cursor hiding, and terminal rendering
  - Rust testing book: Establishes TDD workflow conventions for the test infrastructure

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.
  > REPLACE all placeholders with actual values from task context.

  **If TDD (tests enabled):**
  - [ ] Test file created: `tests/project_init.rs` with placeholder test
  - [ ] cargo test tests::project_init → FAIL (no implementation yet)
  - [ ] src/main.rs created with basic main() function
  - [ ] Cargo.toml includes: cpal = "0.17.1", realfft = "3.5", termion = "0.1"
  - [ ] cargo test tests::project_init → PASS (1 test)
  - [ ] cargo build → Success (compiles without errors)

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Project Initialization:**

  ```
  Scenario: Cargo project initializes successfully
    Tool: Bash (cargo)
    Preconditions: Repository is empty, cargo installed
    Steps:
      1. cargo init --name sound-specto
      2. cat Cargo.toml → Assert contains "sound-specto" in [package.name]
      3. cargo check → Assert exit code 0
    Expected Result: Project scaffold created successfully
    Failure Indicators: cargo init fails, Cargo.toml missing, cargo check returns error
    Evidence: Output captured in .sisyphus/evidence/task-1-init.log
  ```

  **Example — Module Structure Created:**

  ```
  Scenario: Module directories exist
    Tool: Bash (ls)
    Preconditions: Cargo project initialized
    Steps:
      1. ls src/ → Assert "audio", "fft", "visualizer" directories exist
      2. cat src/main.rs → Assert contains "mod audio;", "mod fft;", "mod visualizer;"
      3. ls src/audio/ → Assert at least one file exists (e.g., mod.rs)
    Expected Result: Module structure created as specified
    Failure Indicators: Directories missing, mod declarations absent, cargo check fails
    Evidence: Directory listing captured in .sisyphus/evidence/task-1-modules.log
  ```

  **Evidence to Capture:**
  - [ ] Cargo.toml content captured in .sisyphus/evidence/task-1-cargo.toml
  - [ ] Module structure output captured in .sisyphus/evidence/task-1-modules.log

  **Commit**: NO
  - Reason: This is foundational setup, commit after task 9 (integration complete)

---

- [ ] 2. Setup Test Infrastructure

  **What to do**:
  - Create `tests/` directory
  - Add test helpers: module for common test utilities
  - Implement basic test that verifies main() exists
  - Set up test data fixtures directory if needed

  **Must NOT do**:
  - Do NOT create integration test harnesses beyond what's needed
  - Do NOT add benchmarking libraries (not requested)
  - Do NOT create test documentation (not requested)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard test infrastructure setup, well-established patterns
  - **Skills**: `[]`
    - No special skills needed for Rust test setup
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: YES | NO
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3 (audio capture), Task 4 (FFT skeleton), Task 5 (FFT implementation)
  - **Blocked By**: Task 1

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - None required (this is new project)

  **API/Type References** (contracts to implement against):
  - Rust testing API: https://doc.rust-lang.org/rust-by-example/testing.html - Test patterns and assertions

  **Test References** (testing patterns to follow):
  - Rust book testing chapter: https://doc.rust-lang.org/book/ch11-00-testing.html - Testing conventions

  **Documentation References** (specs and requirements):
  - None

  **External References** (libraries and frameworks):
  - None

  **WHY Each Reference Matters** (explain the relevance):
  - Rust testing API: Required for understanding #[test], #[cfg(test)], and assertion macros like assert_eq!
  - Rust book: Provides conventions for organizing tests, test fixtures, and module structure

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] tests/ directory created
  - [ ] tests/common/mod.rs created with helper functions (if any)
  - [ ] tests/integration_test.rs created with basic test:
    - [RED] Test: test_main_exists → Assert main() exists → FAIL (no implementation)
    - [GREEN] src/main.rs has `fn main() {}`
    - [REFACTOR] No refactoring needed
    - [REFACTOR] cargo test → PASS
  - [ ] cargo test → All tests pass (1 test, 0 failures)

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Test Infrastructure:**

  ```
  Scenario: Test suite runs successfully
    Tool: Bash (cargo)
    Preconditions: tests/ directory exists
    Steps:
      1. cargo test → Assert exit code 0
      2. cargo test 2>&1 | grep -c "test result:" → Assert at least 1 test found
    Expected Result: Test infrastructure working correctly
    Failure Indicators: cargo test fails, no tests run, test compilation errors
    Evidence: Test output captured in .sisyphus/evidence/task-2-tests.log
  ```

  **Evidence to Capture:**
  - [ ] Test output captured in .sisyphus/evidence/task-2-tests.log

  **Commit**: NO
  - Reason: Part of foundation, commit after task 9

---

- [ ] 3. Implement Audio Capture Module (CPAL)

  **What to do**:
  - Create `src/audio/mod.rs` with audio capture structures
  - Implement device enumeration using CPAL
  - Implement stream building for input (loopback) mode
  - Create thread-safe circular buffer using Arc<Mutex<Vec<f32>>>
  - Implement platform-specific loopback configuration:
    - macOS: Use CPAL CoreAudio loopback (14.6+) or document BlackHole requirement (<14.6)
    - Windows: Configure WASAPI loopback mode
    - Linux: Use PipeWire or PulseAudio monitor sources
  - Add error handling for device unavailable scenarios

  **Must NOT do**:
  - Do NOT implement microphone-only capture (must be loopback)
  - Do NOT hardcode device names (use CPAL enumeration)
  - Do NOT skip platform-specific configuration

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Cross-platform audio implementation requires understanding CPAL API but is straightforward
  - **Skills**: `[]`
    - No special skills needed for CPAL usage
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 5 (FFT implementation)
  - **Blocked By**: Task 1 (project init), Task 2 (test infrastructure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - cavii audio capture: https://github.com/tparker48/cavii/blob/main/src/input/pulse.rs - PulseAudio capture pattern
  - cavii WASAPI capture: https://github.com/tparker48/cavii/blob/main/src/input/wasapi.rs - WASAPI loopback pattern
  - scope-tui CPAL input: https://github.com/alemidev/scope-tui/blob/main/src/input/cpal.rs - CPAL stream building pattern

  **API/Type References** (contracts to implement against):
  - CPAL 0.17.1 docs: https://docs.rs/cpal/latest/cpal/ - Stream building, device enumeration, configuration
  - CPAL traits: https://docs.rs/cpal/latest/cpal/traits/ - DeviceTrait, HostTrait, StreamTrait
  - CPAL types: https://docs.rs/cpal/latest/cpal/structs/ - StreamConfig, SampleFormat, InputCallbackInfo

  **Test References** (testing patterns to follow):
  - None required (TDD test for this module created in task)

  **Documentation References** (specs and requirements):
  - CPAL GitHub issues: https://github.com/RustAudio/cpal/issues - Loopback support discussion

  **External References** (libraries and frameworks):
  - CPAL examples: https://github.com/RustAudio/cpal/tree/master/examples - Official examples
  - RustDesk audio: https://github.com/rustdesk/rustdesk/blob/master/src/server/audio_service.rs - Production CPAL usage

  **WHY Each Reference Matters** (explain the relevance):
  - cavii PulseAudio capture: Shows how to connect to PulseAudio server and configure monitor source for loopback
  - cavii WASAPI capture: Demonstrates WASAPI loopback mode setup on Windows with proper device configuration
  - scope-tui CPAL input: Shows CPAL stream building callback pattern for continuous audio capture
  - CPAL docs: Essential reference for understanding available methods, configuration options, and platform differences
  - CPAL traits: Required for implementing audio capture with proper trait usage (DeviceTrait::build_input_stream)
  - CPAL types: Needed for understanding SampleFormat, ChannelCount, and SampleRate configuration
  - RustDesk audio: Real-world example of CPAL in production with error handling and fallback logic

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] Test file created: `tests/audio_test.rs`
  - [ ] [RED] Test: test_audio_module_exists → Assert AudioCapture struct exists → FAIL
  - [ ] [GREEN] src/audio/mod.rs created with:
    - `struct AudioCapture` with fields for stream, buffer, config
    - `impl AudioCapture` with `fn new()` and `fn start()`
    - `cargo test tests::audio_test → PASS (1 test)
  - [ ] [RED] Test: test_enumerates_devices → Assert returns list of devices → FAIL
  - [ ] [GREEN] src/audio/mod.rs implements device enumeration using host.default_input_device()
  - [ ] cargo test tests::audio_test → PASS (2 tests)
  - [ ] cargo check → Compiles without errors

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Audio Capture Structure:**

  ```
  Scenario: Audio module compiles and exposes API
    Tool: Bash (cargo)
    Preconditions: src/audio/mod.rs exists
    Steps:
      1. cargo check --lib → Assert exit code 0
      2. grep -r "pub struct" src/audio/mod.rs → Assert AudioCapture struct found
      3. grep -r "pub fn" src/audio/mod.rs → Assert at least one public function found
    Expected Result: Audio module compiles with public API
    Failure Indicators: Compilation errors, missing public API, cargo check fails
    Evidence: Compilation output captured in .sisyphus/evidence/task-3-structure.log
  ```

  **Example — Platform-Specific Audio (macOS):**

  ```
  Scenario: macOS audio capture compiles
    Tool: Bash (cargo)
    Preconditions: Code includes macOS-specific configuration
    Steps:
      1. cargo build --target x86_64-apple-darwin → Assert exit code 0
      2. grep "CoreAudio" Cargo.toml → Assert no hardcoded CoreAudio needed (CPAL handles)
    Expected Result: macOS-specific code compiles via CPAL
    Failure Indicators: Cross-compilation fails, missing platform support
    Evidence: Build output captured in .sisyphus/evidence/task-3-macos.log
  ```

  **Example — Audio Capture Runtime (with test audio):**

  ```
  Scenario: Audio capture initializes without crashing
    Tool: Bash (cargo)
    Preconditions: System audio device available, compiled binary exists
    Steps:
      1. timeout 5s cargo run --release 2>&1 || true → Assert no panic/crash
      2. Wait for "Listening for audio..." in stdout (timeout: 3s)
      3. Send SIGINT (Ctrl+C) → Assert clean shutdown message
    Expected Result: Application starts, attempts audio capture, exits cleanly
    Failure Indicators: Panic on startup, no listening message, unclean exit
    Evidence: Runtime output captured in .sisyphus/evidence/task-3-runtime.log
  ```

  **Evidence to Capture:**
  - [ ] Module compilation output in .sisyphus/evidence/task-3-structure.log
  - [ ] macOS build output in .sisyphus/evidence/task-3-macos.log
  - [ ] Runtime behavior in .sisyphus/evidence/task-3-runtime.log

  **Commit**: NO
  - Reason: Part of core module, commit after task 9

---

- [ ] 4. Create FFT Module Skeleton

  **What to do**:
  - Create `src/fft/mod.rs` with module structure
  - Define `struct FFTProcessor` with fields for planner, buffer size, window function
  - Add placeholder implementations that compile but don't process yet
  - Define types for FFT input/output (Vec<f32>, Vec<Complex<f32>>)
  - Add public API stubs: `fn new()`, `fn process()`, `fn apply_window()`

  **Must NOT do**:
  - Do NOT implement actual FFT logic yet (this is skeleton)
  - Do NOT add any unnecessary abstractions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple skeleton creation, well-defined types and stub methods
  - **Skills**: `[]`
    - No special skills needed for type definitions
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 5 (FFT implementation)
  - **Blocked By**: Task 1 (project init), Task 2 (test infrastructure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - scope-tui FFT structure: https://github.com/alemidev/scope-tui/blob/main/src/display/spectroscope.rs - FFT processor struct pattern
  - cavii FFT skeleton: https://github.com/tparker48/cavii/blob/main/src/audio_processing.rs - AudioProcessBuffer struct

  **API/Type References** (contracts to implement against):
  - realfft 3.5 docs: https://docs.rs/realfft/latest/realfft/ - RealFftPlanner, RealFft, methods
  - Rust num-complex: https://docs.rs/num-complex/latest/num_complex/ - Complex<f32> type for FFT output

  **Test References** (testing patterns to follow):
  - None required (TDD test for this module created in task)

  **Documentation References** (specs and requirements):
  - None

  **External References** (libraries and frameworks):
  - RealFFT crate: https://lib.rs/crates/realfft - Crate documentation and examples

  **WHY Each Reference Matters** (explain the relevance):
  - scope-tui FFT structure: Shows how to organize FFT processor with planner, buffers, and configuration
  - cavii FFT skeleton: Demonstrates AudioProcessBuffer struct with buffer management and FFT reference
  - realfft docs: Essential for understanding RealFftPlanner::plan_fft_forward(), make_output_vec(), and process() methods
  - num-complex: Required for understanding Complex<f32> type which realfft uses for output
  - RealFFT crate: Provides examples of real-to-complex FFT usage for audio data

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] Test file created: `tests/fft_test.rs`
  - [ ] [RED] Test: test_fft_processor_exists → Assert FFTProcessor struct exists → FAIL
  - [ ] [GREEN] src/fft/mod.rs created with FFTProcessor struct and stub methods
  - [ ] cargo test tests::fft_test → PASS (1 test)
  - [ ] cargo check → Compiles without errors

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — FFT Skeleton Structure:**

  ```
  Scenario: FFT module compiles with stubs
    Tool: Bash (cargo)
    Preconditions: src/fft/mod.rs exists
    Steps:
      1. cargo check --lib → Assert exit code 0
      2. grep -r "pub struct FFTProcessor" src/fft/mod.rs → Assert struct found
      3. grep -r "pub fn" src/fft/mod.rs | wc -l → Assert at least 3 methods (new, process, apply_window)
    Expected Result: FFT skeleton compiles with expected API
    Failure Indicators: Compilation errors, missing API methods, cargo check fails
    Evidence: Compilation output captured in .sisyphus/evidence/task-4-skeleton.log
  ```

  **Evidence to Capture:**
  - [ ] Module compilation output in .sisyphus/evidence/task-4-skeleton.log

  **Commit**: NO
  - Reason: Skeleton code, commit after task 9

---

- [ ] 5. Implement FFT Processing

  **What to do**:
  - Implement Hann window function in `src/fft/mod.rs`:
    - Window coefficients: w[n] = 0.5 * (1 - cos(2πn/N))
    - Apply to buffer element-wise
  - Implement real-to-complex FFT using realfft:
    - Use RealFftPlanner::plan_fft_forward()
    - Call r2c.process(&input, &mut output)
  - Implement magnitude calculation:
    - Convert complex output to magnitude: |a + bi| = sqrt(a² + b²)
    - Cut off mirrored frequencies (keep first half)
  - Implement normalization:
    - Divide magnitudes by maximum for 0.0-1.0 range
  - Handle buffer size mismatch (power of 2 for FFT)

  **Must NOT do**:
  - Do NOT use rustfft (less efficient for real audio)
  - Do NOT skip windowing (causes spectral leakage)
  - Do NOT mirror entire spectrum (cut off second half)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: FFT implementation requires understanding signal processing but follows established patterns
  - **Skills**: `[]`
    - No special skills needed for realfft usage
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 7 (visualization)
  - **Blocked By**: Task 3 (audio capture), Task 4 (FFT skeleton)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - scope-tui Hann window: https://github.com/alemidev/scope-tui/blob/main/src/display/spectroscope.rs#L31-L41 - Hann window implementation
  - cavii FFT compute: https://github.com/tparker48/cavii/blob/main/src/audio_processing.rs#L126-L155 - Complete FFT pipeline
  - nih-plug FFT: https://github.com/robbert-vdh/nih-plug/blob/master/plugins/diopser/src/spectrum.rs#L20-L28 - RealFftPlanner usage

  **API/Type References** (contracts to implement against):
  - realfft RealFftPlanner: https://docs.rs/realfft/latest/realfft/struct.RealFftPlanner.html - plan_fft_forward(), make_output_vec()
  - realfft RealFft: https://docs.rs/realfft/latest/realfft/trait.RealFft.html - process() method
  - std::f64::consts::PI: https://doc.rust-lang.org/std/f64/consts/constant.PI.html - For Hann window calculation

  **Test References** (testing patterns to follow):
  - None required (TDD test for this module created in task)

  **Documentation References** (specs and requirements):
  - None

  **External References** (libraries and frameworks):
  - FFT theory: https://en.wikipedia.org/wiki/Window_function#Hann_window - Hann window formula
  - RustFFT benchmarks: https://github.com/ejmahler/RustFFT/blob/master/benches/bench_realfft.rs - Performance comparison

  **WHY Each Reference Matters** (explain the relevance):
  - scope-tui Hann window: Provides exact implementation of Hann window with formula and loop structure
  - cavii FFT compute: Shows complete pipeline from real input to normalized magnitude spectrum
  - nih-plug FFT: Demonstrates RealFftPlanner usage with proper buffer management
  - realfft RealFftPlanner: Essential for creating FFT planners and planning forward transforms
  - realfft RealFft: Required for understanding process() method signature and usage
  - std::f64::consts::PI: Needed for Hann window calculation (cosine with 2πn/N)
  - FFT theory: Provides mathematical foundation for Hann window purpose (reduce spectral leakage)
  - RustFFT benchmarks: Shows realfft is 2x faster than rustfft for real-valued audio data

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] [RED] Test: test_hann_window → Assert window reduces edges → FAIL
  - [ ] [GREEN] src/fft/mod.rs implements hann_window() applying 0.5*(1 - cos(2πn/N))
  - [ ] [RED] Test: test_fft_transforms → Assert output is spectrum → FAIL
  - [ ] [GREEN] src/fft/mod.rs implements FFT using RealFftPlanner and returns magnitudes
  - [ ] cargo test tests::fft_test → PASS (2 new tests)
  - [ ] [RED] Test: test_normalization → Assert max magnitude is 1.0 → FAIL
  - [ ] [GREEN] src/fft/mod.rs normalizes output by dividing by max value
  - [ ] cargo test tests::fft_test → PASS (3 tests)
  - [ ] cargo bench --help → Shows benchmark command available (optional)

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — FFT Processing (known input):**

  ```
  Scenario: FFT produces correct spectrum for test signal
    Tool: Bash (cargo test)
    Preconditions: Test file with known signal exists
    Steps:
      1. cargo test test_fft_transforms → Assert exit code 0
      2. grep "test result: ok" stdout → Assert test passed
    Expected Result: FFT correctly transforms test audio buffer to spectrum
    Failure Indicators: Test failure, assertion error in output
    Evidence: Test output captured in .sisyphus/evidence/task-5-processing.log
  ```

  **Example — FFT Edge Cases:**

  ```
  Scenario: FFT handles buffer size not power of 2
    Tool: Bash (cargo test)
    Preconditions: FFT module exists
    Steps:
      1. cargo test test_buffer_sizes → Assert no panic on non-power-of-2 sizes
      2. Check stdout for error handling messages or graceful fallback
    Expected Result: Non-power-of-2 buffers handled without crash
    Failure Indicators: Panic on buffer size mismatch, test failure
    Evidence: Test output captured in .sisyphus/evidence/task-5-edgecases.log
  ```

  **Evidence to Capture:**
  - [ ] Test output in .sisyphus/evidence/task-5-processing.log
  - [ ] Edge case tests in .sisyphus/evidence/task-5-edgecases.log

  **Commit**: NO
  - Reason: Part of core processing, commit after task 9

---

- [ ] 6. Create Visualization Module Structure

  **What to do**:
  - Create `src/visualizer/mod.rs` with visualization structures
  - Define `struct Visualizer` with fields for terminal, buffer, colors
  - Define color gradient function (RGB based on frequency index)
  - Add placeholder `render()` method
  - Define layout constants (bar width, spacing, max height)
  - Add resize handling placeholder

  **Must NOT do**:
  - Do NOT implement actual Termion rendering yet (this is structure)
  - Do NOT add widget abstractions beyond what's needed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple structure creation with color gradients and layout constants
  - **Skills**: `[]`
    - No special skills needed for struct definitions
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 5)
  - **Blocks**: Task 7 (Termion rendering)
  - **Blocked By**: Task 1 (project init), Task 2 (test infrastructure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - crav color gradients: https://github.com/BrunoWallner/crav/blob/c1aac3f006063927d9fc5149365d04ca064b5399/Cargo.toml#L35 - splines crate for gradients
  - scope-tui layout: https://github.com/alemidev/scope-tui/blob/main/src/display/spectroscope.rs#L129-L153 - Coordinate and width calculations

  **API/Type References** (contracts to implement against):
  - termion color: https://docs.rs/termion/latest/termion/color/struct.Rgb.html - Rgb(r, g, b) for TrueColor
  - termion cursor: https://docs.rs/termion/latest/termion/cursor/fn.Goto.html - cursor::Goto(x, y) for positioning
  - termion screen: https://docs.rs/termion/latest/termion/screen/fn.IntoAlternateScreen.html - alternate screen mode

  **Test References** (testing patterns to follow):
  - None required (TDD test for this module created in task)

  **Documentation References** (specs and requirements):
  - None

  **External References** (libraries and frameworks):
  - crav rendering: https://github.com/BrunoWallner/crav - Example of terminal audio visualizer

  **WHY Each Reference Matters** (explain the relevance):
  - crav color gradients: Shows how to use splines crate for smooth frequency-to-color interpolation
  - scope-tui layout: Demonstrates calculating bar positions and widths based on terminal size
  - termion color::Rgb: Essential for creating TrueColor gradients across frequency ranges (red→blue)
  - termion cursor::Goto: Required for precise positioning of each frequency bar in terminal
  - termion alternate screen mode: Critical for preventing scrolling during real-time updates
  - crav rendering: Real-world example of audio visualization in terminal using Termion

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] Test file created: `tests/visualizer_test.rs`
  - [ ] [RED] Test: test_visualizer_struct_exists → Assert Visualizer struct exists → FAIL
  - [ ] [GREEN] src/visualizer/mod.rs created with Visualizer struct and color gradient function
  - [ ] [RED] Test: test_color_gradient → Assert colors vary across frequency → FAIL
  - [ ] [GREEN] src/visualizer/mod.rs implements frequency_to_color() returning Rgb values
  - [ ] cargo test tests::visualizer_test → PASS (2 tests)
  - [ ] cargo check → Compiles without errors

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Color Gradient Function:**

  ```
  Scenario: Color gradient produces smooth transition
    Tool: Bash (cargo test)
    Preconditions: Color gradient function exists
    Steps:
      1. cargo test test_color_gradient → Assert exit code 0
      2. Check stdout for RGB values → Assert low freq is reddish, high freq is bluish
    Expected Result: Colors interpolate smoothly from red (bass) to blue (treble)
    Failure Indicators: Test failure, colors don't vary, monochrome output
    Evidence: Test output captured in .sisyphus/evidence/task-6-gradient.log
  ```

  **Example — Visualization Structure:**

  ```
  Scenario: Visualization module compiles with placeholder render
    Tool: Bash (cargo check)
    Preconditions: src/visualizer/mod.rs exists
    Steps:
      1. cargo check --lib → Assert exit code 0
      2. grep -r "pub struct Visualizer" src/visualizer/mod.rs → Assert struct found
    Expected Result: Module compiles with expected API
    Failure Indicators: Compilation errors, missing struct, cargo check fails
    Evidence: Compilation output in .sisyphus/evidence/task-6-structure.log
  ```

  **Evidence to Capture:**
  - [ ] Color gradient test in .sisyphus/evidence/task-6-gradient.log
  - [ ] Module compilation in .sisyphus/evidence/task-6-structure.log

  **Commit**: NO
  - Reason: Structure code, commit after task 9

---

- [ ] 7. Implement Termion Visualization Rendering

  **What to do**:
  - Implement alternate screen mode initialization in `src/visualizer/mod.rs`
  - Implement cursor hiding on startup, showing on exit
  - Implement frequency bar rendering using Unicode blocks ('█')
  - Apply color gradients to bars based on frequency
  - Implement double buffering with differential rendering:
    - `output_buffer`: Vec<Vec<char>> for current frame
    - `output_on_screen`: Vec<Vec<char>> for previous frame
    - Compare and only write changed cells
  - Implement frame timing control for 60 FPS:
    - Use `Instant::now()` to measure frame duration
    - Sleep if frame completes faster than 16.67ms
  - Batch writes with single `flush()` per frame
  - Clear terminal on startup with `clear::All`

  **Must NOT do**:
  - Do NOT redraw entire screen every frame (use differential rendering)
  - Do NOT skip cursor hiding (causes flickering artifacts)
  - Do NOT skip alternate screen mode (causes scrolling)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Terminal rendering requires UI/UX expertise for smooth animations and color handling
  - **Skills**: `[]`
    - No special skills needed for Termion API
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 8 (platform audio), Task 9 (integration)
  - **Blocked By**: Task 5 (FFT), Task 6 (visualizer structure)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - Termion alternate screen example: https://github.com/redox-os/termion/blob/c784cec0a6f8d1b02692eb58d781acf172bb5959/examples/alternate_screen.rs - IntoAlternateScreen usage
  - real-time game diff render: https://github.com/willhansen/rust_realtime_terminal_game/blob/a61e6df782d78b0fe52c4f71e5152ec212562b20/src/main.rs#L1478-L1486 - Differential rendering pattern
  - Termion rainbow colors: https://github.com/redox-os/termion/blob/c784cec0a6f8d1b02692eb58d781acf172bb5959/examples/truecolor.rs#L8-L9 - Rgb color usage
  - real-time game frame timing: https://github.com/willhansen/rust_realtime_terminal_game/blob/a61e6df782d78b0fe52c4f71e5152ec212562b20/src/main.rs#L46-L48 - 60 FPS timing

  **API/Type References** (contracts to implement against):
  - termion clear::All: https://docs.rs/termion/latest/termion/clear/struct.All.html - Clear entire screen
  - termion cursor::Hide/Show: https://docs.rs/termion/latest/termion/cursor/struct.Hide.html - Hide cursor
  - termion async stdin: https://docs.rs/termion/latest/termion/async_stdin/fn.async_stdin.html - Non-blocking input

  **Test References** (testing patterns to follow):
  - None required (TDD test for this module created in task)

  **Documentation References** (specs and requirements):
  - None

  **External References** (libraries and frameworks):
  - Termion examples: https://github.com/redox-os/termion/tree/master/examples - Official examples

  **WHY Each Reference Matters** (explain the relevance):
  - Termion alternate screen example: Shows IntoAlternateScreen() pattern for clean canvas and automatic restore on exit
  - real-time game diff render: Demonstrates differential rendering by comparing buffer vs on_screen and only updating changed cells
  - Termion rainbow colors: Provides example of Rgb color construction and application with color::Fg()
  - real-time game frame timing: Shows MAX_FPS constant, IDEAL_FRAME_DURATION_MS, and thread::sleep() for consistent FPS
  - termion clear::All: Required for initial terminal cleanup before starting visualization
  - termion cursor::Hide: Essential for preventing cursor flickering during rapid updates
  - termion async stdin: Critical for non-blocking input that doesn't stall render loop
  - Termion examples: Provide working code patterns for all Termion features being used

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] [RED] Test: test_alternate_screen_mode → Assert canvas mode active → FAIL
  - [ ] [GREEN] src/visualizer/mod.rs uses IntoAlternateScreen and clears screen
  - [ ] [RED] Test: test_double_buffering → Assert only changes written → FAIL
  - [ ] [GREEN] src/visualizer/mod.rs implements differential rendering comparing buffer vs on_screen
  - [ ] [RED] Test: test_60fps_timing → Assert frame duration controlled → FAIL
  - [ ] [GREEN] src/visualizer/mod.rs uses Instant::now() and thread::sleep() for 16.67ms target
  - [ ] cargo test tests::visualizer_test → PASS (3 new tests)
  - [ ] cargo check → Compiles without errors

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Termion Alternate Screen:**

  ```
  Scenario: Visualization uses alternate screen mode
    Tool: Bash (cargo)
    Preconditions: Visualization module exists
    Steps:
      1. grep "IntoAlternateScreen" src/visualizer/mod.rs → Assert present
      2. grep "clear::All" src/visualizer/mod.rs → Assert present
      3. cargo check → Assert exit code 0
    Expected Result: Alternate screen mode and cleanup present
    Failure Indicators: Missing alternate screen, no cleanup code, compilation errors
    Evidence: Code analysis captured in .sisyphus/evidence/task-7-alternate.log
  ```

  **Example — Differential Rendering:**

  ```
  Scenario: Only changed cells are updated per frame
    Tool: Bash (cargo)
    Preconditions: Differential rendering code exists
    Steps:
      1. grep -A5 "if output_buffer\\[x\\]\\[y\\] != output_on_screen\\[x\\]\\[y\\]" src/visualizer/mod.rs → Assert comparison exists
      2. grep "write!(stdout" src/visualizer/mod.rs | wc -l → Assert minimal writes inside comparison
    Expected Result: Differential rendering pattern implemented correctly
    Failure Indicators: Full redraw every frame, no comparison, inefficient writes
    Evidence: Code analysis captured in .sisyphus/evidence/task-7-diffrender.log
  ```

  **Example — Frame Timing (60 FPS):**

  ```
  Scenario: Frame rate is controlled to 60 FPS
    Tool: Bash (cargo)
    Preconditions: Frame timing code exists
    Steps:
      1. grep "16" src/visualizer/mod.rs → Assert 16ms or similar timing target
      2. grep "thread::sleep" src/visualizer/mod.rs → Assert sleep present
      3. grep "Instant::now" src/visualizer/mod.rs → Assert timing measurement present
    Expected Result: 60 FPS timing implemented with measurement and sleep
    Failure Indicators: No timing control, no sleep, unbounded frame rate
    Evidence: Code analysis captured in .sisyphus/evidence/task-7-timing.log
  ```

  **Evidence to Capture:**
  - [ ] Alternate screen check in .sisyphus/evidence/task-7-alternate.log
  - [ ] Differential rendering in .sisyphus/evidence/task-7-diffrender.log
  - [ ] Frame timing in .sisyphus/evidence/task-7-timing.log

  **Commit**: NO
  - Reason: Core visualization, commit after task 9

---

- [ ] 8. Implement Platform-Specific Audio Backends

  **What to do**:
  - **macOS backend**:
    - Use CPAL CoreAudio host for loopback capture (macOS 14.6+)
    - Add documentation for BlackHole installation requirement for older macOS
    - Handle CoreAudio device enumeration
  - **Windows backend**:
    - Use CPAL WASAPI host with loopback mode configuration
    - Configure proper stream format (sample rate, channels)
  - **Linux backend**:
    - Use CPAL PipeWire or PulseAudio host
    - Configure monitor source for system audio capture
    - Handle PipeWire vs PulseAudio detection
  - Implement platform detection with `#[cfg(target_os = "...")]` attributes
  - Add graceful error messages for unsupported configurations

  **Must NOT do**:
  - Do NOT skip platform-specific configuration
  - Do NOT hardcode device names
  - Do NOT ignore BlackHole requirement for older macOS

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Platform-specific code requires conditional compilation but follows established CPAL patterns
  - **Skills**: `[]`
    - No special skills needed for cfg attributes
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 7, 9)
  - **Blocks**: Task 9 (integration wiring)
  - **Blocked By**: Task 3 (audio module), Task 5 (FFT), Task 7 (visualization)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - cavii platform abstraction: https://github.com/tparker48/cavii/blob/main/src/main.rs#L34 - cfg(target_os) pattern
  - RustDesk macOS audio: https://github.com/rustdesk/rustdesk/blob/master/src/server/audio_service.rs#L155-L167 - CoreAudio loopback
  - note67 Windows WASAPI: https://github.com/ZapYap-com/note67/blob/cad14c7a911563c76443e754b927db7c0005c2a0/src-tauri/src/audio/windows.rs#L68-L171 - WASAPI loopback
  - meeting-minutes macOS Core Audio: https://github.com/Zackriya-Solutions/meeting-minutes/blob/master/frontend/src-tauri/src/audio/capture/core_audio.rs#L64-L92 - CoreAudio taps

  **API/Type References** (contracts to implement against):
  - CPAL HostId: https://docs.rs/cpal/latest/cpal/enum.HostId.html - CoreAudio, Wasapi, PulseAudio
  - Rust cfg attributes: https://doc.rust-lang.org/reference/conditional-compilation/#the-cfg_attr-attribute - #[cfg(target_os)]

  **Test References** (testing patterns to follow):
  - None required (TDD test for this module created in task)

  **Documentation References** (specs and requirements):
  - CPAL CHANGELOG: https://github.com/RustAudio/cpal/blob/e7ac140945f07fc237decd2c32b4e5f57960dd39/CHANGELOG.md - Loopback support notes
  - BlackHole repo: https://github.com/ExistentialAudio/BlackHole - Virtual device setup for older macOS

  **External References** (libraries and frameworks):
  - CPAL examples: https://github.com/RustAudio/cpal/tree/master/examples - Platform-specific examples

  **WHY Each Reference Matters** (explain the relevance):
  - cavii platform abstraction: Shows cfg(target_os) pattern for selecting PulseAudio vs WASAPI based on platform
  - RustDesk macOS audio: Demonstrates ScreenCaptureKit host usage for system audio capture on macOS 14.6+
  - note67 Windows WASAPI: Shows WASAPI loopback initialization with Direction::Capture and loopback flag
  - meeting-minutes macOS Core Audio: Provides lower-level Core Audio tap implementation for older macOS versions
  - CPAL HostId: Required for selecting correct host (CoreAudio for macOS, Wasapi for Windows, etc.)
  - Rust cfg attributes: Essential for platform-specific compilation with #[cfg(target_os = "macos")]
  - CPAL CHANGELOG: Documents when loopback support was added and platform limitations
  - BlackHole repo: Required documentation for virtual audio device installation on macOS < 14.6
  - CPAL examples: Provide platform-specific code patterns for audio capture setup

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] [RED] Test: test_macos_backend_compiles → Assert macOS code compiles → FAIL
  - [ ] [GREEN] src/audio/macos.rs implements CoreAudio loopback via CPAL
  - [ ] [RED] Test: test_windows_backend_compiles → Assert Windows code compiles → FAIL
  - [ ] [GREEN] src/audio/windows.rs implements WASAPI loopback via CPAL
  - [ ] [RED] Test: test_linux_backend_compiles → Assert Linux code compiles → FAIL
  - [ ] [GREEN] src/audio/linux.rs implements PipeWire/PulseAudio via CPAL
  - [ ] cargo test tests::audio_platforms → PASS (3 tests)
  - [ ] cargo build --target x86_64-apple-darwin → Success (macOS)
  - [ ] cargo build --target x86_64-pc-windows-msvc → Success (Windows)
  - [ ] cargo build --target x86_64-unknown-linux-gnu → Success (Linux)

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — macOS Platform Detection:**

  ```
  Scenario: macOS backend compiles correctly
    Tool: Bash (cargo)
    Preconditions: macOS-specific code exists
    Steps:
      1. cargo build --target x86_64-apple-darwin → Assert exit code 0
      2. grep -r "#\\[cfg(target_os" src/audio/macos.rs | wc -l → Assert at least 1
    Expected Result: macOS-specific code compiles with proper cfg attributes
    Failure Indicators: Cross-compilation fails, missing cfg attributes, wrong host selected
    Evidence: Build output captured in .sisyphus/evidence/task-8-macos.log
  ```

  **Example — Windows Platform Detection:**

  ```
  Scenario: Windows backend compiles correctly
    Tool: Bash (cargo)
    Preconditions: Windows-specific code exists
    Steps:
      1. cargo build --target x86_64-pc-windows-msvc → Assert exit code 0
      2. grep "Wasapi" src/audio/windows.rs → Assert Wasapi host used
    Expected Result: Windows-specific code compiles with WASAPI loopback
    Failure Indicators: Cross-compilation fails, wrong host, missing loopback config
    Evidence: Build output captured in .sisyphus/evidence/task-8-windows.log
  ```

  **Example — Linux Platform Detection:**

  ```
  Scenario: Linux backend compiles correctly
    Tool: Bash (cargo)
    Preconditions: Linux-specific code exists
    Steps:
      1. cargo build --target x86_64-unknown-linux-gnu → Assert exit code 0
      2. grep -r "PipeWire\\|PulseAudio" src/audio/linux.rs → Assert at least one
    Expected Result: Linux-specific code compiles with PipeWire/PulseAudio
    Failure Indicators: Cross-compilation fails, wrong host, missing monitor config
    Evidence: Build output captured in .sisyphus/evidence/task-8-linux.log
  ```

  **Evidence to Capture:**
  - [ ] macOS build in .sisyphus/evidence/task-8-macos.log
  - [ ] Windows build in .sisyphus/evidence/task-8-windows.log
  - [ ] Linux build in .sisyphus/evidence/task-8-linux.log

  **Commit**: NO
  - Reason: Platform-specific code, commit after task 9

---

- [ ] 9. Wire Integration (Main Loop + CLI)

  **What to do**:
  - Implement main loop in `src/main.rs`:
    - Initialize audio capture (Arc::clone for thread sharing)
    - Spawn audio capture thread
    - Start async stdin reader for 'q' key
  - Create render loop:
    - Read audio data from shared buffer
    - Call FFT process on each frame
    - Call visualizer render with FFT output
    - Maintain 60 FPS timing
  - Implement graceful shutdown:
    - Signal audio capture thread to stop
    - Drop all Arc references
    - Restore terminal (cursor, screen mode)
  - Add CLI argument parsing (optional: device selection, buffer size)
  - Print help message on startup
  - Handle errors with user-friendly messages

  **Must NOT do**:
  - Do NOT create blocking render loop (async stdin required)
  - Do NOT skip terminal cleanup on exit
  - Do NOT crash on 'q' keypress

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Integration requires threading, async I/O, and error handling
  - **Skills**: `[]`
    - No special skills needed for std::thread and async stdin
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 10 (optimization), Task 11 (polish)
  - **Blocked By**: Task 3 (audio), Task 5 (FFT), Task 7 (visualizer), Task 8 (platform audio)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - scope-tui main loop: https://github.com/alemidev/scope-tui/blob/main/src/main.rs#L1-L100 - Audio capture + render loop
  - Termion async example: https://github.com/redox-os/termion/blob/c784cec0a6f8d1b02692eb58d781acf172bb5959/examples/async.rs#L12 - Non-blocking input
  - Rust threading: https://doc.rust-lang.org/book/ch16-00-threads.html - Arc, Mutex, thread spawn patterns

  **API/Type References** (contracts to implement against):
  - std::sync::Arc: https://doc.rust-lang.org/std/sync/struct.Arc.html - Thread-safe shared ownership
  - std::sync::Mutex: https://doc.rust-lang.org/std/sync/struct.Mutex.html - Thread-safe mutable access
  - std::thread: https://doc.rust-lang.org/std/thread/index.html - spawn, JoinHandle
  - termion async_stdin: https://docs.rs/termion/latest/termion/async_stdin/fn.async_stdin.html - Async keyboard input

  **Test References** (testing patterns to follow):
  - None required (TDD test for this module created in task)

  **Documentation References** (specs and requirements):
  - None

  **External References** (libraries and frameworks):
  - None

  **WHY Each Reference Matters** (explain the relevance):
  - scope-tui main loop: Shows how to integrate audio capture, FFT processing, and rendering in single loop
  - Termion async example: Demonstrates non-blocking keyboard input using async_stdin().bytes()
  - Rust threading: Essential for understanding Arc<Mutex<T>> pattern for sharing audio buffer between capture and render threads
  - std::sync::Arc: Required for multiple ownership of shared audio buffer
  - std::sync::Mutex: Essential for thread-safe mutable access to audio buffer
  - std::thread: Needed for spawning audio capture thread and managing thread lifecycle
  - termion async_stdin: Critical for detecting 'q' keypress without blocking render loop

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] [RED] Test: test_main_loop_structure → Assert main has audio + render loop → FAIL
  - [ ] [GREEN] src/main.rs implements thread spawn for audio, render loop with FFT + visualize
  - [ ] [RED] Test: test_async_input → Assert 'q' exits cleanly → FAIL
  - [ ] [GREEN] src/main.rs uses async_stdin for non-blocking input and handles 'q' gracefully
  - [ ] [RED] Test: test_terminal_cleanup → Assert cursor/screen restored → FAIL
  - [ ] [GREEN] src/main.rs uses Drop or explicit cleanup to restore terminal state
  - [ ] cargo test tests::integration → PASS (3 tests)
  - [ ] cargo build --release → Success (optimized binary)
  - [ ] cargo clippy -- -D warnings → No warnings

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Integration (end-to-end flow):**

  ```
  Scenario: Application runs and responds to quit key
    Tool: interactive_bash (tmux)
    Preconditions: Compiled binary exists, system audio device available
    Steps:
      1. tmux new-session -d -s audioviz ./target/release/sound-specto
      2. Wait for "Press 'q' to quit" in output (timeout: 5s)
      3. Send keys: "q" then Enter
      4. Wait for session to close (timeout: 3s)
      5. Assert session exited with code 0
    Expected Result: Application starts, shows message, exits cleanly on 'q'
    Failure Indicators: No startup message, 'q' doesn't exit, unclean exit, crash
    Evidence: Terminal session captured in .sisyphus/evidence/task-9-integration.log
  ```

  **Example — Audio + Visualizer Integration:**

  ```
  Scenario: Audio capture feeds visualization in real-time
    Tool: interactive_bash (tmux)
    Preconditions: System audio playing, compiled binary
    Steps:
      1. Play test audio file in background (or ensure music playing)
      2. tmux new-session -d -s audioviz ./target/release/sound-specto
      3. Wait for frequency bars appearing (timeout: 5s)
      4. Capture screenshot: tmux capture-pane -t audioviz -p > .sisyphus/evidence/task-9-visual.png
      5. Send "q" to quit
      6. Check screenshot for frequency bar presence
    Expected Result: Visualization responds to system audio, shows frequency bars moving
    Failure Indicators: No visualization, static bars (not responding), crash
    Evidence: Screenshot .sisyphus/evidence/task-9-visual.png
  ```

  **Example — Error Handling:**

  ```
  Scenario: Graceful error when audio device unavailable
    Tool: Bash (cargo)
    Preconditions: No audio device available (simulate with environment)
    Steps:
      1. Disable audio capture (mock) → Run application
      2. Check stderr for error message → Assert "Audio device not found" or similar
      3. Assert exit code is non-zero (error)
      4. Assert no panic/stack trace in output
    Expected Result: Error message shown, clean exit, no panic
    Failure Indicators: Panic instead of error message, exit code 0, unhelpful error
    Evidence: Error output captured in .sisyphus/evidence/task-9-errors.log
  ```

  **Evidence to Capture:**
  - [ ] Integration flow in .sisyphus/evidence/task-9-integration.log
  - [ ] Screenshot of visualizer in .sisyphus/evidence/task-9-visual.png
  - [ ] Error handling in .sisyphus/evidence/task-9-errors.log

  **Commit**: YES
  - Message: `feat(cli): add integrated audio visualizer with system audio capture, FFT spectrum, and Termion rendering`
  - Files: `src/main.rs`, `src/audio/mod.rs`, `src/fft/mod.rs`, `src/visualizer/mod.rs`, `Cargo.toml`
  - Pre-commit: `cargo test && cargo clippy -- -D warnings`

---

- [ ] 10. Performance Optimization

  **What to do**:
  - Benchmark FFT processing time with sample data
  - Optimize buffer management (reduce allocations in render loop)
  - Profile render performance, ensure < 16.67ms per frame at 60 FPS
  - Add frame rate counter display (optional, for debugging)
  - Optimize color calculations (pre-compute gradient palette)
  - Reduce mutex contention (minimize lock duration)
  - Tune buffer sizes based on empirical testing

  **Must NOT do**:
  - Do NOT add premature optimizations that don't measurably improve performance
  - Do NOT sacrifice correctness for speed
  - Do NOT add benchmarking as a dependency (use cargo bench)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Optimization requires profiling, benchmarking, and careful measurement
  - **Skills**: `[]`
    - No special skills needed for cargo bench
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 11 (polish)
  - **Blocked By**: Task 9 (integration)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - RustFFT benchmarks: https://github.com/ejmahler/RustFFT/blob/master/benches - Benchmark patterns
  - cavii buffer optimization: https://github.com/tparker48/cavii/blob/main/src/audio_processing.rs#L18-L24 - Circular buffer pattern

  **API/Type References** (contracts to implement against):
  - Rust test harness: https://doc.rust-lang.org/book/ch11-02-running-tests.html#the-test-harness - Criterion for benchmarks

  **Test References** (testing patterns to follow):
  - None required (optional benchmarking)

  **Documentation References** (specs and requirements):
  - None

  **External References** (libraries and frameworks):
  - Criterion: https://bheisler.github.io/criterion_rs/book/ - Rust benchmarking library

  **WHY Each Reference Matters** (explain the relevance):
  - RustFFT benchmarks: Shows benchmark group setup, black_box, and iteration counting patterns
  - cavii buffer optimization: Demonstrates fixed-size buffer with head pointer for circular access without allocations
  - Rust test harness: Provides `cargo bench` command integration for running benchmarks
  - Criterion: Modern benchmarking library for measuring performance with statistical analysis

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] Benchmark file created: `benches/fft_bench.rs`
  - [ ] cargo bench fft_bench → Runs and produces report (if implemented)
  - [ ] Measure: FFT processing < 5ms for 2048 samples
  - [ ] Measure: Render loop < 16.67ms at 60 FPS target
  - [ ] cargo build --release → Optimized binary
  - [ ] Profile with cargo flamegraph (optional) → No obvious hot spots

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Frame Rate Performance:**

  ```
  Scenario: Maintains at least 30 FPS under load
    Tool: interactive_bash (tmux)
    Preconditions: Compiled binary, audio playback
    Steps:
      1. Start application in tmux session
      2. Play test audio with complex frequency content
      3. Measure frame rate: Count frames over 5 seconds, divide by 5
      4. Assert measured FPS >= 30
    Expected Result: Performance target met, no stuttering
    Failure Indicators: FPS < 30, visible stuttering, frame drops
    Evidence: Frame rate measurement captured in .sisyphus/evidence/task-10-framerate.log
  ```

  **Example — Memory Usage:**

  ```
  Scenario: Memory usage remains stable
    Tool: Bash (cargo)
    Preconditions: Application running
    Steps:
      1. Run with memory profiler or simple system monitoring
      2. Observe over 60 seconds: Assert no continuous memory growth
      3. Check for memory leaks: Assert stable RSS
    Expected Result: Constant memory footprint, no leaks
    Failure Indicators: Growing memory usage, OOM, large RSS growth
    Evidence: Memory profile in .sisyphus/evidence/task-10-memory.log
  ```

  **Evidence to Capture:**
  - [ ] Frame rate in .sisyphus/evidence/task-10-framerate.log
  - [ ] Memory usage in .sisyphus/evidence/task-10-memory.log

  **Commit**: YES
  - Message: `perf(optimization): optimize FFT processing and render loop, achieve 30+ FPS`
  - Files: `src/fft/mod.rs`, `src/visualizer/mod.rs`, `benches/fft_bench.rs`
  - Pre-commit: `cargo test && cargo clippy -- -D warnings`

---

- [ ] 11. Polish and Edge Cases

  **What to do**:
  - Add terminal resize handling (listen for resize events, recalculate layout)
  - Improve error messages with actionable guidance
  - Add BlackHole installation instructions in README (for older macOS)
  - Add platform-specific help (how to enable audio capture on each OS)
  - Handle graceful degradation if audio device disconnects
  - Add color scheme options (optional, user request)
  - Verify clean exit on all signal paths (SIGINT, SIGTERM)
  - Final code review and refactoring (remove technical debt)

  **Must NOT do**:
  - Do NOT add features beyond scope (no GPU, no file playback)
  - Do NOT add excessive documentation (keep it minimal)
  - Do NOT create breaking changes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Polish involves edge case handling and small improvements
  - **Skills**: `[]`
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - None applicable

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (final deliverable)
  - **Blocked By**: Task 10 (optimization)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - Termion resize example: https://github.com/redox-os/termion/blob/c784cec0a6f8d1b02692eb58d781acf172bb5959/examples/alternate_screen_raw.rs#L2-L5 - Resize event handling

  **API/Type References** (contracts to implement against):
  - termion event::Key: https://docs.rs/termion/latest/termion/event/enum.Key.html - Key codes for input
  - termion event::Resize: https://docs.rs/termion/latest/termion/event/struct.Resize.html - Terminal resize event

  **Test References** (testing patterns to follow):
  - None required

  **Documentation References** (specs and requirements):
  - BlackHole: https://github.com/ExistentialAudio/BlackHole - Installation instructions

  **External References** (libraries and frameworks):
  - None

  **WHY Each Reference Matters** (explain the relevance):
  - Termion resize example: Shows how to match Event::Resize and recalculate grid dimensions
  - termion event::Key: Needed for mapping keycodes like 'q', '+', '-' to actions
  - termion event::Resize: Essential for handling terminal window size changes gracefully
  - BlackHole: Required reference for documenting virtual audio device setup on macOS < 14.6

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **If TDD (tests enabled):**
  - [ ] [RED] Test: test_resize_handling → Assert layout recalculates → FAIL
  - [ ] [GREEN] src/main.rs handles Event::Resize and updates visualizer layout
  - [ ] [RED] Test: test_clean_exit → Assert terminal restored → FAIL
  - [ ] [GREEN] src/main.rs cleans up on all exit paths (SIGINT, 'q', error)
  - [ ] cargo test tests::polish → PASS (2 new tests)
  - [ ] cargo build --release → Success
  - [ ] No clippy warnings → cargo clippy -- -D warnings exits cleanly

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  **Example — Terminal Resize:**

  ```
  Scenario: Application handles terminal resize gracefully
    Tool: interactive_bash (tmux)
    Preconditions: Application running
    Steps:
      1. Resize tmux pane (send SIGWINCH)
      2. Wait 1 second for resize to process
      3. Assert no crash, no corruption in output
      4. Assert bars recalculated for new size
    Expected Result: Layout adjusts to new terminal size without issues
    Failure Indicators: Crash on resize, broken visualization, unresponsive
    Evidence: Resize behavior captured in .sisyphus/evidence/task-11-resize.log
  ```

  **Example — Error Messages:**

  ```
  Scenario: Actionable error messages for common issues
    Tool: Bash (cargo)
    Preconditions: Error conditions testable
    Steps:
      1. Test without audio device → Assert helpful error message
      2. Check stderr for "Audio device not found" or similar
      3. Assert message includes action or suggestion
    Expected Result: Clear, actionable error messages
    Failure Indicators: Generic errors, no guidance, cryptic panic
    Evidence: Error messages captured in .sisyphus/evidence/task-11-errors.log
  ```

  **Example — Final Polish (code review):**

  ```
  Scenario: Code quality meets standards
    Tool: Bash (cargo clippy)
    Preconditions: All features implemented
    Steps:
      1. cargo clippy --all-targets → Assert exit code 0
      2. cargo clippy -- -D warnings → Assert no warnings
      3. cargo fmt --check → Assert code is formatted
    Expected Result: Clean, idiomatic Rust code with no warnings
    Failure Indicators: Clippy warnings, formatting issues, compiler warnings
    Evidence: Clippy output in .sisyphus/evidence/task-11-quality.log
  ```

  **Evidence to Capture:**
  - [ ] Resize handling in .sisyphus/evidence/task-11-resize.log
  - [ ] Error messages in .sisyphus/evidence/task-11-errors.log
  - [ ] Code quality in .sisyphus/evidence/task-11-quality.log

  **Commit**: YES
  - Message: `polish(edge-cases): add terminal resize handling, improve error messages, final code review`
  - Files: `src/main.rs`, `README.md` (minimal)
  - Pre-commit: `cargo test && cargo clippy -- -D warnings && cargo fmt --check`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1-8 | (grouped) | All core modules | cargo test |
| 9 | feat(cli): integrated audio visualizer | src/main.rs, src/audio, src/fft, src/visualizer | cargo test + cargo clippy |
| 10 | perf(optimization): optimize FFT and render loop | src/fft, src/visualizer | cargo test |
| 11 | polish(edge-cases): resize handling, error messages | src/main.rs, README.md | cargo test + cargo clippy + cargo fmt |

---

## Success Criteria

### Verification Commands
```bash
# Build
cargo build --release
cargo test

# Run
cargo run --release

# Quality
cargo clippy -- -D warnings
cargo fmt --check
```

### Final Checklist
- [ ] All "Must Have" present
  - [ ] System audio capture on macOS, Linux, Windows
  - [ ] Real-time FFT spectrum analysis
  - [ ] Frequency bar visualization with color gradients
  - [ ] Terminal resize handling
  - [ ] Clean exit on 'q' keypress
  - [ ] Error handling with meaningful messages
  - [ ] Platform-specific audio capture with BlackHole documentation for older macOS
- [ ] All "Must NOT Have" absent
  - [ ] No microphone-only capture
  - [ ] No GPU rendering
  - [ ] No file-based playback
  - [ ] No unnecessary dependencies
  - [ ] No hardcoded device names
  - [ ] No AI-slop bloat
  - [ ] No blocking UI loop
- [ ] All tests pass
  - [ ] cargo test → All tests green, 0 failures
- [ ] Frame rate >= 30 FPS
  - [ ] Verified by agent-executed QA scenario
- [ ] Application exits cleanly on 'q'
  - [ ] Terminal restored (cursor, screen mode)
- [ ] Cross-platform builds succeed
  - [ ] macOS: x86_64-apple-darwin
  - [ ] Windows: x86_64-pc-windows-msvc
  - [ ] Linux: x86_64-unknown-linux-gnu
- [ ] No clippy warnings
  - [ ] cargo clippy -- -D warnings → 0 warnings
