import { DailySale, Invoice, Product } from "@/lib/types";

const PRODUCTS_KEY = "sales-book-pro-products";
const INVOICES_KEY = "sales-book-pro-invoices";
const DAILY_SALES_KEY = "sales-book-pro-daily-sales";

export function saveProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function loadProducts(): Product[] | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(PRODUCTS_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as Product[];
  } catch {
    return null;
  }
}

export function saveInvoices(invoices: Invoice[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function loadInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(INVOICES_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved) as Invoice[];
  } catch {
    return [];
  }
}

export function saveDailySales(sales: DailySale[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_SALES_KEY, JSON.stringify(sales));
}

export function loadDailySales(): DailySale[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(DAILY_SALES_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved) as DailySale[];
  } catch {
    return [];
  }
}