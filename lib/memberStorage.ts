export interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = "app_members";

const seedMembers: Member[] = [
  { id: "1", name: "山田 太郎", role: "現場責任者", email: "yamada@example.co.jp", phone: "090-1234-5678" },
  { id: "2", name: "佐藤 次郎", role: "施工スタッフ", email: "sato@example.co.jp", phone: "090-2345-6789" },
  { id: "3", name: "鈴木 花子", role: "事務・経理", email: "suzuki@example.co.jp", phone: "090-3456-7890" },
];

export function getMembers(): Member[] {
  if (typeof window === "undefined") return seedMembers;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMembers));
    return seedMembers;
  }
  return JSON.parse(stored);
}

export function saveMember(member: Member): void {
  const members = getMembers();
  const idx = members.findIndex((m) => m.id === member.id);
  if (idx >= 0) members[idx] = member;
  else members.unshift(member);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function deleteMember(id: string): void {
  const members = getMembers().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}
