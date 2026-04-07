# Capability: Receipt Capture UI

## Purpose

Provides a mobile-responsive interface for users to capture or upload receipt images, prepare them client-side (compression, formatting), and submit them to the OCR extraction engine.

## Requirements

### Requirement: Capture Receipt Image
The system SHALL provide a mobile-responsive interface for users to take a photo of a receipt using their device camera or upload an existing image file.

#### Scenario: Successful image capture via camera
- **WHEN** user taps the "Capture Receipt" button on a mobile device
- **THEN** the system opens the camera interface
- **AND** allows the user to take a photo
- **AND** displays a preview of the captured image before submission

#### Scenario: Successful image upload
- **WHEN** user taps the "Upload Image" button
- **THEN** the system opens the file picker
- **AND** allows the user to select an image file (e.g., JPEG, PNG)
- **AND** displays a preview of the selected image before submission

### Requirement: Image Preparation and Submission
The system SHALL compress and format the image on the client side before sending it to the backend to optimize bandwidth usage and API latency.

#### Scenario: Submitting an image for processing
- **WHEN** user confirms the captured or uploaded image
- **THEN** the system compresses the image to a standardized resolution and quality
- **AND** submits the image payload to the OCR extraction engine
- **AND** displays a loading state while waiting for the response
