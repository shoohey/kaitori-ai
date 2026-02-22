import { PrismaClient } from "@prisma/client";

// Dynamic import for ESM compatibility
async function main() {
  const prisma = new PrismaClient();

  try {
    const { generateEmbedding, generatePropertyText } = await import("../src/lib/ai/embeddings");

    console.log("Generating embeddings for properties...");
    const properties = await prisma.property.findMany({ where: { embedding: null } });

    for (const prop of properties) {
      const text = generatePropertyText({
        title: prop.title,
        area: prop.area,
        address: prop.address,
        propertyType: prop.propertyType,
        structure: prop.structure,
        buildYear: prop.buildYear,
        price: prop.price,
        landArea: prop.landArea,
        buildingArea: prop.buildingArea,
        grossYield: prop.grossYield,
        description: prop.description,
      });

      try {
        const embedding = await generateEmbedding(text);
        await prisma.property.update({
          where: { id: prop.id },
          data: { embedding: JSON.stringify(embedding) },
        });
        console.log(`  ✓ Property: ${prop.title}`);
      } catch (error) {
        console.error(`  ✗ Property: ${prop.title}`, error);
      }
    }

    console.log("\nGenerating embeddings for deals...");
    const deals = await prisma.deal.findMany({ where: { embedding: null } });

    for (const deal of deals) {
      const text = generatePropertyText({
        title: deal.title,
        area: deal.area,
        address: deal.address,
        propertyType: deal.propertyType,
        structure: deal.structure,
        buildYear: deal.buildYear,
        price: deal.purchasePrice,
        landArea: deal.landArea,
        buildingArea: deal.buildingArea,
        grossYield: deal.grossYield,
        description: deal.description,
      });

      try {
        const embedding = await generateEmbedding(text);
        await prisma.deal.update({
          where: { id: deal.id },
          data: { embedding: JSON.stringify(embedding) },
        });
        console.log(`  ✓ Deal: ${deal.title}`);
      } catch (error) {
        console.error(`  ✗ Deal: ${deal.title}`, error);
      }
    }

    console.log("\nDone!");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
