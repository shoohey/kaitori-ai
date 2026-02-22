"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";

const SCRAPE_SOURCES = [
  { key: "suumo", label: "SUUMO" },
  { key: "homes", label: "HOME'S" },
  { key: "rakumachi", label: "楽待" },
  { key: "kenbiya", label: "健美家" },
  { key: "reins", label: "REINS" },
];

interface SettingsMap {
  [key: string]: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [notificationEmail, setNotificationEmail] = useState("");
  const [cronInterval, setCronInterval] = useState("");
  const [scrapeSources, setScrapeSources] = useState<string[]>([]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data: SettingsMap = await res.json();
        setSettings(data);
        setNotificationEmail(data["NOTIFICATION_EMAIL"] ?? "");
        setCronInterval(data["CRON_INTERVAL"] ?? "");
        const sources = data["SCRAPE_SOURCES"];
        if (sources) {
          setScrapeSources(sources.split(",").filter(Boolean));
        }
      }
    } catch (error) {
      console.error("設定の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSourceToggle = (source: string) => {
    setScrapeSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NOTIFICATION_EMAIL: notificationEmail,
          CRON_INTERVAL: cronInterval,
          SCRAPE_SOURCES: scrapeSources.join(","),
        }),
      });

      if (res.ok) {
        setMessage("設定を保存しました");
        fetchSettings();
      } else {
        setMessage("設定の保存に失敗しました");
      }
    } catch (error) {
      console.error("設定の保存に失敗しました:", error);
      setMessage("設定の保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">設定</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Notification email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通知メールアドレス
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：admin@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              マッチ通知のデフォルト送信先メールアドレス
            </p>
          </div>

          {/* Cron interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              実行間隔（cron式）
            </label>
            <input
              type="text"
              value={cronInterval}
              onChange={(e) => setCronInterval(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：0 */6 * * *（6時間ごと）"
            />
            <p className="mt-1 text-xs text-gray-500">
              スクレイピング・マッチング処理の実行間隔をcron式で指定
            </p>
          </div>

          {/* Scrape sources */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スクレイピング対象サイト
            </label>
            <div className="flex flex-wrap gap-4">
              {SCRAPE_SOURCES.map((source) => (
                <label
                  key={source.key}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={scrapeSources.includes(source.key)}
                    onChange={() => handleSourceToggle(source.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {source.label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              有効にするスクレイピング対象サイトを選択
            </p>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              保存
            </button>

            {message && (
              <span
                className={`text-sm ${
                  message.includes("失敗")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
