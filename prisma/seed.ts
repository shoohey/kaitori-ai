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

  // ========================================
  // 過去取引（13件）— 買取再販事業者のリアルなポートフォリオ
  // ========================================
  const deals = await Promise.all([
    // #1 渋谷区神泉町 RC一棟マンション
    prisma.deal.create({
      data: {
        title: "渋谷区神泉町 RC一棟マンション",
        area: "東京都渋谷区",
        address: "東京都渋谷区神泉町15-8",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 1992,
        landArea: 180,
        buildingArea: 620,
        purchasePrice: 320000000,
        renovationCost: 38000000,
        salePrice: 458000000,
        profitRate: 34.4,
        grossYield: 6.2,
        description:
          "神泉駅徒歩3分、全18戸のRC一棟マンション。外壁・共用部リノベーション実施。渋谷エリアの安定した賃貸需要により満室稼働を実現し高値で売却。",
        dealDate: new Date("2024-11-20"),
      },
    }),
    // #2 世田谷区三軒茶屋 SRC一棟マンション
    prisma.deal.create({
      data: {
        title: "世田谷区三軒茶屋 SRC一棟マンション",
        area: "東京都世田谷区",
        address: "東京都世田谷区三軒茶屋2-14-5",
        propertyType: "マンション",
        structure: "SRC",
        buildYear: 1989,
        landArea: 250,
        buildingArea: 980,
        purchasePrice: 450000000,
        renovationCost: 52000000,
        salePrice: 620000000,
        profitRate: 28.4,
        grossYield: 5.8,
        description:
          "三軒茶屋駅徒歩5分、全28戸のSRC一棟マンション。大規模修繕後に再販。ファミリー層の需要が強いエリアで安定稼働。",
        dealDate: new Date("2024-08-15"),
      },
    }),
    // #3 港区麻布十番 区分マンション
    prisma.deal.create({
      data: {
        title: "港区麻布十番 区分マンション",
        area: "東京都港区",
        address: "東京都港区麻布十番3-7-12",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 2001,
        buildingArea: 52,
        purchasePrice: 58000000,
        renovationCost: 8500000,
        salePrice: 82000000,
        profitRate: 23.4,
        description:
          "麻布十番駅徒歩2分の区分マンション。室内フルリノベーション後、実需向けに再販。港区ブランドによる高い資産価値。",
        dealDate: new Date("2025-01-10"),
      },
    }),
    // #4 品川区大井町 木造アパート一棟
    prisma.deal.create({
      data: {
        title: "品川区大井町 木造アパート一棟",
        area: "東京都品川区",
        address: "東京都品川区大井4-8-15",
        propertyType: "アパート",
        structure: "木造",
        buildYear: 2005,
        landArea: 150,
        buildingArea: 210,
        purchasePrice: 95000000,
        renovationCost: 12000000,
        salePrice: 138000000,
        profitRate: 32.6,
        grossYield: 7.8,
        description:
          "大井町駅徒歩7分、全8戸の木造アパート。外壁塗装・設備更新後に再販。品川エリアの高い賃貸需要で安定収益物件として売却。",
        dealDate: new Date("2024-06-25"),
      },
    }),
    // #5 横浜市中区 RC一棟マンション
    prisma.deal.create({
      data: {
        title: "横浜市中区 RC一棟マンション",
        area: "神奈川県横浜市",
        address: "神奈川県横浜市中区山下町85-3",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 1995,
        landArea: 200,
        buildingArea: 560,
        purchasePrice: 180000000,
        renovationCost: 25000000,
        salePrice: 265000000,
        profitRate: 34.6,
        grossYield: 6.8,
        description:
          "元町・中華街駅徒歩6分のRC一棟マンション。エントランス・共用部改修で資産価値向上。横浜中心部の安定需要エリア。",
        dealDate: new Date("2024-09-12"),
      },
    }),
    // #6 川崎市中原区 木造アパート
    prisma.deal.create({
      data: {
        title: "川崎市中原区 木造アパート",
        area: "神奈川県川崎市",
        address: "神奈川県川崎市中原区新丸子町712",
        propertyType: "アパート",
        structure: "木造",
        buildYear: 2008,
        landArea: 130,
        buildingArea: 185,
        purchasePrice: 72000000,
        renovationCost: 8000000,
        salePrice: 105000000,
        profitRate: 36.8,
        grossYield: 8.5,
        description:
          "武蔵小杉エリア、新丸子駅徒歩4分の木造アパート。内装リノベ後に高利回り物件として再販。再開発エリアの将来性も評価。",
        dealDate: new Date("2024-12-05"),
      },
    }),
    // #7 さいたま市浦和区 戸建リノベ
    prisma.deal.create({
      data: {
        title: "さいたま市浦和区 戸建リノベ",
        area: "埼玉県さいたま市",
        address: "埼玉県さいたま市浦和区高砂3-5-8",
        propertyType: "戸建",
        structure: "木造",
        buildYear: 1998,
        landArea: 110,
        buildingArea: 95,
        purchasePrice: 28000000,
        renovationCost: 6500000,
        salePrice: 48000000,
        profitRate: 35.2,
        description:
          "浦和駅徒歩10分の戸建物件。水回り・外壁フルリノベーション後に実需向け再販。文教エリアで子育て世帯に人気。",
        dealDate: new Date("2025-02-01"),
      },
    }),
    // #8 千葉市中央区 RC一棟マンション
    prisma.deal.create({
      data: {
        title: "千葉市中央区 RC一棟マンション",
        area: "千葉県千葉市",
        address: "千葉県千葉市中央区富士見2-12-7",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 1997,
        landArea: 160,
        buildingArea: 420,
        purchasePrice: 120000000,
        renovationCost: 18000000,
        salePrice: 175000000,
        profitRate: 30.5,
        grossYield: 7.2,
        description:
          "千葉駅徒歩8分のRC一棟マンション。全12戸、大規模修繕済み。千葉県庁・裁判所至近で単身者需要が安定。",
        dealDate: new Date("2024-07-18"),
      },
    }),
    // #9 杉並区荻窪 木造アパート
    prisma.deal.create({
      data: {
        title: "杉並区荻窪 木造アパート",
        area: "東京都杉並区",
        address: "東京都杉並区荻窪5-22-10",
        propertyType: "アパート",
        structure: "木造",
        buildYear: 2003,
        landArea: 140,
        buildingArea: 195,
        purchasePrice: 105000000,
        renovationCost: 13000000,
        salePrice: 148000000,
        profitRate: 31.6,
        grossYield: 7.5,
        description:
          "荻窪駅徒歩6分の木造アパート。全10戸、IoT設備導入で差別化リノベ。中央線沿線の高い居住ニーズ。",
        dealDate: new Date("2024-10-30"),
      },
    }),
    // #10 新宿区西新宿 区分マンション
    prisma.deal.create({
      data: {
        title: "新宿区西新宿 区分マンション",
        area: "東京都新宿区",
        address: "東京都新宿区西新宿7-3-15",
        propertyType: "マンション",
        structure: "SRC",
        buildYear: 1996,
        buildingArea: 38,
        purchasePrice: 32000000,
        renovationCost: 5500000,
        salePrice: 48000000,
        profitRate: 36.1,
        description:
          "西新宿駅徒歩3分の区分ワンルーム。デザインリノベ後に投資家向けに再販。新宿エリアの安定した賃貸需要。",
        dealDate: new Date("2024-05-20"),
      },
    }),
    // #11 横浜市青葉区 戸建リフォーム
    prisma.deal.create({
      data: {
        title: "横浜市青葉区 戸建リフォーム",
        area: "神奈川県横浜市",
        address: "神奈川県横浜市青葉区青葉台1-12-5",
        propertyType: "戸建",
        structure: "木造",
        buildYear: 2002,
        landArea: 125,
        buildingArea: 100,
        purchasePrice: 35000000,
        renovationCost: 7000000,
        salePrice: 58000000,
        profitRate: 31.2,
        description:
          "青葉台駅徒歩8分の戸建物件。LDK拡張・断熱改修リフォーム後に再販。田園都市線沿線のファミリー需要。",
        dealDate: new Date("2024-04-10"),
      },
    }),
    // #12 豊島区池袋 RC一棟マンション
    prisma.deal.create({
      data: {
        title: "豊島区池袋 RC一棟マンション",
        area: "東京都豊島区",
        address: "東京都豊島区池袋2-35-8",
        propertyType: "マンション",
        structure: "RC",
        buildYear: 1990,
        landArea: 210,
        buildingArea: 720,
        purchasePrice: 250000000,
        renovationCost: 35000000,
        salePrice: 380000000,
        profitRate: 38.0,
        grossYield: 6.5,
        description:
          "池袋駅徒歩5分のRC一棟マンション。全20戸、オートロック・宅配ボックス新設で付加価値向上。副都心エリアの高い流動性。",
        dealDate: new Date("2025-01-25"),
      },
    }),
    // #13 船橋市 木造アパート一棟
    prisma.deal.create({
      data: {
        title: "船橋市 木造アパート一棟",
        area: "千葉県船橋市",
        address: "千葉県船橋市本町4-18-6",
        propertyType: "アパート",
        structure: "木造",
        buildYear: 2010,
        landArea: 120,
        buildingArea: 165,
        purchasePrice: 62000000,
        renovationCost: 7500000,
        salePrice: 88000000,
        profitRate: 32.6,
        grossYield: 8.8,
        description:
          "船橋駅徒歩6分の木造アパート。全6戸、防音強化・ネット無料化で空室対策。総武線快速停車駅の利便性。",
        dealDate: new Date("2024-03-15"),
      },
    }),
  ]);

  console.log(`Created ${deals.length} deals`);

  // ========================================
  // 検索条件（5件）— 買取再販事業者の実運用条件
  // ========================================
  const conditions = await Promise.all([
    // #1 東京23区 一棟RCマンション
    prisma.condition.create({
      data: {
        name: "東京23区 一棟RCマンション",
        areas: JSON.stringify([
          "東京都渋谷区",
          "東京都新宿区",
          "東京都港区",
          "東京都世田谷区",
          "東京都品川区",
          "東京都目黒区",
          "東京都杉並区",
          "東京都豊島区",
          "東京都中野区",
          "東京都文京区",
          "東京都台東区",
          "東京都墨田区",
          "東京都江東区",
          "東京都大田区",
          "東京都中央区",
          "東京都千代田区",
          "東京都板橋区",
          "東京都練馬区",
          "東京都北区",
          "東京都荒川区",
          "東京都足立区",
          "東京都葛飾区",
          "東京都江戸川区",
        ]),
        propertyTypes: JSON.stringify(["マンション"]),
        structures: JSON.stringify(["RC", "SRC"]),
        minPrice: 100000000,
        maxPrice: 800000000,
        minYield: 5.0,
        ruleWeight: 0.6,
        aiWeight: 0.4,
        aiThreshold: 0.7,
        notifyEmail: "demo@kaitori-ai.example.com",
        isActive: true,
      },
    }),
    // #2 関東圏 高利回り一棟アパート
    prisma.condition.create({
      data: {
        name: "関東圏 高利回り一棟アパート",
        areas: JSON.stringify([
          "東京都",
          "神奈川県",
          "埼玉県",
          "千葉県",
        ]),
        propertyTypes: JSON.stringify(["アパート"]),
        maxPrice: 200000000,
        minYield: 7.0,
        ruleWeight: 0.7,
        aiWeight: 0.3,
        aiThreshold: 0.7,
        notifyEmail: "demo@kaitori-ai.example.com",
        isActive: true,
      },
    }),
    // #3 東京・神奈川 区分マンション再販向け
    prisma.condition.create({
      data: {
        name: "東京・神奈川 区分マンション再販向け",
        areas: JSON.stringify(["東京都", "神奈川県"]),
        propertyTypes: JSON.stringify(["マンション"]),
        maxPrice: 80000000,
        minBuildYear: 1995,
        ruleWeight: 0.5,
        aiWeight: 0.5,
        aiThreshold: 0.65,
        notifyEmail: "demo@kaitori-ai.example.com",
        isActive: true,
      },
    }),
    // #4 関東 戸建再販
    prisma.condition.create({
      data: {
        name: "関東 戸建再販",
        areas: JSON.stringify([
          "東京都",
          "神奈川県",
          "埼玉県",
          "千葉県",
        ]),
        propertyTypes: JSON.stringify(["戸建"]),
        maxPrice: 60000000,
        minLandArea: 80,
        ruleWeight: 0.6,
        aiWeight: 0.4,
        aiThreshold: 0.65,
        notifyEmail: "demo@kaitori-ai.example.com",
        isActive: true,
      },
    }),
    // #5 都心5区 プレミアム物件（AI重視）
    prisma.condition.create({
      data: {
        name: "都心5区 プレミアム物件",
        areas: JSON.stringify([
          "東京都渋谷区",
          "東京都新宿区",
          "東京都港区",
          "東京都千代田区",
          "東京都中央区",
        ]),
        minPrice: 200000000,
        ruleWeight: 0.3,
        aiWeight: 0.7,
        aiThreshold: 0.7,
        notifyEmail: "demo@kaitori-ai.example.com",
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${conditions.length} conditions`);

  // ========================================
  // デフォルト設定
  // ========================================
  await Promise.all([
    prisma.setting.create({
      data: { key: "NOTIFICATION_EMAIL", value: "demo@kaitori-ai.example.com" },
    }),
    prisma.setting.create({
      data: { key: "CRON_INTERVAL", value: "0 */6 * * *" },
    }),
    prisma.setting.create({
      data: {
        key: "SCRAPE_SOURCES",
        value: JSON.stringify(["suumo"]),
      },
    }),
  ]);

  console.log("Created default settings (SCRAPE_SOURCES: suumo)");
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
