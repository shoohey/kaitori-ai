"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  area: string | null;
  address: string | null;
  propertyType: string | null;
  structure: string | null;
  buildYear: number | null;
  landArea: number | null;
  buildingArea: number | null;
  purchasePrice: number | null;
  renovationCost: number | null;
  salePrice: number | null;
  profitRate: number | null;
  description: string | null;
  dealDate: string | null;
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

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [structure, setStructure] = useState("");
  const [buildYear, setBuildYear] = useState("");
  const [landArea, setLandArea] = useState("");
  const [buildingArea, setBuildingArea] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [renovationCost, setRenovationCost] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [dealDate, setDealDate] = useState("");

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch("/api/deals");
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch (error) {
      console.error("取引の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const resetForm = () => {
    setTitle("");
    setArea("");
    setAddress("");
    setPropertyType("");
    setStructure("");
    setBuildYear("");
    setLandArea("");
    setBuildingArea("");
    setPurchasePrice("");
    setRenovationCost("");
    setSalePrice("");
    setDescription("");
    setDealDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          area: area || null,
          address: address || null,
          propertyType: propertyType || null,
          structure: structure || null,
          buildYear: buildYear ? parseInt(buildYear) : null,
          landArea: landArea ? parseFloat(landArea) : null,
          buildingArea: buildingArea ? parseFloat(buildingArea) : null,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
          renovationCost: renovationCost ? parseFloat(renovationCost) : null,
          salePrice: salePrice ? parseFloat(salePrice) : null,
          description: description || null,
          dealDate: dealDate ? new Date(dealDate).toISOString() : null,
        }),
      });

      if (res.ok) {
        resetForm();
        setShowForm(false);
        fetchDeals();
      }
    } catch (error) {
      console.error("取引の登録に失敗しました:", error);
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">過去取引管理</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規登録
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-800">
              新しい取引を登録
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
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：渋谷区 一棟マンション"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  エリア
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：東京都渋谷区"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：渋谷区神南1-2-3"
                />
              </div>

              {/* Property type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件種別
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {PROPERTY_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Structure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  構造
                </label>
                <select
                  value={structure}
                  onChange={(e) => setStructure(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="RC">RC</option>
                  <option value="SRC">SRC</option>
                  <option value="S">S</option>
                  <option value="木造">木造</option>
                  <option value="軽量鉄骨">軽量鉄骨</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              {/* Build year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  築年
                </label>
                <input
                  type="number"
                  value={buildYear}
                  onChange={(e) => setBuildYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：2005"
                />
              </div>

              {/* Land area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  土地面積（m²）
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：150.5"
                />
              </div>

              {/* Building area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  建物面積（m²）
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buildingArea}
                  onChange={(e) => setBuildingArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：300.0"
                />
              </div>

              {/* Purchase price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  購入価格（円）
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：50000000"
                />
              </div>

              {/* Renovation cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  リフォーム費用（円）
                </label>
                <input
                  type="number"
                  value={renovationCost}
                  onChange={(e) => setRenovationCost(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：5000000"
                />
              </div>

              {/* Sale price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  売却価格（円）
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：70000000"
                />
              </div>

              {/* Deal date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取引日
                </label>
                <input
                  type="date"
                  value={dealDate}
                  onChange={(e) => setDealDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="取引に関するメモ"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                登録
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

      {/* Deals table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                購入価格(万円)
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                売却価格(万円)
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                利益率(%)
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                取引日
              </th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  取引データがありません
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {deal.title}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {deal.area ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-800">
                    {deal.purchasePrice
                      ? (deal.purchasePrice / 10000).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-800">
                    {deal.salePrice
                      ? (deal.salePrice / 10000).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {deal.profitRate !== null ? (
                      <span
                        className={`font-medium ${
                          deal.profitRate >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {deal.profitRate.toFixed(1)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {deal.dealDate
                      ? new Date(deal.dealDate).toLocaleDateString("ja-JP")
                      : "-"}
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
