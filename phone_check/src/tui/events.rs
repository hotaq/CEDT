/// Keyboard event handler.
///
/// Polls for crossterm key events with a short timeout so the render loop
/// stays responsive. This function is designed to be called inside a
/// `tokio::select!` branch.
use crossterm::event::{self, Event, KeyCode, KeyEventKind};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use crate::state::AppState;

/// Poll for one keyboard event and mutate `state` accordingly.
///
/// Key bindings:
/// - `q` / `Esc` → set `should_quit = true`
/// - `↑` / `k`  → scroll event feed up (towards older events)
/// - `↓` / `j`  → scroll event feed down (towards newer events)
/// - `c`         → clear all events and culprit counts
pub async fn handle_events(state: Arc<Mutex<AppState>>) {
    // Use `spawn_blocking` so crossterm's synchronous `poll` doesn't block
    // the tokio thread pool.
    let _ = tokio::task::spawn_blocking(move || {
        if event::poll(Duration::from_millis(20)).unwrap_or(false) {
            if let Ok(Event::Key(key)) = event::read() {
                // Only react to actual key-press events (not release on Windows/etc.)
                if key.kind != KeyEventKind::Press {
                    return;
                }
                let mut s = state.lock().unwrap();
                match key.code {
                    KeyCode::Char('q') | KeyCode::Esc => {
                        s.should_quit = true;
                    }
                    KeyCode::Up | KeyCode::Char('k') => {
                        s.scroll = s.scroll.saturating_add(1);
                    }
                    KeyCode::Down | KeyCode::Char('j') => {
                        s.scroll = s.scroll.saturating_sub(1);
                    }
                    KeyCode::Char('c') => {
                        s.events.clear();
                        s.culprits.clear();
                        s.scroll = 0;
                    }
                    _ => {}
                }
            }
        }
    })
    .await;
}
