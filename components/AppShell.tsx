"use client";

import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import FabButton from "./FabButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-60 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
      <FabButton />
    </div>
  );
}
