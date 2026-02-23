import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateRenovationCost } from "@/lib/simulation/renovation";
import { fetchComparableSales } from "@/lib/simulation/mlit-api";
import { calculateProfitability } from "@/lib/simulation/profitability";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 },
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    if (!property.price) {
      return NextResponse.json(
        { error: "Property price is required for simulation" },
        { status: 400 },
      );
    }

    // 過去取引データを取得
    const deals = await prisma.deal.findMany({
      orderBy: { dealDate: "desc" },
    });

    // 1. リノベーション費用計算
    const renovation = calculateRenovationCost(property, deals);

    // 2. 想定再販価格（国交省API or 過去取引フォールバック）
    const comparables = await fetchComparableSales(property, deals);

    // 3. 収益シミュレーション
    const simulation = calculateProfitability(
      property.price,
      renovation,
      comparables,
    );

    // 過去取引の比較データ
    const similarDeals = deals
      .filter(
        (d) =>
          (property.area &&
            d.area &&
            d.area.includes(property.area.substring(0, 3))) ||
          d.propertyType === property.propertyType,
      )
      .slice(0, 5)
      .map((d) => ({
        title: d.title,
        area: d.area,
        propertyType: d.propertyType,
        structure: d.structure,
        purchasePrice: d.purchasePrice,
        renovationCost: d.renovationCost,
        salePrice: d.salePrice,
        profitRate: d.profitRate,
      }));

    const resultData = {
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
      },
      simulation,
      similarDeals,
    };

    // キャッシュ保存
    await prisma.simulation.create({
      data: {
        propertyId: property.id,
        askingPrice: property.price,
        results: JSON.stringify(resultData),
        comparablesData: comparables.comparables.length > 0
          ? JSON.stringify(comparables.comparables)
          : null,
      },
    });

    return NextResponse.json(resultData);
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      {
        error: "Simulation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
