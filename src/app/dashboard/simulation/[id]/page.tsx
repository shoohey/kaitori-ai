"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  TrendingDown,
  Building2,
  Loader2,
  XCircle,
  FileDown,
  Hammer,
  MapPin,
  BarChart3,
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
      className={`flex justify-between items-baseline py-2 border-b border-gray-50 ${highlight ? "bg-emerald-50 -mx-2 px-2 rounded" : ""}`}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">
        <span
          className={`text-sm font-semibold ${highlight ? "text-emerald-700" : "text-gray-900"}`}
        >
          {value}
        </span>
        {sub && <span className="block text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

export default function SimulationDetailPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    async function fetchSimulation() {
      try {
        const res = await fetch("/api/simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: params.id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Simulation failed");
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSimulation();
  }, [params.id]);

  async function handleDownloadPDF() {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/simulation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: params.id }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `収益シミュレーション.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`PDF出力エラー: ${e.message}`);
    } finally {
      setPdfLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500">収益シミュレーションを計算中...</p>
        <p className="text-xs text-gray-400">
          リノベ費用・想定再販価格・3シナリオ収益計算を実行しています
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

  const { property, simulation, similarDeals } = data;
  const { scenarios, renovation, comparables, summary } = simulation;
  const currentYear = new Date().getFullYear();
  const buildAge = property.buildYear ? currentYear - property.buildYear : null;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back link */}
      <Link
        href={`/dashboard/properties/${property.id}`}
        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800"
      >
        <ArrowLeft className="w-4 h-4" />
        物件詳細に戻る
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              収益シミュレーション
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
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {yen(property.price)}
            </span>
            <span className="text-xs text-gray-400">売出価格</span>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              {pdfLoading ? "PDF生成中..." : "PDF出力"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "標準シナリオ粗利率",
            value: `${summary.standardGrossMargin.toFixed(1)}%`,
            color:
              summary.standardGrossMargin >= 20
                ? "text-green-600"
                : summary.standardGrossMargin >= 10
                  ? "text-yellow-600"
                  : "text-red-600",
            sub: `ROI ${summary.standardROI.toFixed(1)}%`,
          },
          {
            label: "リノベ概算",
            value: yen(renovation.totalCost),
            color: "text-orange-600",
            sub: `${renovation.renovationRatio}% (${renovation.costPerSqm}万/m²)`,
          },
          {
            label: "想定再販価格",
            value: yen(comparables.estimatedResalePrice),
            color: "text-blue-600",
            sub: comparables.source === "mlit" ? "国交省API" : "過去取引推定",
          },
          {
            label: "推奨シナリオ",
            value: summary.bestScenario,
            color: "text-emerald-600",
            sub: "最高粗利率のシナリオ",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg shadow p-5">
            <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((s: any) => {
          const colorMap: Record<string, { bg: string; border: string; text: string }> = {
            保守: {
              bg: "bg-blue-50",
              border: "border-blue-200",
              text: "text-blue-700",
            },
            標準: {
              bg: "bg-emerald-50",
              border: "border-emerald-200",
              text: "text-emerald-700",
            },
            積極: {
              bg: "bg-orange-50",
              border: "border-orange-200",
              text: "text-orange-700",
            },
          };
          const c = colorMap[s.label] || colorMap["標準"];

          return (
            <div
              key={s.label}
              className={`rounded-lg border-2 ${c.border} ${c.bg} p-5`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-bold ${c.text}`}>
                  {s.label}シナリオ
                </h4>
                <span className={`text-sm font-medium ${c.text}`}>
                  {(s.discountRate * 100).toFixed(0)}%引き
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">仕入価格</span>
                  <span className="font-semibold">{yen(s.purchasePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">総投資額</span>
                  <span className="font-semibold">
                    {yen(s.totalInvestment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">想定再販</span>
                  <span className="font-semibold">
                    {yen(s.estimatedResalePrice)}
                  </span>
                </div>
                <div className="border-t border-gray-200 my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-600">粗利額</span>
                  <span
                    className={`font-bold ${s.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {yen(s.grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">粗利率</span>
                  <span
                    className={`font-bold ${s.grossMargin >= 20 ? "text-green-600" : s.grossMargin >= 10 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {s.grossMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">年換算ROI</span>
                  <span className="font-bold">
                    {s.annualizedROI.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">想定期間</span>
                  <span className="font-medium">{s.estimatedMonths}ヶ月</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* リノベ概算 + 想定再販 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="リノベーション概算"
          icon={Hammer}
          color="bg-orange-500"
        >
          <div className="space-y-1">
            <MetricRow
              label="構造分類"
              value={renovation.structureCategory}
            />
            <MetricRow label="築年数" value={`${renovation.buildAge}年`} />
            <MetricRow
              label="対象面積"
              value={`${renovation.targetArea.toFixed(1)}m²`}
            />
            <MetricRow
              label="m²単価"
              value={`${renovation.costPerSqm}万円/m²`}
            />
            <MetricRow
              label="リノベ総額"
              value={yen(renovation.totalCost)}
              highlight
            />
            <MetricRow
              label="費用率（対売出価格）"
              value={`${renovation.renovationRatio}%`}
            />
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              {renovation.validationNote}
            </div>
          </div>
        </Section>

        <Section
          title="想定再販価格"
          icon={MapPin}
          color="bg-blue-500"
        >
          <div className="space-y-1">
            <MetricRow
              label="想定再販価格"
              value={yen(comparables.estimatedResalePrice)}
              highlight
            />
            {comparables.averagePricePerSqm > 0 && (
              <MetricRow
                label="平均m²単価"
                value={`${comparables.averagePricePerSqm.toLocaleString()}円/m²`}
              />
            )}
            <MetricRow
              label="データソース"
              value={
                comparables.source === "mlit" ? "国交省API" : "過去取引データ"
              }
            />
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              {comparables.note}
            </div>
          </div>
        </Section>
      </div>

      {/* 収益シミュレーション比較テーブル */}
      <Section
        title="収益シミュレーション比較"
        icon={BarChart3}
        color="bg-emerald-600"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  項目
                </th>
                <th className="text-right py-3 px-2 text-blue-600 font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingDown className="w-4 h-4" /> 保守(30%引き)
                  </div>
                </th>
                <th className="text-right py-3 px-2 text-emerald-600 font-medium bg-emerald-50 rounded-t">
                  標準(20%引き)
                </th>
                <th className="text-right py-3 px-2 text-orange-600 font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4" /> 積極(10%引き)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "仕入価格", key: "purchasePrice", fmt: yen },
                { label: "諸経費(7%)", key: "expenses", fmt: yen },
                {
                  label: "リノベ費",
                  key: "renovationCost",
                  fmt: yen,
                },
                {
                  label: "総投資額",
                  key: "totalInvestment",
                  fmt: yen,
                },
                {
                  label: "想定再販価格",
                  key: "estimatedResalePrice",
                  fmt: yen,
                },
                { label: "粗利額", key: "grossProfit", fmt: yen },
                {
                  label: "粗利率",
                  key: "grossMargin",
                  fmt: (v: any) => `${v.toFixed(1)}%`,
                },
                {
                  label: "ROI",
                  key: "roi",
                  fmt: (v: any) => `${v.toFixed(1)}%`,
                },
                {
                  label: "想定期間",
                  key: "estimatedMonths",
                  fmt: (v: any) => `${v}ヶ月`,
                },
                {
                  label: "年換算ROI",
                  key: "annualizedROI",
                  fmt: (v: any) => `${v.toFixed(1)}%`,
                },
              ].map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-2.5 px-2 text-gray-600">{row.label}</td>
                  <td className="py-2.5 px-2 text-right font-medium text-blue-700">
                    {row.fmt(scenarios[0]?.[row.key])}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-emerald-700 bg-emerald-50">
                    {row.fmt(scenarios[1]?.[row.key])}
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium text-orange-700">
                    {row.fmt(scenarios[2]?.[row.key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 周辺取引事例 */}
      {comparables.comparables && comparables.comparables.length > 0 && (
        <Section
          title="周辺取引事例（国交省データ）"
          icon={Building2}
          color="bg-teal-500"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">
                    エリア
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">
                    取引価格
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">
                    m²単価
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">
                    構造
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">
                    時期
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparables.comparables.slice(0, 10).map((c: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 px-2 text-gray-700">{c.area}</td>
                    <td className="py-2 px-2 text-right text-gray-800">
                      {yen(c.price)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-800">
                      {c.pricePerSqm
                        ? `${Math.round(c.pricePerSqm).toLocaleString()}円`
                        : "-"}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {c.structure || "-"}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {c.tradeDate || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* 過去取引比較 */}
      {similarDeals && similarDeals.length > 0 && (
        <Section
          title="過去取引比較"
          icon={BarChart3}
          color="bg-purple-500"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">
                    物件名
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">
                    エリア
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">
                    購入価格
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">
                    リノベ費
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">
                    売却価格
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">
                    利益率
                  </th>
                </tr>
              </thead>
              <tbody>
                {similarDeals.map((d: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 px-2 text-gray-700">
                      {d.title?.substring(0, 20) || "-"}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {d.area || "-"}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-800">
                      {yen(d.purchasePrice)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-800">
                      {yen(d.renovationCost)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-800">
                      {yen(d.salePrice)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={`font-medium ${(d.profitRate || 0) >= 20 ? "text-green-600" : "text-gray-600"}`}
                      >
                        {d.profitRate != null ? `${d.profitRate}%` : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* PDF出力ボタン（下部） */}
      <div className="flex justify-center">
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-base font-medium shadow-lg disabled:opacity-50"
        >
          <FileDown className="w-5 h-5" />
          {pdfLoading ? "PDF生成中..." : "稟議書用PDFをダウンロード"}
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>
          本シミュレーションはルールベースの簡易計算です。実際の投資判断には物件調査・市場分析等を必ず実施してください。
        </p>
        <p>
          シミュレーション日:{" "}
          {new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          &nbsp;/ データソース: {comparables.source === "mlit" ? "国交省API" : "過去取引データ"}
          &nbsp;/ 過去取引参照数: {similarDeals?.length || 0}件
        </p>
      </div>
    </div>
  );
}
