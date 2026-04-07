use std::{fs, ops::Range, path::Path};

use crate::{
    config::InferenceConfig,
    error::{OcrError, Result},
    types::{BinaryImage, GlyphSegment, PixelGrid},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SegmentToken {
    Glyph(GlyphSegment),
    Space,
}

pub fn read_pgm(path: &Path, config: InferenceConfig) -> Result<BinaryImage> {
    let content = fs::read_to_string(path)?;
    parse_pgm(&content, config.threshold)
}

pub fn parse_pgm(content: &str, threshold: u8) -> Result<BinaryImage> {
    let mut tokens = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let line = if let Some((before, _)) = trimmed.split_once('#') {
            before.trim()
        } else {
            trimmed
        };
        tokens.extend(line.split_whitespace().map(ToOwned::to_owned));
    }

    if tokens.len() < 4 || tokens[0] != "P2" {
        return Err(OcrError::InvalidImageFormat("expected ASCII PGM (P2)"));
    }

    let width: usize = tokens[1].parse()?;
    let height: usize = tokens[2].parse()?;
    let max_value: u16 = tokens[3].parse()?;
    if max_value == 0 {
        return Err(OcrError::InvalidImageFormat("max value must be > 0"));
    }
    let expected_pixels = width * height;
    if tokens.len() != 4 + expected_pixels {
        return Err(OcrError::InvalidImageFormat("pixel count mismatch"));
    }

    let mut pixels = Vec::with_capacity(expected_pixels);
    for token in &tokens[4..] {
        let value: u16 = token.parse()?;
        let normalized = ((value as f32 / max_value as f32) * 255.0).round() as u8;
        pixels.push(normalized < threshold);
    }

    trim_binary_image(&BinaryImage::new(width, height, pixels))
}

pub fn trim_binary_image(image: &BinaryImage) -> Result<BinaryImage> {
    let (min_x, min_y, max_x, max_y) = foreground_bounds(image).ok_or(OcrError::EmptyImage)?;

    let width = max_x - min_x + 1;
    let height = max_y - min_y + 1;
    let pixels = collect_pixels(image, min_x..(max_x + 1), min_y..(max_y + 1));

    Ok(BinaryImage::new(width, height, pixels))
}

pub fn segment_tokens(image: &BinaryImage, config: InferenceConfig) -> Vec<SegmentToken> {
    let mut tokens = Vec::new();
    let mut x = 0usize;
    let mut pending_gap = 0usize;

    while x < image.width {
        if column_is_blank(image, x) {
            pending_gap += 1;
            x += 1;
            continue;
        }

        if !tokens.is_empty() && pending_gap >= config.word_gap_columns {
            tokens.push(SegmentToken::Space);
        }
        pending_gap = 0;

        let start = x;
        while x < image.width && !column_is_blank(image, x) {
            x += 1;
        }
        let end = x;
        tokens.push(SegmentToken::Glyph(glyph_from_columns(image, start..end)));
    }

    tokens
}

fn foreground_bounds<T: PixelGrid>(image: &T) -> Option<(usize, usize, usize, usize)> {
    let mut min_x = image.width();
    let mut min_y = image.height();
    let mut max_x = 0usize;
    let mut max_y = 0usize;
    let mut found = false;

    for y in 0..image.height() {
        for x in 0..image.width() {
            if image.pixel(x, y) {
                min_x = min_x.min(x);
                min_y = min_y.min(y);
                max_x = max_x.max(x);
                max_y = max_y.max(y);
                found = true;
            }
        }
    }

    found.then_some((min_x, min_y, max_x, max_y))
}

fn collect_pixels<T: PixelGrid>(
    image: &T,
    x_range: Range<usize>,
    y_range: Range<usize>,
) -> Vec<bool> {
    let width = x_range.end - x_range.start;
    let height = y_range.end - y_range.start;
    let mut pixels = Vec::with_capacity(width * height);
    for y in y_range {
        for x in x_range.clone() {
            pixels.push(image.pixel(x, y));
        }
    }
    pixels
}

fn glyph_from_columns<T: PixelGrid>(image: &T, x_range: Range<usize>) -> GlyphSegment {
    let width = x_range.end - x_range.start;
    let height = image.height();
    let pixels = collect_pixels(image, x_range, 0..height);
    GlyphSegment {
        width,
        height,
        pixels,
    }
}

fn column_is_blank<T: PixelGrid>(image: &T, x: usize) -> bool {
    (0..image.height()).all(|y| !image.pixel(x, y))
}

#[cfg(test)]
mod tests {
    use super::{SegmentToken, parse_pgm, segment_tokens, trim_binary_image};
    use crate::{
        config::InferenceConfig,
        error::OcrError,
        types::{BinaryImage, GlyphSegment},
    };

    #[test]
    fn parse_pgm_ignores_comments_and_trims_border() {
        let content = "\
P2
# full-line comment
4 3
255 # inline comment
255 255 255 255
255 0 0 255
255 255 255 255
";

        let image = parse_pgm(content, 128).expect("pgm should parse");

        assert_eq!(image.width, 2);
        assert_eq!(image.height, 1);
        assert_eq!(image.pixels, vec![true, true]);
    }

    #[test]
    fn trim_binary_image_rejects_blank_images() {
        let image = BinaryImage::new(2, 2, vec![false, false, false, false]);

        let err = trim_binary_image(&image).expect_err("blank image should fail");

        assert!(matches!(err, OcrError::EmptyImage));
    }

    #[test]
    fn segment_tokens_inserts_space_for_large_gaps_only() {
        let image = BinaryImage::new(
            7,
            2,
            vec![
                true, false, true, true, false, false, true, true, false, true, true, false, false,
                true,
            ],
        );
        let config = InferenceConfig {
            word_gap_columns: 2,
            ..InferenceConfig::default()
        };

        let tokens = segment_tokens(&image, config);

        assert_eq!(
            tokens,
            vec![
                SegmentToken::Glyph(GlyphSegment {
                    width: 1,
                    height: 2,
                    pixels: vec![true, true],
                }),
                SegmentToken::Glyph(GlyphSegment {
                    width: 2,
                    height: 2,
                    pixels: vec![true, true, true, true],
                }),
                SegmentToken::Space,
                SegmentToken::Glyph(GlyphSegment {
                    width: 1,
                    height: 2,
                    pixels: vec![true, true],
                }),
            ]
        );
    }
}
