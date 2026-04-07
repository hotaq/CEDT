use std::path::PathBuf;

use ocrust::eval::{benchmark_fixtures, summary_to_json};
use ocrust::{OcrEngine, Result};

fn main() {
    if let Err(error) = run() {
        eprintln!("cpu_inference bench failed: {error}");
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let engine = OcrEngine::default();
    let fixtures_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures/english-printed");
    let summary = benchmark_fixtures(&engine, &fixtures_dir)?;
    println!("{}", summary_to_json(&summary));
    Ok(())
}
