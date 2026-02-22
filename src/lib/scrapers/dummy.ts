import { ScrapedProperty, PropertySource } from "@/types";
import { BaseScraper } from "./base";

const AREAS = [
  "東京都新宿区",
  "東京都渋谷区",
  "東京都港区",
  "東京都豊島区",
  "東京都中央区",
  "東京都台東区",
  "東京都墨田区",
  "東京都品川区",
  "大阪府大阪市北区",
  "大阪府大阪市中央区",
  "大阪府大阪市浪速区",
  "大阪府堺市堺区",
  "神奈川県横浜市中区",
  "神奈川県川崎市川崎区",
  "愛知県名古屋市中区",
  "福岡県福岡市博多区",
  "北海道札幌市中央区",
  "宮城県仙台市青葉区",
  "広島県広島市中区",
  "京都府京都市中京区",
];

const PROPERTY_TYPES = [
  "マンション",
  "アパート",
  "戸建",
  "ビル",
  "店舗",
];

const STRUCTURES = ["RC", "SRC", "S", "木造", "軽量鉄骨"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export class DummyScraper extends BaseScraper {
  source: PropertySource = "dummy";
  name = "Dummy Scraper";

  async scrape(): Promise<ScrapedProperty[]> {
    const count = randomInt(5, 10);
    const properties: ScrapedProperty[] = [];

    for (let i = 0; i < count; i++) {
      const area = randomElement(AREAS);
      const propertyType = randomElement(PROPERTY_TYPES);
      const structure = randomElement(STRUCTURES);
      const buildYear = randomInt(1970, 2024);
      const price = randomInt(1000, 50000) * 10000; // 1000万 - 50000万 in yen
      const landArea = randomFloat(50, 500, 2);
      const buildingArea = randomFloat(30, 400, 2);
      const grossYield = randomFloat(3, 15, 2);
      const randomId = generateRandomId();

      properties.push({
        source: "dummy",
        sourceUrl: `https://dummy.example.com/property/${randomId}`,
        title: `${area} ${propertyType} ${buildYear}年築`,
        price,
        area,
        address: `${area}${randomInt(1, 9)}-${randomInt(1, 30)}-${randomInt(1, 20)}`,
        propertyType,
        structure,
        buildYear,
        landArea,
        buildingArea,
        grossYield,
        description: `${area}に位置する${propertyType}です。${structure}造、${buildYear}年築。表面利回り${grossYield}%。`,
      });
    }

    return properties;
  }
}
