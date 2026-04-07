use std::{
    fs,
    path::{Path, PathBuf},
    time::Instant,
};

use crate::{
    error::{OcrError, Result},
    infer::OcrEngine,
    types::{BenchmarkCase, BenchmarkSample, BenchmarkSummary},
};

pub fn discover_fixture_cases(fixtures_dir: &Path) -> Result<Vec<BenchmarkCase>> {
    let manifest_path = fixtures_dir.join("manifest.tsv");
    let content = fs::read_to_string(&manifest_path)
        .map_err(|_| OcrError::FixtureManifest(manifest_path.clone()))?;
    let mut cases = Vec::new();

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        let mut parts = trimmed.splitn(2, '\t');
        let image_name = parts
            .next()
            .ok_or_else(|| OcrError::FixtureManifest(manifest_path.clone()))?;
        let expected_text = parts
            .next()
            .ok_or_else(|| OcrError::FixtureManifest(manifest_path.clone()))?;
        cases.push(BenchmarkCase {
            image_path: fixtures_dir.join(image_name),
            expected_text: expected_text.to_string(),
        });
    }

    Ok(cases)
}

pub fn benchmark_fixtures(engine: &OcrEngine, fixtures_dir: &Path) -> Result<BenchmarkSummary> {
    let cases = discover_fixture_cases(fixtures_dir)?;
    let mut samples = Vec::new();
    let mut total_accuracy = 0.0f32;
    let mut total_latency_ms = 0.0f64;

    for case in cases {
        let start = Instant::now();
        let prediction = engine.recognize_path(&case.image_path)?;
        let latency_ms = start.elapsed().as_secs_f64() * 1000.0;
        let char_accuracy = string_accuracy(&prediction.text, &case.expected_text);
        total_accuracy += char_accuracy;
        total_latency_ms += latency_ms;
        samples.push(BenchmarkSample {
            image_path: case.image_path,
            expected_text: case.expected_text,
            predicted_text: prediction.text,
            char_accuracy,
            latency_ms,
        });
    }

    let sample_count = samples.len().max(1);
    Ok(BenchmarkSummary {
        sample_count: samples.len(),
        average_char_accuracy: total_accuracy / sample_count as f32,
        average_latency_ms: total_latency_ms / sample_count as f64,
        model_size_bytes: engine.model_size_bytes(),
        samples,
    })
}

pub fn summary_to_json(summary: &BenchmarkSummary) -> String {
    let mut json = String::new();
    json.push_str("{\n");
    json.push_str(&format!("  \"sample_count\": {},\n", summary.sample_count));
    json.push_str(&format!(
        "  \"average_char_accuracy\": {:.4},\n",
        summary.average_char_accuracy
    ));
    json.push_str(&format!(
        "  \"average_latency_ms\": {:.4},\n",
        summary.average_latency_ms
    ));
    json.push_str(&format!(
        "  \"model_size_bytes\": {},\n",
        summary.model_size_bytes
    ));
    json.push_str("  \"samples\": [\n");
    for (index, sample) in summary.samples.iter().enumerate() {
        json.push_str("    {\n");
        json.push_str(&format!(
            "      \"image_path\": \"{}\",\n",
            escape_json(&sample.image_path.display().to_string())
        ));
        json.push_str(&format!(
            "      \"expected_text\": \"{}\",\n",
            escape_json(&sample.expected_text)
        ));
        json.push_str(&format!(
            "      \"predicted_text\": \"{}\",\n",
            escape_json(&sample.predicted_text)
        ));
        json.push_str(&format!(
            "      \"char_accuracy\": {:.4},\n",
            sample.char_accuracy
        ));
        json.push_str(&format!("      \"latency_ms\": {:.4}\n", sample.latency_ms));
        json.push_str("    }");
        if index + 1 != summary.samples.len() {
            json.push(',');
        }
        json.push('\n');
    }
    json.push_str("  ]\n}\n");
    json
}

pub fn write_summary_json(summary: &BenchmarkSummary, output_path: &Path) -> Result<()> {
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(output_path, summary_to_json(summary))?;
    Ok(())
}

fn escape_json(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

fn string_accuracy(predicted: &str, expected: &str) -> f32 {
    let predicted: Vec<char> = predicted.chars().collect();
    let expected: Vec<char> = expected.chars().collect();
    let total = predicted.len().max(expected.len()).max(1);
    let matches = predicted
        .iter()
        .zip(expected.iter())
        .filter(|(a, b)| a == b)
        .count();
    matches as f32 / total as f32
}

pub fn benchmark_report_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("artifacts/benchmark-v1.json")
}
