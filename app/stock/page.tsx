"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
import ProductCard from "@/components/ProductCard";
import AppModal from "@/components/AppModal";
import AppToast from "@/components/AppToast";
import ConfirmModal from "@/components/ConfirmModal";
import { useProducts } from "@/components/ProductsProvider";
import { Product } from "@/lib/types";

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
};

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

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    buyingPrice: "",
    sellingPrice: "",
    lowStock: "",
    barcode: "",
  });

  const [quantityAction, setQuantityAction] = useState<"add" | "reduce" | null>(
    null
  );
  const [quantityProduct, setQuantityProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState("");

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

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

  const openQuantityModal = (product: Product, action: "add" | "reduce") => {
    setQuantityProduct(product);
    setQuantityAction(action);
    setQuantityInput("");
  };

  const closeQuantityModal = () => {
    setQuantityProduct(null);
    setQuantityAction(null);
    setQuantityInput("");
  };

  const handleAddStock = (selectedProduct: Product) => {
    openQuantityModal(selectedProduct, "add");
  };

  const handleReduceStock = (selectedProduct: Product) => {
    openQuantityModal(selectedProduct, "reduce");
  };

  const handleConfirmQuantityAction = () => {
    if (!quantityProduct || !quantityAction) return;

    const amount = Number(quantityInput);

    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid positive number.", "error");
      return;
    }

    if (quantityAction === "add") {
      addStock(quantityProduct.id, amount);
      showToast(`${amount} added to ${quantityProduct.name}.`, "success");
      closeQuantityModal();
      return;
    }

    const success = reduceStock(quantityProduct.id, amount);

    if (!success) {
      showToast("Cannot reduce below zero.", "error");
      return;
    }

    showToast(`${amount} reduced from ${quantityProduct.name}.`, "success");
    closeQuantityModal();
  };

  const handleDeleteProduct = (selectedProduct: Product) => {
    setDeleteProduct(selectedProduct);
  };

  const handleConfirmDelete = () => {
    if (!deleteProduct) return;

    setProducts((prev) =>
      prev.filter((product) => product.id !== deleteProduct.id)
    );

    showToast(`${deleteProduct.name} deleted successfully.`, "success");
    setDeleteProduct(null);
  };

  const handleEditProduct = (selectedProduct: Product) => {
    setEditingProduct(selectedProduct);
    setEditForm({
      name: selectedProduct.name,
      quantity: String(selectedProduct.quantity),
      unit: selectedProduct.unit,
      buyingPrice: String(selectedProduct.buyingPrice),
      sellingPrice: String(selectedProduct.sellingPrice),
      lowStock: String(selectedProduct.lowStock),
      barcode: selectedProduct.barcode || "",
    });
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setEditForm({
      name: "",
      quantity: "",
      unit: "",
      buyingPrice: "",
      sellingPrice: "",
      lowStock: "",
      barcode: "",
    });
  };

  const handleSaveEditedProduct = () => {
    if (!editingProduct) return;

    const quantity = Number(editForm.quantity);
    const buyingPrice = Number(editForm.buyingPrice);
    const sellingPrice = Number(editForm.sellingPrice);
    const lowStock = Number(editForm.lowStock);
    const trimmedBarcode = editForm.barcode.trim();

    if (!editForm.name.trim()) {
      showToast("Product name cannot be empty.", "error");
      return;
    }

    if (!editForm.unit.trim()) {
      showToast("Unit cannot be empty.", "error");
      return;
    }

    if (
      isNaN(quantity) ||
      isNaN(buyingPrice) ||
      isNaN(sellingPrice) ||
      isNaN(lowStock)
    ) {
      showToast("Please enter valid numeric values.", "error");
      return;
    }

    if (
      quantity < 0 ||
      buyingPrice < 0 ||
      sellingPrice < 0 ||
      lowStock < 0
    ) {
      showToast("Values cannot be negative.", "error");
      return;
    }

    if (trimmedBarcode) {
      const barcodeExists = products.some(
        (product) =>
          product.id !== editingProduct.id &&
          (product.barcode || "").trim() === trimmedBarcode
      );

      if (barcodeExists) {
        showToast("That barcode is already assigned to another product.", "error");
        return;
      }
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: editForm.name.trim(),
              quantity,
              unit: editForm.unit.trim(),
              buyingPrice,
              sellingPrice,
              lowStock,
              barcode: trimmedBarcode,
            }
          : product
      )
    );

    handleCloseEditModal();
    showToast("Product updated successfully.", "success");
  };

  const handleCreateProduct = () => {
    const quantity = Number(newProduct.quantity);
    const buyingPrice = Number(newProduct.buyingPrice);
    const sellingPrice = Number(newProduct.sellingPrice);
    const lowStock = Number(newProduct.lowStock);

    if (!newProduct.name.trim()) {
      showToast("Please enter product name.", "error");
      return;
    }

    if (!newProduct.unit.trim()) {
      showToast("Please enter product unit.", "error");
      return;
    }

    if (
      isNaN(quantity) ||
      isNaN(buyingPrice) ||
      isNaN(sellingPrice) ||
      isNaN(lowStock)
    ) {
      showToast("Please fill all numeric fields correctly.", "error");
      return;
    }

    if (
      quantity < 0 ||
      buyingPrice < 0 ||
      sellingPrice < 0 ||
      lowStock < 0
    ) {
      showToast("Values cannot be negative.", "error");
      return;
    }

    const trimmedBarcode = newProduct.barcode.trim();

    if (trimmedBarcode) {
      const barcodeExists = products.some(
        (product) => (product.barcode || "").trim() === trimmedBarcode
      );

      if (barcodeExists) {
        showToast("That barcode is already assigned to another product.", "error");
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
    showToast(`${createdProduct.name} added successfully.`, "success");
  };

  return (
    <main className="app-shell min-h-screen">
      <AppHeader />

      <AppToast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <section className="page-wrap pb-28 pt-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="page-hero hero-stock"
        >
          <div className="page-hero-content">
            <h2 className="page-hero-title">Stock</h2>
            <p className="page-hero-subtitle">
              Manage your inventory and add new stock items.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mb-5 flex items-start justify-between gap-3"
        >
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Product Inventory
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Keep your stock levels, prices, and barcode records updated.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className={`app-button w-auto min-w-[92px] ${
              showAddForm ? "app-button-muted" : "app-button-primary"
            }`}
          >
            {showAddForm ? "Close" : "+ New"}
          </button>
        </motion.div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28 }}
            className="surface-card mb-5 p-4"
          >
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
              />

              <input
                type="text"
                placeholder="Unit (e.g. Bags, Trays, Cartons)"
                value={newProduct.unit}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, unit: e.target.value }))
                }
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
              />

              <button
                onClick={handleCreateProduct}
                className="app-button app-button-success w-full"
              >
                Save Product
              </button>
            </div>
          </motion.div>
        )}

        <div className="section-stack">
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16 }}
              className="surface-card p-4"
            >
              <p className="text-sm text-slate-500">
                No products available yet. Add your first product to begin.
              </p>
            </motion.div>
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.04 }}
              >
                <ProductCard
                  product={product}
                  onAdd={handleAddStock}
                  onReduce={handleReduceStock}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      <AppModal
        isOpen={!!editingProduct}
        onClose={handleCloseEditModal}
        title="Edit Product"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Product name"
            value={editForm.name}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Barcode (optional)"
            value={editForm.barcode}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, barcode: e.target.value }))
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Quantity"
            value={editForm.quantity}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, quantity: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Unit"
            value={editForm.unit}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, unit: e.target.value }))
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Buying price"
            value={editForm.buyingPrice}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                buyingPrice: e.target.value,
              }))
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Selling price"
            value={editForm.sellingPrice}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                sellingPrice: e.target.value,
              }))
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Low stock limit"
            value={editForm.lowStock}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                lowStock: e.target.value,
              }))
            }
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handleCloseEditModal}
            className="app-button app-button-muted w-full"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveEditedProduct}
            className="app-button app-button-success w-full"
          >
            Save Changes
          </button>
        </div>
      </AppModal>

      <AppModal
        isOpen={!!quantityProduct && !!quantityAction}
        onClose={closeQuantityModal}
        title={
          quantityAction === "add"
            ? `Add Stock${quantityProduct ? ` — ${quantityProduct.name}` : ""}`
            : `Reduce Stock${quantityProduct ? ` — ${quantityProduct.name}` : ""}`
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Enter the quantity to{" "}
            {quantityAction === "add" ? "add to" : "reduce from"} this product.
          </p>

          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={closeQuantityModal}
            className="app-button app-button-muted w-full"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmQuantityAction}
            className="app-button app-button-primary w-full"
          >
            Confirm
          </button>
        </div>
      </AppModal>

      <ConfirmModal
        isOpen={!!deleteProduct}
        title="Delete Product"
        message={
          deleteProduct
            ? `Are you sure you want to delete "${deleteProduct.name}"?`
            : ""
        }
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProduct(null)}
      />

      <BottomTabs />
    </main>
  );
}