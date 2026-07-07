"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft } from "lucide-react";
import { StoredProject, getProject, saveProject } from "@/lib/projectStorage";

const statusOptions: StoredProject["status"][] = ["見積中", "受注", "進行中", "完了"];

const statusStyles: Record<string, string> = {
  進行中: "bg-blue-600 text-white border-transparent",
  見積中: "bg-amber-500 text-white border-transparent",
  完了: "bg-green-600 text-white border-transparent",
  受注: "bg-purple-600 text-white border-transparent",
};

const statusColorBadge: Record<string, string> = {
  進行中: "bg-blue-100 text-blue-700",
  見積中: "bg-amber-100 text-amber-700",
  完了: "bg-green-100 text-green-700",
  受注: "bg-purple-100 text-purple-700",
};

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<StoredProject | null>(null);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    const p = getProject(params.id as string);
    if (p) setProject(p);
  }, [user, router, params.id]);

  if (!user || !project) return null;

  const handleStatusChange = (status: StoredProject["status"]) => {
    const updated = { ...project, status };
    saveProject(updated);
    setProject(updated);
  };

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 hover:underline mb-6">
          <ChevronLeft size={18} />戻る
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColorBadge[project.status]}`}>
                {project.status}
              </span>
              <h1 className="text-xl font-bold text-gray-800 mt-2">{project.name}</h1>
            </div>
            <span className="text-lg font-bold text-gray-700">{project.amount}</span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">顧客</span>
              <span>{project.customer}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">期間</span>
              <span>{project.startDate} 〜 {project.endDate}</span>
            </div>
          </div>
        </div>

        {/* Status Change */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-600 mb-3">進行状況を変更</p>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  project.status === s
                    ? statusStyles[s]
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
