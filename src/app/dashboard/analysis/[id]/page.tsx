"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  Banknote,
  PiggyBank,
  ShieldAlert,
  BarChart3,
  Target,
  Loader2,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

function yen(v: any): string {
  if (v == null || v === 0) return "-";
  const n = typeof v === "string" ? parseFloat(v.replace(/[^0-9.-]/g, "")) : v;
  if (isNaN(n)) return String(v);
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}億円`;
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}万円`;
  return `${n.toLocaleString()}円`;
}

function pct(v: any): string {
  if (v == null) return "-";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return String(v);
  return `${n.toFixed(1)}%`;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    買い: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
    見送り: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    要検討: { bg: "bg-yellow-100", text: "text-yellow-800", icon: HelpCircle },
  };
  const c = config[verdict] || config["要検討"];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-lg font-bold ${c.bg} ${c.text}`}
    >
      <Icon className="w-5 h-5" />
      {verdict}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    低: "bg-green-100 text-green-800",
    中: "bg-yellow-100 text-yellow-800",
    高: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[level] || "bg-gray-100 text-gray-800"}`}
    >
      {level}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  icon: any;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-baseline py-2 border-b border-gray-50 ${highlight ? "bg-blue-50 -mx-2 px-2 rounded" : ""}`}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">
        <span
          className={`text-sm font-semibold ${highlight ? "text-blue-700" : "text-gray-900"}`}
        >
          {value}
        </span>
        {sub && <span className="block text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: params.id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Analysis failed");
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500">
          GPT-4oで投資分析を実行中...
        </p>
        <p className="text-xs text-gray-400">
          過去取引データとの照合・収益シミュレーション・リスク分析を実施しています
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const { property, matchResults, dealStats, analysis: a } = data;
  const currentYear = new Date().getFullYear();
  const buildAge = property.buildYear
    ? currentYear - property.buildYear
    : null;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back link */}
      <Link
        href={`/dashboard/properties/${property.id}`}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4" />
        物件詳細に戻る
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              投資分析レポート
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {property.title}
            </h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              <span>{property.area}</span>
              {property.propertyType && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{property.propertyType}</span>
                </>
              )}
              {property.structure && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{property.structure}</span>
                </>
              )}
              {buildAge != null && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>
                    築{buildAge}年（{property.buildYear}年）
                  </span>
                </>
              )}
              {property.buildingArea && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{property.buildingArea}m&sup2;</span>
                </>
              )}
            </div>
            {property.sourceUrl && (
              <a
                href={property.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2"
              >
                SUUMO掲載ページ
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <VerdictBadge verdict={a.verdict} />
            <span className="text-2xl font-bold text-gray-900">
              {yen(property.price)}
            </span>
            <span className="text-xs text-gray-400">売出価格</span>
          </div>
        </div>

        {/* Executive Summary */}
        {a.executiveSummary && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-700 leading-relaxed">
              {a.executiveSummary}
            </p>
          </div>
        )}

        {/* Match Score */}
        {matchResults && matchResults.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {matchResults.map((m: any, i: number) => (
              <div
                key={i}
                className="bg-blue-50 rounded-lg px-4 py-2 text-sm"
              >
                <span className="text-gray-500">{m.conditionName}: </span>
                <span className="font-bold text-blue-700">
                  {(m.totalScore * 100).toFixed(1)}%
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  (Rule {(m.ruleScore * 100).toFixed(0)}% / AI{" "}
                  {(m.aiScore * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
            {dealStats && (
              <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
                <span className="text-gray-500">過去類似取引: </span>
                <span className="font-bold text-gray-700">
                  {dealStats.similarDeals}件
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  (平均利益率 {dealStats.avgProfitRate}%)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "推奨購入価格",
            value: yen(a.acquisitionCosts?.targetPrice),
            sub: `上限 ${yen(a.acquisitionCosts?.maxBidPrice)}`,
            color: "text-blue-600",
          },
          {
            label: "基準シナリオ純利益",
            value: yen(a.profitability?.netProfit),
            sub: `利益率 ${pct(a.profitability?.netMargin)}`,
            color:
              (a.profitability?.netProfit || 0) > 0
                ? "text-green-600"
                : "text-red-600",
          },
          {
            label: "ROI",
            value: pct(a.profitability?.roi),
            sub: `MOIC ${a.profitability?.moic ? a.profitability.moic.toFixed(2) + "x" : "-"}`,
            color: "text-purple-600",
          },
          {
            label: "リスクレベル",
            value: a.riskAssessment?.overallLevel || "-",
            sub: `スコア ${a.riskAssessment?.riskScore || "-"}/10`,
            color:
              a.riskAssessment?.overallLevel === "低"
                ? "text-green-600"
                : a.riskAssessment?.overallLevel === "高"
                  ? "text-red-600"
                  : "text-yellow-600",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg shadow p-5">
            <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* 3-Scenario Comparison */}
      {a.scenarios && (
        <Section title="3シナリオ分析" icon={BarChart3} color="bg-indigo-500">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">
                    項目
                  </th>
                  <th className="text-right py-3 px-2 text-green-600 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="w-4 h-4" /> 楽観
                    </div>
                  </th>
                  <th className="text-right py-3 px-2 text-blue-600 font-medium bg-blue-50 rounded-t">
                    基準
                  </th>
                  <th className="text-right py-3 px-2 text-red-600 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingDown className="w-4 h-4" /> 悲観
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "売却価格",
                    key: "salePrice",
                    fmt: yen,
                  },
                  {
                    label: "売却期間",
                    key: "salePeriod",
                    fmt: (v: any) => (v ? `${v}ヶ月` : "-"),
                  },
                  { label: "粗利益", key: "grossProfit", fmt: yen },
                  { label: "純利益", key: "netProfit", fmt: yen },
                  { label: "利益率", key: "profitRate", fmt: pct },
                  {
                    label: "年換算リターン",
                    key: "annualizedReturn",
                    fmt: pct,
                  },
                ].map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2.5 px-2 text-gray-600">{row.label}</td>
                    <td className="py-2.5 px-2 text-right font-medium text-green-700">
                      {row.fmt(a.scenarios.optimistic?.[row.key])}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-blue-700 bg-blue-50">
                      {row.fmt(a.scenarios.base?.[row.key])}
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-red-700">
                      {row.fmt(a.scenarios.pessimistic?.[row.key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquisition Costs */}
        {a.acquisitionCosts && (
          <Section
            title="取得コスト分析"
            icon={Building2}
            color="bg-blue-500"
          >
            <div className="space-y-1">
              <MetricRow
                label="売出価格"
                value={yen(a.acquisitionCosts.askingPrice)}
              />
              <MetricRow
                label="交渉目標価格"
                value={yen(a.acquisitionCosts.targetPrice)}
                highlight
              />
              <MetricRow
                label="上限入札価格"
                value={yen(a.acquisitionCosts.maxBidPrice)}
              />
              <MetricRow
                label="価格評価"
                value={a.acquisitionCosts.priceAssessment || "-"}
                sub={a.acquisitionCosts.priceAssessmentReason}
              />
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  取得諸費用内訳
                </p>
                <MetricRow
                  label="仲介手数料"
                  value={yen(a.acquisitionCosts.brokerageFee)}
                />
                <MetricRow
                  label="登録免許税"
                  value={yen(a.acquisitionCosts.registrationTax)}
                />
                <MetricRow
                  label="不動産取得税"
                  value={yen(a.acquisitionCosts.acquisitionTax)}
                />
                <MetricRow
                  label="印紙税"
                  value={yen(a.acquisitionCosts.stampDuty)}
                />
                <MetricRow
                  label="司法書士報酬"
                  value={yen(a.acquisitionCosts.judicialScrivener)}
                />
                <MetricRow
                  label="その他"
                  value={yen(a.acquisitionCosts.otherAcquisitionCosts)}
                />
              </div>
              <div className="mt-2 pt-2 border-t-2 border-gray-300">
                <MetricRow
                  label="取得総額"
                  value={yen(a.acquisitionCosts.totalAcquisitionCost)}
                  highlight
                />
              </div>
            </div>
          </Section>
        )}

        {/* Renovation Plan */}
        {a.renovationPlan && (
          <Section
            title="リノベーション計画"
            icon={Target}
            color="bg-orange-500"
          >
            <div className="space-y-1">
              <MetricRow
                label="リノベ総額"
                value={yen(a.renovationPlan.totalCost)}
                highlight
              />
              <MetricRow
                label="費用率（対購入価格）"
                value={pct(a.renovationPlan.renovationRatio)}
              />
              <MetricRow
                label="工期"
                value={a.renovationPlan.duration || "-"}
              />
              {a.renovationPlan.valueAdd && (
                <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                  {a.renovationPlan.valueAdd}
                </div>
              )}
              {a.renovationPlan.breakdown && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-400 mb-2">
                    費用内訳
                  </p>
                  {Object.entries(a.renovationPlan.breakdown).map(
                    ([key, item]: [string, any]) => (
                      <MetricRow
                        key={key}
                        label={item.detail || key}
                        value={yen(item.cost)}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Financing */}
        {a.financing && (
          <Section title="ファイナンス" icon={Banknote} color="bg-emerald-500">
            <div className="space-y-1">
              <MetricRow
                label="推奨融資額"
                value={yen(a.financing.recommendedLoanAmount)}
                highlight
              />
              <MetricRow label="LTV" value={pct(a.financing.ltv)} />
              <MetricRow
                label="想定金利"
                value={pct(a.financing.interestRate)}
              />
              <MetricRow
                label="融資期間"
                value={
                  a.financing.loanTerm
                    ? `${a.financing.loanTerm}ヶ月`
                    : "-"
                }
              />
              <MetricRow
                label="月額返済額"
                value={yen(a.financing.monthlyPayment)}
              />
              <MetricRow
                label="金利総額"
                value={yen(a.financing.totalInterest)}
              />
              <div className="mt-2 pt-2 border-t-2 border-gray-300">
                <MetricRow
                  label="必要自己資金"
                  value={yen(a.financing.equityRequired)}
                  highlight
                />
                {a.financing.equityBreakdown && (
                  <p className="text-xs text-gray-400 mt-1">
                    {a.financing.equityBreakdown}
                  </p>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Holding Costs */}
        {a.holdingCosts && (
          <Section
            title="保有コスト"
            icon={PiggyBank}
            color="bg-gray-500"
          >
            <div className="space-y-1">
              <MetricRow
                label="月額金利負担"
                value={yen(a.holdingCosts.monthlyInterest)}
              />
              <MetricRow
                label="月額固都税按分"
                value={yen(a.holdingCosts.monthlyTax)}
              />
              <MetricRow
                label="月額管理費・修繕"
                value={yen(a.holdingCosts.monthlyMaintenance)}
              />
              <MetricRow
                label="月額保険料"
                value={yen(a.holdingCosts.monthlyInsurance)}
              />
              <div className="mt-2 pt-2 border-t border-gray-200">
                <MetricRow
                  label="月額合計"
                  value={yen(a.holdingCosts.monthlyTotal)}
                  highlight
                />
                <MetricRow
                  label="想定保有期間"
                  value={
                    a.holdingCosts.estimatedHoldingMonths
                      ? `${a.holdingCosts.estimatedHoldingMonths}ヶ月`
                      : "-"
                  }
                />
              </div>
              <div className="mt-2 pt-2 border-t-2 border-gray-300">
                <MetricRow
                  label="保有コスト総額"
                  value={yen(a.holdingCosts.totalHoldingCost)}
                  highlight
                />
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* Profitability - Full Width */}
      {a.profitability && (
        <Section
          title="収益性分析"
          icon={TrendingUp}
          color="bg-green-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-3">
                投資額・利益
              </p>
              <MetricRow
                label="総投資額"
                value={yen(a.profitability.totalInvestment)}
              />
              <MetricRow
                label="自己資金ベース支出"
                value={yen(a.profitability.totalCashOutlay)}
              />
              <MetricRow
                label="基準売却価格"
                value={yen(a.profitability.baseSalePrice)}
              />
              <MetricRow
                label="粗利益"
                value={yen(a.profitability.grossProfit)}
              />
              <MetricRow
                label="純利益"
                value={yen(a.profitability.netProfit)}
                highlight
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-3">
                リターン指標
              </p>
              <MetricRow
                label="粗利益率"
                value={pct(a.profitability.grossMargin)}
              />
              <MetricRow
                label="純利益率"
                value={pct(a.profitability.netMargin)}
                highlight
              />
              <MetricRow label="ROI" value={pct(a.profitability.roi)} highlight />
              <MetricRow
                label="MOIC"
                value={
                  a.profitability.moic
                    ? `${a.profitability.moic.toFixed(2)}x`
                    : "-"
                }
              />
              <MetricRow
                label="Cash-on-Cash"
                value={pct(a.profitability.cashOnCash)}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-3">
                時間軸
              </p>
              <MetricRow label="IRR（年率）" value={pct(a.profitability.irr)} highlight />
              <MetricRow
                label="投資回収期間"
                value={
                  a.profitability.paybackMonths
                    ? `${a.profitability.paybackMonths}ヶ月`
                    : "-"
                }
              />
              <MetricRow
                label="損益分岐売却価格"
                value={yen(a.profitability.breakEvenPrice)}
                highlight
              />
              {a.saleCosts && (
                <>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-400 mb-2">
                      売却諸費用
                    </p>
                    <MetricRow
                      label="売却仲介手数料"
                      value={yen(a.saleCosts.brokerageFee)}
                    />
                    <MetricRow
                      label="その他"
                      value={yen(
                        (a.saleCosts.stampDuty || 0) +
                          (a.saleCosts.otherSaleCosts || 0)
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Risk Assessment */}
      {a.riskAssessment && (
        <Section
          title="リスク評価"
          icon={ShieldAlert}
          color="bg-red-500"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`text-3xl font-bold ${
                a.riskAssessment.overallLevel === "低"
                  ? "text-green-600"
                  : a.riskAssessment.overallLevel === "高"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {a.riskAssessment.overallLevel}リスク
            </div>
            {a.riskAssessment.riskScore && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      a.riskAssessment.riskScore <= 3
                        ? "bg-green-500"
                        : a.riskAssessment.riskScore <= 6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${a.riskAssessment.riskScore * 10}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {a.riskAssessment.riskScore}/10
                </span>
              </div>
            )}
            {a.riskAssessment.worstCaseLoss && (
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-400">最大想定損失</p>
                <p className="text-sm font-bold text-red-600">
                  {yen(a.riskAssessment.worstCaseLoss)}
                  {a.riskAssessment.maxDrawdown && (
                    <span className="text-xs ml-1">
                      ({pct(a.riskAssessment.maxDrawdown)})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
          {a.riskAssessment.risks && a.riskAssessment.risks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">
                      カテゴリ
                    </th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">
                      リスク内容
                    </th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">
                      発生確率
                    </th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">
                      影響度
                    </th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">
                      対策
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {a.riskAssessment.risks.map((risk: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2 px-2 font-medium text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                          {risk.category}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-gray-600">
                        {risk.description}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <RiskBadge level={risk.probability} />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <RiskBadge level={risk.impact} />
                      </td>
                      <td className="py-2 px-2 text-gray-600">
                        {risk.mitigation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exit Strategy */}
        {a.exitStrategy && (
          <Section title="出口戦略" icon={Target} color="bg-purple-500">
            <div className="space-y-4">
              {a.exitStrategy.primary && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-medium text-purple-500 mb-1">
                    主要戦略
                  </p>
                  <p className="font-semibold text-gray-800">
                    {a.exitStrategy.primary.method}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">
                      想定リターン:{" "}
                      <span className="font-medium text-purple-700">
                        {pct(a.exitStrategy.primary.expectedReturn)}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      期間: {a.exitStrategy.primary.timeline || "-"}
                    </span>
                  </div>
                </div>
              )}
              {a.exitStrategy.secondary && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-400 mb-1">
                    代替戦略
                  </p>
                  <p className="font-semibold text-gray-800">
                    {a.exitStrategy.secondary.method}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">
                      想定リターン:{" "}
                      <span className="font-medium text-gray-700">
                        {pct(a.exitStrategy.secondary.expectedReturn)}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      期間: {a.exitStrategy.secondary.timeline || "-"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Comparable Analysis */}
        {a.comparableAnalysis && (
          <Section
            title="比較取引分析"
            icon={BarChart3}
            color="bg-teal-500"
          >
            {a.comparableAnalysis.compDeals &&
              a.comparableAnalysis.compDeals.length > 0 && (
                <div className="space-y-2 mb-4">
                  {a.comparableAnalysis.compDeals.map(
                    (comp: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {comp.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {comp.similarity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {yen(comp.purchasePrice)} → {yen(comp.salePrice)}
                          </p>
                          <p
                            className={`text-xs font-medium ${(comp.profitRate || 0) >= 30 ? "text-green-600" : "text-gray-500"}`}
                          >
                            利益率 {pct(comp.profitRate)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            {a.comparableAnalysis.marketPosition && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {a.comparableAnalysis.marketPosition}
              </p>
            )}
          </Section>
        )}
      </div>

      {/* Verdict & Key Conditions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-4">
          <VerdictBadge verdict={a.verdict} />
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">
              {a.verdictReason}
            </p>
            {a.keyConditions && a.keyConditions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  投資実行の前提条件
                </p>
                <ul className="space-y-1">
                  {a.keyConditions.map((cond: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {cond}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>
          本レポートはAI（GPT-4o）による分析結果であり、投資判断の最終責任は投資者に帰属します。
        </p>
        <p>
          分析基準日:{" "}
          {new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          &nbsp;/ 過去取引参照数: {dealStats?.totalDeals || "-"}件 / 類似取引:{" "}
          {dealStats?.similarDeals || "-"}件
        </p>
      </div>
    </div>
  );
}
