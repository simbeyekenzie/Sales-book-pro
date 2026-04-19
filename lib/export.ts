import { DailySale, Invoice } from "@/lib/types";

function escapeCSV(value: string | number) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportInvoicesCSV(invoices: Invoice[]) {
  const headers = [
    "Invoice ID",
    "Date",
    "Customer Name",
    "Customer Phone",
    "Item Name",
    "Quantity",
    "Unit",
    "Unit Price",
    "Line Total",
    "Invoice Total",
  ];

  const rows: string[] = [headers.map(escapeCSV).join(",")];

  invoices.forEach((invoice) => {
    invoice.items.forEach((item) => {
      rows.push(
        [
          invoice.id,
          invoice.date,
          invoice.customerName,
          invoice.customerPhone,
          item.name,
          item.quantity,
          item.unit,
          item.unitPrice,
          item.lineTotal,
          invoice.total,
        ]
          .map(escapeCSV)
          .join(",")
      );
    });
  });

  downloadCSV("sales-book-pro-invoices.csv", rows.join("\n"));
}

export function exportDailySalesCSV(dailySales: DailySale[]) {
  const headers = [
    "Invoice ID",
    "Date",
    "Customer Name",
    "Customer Phone",
    "Total Sales",
    "Profit",
  ];

  const rows: string[] = [headers.map(escapeCSV).join(",")];

  dailySales.forEach((sale) => {
    rows.push(
      [
        sale.invoiceId,
        sale.date,
        sale.customerName,
        sale.customerPhone,
        sale.total,
        sale.profit,
      ]
        .map(escapeCSV)
        .join(",")
    );
  });

  downloadCSV("sales-book-pro-daily-sales.csv", rows.join("\n"));
}