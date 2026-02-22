"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, X } from "lucide-react";

interface Condition {
  id: string;
  name: string;
  areas: string | null;
  propertyTypes: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minYield: number | null;
  maxYield: number | null;
  minBuildYear: number | null;
  maxBuildYear: number | null;
  ruleWeight: number;
  aiWeight: number;
  aiThreshold: number;
  notifyEmail: string | null;
  isActive: boolean;
  createdAt: string;
}

const PROPERTY_TYPE_OPTIONS = [
  "マンション",
  "アパート",
  "戸建",
  "土地",
  "ビル",
  "店舗",
  "その他",
];

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [areas, setAreas] = useState("");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYield, setMinYield] = useState("");
  const [maxYield, setMaxYield] = useState("");
  const [minBuildYear, setMinBuildYear] = useState("");
  const [maxBuildYear, setMaxBuildYear] = useState("");
  const [ruleWeight, setRuleWeight] = useState("0.6");
  const [aiWeight, setAiWeight] = useState("0.4");
  const [aiThreshold, setAiThreshold] = useState("0.5");
  const [notifyEmail, setNotifyEmail] = useState("");

  const fetchConditions = useCallback(async () => {
    try {
      const res = await fetch("/api/conditions");
      if (res.ok) {
        const data = await res.json();
        setConditions(data);
      }
    } catch (error) {
      console.error("条件の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConditions();
  }, [fetchConditions]);

  const resetForm = () => {
    setName("");
    setAreas("");
    setPropertyTypes([]);
    setMinPrice("");
    setMaxPrice("");
    setMinYield("");
    setMaxYield("");
    setMinBuildYear("");
    setMaxBuildYear("");
    setRuleWeight("0.6");
    setAiWeight("0.4");
    setAiThreshold("0.5");
    setNotifyEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          areas: areas || null,
          propertyTypes: propertyTypes.length > 0 ? propertyTypes.join(",") : null,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          minYield: minYield ? parseFloat(minYield) : null,
          maxYield: maxYield ? parseFloat(maxYield) : null,
          minBuildYear: minBuildYear ? parseInt(minBuildYear) : null,
          maxBuildYear: maxBuildYear ? parseInt(maxBuildYear) : null,
          ruleWeight: parseFloat(ruleWeight),
          aiWeight: parseFloat(aiWeight),
          aiThreshold: parseFloat(aiThreshold),
          notifyEmail: notifyEmail || null,
        }),
      });

      if (res.ok) {
        resetForm();
        setShowForm(false);
        fetchConditions();
      }
    } catch (error) {
      console.error("条件の作成に失敗しました:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この条件を削除しますか？")) return;

    try {
      const res = await fetch(`/api/conditions?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchConditions();
      }
    } catch (error) {
      console.error("条件の削除に失敗しました:", error);
    }
  };

  const handlePropertyTypeToggle = (type: string) => {
    setPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">検索条件管理</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-800">
              新しい検索条件
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  条件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：東京23区 一棟マンション"
                />
              </div>

              {/* Areas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  対象エリア（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={areas}
                  onChange={(e) => setAreas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：東京都,神奈川県,千葉県"
                />
              </div>

              {/* Property Types */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件種別
                </label>
                <div className="flex flex-wrap gap-3">
                  {PROPERTY_TYPE_OPTIONS.map((type) => (
                    <label
                      key={type}
                      className="inline-flex items-center gap-1.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={propertyTypes.includes(type)}
                        onChange={() => handlePropertyTypeToggle(type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最低価格（円）
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：10000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最高価格（円）
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：100000000"
                />
              </div>

              {/* Yield range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最低利回り（%）
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={minYield}
                  onChange={(e) => setMinYield(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：5.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最高利回り（%）
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={maxYield}
                  onChange={(e) => setMaxYield(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：15.0"
                />
              </div>

              {/* Build year range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最小築年（年）
                </label>
                <input
                  type="number"
                  value={minBuildYear}
                  onChange={(e) => setMinBuildYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：1990"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大築年（年）
                </label>
                <input
                  type="number"
                  value={maxBuildYear}
                  onChange={(e) => setMaxBuildYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：2020"
                />
              </div>

              {/* Weights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ルール重み
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={ruleWeight}
                  onChange={(e) => setRuleWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI重み
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={aiWeight}
                  onChange={(e) => setAiWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* AI Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AIしきい値
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={aiThreshold}
                  onChange={(e) => setAiThreshold(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notify email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  通知メールアドレス
                </label>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：user@example.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                作成
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conditions table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                条件名
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                エリア
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                物件種別
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                価格帯
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                利回り
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                重み(R/AI)
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                作成日
              </th>
              <th className="text-center px-6 py-3 font-medium text-gray-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {conditions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  検索条件がありません
                </td>
              </tr>
            ) : (
              conditions.map((condition) => (
                <tr
                  key={condition.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {condition.name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {condition.areas ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {condition.propertyTypes ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {condition.minPrice || condition.maxPrice
                      ? `${
                          condition.minPrice
                            ? (condition.minPrice / 10000).toLocaleString()
                            : "0"
                        } ~ ${
                          condition.maxPrice
                            ? (condition.maxPrice / 10000).toLocaleString()
                            : "-"
                        }万円`
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {condition.minYield || condition.maxYield
                      ? `${condition.minYield ?? "-"} ~ ${
                          condition.maxYield ?? "-"
                        }%`
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {condition.ruleWeight}/{condition.aiWeight}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(condition.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleDelete(condition.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
