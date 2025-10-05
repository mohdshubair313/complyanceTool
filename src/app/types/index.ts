export interface UploadData {
  rowsParsed: number;
  data: any[]; // Invoices array
}

export interface Report {
  reportId: string;
  scores: {
    data: number;
    coverage: number;
    rules: number;
  };
  coverage: {
    matched: string[];
    close: Array<{ target: string; candidate: string; confidence: number }>;
    missing: string[];
  };
  ruleFindings: Array<{
    rule: string;
    ok: boolean;
    exampleLine?: number;
    value?: string;
  }>;
  meta: {
    rowsParsed: number;
    country: string;
    erp: string;
  };
}

// Add more from assignment §6
