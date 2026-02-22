import { RuleScoreDetail } from "@/types";

// Calculate rule-based score for a property against a condition
export function calculateRuleScore(
  property: any,
  condition: any
): { score: number; details: RuleScoreDetail } {
  const details: RuleScoreDetail = {
    area: 0,
    propertyType: 0,
    price: 0,
    yield: 0,
    buildYear: 0,
    landArea: 0,
    buildingArea: 0,
  };

  // Area check (pass/fail -> 1 or 0)
  if (condition.areas) {
    const areas = JSON.parse(condition.areas) as string[];
    if (areas.length === 0 || !property.area) {
      details.area = 0.5; // neutral if no area specified
    } else {
      details.area = areas.some((a: string) => property.area?.includes(a))
        ? 1
        : 0;
    }
  } else {
    details.area = 0.5;
  }

  // Property type check (pass/fail)
  if (condition.propertyTypes) {
    const types = JSON.parse(condition.propertyTypes) as string[];
    if (types.length === 0 || !property.propertyType) {
      details.propertyType = 0.5;
    } else {
      details.propertyType = types.includes(property.propertyType) ? 1 : 0;
    }
  } else {
    details.propertyType = 0.5;
  }

  // Price (gradient score 0-1)
  details.price = calculateGradientScore(
    property.price,
    condition.minPrice,
    condition.maxPrice
  );

  // Yield (gradient)
  details.yield = calculateGradientScore(
    property.grossYield,
    condition.minYield,
    condition.maxYield
  );

  // Build year (gradient)
  details.buildYear = calculateGradientScore(
    property.buildYear,
    condition.minBuildYear,
    condition.maxBuildYear
  );

  // Land area (gradient)
  details.landArea = calculateGradientScore(
    property.landArea,
    condition.minLandArea,
    condition.maxLandArea
  );

  // Building area (gradient)
  details.buildingArea = calculateGradientScore(
    property.buildingArea,
    condition.minBuildingArea,
    condition.maxBuildingArea
  );

  // Calculate weighted average (area and propertyType are pass/fail with higher weight)
  const weights = {
    area: 0.25,
    propertyType: 0.15,
    price: 0.2,
    yield: 0.15,
    buildYear: 0.1,
    landArea: 0.075,
    buildingArea: 0.075,
  };

  const score = Object.keys(weights).reduce(
    (sum, key) =>
      sum +
      weights[key as keyof typeof weights] *
        details[key as keyof RuleScoreDetail],
    0
  );

  return { score: Math.max(0, Math.min(1, score)), details };
}

// Helper: gradient score 0-1 for numeric ranges. If value is null, return neutral 0.5.
// If only min specified: 1 if >= min, gradient down below. If only max specified: 1 if <= max, gradient down above.
// If both: 1 if in range, gradient down outside.
function calculateGradientScore(
  value: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined
): number {
  if (value == null) return 0.5;
  if (min == null && max == null) return 0.5;

  if (min != null && max != null) {
    if (value >= min && value <= max) return 1;
    if (value < min) return Math.max(0, 1 - ((min - value) / min) * 2);
    return Math.max(0, 1 - ((value - max) / max) * 2);
  }

  if (min != null) {
    if (value >= min) return 1;
    return Math.max(0, 1 - ((min - value) / min) * 2);
  }

  if (max != null) {
    if (value <= max) return 1;
    return Math.max(0, 1 - ((value - max) / max) * 2);
  }

  return 0.5;
}
