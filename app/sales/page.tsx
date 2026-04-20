"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
import BarcodeScanner from "@/components/BarcodeScanner";
import AppToast from "@/components/AppToast";
import AppModal from "@/components/AppModal";
import { useProducts } from "@/components/ProductsProvider";
import { generateInvoiceNumber } from "@/lib/invoice";
import {
  loadDailySales,
  loadInvoices,
  saveDailySales,
  saveInvoices,
} from "@/lib/storage";
import { DailySale, Invoice, Product, SaleItem } from "@/lib/types";

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

export default function SalesPage() {
  const { products, setProducts } = useProducts();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [hasLoadedSalesData, setHasLoadedSalesData] = useState(false);

  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");

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
    setInvoices(loadInvoices());
    setDailySales(loadDailySales());
    setHasLoadedSalesData(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedSalesData) return;
    saveInvoices(invoices);
  }, [invoices, hasLoadedSalesData]);

  useEffect(() => {
    if (!hasLoadedSalesData) return;
    saveDailySales(dailySales);
  }, [dailySales, hasLoadedSalesData]);

  useEffect(() => {
    if (products.length > 0 && selectedProductId === 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  const getAlreadyAddedQuantity = (productId: number) => {
    return saleItems
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getRemainingStock = (product: Product) => {
    return product.quantity - getAlreadyAddedQuantity(product.id);
  };

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      const remainingStock = getRemainingStock(product);

      return (
        product.name.toLowerCase().includes(term) ||
        product.unit.toLowerCase().includes(term) ||
        String(remainingStock).includes(term) ||
        (product.barcode || "").toLowerCase().includes(term)
      );
    });
  }, [products, productSearch, saleItems]);

  const handleBarcodeSearch = () => {
    const trimmedBarcode = barcodeInput.trim();

    if (!trimmedBarcode) {
      showToast("Please enter a barcode.", "error");
      return;
    }

    const matchedProduct = products.find(
      (product) => (product.barcode || "").trim() === trimmedBarcode
    );

    if (!matchedProduct) {
      showToast("No product found with that barcode.", "error");
      return;
    }

    setSelectedProductId(matchedProduct.id);
    showToast(`${matchedProduct.name} selected.`, "success");
  };

  const handleScan = (code: string) => {
    const trimmedCode = code.trim();
    setBarcodeInput(trimmedCode);

    const matchedProduct = products.find(
      (product) => (product.barcode || "").trim() === trimmedCode
    );

    if (!matchedProduct) {
      showToast("Product not found for this barcode.", "error");
      return;
    }

    setSelectedProductId(matchedProduct.id);
    setShowScanner(false);
    showToast(`${matchedProduct.name} selected.`, "success");
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const parsedQuantity = Number(quantity);

    if (!parsedQuantity || parsedQuantity <= 0) {
      showToast("Please enter a valid quantity.", "error");
      return;
    }

    const remainingStock = getRemainingStock(selectedProduct);

    if (parsedQuantity > remainingStock) {
      showToast(
        `Not enough stock. Only ${remainingStock} ${selectedProduct.unit} available for ${selectedProduct.name}.`,
        "error"
      );
      return;
    }

    const lineTotal = parsedQuantity * selectedProduct.sellingPrice;

    const newItem: SaleItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity: parsedQuantity,
      unit: selectedProduct.unit,
      unitPrice: selectedProduct.sellingPrice,
      lineTotal,
      costPrice: selectedProduct.buyingPrice,
    };

    setSaleItems((prev) => [...prev, newItem]);
    setQuantity("");
    showToast(`${selectedProduct.name} added to invoice.`, "success");
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const removedItem = saleItems[indexToRemove];
    setSaleItems((prev) => prev.filter((_, index) => index !== indexToRemove));

    if (removedItem) {
      showToast(`${removedItem.name} removed from invoice.`, "info");
    }
  };

  const handleFinalizeSale = () => {
    if (!customerName.trim()) {
      showToast("Please enter customer name.", "error");
      return;
    }

    if (!customerPhone.trim()) {
      showToast("Please enter customer phone.", "error");
      return;
    }

    if (saleItems.length === 0) {
      showToast("Please add at least one sale item.", "error");
      return;
    }

    const invoiceId = generateInvoiceNumber();
    const date = new Date().toLocaleString();

    const total = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const profit = saleItems.reduce(
      (sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity,
      0
    );

    const newInvoice: Invoice = {
      id: invoiceId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date,
      items: saleItems,
      total,
      profit,
    };

    const newDailySale: DailySale = {
      invoiceId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date,
      total,
      profit,
    };

    const updatedProducts = products.map((product) => {
      const matchingItems = saleItems.filter(
        (item) => item.productId === product.id
      );

      const totalSold = matchingItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return totalSold > 0
        ? { ...product, quantity: product.quantity - totalSold }
        : product;
    });

    setProducts(updatedProducts);
    setInvoices((prev) => [newInvoice, ...prev]);
    setDailySales((prev) => [newDailySale, ...prev]);

    setCustomerName("");
    setCustomerPhone("");
    setSaleItems([]);
    setQuantity("");
    setBarcodeInput("");

    if (updatedProducts.length > 0) {
      setSelectedProductId(updatedProducts[0].id);
    }

    showToast(`Sale completed. Invoice ${invoiceId} created.`, "success");
  };

  const grandTotal = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <main className="app-shell">
      <AppHeader />

      <AppToast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <section className="page-wrap">
        <div className="page-hero hero-sales">
          <div className="page-hero-content">
            <h2 className="page-hero-title">Sales</h2>
            <p className="page-hero-subtitle">
              Create a sale, scan products, and prepare invoice items.
            </p>
          </div>
        </div>

        <div className="section-stack">
          <div className="surface-card p-4">
            <h3 className="text-base font-semibold text-slate-900">
              Customer Details
            </h3>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <input
                type="tel"
                placeholder="Customer phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-base font-semibold text-slate-900">
              Find Product by Barcode
            </h3>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Enter or paste barcode"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBarcodeSearch}
                  className="app-button app-button-secondary w-full py-3 rounded-2xl"
                >
                  Find Barcode
                </button>

                <button
                  onClick={() => setShowScanner(true)}
                  className="app-button app-button-primary w-full py-3 rounded-2xl"
                >
                  Scan Camera
                </button>
              </div>
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-base font-semibold text-slate-900">
              Add Sale Item
            </h3>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowProductPicker(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300"
              >
                <div className="min-w-0">
                  {selectedProduct ? (
                    <>
                      <p className="truncate font-semibold text-slate-900">
                        {selectedProduct.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getRemainingStock(selectedProduct)}{" "}
                        {selectedProduct.unit} in stock
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400">Select product</p>
                  )}
                </div>

                <span className="text-lg text-slate-400">⌄</span>
              </button>

              {selectedProduct && (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <div>
                    Selling Price: {formatCurrency(selectedProduct.sellingPrice)}
                  </div>
                  <div className="mt-1">
                    Available Now: {getRemainingStock(selectedProduct)}{" "}
                    {selectedProduct.unit}
                  </div>
                  <div className="mt-1">
                    Barcode: {selectedProduct.barcode?.trim() || "Not assigned"}
                  </div>
                </div>
              )}

              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddItem}
                  className="app-button app-button-primary w-full py-3 rounded-2xl"
                >
                  Add Item
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuantity("");
                    setBarcodeInput("");
                  }}
                  className="app-button app-button-muted w-full py-3 rounded-2xl"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="surface-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Invoice Items
              </h3>
              <span className="text-sm text-slate-500">
                {saleItems.length} item(s)
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {saleItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No sale items added yet.
                </p>
              ) : (
                saleItems.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.quantity} {item.unit} ×{" "}
                          {formatCurrency(item.unitPrice)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="mt-2 text-sm font-medium text-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <p className="font-semibold text-slate-900">
                        {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Grand Total</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(grandTotal)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSaleItems([]);
                    setQuantity("");
                  }}
                  className="app-button app-button-muted w-full py-3 rounded-2xl"
                >
                  Clear Items
                </button>

                <button
                  onClick={handleFinalizeSale}
                  className="app-button app-button-success w-full py-3 rounded-2xl"
                >
                  Finalize Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AppModal
        isOpen={showProductPicker}
        onClose={() => {
          setShowProductPicker(false);
          setProductSearch("");
        }}
        title="Select Product"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search product, barcode, or unit"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No matching products found.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const remainingStock = getRemainingStock(product);
                const isSelected = selectedProductId === product.id;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setShowProductPicker(false);
                      setProductSearch("");
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {remainingStock} {product.unit} in stock
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Barcode: {product.barcode?.trim() || "Not assigned"}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </AppModal>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <BottomTabs />
    </main>
  );
}