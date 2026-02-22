import { ScrapedProperty, PropertySource } from "@/types";

export abstract class BaseScraper {
  abstract source: PropertySource;
  abstract name: string;

  abstract scrape(): Promise<ScrapedProperty[]>;

  protected normalizePrice(priceStr: string): number | undefined {
    // Handle 億 + 万 combined format: "2億3500万円" → 235000000
    const okuMatch = priceStr.match(/(\d+(?:\.\d+)?)億/);
    const manMatch = priceStr.match(/(\d+(?:\.\d+)?)万/);

    if (okuMatch) {
      const oku = parseFloat(okuMatch[1]) * 100000000;
      const man = manMatch ? parseFloat(manMatch[1]) * 10000 : 0;
      return oku + man;
    }

    // Remove commas, 万円, etc. Convert to number (in yen)
    const cleaned = priceStr.replace(/[,、]/g, "").replace(/万円?/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return undefined;
    // If contains 万, multiply by 10000
    if (priceStr.includes("万")) return num * 10000;
    return num;
  }

  protected normalizeArea(areaStr: string): number | undefined {
    const cleaned = areaStr.replace(/[m²㎡]/g, "").replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }

  protected normalizeYield(yieldStr: string): number | undefined {
    const cleaned = yieldStr.replace(/%/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }
}
