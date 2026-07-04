"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { Search, ChevronRight, FileText, Plus } from "lucide-react";

const estimates = [
  { id: "1", no: "EST-2024-001", name: "〇〇マンション空調工事", customer: "佐藤建設", amount: "¥1,200,000", status: "確定", date: "2024-06-01" },
  { id: "2", no: "EST-2024-002", name: "△△ビル電気設備改修", customer: "田中商事", amount: "¥850,000", status: "未確定", date: "2024-06-10" },
  { id: "3", no: "EST-2024-003", name: "□□工場配管工事", customer: "鈴木工業", amount: "¥2,100,000", status: "確定", date: "2024-06-03" },
  { id: "4", no: "EST-2024-004", name: "◇◇病院給排水改修", customer: "医療法人△△", amount: "¥3,400,000", status: "未確定", date: "2024-06-12" },
  { id: "5", no: "EST-2024-005", name: "○○学校空調設備", customer: "△△市教育委員会", amount: "¥5,600,000", status: "作成中", date: "2024-06-18" },
];

const statusColor: Record<string, string> = {
  確定: "bg-green-100 text-green-700",
  未確定: "bg-amber-100 text-amber-700",
  作成中: "bg-gray-100 text-gray-600",
};

const tabs = ["すべて", "作成中", "未確定", "確定"];

export default function EstimatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("すべて");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const filtered = estimates.filter((e) => {
    const matchTab = activeTab === "すべて" || e.status === activeTab;
    const matchSearch = !search || e.name.includes(search) || e.customer.includes(search);
    return matchTab && matchSearch;
  });

  const total = filtered.reduce((sum, e) => sum + parseInt(e.amount.replace(/[¥,]/g, "")), 0);

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">見積</h1>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
              <p className="text-xs text-blue-500">合計金額</p>
              <p className="text-lg font-bold text-blue-700">¥{total.toLocaleString()}</p>
            </div>
            <a
              href="https://h1n4n8.github.io/mitumori/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={16} />新規作成
            </a>
          </div>
        </div>
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="案件名・顧客名で検索" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>{tab}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">見積が見つかりませんでした</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((e) => (
                <div
                  key={e.id}
                  onClick={() => router.push(`/estimates/${e.id}`)}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                    <FileText size={18} className="text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[e.status]}`}>{e.status}</span>
                      <p className="font-medium text-gray-800 text-sm truncate">{e.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{e.no}</span><span>{e.customer}</span><span>{e.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-semibold text-gray-700">{e.amount}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
