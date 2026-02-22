import { prisma } from "@/lib/db";
import { DummyScraper } from "./dummy";
import { SuumoScraper } from "./suumo";
import { HomesScraper } from "./homes";
import { RakumachiScraper } from "./rakumachi";
import { KenbiyaScraper } from "./kenbiya";
import { BaseScraper } from "./base";
import { ScrapeResult } from "@/types";

const scrapers: BaseScraper[] = [
  new DummyScraper(),
  new SuumoScraper(),
  new HomesScraper(),
  new RakumachiScraper(),
  new KenbiyaScraper(),
];

export async function runAllScrapers(): Promise<ScrapeResult[]> {
  // Check settings for enabled sources, default to just dummy
  const results: ScrapeResult[] = [];

  for (const scraper of scrapers) {
    const startedAt = new Date();
    try {
      const properties = await scraper.scrape();
      let newCount = 0;

      for (const prop of properties) {
        // Skip if already exists (by sourceUrl)
        const existing = prop.sourceUrl
          ? await prisma.property.findUnique({
              where: { sourceUrl: prop.sourceUrl },
            })
          : null;
        if (!existing) {
          await prisma.property.create({
            data: {
              ...prop,
              imageUrls: prop.imageUrls ? JSON.stringify(prop.imageUrls) : null,
            },
          });
          newCount++;
        }
      }

      await prisma.scrapeLog.create({
        data: {
          source: scraper.source,
          status: "success",
          propertiesFound: properties.length,
          newProperties: newCount,
          startedAt,
          completedAt: new Date(),
        },
      });

      results.push({
        source: scraper.source,
        propertiesFound: properties.length,
        newProperties: newCount,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      await prisma.scrapeLog.create({
        data: {
          source: scraper.source,
          status: "error",
          errorMessage: errorMsg,
          startedAt,
          completedAt: new Date(),
        },
      });
      results.push({
        source: scraper.source,
        propertiesFound: 0,
        newProperties: 0,
        errors: [errorMsg],
      });
    }
  }

  return results;
}
