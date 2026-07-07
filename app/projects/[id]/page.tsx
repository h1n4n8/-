"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, Check, Car, Users, Wrench, Package, FileText, ChevronDown, ChevronUp } from "lucide-react";
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

const paymentStatusColor: Record<string, string> = {
  未入金: "bg-red-100 text-red-700",
  一部入金: "bg-amber-100 text-amber-700",
  入金済み: "bg-green-100 text-green-700",
};

function profitRate(contract?: number, cost?: number): string {
  if (!contract || !cost || contract === 0) return "—";
  return ((1 - cost / contract) * 100).toFixed(1) + "%";
}

function fmt(n?: number): string {
  if (n === undefined || n === null) return "—";
  if (n === 0) return "未設定";
  return "¥" + n.toLocaleString();
}

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [p, setP] = useState<StoredProject | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StoredProject | null>(null);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    const proj = getProject(params.id as string);
    if (proj) { setP(proj); setDraft(proj); }
  }, [user, router, params.id]);

  if (!user || !p || !draft) return null;

  const handleStatusChange = (status: StoredProject["status"]) => {
    const updated = { ...p, status };
    saveProject(updated);
    setP(updated);
    setDraft(updated);
  };

  const handleMilestoneToggle = (i: number) => {
    const milestones = [...(draft.milestones ?? [])];
    milestones[i] = { ...milestones[i], completed: !milestones[i].completed };
    const completedCount = milestones.filter((m) => m.completed).length;
    const pct = Math.round((completedCount / milestones.length) * 100);
    const lastCompleted = [...milestones].reverse().find((m) => m.completed);
    const updated = { ...p, milestones, progressPercent: pct, progressNote: lastCompleted?.label ?? "" };
    saveProject(updated);
    setP(updated);
    setDraft(updated);
  };

  const set = (field: keyof StoredProject, value: StoredProject[keyof StoredProject]) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = () => {
    if (!draft) return;
    saveProject(draft);
    setP(draft);
    setEditing(false);
  };

  const profit = p.contractAmount && p.costAmount && p.contractAmount > 0
    ? p.contractAmount - p.costAmount
    : undefined;

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 hover:underline">
            <ChevronLeft size={18} />戻る
          </button>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => { setDraft(p); setEditing(false); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm">キャンセル</button>
              <button onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">保存</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">編集</button>
          )}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-2 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 overflow-x-auto">
          <span className="text-xs font-medium text-gray-500 flex-shrink-0">ステータス:</span>
          {statusOptions.map((s) => (
            <button key={s} onClick={() => handleStatusChange(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                p.status === s ? statusStyles[s] : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-start gap-3">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${statusColorBadge[p.status]}`}>
              {p.status}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">{p.no} · {p.customer}</p>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">{p.name}</h1>
            </div>
          </div>
        </div>

        {/* Main Grid: Timeline | Finance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Left: Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">進行タイムライン</h2>

            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500">進捗</span>
                <span className="text-sm font-bold text-blue-600">{p.progressPercent ?? 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${p.progressPercent ?? 0}%` }}
                />
              </div>
              {p.progressNote && (
                <p className="text-xs text-gray-500 mt-1">▶ {p.progressNote}</p>
              )}
            </div>

            {/* Milestones */}
            {(p.milestones ?? []).length > 0 && (
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
                <div className="space-y-0">
                  {(p.milestones ?? []).map((m, i) => (
                    <div key={i} className="flex items-start gap-3 relative pb-4 last:pb-0">
                      <button
                        onClick={() => handleMilestoneToggle(i)}
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 transition-colors ${
                          m.completed
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {m.completed && <Check size={12} />}
                      </button>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-sm font-medium ${m.completed ? "text-gray-800" : "text-gray-400"}`}>
                          {m.label}
                        </p>
                        <p className="text-xs text-gray-400">{m.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">開始日</p>
                <p className="font-medium text-gray-700">{p.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">完了予定日</p>
                <p className="font-medium text-gray-700">{p.endDate}</p>
              </div>
            </div>
          </div>

          {/* Right: Finance */}
          <div className="flex flex-col gap-4">
            {/* Finance Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">金額・入金情報</h2>

              {/* Payment Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500">入金状況</span>
                {editing ? (
                  <select
                    value={draft.paymentStatus ?? "未入金"}
                    onChange={(e) => set("paymentStatus", e.target.value as StoredProject["paymentStatus"])}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                  >
                    <option>未入金</option>
                    <option>一部入金</option>
                    <option>入金済み</option>
                  </select>
                ) : (
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${paymentStatusColor[p.paymentStatus ?? "未入金"]}`}>
                    {p.paymentStatus ?? "未入金"}
                  </span>
                )}
              </div>

              {editing && (
                <div className="mb-4">
                  <label className="text-xs text-gray-400">入金日</label>
                  <input type="date" value={draft.paymentDate ?? ""} onChange={(e) => set("paymentDate", e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none" />
                </div>
              )}
              {!editing && p.paymentDate && (
                <p className="text-xs text-gray-500 mb-4">入金日: {p.paymentDate}</p>
              )}

              <div className="space-y-3">
                {[
                  { label: "見積金額", field: "estimateAmount" as const, value: p.estimateAmount },
                  { label: "契約金額", field: "contractAmount" as const, value: p.contractAmount },
                  { label: "原価", field: "costAmount" as const, value: p.costAmount },
                ].map(({ label, field, value }) => (
                  <div key={field} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{label}</span>
                    {editing ? (
                      <input
                        type="number"
                        value={(draft[field] as number) ?? ""}
                        onChange={(e) => set(field, e.target.value ? Number(e.target.value) : 0)}
                        placeholder="0"
                        className="w-36 text-right text-sm border border-gray-200 rounded-xl px-3 py-1 outline-none"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-700">{fmt(value)}</span>
                    )}
                  </div>
                ))}

                <div className="pt-3 border-t border-gray-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">粗利益</span>
                    <span className={`text-sm font-bold ${profit !== undefined && profit >= 0 ? "text-blue-600" : "text-red-500"}`}>
                      {profit !== undefined ? fmt(profit) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">利益率</span>
                    <span className={`text-sm font-bold ${
                      p.contractAmount && p.costAmount && p.contractAmount > 0
                        ? ((1 - p.costAmount / p.contractAmount) * 100) >= 20 ? "text-green-600" : "text-amber-600"
                        : "text-gray-400"
                    }`}>
                      {profitRate(p.contractAmount, p.costAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">作業情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle & Workers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car size={15} className="text-gray-400" />
                  <span className="text-sm text-gray-600">車の手配</span>
                </div>
                {editing ? (
                  <button onClick={() => set("vehicleArranged", !draft.vehicleArranged)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      draft.vehicleArranged ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                    {draft.vehicleArranged ? "済み" : "未手配"}
                  </button>
                ) : (
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    p.vehicleArranged ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>
                    {p.vehicleArranged ? "手配済み" : "未手配"}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-gray-400" />
                  <span className="text-sm text-gray-600">必要人数</span>
                </div>
                {editing ? (
                  <input type="number" min={1} value={draft.requiredWorkers ?? ""}
                    onChange={(e) => set("requiredWorkers", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-20 text-right text-sm border border-gray-200 rounded-xl px-3 py-1 outline-none"
                    placeholder="0"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-700">
                    {p.requiredWorkers ? `${p.requiredWorkers}名` : "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Work Content */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Wrench size={15} className="text-gray-400" />
                <span className="text-sm text-gray-600">工事内容</span>
              </div>
              {editing ? (
                <textarea value={draft.workContent ?? ""} onChange={(e) => set("workContent", e.target.value)}
                  rows={3} placeholder="工事内容を入力"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none resize-none" />
              ) : (
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2 min-h-[60px]">
                  {p.workContent || "—"}
                </p>
              )}
            </div>

            {/* Items to Carry */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Package size={15} className="text-gray-400" />
                <span className="text-sm text-gray-600">現場に持って行くもの</span>
              </div>
              {editing ? (
                <textarea value={draft.itemsToCarry ?? ""} onChange={(e) => set("itemsToCarry", e.target.value)}
                  rows={3} placeholder="持ち物リストを入力"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none resize-none" />
              ) : (
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2 min-h-[60px] whitespace-pre-wrap">
                  {p.itemsToCarry || "—"}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <FileText size={15} className="text-gray-400" />
                <span className="text-sm text-gray-600">その他メモ</span>
              </div>
              {editing ? (
                <textarea value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
                  rows={3} placeholder="メモを入力"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none resize-none" />
              ) : (
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2 min-h-[60px] whitespace-pre-wrap">
                  {p.notes || "—"}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
