import { prisma } from "@/lib/db";
import {
  generateEmbedding,
  generatePropertyText,
  cosineSimilarity,
} from "@/lib/ai/embeddings";
import { AIScoreDetail } from "@/types";

export async function calculateAIScore(
  property: any,
  deals: any[]
): Promise<{ score: number; details: AIScoreDetail }> {
  if (deals.length === 0) {
    return {
      score: 0,
      details: { similarDeals: [], averageSimilarity: 0 },
    };
  }

  // Get or generate property embedding
  let propertyEmbedding: number[];

  if (property.embedding) {
    propertyEmbedding = JSON.parse(property.embedding) as number[];
  } else {
    const text = generatePropertyText(property);
    propertyEmbedding = await generateEmbedding(text);

    // Save embedding to DB
    await prisma.property.update({
      where: { id: property.id },
      data: { embedding: JSON.stringify(propertyEmbedding) },
    });
  }

  // Compare with each deal's embedding
  const similarities: { dealId: string; title: string; similarity: number }[] =
    [];

  for (const deal of deals) {
    let dealEmbedding: number[];

    if (deal.embedding) {
      dealEmbedding = JSON.parse(deal.embedding) as number[];
    } else {
      const dealText = generatePropertyText(deal);
      try {
        dealEmbedding = await generateEmbedding(dealText);

        // Save deal embedding to DB
        await prisma.deal.update({
          where: { id: deal.id },
          data: { embedding: JSON.stringify(dealEmbedding) },
        });
      } catch (error) {
        console.error(
          `Failed to generate embedding for deal ${deal.id}:`,
          error
        );
        continue;
      }
    }

    const similarity = cosineSimilarity(propertyEmbedding, dealEmbedding);
    similarities.push({
      dealId: deal.id,
      title: deal.title,
      similarity,
    });
  }

  if (similarities.length === 0) {
    return {
      score: 0,
      details: { similarDeals: [], averageSimilarity: 0 },
    };
  }

  // Sort by similarity descending and take top 3
  similarities.sort((a, b) => b.similarity - a.similarity);
  const topDeals = similarities.slice(0, 3);

  // Average similarity across all deals
  const averageSimilarity =
    similarities.reduce((sum, s) => sum + s.similarity, 0) /
    similarities.length;

  return {
    score: averageSimilarity,
    details: {
      similarDeals: topDeals,
      averageSimilarity,
    },
  };
}
