import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/ai/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const matchResults = await prisma.matchResult.findMany({
      where: { propertyId },
      include: { condition: true },
      orderBy: { totalScore: "desc" },
    });

    const deals = await prisma.deal.findMany({
      orderBy: { dealDate: "desc" },
    });

    // 類似エリア・物件種別の取引を抽出
    const similarDeals = deals.filter(
      (d) =>
        (property.area &&
          d.area &&
          d.area.includes(property.area.substring(0, 3))) ||
        d.propertyType === property.propertyType
    );

    // 過去取引の統計
    const avgProfitRate =
      deals.reduce((sum, d) => sum + (d.profitRate || 0), 0) / deals.length;
    const profitRates = deals.map((d) => d.profitRate || 0).sort((a, b) => a - b);
    const medianProfitRate = profitRates[Math.floor(profitRates.length / 2)];
    const minProfitRate = Math.min(...profitRates);
    const maxProfitRate = Math.max(...profitRates);

    const dealsWithReno = deals.filter(
      (d) => d.purchasePrice && d.renovationCost
    );
    const avgRenovationRatio =
      dealsWithReno.length > 0
        ? dealsWithReno.reduce(
            (sum, d) => sum + d.renovationCost! / d.purchasePrice!,
            0
          ) / dealsWithReno.length
        : 0;

    // 類似取引の統計
    const similarAvgProfit =
      similarDeals.length > 0
        ? similarDeals.reduce((sum, d) => sum + (d.profitRate || 0), 0) /
          similarDeals.length
        : avgProfitRate;

    // 過去取引の詳細サマリー
    const dealsSummary = deals
      .map(
        (d) =>
          `- ${d.title}（${d.area}/${d.propertyType}/${d.structure || "不明"}）: 購入${formatYen(d.purchasePrice)}→リノベ${formatYen(d.renovationCost)}→売却${formatYen(d.salePrice)} (利益率${d.profitRate}%, 利回り${d.grossYield || "N/A"}%, 築${d.buildYear ? new Date().getFullYear() - d.buildYear : "?"}年, ${d.buildingArea || "?"}m²)`
      )
      .join("\n");

    const similarDealsSummary = similarDeals
      .map(
        (d) =>
          `- ${d.title}（${d.area}）: 購入${formatYen(d.purchasePrice)}→リノベ${formatYen(d.renovationCost)}→売却${formatYen(d.salePrice)} (利益率${d.profitRate}%)`
      )
      .join("\n");

    const prompt = `あなたは年間100件以上の買取再販案件を手がける不動産投資ファンドのアセットマネージャーです。
以下の物件について、自社の過去取引実績データに基づき、投資委員会向けの投資判断メモを作成してください。
数値は全て具体的な金額・パーセンテージで記載し、根拠を明確にしてください。

## 対象物件
- 物件名: ${property.title}
- 売出価格: ${formatYen(property.price)}${property.price ? `（${property.price.toLocaleString()}円）` : ""}
- エリア: ${property.area || "不明"}
- 住所: ${property.address || "不明"}
- 物件種別: ${property.propertyType || "不明"}
- 構造: ${property.structure || "不明"}
- 築年: ${property.buildYear ? `${property.buildYear}年（築${new Date().getFullYear() - property.buildYear}年）` : "不明"}
- 専有面積: ${property.buildingArea ? `${property.buildingArea}m²` : "不明"}
- 土地面積: ${property.landArea ? `${property.landArea}m²` : "不明"}
- 表面利回り: ${property.grossYield ? `${property.grossYield}%` : "不明"}

## 自社過去取引実績（全${deals.length}件）
${dealsSummary}

## 類似エリア・種別の過去取引（${similarDeals.length}件）
${similarDealsSummary || "該当なし"}

## 自社実績統計
- 全取引 平均利益率: ${avgProfitRate.toFixed(1)}% / 中央値: ${medianProfitRate.toFixed(1)}% / 最小: ${minProfitRate.toFixed(1)}% / 最大: ${maxProfitRate.toFixed(1)}%
- 類似案件 平均利益率: ${similarAvgProfit.toFixed(1)}%
- 平均リノベーション費用率（対購入価格）: ${(avgRenovationRatio * 100).toFixed(1)}%

以下のJSON形式で回答してください。全ての金額は数値（円単位）、率は数値（%単位）で回答してください。文字列での回答は指定箇所のみです。

{
  "executiveSummary": "投資委員会向けの総合所見（200文字以内、プロとして簡潔に）",

  "acquisitionCosts": {
    "askingPrice": 売出価格（円）,
    "targetPrice": 交渉目標価格（円）,
    "maxBidPrice": 上限入札価格（円）,
    "priceAssessment": "割高/適正/割安",
    "priceAssessmentReason": "評価根拠（80文字以内）",
    "brokerageFee": 仲介手数料（円）,
    "registrationTax": 登録免許税（円）,
    "acquisitionTax": 不動産取得税（円）,
    "stampDuty": 印紙税（円）,
    "judicialScrivener": 司法書士報酬（円）,
    "otherAcquisitionCosts": その他取得費用（円）,
    "totalAcquisitionCost": 取得総額（物件価格+諸費用合計、円）
  },

  "renovationPlan": {
    "totalCost": リノベーション総額（円）,
    "breakdown": {
      "interior": { "cost": 内装費（円）, "detail": "内容（30文字以内）" },
      "equipment": { "cost": 設備費（円）, "detail": "内容（30文字以内）" },
      "exterior": { "cost": 外装・共用部費（円）, "detail": "内容（30文字以内）" },
      "structural": { "cost": 構造補強費（円）, "detail": "内容（30文字以内）" },
      "design": { "cost": 設計・監理費（円）, "detail": "内容（30文字以内）" },
      "contingency": { "cost": 予備費（円）, "detail": "総額の10%目安" }
    },
    "renovationRatio": リノベ費用率（対購入価格、%）,
    "duration": "工期（例: 3ヶ月）",
    "valueAdd": "バリューアップ戦略（50文字以内）"
  },

  "holdingCosts": {
    "monthlyInterest": 月額金利負担（円）,
    "monthlyTax": 月額固都税按分（円）,
    "monthlyMaintenance": 月額管理費・修繕積立金（円）,
    "monthlyInsurance": 月額保険料（円）,
    "monthlyTotal": 月額保有コスト合計（円）,
    "estimatedHoldingMonths": 想定保有月数,
    "totalHoldingCost": 保有コスト総額（円）
  },

  "saleCosts": {
    "brokerageFee": 売却仲介手数料（円）,
    "stampDuty": 印紙税（円）,
    "otherSaleCosts": その他売却費用（円）,
    "totalSaleCost": 売却諸費用合計（円）
  },

  "scenarios": {
    "optimistic": {
      "salePrice": 楽観売却価格（円）,
      "salePeriod": 楽観売却期間（月）,
      "grossProfit": 粗利益（円）,
      "netProfit": 純利益（諸費用控除後、円）,
      "profitRate": 利益率（%）,
      "annualizedReturn": 年換算リターン（%）
    },
    "base": {
      "salePrice": 基準売却価格（円）,
      "salePeriod": 基準売却期間（月）,
      "grossProfit": 粗利益（円）,
      "netProfit": 純利益（円）,
      "profitRate": 利益率（%）,
      "annualizedReturn": 年換算リターン（%）
    },
    "pessimistic": {
      "salePrice": 悲観売却価格（円）,
      "salePeriod": 悲観売却期間（月）,
      "grossProfit": 粗利益（円）,
      "netProfit": 純利益（円）,
      "profitRate": 利益率（%）,
      "annualizedReturn": 年換算リターン（%）
    }
  },

  "financing": {
    "recommendedLoanAmount": 推奨融資額（円）,
    "ltv": LTV（%）,
    "interestRate": 想定金利（%）,
    "loanTerm": 融資期間（月）,
    "monthlyPayment": 月額返済額（円）,
    "totalInterest": 金利総額（円）,
    "equityRequired": 必要自己資金（円）,
    "equityBreakdown": "自己資金の内訳説明（50文字以内）"
  },

  "profitability": {
    "totalInvestment": 総投資額（物件+リノベ+諸費用+保有コスト、円）,
    "totalCashOutlay": 自己資金ベース総支出（円）,
    "baseSalePrice": 基準シナリオ売却価格（円）,
    "grossProfit": 粗利益（円）,
    "netProfit": 純利益（全コスト控除後、円）,
    "grossMargin": 粗利益率（%）,
    "netMargin": 純利益率（%）,
    "roi": ROI（自己資金に対するリターン、%）,
    "moic": MOIC（投資倍率、倍）,
    "irr": IRR（年率、%）,
    "cashOnCash": キャッシュオンキャッシュリターン（%）,
    "paybackMonths": 投資回収期間（月）,
    "breakEvenPrice": 損益分岐売却価格（円）
  },

  "riskAssessment": {
    "overallLevel": "低/中/高",
    "riskScore": リスクスコア（1-10、10が最高リスク）,
    "risks": [
      {
        "category": "リスクカテゴリ",
        "description": "リスク内容（40文字以内）",
        "probability": "低/中/高",
        "impact": "低/中/高",
        "mitigation": "対策（40文字以内）"
      }
    ],
    "worstCaseLoss": 最悪ケースの損失額（円）,
    "maxDrawdown": 最大想定損失率（%）
  },

  "exitStrategy": {
    "primary": {
      "method": "主要出口戦略",
      "expectedReturn": 想定リターン（%）,
      "timeline": "想定期間"
    },
    "secondary": {
      "method": "代替出口戦略",
      "expectedReturn": 想定リターン（%）,
      "timeline": "想定期間"
    }
  },

  "comparableAnalysis": {
    "compDeals": [
      {
        "title": "比較取引物件名",
        "purchasePrice": 購入価格（円）,
        "salePrice": 売却価格（円）,
        "profitRate": 利益率（%）,
        "similarity": "類似点（30文字以内）"
      }
    ],
    "marketPosition": "市場ポジションの分析（80文字以内）"
  },

  "verdict": "買い/見送り/要検討",
  "verdictReason": "投資委員会への推薦理由（150文字以内、プロとしての判断根拠）",
  "keyConditions": ["投資実行の前提条件1", "前提条件2", "前提条件3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `あなたは不動産買取再販ファンドのシニアアセットマネージャーです。
投資委員会向けの厳密な投資判断メモを作成してください。

重要なルール:
- 全ての数値は現実的かつ保守的に算出すること
- 金額は全て数値型（円単位）で回答。文字列にしないこと
- 率は全て数値型（%単位）で回答
- 仲介手数料は「売買価格×3%+6万円+消費税」で算出
- 不動産取得税は「固定資産税評価額（売買価格の70%想定）×3%」で概算
- 登録免許税は「固定資産税評価額×2%」で概算
- リノベ費用は自社実績の費用率を参考に、物件の築年数・面積から妥当な金額を算出
- 保有期間中の金利計算は元利均等返済を前提
- IRRは月次キャッシュフローから年率換算
- 3シナリオ分析では楽観と悲観で売却価格に±15-20%の幅を持たせること
- リスク評価は最低4つのリスク要因を挙げること
- 回答はJSON形式のみ。説明文は含めないこと`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const analysisText = completion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(analysisText);

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        title: property.title,
        price: property.price,
        area: property.area,
        address: property.address,
        propertyType: property.propertyType,
        structure: property.structure,
        buildYear: property.buildYear,
        buildingArea: property.buildingArea,
        landArea: property.landArea,
        grossYield: property.grossYield,
        sourceUrl: property.sourceUrl,
      },
      matchResults: matchResults.map((m) => ({
        conditionName: m.condition.name,
        ruleScore: m.ruleScore,
        aiScore: m.aiScore,
        totalScore: m.totalScore,
      })),
      dealStats: {
        totalDeals: deals.length,
        similarDeals: similarDeals.length,
        avgProfitRate: Math.round(avgProfitRate * 10) / 10,
        medianProfitRate: Math.round(medianProfitRate * 10) / 10,
        avgRenovationRatio: Math.round(avgRenovationRatio * 1000) / 10,
      },
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function formatYen(value: number | null | undefined): string {
  if (!value) return "不明";
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}億円`;
  if (value >= 10000) return `${Math.round(value / 10000)}万円`;
  return `${value}円`;
}
