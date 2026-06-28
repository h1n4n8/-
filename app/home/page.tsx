"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import {
  FolderOpen,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";

const stats = [
  { label: "進行中案件", value: "12", icon: FolderOpen, color: "bg-blue-500" },
  { label: "今月の予定", value: "8", icon: Calendar, color: "bg-purple-500" },
  { label: "顧客数", value: "34", icon: Users, color: "bg-green-500" },
  { label: "未確定見積", value: "5", icon: FileText, color: "bg-amber-500" },
];

const recentProjects = [
  { id: "1", name: "〇〇マンション空調工事", status: "進行中", date: "2024-06-30", customer: "佐藤建設" },
  { id: "2", name: "△△ビル電気設備改修", status: "見積中", date: "2024-07-05", customer: "田中商事" },
  { id: "3", name: "□□工場配管工事", status: "完了", date: "2024-06-20", customer: "鈴木工業" },
];

const statusColor: Record<string, string> = {
  進行中: "bg-blue-100 text-blue-700",
  見積中: "bg-amber-100 text-amber-700",
  完了: "bg-green-100 text-green-700",
};

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm">{user.companyName}</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-0.5">
            こんにちは、{user.name}さん
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div
                className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <h2 className="font-semibold text-gray-700">最近の案件</h2>
            </div>
            <button
              onClick={() => router.push("/projects")}
              className="text-sm text-blue-600 hover:underline"
            >
              すべて見る
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.customer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[p.status]}`}>
                    {p.status}
                  </span>
                  <span className="text-xs text-gray-400">{p.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700">期限が近い案件があります</p>
            <p className="text-xs text-amber-600 mt-0.5">
              「〇〇マンション空調工事」の工期終了まで5日です
            </p>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { label: "案件を追加", icon: FolderOpen, href: "/projects", color: "text-blue-600 bg-blue-50" },
            { label: "見積を作成", icon: TrendingUp, href: "/estimates", color: "text-purple-600 bg-purple-50" },
          ].map(({ label, icon: Icon, href, color }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-shadow`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <span className="font-medium text-gray-700 text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
