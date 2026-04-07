/// Log filtering and classification engine.
///
/// Compiles a set of regex patterns at startup and classifies each
/// incoming raw log line from the iOS syslog relay into a typed `LogEvent`.
use anyhow::Result;
use chrono::Local;
use regex::Regex;

// ──────────────────────────────────────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EventKind {
    ThermalPressure,
    JetsamEvent,
    CpuResource,
}

impl EventKind {
    pub fn label(&self) -> &'static str {
        match self {
            EventKind::ThermalPressure => "THERMAL",
            EventKind::JetsamEvent => "JETSAM ",
            EventKind::CpuResource => "CPU    ",
        }
    }
}

#[derive(Debug, Clone)]
pub struct LogEvent {
    pub kind: EventKind,
    /// The process name extracted from the log line (best-effort).
    pub process: String,
    /// The full raw log line, trimmed.
    pub raw_line: String,
    /// Local timestamp when ThermEye received this event.
    pub timestamp: String,
}

// ──────────────────────────────────────────────────────────────────────────────
// Filter engine
// ──────────────────────────────────────────────────────────────────────────────

pub struct FilterEngine {
    re_thermal: Regex,
    re_jetsam: Regex,
    re_cpu: Regex,
    /// Pattern to extract a process name from an Apple unified log line.
    /// Apple log format:  `<date> <time> <device> <process>[<PID>] <...>`
    re_process: Regex,
}

impl FilterEngine {
    /// Compile all patterns once. Call this once at startup.
    pub fn new() -> Result<Self> {
        Ok(Self {
            // Thermal pressure state changes (Nominal → Light/Heavy/Trapping/Critical)
            re_thermal: Regex::new(
                r"(?i)ThermalPressure|thermalPressure.*(?:Light|Heavy|Trapping|Critical)|thermal[ _]state",
            )?,
            // iOS memory-limit jetsam events
            re_jetsam: Regex::new(
                r"(?i)JetsamEvent|jetsam|memory.*limit.*exceeded|mem.*jetsam|killall.*lowmemory",
            )?,
            // CPU resource-limit violations
            re_cpu: Regex::new(
                r"(?i)CPU_RESOURCE_FATAL|cpu.*usage.*warning|high[ _]cpu|cpu.*limit.*exceeded|cpumon",
            )?,
            // Extract process name: Apple unified logs typically look like:
            // "Feb 27 23:23:45 DeviceName ProcessName[PID] <Notice>:"
            // We match the process name (can include dashes, dots, or parenthesis like "runningboardd(RunningBoard)") 
            // right before the PID in brackets.
            re_process: Regex::new(r"\s([A-Za-z0-9_\-\.\(\)]+)\[\d+\]\s*(<Notice>|<Error>|<Warning>|<Debug>|:)").unwrap_or_else(|_| Regex::new(".").unwrap()),
        })
    }

    /// Try to classify a raw log line. Returns `None` if it doesn't match any pattern.
    pub fn classify(&self, line: &str) -> Option<LogEvent> {
        let kind = if self.re_thermal.is_match(line) {
            EventKind::ThermalPressure
        } else if self.re_jetsam.is_match(line) {
            EventKind::JetsamEvent
        } else if self.re_cpu.is_match(line) {
            EventKind::CpuResource
        } else {
            return None;
        };

        let process = self
            .re_process
            .captures(line)
            .and_then(|c| c.get(1))
            .map(|m| m.as_str().to_string())
            .unwrap_or_else(|| "unknown".to_string());

        Some(LogEvent {
            kind,
            process,
            raw_line: line.trim().to_string(),
            timestamp: Local::now().format("%H:%M:%S").to_string(),
        })
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Unit tests
// ──────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn engine() -> FilterEngine {
        FilterEngine::new().expect("regex compilation failed")
    }

    #[test]
    fn classifies_thermal_pressure() {
        let line = "Feb 27 12:00:00 iPhone thermalmonitord[123]: ThermalPressure state changed to Heavy";
        let event = engine().classify(line).expect("should match");
        assert_eq!(event.kind, EventKind::ThermalPressure);
        assert_eq!(event.process, "thermalmonitord");
    }

    #[test]
    fn classifies_jetsam() {
        let line = "Feb 27 12:01:00 iPhone jetsam[456]: JetsamEvent process=SpringBoard";
        let event = engine().classify(line).expect("should match");
        assert_eq!(event.kind, EventKind::JetsamEvent);
        assert_eq!(event.process, "jetsam");
    }

    #[test]
    fn classifies_cpu_resource() {
        let line = "Feb 27 12:02:00 iPhone ReportCrash[789]: CPU_RESOURCE_FATAL: process exceeded cpu limit";
        let event = engine().classify(line).expect("should match");
        assert_eq!(event.kind, EventKind::CpuResource);
        assert_eq!(event.process, "ReportCrash");
    }

    #[test]
    fn ignores_unrelated_lines() {
        let line = "Feb 27 12:03:00 iPhone bluetoothd[321]: Connection established to peer";
        assert!(engine().classify(line).is_none());
    }

    #[test]
    fn handles_process_with_no_pid() {
        let line = "ThermalPressure changed to Critical";
        let event = engine().classify(line).expect("should match thermal");
        assert_eq!(event.kind, EventKind::ThermalPressure);
        assert_eq!(event.process, "unknown");
    }
}
