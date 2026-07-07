export interface CompanyInfo {
  name: string;
  postalCode: string;
  address: string;
  tel: string;
  fax: string;
  email: string;
  personInCharge: string;
}

const STORAGE_KEY = "app_company_info";

export function getCompanyInfo(): CompanyInfo {
  if (typeof window === "undefined") return emptyCompanyInfo();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : emptyCompanyInfo();
}

export function saveCompanyInfo(info: CompanyInfo): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

function emptyCompanyInfo(): CompanyInfo {
  return { name: "", postalCode: "", address: "", tel: "", fax: "", email: "", personInCharge: "" };
}
