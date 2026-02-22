import { ScrapedProperty, PropertySource } from "@/types";
import { BaseScraper } from "./base";

export class HomesScraper extends BaseScraper {
  source: PropertySource = "homes";
  name = "HOME'S Scraper";

  async scrape(): Promise<ScrapedProperty[]> {
    console.log("TODO: implement homes scraper");
    return [];
  }
}
