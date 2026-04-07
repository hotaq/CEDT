use std::collections::BTreeMap;

use crate::{
    error::{OcrError, Result},
    types::GlyphSegment,
};

pub const GLYPH_WIDTH: usize = 5;
pub const GLYPH_HEIGHT: usize = 7;

#[derive(Debug, Clone)]
pub struct TemplateBank {
    glyphs: BTreeMap<char, [bool; GLYPH_WIDTH * GLYPH_HEIGHT]>,
}

impl Default for TemplateBank {
    fn default() -> Self {
        let mut glyphs = BTreeMap::new();
        for (symbol, rows) in [
            (
                'A',
                [
                    "01110", "10001", "10001", "11111", "10001", "10001", "10001",
                ],
            ),
            (
                'C',
                [
                    "01110", "10001", "10000", "10000", "10000", "10001", "01110",
                ],
            ),
            (
                'E',
                [
                    "11111", "10000", "10000", "11110", "10000", "10000", "11111",
                ],
            ),
            (
                'H',
                [
                    "10001", "10001", "10001", "11111", "10001", "10001", "10001",
                ],
            ),
            (
                'L',
                [
                    "10000", "10000", "10000", "10000", "10000", "10000", "11111",
                ],
            ),
            (
                'O',
                [
                    "01110", "10001", "10001", "10001", "10001", "10001", "01110",
                ],
            ),
            (
                'P',
                [
                    "11110", "10001", "10001", "11110", "10000", "10000", "10000",
                ],
            ),
            (
                'R',
                [
                    "11110", "10001", "10001", "11110", "10100", "10010", "10001",
                ],
            ),
            (
                'S',
                [
                    "01111", "10000", "10000", "01110", "00001", "00001", "11110",
                ],
            ),
            (
                'T',
                [
                    "11111", "00100", "00100", "00100", "00100", "00100", "00100",
                ],
            ),
            (
                'U',
                [
                    "10001", "10001", "10001", "10001", "10001", "10001", "01110",
                ],
            ),
            (
                'Y',
                [
                    "10001", "10001", "01010", "00100", "00100", "00100", "00100",
                ],
            ),
        ] {
            glyphs.insert(symbol, parse_rows(rows));
        }
        Self { glyphs }
    }
}

impl TemplateBank {
    pub fn classify(&self, segment: &GlyphSegment) -> Result<(char, f32)> {
        let normalized = normalize(segment, GLYPH_WIDTH, GLYPH_HEIGHT);
        let mut best: Option<(char, usize)> = None;
        for (symbol, template) in &self.glyphs {
            let distance = normalized
                .iter()
                .zip(template.iter())
                .filter(|(a, b)| a != b)
                .count();
            match best {
                Some((_, best_distance)) if distance >= best_distance => {}
                _ => best = Some((*symbol, distance)),
            }
        }

        let (symbol, distance) = best.ok_or(OcrError::UnknownGlyph {
            width: segment.width,
            height: segment.height,
        })?;
        let total = (GLYPH_WIDTH * GLYPH_HEIGHT) as f32;
        let confidence = 1.0 - (distance as f32 / total);
        Ok((symbol, confidence.max(0.0)))
    }

    pub fn model_size_bytes(&self) -> usize {
        self.glyphs.len() * GLYPH_WIDTH * GLYPH_HEIGHT
    }
}

fn parse_rows(rows: [&str; GLYPH_HEIGHT]) -> [bool; GLYPH_WIDTH * GLYPH_HEIGHT] {
    let mut out = [false; GLYPH_WIDTH * GLYPH_HEIGHT];
    for (y, row) in rows.iter().enumerate() {
        for (x, ch) in row.chars().enumerate() {
            out[y * GLYPH_WIDTH + x] = ch == '1';
        }
    }
    out
}

fn normalize(
    segment: &GlyphSegment,
    out_width: usize,
    out_height: usize,
) -> [bool; GLYPH_WIDTH * GLYPH_HEIGHT] {
    let mut out = [false; GLYPH_WIDTH * GLYPH_HEIGHT];
    for y in 0..out_height {
        for x in 0..out_width {
            let src_x = x * segment.width / out_width;
            let src_y = y * segment.height / out_height;
            out[y * out_width + x] = segment.pixel(src_x, src_y);
        }
    }
    out
}
