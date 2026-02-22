export function calculateTotalScore(
  ruleScore: number,
  aiScore: number,
  ruleWeight: number,
  aiWeight: number
): number {
  return ruleWeight * ruleScore + aiWeight * aiScore;
}
