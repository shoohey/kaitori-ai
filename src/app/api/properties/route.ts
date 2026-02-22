import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const source = searchParams.get("source");
    const area = searchParams.get("area");
    const status = searchParams.get("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = {};

    if (source) {
      where.source = source;
    }
    if (area) {
      where.area = { contains: area };
    }
    if (status) {
      where.status = status;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
      }
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort) {
      const [field, direction] = sort.split(":");
      orderBy = { [field]: direction || "asc" };
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({ properties, total, page, limit });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
