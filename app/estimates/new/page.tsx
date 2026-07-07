"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { StoredEstimate, EstimateLineItem, generateEstimateNo } from "@/lib/estimateStorage";

const CUSTOMERS = [
  { id: "1", name: "佐藤建設", email: "sato@sato-kensetsu.co.jp" },
  { id: "2", name: "田中商事", email: "tanaka@tanaka-shoji.co.jp" },
  { id: "3", name: "鈴木工業", email: "suzuki@suzuki-kogyo.co.jp" },
  { id: "4", name: "医療法人△△", email: "yamamoto@iryo-hojin.co.jp" },
  { id: "5", name: "△△市教育委員会", email: "ito@city-kyouiku.lg.jp" },
];

const CATEGORY_NAMES = [
  "空調機据付工事",
  "冷媒配管工事",
  "ダクト工事",
  "電気工事",
  "計装工事",
  "ドレン工事",
  "試運転調整",
  "経費・その他",
  "その他（自由入力）",
] as const;

type CategoryName = typeof CATEGORY_NAMES[number];

const PRESETS: Record<CategoryName, Array<{ name: string; unit: string; price: number }>> = {
  "空調機据付工事": [
    { name: "天井カセット型エアコン取付", unit: "台", price: 55000 },
    { name: "壁掛型エアコン取付", unit: "台", price: 35000 },
    { name: "床置型エアコン取付", unit: "台", price: 45000 },
    { name: "エアコン撤去処分", unit: "台", price: 25000 },
    { name: "既設機器養生", unit: "式", price: 15000 },
  ],
  "冷媒配管工事": [
    { name: "冷媒配管工事一式", unit: "式", price: 150000 },
    { name: "断熱材巻き", unit: "m", price: 1500 },
    { name: "冷媒フレア加工", unit: "箇所", price: 3000 },
    { name: "配管保温材", unit: "m", price: 800 },
  ],
  "ダクト工事": [
    { name: "スパイラルダクト施工", unit: "m", price: 3500 },
    { name: "角ダクト工事一式", unit: "式", price: 200000 },
    { name: "グリル・吹出口取付", unit: "箇所", price: 8000 },
    { name: "ダクト保温", unit: "m²", price: 4000 },
  ],
  "電気工事": [
    { name: "電気工事一式", unit: "式", price: 80000 },
    { name: "電源ケーブル配線", unit: "m", price: 2000 },
    { name: "分電盤工事", unit: "式", price: 120000 },
    { name: "アース工事", unit: "箇所", price: 15000 },
  ],
  "計装工事": [
    { name: "自動制御工事一式", unit: "式", price: 300000 },
    { name: "温度センサー取付", unit: "台", price: 20000 },
    { name: "制御盤製作・取付", unit: "面", price: 250000 },
  ],
  "ドレン工事": [
    { name: "ドレン配管工事一式", unit: "式", price: 50000 },
    { name: "ドレンホース配管", unit: "m", price: 1200 },
    { name: "ドレンポンプ取付", unit: "台", price: 18000 },
  ],
  "試運転調整": [
    { name: "試運転・調整費", unit: "式", price: 50000 },
    { name: "性能測定", unit: "式", price: 30000 },
    { name: "取扱説明", unit: "式", price: 20000 },
  ],
  "経費・その他": [
    { name: "諸経費", unit: "式", price: 50000 },
    { name: "交通費・旅費", unit: "式", price: 30000 },
    { name: "廃材処分費", unit: "式", price: 40000 },
    { name: "仮設工事", unit: "式", price: 60000 },
  ],
  "その他（自由入力）": [],
};

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface CategoryGroup {
  id: string;
  category: CategoryName;
  items: LineItem[];
  collapsed: boolean;
}

let _itemCounter = 0;
function newItem(description = "", unit = "式", unitPrice = 0): LineItem {
  return { id: `i${++_itemCounter}_${Date.now()}`, description, quantity: 1, unit, unitPrice };
}

const today = new Date().toISOString().slice(0, 10);

export default function NewEstimatePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [projectName, setProjectName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(today);
  const [validityDays, setValidityDays] = useState("30");
  const [paymentMethod, setPaymentMethod] = useState("銀行振込");
  const [notes, setNotes] = useState(
    "①本見積書には消費税は含まれておりません。\n②本見積書には法定福利費が含まれております。\n③その他、記述なき事項につきましては別途とさせて頂きます。"
  );
  const [discount, setDiscount] = useState(0);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [error, setError] = useState("");

  if (!user) { router.replace("/login"); return null; }

  const customer = CUSTOMERS.find((c) => c.id === customerId);

  const addCategory = (cat: CategoryName) => {
    setCategories((prev) => [
      ...prev,
      { id: `c${Date.now()}`, category: cat, items: [newItem()], collapsed: false },
    ]);
  };

  const removeCategory = (catId: string) =>
    setCategories((prev) => prev.filter((c) => c.id !== catId));

  const toggleCollapse = (catId: string) =>
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, collapsed: !c.collapsed } : c))
    );

  const togglePreset = (catId: string, preset: { name: string; unit: string; price: number }) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const exists = c.items.some((i) => i.description === preset.name);
        if (exists) {
          const items = c.items.filter((i) => i.description !== preset.name);
          return { ...c, items: items.length ? items : [newItem()] };
        }
        return { ...c, items: [...c.items, newItem(preset.name, preset.unit, preset.price)] };
      })
    );
  };

  const addBlankItem = (catId: string) =>
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, items: [...c.items, newItem()] } : c))
    );

  const removeItem = (catId: string, itemId: string) =>
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const items = c.items.filter((i) => i.id !== itemId);
        return { ...c, items: items.length ? items : [newItem()] };
      })
    );

  const updateItem = (catId: string, itemId: string, field: keyof LineItem, value: string | number) =>
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)) };
      })
    );

  const allItems = categories.flatMap((c) => c.items);
  const subtotal = allItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = Math.floor(discountedSubtotal * 0.1);
  const total = discountedSubtotal + taxAmount;

  const handlePreview = () => {
    setError("");
    if (!projectName) { setError("工事名を入力してください"); return; }
    if (!customerId) { setError("顧客を選択してください"); return; }
    if (categories.length === 0) { setError("工事項目を1つ以上追加してください"); return; }
    if (allItems.some((i) => !i.description)) { setError("品目名を入力してください"); return; }

    const flatItems: EstimateLineItem[] = allItems.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
    }));

    const draft: StoredEstimate = {
      id: `draft_${Date.now()}`,
      no: generateEstimateNo(),
      name: projectName,
      customerId,
      customerName: customer!.name,
      customerEmail: customer!.email,
      date,
      validityDays,
      paymentMethod,
      items: flatItems,
      notes,
      subtotal: discountedSubtotal,
      discount,
      taxAmount,
      total,
      status: "作成中",
    };
    localStorage.setItem("estimate_draft", JSON.stringify(draft));
    router.push("/estimates/preview");
  };

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-5 hover:underline text-sm">
          <ChevronLeft size={16} />戻る
        </button>
        <h1 className="text-xl font-bold text-gray-800 mb-5">見積作成</h1>

        <div className="space-y-4">
          {/* 基本情報 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm">基本情報</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">工事名 <span className="text-red-500">*</span></label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
                placeholder="例: 〇〇マンション空調工事"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">顧客 <span className="text-red-500">*</span></label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white">
                <option value="">顧客を選択</option>
                {CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {customer && <p className="text-xs text-gray-400 mt-1">メール: {customer.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">見積日</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">有効期間</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={validityDays} min={1}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                  <span className="text-sm text-gray-500 whitespace-nowrap">日間</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">お支払方法</label>
              <input type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
            </div>
          </section>

          {/* 工事項目 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700 text-sm">工事項目</h2>
              <div className="text-right">
                <p className="text-xs text-gray-400">小計</p>
                <p className="text-base font-bold text-gray-800">¥{subtotal.toLocaleString()}</p>
              </div>
            </div>

            {/* Category list */}
            <div className="space-y-3 mb-4">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
                    <button onClick={() => toggleCollapse(cat.id)} className="text-gray-400 hover:text-gray-600">
                      {cat.collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <span className="flex-1 text-sm font-medium text-gray-700">{cat.category}</span>
                    <span className="text-xs text-gray-400 mr-1">
                      ¥{cat.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toLocaleString()}
                    </span>
                    <button onClick={() => removeCategory(cat.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {!cat.collapsed && (
                    <div className="p-3 space-y-3">
                      {/* Preset chips */}
                      {PRESETS[cat.category].length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {PRESETS[cat.category].map((preset) => {
                            const active = cat.items.some((i) => i.description === preset.name);
                            return (
                              <button
                                key={preset.name}
                                onClick={() => togglePreset(cat.id, preset)}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                  active
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                                }`}
                              >
                                {active ? "✓ " : "+ "}{preset.name}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Line items table */}
                      <div className="space-y-1.5">
                        <div className="hidden sm:grid grid-cols-12 gap-1 text-xs text-gray-400 px-1">
                          <div className="col-span-5">品目名</div>
                          <div className="col-span-1 text-center">数量</div>
                          <div className="col-span-2 text-center">単位</div>
                          <div className="col-span-3 text-right">単価</div>
                          <div className="col-span-1" />
                        </div>
                        {cat.items.map((item) => (
                          <div key={item.id} className="grid grid-cols-12 gap-1 items-center">
                            <input type="text" value={item.description} placeholder="品目名"
                              onChange={(e) => updateItem(cat.id, item.id, "description", e.target.value)}
                              className="col-span-5 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-xs" />
                            <input type="number" value={item.quantity} min={1}
                              onChange={(e) => updateItem(cat.id, item.id, "quantity", Number(e.target.value))}
                              className="col-span-1 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-xs text-center" />
                            <input type="text" value={item.unit}
                              onChange={(e) => updateItem(cat.id, item.id, "unit", e.target.value)}
                              className="col-span-2 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-xs text-center" />
                            <input type="number" value={item.unitPrice} min={0}
                              onChange={(e) => updateItem(cat.id, item.id, "unitPrice", Number(e.target.value))}
                              className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-xs text-right" />
                            <button onClick={() => removeItem(cat.id, item.id)}
                              disabled={cat.items.length === 1}
                              className="col-span-1 flex justify-center text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addBlankItem(cat.id)}
                        className="flex items-center gap-1 text-blue-600 text-xs hover:underline">
                        <Plus size={12} />行を追加
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add category buttons */}
            <div>
              <p className="text-xs text-gray-500 mb-2">＋ 工事カテゴリを追加</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_NAMES.map((cat) => (
                  <button key={cat} onClick={() => addCategory(cat)}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 出精値引き・合計 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>小計</span><span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>出精値引き</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-xs">- ¥</span>
                  <input type="number" value={discount} min={0}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-28 px-2 py-1 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm text-right" />
                </div>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>消費税（10%）</span><span>¥{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t-2 border-gray-800">
                <span>合計金額</span><span>¥{total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* 備考 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 text-sm mb-2">備考</h2>
            <textarea value={notes} rows={4} onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs resize-none text-gray-600" />
          </section>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <button onClick={handlePreview}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-colors text-base">
            プレビューへ →
          </button>
        </div>
      </div>
    </AppShell>
  );
}
