# Capability: OCR Extraction Engine

## Purpose

Backend service responsible for accepting receipt image payloads, extracting raw text via OCR (Cloud Vision API or Tesseract), and using an LLM to parse structured expense data (Total, Date, Category) from that text.

## Requirements

### Requirement: OCR Processing
The backend system SHALL accept image payloads, process them through a Cloud Vision API (or Tesseract), and retrieve raw unstructured text representing the contents of the receipt.

#### Scenario: Successful OCR text extraction
- **WHEN** the backend receives a valid receipt image payload
- **THEN** it forwards the image to the OCR service
- **AND** successfully receives the unstructured text response

### Requirement: Intelligent Data Extraction
The system SHALL extract the Total amount, Transaction Date, and a predicted Category from the unstructured OCR text.

#### Scenario: Extracting structured data via LLM
- **WHEN** the unstructured text is obtained from the OCR service
- **THEN** the backend prompts an LLM to extract the `total`, `date`, and `category`
- **AND** returns a structured JSON object containing these three fields

#### Scenario: Handling unreadable or missing data
- **WHEN** the LLM cannot confidently extract one or more fields (e.g., blurred image, torn receipt)
- **THEN** the system returns `null` or an empty value for the missing fields
- **AND** flags the extraction as "incomplete" requiring manual user review
