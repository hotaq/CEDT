pub mod config;
pub mod decoder;
pub mod error;
pub mod eval;
pub mod infer;
pub mod model;
pub mod ocr_engine;
pub mod ocr_engine_impl;
pub mod preprocess;
pub mod types;

pub use config::InferenceConfig;
pub use error::{OcrError, Result};
pub use infer::{OcrEngine, infer_path};
pub use types::{
    BenchmarkCase, BenchmarkSample, BenchmarkSummary, BinaryImage, GlyphSegment, OcrPrediction,
};
