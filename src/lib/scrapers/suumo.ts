import { ScrapedProperty, PropertySource } from "@/types";
import { BaseScraper } from "./base";

export class SuumoScraper extends BaseScraper {
  source: PropertySource = "suumo";
  name = "SUUMO Scraper";

  async scrape(): Promise<ScrapedProperty[]> {
    console.log("TODO: implement suumo scraper");
    return [];
  }
}
