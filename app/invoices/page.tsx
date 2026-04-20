"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
import AppToast from "@/components/AppToast";
import AppModal from "@/components/AppModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useProducts } from "@/components/ProductsProvider";
import {
  loadDailySales,
  loadInvoices,
  saveDailySales,
  saveInvoices,
} from "@/lib/storage";
import { exportDailySalesCSV, exportInvoicesCSV } from "@/lib/export";
import { Invoice } from "@/lib/types";

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
};

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
  const [hasLoadedInvoices, setHasLoadedInvoices] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editItems, setEditItems] = useState<Invoice["items"]>([]);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    type: "info",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ open: true, message, type });
  };

  useEffect(() => {
    if (!toast.open) return;

    const timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2400);

    return () => clearTimeout(timeout);
  }, [toast.open]);

  useEffect(() => {
    const savedInvoices = loadInvoices();
    setInvoices(savedInvoices);
    setHasLoadedInvoices(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedInvoices) return;
    saveInvoices(invoices);
  }, [invoices, hasLoadedInvoices]);

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
    if (invoices.length === 0) {
      showToast("No invoices available to export.", "error");
      return;
    }

    exportInvoicesCSV(invoices);
    showToast("Invoices exported successfully.", "success");
  };

  const handleExportDailySales = () => {
    const allDailySales = loadDailySales();

    if (allDailySales.length === 0) {
      showToast("No daily sales available to export.", "error");
      return;
    }

    exportDailySalesCSV(allDailySales);
    showToast("Daily sales exported successfully.", "success");
  };

  const handleOpenInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setSelectedInvoice(null);
    setEditCustomerName(invoice.customerName);
    setEditCustomerPhone(invoice.customerPhone);
    setEditItems(invoice.items);
  };

  const handleCloseEditModal = () => {
    setEditingInvoice(null);
    setEditCustomerName("");
    setEditCustomerPhone("");
    setEditItems([]);
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
    const removed = editItems[index];
    setEditItems((prev) => prev.filter((_, i) => i !== index));

    if (removed) {
      showToast(`${removed.name} removed from invoice.`, "info");
    }
  };

  const handleSaveEditedInvoice = () => {
    if (!editingInvoice) return;

    if (!editCustomerName.trim()) {
      showToast("Customer name required.", "error");
      return;
    }

    if (!editCustomerPhone.trim()) {
      showToast("Customer phone required.", "error");
      return;
    }

    if (editItems.length === 0) {
      showToast("Invoice must have at least one item.", "error");
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
        showToast(
          `Not enough stock for ${product.name}. Edit exceeds available stock.`,
          "error"
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
      customerName: editCustomerName.trim(),
      customerPhone: editCustomerPhone.trim(),
      items: editItems,
      total: newTotal,
      profit: newProfit,
    };

    const updatedInvoices = invoices.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );

    setInvoices(updatedInvoices);

    const updatedSales = loadDailySales().map((sale) =>
      sale.invoiceId === updatedInvoice.id
        ? {
            ...sale,
            customerName: editCustomerName.trim(),
            customerPhone: editCustomerPhone.trim(),
            total: newTotal,
            profit: newProfit,
          }
        : sale
    );

    saveDailySales(updatedSales);

    handleCloseEditModal();
    showToast("Invoice updated successfully.", "success");
  };

  const handleAskDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setSelectedInvoice(null);
  };

  const handleConfirmDeleteInvoice = () => {
    if (!invoiceToDelete) return;

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

    const updatedInvoices = invoices.filter(
      (invoice) => invoice.id !== invoiceToDelete.id
    );
    setInvoices(updatedInvoices);

    const updatedDailySales = loadDailySales().filter(
      (sale) => sale.invoiceId !== invoiceToDelete.id
    );
    saveDailySales(updatedDailySales);

    if (editingInvoice?.id === invoiceToDelete.id) {
      handleCloseEditModal();
    }

    showToast(
      `Invoice ${invoiceToDelete.id} deleted and stock restored successfully.`,
      "success"
    );

    setInvoiceToDelete(null);
  };

  return (
    <main className="app-shell print:bg-white">
      <div className="print:hidden">
        <AppHeader />
      </div>

      <AppToast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <section className="page-wrap print:max-w-2xl">
        <div className="print:hidden">
          <div className="page-hero hero-invoices">
            <div className="page-hero-content">
              <h2 className="page-hero-title">Invoices</h2>
              <p className="page-hero-subtitle">
                View, search, print, edit, delete, and export saved invoices.
              </p>
            </div>
          </div>

          <div className="surface-card p-4">
            <input
              type="text"
              placeholder="Search by invoice number, customer, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleExportInvoices}
              className="app-button app-button-success w-full"
            >
              Export Invoices
            </button>

            <button
              onClick={handleExportDailySales}
              className="app-button app-button-secondary w-full"
            >
              Export Daily Sales
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {filteredInvoices.length === 0 ? (
              <div className="surface-card p-4">
                <p className="text-sm text-slate-500">No matching invoices found.</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <article key={invoice.id} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {invoice.id}
                      </h3>
                      <p className="text-sm text-slate-500">{invoice.date}</p>
                    </div>

                    <button
                      onClick={() => handleOpenInvoice(invoice)}
                      className="app-button app-button-primary px-4 py-2 text-sm"
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
      </section>

      <AppModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice ${selectedInvoice.id}` : "Invoice"}
      >
        {selectedInvoice && (
          <>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl ring-1 ring-slate-200">
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

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(selectedInvoice.total)}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={handlePrint}
                className="app-button app-button-primary w-full"
              >
                Print
              </button>

              <button
                onClick={() => handleEditInvoice(selectedInvoice)}
                className="app-button app-button-secondary w-full"
              >
                Edit
              </button>

              <button
                onClick={() => handleAskDeleteInvoice(selectedInvoice)}
                className="app-button app-button-danger w-full"
              >
                Delete
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="app-button app-button-muted w-full"
              >
                Close
              </button>
            </div>
          </>
        )}
      </AppModal>

      <AppModal
        isOpen={!!editingInvoice}
        onClose={handleCloseEditModal}
        title={editingInvoice ? `Edit Invoice ${editingInvoice.id}` : "Edit Invoice"}
      >
        <div className="space-y-3">
          <input
            value={editCustomerName}
            onChange={(e) => setEditCustomerName(e.target.value)}
            placeholder="Customer name"
          />

          <input
            value={editCustomerPhone}
            onChange={(e) => setEditCustomerPhone(e.target.value)}
            placeholder="Phone"
          />
        </div>

        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {editItems.map((item, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{item.name}</p>

                <button
                  onClick={() => handleRemoveEditItem(index)}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>

              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(e) => handleEditItemQuantity(index, e.target.value)}
                className="mt-3"
              />

              <p className="mt-2 text-sm text-slate-500">
                Total: {formatCurrency(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handleCloseEditModal}
            className="app-button app-button-muted w-full"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveEditedInvoice}
            className="app-button app-button-success w-full"
          >
            Save Changes
          </button>
        </div>
      </AppModal>

      <ConfirmModal
        isOpen={!!invoiceToDelete}
        title="Delete Invoice"
        message={
          invoiceToDelete
            ? `Delete invoice ${invoiceToDelete.id}? This will restore the sold stock.`
            : ""
        }
        confirmText="Delete"
        onConfirm={handleConfirmDeleteInvoice}
        onCancel={() => setInvoiceToDelete(null)}
      />

      <div className="print:hidden">
        <BottomTabs />
      </div>
    </main>
  );
}