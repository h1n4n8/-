export interface Company {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string;
  companyCode: string;
  companyName: string;
  name: string;
}

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};
