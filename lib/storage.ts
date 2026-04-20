import { DailySale, Invoice, Product } from "@/lib/types";

const PRODUCTS_KEY = "sales-book-pro-products";
const INVOICES_KEY = "sales-book-pro-invoices";
const DAILY_SALES_KEY = "sales-book-pro-daily-sales";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const saved = localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function saveProducts(products: Product[]) {
  saveToStorage(PRODUCTS_KEY, products);
}

export function loadProducts(): Product[] {
  return loadFromStorage<Product[]>(PRODUCTS_KEY, []);
}

export function saveInvoices(invoices: Invoice[]) {
  saveToStorage(INVOICES_KEY, invoices);
}

export function loadInvoices(): Invoice[] {
  return loadFromStorage<Invoice[]>(INVOICES_KEY, []);
}

export function saveDailySales(sales: DailySale[]) {
  saveToStorage(DAILY_SALES_KEY, sales);
}

export function loadDailySales(): DailySale[] {
  return loadFromStorage<DailySale[]>(DAILY_SALES_KEY, []);
}