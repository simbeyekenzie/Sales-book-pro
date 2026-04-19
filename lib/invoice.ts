import { loadInvoices } from "@/lib/storage";

export function generateInvoiceNumber() {
  const invoices = loadInvoices();
  const nextNumber = invoices.length + 1;
  return `INV-${String(nextNumber).padStart(4, "0")}`;
}