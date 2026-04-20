"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
    const refreshDashboardData = () => {
      setInvoices(loadInvoices());
      setDailySales(loadDailySales());
    };

    refreshDashboardData();

    window.addEventListener("focus", refreshDashboardData);
    window.addEventListener("visibilitychange", refreshDashboardData);

    return () => {
      window.removeEventListener("focus", refreshDashboardData);
      window.removeEventListener("visibilitychange", refreshDashboardData);
    };
  }, []);

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
    <main className="app-shell">
      <AppHeader />

      <section className="page-wrap pb-28 pt-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="page-hero hero-dashboard"
        >
          <div className="page-hero-content">
            <h2 className="page-hero-title">Home</h2>
            <p className="page-hero-subtitle">
              Live overview of stock, invoices, sales, and profit.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="stats-grid"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="mt-4"
        >
          <div className="surface-card p-4">
            <p className="text-sm font-medium text-slate-500">
              Potential Profit on Stock
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
              {formatCurrency(dashboardStats.totalPotentialProfit)}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              This is the expected profit if all current stock is sold at the
              set selling prices.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22 }}
          className="mt-6"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Profit by Product
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Live potential profit for each product based on current stock.
            </p>
          </div>

          <div className="section-stack">
            {products.length === 0 ? (
              <div className="surface-card p-4">
                <p className="text-sm text-slate-500">
                  No products available yet.
                </p>
              </div>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                >
                  <ProductProfitCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </section>

      <BottomTabs />
    </main>
  );
}