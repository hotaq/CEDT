## ADDED Requirements

### Requirement: Display Spending Forecast Chart
The system SHALL render a line chart on the expense dashboard that displays both historical daily spending actuals and a linear projection of cumulative spend through the end of the current month.

#### Scenario: Viewing the forecast chart with sufficient data
- **WHEN** the user opens the expense dashboard and at least one confirmed transaction exists in the current month
- **THEN** the system displays a line chart with two series: actual cumulative daily spend and a projected trend line extending to the last day of the month
- **AND** the projected line is visually distinct from the actuals line (e.g., dashed vs solid)

#### Scenario: Viewing the forecast with no transactions this month
- **WHEN** the user opens the expense dashboard and no confirmed transactions exist in the current month
- **THEN** the chart is hidden or replaced with an empty-state message indicating insufficient data for a forecast

### Requirement: Display Month-End Balance Projection
The system SHALL display a summary figure showing the projected remaining balance at month-end based on the linear burn-rate model.

#### Scenario: Positive projected balance
- **WHEN** the projected month-end spend is less than the user's starting monthly balance
- **THEN** the system displays the projected remaining balance in green with a positive indicator

#### Scenario: Negative projected balance (overspend)
- **WHEN** the projected month-end spend exceeds the user's starting monthly balance
- **THEN** the system displays the projected deficit in red with a warning indicator and the label "Projected overspend"
