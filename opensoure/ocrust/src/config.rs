#[derive(Debug, Clone, Copy)]
pub struct InferenceConfig {
    pub threshold: u8,
    pub word_gap_columns: usize,
}

impl Default for InferenceConfig {
    fn default() -> Self {
        Self {
            threshold: 128,
            word_gap_columns: 3,
        }
    }
}
