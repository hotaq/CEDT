use std::path::PathBuf;

use ocrust::eval::{benchmark_fixtures, benchmark_report_path, write_summary_json};
use ocrust::{OcrEngine, Result};

fn main() {
    if let Err(error) = run() {
        eprintln!("benchmark_report failed: {error}");
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let engine = OcrEngine::default();
    let fixtures_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures/english-printed");
    let summary = benchmark_fixtures(&engine, &fixtures_dir)?;
    let output_path = benchmark_report_path();
    write_summary_json(&summary, &output_path)?;
    println!(
        "benchmark report written to {} (accuracy {:.2}%, avg latency {:.3} ms, model {} bytes)",
        output_path.display(),
        summary.average_char_accuracy * 100.0,
        summary.average_latency_ms,
        summary.model_size_bytes
    );
    Ok(())
}
