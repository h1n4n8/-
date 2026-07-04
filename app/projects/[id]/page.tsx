"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, Calendar, User, Banknote, ClipboardList } from "lucide-react";

const projects = [
  { id: "1", name: "〇〇マンション空調工事", status: "進行中", customer: "佐藤建設", startDate: "2024-06-01", endDate: "2024-06-30", amount: "¥1,200,000", note: "各階の空調機全台入れ替え。居住者入居しながらの工事になるため駒音配慮が必要。" },
  { id: "2", name: "△△ビル電気設備改修", status: "見積中", customer: "田中商事", startDate: "2024-07-05", endDate: "2024-07-20", amount: "¥850,000", note: "分電盤及び照明設備の全面改修。" },
  { id: "3", name: "□□工場配管工事", status: "完了", customer: "鈴木工業", startDate: "2024-06-01", endDate: "2024-06-20", amount: "¥2,100,000", note: "冷却水配管・給水配管の全面的な更新。" },
  { id: "4", name: "◇◇病院給排水改修", status: "進行中", customer: "医療法人△△", startDate: "2024-06-15", endDate: "2024-07-15", amount: "¥3,400,000", note: "医療施設向け給排水設備の改修。危険物資材の扱いに注意。" },
  { id: "5", name: "○○学校空調設備", status: "受注", customer: "△△市教育委員会", startDate: "2024-07-20", endDate: "2024-08-31", amount: "¥5,600,000", note: "学校全指の空調設備新設。夏休み期間中に完了する必要あり。" },
];

const statusColor: Record<string, string> = {
  進行中: "bg-blue-100 text-blue-700",
  見積中: "bg-amber-100 text-amber-700",
  完了: "bg-green-100 text-green-700",
  受注: "bg-purple-100 text-purple-700",
};

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const project = projects.find((p) => p.id === params.id);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;
  if (!project) return (
    <AppShell>
      <div className="px-6 py-8 text-center text-gray-400">案件が見つかりません</div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-6 hover:underline">
          <ChevronLeft size={18} />戻る
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[project.status]}`}>{project.status}</span>
          <h1 className="text-xl font-bold text-gray-800">{project.name}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          <div className="flex items-center gap-4 px-6 py-4">
            <User size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">顧客</p>
              <p className="text-sm font-medium text-gray-800">{project.customer}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <Calendar size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">工期</p>
              <p className="text-sm font-medium text-gray-800">{project.startDate} 〜 {project.endDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <Banknote size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">金額</p>
              <p className="text-sm font-semibold text-gray-800">{project.amount}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 px-6 py-4">
            <ClipboardList size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">備考</p>
              <p className="text-sm text-gray-700 leading-relaxed">{project.note}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
