/**
 * 都道府県・市区町村コードマッピング
 * 国交省 不動産取引価格情報API用
 */

export const PREFECTURE_CODES: Record<string, number> = {
  北海道: 1,
  青森県: 2,
  岩手県: 3,
  宮城県: 4,
  秋田県: 5,
  山形県: 6,
  福島県: 7,
  茨城県: 8,
  栃木県: 9,
  群馬県: 10,
  埼玉県: 11,
  千葉県: 12,
  東京都: 13,
  神奈川県: 14,
  新潟県: 15,
  富山県: 16,
  石川県: 17,
  福井県: 18,
  山梨県: 19,
  長野県: 20,
  岐阜県: 21,
  静岡県: 22,
  愛知県: 23,
  三重県: 24,
  滋賀県: 25,
  京都府: 26,
  大阪府: 27,
  兵庫県: 28,
  奈良県: 29,
  和歌山県: 30,
  鳥取県: 31,
  島根県: 32,
  岡山県: 33,
  広島県: 34,
  山口県: 35,
  徳島県: 36,
  香川県: 37,
  愛媛県: 38,
  高知県: 39,
  福岡県: 40,
  佐賀県: 41,
  長崎県: 42,
  熊本県: 43,
  大分県: 44,
  宮崎県: 45,
  鹿児島県: 46,
  沖縄県: 47,
};

// エリア文字列から都道府県コードを抽出
export function extractPrefectureCode(area: string | null | undefined): number | null {
  if (!area) return null;

  for (const [name, code] of Object.entries(PREFECTURE_CODES)) {
    if (area.includes(name)) return code;
  }

  // 都道府県名なしの場合、主要都市名で推定
  const cityToPrefecture: Record<string, number> = {
    東京: 13,
    新宿: 13,
    渋谷: 13,
    港区: 13,
    千代田: 13,
    中央区: 13,
    品川: 13,
    目黒: 13,
    世田谷: 13,
    大田区: 13,
    杉並: 13,
    練馬: 13,
    板橋: 13,
    豊島: 13,
    北区: 13,
    荒川: 13,
    台東: 13,
    墨田: 13,
    江東: 13,
    足立: 13,
    葛飾: 13,
    江戸川: 13,
    八王子: 13,
    町田: 13,
    府中: 13,
    調布: 13,
    横浜: 14,
    川崎: 14,
    相模原: 14,
    藤沢: 14,
    鎌倉: 14,
    さいたま: 11,
    川口: 11,
    所沢: 11,
    川越: 11,
    越谷: 11,
    草加: 11,
    千葉: 12,
    船橋: 12,
    松戸: 12,
    柏: 12,
    市川: 12,
    浦安: 12,
    名古屋: 23,
    大阪: 27,
    梅田: 27,
    難波: 27,
    神戸: 28,
    京都: 26,
    福岡: 40,
    博多: 40,
    札幌: 1,
    仙台: 4,
    広島: 34,
  };

  for (const [city, code] of Object.entries(cityToPrefecture)) {
    if (area.includes(city)) return code;
  }

  return null;
}

// 物件種別を国交省API用の種別コードにマッピング
export function mapPropertyTypeForMLIT(propertyType: string | null | undefined): string {
  if (!propertyType) return "";
  switch (propertyType) {
    case "マンション":
      return "中古マンション等";
    case "アパート":
      return "中古マンション等";
    case "戸建":
      return "宅地(土地と建物)";
    case "土地":
      return "宅地(土地)";
    default:
      return "";
  }
}
