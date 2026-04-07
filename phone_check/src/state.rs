/// Shared application state protected by a Mutex.
/// Both the background log-streaming task and the TUI render loop
/// access this struct through an `Arc<Mutex<AppState>>`.
use std::collections::HashMap;
use std::collections::VecDeque;

use crate::device::IosDevice;
use crate::filter::LogEvent;

/// Maximum number of events kept in the ring buffer.
pub const MAX_EVENTS: usize = 500;

pub struct AppState {
    /// Rolling ring buffer of the most recent `MAX_EVENTS` filtered log events.
    pub events: VecDeque<LogEvent>,
    /// Hit counts per process name across all event kinds.
    pub culprits: HashMap<String, u32>,
    /// Device metadata populated after a successful connection.
    pub device: Option<IosDevice>,
    /// Whether the device is currently connected and streaming.
    pub connected: bool,
    /// Scroll offset for the event feed panel (0 = newest at bottom).
    pub scroll: usize,
    /// Whether the app should exit on the next event-loop iteration.
    pub should_quit: bool,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            events: VecDeque::with_capacity(MAX_EVENTS),
            culprits: HashMap::new(),
            device: None,
            connected: false,
            scroll: 0,
            should_quit: false,
        }
    }

    /// Push a new event, evicting the oldest if the buffer is full.
    pub fn push_event(&mut self, event: LogEvent) {
        if self.events.len() >= MAX_EVENTS {
            self.events.pop_front();
        }
        *self.culprits.entry(event.process.clone()).or_insert(0) += 1;
        self.events.push_back(event);
    }

    /// Returns the culprits sorted descending by hit count.
    pub fn sorted_culprits(&self) -> Vec<(&String, &u32)> {
        let mut v: Vec<(&String, &u32)> = self.culprits.iter().collect();
        v.sort_by(|a, b| b.1.cmp(a.1));
        v
    }
}
