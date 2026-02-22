import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { scrapedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">物件一覧</h2>
        <span className="text-sm text-gray-500">
          全{properties.length}件
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                タイトル
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                ソース
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                エリア
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                価格(万円)
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                利回り(%)
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                築年数
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                ステータス
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                取得日
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  物件データがありません
                </td>
              </tr>
            ) : (
              properties.map((property) => {
                const currentYear = new Date().getFullYear();
                const buildAge = property.buildYear
                  ? currentYear - property.buildYear
                  : null;

                return (
                  <tr
                    key={property.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/dashboard/properties/${property.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {property.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {property.source}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {property.area ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {property.price
                        ? (property.price / 10000).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {property.grossYield
                        ? property.grossYield.toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {buildAge !== null ? `${buildAge}年` : "-"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          property.status === "new"
                            ? "bg-blue-100 text-blue-700"
                            : property.status === "matched"
                            ? "bg-green-100 text-green-700"
                            : property.status === "notified"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(property.scrapedAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
