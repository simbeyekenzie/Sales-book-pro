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
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Stock: {product.quantity} {product.unit}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isLowStock
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isLowStock ? "Low Stock" : "In Stock"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Buying Price</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(product.buyingPrice)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Selling Price</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(product.sellingPrice)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Low Stock Limit</p>
          <p className="mt-1 font-semibold text-slate-900">
            {product.lowStock}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Unit</p>
          <p className="mt-1 font-semibold text-slate-900">{product.unit}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onAdd(product)}
          className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Add
        </button>
        <button
          onClick={() => onReduce(product)}
          className="flex-1 rounded-xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-300"
        >
          - Reduce
        </button>
      </div>
    </article>
  );
}