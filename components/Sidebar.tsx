"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Calendar, Users, FileText, Settings, LogOut, HardHat } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "ホーム", href: "/home", icon: Home },
  { label: "案件", href: "/projects", icon: FolderOpen },
  { label: "カレンダー", href: "/calendar", icon: Calendar },
  { label: "顧客", href: "/customers", icon: Users },
  { label: "見積", href: "/estimates", icon: FileText },
  { label: "設定", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 fixed top-0 left-0 z-30">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <HardHat size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 truncate">{user?.companyName}</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-6">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={20} />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
