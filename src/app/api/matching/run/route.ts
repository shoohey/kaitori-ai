import { NextResponse } from "next/server";
import { runMatchingPipeline } from "@/lib/matching/pipeline";

export async function POST() {
  try {
    const result = await runMatchingPipeline();

    return NextResponse.json({
      success: true,
      matchCount: result.matchCount,
      notificationsSent: result.notificationsSent,
      results: result.results,
    });
  } catch (error) {
    console.error("Error running matching pipeline:", error);
    return NextResponse.json(
      { error: "Failed to run matching pipeline" },
      { status: 500 }
    );
  }
}
