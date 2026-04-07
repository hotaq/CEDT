## 1. Setup and Receipt Capture UI

- [x] 1.1 Scaffold the mobile-responsive image upload and camera capture component
- [x] 1.2 Implement client-side image compression and formatting logic

## 2. OCR Extraction Engine Integration

- [x] 2.1 Create stateless API endpoint for receiving and processing image payloads
- [x] 2.2 Integrate external Cloud Vision OCR API to extract raw text
- [x] 2.3 Wrap an LLM call to parse raw text into structured `{ total, date, category }` JSON

## 3. Expense Dashboard and Editing

- [x] 3.1 Build the expense dashboard list view for recently parsed transactions
- [x] 3.2 Add an edit form to allow users to review and correct extraction mistakes
- [x] 3.3 Wire up confirmation logic to save the approved transaction to the permanent ledger
