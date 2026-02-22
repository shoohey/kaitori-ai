import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();

    const settingsObject: Record<string, string> = {};
    for (const setting of settings) {
      settingsObject[setting.key] = setting.value;
    }

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { key: string; value: string }[] = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of { key, value } objects" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      body.map((item) =>
        prisma.setting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        })
      )
    );

    const settingsObject: Record<string, string> = {};
    for (const setting of results) {
      settingsObject[setting.key] = setting.value;
    }

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
