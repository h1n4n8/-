"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { Search, ChevronRight, Building2, Phone } from "lucide-react";

const customers = [
  { id: "1", name: "佐藤建設株式会社", contact: "佐藤一郎", phone: "03-1234-5678", projects: 3, lastContact: "2024-06-01" },
  { id: "2", name: "田中商事", contact: "田中花子", phone: "06-2345-6789", projects: 1, lastContact: "2024-06-10" },
  { id: "3", name: "鈴木工業株式会社", contact: "鈴木次郎", phone: "052-3456-7890", projects: 2, lastContact: "2024-05-20" },
  { id: "4", name: "医療法人△△", contact: "山本三郎", phone: "011-4567-8901", projects: 1, lastContact: "2024-06-15" },
  { id: "5", name: "△△市教育委員会", contact: "伊藤四郎", phone: "0120-567-890", projects: 1, lastContact: "2024-06-18" },
];

export default function CustomersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const filtered = customers.filter((c) => !search || c.name.includes(search) || c.contact.includes(search));

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">顧客</h1>
        <div className="relative mb-5">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="会社名・担当者名で検索" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">顧客が見つかりませんでした</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => router.push(`/customers/${c.id}`)}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                    <Building2 size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{c.name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-0.5">
                      <span>{c.contact}</span>
                      <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-gray-400 hidden sm:block">案件 {c.projects}件</span>
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
