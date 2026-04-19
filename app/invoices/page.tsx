"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
import { useProducts } from "@/components/ProductsProvider";
import {
  loadDailySales,
  loadInvoices,
  saveDailySales,
  saveInvoices,
} from "@/lib/storage";
import { exportDailySalesCSV, exportInvoicesCSV } from "@/lib/export";
import { Invoice } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function InvoicesPage() {
  const { products, setProducts } = useProducts();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editItems, setEditItems] = useState<Invoice["items"]>([]);

  useEffect(() => {
    setInvoices(loadInvoices());
  }, []);

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return invoices;

    return invoices.filter((invoice) => {
      return (
        invoice.id.toLowerCase().includes(term) ||
        invoice.customerName.toLowerCase().includes(term) ||
        invoice.customerPhone.toLowerCase().includes(term)
      );
    });
  }, [invoices, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportInvoices = () => {
    const allInvoices = loadInvoices();

    if (allInvoices.length === 0) {
      window.alert("No invoices available to export.");
      return;
    }

    exportInvoicesCSV(allInvoices);
  };

  const handleExportDailySales = () => {
    const allDailySales = loadDailySales();

    if (allDailySales.length === 0) {
      window.alert("No daily sales available to export.");
      return;
    }

    exportDailySalesCSV(allDailySales);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setSelectedInvoice(null);
    setEditCustomerName(invoice.customerName);
    setEditCustomerPhone(invoice.customerPhone);
    setEditItems(invoice.items);
  };

  const handleEditItemQuantity = (index: number, value: string) => {
    const qty = Number(value);

    if (isNaN(qty) || qty < 0) return;

    setEditItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: qty,
              lineTotal: qty * item.unitPrice,
            }
          : item
      )
    );
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditedInvoice = () => {
    if (!editingInvoice) return;

    if (!editCustomerName.trim()) {
      window.alert("Customer name required");
      return;
    }

    if (editItems.length === 0) {
      window.alert("Invoice must have at least one item");
      return;
    }

    let updatedProducts = products.map((product) => {
      const oldItems = editingInvoice.items.filter(
        (item) => item.productId === product.id
      );

      const restoreQty = oldItems.reduce((sum, i) => sum + i.quantity, 0);

      return restoreQty > 0
        ? { ...product, quantity: product.quantity + restoreQty }
        : product;
    });

    for (const product of updatedProducts) {
      const newItems = editItems.filter((item) => item.productId === product.id);
      const deductQty = newItems.reduce((sum, i) => sum + i.quantity, 0);

      if (product.quantity < deductQty) {
        window.alert(
          `Not enough stock for ${product.name}. Edit exceeds available stock.`
        );
        return;
      }
    }

    updatedProducts = updatedProducts.map((product) => {
      const newItems = editItems.filter((item) => item.productId === product.id);
      const deductQty = newItems.reduce((sum, i) => sum + i.quantity, 0);

      return deductQty > 0
        ? { ...product, quantity: product.quantity - deductQty }
        : product;
    });

    setProducts(updatedProducts);

    const newTotal = editItems.reduce((sum, i) => sum + i.lineTotal, 0);

    const newProfit = editItems.reduce(
      (sum, i) => sum + (i.unitPrice - i.costPrice) * i.quantity,
      0
    );

    const updatedInvoice: Invoice = {
      ...editingInvoice,
      customerName: editCustomerName,
      customerPhone: editCustomerPhone,
      items: editItems,
      total: newTotal,
      profit: newProfit,
    };

    const updatedInvoices = loadInvoices().map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    saveInvoices(updatedInvoices);

    const updatedSales = loadDailySales().map((sale) =>
      sale.invoiceId === updatedInvoice.id
        ? {
            ...sale,
            customerName: editCustomerName,
            customerPhone: editCustomerPhone,
            total: newTotal,
            profit: newProfit,
          }
        : sale
    );
    saveDailySales(updatedSales);

    setInvoices(updatedInvoices);
    setEditingInvoice(null);

    window.alert("Invoice updated successfully");
  };

  const handleDeleteInvoice = (invoiceToDelete: Invoice) => {
    const confirmed = window.confirm(
      `Delete invoice ${invoiceToDelete.id}? This will restore the sold stock.`
    );

    if (!confirmed) return;

    const restoredProducts = products.map((product) => {
      const matchingItems = invoiceToDelete.items.filter(
        (item) => item.productId === product.id
      );

      const totalToRestore = matchingItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return totalToRestore > 0
        ? { ...product, quantity: product.quantity + totalToRestore }
        : product;
    });

    setProducts(restoredProducts);

    const updatedInvoices = loadInvoices().filter(
      (invoice) => invoice.id !== invoiceToDelete.id
    );
    saveInvoices(updatedInvoices);

    const updatedDailySales = loadDailySales().filter(
      (sale) => sale.invoiceId !== invoiceToDelete.id
    );
    saveDailySales(updatedDailySales);

    if (selectedInvoice?.id === invoiceToDelete.id) {
      setSelectedInvoice(null);
    }

    if (editingInvoice?.id === invoiceToDelete.id) {
      setEditingInvoice(null);
    }

    setInvoices(updatedInvoices);

    window.alert(
      `Invoice ${invoiceToDelete.id} deleted and stock restored successfully.`
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 print:bg-white print:pb-0">
      <div className="print:hidden">
        <AppHeader />
      </div>

      <section className="mx-auto max-w-md px-4 py-5 print:max-w-2xl">
        <div className="print:hidden">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Invoices
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View, search, print, edit, delete, and export saved invoices.
            </p>
          </div>

          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <input
              type="text"
              placeholder="Search by invoice number, customer, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleExportInvoices}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white"
            >
              Export Invoices
            </button>

            <button
              onClick={handleExportDailySales}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
            >
              Export Daily Sales
            </button>
          </div>

          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">No matching invoices found.</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <article
                  key={invoice.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {invoice.id}
                      </h3>
                      <p className="text-sm text-slate-500">{invoice.date}</p>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                    >
                      View
                    </button>
                  </div>

                  <div className="mt-4 space-y-1 text-sm">
                    <p className="text-slate-700">
                      <span className="font-medium">Customer:</span>{" "}
                      {invoice.customerName}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium">Phone:</span>{" "}
                      {invoice.customerPhone}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium">Items:</span>{" "}
                      {invoice.items.length}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {selectedInvoice && (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 print:mt-0 print:rounded-none print:shadow-none print:ring-0">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Janus Enterprises Ltd
                </h1>
                <p className="mt-1 text-sm text-slate-500">Sales Invoice</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">Invoice No</p>
                <p className="font-semibold text-slate-900">
                  {selectedInvoice.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-slate-500">Customer Name</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedInvoice.customerName}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Phone</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedInvoice.customerPhone}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Date</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedInvoice.date}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Items</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedInvoice.items.length}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-slate-200">
              <div className="grid grid-cols-4 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                <div>Item</div>
                <div>Qty</div>
                <div>Price</div>
                <div className="text-right">Total</div>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {selectedInvoice.items.map((item, index) => (
                  <div
                    key={`${selectedInvoice.id}-${index}`}
                    className="grid grid-cols-4 px-4 py-3 text-sm text-slate-700"
                  >
                    <div>{item.name}</div>
                    <div>
                      {item.quantity} {item.unit}
                    </div>
                    <div>{formatCurrency(item.unitPrice)}</div>
                    <div className="text-right font-medium text-slate-900">
                      {formatCurrency(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 ml-auto max-w-xs space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(selectedInvoice.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
              >
                Print Invoice
              </button>

              <button
                onClick={() => handleEditInvoice(selectedInvoice)}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
              >
                Edit Invoice
              </button>

              <button
                onClick={() => handleDeleteInvoice(selectedInvoice)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white"
              >
                Delete Invoice
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {editingInvoice && (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Edit Invoice {editingInvoice.id}
            </h3>

            <div className="space-y-3">
              <input
                value={editCustomerName}
                onChange={(e) => setEditCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Customer name"
              />

              <input
                value={editCustomerPhone}
                onChange={(e) => setEditCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Phone"
              />
            </div>

            <div className="mt-4 space-y-3">
              {editItems.map((item, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <button
                      onClick={() => handleRemoveEditItem(index)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleEditItemQuantity(index, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-2"
                  />

                  <p className="mt-1 text-sm text-slate-500">
                    Total: {formatCurrency(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSaveEditedInvoice}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-white"
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditingInvoice(null)}
                className="flex-1 rounded-xl bg-slate-200 px-4 py-3 text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="print:hidden">
        <BottomTabs />
      </div>
    </main>
  );
} 