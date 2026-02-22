export type PropertySource = "suumo" | "homes" | "rakumachi" | "kenbiya" | "reins" | "dummy";

export type PropertyStatus = "new" | "matched" | "notified" | "archived";

export type PropertyType = "マンション" | "アパート" | "戸建" | "土地" | "ビル" | "店舗" | "その他";

export type StructureType = "RC" | "SRC" | "S" | "木造" | "軽量鉄骨" | "その他";

export interface ScrapedProperty {
  source: PropertySource;
  sourceUrl: string;
  title: string;
  price?: number;
  pricePerSqm?: number;
  area?: string;
  address?: string;
  propertyType?: string;
  structure?: string;
  buildYear?: number;
  landArea?: number;
  buildingArea?: number;
  floors?: number;
  units?: number;
  grossYield?: number;
  netYield?: number;
  occupancyRate?: number;
  description?: string;
  imageUrls?: string[];
}

export interface RuleScoreDetail {
  area: number;
  propertyType: number;
  price: number;
  yield: number;
  buildYear: number;
  landArea: number;
  buildingArea: number;
}

export interface AIScoreDetail {
  similarDeals: { dealId: string; title: string; similarity: number }[];
  averageSimilarity: number;
}

export interface MatchScore {
  ruleScore: number;
  aiScore: number;
  totalScore: number;
  ruleDetails: RuleScoreDetail;
  aiDetails: AIScoreDetail;
}

export interface NotificationPayload {
  email: string;
  subject: string;
  properties: {
    id: string;
    title: string;
    price?: number;
    area?: string;
    totalScore: number;
    sourceUrl?: string;
  }[];
  conditionName: string;
}

export interface ScrapeResult {
  source: PropertySource;
  propertiesFound: number;
  newProperties: number;
  errors?: string[];
}

export interface PipelineResult {
  scrapeResults: ScrapeResult[];
  matchCount: number;
  notificationsSent: number;
}
