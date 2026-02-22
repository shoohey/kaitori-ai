import { ScrapedProperty, PropertySource } from "@/types";
import { BaseScraper } from "./base";

export class KenbiyaScraper extends BaseScraper {
  source: PropertySource = "kenbiya";
  name = "Kenbiya Scraper";

  async scrape(): Promise<ScrapedProperty[]> {
    console.log("TODO: implement kenbiya scraper");
    return [];
  }
}
