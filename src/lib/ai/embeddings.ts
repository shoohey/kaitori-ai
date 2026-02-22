import { openai } from "./openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

export function generatePropertyText(property: {
  title?: string | null;
  area?: string | null;
  address?: string | null;
  propertyType?: string | null;
  structure?: string | null;
  buildYear?: number | null;
  price?: number | null;
  landArea?: number | null;
  buildingArea?: number | null;
  grossYield?: number | null;
  description?: string | null;
}): string {
  const parts: string[] = [];

  if (property.title) parts.push(`物件名: ${property.title}`);
  if (property.area) parts.push(`エリア: ${property.area}`);
  if (property.address) parts.push(`住所: ${property.address}`);
  if (property.propertyType) parts.push(`物件種別: ${property.propertyType}`);
  if (property.structure) parts.push(`構造: ${property.structure}`);
  if (property.buildYear) parts.push(`築年: ${property.buildYear}年`);
  if (property.price) parts.push(`価格: ${property.price}円`);
  if (property.landArea) parts.push(`土地面積: ${property.landArea}m²`);
  if (property.buildingArea) parts.push(`建物面積: ${property.buildingArea}m²`);
  if (property.grossYield) parts.push(`表面利回り: ${property.grossYield}%`);
  if (property.description) parts.push(`説明: ${property.description}`);

  return parts.join(" ");
}
