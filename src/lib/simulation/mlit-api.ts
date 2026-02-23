/**
 * 国交省 不動産取引価格情報API
 * https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001
 */

import { prisma } from "@/lib/db";
import { extractPrefectureCode, mapPropertyTypeForMLIT } from "./area-codes";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PropertyForComparables {
  area?: string | null;
  propertyType?: string | null;
  buildingArea?: number | null;
  landArea?: number | null;
  price?: number | null;
}

interface DealForComparables {
  purchasePrice?: number | null;
  salePrice?: number | null;
}

export interface ComparableSale {
  type: string;
  area: string;
  price: number;
  pricePerSqm: number;
  buildYear: string;
  structure: string;
  floorArea: number;
  tradeDate: string;
}

export interface ComparablesResult {
  source: "mlit" | "deals";
  estimatedResalePrice: number;
  averagePricePerSqm: number;
  comparables: ComparableSale[];
  note: string;
}

async function fetchFromMLIT(
  prefectureCode: number,
  year: number,
  quarter?: number,
): Promise<any[]> {
  const apiKey = process.env.MLIT_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    return [];
  }

  // キャッシュチェック
  const cached = await prisma.mLITCache.findFirst({
    where: {
      prefectureCode,
      year,
    },
  });

  if (cached) {
    try {
      return JSON.parse(cached.responseData);
    } catch {
      // キャッシュ破損 → 再取得
    }
  }

  const params = new URLSearchParams({
    year: year.toString(),
    area: prefectureCode.toString().padStart(2, "0"),
  });

  if (quarter) {
    params.append("quarter", quarter.toString());
  }

  try {
    const response = await fetch(
      `https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?${params}`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      },
    );

    if (!response.ok) {
      console.error(`MLIT API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const records = data.data || [];

    // キャッシュ保存
    await prisma.mLITCache.upsert({
      where: {
        prefectureCode_cityCode_year_propertyType: {
          prefectureCode,
          cityCode: "",
          year,
          propertyType: "",
        },
      },
      update: {
        responseData: JSON.stringify(records),
        fetchedAt: new Date(),
      },
      create: {
        prefectureCode,
        year,
        responseData: JSON.stringify(records),
      },
    });

    return records;
  } catch (error) {
    console.error("MLIT API fetch error:", error);
    return [];
  }
}

function parseMLITRecord(record: any): ComparableSale | null {
  try {
    const priceStr = record.TradePrice;
    const price = typeof priceStr === "string" ? parseInt(priceStr, 10) : priceStr;
    if (!price || isNaN(price)) return null;

    const areaStr = record.Area;
    const floorArea = parseFloat(areaStr) || 0;
    const pricePerSqm = floorArea > 0 ? price / floorArea : 0;

    return {
      type: record.Type || "",
      area: `${record.Municipality || ""}${record.DistrictName || ""}`,
      price,
      pricePerSqm,
      buildYear: record.BuildingYear || "",
      structure: record.Structure || "",
      floorArea,
      tradeDate: `${record.Period || ""}`,
    };
  } catch {
    return null;
  }
}

export async function fetchComparableSales(
  property: PropertyForComparables,
  deals: DealForComparables[],
): Promise<ComparablesResult> {
  const prefectureCode = extractPrefectureCode(property.area);
  const mlitPropertyType = mapPropertyTypeForMLIT(property.propertyType);
  const targetArea = property.buildingArea || property.landArea || 60;

  // MLIT APIから取得を試みる
  if (prefectureCode) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear - 2];

    let allRecords: any[] = [];
    for (const year of years) {
      const records = await fetchFromMLIT(prefectureCode, year);
      allRecords = allRecords.concat(records);
    }

    if (allRecords.length > 0) {
      // 物件種別でフィルタ
      let filtered = allRecords;
      if (mlitPropertyType) {
        const typeFiltered = allRecords.filter(
          (r) => r.Type && r.Type.includes(mlitPropertyType.substring(0, 4)),
        );
        if (typeFiltered.length > 0) {
          filtered = typeFiltered;
        }
      }

      const comparables = filtered
        .map(parseMLITRecord)
        .filter((c): c is ComparableSale => c !== null && c.pricePerSqm > 0);

      if (comparables.length > 0) {
        const avgPricePerSqm =
          comparables.reduce((sum, c) => sum + c.pricePerSqm, 0) / comparables.length;
        const estimatedResalePrice = Math.round(avgPricePerSqm * targetArea);

        return {
          source: "mlit",
          estimatedResalePrice,
          averagePricePerSqm: Math.round(avgPricePerSqm),
          comparables: comparables.slice(0, 10),
          note: `国交省取引価格情報 ${years.join("-")}年 ${comparables.length}件の平均m2単価から算出`,
        };
      }
    }
  }

  // フォールバック: 過去取引データから算出
  return fallbackFromDeals(property, deals);
}

function fallbackFromDeals(
  property: PropertyForComparables,
  deals: DealForComparables[],
): ComparablesResult {
  const validDeals = deals.filter(
    (d) => d.purchasePrice && d.salePrice && d.purchasePrice > 0 && d.salePrice > 0,
  );

  if (validDeals.length === 0) {
    // 最終フォールバック: 売出価格の1.2倍と仮定
    const estimatedResalePrice = property.price
      ? Math.round(property.price * 1.2)
      : 0;
    return {
      source: "deals",
      estimatedResalePrice,
      averagePricePerSqm: 0,
      comparables: [],
      note: "過去取引データなし - 売出価格の1.2倍と仮定",
    };
  }

  // 平均売却/購入比率から算出
  const avgSaleRatio =
    validDeals.reduce((sum, d) => sum + d.salePrice! / d.purchasePrice!, 0) /
    validDeals.length;

  // 想定仕入価格（売出価格の80%=標準シナリオ）からの再販価格
  const estimatedPurchasePrice = property.price ? property.price * 0.8 : 0;
  const estimatedResalePrice = Math.round(estimatedPurchasePrice * avgSaleRatio);

  return {
    source: "deals",
    estimatedResalePrice,
    averagePricePerSqm: 0,
    comparables: [],
    note: `過去取引${validDeals.length}件の平均売却/購入比率(${avgSaleRatio.toFixed(2)}倍)から算出`,
  };
}
