use std::path::Path;

use crate::{
    config::InferenceConfig, decoder, error::Result, model::TemplateBank, ocr_engine::OcrEngineApi,
    preprocess, types::OcrPrediction,
};

#[derive(Debug, Clone)]
pub struct OcrEngineImpl {
    config: InferenceConfig,
    bank: TemplateBank,
}

impl Default for OcrEngineImpl {
    fn default() -> Self {
        Self::new(InferenceConfig::default())
    }
}

impl OcrEngineImpl {
    pub fn new(config: InferenceConfig) -> Self {
        Self {
            config,
            bank: TemplateBank::default(),
        }
    }

    pub fn recognize_path<P: AsRef<Path>>(&self, path: P) -> Result<OcrPrediction> {
        OcrEngineApi::recognize_path(self, path.as_ref())
    }

    pub fn model_size_bytes(&self) -> usize {
        OcrEngineApi::model_size_bytes(self)
    }
}

impl OcrEngineApi for OcrEngineImpl {
    fn recognize_path(&self, path: &Path) -> Result<OcrPrediction> {
        let image = preprocess::read_pgm(path, self.config)?;
        let tokens = preprocess::segment_tokens(&image, self.config);
        let (text, confidence) = decoder::decode(&tokens, &self.bank)?;
        let glyphs = text.chars().filter(|ch| *ch != ' ').count();
        Ok(OcrPrediction {
            text,
            confidence,
            glyphs,
        })
    }

    fn model_size_bytes(&self) -> usize {
        self.bank.model_size_bytes()
    }
}
