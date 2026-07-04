"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { User, Building2, Bell, Shield, ChevronRight, LogOut } from "lucide-react";

const settingGroups = [
  {
    title: "アカウント",
    items: [
      { icon: User, label: "プロフィール設定", desc: "名前・パスワードの変更" },
      { icon: Building2, label: "会社情報", desc: "会社名・会社コードの確認" },
    ],
  },
  {
    title: "通知",
    items: [{ icon: Bell, label: "通知設定", desc: "プッシュ通知・メール通知の管理" }],
  },
  {
    title: "セキュリティ",
    items: [{ icon: Shield, label: "セキュリティ設定", desc: "ログイン履歴・デバイス管理" }],
  },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{user.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-lg">{user.name}</p>
              <p className="text-sm text-gray-500">{user.companyName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-50 text-blue-600 font-mono font-medium px-2 py-0.5 rounded-lg border border-blue-100">{user.companyCode}</span>
                <span className="text-xs text-gray-400">会社コード</span>
              </div>
            </div>
          </div>
        </div>
        {settingGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">{group.title}</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {group.items.map((item, i) => (
                <button key={item.label} className={`w-full flex items-center px-5 py-4 hover:bg-gray-50 transition-colors text-left ${i > 0 ? "border-t border-gray-50" : ""}`}>
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <item.icon size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-medium rounded-2xl transition-colors mt-4">
          <LogOut size={18} />
          ログアウト
        </button>
        <p className="text-center text-xs text-gray-300 mt-8">Version 1.0.0</p>
      </div>
    </AppShell>
  );
}
