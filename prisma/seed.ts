import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.matchResult.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.scrapeLog.deleteMany();
  await prisma.property.deleteMany();
  await prisma.condition.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.setting.deleteMany();

  // Create sample properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        source: "dummy",
        sourceUrl: "https://dummy.example.com/prop-001",
        title: "東京都渋谷区 投資用マンション 1棟",
        price: 280000000,
        area: "東京都渋谷区",
        address: "東京都渋谷区神泉町1-2-3",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 1995,
        landArea: 120,
        buildingArea: 450,
        floors: 5,
        units: 12,
        grossYield: 6.5,
        description: "渋谷駅徒歩10分、満室稼働中の投資用RCマンション。",
        status: "new",
      },
    }),
    prisma.property.create({
      data: {
        source: "dummy",
        sourceUrl: "https://dummy.example.com/prop-002",
        title: "大阪府大阪市中央区 収益ビル",
        price: 150000000,
        area: "大阪府大阪市",
        address: "大阪府大阪市中央区心斎橋筋2-5-8",
        propertyType: "ビル",
        structure: "SRC",
        buildYear: 1988,
        landArea: 80,
        buildingArea: 320,
        floors: 6,
        units: 8,
        grossYield: 8.2,
        description: "心斎橋エリアの収益ビル。テナント入居率90%。",
        status: "new",
      },
    }),
    prisma.property.create({
      data: {
        source: "dummy",
        sourceUrl: "https://dummy.example.com/prop-003",
        title: "神奈川県横浜市 アパート一棟",
        price: 85000000,
        area: "神奈川県横浜市",
        address: "神奈川県横浜市港北区日吉3-1-5",
        propertyType: "アパート",
        structure: "木造",
        buildYear: 2010,
        landArea: 200,
        buildingArea: 280,
        floors: 2,
        units: 8,
        grossYield: 7.8,
        description: "日吉駅徒歩8分、築浅木造アパート。全室ワンルーム。",
        status: "new",
      },
    }),
    prisma.property.create({
      data: {
        source: "dummy",
        sourceUrl: "https://dummy.example.com/prop-004",
        title: "福岡県福岡市博多区 区分マンション",
        price: 18000000,
        area: "福岡県福岡市",
        address: "福岡県福岡市博多区博多駅前3-2-1",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 2005,
        landArea: 0,
        buildingArea: 28,
        grossYield: 5.9,
        description: "博多駅徒歩3分の区分マンション。ワンルーム。",
        status: "new",
      },
    }),
    prisma.property.create({
      data: {
        source: "dummy",
        sourceUrl: "https://dummy.example.com/prop-005",
        title: "愛知県名古屋市 戸建投資物件",
        price: 32000000,
        area: "愛知県名古屋市",
        address: "愛知県名古屋市中区栄4-8-12",
        propertyType: "戸建",
        structure: "木造",
        buildYear: 2000,
        landArea: 100,
        buildingArea: 85,
        floors: 2,
        grossYield: 9.5,
        description: "名古屋市中区の戸建投資物件。リフォーム済み。",
        status: "new",
      },
    }),
  ]);

  console.log(`Created ${properties.length} properties`);

  // Create sample conditions
  const conditions = await Promise.all([
    prisma.condition.create({
      data: {
        name: "東京都 RC/SRC マンション",
        areas: JSON.stringify(["東京都"]),
        propertyTypes: JSON.stringify(["マンション"]),
        structures: JSON.stringify(["RC", "SRC"]),
        minPrice: 100000000,
        maxPrice: 500000000,
        minYield: 5.0,
        ruleWeight: 0.6,
        aiWeight: 0.4,
        aiThreshold: 0.4,
        notifyEmail: "test@example.com",
        isActive: true,
      },
    }),
    prisma.condition.create({
      data: {
        name: "関東圏 高利回り物件",
        areas: JSON.stringify(["東京都", "神奈川県", "埼玉県", "千葉県"]),
        propertyTypes: JSON.stringify(["マンション", "アパート", "ビル"]),
        minYield: 7.0,
        maxPrice: 200000000,
        ruleWeight: 0.7,
        aiWeight: 0.3,
        aiThreshold: 0.35,
        notifyEmail: "test@example.com",
        isActive: true,
      },
    }),
    prisma.condition.create({
      data: {
        name: "全国 築浅アパート",
        propertyTypes: JSON.stringify(["アパート"]),
        minBuildYear: 2005,
        maxPrice: 150000000,
        minYield: 6.0,
        ruleWeight: 0.5,
        aiWeight: 0.5,
        aiThreshold: 0.3,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${conditions.length} conditions`);

  // Create sample deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: "世田谷区 RCマンション 1棟売買",
        area: "東京都世田谷区",
        address: "東京都世田谷区太子堂2-1-1",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 1998,
        landArea: 150,
        buildingArea: 500,
        purchasePrice: 200000000,
        renovationCost: 15000000,
        salePrice: 280000000,
        profitRate: 32.5,
        grossYield: 6.8,
        description: "世田谷区のRCマンション。リノベーション後に再販。",
        dealDate: new Date("2024-06-15"),
      },
    }),
    prisma.deal.create({
      data: {
        title: "横浜市 木造アパート リノベ再販",
        area: "神奈川県横浜市",
        address: "神奈川県横浜市青葉区青葉台1-5-3",
        propertyType: "アパート",
        structure: "木造",
        buildYear: 2008,
        landArea: 180,
        buildingArea: 240,
        purchasePrice: 65000000,
        renovationCost: 8000000,
        salePrice: 95000000,
        profitRate: 33.8,
        grossYield: 8.2,
        description: "横浜市の木造アパート。外壁・内装フルリノベーション後に再販。",
        dealDate: new Date("2024-09-20"),
      },
    }),
    prisma.deal.create({
      data: {
        title: "名古屋市 戸建再販",
        area: "愛知県名古屋市",
        address: "愛知県名古屋市千種区覚王山通8-2",
        propertyType: "戸建",
        structure: "木造",
        buildYear: 2003,
        landArea: 110,
        buildingArea: 90,
        purchasePrice: 25000000,
        renovationCost: 5000000,
        salePrice: 42000000,
        profitRate: 48.0,
        description: "名古屋市の戸建物件。水回りリフォーム後に再販。",
        dealDate: new Date("2025-01-10"),
      },
    }),
  ]);

  console.log(`Created ${deals.length} deals`);

  // Create default settings
  await Promise.all([
    prisma.setting.create({ data: { key: "NOTIFICATION_EMAIL", value: "test@example.com" } }),
    prisma.setting.create({ data: { key: "CRON_INTERVAL", value: "0 */6 * * *" } }),
    prisma.setting.create({ data: { key: "SCRAPE_SOURCES", value: JSON.stringify(["dummy"]) } }),
  ]);

  console.log("Created default settings");
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
