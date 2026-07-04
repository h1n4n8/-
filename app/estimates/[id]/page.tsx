"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, User, Calendar, Banknote, Hash } from "lucide-react";

const estimates = [
  { id: "1", no: "EST-2024-001", name: "〇〇マンション空調工事", customer: "佐藤建設", amount: "¥1,200,000", status: "確定", date: "2024-06-01", note: "各階空調機全台入れ替え。親機室外機ともに交換。" },
  { id: "2", no: "EST-2024-002", name: "△△ビル電気設備改修", customer: "田中商事", amount: "¥850,000", status: "未確定", date: "2024-06-10", note: "分電盤及び照明設備。最終確認待ち。" },
  { id: "3", no: "EST-2024-003", name: "□□工場配管工事", customer: "鈴木工業", amount: "¥2,100,000", status: "確定", date: "2024-06-03", note: "冷却水配管・給水配管。工場棟の全面更新。" },
  { id: "4", no: "EST-2024-004", name: "◇◇病院給排水改修", customer: "医療法人△△", amount: "¥3,400,000", status: "未確定", date: "2024-06-12", note: "給排水設備全面改修。医療基準への対応が必要。" },
  { id: "5", no: "EST-2024-005", name: "○○学校空調設備", customer: "△△市教育委員会", amount: "¥5,600,000", status: "作成中", date: "2024-06-18", note: "全指空調新設。夏休み工事のため期間指定あり。" },
];

const statusColor: Record<string, string> = {
  確定: "bg-green-100 text-green-700",
  未確定: "bg-amber-100 text-amber-700",
  作成中: "bg-gray-100 text-gray-600",
};

export default function EstimateDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const estimate = estimates.find((e) => e.id === params.id);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;
  if (!estimate) return (
    <AppShell>
      <div className="px-6 py-8 text-center text-gray-400">見積が見つかりません</div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-6 hover:underline">
          <ChevronLeft size={18} />戻る
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[estimate.status]}`}>{estimate.status}</span>
          <h1 className="text-xl font-bold text-gray-800">{estimate.name}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 mb-4">
          <div className="flex items-center gap-4 px-6 py-4">
            <Hash size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">見積番号</p>
              <p className="text-sm font-medium text-gray-800">{estimate.no}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <User size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">顧客</p>
              <p className="text-sm font-medium text-gray-800">{estimate.customer}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <Calendar size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">作成日</p>
              <p className="text-sm font-medium text-gray-800">{estimate.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <Banknote size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">金額</p>
              <p className="text-sm font-semibold text-gray-800">{estimate.amount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-6">
          <p className="text-xs text-gray-400 mb-1">備考</p>
          <p className="text-sm text-gray-700 leading-relaxed">{estimate.note}</p>
        </div>

        <a
          href="https://h1n4n8.github.io/mitumori/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-colors"
        >
          見積書を作成・編集する
        </a>
      </div>
    </AppShell>
  );
}
