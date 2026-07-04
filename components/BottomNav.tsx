"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Calendar, Users, FileText, Settings } from "lucide-react";

const navItems = [
  { label: "ホーム", href: "/home", icon: Home },
  { label: "案件", href: "/projects", icon: FolderOpen },
  { label: "カレンダー", href: "/calendar", icon: Calendar },
  { label: "顧客", href: "/customers", icon: Users },
  { label: "見積", href: "/estimates", icon: FileText },
  { label: "設定", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${active ? "text-blue-600" : "text-gray-400"}`}>
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
