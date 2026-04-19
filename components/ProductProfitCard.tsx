import { Product } from "@/lib/types";
import { getProductProfit } from "@/lib/calculations";

type ProductProfitCardProps = {
  product: Product;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ProductProfitCard({
  product,
}: ProductProfitCardProps) {
  const { profitPerUnit, totalProfit } = getProductProfit(product);

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Stock: {product.quantity} {product.unit}
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Profit Stack
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
          <p className="text-slate-500">Profit / Unit</p>
          <p className="mt-1 font-semibold text-emerald-600">
            {formatCurrency(profitPerUnit)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Total Profit</p>
          <p className="mt-1 font-semibold text-emerald-600">
            {formatCurrency(totalProfit)}
          </p>
        </div>
      </div>
    </article>
  );
}