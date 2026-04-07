use std::{fmt, io, path::PathBuf};

#[derive(Debug)]
pub enum OcrError {
    Io(io::Error),
    InvalidImageFormat(&'static str),
    ParseInt(std::num::ParseIntError),
    EmptyImage,
    UnknownGlyph { width: usize, height: usize },
    MissingArgument(&'static str),
    FixtureManifest(PathBuf),
}

impl fmt::Display for OcrError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(err) => write!(f, "io error: {err}"),
            Self::InvalidImageFormat(msg) => write!(f, "invalid image format: {msg}"),
            Self::ParseInt(err) => write!(f, "parse int error: {err}"),
            Self::EmptyImage => write!(f, "image did not contain any dark pixels"),
            Self::UnknownGlyph { width, height } => {
                write!(f, "unknown glyph with size {width}x{height}")
            }
            Self::MissingArgument(name) => write!(f, "missing required argument: {name}"),
            Self::FixtureManifest(path) => {
                write!(f, "missing or invalid fixture manifest: {}", path.display())
            }
        }
    }
}

impl std::error::Error for OcrError {}

impl From<io::Error> for OcrError {
    fn from(value: io::Error) -> Self {
        Self::Io(value)
    }
}

impl From<std::num::ParseIntError> for OcrError {
    fn from(value: std::num::ParseIntError) -> Self {
        Self::ParseInt(value)
    }
}

pub type Result<T> = std::result::Result<T, OcrError>;
