import { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  onReduce: (product: Product) => void;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ProductCard({
  product,
  onAdd,
  onReduce,
}: ProductCardProps) {
  const isLowStock = product.quantity <= product.lowStock;

  return (
    <article className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Stock: {product.quantity} {product.unit}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isLowStock
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isLowStock ? "Low Stock" : "In Stock"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-slate-500">Buying Price</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(product.buyingPrice)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-slate-500">Selling Price</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(product.sellingPrice)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-slate-500">Low Stock Limit</p>
          <p className="mt-1 font-semibold text-slate-900">
            {product.lowStock}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-slate-500">Unit</p>
          <p className="mt-1 font-semibold text-slate-900">{product.unit}</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="text-slate-500">Barcode</p>
        <p className="mt-1 font-medium text-slate-900">
          {product.barcode?.trim() || "Not assigned"}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onAdd(product)}
          className="app-button app-button-primary flex-1"
        >
          + Add
        </button>

        <button
          onClick={() => onReduce(product)}
          className="app-button app-button-muted flex-1"
        >
          - Reduce
        </button>
      </div>
    </article>
  );
}