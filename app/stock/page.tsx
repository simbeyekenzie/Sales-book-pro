"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/components/ProductsProvider";
import { Product } from "@/lib/types";

export default function StockPage() {
  const { products, addStock, reduceStock, setProducts } = useProducts();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: "",
    unit: "",
    buyingPrice: "",
    sellingPrice: "",
    lowStock: "",
    barcode: "",
  });

  const handleAddStock = (selectedProduct: Product) => {
    const input = window.prompt(`Add quantity to ${selectedProduct.name}:`);
    if (!input) return;

    const amount = Number(input);

    if (isNaN(amount) || amount <= 0) {
      window.alert("Please enter a valid positive number.");
      return;
    }

    addStock(selectedProduct.id, amount);
  };

  const handleReduceStock = (selectedProduct: Product) => {
    const input = window.prompt(`Reduce quantity from ${selectedProduct.name}:`);
    if (!input) return;

    const amount = Number(input);

    if (isNaN(amount) || amount <= 0) {
      window.alert("Please enter a valid positive number.");
      return;
    }

    const success = reduceStock(selectedProduct.id, amount);

    if (!success) {
      window.alert("Cannot reduce below zero.");
    }
  };

  const handleCreateProduct = () => {
    const quantity = Number(newProduct.quantity);
    const buyingPrice = Number(newProduct.buyingPrice);
    const sellingPrice = Number(newProduct.sellingPrice);
    const lowStock = Number(newProduct.lowStock);

    if (!newProduct.name.trim()) {
      window.alert("Please enter product name.");
      return;
    }

    if (!newProduct.unit.trim()) {
      window.alert("Please enter product unit.");
      return;
    }

    if (
      isNaN(quantity) ||
      isNaN(buyingPrice) ||
      isNaN(sellingPrice) ||
      isNaN(lowStock)
    ) {
      window.alert("Please fill all numeric fields correctly.");
      return;
    }

    if (
      quantity < 0 ||
      buyingPrice < 0 ||
      sellingPrice < 0 ||
      lowStock < 0
    ) {
      window.alert("Values cannot be negative.");
      return;
    }

    const trimmedBarcode = newProduct.barcode.trim();

    if (trimmedBarcode) {
      const barcodeExists = products.some(
        (product) => (product.barcode || "").trim() === trimmedBarcode
      );

      if (barcodeExists) {
        window.alert("That barcode is already assigned to another product.");
        return;
      }
    }

    const nextId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    const createdProduct: Product = {
      id: nextId,
      name: newProduct.name.trim(),
      quantity,
      unit: newProduct.unit.trim(),
      buyingPrice,
      sellingPrice,
      lowStock,
      barcode: trimmedBarcode,
    };

    setProducts((prev) => [...prev, createdProduct]);

    setNewProduct({
      name: "",
      quantity: "",
      unit: "",
      buyingPrice: "",
      sellingPrice: "",
      lowStock: "",
      barcode: "",
    });

    setShowAddForm(false);
    window.alert(`${createdProduct.name} added successfully.`);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader />

      <section className="mx-auto max-w-md px-4 py-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Stock
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your current product inventory.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            {showAddForm ? "Close" : "+ New"}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Add New Product
            </h3>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <input
                type="text"
                placeholder="Barcode (optional)"
                value={newProduct.barcode}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    barcode: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <input
                type="number"
                min="0"
                placeholder="Quantity"
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <input
                type="text"
                placeholder="Unit (e.g. Bags, Trays, Cartons)"
                value={newProduct.unit}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <input
                type="number"
                min="0"
                placeholder="Buying price"
                value={newProduct.buyingPrice}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    buyingPrice: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <input
                type="number"
                min="0"
                placeholder="Selling price"
                value={newProduct.sellingPrice}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    sellingPrice: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <input
                type="number"
                min="0"
                placeholder="Low stock limit"
                value={newProduct.lowStock}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    lowStock: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <button
                onClick={handleCreateProduct}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Save Product
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={handleAddStock}
              onReduce={handleReduceStock}
            />
          ))}
        </div>
      </section>

      <BottomTabs />
    </main>
  );
}