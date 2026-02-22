import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      area,
      address,
      propertyType,
      structure,
      buildYear,
      landArea,
      buildingArea,
      purchasePrice,
      renovationCost,
      salePrice,
      description,
      dealDate,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    let profitRate: number | null = null;
    if (purchasePrice && salePrice) {
      profitRate =
        ((salePrice - purchasePrice - (renovationCost || 0)) / purchasePrice) *
        100;
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        area: area || null,
        address: address || null,
        propertyType: propertyType || null,
        structure: structure || null,
        buildYear: buildYear != null ? parseInt(buildYear, 10) : null,
        landArea: landArea != null ? parseFloat(landArea) : null,
        buildingArea: buildingArea != null ? parseFloat(buildingArea) : null,
        purchasePrice: purchasePrice != null ? parseFloat(purchasePrice) : null,
        renovationCost:
          renovationCost != null ? parseFloat(renovationCost) : null,
        salePrice: salePrice != null ? parseFloat(salePrice) : null,
        profitRate,
        description: description || null,
        dealDate: dealDate ? new Date(dealDate) : null,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("Error creating deal:", error);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
