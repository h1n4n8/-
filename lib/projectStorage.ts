export interface ProjectMilestone {
  label: string;
  date: string;
  completed: boolean;
}

export interface StoredProject {
  id: string;
  no: string;
  name: string;
  status: "進行中" | "見積中" | "受注" | "完了";
  customer: string;
  startDate: string;
  endDate: string;
  amount: string;

  // Financial
  estimateAmount?: number;
  contractAmount?: number;
  costAmount?: number;
  paymentStatus?: "未入金" | "一部入金" | "入金済み";
  paymentDate?: string;

  // Progress
  progressPercent?: number;
  progressNote?: string;
  milestones?: ProjectMilestone[];

  // Work details
  vehicleArranged?: boolean;
  requiredWorkers?: number;
  workContent?: string;
  itemsToCarry?: string;
  notes?: string;
}

const STORAGE_KEY = "app_projects";

const seedProjects: StoredProject[] = [
  {
    id: "1", no: "PRJ-2024-001", name: "〇〇マンション空調工事", status: "進行中",
    customer: "佐藤建設", startDate: "2024-06-01", endDate: "2024-06-30", amount: "¥1,200,000",
    estimateAmount: 1200000, contractAmount: 1200000, costAmount: 850000,
    paymentStatus: "未入金",
    progressPercent: 60, progressNote: "冷媒配管工事完了",
    milestones: [
      { label: "受注", date: "2024-05-25", completed: true },
      { label: "着工", date: "2024-06-01", completed: true },
      { label: "配管工事", date: "2024-06-10", completed: true },
      { label: "機器据付", date: "2024-06-20", completed: false },
      { label: "試運転・完了", date: "2024-06-30", completed: false },
    ],
    vehicleArranged: true, requiredWorkers: 3,
    workContent: "天井カセット型エアコン取付4台、冷媒配管工事一式",
    itemsToCarry: "エアコン本体×4、配管材料、工具セット、脇立",
    notes: "",
  },
  {
    id: "2", no: "PRJ-2024-002", name: "△△ビル電気設備改修", status: "見積中",
    customer: "田中商事", startDate: "2024-07-05", endDate: "2024-07-20", amount: "¥850,000",
    estimateAmount: 850000, contractAmount: 0, costAmount: 0,
    paymentStatus: "未入金",
    progressPercent: 0, progressNote: "",
    milestones: [
      { label: "受注", date: "2024-07-01", completed: false },
      { label: "着工", date: "2024-07-05", completed: false },
      { label: "工事完了", date: "2024-07-20", completed: false },
    ],
    vehicleArranged: false, requiredWorkers: 2,
    workContent: "分電盤工事、電気工事一式",
    itemsToCarry: "", notes: "",
  },
  {
    id: "3", no: "PRJ-2024-003", name: "□□工場配管工事", status: "完了",
    customer: "鈴木工業", startDate: "2024-06-01", endDate: "2024-06-20", amount: "¥2,100,000",
    estimateAmount: 2100000, contractAmount: 2100000, costAmount: 1400000,
    paymentStatus: "入金済み", paymentDate: "2024-07-10",
    progressPercent: 100, progressNote: "完了",
    milestones: [
      { label: "受注", date: "2024-05-28", completed: true },
      { label: "着工", date: "2024-06-01", completed: true },
      { label: "配管工事", date: "2024-06-10", completed: true },
      { label: "検査・完了", date: "2024-06-20", completed: true },
    ],
    vehicleArranged: true, requiredWorkers: 4,
    workContent: "ドレン配管工事一式、ダクト工事一式",
    itemsToCarry: "配管材料一式、ダクト材料、溢接機",
    notes: "完了検査済み",
  },
  {
    id: "4", no: "PRJ-2024-004", name: "◇◇病院給排水改修", status: "進行中",
    customer: "医療法人△△", startDate: "2024-06-15", endDate: "2024-07-15", amount: "¥3,400,000",
    estimateAmount: 3400000, contractAmount: 3400000, costAmount: 2200000,
    paymentStatus: "一部入金",
    progressPercent: 35, progressNote: "既存設備撤去完了",
    milestones: [
      { label: "受注", date: "2024-06-10", completed: true },
      { label: "着工", date: "2024-06-15", completed: true },
      { label: "既存撤去", date: "2024-06-25", completed: true },
      { label: "新設工事", date: "2024-07-05", completed: false },
      { label: "検査・完了", date: "2024-07-15", completed: false },
    ],
    vehicleArranged: true, requiredWorkers: 5,
    workContent: "給排水設備全面改修",
    itemsToCarry: "給排水管材料一式、工具セット、養生シート",
    notes: "病院内作業のため防塵・防音対策必須",
  },
  {
    id: "5", no: "PRJ-2024-005", name: "○○学校空調設備", status: "受注",
    customer: "△△市教育委員会", startDate: "2024-07-20", endDate: "2024-08-31", amount: "¥5,600,000",
    estimateAmount: 5600000, contractAmount: 5600000, costAmount: 3800000,
    paymentStatus: "未入金",
    progressPercent: 0, progressNote: "",
    milestones: [
      { label: "受注", date: "2024-07-15", completed: true },
      { label: "着工", date: "2024-07-20", completed: false },
      { label: "機器搬入", date: "2024-08-01", completed: false },
      { label: "据付工事", date: "2024-08-15", completed: false },
      { label: "試運転・完了", date: "2024-08-31", completed: false },
    ],
    vehicleArranged: false, requiredWorkers: 6,
    workContent: "空調設備新設工事",
    itemsToCarry: "", notes: "夏休み期間中の施工",
  },
];

export function getProjects(): StoredProject[] {
  if (typeof window === "undefined") return seedProjects;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProjects));
    return seedProjects;
  }
  return JSON.parse(stored);
}

export function getProject(id: string): StoredProject | null {
  return getProjects().find((p) => p.id === id) ?? null;
}

export function saveProject(project: StoredProject): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
