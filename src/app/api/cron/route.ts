import { NextRequest, NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";
import { runMatchingPipeline } from "@/lib/matching/pipeline";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Cron] Starting full pipeline execution...");

    // Step 1: Run scraping
    console.log("[Cron] Running scrapers...");
    const scrapeResults = await runAllScrapers();
    console.log(`[Cron] Scraping completed. Results: ${scrapeResults.length} sources processed.`);

    // Step 2: Run matching pipeline
    console.log("[Cron] Running matching pipeline...");
    const matchingResult = await runMatchingPipeline();
    console.log(
      `[Cron] Matching completed. Matches: ${matchingResult.matchCount}, Notifications: ${matchingResult.notificationsSent}`
    );

    return NextResponse.json({
      success: true,
      scraping: {
        sourcesProcessed: scrapeResults.length,
        results: scrapeResults,
      },
      matching: {
        matchCount: matchingResult.matchCount,
        notificationsSent: matchingResult.notificationsSent,
        results: matchingResult.results,
      },
    });
  } catch (error) {
    console.error("[Cron] Pipeline execution failed:", error);
    return NextResponse.json(
      { error: "Pipeline execution failed" },
      { status: 500 }
    );
  }
}
