import { prisma } from "@/lib/db";
import { Building2, GitCompare, Bell, Handshake } from "lucide-react";

export default async function DashboardPage() {
  const [propertyCount, matchCount, notificationCount, dealCount] =
    await Promise.all([
      prisma.property.count(),
      prisma.matchResult.count(),
      prisma.notification.count(),
      prisma.deal.count(),
    ]);

  const recentMatches = await prisma.matchResult.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true } },
      condition: { select: { name: true } },
    },
  });

  const stats = [
    {
      label: "物件数",
      value: propertyCount,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "マッチ数",
      value: matchCount,
      icon: GitCompare,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "通知数",
      value: notificationCount,
      icon: Bell,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "取引数",
      value: dealCount,
      icon: Handshake,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
            >
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent matches */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            最近のマッチ結果
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  物件名
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  条件名
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  スコア
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
              {recentMatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    マッチ結果がありません
                  </td>
                </tr>
              ) : (
                recentMatches.map((match) => (
                  <tr
                    key={match.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-800">
                      {match.property.title}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {match.condition.name}
                    </td>
                    <td className="px-6 py-3">
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
