/// TUI subsystem: terminal initialisation, the render loop, and teardown.
///
/// This module is the "glue" between ratatui and the rest of the app:
/// it owns the `Terminal` handle, enters/exits raw mode, and drives the
/// 30fps render loop.
pub mod events;
pub mod ui;

use anyhow::Result;
use crossterm::{
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{backend::CrosstermBackend, Terminal};
use std::io::{self, Stdout};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::time::interval;

use crate::state::AppState;

pub type Tui = Terminal<CrosstermBackend<Stdout>>;

/// Initialise the terminal: raw mode + alternate screen.
pub fn init_terminal() -> Result<Tui> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    Ok(Terminal::new(backend)?)
}

/// Restore the terminal to its original state.
pub fn restore_terminal(terminal: &mut Tui) -> Result<()> {
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}

/// Run the main TUI loop until `state.should_quit` is set.
///
/// The loop renders at ~30 fps; keyboard events are handled concurrently
/// via `tokio::select!`.
pub async fn run(terminal: &mut Tui, state: Arc<Mutex<AppState>>) -> Result<()> {
    let mut tick = interval(Duration::from_millis(33)); // ~30 fps

    loop {
        // ── Render ──────────────────────────────────────────────────────────
        {
            let s = state.lock().unwrap();
            terminal.draw(|frame| ui::draw(frame, &s))?;
        }

        // ── Poll for keyboard events or the next tick ────────────────────────
        tokio::select! {
            _ = tick.tick() => {}
            _ = events::handle_events(Arc::clone(&state)) => {}
        }

        // ── Check quit flag ──────────────────────────────────────────────────
        if state.lock().unwrap().should_quit {
            break;
        }
    }

    Ok(())
}
