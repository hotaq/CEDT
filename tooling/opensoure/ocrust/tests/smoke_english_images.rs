use std::path::Path;

use ocrust::OcrEngine;
use ocrust::eval::{benchmark_fixtures, discover_fixture_cases, write_summary_json};

#[test]
fn curated_fixtures_decode_exactly() {
    let engine = OcrEngine::default();
    let fixtures_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures/english-printed");
    let fixtures = discover_fixture_cases(&fixtures_dir).unwrap();

    assert!(!fixtures.is_empty(), "expected curated fixtures to exist");

    for fixture in fixtures {
        let result = engine.recognize_path(&fixture.image_path).unwrap();
        assert_eq!(
            result.text, fixture.expected_text,
            "fixture {:?}",
            fixture.image_path
        );
    }
}

#[test]
fn benchmark_report_contains_required_metrics() {
    let engine = OcrEngine::default();
    let fixtures_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("fixtures/english-printed");
    let summary = benchmark_fixtures(&engine, &fixtures_dir).unwrap();
    assert!(summary.average_char_accuracy >= 0.99);
    assert!(summary.average_latency_ms >= 0.0);
    assert!(summary.model_size_bytes > 0);

    let output_path = std::env::temp_dir().join("ocrust-benchmark-test.json");
    write_summary_json(&summary, &output_path).unwrap();
    let written = std::fs::read_to_string(output_path).unwrap();
    assert!(written.contains("\"average_char_accuracy\""));
    assert!(written.contains("\"average_latency_ms\""));
    assert!(written.contains("\"model_size_bytes\""));
}
