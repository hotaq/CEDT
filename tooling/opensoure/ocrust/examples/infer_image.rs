use std::{env, path::PathBuf};

use ocrust::{OcrEngine, OcrError, Result};

fn main() {
    if let Err(error) = run() {
        eprintln!("infer_image failed: {error}");
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let image_path = env::args()
        .nth(1)
        .map(PathBuf::from)
        .ok_or(OcrError::MissingArgument("image path"))?;
    let engine = OcrEngine::default();
    let result = engine.recognize_path(image_path)?;
    println!("{}", result.text);
    Ok(())
}
