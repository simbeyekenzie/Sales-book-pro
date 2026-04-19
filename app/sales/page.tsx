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
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader />

      <section className="mx-auto max-w-md px-4 py-5">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a sale and prepare invoice items.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Customer Details
            </h3>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <input
                type="tel"
                placeholder="Customer phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Find Product by Barcode
            </h3>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Enter or paste barcode"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <button
                onClick={handleBarcodeSearch}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Find by Barcode
              </button>

              <button
                onClick={() => setShowScanner(true)}
                className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-900"
              >
                Scan with Camera
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Add Sale Item
            </h3>

            <div className="mt-4 space-y-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
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
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  Selling Price: {formatCurrency(selectedProduct.sellingPrice)}
                  <br />
                  Available Now: {getRemainingStock(selectedProduct)}{" "}
                  {selectedProduct.unit}
                  <br />
                  Barcode: {selectedProduct.barcode?.trim() || "Not assigned"}
                </div>
              )}

              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <button
                onClick={handleAddItem}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Add Item
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
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
                    className="rounded-xl bg-slate-50 p-3"
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

            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
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
                className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
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