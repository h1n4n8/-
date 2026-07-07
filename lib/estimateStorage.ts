export interface EstimateLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface StoredEstimate {
  id: string;
  no: string;
  name: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  items: EstimateLineItem[];
  notes: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: "作成中" | "未確定" | "確定";
}

const STORAGE_KEY = "app_estimates";

const seedEstimates: StoredEstimate[] = [
  {
    id: "1", no: "EST-2024-001", name: "〇〇マンション空調工事",
    customerId: "1", customerName: "佐藤建設", customerEmail: "sato@sato-kensetsu.co.jp",
    date: "2024-06-01",
    items: [{ description: "空調機入れ替え工事", quantity: 1, unitPrice: 1090909 }],
    notes: "", subtotal: 1090909, taxAmount: 109091, total: 1200000, status: "確定",
  },
  {
    id: "2", no: "EST-2024-002", name: "△△ビル電気設備改修",
    customerId: "2", customerName: "田中商事", customerEmail: "tanaka@tanaka-shoji.co.jp",
    date: "2024-06-10",
    items: [{ description: "分電盤・照明設備改修", quantity: 1, unitPrice: 772727 }],
    notes: "", subtotal: 772727, taxAmount: 77273, total: 850000, status: "未確定",
  },
  {
    id: "3", no: "EST-2024-003", name: "□□工場配管工事",
    customerId: "3", customerName: "鈴木工業", customerEmail: "suzuki@suzuki-kogyo.co.jp",
    date: "2024-06-03",
    items: [{ description: "配管工事一式", quantity: 1, unitPrice: 1909091 }],
    notes: "", subtotal: 1909091, taxAmount: 190909, total: 2100000, status: "確定",
  },
  {
    id: "4", no: "EST-2024-004", name: "◇◇病院給排水改修",
    customerId: "4", customerName: "医療法人△△", customerEmail: "yamamoto@iryo-hojin.co.jp",
    date: "2024-06-12",
    items: [{ description: "給排水設備全面改修", quantity: 1, unitPrice: 3090909 }],
    notes: "", subtotal: 3090909, taxAmount: 309091, total: 3400000, status: "未確定",
  },
  {
    id: "5", no: "EST-2024-005", name: "○○学校空調設備",
    customerId: "5", customerName: "△△市教育委員会", customerEmail: "ito@city-kyouiku.lg.jp",
    date: "2024-06-18",
    items: [{ description: "空調設備新設工事", quantity: 1, unitPrice: 5090909 }],
    notes: "", subtotal: 5090909, taxAmount: 509091, total: 5600000, status: "作成中",
  },
];

export function getEstimates(): StoredEstimate[] {
  if (typeof window === "undefined") return seedEstimates;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEstimates));
    return seedEstimates;
  }
  return JSON.parse(stored);
}

export function getEstimate(id: string): StoredEstimate | null {
  return getEstimates().find((e) => e.id === id) ?? null;
}

export function saveEstimate(estimate: StoredEstimate): void {
  const estimates = getEstimates();
  const idx = estimates.findIndex((e) => e.id === estimate.id);
  if (idx >= 0) {
    estimates[idx] = estimate;
  } else {
    estimates.unshift(estimate);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
}

export function generateEstimateNo(): string {
  const estimates = getEstimates();
  return `EST-2024-${String(estimates.length + 1).padStart(3, "0")}`;
}
