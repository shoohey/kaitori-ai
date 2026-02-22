import { NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

export async function POST() {
  try {
    const results = await runAllScrapers();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error running scrapers:", error);
    return NextResponse.json(
      { error: "Failed to run scrapers" },
      { status: 500 }
    );
  }
}
