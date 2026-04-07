use crate::{error::Result, model::TemplateBank, preprocess::SegmentToken};

pub fn decode(tokens: &[SegmentToken], bank: &TemplateBank) -> Result<(String, f32)> {
    let mut text = String::new();
    let mut confidence_sum = 0.0f32;
    let mut glyphs = 0usize;

    for token in tokens {
        match token {
            SegmentToken::Space => text.push(' '),
            SegmentToken::Glyph(segment) => {
                let (symbol, confidence) = bank.classify(segment)?;
                text.push(symbol);
                confidence_sum += confidence;
                glyphs += 1;
            }
        }
    }

    let confidence = if glyphs == 0 {
        0.0
    } else {
        confidence_sum / glyphs as f32
    };
    Ok((text, confidence))
}
