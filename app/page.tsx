"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
import SummaryCard from "@/components/SummaryCard";
import ProductProfitCard from "@/components/ProductProfitCard";
import { useProducts } from "@/components/ProductsProvider";
import {
  getLowStockCount,
  getTotalPotentialProfit,
  getTotalProducts,
  getTotalStockUnits,
  getTotalStockValue,
} from "@/lib/calculations";
import { loadDailySales, loadInvoices } from "@/lib/storage";
import { DailySale, Invoice } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 2,
  }).format(amount);
}

function isToday(dateString: string) {
  const inputDate = new Date(dateString);
  const today = new Date();

  return (
    inputDate.getDate() === today.getDate() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getFullYear() === today.getFullYear()
  );
}

export default function Home() {
  const { products } = useProducts();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);

  useEffect(() => {
    setInvoices(loadInvoices());
    setDailySales(loadDailySales());
  }, [products]);

  const dashboardStats = useMemo(() => {
    const totalProducts = getTotalProducts(products);
    const totalStockUnits = getTotalStockUnits(products);
    const lowStockCount = getLowStockCount(products);
    const totalStockValue = getTotalStockValue(products);
    const totalPotentialProfit = getTotalPotentialProfit(products);

    const todaysSalesTotal = dailySales
      .filter((sale) => isToday(sale.date))
      .reduce((sum, sale) => sum + sale.total, 0);

    const totalInvoices = invoices.length;

    return {
      totalProducts,
      totalStockUnits,
      lowStockCount,
      totalStockValue,
      totalPotentialProfit,
      todaysSalesTotal,
      totalInvoices,
    };
  }, [products, invoices, dailySales]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader />

      <section className="mx-auto max-w-md px-4 py-5">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Live overview of stock, invoices, sales, and profit.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SummaryCard title="Products" value={dashboardStats.totalProducts} />
          <SummaryCard
            title="Stock Units"
            value={dashboardStats.totalStockUnits}
          />
          <SummaryCard title="Low Stock" value={dashboardStats.lowStockCount} />
          <SummaryCard
            title="Stock Value"
            value={formatCurrency(dashboardStats.totalStockValue)}
          />
          <SummaryCard
            title="Today’s Sales"
            value={formatCurrency(dashboardStats.todaysSalesTotal)}
          />
          <SummaryCard title="Invoices" value={dashboardStats.totalInvoices} />
        </div>

        <div className="mt-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Potential Profit on Stock</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
              {formatCurrency(dashboardStats.totalPotentialProfit)}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              This is the expected profit if all current stock is sold at the set
              selling prices.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Profit by Product
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Live potential profit for each product based on current stock.
            </p>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <ProductProfitCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <BottomTabs />
    </main>
  );
}