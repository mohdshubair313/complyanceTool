// fuse.js has no maintained types, so declare minimal types here
// Remove if you add your own fuse.js.d.ts file
// @ts-ignore
import Fuse from 'fuse.js';

const GETS_SCHEMA = [
  'invoice.id', 'invoice.issue_date', 'invoice.currency', 'invoice.total_excl_vat',
  'invoice.vat_amount', 'invoice.total_incl_vat',
  'seller.name', 'seller.trn', 'seller.country', 'seller.city',
  'buyer.name', 'buyer.trn', 'buyer.country', 'buyer.city',
  'lines.sku', 'lines.description', 'lines.qty', 'lines.unit_price', 'lines.line_total',
  'lines.vat_rate', 'lines.vat_amount'
];

export function runFieldMapping(sampleRow: any): any {
  const userFields = Object.keys(sampleRow).map(f => f.toLowerCase().replace(/[_ ]/g, ''));
  const matched: string[] = [];
  const close: Array<{ target: string; candidate: string; confidence: number }> = [];
  const missing: string[] = [];

  // Fuse.js setup: Fuzzy search on userFields
  const fuse = new Fuse(userFields, {
    threshold: 0.4, // 0=exact, 1=loose; 0.4 good for close matches
    includeScore: true, // Get confidence (lower score = higher similarity)
    ignoreLocation: true, // Match anywhere
    useExtendedSearch: true,
  });

  GETS_SCHEMA.forEach((target) => {
    const normTarget = target.toLowerCase().replace(/[_ ]/g, '');
    let found = false;

    // Exact match first
    if (userFields.includes(normTarget)) {
      matched.push(target);
      found = true;
    } else {
      // Fuzzy search for close
      const result = fuse.search(normTarget);
      if (result.length > 0) {
        const score = result[0].score ?? 1; // default worst case me null
        const confidence = Math.max(0, 1 - score); // this ensure that confidence is between 0 and 1
        // Accept only high confidence matches
        if (confidence < 0.6) return; // skip low confidence matches
        const candidate = result[0].item; // Matched user field

        // Type compatible check
        const targetType = inferTypeFromSchema(target);
        const userValue = sampleRow[Object.keys(sampleRow).find(k => k.toLowerCase().replace(/[_ ]/g, '') === candidate) || ''];
        const userType = inferType(userValue);

        if (targetType === userType || targetType === 'text') {
          close.push({ target, candidate, confidence: Math.round(confidence * 100) / 100 }); // Always number
          found = true;
        } 
      }
    }

    if (!found) missing.push(target);
  });

  return { matched, close, missing };
}

// inferTypeFromSchema and inferType same as before
function inferTypeFromSchema(field: string): 'number' | 'date' | 'text' {
  if (field.includes('date')) return 'date';
  if (field.includes('total') || field.includes('price') || field.includes('qty')) return 'number';
  return 'text';
}

function inferType(value: any): 'number' | 'date' | 'text' {
  if (typeof value === 'number') return 'number';
  if (!isNaN(Date.parse(value))) return 'date';
  return 'text';
}
