// Local mirror of the future `quote_items` Supabase table. Holds the
// item/unit-price patterns a company accumulates, either typed in manually
// or extracted by AI from an uploaded past-quote Excel file. Swapping this
// module's implementation for Supabase reads/writes later should not
// require changes in callers, since the shape matches the DB schema.

export interface StoredQuoteItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  unitPrice: number;
  usageCount: number;
  source: "manual" | "ai_import";
}

const STORAGE_KEY = "app_quote_items";

export function getQuoteItems(): StoredQuoteItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addQuoteItems(items: Omit<StoredQuoteItem, "id" | "usageCount" | "source">[]): void {
  const existing = getQuoteItems();
  const merged = [...existing];
  for (const item of items) {
    const dup = merged.find((m) => m.name === item.name && m.category === item.category);
    if (dup) {
      dup.unitPrice = item.unitPrice;
      dup.unit = item.unit;
      continue;
    }
    merged.push({
      id: `qi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      category: item.category,
      name: item.name,
      unit: item.unit,
      unitPrice: item.unitPrice,
      usageCount: 0,
      source: "ai_import",
    });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function bumpUsage(name: string, category: string): void {
  const items = getQuoteItems();
  const item = items.find((i) => i.name === name && i.category === category);
  if (item) {
    item.usageCount += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export function getQuoteItemsByCategory(category: string): StoredQuoteItem[] {
  return getQuoteItems()
    .filter((i) => i.category === category)
    .sort((a, b) => b.usageCount - a.usageCount);
}
