import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, BarChart3, Calculator } from "lucide-react";

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      matchResults: {
        orderBy: { createdAt: "desc" },
        include: {
          condition: { select: { name: true } },
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const buildAge = property.buildYear
    ? currentYear - property.buildYear
    : null;

  const details = [
    { label: "タイトル", value: property.title },
    { label: "ソース", value: property.source },
    {
      label: "ソースURL",
      value: property.sourceUrl,
      isLink: true,
    },
    {
      label: "価格",
      value: property.price
        ? `${(property.price / 10000).toLocaleString()}万円`
        : "-",
    },
    {
      label: "平米単価",
      value: property.pricePerSqm
        ? `${property.pricePerSqm.toLocaleString()}円/m²`
        : "-",
    },
    { label: "エリア", value: property.area ?? "-" },
    { label: "住所", value: property.address ?? "-" },
    { label: "物件種別", value: property.propertyType ?? "-" },
    { label: "構造", value: property.structure ?? "-" },
    {
      label: "築年",
      value: property.buildYear
        ? `${property.buildYear}年（築${buildAge}年）`
        : "-",
    },
    {
      label: "土地面積",
      value: property.landArea ? `${property.landArea}m²` : "-",
    },
    {
      label: "建物面積",
      value: property.buildingArea ? `${property.buildingArea}m²` : "-",
    },
    {
      label: "階数",
      value: property.floors ? `${property.floors}階` : "-",
    },
    {
      label: "戸数",
      value: property.units ? `${property.units}戸` : "-",
    },
    {
      label: "表面利回り",
      value: property.grossYield ? `${property.grossYield}%` : "-",
    },
    {
      label: "実質利回り",
      value: property.netYield ? `${property.netYield}%` : "-",
    },
    {
      label: "入居率",
      value: property.occupancyRate ? `${property.occupancyRate}%` : "-",
    },
    { label: "ステータス", value: property.status },
    {
      label: "取得日時",
      value: new Date(property.scrapedAt).toLocaleString("ja-JP"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard/properties"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4" />
        物件一覧に戻る
      </Link>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          href={`/dashboard/analysis/${property.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <BarChart3 className="w-4 h-4" />
          投資分析レポート
        </Link>
        <Link
          href={`/dashboard/simulation/${property.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Calculator className="w-4 h-4" />
          収益シミュレーション
        </Link>
        {property.sourceUrl && (
          <a
            href={property.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            掲載ページを開く
          </a>
        )}
      </div>

      {/* Property details */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {property.title}
          </h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {details.map((item) => (
              <div key={item.label} className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-800">
                  {item.isLink && item.value ? (
                    <a
                      href={item.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                    >
                      リンクを開く
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {property.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                説明
              </h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Match results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            マッチ結果
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  条件名
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">
                  ルールスコア
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">
                  AIスコア
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">
                  総合スコア
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  ステータス
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  日時
                </th>
              </tr>
            </thead>
            <tbody>
              {property.matchResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    マッチ結果がありません
                  </td>
                </tr>
              ) : (
                property.matchResults.map((match) => (
                  <tr
                    key={match.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-800">
                      {match.condition.name}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {(match.ruleScore * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {(match.aiScore * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`font-medium ${
                          match.totalScore >= 0.7
                            ? "text-green-600"
                            : match.totalScore >= 0.4
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {(match.totalScore * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          match.status === "notified"
                            ? "bg-green-100 text-green-700"
                            : match.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {match.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(match.createdAt).toLocaleString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
