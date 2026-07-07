"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { StoredEstimate, EstimateLineItem, generateEstimateNo } from "@/lib/estimateStorage";

const customers = [
  { id: "1", name: "佐藤建設", email: "sato@sato-kensetsu.co.jp" },
  { id: "2", name: "田中商事", email: "tanaka@tanaka-shoji.co.jp" },
  { id: "3", name: "鈴木工業", email: "suzuki@suzuki-kogyo.co.jp" },
  { id: "4", name: "医療法人△△", email: "yamamoto@iryo-hojin.co.jp" },
  { id: "5", name: "△△市教育委員会", email: "ito@city-kyouiku.lg.jp" },
];

const today = new Date().toISOString().slice(0, 10);

export default function NewEstimatePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(today);
  const [items, setItems] = useState<EstimateLineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!user) { router.replace("/login"); return null; }

  const customer = customers.find((c) => c.id === customerId);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof EstimateLineItem, value: string | number) => {
    const next = [...items];
    (next[i] as Record<string, string | number>)[field] = value;
    setItems(next);
  };

  const subtotal = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.floor(subtotal * 0.1);
  const total = subtotal + taxAmount;

  const handlePreview = () => {
    setError("");
    if (!name) { setError("件名を入力してください"); return; }
    if (!customerId) { setError("顧客を選択してください"); return; }
    if (items.some((it) => !it.description)) { setError("明細の品目を入力してください"); return; }

    const draft: StoredEstimate = {
      id: `draft_${Date.now()}`,
      no: generateEstimateNo(),
      name,
      customerId,
      customerName: customer!.name,
      customerEmail: customer!.email,
      date,
      items,
      notes,
      subtotal,
      taxAmount,
      total,
      status: "作成中",
    };
    localStorage.setItem("estimate_draft", JSON.stringify(draft));
    router.push("/estimates/preview");
  };

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-6 hover:underline">
          <ChevronLeft size={18} />戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">見積作成</h1>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-700">基本情報</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">件名 <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 〇〇マンション空調工事" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">顧客 <span className="text-red-500">*</span></label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white">
                <option value="">顧客を選択</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {customer && <p className="text-xs text-gray-400 mt-1">メール: {customer.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">見積日</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">明細</h2>
            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 px-1">
                <div className="col-span-6">品目</div>
                <div className="col-span-2 text-right">数量</div>
                <div className="col-span-3 text-right">単価</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input type="text" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="品目" className="col-span-6 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} min={1} className="col-span-2 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm text-right" />
                  <input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))} min={0} className="col-span-3 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm text-right" />
                  <button onClick={() => removeItem(i)} disabled={items.length === 1} className="col-span-1 flex items-center justify-center text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-3 flex items-center gap-1 text-blue-600 text-sm hover:underline">
              <Plus size={16} />行を追加
            </button>
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>小計</span><span>¥{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>消費税（10%）</span><span>¥{taxAmount.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t border-gray-100"><span>合計</span><span>¥{total.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-3">備考</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="備考・特記事項" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none" />
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <button onClick={handlePreview} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-colors text-base">
            プレビューへ →
          </button>
        </div>
      </div>
    </AppShell>
  );
}
