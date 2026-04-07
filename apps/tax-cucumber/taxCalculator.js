// src/taxCalculator.js

const TAX_BRACKETS = [
  { upTo: 150000, rate: 0 },
  { upTo: 300000, rate: 0.05 },
  { upTo: 500000, rate: 0.1 },
  { upTo: 750000, rate: 0.15 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: 2000000, rate: 0.25 },
  { upTo: 5000000, rate: 0.3 },
  { upTo: 10000000, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

/**
 * calculateTax
 * @param {number} grossIncome - รายได้รวมต่อปี
 * @param {object} deductions - object เก็บรายละเอียดค่าลดหย่อน เช่น
 *    {
 *      personal: 60000,
 *      children: { count: 2, perChild: 30000 },
 *      parents: { count: 2, perParent: 30000 },
 *      other: 10000
 *    }
 * @returns {object} { grossIncome, totalDeductions, taxableIncome, tax }
 */
function calculateTax(grossIncome, deductions = {}) {
  if (typeof grossIncome !== "number" || isNaN(grossIncome)) {
    throw new Error("grossIncome ต้องเป็นตัวเลข");
  }

  
  const personal = Number(deductions.personal || 60000); 
  const childrenCount = Number(deductions.children?.count || 0);
  const perChild = Number(deductions.children?.perChild || 30000);
  const parentsCount = Number(deductions.parents?.count || 0);
  const perParent = Number(deductions.parents?.perParent || 30000);
  const other = Number(deductions.other || 0);

  const totalDeductions = Math.max(
    0,
    personal + childrenCount * perChild + parentsCount * perParent + other
  );

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);


  let remaining = taxableIncome;
  let lowerBound = 0;
  let tax = 0;

  for (const bracket of TAX_BRACKETS) {
    const upper = bracket.upTo;
    const rate = bracket.rate;

    if (taxableIncome <= lowerBound) break;

    const taxableInBracket = Math.max(
      0,
      Math.min(remaining, upper - lowerBound)
    );
    tax += taxableInBracket * rate;

    remaining -= taxableInBracket;
    lowerBound = upper;

    if (remaining <= 0) break;
  }

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    tax: Number(tax.toFixed(2)),
    effectiveRate:
      taxableIncome > 0 ? Number((tax / taxableIncome).toFixed(4)) : 0,
  };
}

module.exports = { calculateTax };
