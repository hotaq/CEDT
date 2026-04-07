// features/step_definitions/taxSteps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { calculateTax } = require('../../taxCalculator');

let grossIncome;
let deductions;
let result;

Given('a gross income of {int}', function (amount) {
  grossIncome = Number(amount);
});

Given('deductions:', function (dataTable) {
  // dataTable เป็น Cucumber datatable
  const rows = dataTable.rows();
  // Map to object
  const map = {};
  rows.forEach(([k, v]) => { map[k] = v; });

  deductions = {
    personal: Number(map['personal'] || 0),
    children: {
      count: Number(map['children_count'] || 0),
      perChild: Number(map['children_per'] || 0)
    },
    parents: {
      count: Number(map['parents_count'] || 0),
      perParent: Number(map['parents_per'] || 0)
    },
    other: Number(map['other'] || 0)
  };
});

When('I calculate tax', function () {
  result = calculateTax(grossIncome, deductions);
});

Then('the taxable income should be {int}', function (expected) {
  expect(result.taxableIncome).to.equal(Number(expected));
});

Then('tax should be {float}', function (expectedTax) {
  // compare as number with 2 decimals
  expect(result.tax).to.equal(Number(expectedTax.toFixed(2)));
});
