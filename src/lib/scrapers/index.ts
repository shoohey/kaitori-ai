import { prisma } from "@/lib/db";
import { DummyScraper } from "./dummy";
import { SuumoScraper } from "./suumo";
import { HomesScraper } from "./homes";
import { RakumachiScraper } from "./rakumachi";
import { KenbiyaScraper } from "./kenbiya";
import { BaseScraper } from "./base";
import { ScrapeResult, PropertySource } from "@/types";

const allScrapers: BaseScraper[] = [
  new DummyScraper(),
  new SuumoScraper(),
  new HomesScraper(),
  new RakumachiScraper(),
  new KenbiyaScraper(),
];

async function getEnabledSources(): Promise<PropertySource[]> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "SCRAPE_SOURCES" },
    });
    if (setting) {
      return JSON.parse(setting.value) as PropertySource[];
    }
  } catch {
    // Fall through to default
  }
  return ["dummy"];
}

export async function runAllScrapers(): Promise<ScrapeResult[]> {
  const enabledSources = await getEnabledSources();
  const scrapers = allScrapers.filter((s) => enabledSources.includes(s.source));

  console.log(
    `[Scrapers] Running ${scrapers.length} scraper(s): ${enabledSources.join(", ")}`
  );

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
