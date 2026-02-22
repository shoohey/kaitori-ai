import { prisma } from "@/lib/db";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { sentAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">通知履歴</h2>
        <span className="text-sm text-gray-500">
          全{notifications.length}件
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                件名
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                宛先
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                ステータス
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                送信日時
              </th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 text-gray-300" />
                    <span>通知履歴がありません</span>
                  </div>
                </td>
              </tr>
            ) : (
              notifications.map((notification) => (
                <tr
                  key={notification.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {notification.subject}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {notification.email}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        notification.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : notification.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {notification.status === "sent"
                        ? "送信済み"
                        : notification.status === "failed"
                        ? "失敗"
                        : notification.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(notification.sentAt).toLocaleString("ja-JP")}
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
