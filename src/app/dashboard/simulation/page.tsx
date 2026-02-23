import { prisma } from "@/lib/db";
import Link from "next/link";
import { Calculator } from "lucide-react";

export default async function SimulationListPage() {
  const topMatches = await prisma.matchResult.findMany({
    orderBy: { totalScore: "desc" },
    take: 30,
    include: {
      property: true,
      condition: { select: { name: true } },
    },
    distinct: ["propertyId"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          収益シミュレーション
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          マッチスコア上位の物件に対して、ルールベースの収益シミュレーションを実行できます（即時計算・PDF出力対応）
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                物件名
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                エリア
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                価格
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                種別/構造
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                スコア
              </th>
              <th className="text-center px-6 py-3 font-medium text-gray-600">
                シミュレーション
              </th>
            </tr>
          </thead>
          <tbody>
            {topMatches.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  マッチ結果がありません。先にスクレイピングとマッチングを実行してください。
                </td>
              </tr>
            ) : (
              topMatches.map((match) => (
                <tr
                  key={match.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-3">
                    <Link
                      href={`/dashboard/properties/${match.property.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {match.property.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {match.property.area || "-"}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-800">
                    {match.property.price
                      ? `${(match.property.price / 10000).toLocaleString()}万円`
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {match.property.propertyType || "-"}
                    {match.property.structure &&
                      ` / ${match.property.structure}`}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`font-medium ${
                        match.totalScore >= 0.7
                          ? "text-green-600"
                          : match.totalScore >= 0.5
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {(match.totalScore * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <Link
                      href={`/dashboard/simulation/${match.property.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-xs font-medium"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      シミュレーション
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
