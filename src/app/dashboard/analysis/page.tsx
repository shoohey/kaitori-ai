import { prisma } from "@/lib/db";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default async function AnalysisListPage() {
  // マッチスコア上位の物件を取得
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
        <h2 className="text-lg font-semibold text-gray-800">投資分析</h2>
        <p className="text-sm text-gray-500 mt-1">
          マッチスコア上位の物件に対して、AI投資分析レポートを生成できます
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
                マッチ条件
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                スコア
              </th>
              <th className="text-center px-6 py-3 font-medium text-gray-600">
                分析
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
                    {match.condition.name}
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
                      href={`/dashboard/analysis/${match.property.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      分析
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
