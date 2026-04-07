## Context

We are building a smart receipt parsing feature to automate expense tracking. The current state requires users to manually input transaction data, which introduces friction and leads to poor tracking habits. By taking a photo of a receipt, the system will use OCR to extract the Total, Date, and Category data automatically. 

## Goals / Non-Goals

**Goals:**
- Provide a responsive, mobile-first web interface for image capture/upload.
- Implement a backend service capable of receiving images and interfacing with an OCR provider (e.g., Google Cloud Vision or AWS Textract).
- Accurately parse the OCR text output to identify the transaction Total, Date, and guess the Category.
- Update the user's dashboard with the parsed expense data in real-time.

**Non-Goals:**
- Building a custom machine learning OCR model from scratch.
- Handling highly complex, multi-page invoices (focus is on standard retail/food receipts).
- Perfect 100% accuracy on category prediction (users will have the ability to manually override/edit).

## Decisions

**OCR Provider: Cloud Vision API over Tesseract**
- *Rationale*: While Tesseract is free and run locally, its accuracy on unstructured, often crumpled receipt photos is significantly lower than cloud-based AI models. To ensure a magical user experience and reduce manual corrections, we will use a cloud provider like Google Cloud Vision or AWS Textract. 

**Extraction Logic: Regex + Heuristics vs. LLM**
- *Rationale*: We will begin by using a Large Language Model (LLM) with structured output (e.g., OpenAI or Anthropic) to parse the raw OCR text into JSON containing `{ total, date, category }`. This is more robust than brittle regex patterns since receipt layouts vary wildly across merchants.

**Architecture: Stateless API**
- *Rationale*: The OCR processing and extraction step will be a stateless API endpoint. The frontend will send the image (base64 or multipart form), the backend will call the OCR and LLM services, and return the structured JSON data back to the frontend to confirm before saving to the database.

## Risks / Trade-offs

- **Cost of API usage (Cloud Vision + LLM)**: Cloud APIs cost money per transaction. *Mitigation*: We will monitor usage and perhaps implement a daily upload limit per user on free tiers, and restrict image resolution on the frontend before uploading to save bandwidth and compute.
- **Latency**: Processing an image through two external APIs (OCR then LLM) might take a few seconds. *Mitigation*: Show an engaging loading animation or skeleton UI on the frontend while processing.
- **Inaccurate Parsing**: The LLM might hallucinate or fail to find the correct total. *Mitigation*: The parsed data must be presented to the user for confirmation and editing before it is definitively added to their ledger.
