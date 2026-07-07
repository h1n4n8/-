"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { Search, Filter, ChevronRight } from "lucide-react";
import { StoredProject, getProjects } from "@/lib/projectStorage";

const statusColor: Record<string, string> = {
  進行中: "bg-blue-100 text-blue-700",
  見積中: "bg-amber-100 text-amber-700",
  完了: "bg-green-100 text-green-700",
  受注: "bg-purple-100 text-purple-700",
};

const tabs = ["すべて", "進行中", "見積中", "受注", "完了"];

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [activeTab, setActiveTab] = useState("すべて");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    setProjects(getProjects());
  }, [user, router]);

  if (!user) return null;

  const filtered = projects.filter((p) => {
    const matchTab = activeTab === "すべて" || p.status === activeTab;
    const matchSearch = !search || p.name.includes(search) || p.customer.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">案件</h1>

        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="案件名・顧客名で検索"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
            />
          </div>
          <button className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">案件が見つかりませんでした</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusColor[p.status]}`}>
                        {p.status}
                      </span>
                      <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{p.customer}</span>
                      <span>{p.startDate} 〜 {p.endDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm font-semibold text-gray-700">{p.amount}</span>
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
