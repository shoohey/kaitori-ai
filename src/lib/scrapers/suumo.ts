import * as cheerio from "cheerio";
import { ScrapedProperty, PropertySource } from "@/types";
import { BaseScraper } from "./base";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// 関東圏の主要エリア
// フルリスト（本番用）
const ALL_AREAS: { prefecture: string; city: string; areaLabel: string }[] = [
  { prefecture: "tokyo", city: "sc_shibuya", areaLabel: "東京都渋谷区" },
  { prefecture: "tokyo", city: "sc_shinjuku", areaLabel: "東京都新宿区" },
  { prefecture: "tokyo", city: "sc_minato", areaLabel: "東京都港区" },
  { prefecture: "tokyo", city: "sc_setagaya", areaLabel: "東京都世田谷区" },
  { prefecture: "tokyo", city: "sc_shinagawa", areaLabel: "東京都品川区" },
  { prefecture: "tokyo", city: "sc_suginami", areaLabel: "東京都杉並区" },
  { prefecture: "tokyo", city: "sc_toshima", areaLabel: "東京都豊島区" },
  { prefecture: "kanagawa", city: "sc_yokohamashinage", areaLabel: "神奈川県横浜市" },
  { prefecture: "saitama", city: "sc_saitamashiurawa", areaLabel: "埼玉県さいたま市" },
  { prefecture: "chiba", city: "sc_chibashichuo", areaLabel: "千葉県千葉市" },
];

// SCRAPE_AREA_LIMIT環境変数でエリア数を制限可能（デフォルト: 全エリア）
const AREA_LIMIT = parseInt(process.env.SCRAPE_AREA_LIMIT || "0", 10);
const TARGET_AREAS = AREA_LIMIT > 0 ? ALL_AREAS.slice(0, AREA_LIMIT) : ALL_AREAS;

const MAX_PAGES_DEFAULT = 3;
const PAGE_LIMIT = parseInt(process.env.SCRAPE_PAGE_LIMIT || "0", 10);
const MAX_PAGES = PAGE_LIMIT > 0 ? PAGE_LIMIT : MAX_PAGES_DEFAULT;
const DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class SuumoScraper extends BaseScraper {
  source: PropertySource = "suumo";
  name = "SUUMO Scraper";

  async scrape(): Promise<ScrapedProperty[]> {
    console.log("[SUUMO] Starting scrape for Kanto area...");
    const allProperties: ScrapedProperty[] = [];

    for (const area of TARGET_AREAS) {
      try {
        const properties = await this.scrapeArea(area);
        allProperties.push(...properties);
        console.log(
          `[SUUMO] ${area.areaLabel}: ${properties.length} properties found`
        );
      } catch (error) {
        console.error(
          `[SUUMO] Error scraping ${area.areaLabel}:`,
          error instanceof Error ? error.message : error
        );
      }
      await sleep(DELAY_MS);
    }

    console.log(`[SUUMO] Total: ${allProperties.length} properties scraped`);
    return allProperties;
  }

  private async scrapeArea(
    area: { prefecture: string; city: string; areaLabel: string }
  ): Promise<ScrapedProperty[]> {
    const properties: ScrapedProperty[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `https://suumo.jp/ms/chuko/${area.prefecture}/${area.city}/?page=${page}`;
      try {
        const html = await this.fetchPage(url);
        const pageProperties = this.parsePage(html, area.areaLabel);

        if (pageProperties.length === 0) break; // No more results
        properties.push(...pageProperties);
      } catch (error) {
        console.error(
          `[SUUMO] Error fetching page ${page} for ${area.areaLabel}:`,
          error instanceof Error ? error.message : error
        );
        break;
      }

      if (page < MAX_PAGES) {
        await sleep(DELAY_MS);
      }
    }

    return properties;
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  private parsePage(html: string, fallbackArea: string): ScrapedProperty[] {
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    // SUUMO中古マンション一覧: div.property_unit内に物件情報
    $("div.property_unit").each((_, element) => {
      try {
        const prop = this.parsePropertyUnit($, $(element), fallbackArea);
        if (prop) {
          properties.push(prop);
        }
      } catch (error) {
        // Skip individual property parse errors
      }
    });

    return properties;
  }

  private parsePropertyUnit(
    $: cheerio.CheerioAPI,
    $unit: cheerio.Cheerio<any>,
    fallbackArea: string
  ): ScrapedProperty | null {
    const data: Record<string, string> = {};

    // dottable-line内のdt/ddペアを取得
    $unit.find("div.dottable-line").each((_, line) => {
      const dt = $(line).find("dt").text().trim();
      const dd = $(line).find("dd").text().trim();
      if (dt && dd) {
        data[dt] = dd;
      }
    });

    // 物件名を取得
    const title =
      data["物件名"] ||
      $unit.find("h2").first().text().trim() ||
      $unit.find("a.js-cassetLinkByPropName").text().trim();

    if (!title) return null;

    // 物件リンクを取得
    let sourceUrl: string | undefined;
    const link = $unit.find('a[href*="/ms/chuko/"]').first().attr("href");
    if (link) {
      sourceUrl = link.startsWith("http") ? link : `https://suumo.jp${link}`;
    }

    // 価格パース
    const priceStr =
      data["販売価格"] ||
      $unit.find("span.dottable-value").first().text().trim();
    const price = priceStr ? this.normalizePrice(priceStr) : undefined;

    // 住所
    const address = data["所在地"] || undefined;
    const area = address ? this.extractArea(address) : fallbackArea;

    // 面積
    const areaStr = data["専有面積"] || undefined;
    const buildingArea = areaStr ? this.normalizeArea(areaStr) : undefined;

    // 間取り
    const layout = data["間取り"] || undefined;

    // 築年月 → 築年数
    const buildYearStr = data["築年月"] || undefined;
    const buildYear = buildYearStr
      ? this.parseBuildYear(buildYearStr)
      : undefined;

    // 沿線・駅
    const station = data["沿線・駅"] || undefined;

    // descriptionを構成
    const descParts: string[] = [];
    if (layout) descParts.push(`間取り: ${layout}`);
    if (station) descParts.push(`最寄駅: ${station}`);
    const description = descParts.length > 0 ? descParts.join("、") : undefined;

    return {
      source: "suumo",
      sourceUrl: sourceUrl || `https://suumo.jp/ms/chuko/${Date.now()}`,
      title,
      price,
      area,
      address,
      propertyType: "マンション",
      buildYear,
      buildingArea,
      description,
    };
  }

  private extractArea(address: string): string {
    // "東京都渋谷区..." → "東京都渋谷区"
    const match = address.match(
      /^(東京都[^市区町村]*?[区]|[^都道府県]*?[都道府県][^市区町村]*?[市区町村])/
    );
    return match ? match[1] : address.substring(0, 10);
  }

  private parseBuildYear(buildYearStr: string): number | undefined {
    // "1962年10月" → 1962, "2005年3月" → 2005
    const match = buildYearStr.match(/(\d{4})年/);
    return match ? parseInt(match[1], 10) : undefined;
  }
}
