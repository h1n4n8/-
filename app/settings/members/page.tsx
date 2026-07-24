"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, Plus, Pencil, Trash2, Save, X, UserRound } from "lucide-react";
import { Member, getMembers, saveMember, deleteMember } from "@/lib/memberStorage";

const emptyDraft = (): Member => ({ id: "", name: "", role: "", email: "", phone: "" });

export default function MemberSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Member>(emptyDraft());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    setMembers(getMembers());
  }, [user, router]);

  if (!user) return null;

  const startAdd = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setAdding(true);
  };

  const startEdit = (m: Member) => {
    setDraft(m);
    setAdding(false);
    setEditingId(m.id);
  };

  const cancel = () => {
    setAdding(false);
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const handleSave = () => {
    if (!draft.name.trim()) return;
    const toSave: Member = adding ? { ...draft, id: Date.now().toString() } : draft;
    saveMember(toSave);
    setMembers(getMembers());
    cancel();
  };

  const handleDelete = (id: string) => {
    deleteMember(id);
    setMembers(getMembers());
    if (editingId === id) cancel();
  };

  const formFields: { key: keyof Omit<Member, "id">; label: string; placeholder: string; type?: string }[] = [
    { key: "name", label: "氏名", placeholder: "山田 太郎" },
    { key: "role", label: "役職・担当", placeholder: "現場責任者" },
    { key: "email", label: "メールアドレス", placeholder: "info@example.co.jp", type: "email" },
    { key: "phone", label: "電話番号", placeholder: "090-0000-0000" },
  ];

  const renderForm = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 mb-4">
      {formFields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
          <input
            type={f.type ?? "text"}
            value={draft[f.key]}
            onChange={(e) => setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Save size={16} />
          保存
        </button>
        <button
          onClick={cancel}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <X size={16} />
          キャンセル
        </button>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.push("/settings")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="設定に戻る"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">メンバー設定</h1>
        </div>

        {adding && renderForm()}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {members.length === 0 && !adding ? (
            <div className="py-16 text-center text-gray-400 text-sm">メンバーが登録されていません</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {members.map((m) =>
                editingId === m.id ? (
                  <div key={m.id} className="p-6">{renderForm()}</div>
                ) : (
                  <div key={m.id} className="flex items-center px-6 py-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <UserRound size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{m.name}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                        {m.role && <span>{m.role}</span>}
                        {m.email && <span>{m.email}</span>}
                        {m.phone && <span>{m.phone}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                      <button
                        onClick={() => startEdit(m)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        aria-label="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {!adding && (
          <button
            onClick={startAdd}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} />
            メンバーを追加
          </button>
        )}
      </div>
    </AppShell>
  );
}
