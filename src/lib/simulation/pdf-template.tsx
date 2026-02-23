import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Noto Sans JP フォント登録（Google Fonts CDN）
Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-700-normal.woff",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    padding: 40,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #059669",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#059669",
  },
  headerSub: {
    fontSize: 8,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1a1a",
    backgroundColor: "#f0fdf4",
    padding: "6 8",
    marginBottom: 6,
    borderLeft: "3px solid #059669",
  },
  row: {
    flexDirection: "row",
    borderBottom: "0.5px solid #e5e7eb",
    paddingVertical: 3,
  },
  labelCell: {
    width: "40%",
    color: "#4b5563",
    fontSize: 8,
    paddingLeft: 4,
  },
  valueCell: {
    width: "60%",
    fontWeight: 700,
    fontSize: 8,
    textAlign: "right",
    paddingRight: 4,
  },
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #d1d5db",
    paddingVertical: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    color: "#374151",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5px solid #e5e7eb",
    paddingVertical: 3,
  },
  tableCell: {
    fontSize: 8,
    textAlign: "center",
    color: "#1f2937",
  },
  highlight: {
    backgroundColor: "#ecfdf5",
    padding: "2 4",
    borderRadius: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "0.5px solid #d1d5db",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 1.4,
  },
  scenarioLabel: {
    fontSize: 8,
    fontWeight: 700,
    padding: "2 4",
    borderRadius: 2,
    textAlign: "center",
  },
});

function formatYen(value: number | null | undefined): string {
  if (value == null || value === 0) return "-";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}億円`;
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString()}万円`;
  return `${value.toLocaleString()}円`;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.labelCell}>{label}</Text>
      <Text style={styles.valueCell}>{value}</Text>
    </View>
  );
}

interface SimulationPDFProps {
  data: any;
}

export function SimulationPDF({ data }: SimulationPDFProps) {
  const { property, simulation, similarDeals } = data;
  const { scenarios, renovation, comparables, summary } = simulation;
  const currentYear = new Date().getFullYear();
  const buildAge = property.buildYear ? currentYear - property.buildYear : null;
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>収益シミュレーションレポート</Text>
          <Text style={styles.headerSub}>
            {today} | {property.title}
          </Text>
        </View>

        {/* 物件概要 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 物件概要</Text>
          <MetricRow label="物件名" value={property.title} />
          <MetricRow label="売出価格" value={formatYen(property.price)} />
          <MetricRow label="エリア" value={property.area || "-"} />
          <MetricRow label="住所" value={property.address || "-"} />
          <MetricRow label="物件種別" value={property.propertyType || "-"} />
          <MetricRow label="構造" value={property.structure || "-"} />
          <MetricRow
            label="築年数"
            value={
              buildAge != null
                ? `${property.buildYear}年（築${buildAge}年）`
                : "-"
            }
          />
          <MetricRow
            label="建物面積"
            value={
              property.buildingArea ? `${property.buildingArea}m²` : "-"
            }
          />
          <MetricRow
            label="土地面積"
            value={property.landArea ? `${property.landArea}m²` : "-"}
          />
        </View>

        {/* 想定仕入価格 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 想定仕入価格（3シナリオ）</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
                シナリオ
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
                割引率
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
                仕入価格
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
                諸経費(7%)
              </Text>
            </View>
            {scenarios.map((s: any) => (
              <View key={s.label} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "25%" }]}>
                  {s.label}
                </Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>
                  {(s.discountRate * 100).toFixed(0)}%引き
                </Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>
                  {formatYen(s.purchasePrice)}
                </Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>
                  {formatYen(s.expenses)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* リノベ概算費用 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. リノベーション概算費用</Text>
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
            value={formatYen(renovation.totalCost)}
          />
          <MetricRow
            label="費用率"
            value={`${renovation.renovationRatio}%`}
          />
          <MetricRow label="妥当性" value={renovation.validationNote} />
        </View>

        {/* 想定再販価格 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 想定再販価格</Text>
          <MetricRow
            label="想定再販価格"
            value={formatYen(comparables.estimatedResalePrice)}
          />
          {comparables.averagePricePerSqm > 0 && (
            <MetricRow
              label="平均m²単価"
              value={`${comparables.averagePricePerSqm.toLocaleString()}円/m²`}
            />
          )}
          <MetricRow label="データソース" value={comparables.source === "mlit" ? "国交省API" : "過去取引"} />
          <MetricRow label="算出根拠" value={comparables.note} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            本レポートはルールベースの簡易シミュレーションです。実際の投資判断には物件調査・市場分析等を必ず実施してください。
          </Text>
          <Text style={styles.footerText}>
            買取AI 収益シミュレーション | {today} | Page 1/2
          </Text>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        {/* 収益シミュレーション一覧表 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. 収益シミュレーション一覧
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "22%" }]}>
                項目
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "26%" }]}>
                保守(30%引き)
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "26%" }]}>
                標準(20%引き)
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "26%" }]}>
                積極(10%引き)
              </Text>
            </View>
            {[
              {
                label: "仕入価格",
                key: "purchasePrice",
                fmt: formatYen,
              },
              {
                label: "諸経費",
                key: "expenses",
                fmt: formatYen,
              },
              {
                label: "リノベ費",
                key: "renovationCost",
                fmt: formatYen,
              },
              {
                label: "総投資額",
                key: "totalInvestment",
                fmt: formatYen,
              },
              {
                label: "想定再販価格",
                key: "estimatedResalePrice",
                fmt: formatYen,
              },
              {
                label: "粗利額",
                key: "grossProfit",
                fmt: formatYen,
              },
              {
                label: "粗利率",
                key: "grossMargin",
                fmt: (v: number) => `${v.toFixed(1)}%`,
              },
              {
                label: "ROI",
                key: "roi",
                fmt: (v: number) => `${v.toFixed(1)}%`,
              },
              {
                label: "想定期間",
                key: "estimatedMonths",
                fmt: (v: number) => `${v}ヶ月`,
              },
              {
                label: "年換算ROI",
                key: "annualizedROI",
                fmt: (v: number) => `${v.toFixed(1)}%`,
              },
            ].map((row) => (
              <View key={row.key} style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableCell,
                    { width: "22%", textAlign: "left", paddingLeft: 4 },
                  ]}
                >
                  {row.label}
                </Text>
                {scenarios.map((s: any) => (
                  <Text
                    key={s.label}
                    style={[styles.tableCell, { width: "26%" }]}
                  >
                    {row.fmt(s[row.key])}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* 周辺取引事例 */}
        {comparables.comparables && comparables.comparables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. 周辺取引事例</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "30%" }]}>
                  エリア
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>
                  取引価格
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>
                  m²単価
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                  構造
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                  時期
                </Text>
              </View>
              {comparables.comparables.slice(0, 8).map((c: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "30%", textAlign: "left", paddingLeft: 4 },
                    ]}
                  >
                    {c.area}
                  </Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {formatYen(c.price)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {c.pricePerSqm
                      ? `${Math.round(c.pricePerSqm).toLocaleString()}円`
                      : "-"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {c.structure || "-"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {c.tradeDate || "-"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 過去取引比較 */}
        {similarDeals && similarDeals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. 過去取引比較</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
                  物件名
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                  エリア
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                  購入価格
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                  リノベ費
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                  売却価格
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                  利益率
                </Text>
              </View>
              {similarDeals.map((d: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "25%", textAlign: "left", paddingLeft: 4 },
                    ]}
                  >
                    {d.title?.substring(0, 15) || "-"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {d.area || "-"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {formatYen(d.purchasePrice)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {formatYen(d.renovationCost)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {formatYen(d.salePrice)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {d.profitRate != null ? `${d.profitRate}%` : "-"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            本レポートはルールベースの簡易シミュレーションです。実際の投資判断には物件調査・市場分析等を必ず実施してください。
          </Text>
          <Text style={styles.footerText}>
            数値はあくまで概算であり、実際の取引条件・市場環境により大幅に変動する可能性があります。
          </Text>
          <Text style={styles.footerText}>
            買取AI 収益シミュレーション | {today} | Page 2/2
          </Text>
        </View>
      </Page>
    </Document>
  );
}
