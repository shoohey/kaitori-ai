import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const conditions = await prisma.condition.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(conditions);
  } catch (error) {
    console.error("Error fetching conditions:", error);
    return NextResponse.json(
      { error: "Failed to fetch conditions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      areas,
      propertyTypes,
      minPrice,
      maxPrice,
      minYield,
      maxYield,
      minBuildYear,
      maxBuildYear,
      ruleWeight,
      aiWeight,
      aiThreshold,
      notifyEmail,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const condition = await prisma.condition.create({
      data: {
        name,
        areas: areas ? JSON.stringify(areas) : null,
        propertyTypes: propertyTypes ? JSON.stringify(propertyTypes) : null,
        minPrice: minPrice != null ? parseFloat(minPrice) : null,
        maxPrice: maxPrice != null ? parseFloat(maxPrice) : null,
        minYield: minYield != null ? parseFloat(minYield) : null,
        maxYield: maxYield != null ? parseFloat(maxYield) : null,
        minBuildYear: minBuildYear != null ? parseInt(minBuildYear, 10) : null,
        maxBuildYear: maxBuildYear != null ? parseInt(maxBuildYear, 10) : null,
        ruleWeight: ruleWeight != null ? parseFloat(ruleWeight) : 0.6,
        aiWeight: aiWeight != null ? parseFloat(aiWeight) : 0.4,
        aiThreshold: aiThreshold != null ? parseFloat(aiThreshold) : 0.5,
        notifyEmail: notifyEmail || null,
      },
    });

    return NextResponse.json(condition, { status: 201 });
  } catch (error) {
    console.error("Error creating condition:", error);
    return NextResponse.json(
      { error: "Failed to create condition" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const condition = await prisma.condition.findUnique({ where: { id } });

    if (!condition) {
      return NextResponse.json(
        { error: "Condition not found" },
        { status: 404 }
      );
    }

    await prisma.condition.delete({ where: { id } });

    return NextResponse.json({ message: "Condition deleted successfully" });
  } catch (error) {
    console.error("Error deleting condition:", error);
    return NextResponse.json(
      { error: "Failed to delete condition" },
      { status: 500 }
    );
  }
}
