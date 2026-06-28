"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const events = [
  { date: "2024-06-05", title: "〇〇マンション現場確認", type: "工事" },
  { date: "2024-06-10", title: "△△ビル打ち合わせ", type: "会議" },
  { date: "2024-06-15", title: "□□工場竣工検査", type: "検査" },
  { date: "2024-06-20", title: "顧客訪問 田中商事", type: "訪問" },
  { date: "2024-06-25", title: "□□工場完工", type: "工事" },
];

const typeColor: Record<string, string> = {
  工事: "bg-blue-100 text-blue-700",
  会議: "bg-purple-100 text-purple-700",
  検査: "bg-green-100 text-green-700",
  訪問: "bg-amber-100 text-amber-700",
};

export default function CalendarPage() {
  const { user } = useAuth();
  const router = useRouter();

  const today = new Date(2024, 5, 1); // June 2024
  const [current, setCurrent] = useState(today);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getEvents = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">カレンダー</h1>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <h2 className="font-semibold text-gray-800 text-lg">
              {year}年 {month + 1}月
            </h2>
            <button
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-50">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center py-2 text-xs font-medium ${
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayEvents = day ? getEvents(day) : [];
              const isToday = day === 1 && month === today.getMonth() && year === today.getFullYear();
              const col = i % 7;
              return (
                <div
                  key={i}
                  className={`min-h-[80px] md:min-h-[100px] p-1.5 border-b border-r border-gray-50 ${
                    day ? "cursor-pointer hover:bg-gray-50" : ""
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-sm font-medium inline-flex w-7 h-7 items-center justify-center rounded-full ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : col === 0
                            ? "text-red-500"
                            : col === 6
                            ? "text-blue-500"
                            : "text-gray-700"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.map((ev, ei) => (
                          <div
                            key={ei}
                            className={`text-xs px-1.5 py-0.5 rounded-md truncate hidden sm:block ${typeColor[ev.type]}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto sm:hidden" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event list */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">今月のスケジュール</h3>
          <div className="space-y-2">
            {events.map((ev, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white rounded-xl px-5 py-3.5 border border-gray-100 shadow-sm"
              >
                <span className="text-sm text-gray-500 w-20 flex-shrink-0">{ev.date.slice(5)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${typeColor[ev.type]}`}>
                  {ev.type}
                </span>
                <span className="text-sm font-medium text-gray-700 truncate">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
