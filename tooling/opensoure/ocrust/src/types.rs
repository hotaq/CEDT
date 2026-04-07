use std::path::PathBuf;

pub trait PixelGrid {
    fn width(&self) -> usize;
    fn height(&self) -> usize;
    fn pixels(&self) -> &[bool];

    fn pixel(&self, x: usize, y: usize) -> bool {
        self.pixels()[y * self.width() + x]
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BinaryImage {
    pub width: usize,
    pub height: usize,
    pub pixels: Vec<bool>,
}

impl BinaryImage {
    pub fn new(width: usize, height: usize, pixels: Vec<bool>) -> Self {
        Self {
            width,
            height,
            pixels,
        }
    }

    pub fn pixel(&self, x: usize, y: usize) -> bool {
        <Self as PixelGrid>::pixel(self, x, y)
    }
}

impl PixelGrid for BinaryImage {
    fn width(&self) -> usize {
        self.width
    }

    fn height(&self) -> usize {
        self.height
    }

    fn pixels(&self) -> &[bool] {
        &self.pixels
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GlyphSegment {
    pub width: usize,
    pub height: usize,
    pub pixels: Vec<bool>,
}

impl GlyphSegment {
    pub fn pixel(&self, x: usize, y: usize) -> bool {
        <Self as PixelGrid>::pixel(self, x, y)
    }
}

impl PixelGrid for GlyphSegment {
    fn width(&self) -> usize {
        self.width
    }

    fn height(&self) -> usize {
        self.height
    }

    fn pixels(&self) -> &[bool] {
        &self.pixels
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct OcrPrediction {
    pub text: String,
    pub confidence: f32,
    pub glyphs: usize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BenchmarkCase {
    pub image_path: PathBuf,
    pub expected_text: String,
}

#[derive(Debug, Clone, PartialEq)]
pub struct BenchmarkSample {
    pub image_path: PathBuf,
    pub expected_text: String,
    pub predicted_text: String,
    pub char_accuracy: f32,
    pub latency_ms: f64,
}

#[derive(Debug, Clone, PartialEq)]
pub struct BenchmarkSummary {
    pub sample_count: usize,
    pub average_char_accuracy: f32,
    pub average_latency_ms: f64,
    pub model_size_bytes: usize,
    pub samples: Vec<BenchmarkSample>,
}
