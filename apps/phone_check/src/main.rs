//! # ThermEye
//!
//! macOS TUI for monitoring iOS device thermal state and CPU events via USB.
//!
//! Usage:
//!   1. Plug in your iPhone via USB.
//!   2. Accept "Trust This Computer" on the device.
//!   3. Run: `cargo run` or `thermeye`
//!
//! Key bindings inside the TUI:
//!   q / Esc  — quit
//!   ↑ / k    — scroll event feed up
//!   ↓ / j    — scroll event feed down
//!   c        — clear all events

mod device;
mod filter;
mod state;
mod stream;
mod tui;

use anyhow::Result;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

#[tokio::main]
async fn main() -> Result<()> {
    // ── 1. Connect to device ─────────────────────────────────────────────────
    eprintln!("ThermEye — connecting to iOS device over USB...");
    let (ios_device, provider, pairing_file) = match device::connect().await {
        Ok(triple) => triple,
        Err(e) => {
            eprintln!("\n❌  {}\n", e);
            std::process::exit(1);
        }
    };
    eprintln!(
        "✅  Connected: {} (iOS {})",
        ios_device.name, ios_device.ios_version
    );

    // ── 2. Shared state ──────────────────────────────────────────────────────
    let state = Arc::new(Mutex::new(state::AppState::new()));
    {
        let mut s = state.lock().unwrap();
        s.device = Some(ios_device);
        s.connected = true;
    }

    // ── 3. Syslog channel (raw log lines from the device) ────────────────────
    let (tx, mut rx) = mpsc::channel::<String>(1024);

    // ── 4. Start streaming syslog from device ───────────────────────────────
    let stream_handle =
        match stream::start_syslog_stream(&provider, &pairing_file, tx).await {
            Ok(h) => h,
            Err(e) => {
                eprintln!("\n❌  Failed to start syslog stream: {}\n", e);
                std::process::exit(1);
            }
        };

    // ── 5. Background task: filter & push events into shared state ───────────
    let state_for_filter = Arc::clone(&state);
    let filter_handle = tokio::spawn(async move {
        let engine = filter::FilterEngine::new().expect("regex compilation failed");
        while let Some(line) = rx.recv().await {
            if let Some(event) = engine.classify(&line) {
                state_for_filter.lock().unwrap().push_event(event);
            }
        }
    });

    // ── 6. Initialise TUI ────────────────────────────────────────────────────
    let mut terminal = tui::init_terminal()?;

    // ── 7. Run TUI render loop (blocks until user presses q/Esc) ────────────
    let run_result = tui::run(&mut terminal, Arc::clone(&state)).await;

    // ── 8. Cleanup ───────────────────────────────────────────────────────────
    stream_handle.abort();
    filter_handle.abort();

    tui::restore_terminal(&mut terminal)?;
    state.lock().unwrap().connected = false;

    run_result?;

    Ok(())
}
