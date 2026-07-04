"use client";

import { Plus } from "lucide-react";

interface FabButtonProps {
  onClick?: () => void;
}

export default function FabButton({ onClick }: FabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-5 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40"
      aria-label="新規追加"
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
}
