import { isValid, formatISO } from 'date-fns'; // For ISO

const ALLOWED_CURRENCIES = ['AED', 'SAR', 'MYR', 'USD'];

type Finding = {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
};

export function runRules(data: any[]): Finding[] {
  const findings: Finding[] = [
    { rule: 'TOTALS_BALANCE', ok: true },
    { rule: 'LINE_MATH', ok: true },
    { rule: 'DATE_ISO', ok: true },
    { rule: 'CURRENCY_ALLOWED', ok: true },
    { rule: 'TRN_PRESENT', ok: true },
  ];

  let hasBalanceError = false;
  data.forEach((row) => {
    // 1. TOTALS_BALANCE
    const totalExcl = row['total_excl_vat'] || row['totalExclVat'] || 0;
    const vat = row['vat_amount'] || row['vatAmount'] || 0;
    const totalIncl = row['total_incl_vat'] || row['totalInclVat'] || 0;
    if (Math.abs(totalExcl + vat - totalIncl) > 0.01) {
      findings[0].ok = false;
      hasBalanceError = true;
    }

    // 2. LINE_MATH (assume lines array in row)
    if (row.lines && Array.isArray(row.lines)) {
      row.lines.forEach((line: any, lineIdx: number) => {
        const qty = line.qty || 0;
        const unitPrice = line.unit_price || line.unitPrice || 0;
        const lineTotal = line.line_total || line.lineTotal || 0;
        if (Math.abs(qty * unitPrice - lineTotal) > 0.01) {
          findings[1].ok = false;
          findings[1].exampleLine = lineIdx + 1; // Global line?
          findings[1].expected = qty * unitPrice;
          findings[1].got = lineTotal;
        }
      });
    }

    // 3. DATE_ISO
    const issueDate = row['issue_date'] || row['issueDate'];
    if (issueDate && !isValid(new Date(issueDate)) && !formatISO(new Date(issueDate)).startsWith(issueDate)) {
      findings[2].ok = false;
    }

    // 4. CURRENCY_ALLOWED
    const currency = (row['currency'] || '').toUpperCase();
    if (!ALLOWED_CURRENCIES.includes(currency)) {
      findings[3].ok = false;
      findings[3].value = currency;
    }

    // 5. TRN_PRESENT
    const buyerTrn = row['buyer.trn'] || row.buyer?.trn;
    const sellerTrn = row['seller.trn'] || row.seller?.trn;
    if (!buyerTrn || !sellerTrn) {
      findings[4].ok = false;
    }
  });

  // Aggregate: if any row fails, rule fail (or per assignment logic)
  return findings;
}
