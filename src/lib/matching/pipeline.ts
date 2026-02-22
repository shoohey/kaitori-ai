import { prisma } from "@/lib/db";
import { calculateRuleScore } from "./rule-engine";
import { calculateAIScore } from "./ai-scorer";
import { calculateTotalScore } from "./scoring";
import { sendNotificationEmail } from "@/lib/notifications/email";

export async function runMatchingPipeline(): Promise<{
  matchCount: number;
  notificationsSent: number;
  results: any[];
}> {
  // Get all active conditions
  const conditions = await prisma.condition.findMany({
    where: { isActive: true },
  });

  // Get all properties with status "new"
  const properties = await prisma.property.findMany({
    where: { status: "new" },
  });

  // Get all deals (for AI scoring)
  const deals = await prisma.deal.findMany();

  const results: any[] = [];
  let matchCount = 0;
  let notificationsSent = 0;

  // For each property x condition pair
  for (const property of properties) {
    for (const condition of conditions) {
      // Calculate rule score
      const { score: ruleScore, details: ruleDetails } = calculateRuleScore(
        property,
        condition
      );

      // Calculate AI score
      const { score: aiScore, details: aiDetails } = await calculateAIScore(
        property,
        deals
      );

      // Calculate total score
      const totalScore = calculateTotalScore(
        ruleScore,
        aiScore,
        condition.ruleWeight,
        condition.aiWeight
      );

      // If totalScore >= condition.aiThreshold: create MatchResult in DB
      if (totalScore >= condition.aiThreshold) {
        await prisma.matchResult.create({
          data: {
            propertyId: property.id,
            conditionId: condition.id,
            ruleScore,
            aiScore,
            totalScore,
            ruleDetails: JSON.stringify(ruleDetails),
            aiDetails: JSON.stringify(aiDetails),
            status: "pending",
          },
        });

        results.push({
          propertyId: property.id,
          conditionId: condition.id,
          propertyTitle: property.title,
          conditionName: condition.name,
          ruleScore,
          aiScore,
          totalScore,
        });

        matchCount++;
      }
    }
  }

  // After matching, group results by condition
  const resultsByCondition = new Map<string, typeof results>();
  for (const result of results) {
    const existing = resultsByCondition.get(result.conditionId) || [];
    existing.push(result);
    resultsByCondition.set(result.conditionId, existing);
  }

  // For each condition with matches above threshold and with notifyEmail: send notification
  for (const condition of conditions) {
    const conditionResults = resultsByCondition.get(condition.id);
    if (!conditionResults || conditionResults.length === 0) continue;
    if (!condition.notifyEmail) continue;

    const matchedProperties = conditionResults.map((r) => {
      const prop = properties.find((p) => p.id === r.propertyId);
      return {
        id: r.propertyId,
        title: prop?.title || "",
        price: prop?.price ?? undefined,
        area: prop?.area ?? undefined,
        totalScore: r.totalScore,
        sourceUrl: prop?.sourceUrl ?? undefined,
      };
    });

    const success = await sendNotificationEmail({
      email: condition.notifyEmail,
      subject: `【買取AI】${condition.name} に${matchedProperties.length}件の新着マッチ物件`,
      properties: matchedProperties,
      conditionName: condition.name,
    });

    if (success) {
      notificationsSent++;
    }
  }

  // Update matched properties status to "matched"
  const matchedPropertyIds = Array.from(new Set(results.map((r) => r.propertyId)));
  if (matchedPropertyIds.length > 0) {
    await prisma.property.updateMany({
      where: { id: { in: matchedPropertyIds } },
      data: { status: "matched" },
    });
  }

  return { matchCount, notificationsSent, results };
}
