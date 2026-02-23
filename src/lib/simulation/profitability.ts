/**
 * 収益計算ロジック
 * 3シナリオ（保守/標準/積極）での収益シミュレーション
 */

import { RenovationResult } from "./renovation";
import { ComparablesResult } from "./mlit-api";

export interface ScenarioInput {
  label: string;
  discountRate: number; // 割引率 (0.3 = 30%)
}

export interface ScenarioResult {
  label: string;
  discountRate: number;
  purchasePrice: number;
  expenses: number;
  renovationCost: number;
  totalInvestment: number;
  estimatedResalePrice: number;
  grossProfit: number;
  grossMargin: number;
  roi: number;
  estimatedMonths: number;
  annualizedROI: number;
}

export interface SimulationResult {
  scenarios: ScenarioResult[];
  renovation: RenovationResult;
  comparables: ComparablesResult;
  summary: {
    askingPrice: number;
    bestScenario: string;
    standardGrossMargin: number;
    standardROI: number;
  };
}

const SCENARIOS: ScenarioInput[] = [
  { label: "保守", discountRate: 0.3 },
  { label: "標準", discountRate: 0.2 },
  { label: "積極", discountRate: 0.1 },
];

const EXPENSE_RATE = 0.07; // 諸経費率 7%

function estimateProjectMonths(
  buildAge: number,
  structureCategory: string,
): number {
  // リノベ期間 + 販売期間の簡易推定
  let renovationMonths: number;
  if (buildAge <= 15) {
    renovationMonths = 2;
  } else if (buildAge <= 30) {
    renovationMonths = 3;
  } else {
    renovationMonths = 4;
  }

  let salesMonths: number;
  if (structureCategory === "RC_SRC") {
    salesMonths = 3;
  } else if (structureCategory === "木造") {
    salesMonths = 4;
  } else {
    salesMonths = 3.5;
  }

  // 築年数が古いほど販売に時間がかかる
  if (buildAge > 40) {
    salesMonths += 1;
  }

  return Math.round(renovationMonths + salesMonths);
}

export function calculateProfitability(
  askingPrice: number,
  renovation: RenovationResult,
  comparables: ComparablesResult,
): SimulationResult {
  const estimatedMonths = estimateProjectMonths(
    renovation.buildAge,
    renovation.structureCategory,
  );

  const scenarios = SCENARIOS.map((scenario) => {
    const purchasePrice = Math.round(askingPrice * (1 - scenario.discountRate));
    const expenses = Math.round(purchasePrice * EXPENSE_RATE);
    const renovationCost = renovation.totalCost;
    const totalInvestment = purchasePrice + renovationCost + expenses;
    const estimatedResalePrice = comparables.estimatedResalePrice;
    const grossProfit = estimatedResalePrice - totalInvestment;
    const grossMargin =
      totalInvestment > 0
        ? Math.round((grossProfit / totalInvestment) * 1000) / 10
        : 0;
    const roi = grossMargin; // ROI = 粗利額 / 総投資額 × 100 = grossMargin
    const annualizedROI =
      estimatedMonths > 0
        ? Math.round((roi / estimatedMonths) * 12 * 10) / 10
        : 0;

    return {
      label: scenario.label,
      discountRate: scenario.discountRate,
      purchasePrice,
      expenses,
      renovationCost,
      totalInvestment,
      estimatedResalePrice,
      grossProfit,
      grossMargin,
      roi,
      estimatedMonths,
      annualizedROI,
    };
  });

  const standardScenario = scenarios.find((s) => s.label === "標準")!;

  return {
    scenarios,
    renovation,
    comparables,
    summary: {
      askingPrice,
      bestScenario: scenarios.reduce((best, s) =>
        s.grossMargin > best.grossMargin ? s : best,
      ).label,
      standardGrossMargin: standardScenario.grossMargin,
      standardROI: standardScenario.roi,
    },
  };
}
