
export function calculateScores(coverage: any, ruleFindings: any[], rowsParsed: number, questionnaire: any) {
  // Data: % rows parsed (assume 100% if parsed)
  const dataScore = rowsParsed > 0 ? 100 : 0;

  // Coverage: % matched (weight header/seller/buyer higher)
  const totalKeys = 25; // Schema
  const headerSellerBuyer = 12; // Approx
  const matchedHeader: number = coverage.matched.filter((f: string) => f.startsWith('invoice') || f.startsWith('seller') || f.startsWith('buyer')).length;
  const coverageScore = ((coverage.matched.length / totalKeys) * 100) * 1.5; // Higher weight example, cap 100

  // Rules: average pass
  const rulesPass = ruleFindings.filter(f => f.ok).length / 5 * 100;

  // Posture: from questionnaire (simple: true=25 each)
  const postureScore = (questionnaire.webhooks ? 25 : 0) + (questionnaire.sandbox_env ? 25 : 0) + (questionnaire.retries ? 50 : 0);

  const overall = (dataScore * 0.25) + (coverageScore * 0.35) + (rulesPass * 0.30) + (postureScore * 0.10);

  return {
    data: Math.round(dataScore),
    coverage: Math.round(coverageScore),
    rules: Math.round(rulesPass),
    posture: Math.round(postureScore),
    overall: Math.round(overall),
  };
}
