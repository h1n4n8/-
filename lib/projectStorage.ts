export interface StoredProject {
  id: string;
  name: string;
  status: "進行中" | "見積中" | "受注" | "完了";
  customer: string;
  startDate: string;
  endDate: string;
  amount: string;
}

const STORAGE_KEY = "app_projects";

const seedProjects: StoredProject[] = [
  { id: "1", name: "〇〇マンション空調工事", status: "進行中", customer: "佐藤建設", startDate: "2024-06-01", endDate: "2024-06-30", amount: "¥1,200,000" },
  { id: "2", name: "△△ビル電気設備改修", status: "見積中", customer: "田中商事", startDate: "2024-07-05", endDate: "2024-07-20", amount: "¥850,000" },
  { id: "3", name: "□□工場配管工事", status: "完了", customer: "鈴木工業", startDate: "2024-06-01", endDate: "2024-06-20", amount: "¥2,100,000" },
  { id: "4", name: "◇◇病院給排水改修", status: "進行中", customer: "医療法人△△", startDate: "2024-06-15", endDate: "2024-07-15", amount: "¥3,400,000" },
  { id: "5", name: "○○学校空調設備", status: "受注", customer: "△△市教育委員会", startDate: "2024-07-20", endDate: "2024-08-31", amount: "¥5,600,000" },
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
