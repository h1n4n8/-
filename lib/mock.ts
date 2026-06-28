import { Company, User } from "./types";

export const mockCompanies: Company[] = [
  {
    id: "1",
    code: "EQ001",
    name: "山田設備工事株式会社",
    createdAt: "2024-01-01",
  },
];

export const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    companyId: "1",
    companyCode: "EQ001",
    companyName: "山田設備工事株式会社",
    name: "山田太郎",
    password: "password123",
  },
];

export function generateCompanyCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return `EQ${random}`;
}

export function findUser(
  companyCode: string,
  name: string,
  password: string
): User | null {
  const user = mockUsers.find(
    (u) =>
      u.companyCode === companyCode &&
      u.name === name &&
      u.password === password
  );
  if (!user) return null;
  const { password: _, ...rest } = user;
  return rest;
}
