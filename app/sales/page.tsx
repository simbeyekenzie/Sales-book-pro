"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
import BarcodeScanner from "@/components/BarcodeScanner";
import { useProducts } from "@/components/ProductsProvider";
import { generateInvoiceNumber } from "@/lib/invoice";
import {
  loadDailySales,
  loadInvoices,
  saveDailySales,
  saveInvoices,
} from "@/lib/storage";
import { DailySale, Invoice, Product, SaleItem } from "@/lib/types";

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

  const handleBarcodeSearch = () => {
    const trimmedBarcode = barcodeInput.trim();

    if (!trimmedBarcode) {
      window.alert("Please enter a barcode.");
      return;
    }

    const matchedProduct = products.find(
      (product) => (product.barcode || "").trim() === trimmedBarcode
    );

    if (!matchedProduct) {
      window.alert("No product found with that barcode.");
      return;
    }

    setSelectedProductId(matchedProduct.id);
    window.alert(`${matchedProduct.name} selected.`);
  };

  const handleScan = (code: string) => {
    const trimmedCode = code.trim();
    setBarcodeInput(trimmedCode);

    const matchedProduct = products.find(
      (product) => (product.barcode || "").trim() === trimmedCode
    );

    if (!matchedProduct) {
      window.alert("Product not found for this barcode.");
      return;
    }

    setSelectedProductId(matchedProduct.id);
    setShowScanner(false);
    window.alert(`${matchedProduct.name} selected.`);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const parsedQuantity = Number(quantity);

    if (!parsedQuantity || parsedQuantity <= 0) {
      window.alert("Please enter a valid quantity.");
      return;
    }

    const remainingStock = getRemainingStock(selectedProduct);

    if (parsedQuantity > remainingStock) {
      window.alert(
        `Not enough stock. Only ${remainingStock} ${selectedProduct.unit} available for ${selectedProduct.name}.`
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
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setSaleItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleFinalizeSale = () => {
    if (!customerName.trim()) {
      window.alert("Please enter customer name.");
      return;
    }

    if (!customerPhone.trim()) {
      window.alert("Please enter customer phone.");
      return;
    }

    if (saleItems.length === 0) {
      window.alert("Please add at least one sale item.");
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

    const existingInvoices = loadInvoices();
    saveInvoices([newInvoice, ...existingInvoices]);

    const existingDailySales = loadDailySales();
    saveDailySales([newDailySale, ...existingDailySales]);

    window.alert(`Sale completed successfully. Invoice ${invoiceId} created.`);

    setCustomerName("");
    setCustomerPhone("");
    setSaleItems([]);
    setQuantity("");
    setBarcodeInput("");

    if (updatedProducts.length > 0) {
      setSelectedProductId(updatedProducts[0].id);
    }
  };

  const grandTotal = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const totalProfit = saleItems.reduce(
    (sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity,
    0
  );

  return (
    <main className="app-shell">
      <AppHeader />

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

              <button
                onClick={handleBarcodeSearch}
                className="app-button app-button-secondary w-full"
              >
                Find by Barcode
              </button>

              <button
                onClick={() => setShowScanner(true)}
                className="app-button app-button-primary w-full"
              >
                Scan with Camera
              </button>
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-base font-semibold text-slate-900">
              Add Sale Item
            </h3>

            <div className="mt-4 space-y-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
              >
                {products.map((product) => {
                  const remainingStock = getRemainingStock(product);

                  return (
                    <option key={product.id} value={product.id}>
                      {product.name} — {remainingStock} {product.unit} available
                    </option>
                  );
                })}
              </select>

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

              <button
                onClick={handleAddItem}
                className="app-button app-button-primary w-full"
              >
                Add Item
              </button>
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

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Projected Profit</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(totalProfit)}
                </p>
              </div>

              <button
                onClick={handleFinalizeSale}
                className="app-button app-button-success w-full"
              >
                Finalize Sale
              </button>
            </div>
          </div>
        </div>
      </section>

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