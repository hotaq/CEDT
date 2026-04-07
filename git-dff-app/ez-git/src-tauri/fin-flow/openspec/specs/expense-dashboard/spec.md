# Capability: Expense Dashboard

## Purpose

Provides users with a dashboard view to review, edit, and confirm parsed receipt transactions. Aggregates confirmed expenses into the global ledger.

## Requirements

### Requirement: Display Parsed Expenses
The system SHALL provide a dashboard view that lists all recently processed receipt transactions, displaying the Total, Date, and Category for each.

#### Scenario: Viewing a list of parsed expenses
- **WHEN** the user navigates to the expense dashboard
- **THEN** the system fetches and displays a list of recent transactions
- **AND** formats the Total as currency and the Date in a human-readable format

### Requirement: Edit and Confirm Parsed Data
The system SHALL allow users to review and manually edit the extracted fields (Total, Date, Category) before finalizing the transaction into the permanent ledger.

#### Scenario: Editing extracted data
- **WHEN** a user clicks on an unconfirmed parsed receipt in the dashboard
- **THEN** the system opens an edit form pre-populated with the extracted values
- **AND** allows the user to change any incorrect values

#### Scenario: Confirming a transaction
- **WHEN** the user reviews and submits the extracted or edited data
- **THEN** the system marks the transaction as "confirmed"
- **AND** updates the global expense ledger and dashboard aggregates
