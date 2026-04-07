//! OCR engine contract.
//!
//! This module defines the public OCR engine boundary used by callers that
//! want inference behavior without coupling to the concrete implementation.

use std::path::Path;

use crate::{error::Result, ocr_engine_impl::OcrEngineImpl, types::OcrPrediction};

/// Public OCR engine contract.
///
/// The trait exposes the high-level inference surface while leaving
/// configuration, model ownership, and orchestration details to the concrete
/// `OcrEngineImpl` type in `ocr_engine_impl.rs`.
pub trait OcrEngineApi: Send + Sync {
    /// Recognize text from the image at the provided path.
    fn recognize_path(&self, path: &Path) -> Result<OcrPrediction>;

    /// Return the model footprint in bytes.
    fn model_size_bytes(&self) -> usize;
}

/// Default OCR engine type for this research prototype.
pub type OcrEngine = OcrEngineImpl;

pub fn infer_path<P: AsRef<Path>>(path: P) -> Result<OcrPrediction> {
    OcrEngine::default().recognize_path(path.as_ref())
}
