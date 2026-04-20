"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomTabs from "@/components/BottomTabs";
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
  const d = new Date(dateString);
  const t = new Date();

  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

export default function DailyPage() {
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setDailySales(loadDailySales());
    setInvoices(loadInvoices());
  }, []);

  const todaysSales = useMemo(
    () => dailySales.filter((sale) => isToday(sale.date)),
    [dailySales]
  );

  const todaysInvoices = useMemo(
    () => invoices.filter((invoice) => isToday(invoice.date)),
    [invoices]
  );

  const totals = useMemo(() => {
    const totalSales = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = todaysSales.reduce((sum, sale) => sum + sale.profit, 0);
    const count = todaysInvoices.length;

    return { totalSales, totalProfit, count };
  }, [todaysSales, todaysInvoices]);

  return (
    <main className="app-shell">
      <AppHeader />

      <section className="page-wrap">
        <div className="page-hero hero-daily">
          <div className="page-hero-content">
            <h2 className="page-hero-title"></h2>
            <p className="page-hero-subtitle">
             </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="surface-card p-4">
            <p className="text-sm font-medium text-slate-500">Today’s Sales</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(totals.totalSales)}
            </h3>
          </div>

          <div className="surface-card p-4">
            <p className="text-sm font-medium text-slate-500">Today’s Profit</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
              {formatCurrency(totals.totalProfit)}
            </h3>
          </div>

          <div className="surface-card p-4 col-span-2">
            <p className="text-sm font-medium text-slate-500">Invoices Today</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {totals.count}
            </h3>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Today’s Invoices
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              A quick view of all invoice activity recorded today.
            </p>
          </div>

          <div className="space-y-4">
            {todaysInvoices.length === 0 ? (
              <div className="surface-card p-4">
                <p className="text-sm text-slate-500">
                  No sales recorded today.
                </p>
              </div>
            ) : (
              todaysInvoices.map((invoice) => (
                <article key={invoice.id} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {invoice.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {invoice.date}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    {invoice.customerName} • {invoice.customerPhone}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
                    <span className="text-sm text-slate-500">Profit</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(invoice.profit)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <BottomTabs />
    </main>
  );
}