"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, Phone, User, Calendar, FolderOpen } from "lucide-react";

const customers = [
  { id: "1", name: "佐藤建設株式会社", contact: "佐藤一郎", phone: "03-1234-5678", projects: 3, lastContact: "2024-06-01", address: "東京都港区港南　1-1-1", note: "居住系建設会社。主にマンションの空調工事を依頼。" },
  { id: "2", name: "田中商事", contact: "田中花子", phone: "06-2345-6789", projects: 1, lastContact: "2024-06-10", address: "大阪府大阪市北区梅田　2-2-2", note: "商業ビルの紹介が多い。迷惑なく連絡をくれる担当者。" },
  { id: "3", name: "鈴木工業株式会社", contact: "鈴木次郎", phone: "052-3456-7890", projects: 2, lastContact: "2024-05-20", address: "愛知県名古屋市中区栄　3-3-3", note: "工場・工業施設の配管工事を専門に依頼。" },
  { id: "4", name: "医療法人△△", contact: "山本三郎", phone: "011-4567-8901", projects: 1, lastContact: "2024-06-15", address: "北海道札幌市中央区大通　4-4-4", note: "医療施設向けの工事。許可備考が多いので注意。" },
  { id: "5", name: "△△市教育委員会", contact: "伊藤四郎", phone: "0120-567-890", projects: 1, lastContact: "2024-06-18", address: "北海道△△市大通　5-5-5", note: "公共施設。発注には議会承認が必要な場合あり。" },
];

export default function CustomerDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const customer = customers.find((c) => c.id === params.id);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;
  if (!customer) return (
    <AppShell>
      <div className="px-6 py-8 text-center text-gray-400">顧客が見つかりません</div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-6 hover:underline">
          <ChevronLeft size={18} />戻る
        </button>

        <h1 className="text-xl font-bold text-gray-800 mb-6">{customer.name}</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 mb-4">
          <div className="flex items-center gap-4 px-6 py-4">
            <User size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">担当者</p>
              <p className="text-sm font-medium text-gray-800">{customer.contact}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <Phone size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">電話番号</p>
              <a href={`tel:${customer.phone}`} className="text-sm font-medium text-blue-600">{customer.phone}</a>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <FolderOpen size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">案件数</p>
              <p className="text-sm font-medium text-gray-800">{customer.projects}件</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <Calendar size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">最終連絡日</p>
              <p className="text-sm font-medium text-gray-800">{customer.lastContact}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
          <p className="text-xs text-gray-400 mb-1">備考</p>
          <p className="text-sm text-gray-700 leading-relaxed">{customer.note}</p>
        </div>
      </div>
    </AppShell>
  );
}
