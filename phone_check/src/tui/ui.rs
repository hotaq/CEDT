/// ratatui draw function — renders the three-panel ThermEye dashboard.
///
/// Layout:
/// ```
/// ╔═══════════════════════ ThermEye ═══════════════════════╗
/// ║  ● Device: iPhone 15 Pro   iOS 17.4   [CONNECTED]      ║  ← Header
/// ╠═══════════════════════════╦════════════════════════════╣
/// ║  Live Event Feed          ║  Culprit Aggregator        ║
/// ║  [THERMAL] thermalmonitord║  Process          Hits     ║
/// ║  [JETSAM ] jetsam         ║  SpringBoard       12      ║
/// ║  [CPU    ] ReportCrash    ║  backboard          7      ║
/// ╚═══════════════════════════╩════════════════════════════╝
/// ```
use ratatui::{
    layout::{Alignment, Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Cell, List, ListItem, Paragraph, Row, Table},
    Frame,
};

use crate::filter::EventKind;
use crate::state::AppState;

// ──────────────────────────────────────────────────────────────────────────────
// Colour palette
// ──────────────────────────────────────────────────────────────────────────────
const COL_THERMAL: Color = Color::Rgb(255, 80, 80);   // red-orange
const COL_JETSAM:  Color = Color::Rgb(255, 200, 50);  // amber
const COL_CPU:     Color = Color::Rgb(50, 220, 220);  // cyan
const COL_ACCENT:  Color = Color::Rgb(130, 100, 255); // purple accent
const COL_DIM:     Color = Color::Rgb(100, 100, 120);
const COL_GREEN:   Color = Color::Rgb(80, 220, 120);
const COL_BG:      Color = Color::Rgb(15, 15, 25);    // near-black bg
const COL_BORDER:  Color = Color::Rgb(60, 60, 90);

// ──────────────────────────────────────────────────────────────────────────────
// Main draw entry point
// ──────────────────────────────────────────────────────────────────────────────

pub fn draw(frame: &mut Frame, state: &AppState) {
    let area = frame.area();

    // ── Outer vertical split: header (3 lines) + body ──────────────────────
    let outer = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Length(3), Constraint::Min(0)])
        .split(area);

    // ── Inner horizontal split: 65% event feed | 35% culprit table ─────────
    let inner = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(65), Constraint::Percentage(35)])
        .split(outer[1]);

    draw_header(frame, state, outer[0]);
    draw_event_feed(frame, state, inner[0]);
    draw_culprit_table(frame, state, inner[1]);
}

// ──────────────────────────────────────────────────────────────────────────────
// Header panel
// ──────────────────────────────────────────────────────────────────────────────

fn draw_header(frame: &mut Frame, state: &AppState, area: ratatui::layout::Rect) {
    let (dot, dot_colour, status_text) = if state.connected {
        ("●", COL_GREEN, " STREAMING")
    } else {
        ("○", COL_DIM, " NO DEVICE")
    };

    let (device_name, ios_ver) = state
        .device
        .as_ref()
        .map(|d| (d.name.as_str(), d.ios_version.as_str()))
        .unwrap_or(("—", "—"));

    let spans = Line::from(vec![
        Span::styled("  ThermEye", Style::default().fg(COL_ACCENT).add_modifier(Modifier::BOLD)),
        Span::styled("  │  ", Style::default().fg(COL_BORDER)),
        Span::styled(dot, Style::default().fg(dot_colour)),
        Span::styled(status_text, Style::default().fg(dot_colour).add_modifier(Modifier::BOLD)),
        Span::styled("  │  Device: ", Style::default().fg(COL_DIM)),
        Span::styled(device_name, Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
        Span::styled("  │  iOS ", Style::default().fg(COL_DIM)),
        Span::styled(ios_ver, Style::default().fg(Color::White)),
        Span::styled("  │  q:quit  c:clear  ↑↓:scroll", Style::default().fg(COL_DIM)),
    ]);

    let header = Paragraph::new(spans)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_style(Style::default().fg(COL_BORDER))
                .style(Style::default().bg(COL_BG)),
        )
        .alignment(Alignment::Left);

    frame.render_widget(header, area);
}

// ──────────────────────────────────────────────────────────────────────────────
// Live event feed (left panel)
// ──────────────────────────────────────────────────────────────────────────────

fn draw_event_feed(frame: &mut Frame, state: &AppState, area: ratatui::layout::Rect) {
    let items: Vec<ListItem> = state
        .events
        .iter()
        .rev() // newest first — scrolling starts from the bottom
        .skip(state.scroll)
        .map(|event| {
            let (colour, label) = match event.kind {
                EventKind::ThermalPressure => (COL_THERMAL, "THERMAL"),
                EventKind::JetsamEvent     => (COL_JETSAM,  "JETSAM "),
                EventKind::CpuResource     => (COL_CPU,     "CPU    "),
            };

            // Truncate raw_line so it never wraps
            let max_raw = area.width.saturating_sub(30) as usize;
            let raw = if event.raw_line.len() > max_raw {
                format!("{}…", &event.raw_line[..max_raw.saturating_sub(1)])
            } else {
                event.raw_line.clone()
            };

            let line = Line::from(vec![
                Span::styled(
                    format!(" {} ", event.timestamp),
                    Style::default().fg(COL_DIM),
                ),
                Span::styled(
                    format!("[{}]", label),
                    Style::default().fg(colour).add_modifier(Modifier::BOLD),
                ),
                Span::styled(
                    format!(" {:20} ", event.process),
                    Style::default().fg(Color::White),
                ),
                Span::styled(raw, Style::default().fg(COL_DIM)),
            ]);

            ListItem::new(line)
        })
        .collect();

    let event_count = state.events.len();
    let title = format!(" Live Events ({} total) ", event_count);

    let list = List::new(items)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_style(Style::default().fg(COL_BORDER))
                .title(Span::styled(
                    title,
                    Style::default().fg(COL_ACCENT).add_modifier(Modifier::BOLD),
                ))
                .style(Style::default().bg(COL_BG)),
        )
        .highlight_style(Style::default().add_modifier(Modifier::BOLD));

    frame.render_widget(list, area);
}

// ──────────────────────────────────────────────────────────────────────────────
// Culprit aggregator table (right panel)
// ──────────────────────────────────────────────────────────────────────────────

fn draw_culprit_table(frame: &mut Frame, state: &AppState, area: ratatui::layout::Rect) {
    let culprits = state.sorted_culprits();

    let header_cells = ["Process", "Hits"].iter().map(|h| {
        Cell::from(*h).style(
            Style::default()
                .fg(COL_ACCENT)
                .add_modifier(Modifier::BOLD | Modifier::UNDERLINED),
        )
    });
    let header_row = Row::new(header_cells).height(1).bottom_margin(1);

    let rows: Vec<Row> = culprits
        .iter()
        .enumerate()
        .map(|(i, (process, count))| {
            // Highlight the top culprit in red.
            let row_colour = if i == 0 {
                COL_THERMAL
            } else if i == 1 {
                COL_JETSAM
            } else {
                Color::White
            };
            Row::new(vec![
                Cell::from(process.as_str()).style(Style::default().fg(row_colour)),
                Cell::from(count.to_string()).style(
                    Style::default()
                        .fg(row_colour)
                        .add_modifier(Modifier::BOLD),
                ),
            ])
        })
        .collect();

    let table = Table::new(
        rows,
        [Constraint::Min(20), Constraint::Length(6)],
    )
    .header(header_row)
    .block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(COL_BORDER))
            .title(Span::styled(
                " Culprit Aggregator ",
                Style::default().fg(COL_ACCENT).add_modifier(Modifier::BOLD),
            ))
            .style(Style::default().bg(COL_BG)),
    )
    .column_spacing(1);

    frame.render_widget(table, area);
}
