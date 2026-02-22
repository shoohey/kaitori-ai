import { ScrapedProperty, PropertySource } from "@/types";
import { BaseScraper } from "./base";

export class RakumachiScraper extends BaseScraper {
  source: PropertySource = "rakumachi";
  name = "Rakumachi Scraper";

  async scrape(): Promise<ScrapedProperty[]> {
    console.log("TODO: implement rakumachi scraper");
    return [];
  }
}
