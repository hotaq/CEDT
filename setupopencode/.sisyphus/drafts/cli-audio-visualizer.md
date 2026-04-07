# Draft: CLI Audio Visualizer

## User Requirements (confirmed)
- **Type**: CLI/TUI tool
- **Purpose**: Real-time audio visualization from music user is listening to
- **Language**: Rust
- **Audio source**: Capture system audio
- **Visualization style**: Frequency bars (spectrum analyzer)
- **TUI library**: Termion
- **Repository**: https://github.com/hotaq/sound-specto.git (EMPTY - build from scratch)

## Starting Point
- **Repository status**: COMPLETELY EMPTY - no code, no commits, no files
- **Action needed**: Initialize project from scratch, build MVP

## Questions to Clarify
- Target platform: Cross-platform (macOS, Linux, Windows)

## Research Findings - Complete (ALL TASKS DONE)

### Termion Real-Time UI (COMPLETED)
✅ **60 FPS achievable** with proper optimization
✅ **Key performance techniques**:
  - Alternate screen mode (prevents scrolling)
  - Cursor hiding (prevents artifacts)
  - Double buffering with differential rendering (only update changed cells)
  - Batch writes with single flush per frame
  - Frame timing with Instant::now() and thread::sleep()
✅ **Drawing frequency bars**:
  - Use Unicode block characters ('█', '▪')
  - TrueColor (RGB) for smooth gradients across frequency ranges
  - cursor::Goto(x, y) for precise positioning
✅ **Terminal resize handling**:
  - Use termion::terminal_size() for dynamic sizing
  - Listen for resize events with termion::event::Event
✅ **Async input** to prevent blocking render loop

### Audio Capture Libraries (COMPLETED)
✅ **CPAL 0.17.1** - Primary recommendation:
  - Cross-platform audio I/O (488K+ downloads/month)
  - **System audio (loopback) support on all platforms**:
    - macOS: CoreAudio loopback native for 14.6+, fallback to BlackHole virtual device
    - Windows: WASAPI loopback native support
    - Linux: PipeWire/PulseAudio monitor sources
✅ **Platform-specific approaches documented**:
  - Windows: WASAPI loopback mode (reference: note67 project)
  - macOS: CoreAudio Taps API OR ScreenCaptureKit (reference: meeting-minutes project)
  - Linux: PulseAudio/PipeWire monitor sources

### FFT Processing (COMPLETED)
✅ **realfft 3.5** - Recommended for audio:
  - Optimized for real-valued audio data (2x faster than rustfft)
  - Pure Rust, actively maintained
✅ **Alternative**: rustfft (complex FFT) or spectrum-analyzer (higher-level)

### Existing Projects Analysis (COMPLETED)
✅ **crav**: Uses audioviz + cpal + termion (microphone only, dual backend)
✅ **vibes**: Simple wave, cpal + crossterm (microphone only)
✅ **cavii**: Dual backend (PulseAudio/WASAPI), has FFT implementation pattern
✅ **System audio examples found**:
  - note67: Windows WASAPI loopback
  - meeting-minutes: macOS Core Audio taps + ScreenCaptureKit
  - ruhear: System audio capture library

### System Audio Capture Strategy (CRITICAL FINDING)
⚠️ **CPAL loopback support is MODERN (macOS 14.6+ only)**:
  - For older macOS (<14.6): Requires BlackHole virtual device (17.9K stars, well-established)
  - Windows & Linux: Native support in CPAL

### Architecture Recommendations
✅ **Recommended stack**:
  - Audio: CPAL 0.17.1 (cross-platform loopback)
  - FFT: realfft 3.5 (optimized for real audio)
  - UI: Termion (as requested)
  - Buffer: Arc<Mutex<Vec<f32>>> for thread-safe circular buffer

### Performance Targets
✅ **Buffer size**: 2048-4096 samples (42-85ms latency at 48kHz)
✅ **FFT size**: 1024-2048
✅ **Target FPS**: 30-60 FPS (Termion achieves 60 FPS with optimizations)
✅ **Hann windowing**: Apply to reduce spectral leakage
✅ **Overlap-add**: 50% overlap for STFT (smooth transitions)

## Test Strategy Decision
- **Infrastructure**: None currently (new project)
- **Automated tests**: YES (TDD - RED-GREEN-REFACTOR)
- **Framework**: TBD (to be determined - likely rust's built-in test or criterion for benchmarks)
- **Agent-Executed QA**: Always included - complement unit tests with integration/E2E verification

## CLEARANCE CHECK
- ✅ Core objective: CLI audio visualizer with system audio capture + frequency bars
- ✅ Scope boundaries: IN (system audio, frequency bars, Termion), OUT (microphone-only, GPU, file playback)
- ✅ No critical ambiguities: All requirements clear (cross-platform, system audio, Termion)
- ✅ Technical approach: CPAL + realfft + Termion
- ✅ Test strategy: TDD with Agent-Executed QA scenarios
- ✅ No blocking questions: All decisions made

**STATUS: READY TO PROCEED TO PLAN GENERATION**
