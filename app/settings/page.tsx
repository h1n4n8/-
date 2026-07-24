"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { Building2, LogOut, Save, Check, Users, ChevronRight } from "lucide-react";
import { CompanyInfo, getCompanyInfo, saveCompanyInfo } from "@/lib/companyStorage";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [info, setInfo] = useState<CompanyInfo>({ name: "", postalCode: "", address: "", tel: "", fax: "", email: "", personInCharge: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    setInfo(getCompanyInfo());
  }, [user, router]);

  if (!user) return null;

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveCompanyInfo(info);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const fields: { key: keyof CompanyInfo; label: string; placeholder: string; type?: string }[] = [
    { key: "name", label: "会社名", placeholder: "株式会社〇〇設備" },
    { key: "postalCode", label: "郵便番号", placeholder: "000-0000" },
    { key: "address", label: "住所", placeholder: "東京都〇〇区〇〇1-2-3" },
    { key: "tel", label: "電話番号", placeholder: "03-0000-0000" },
    { key: "fax", label: "FAX番号", placeholder: "03-0000-0001" },
    { key: "email", label: "メールアドレス", placeholder: "info@example.co.jp", type: "email" },
    { key: "personInCharge", label: "担当者名", placeholder: "山田 太郎" },
  ];

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{user.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-lg">{user.name}</p>
              <p className="text-sm text-gray-500">{user.companyName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-50 text-blue-600 font-mono font-medium px-2 py-0.5 rounded-lg border border-blue-100">
                  {user.companyCode}
                </span>
                <span className="text-xs text-gray-400">会社コード</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info Form */}
        <div className="mb-4">
          <div className="flex items-center gap-2 px-1 mb-2">
            <Building2 size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">会社情報</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input
                  type={f.type ?? "text"}
                  value={info[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
              </div>
            ))}
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {saved ? <><Check size={16} />保存しました</> : <><Save size={16} />会社情報を保存</>}
            </button>
          </div>
        </div>

        {/* Member Settings */}
        <div className="mb-4">
          <div className="flex items-center gap-2 px-1 mb-2">
            <Users size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">メンバー</p>
          </div>
          <button
            onClick={() => router.push("/settings/members")}
            className="w-full flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800 text-sm">メンバー設定</p>
              <p className="text-xs text-gray-400 mt-0.5">所属メンバーの登録・編集</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-medium rounded-2xl transition-colors mt-4"
        >
          <LogOut size={18} />
          ログアウト
        </button>

        <p className="text-center text-xs text-gray-300 mt-8">Version 1.0.0</p>
      </div>
    </AppShell>
  );
}
