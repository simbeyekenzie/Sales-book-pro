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
    () => dailySales.filter((s) => isToday(s.date)),
    [dailySales]
  );

  const todaysInvoices = useMemo(
    () => invoices.filter((inv) => isToday(inv.date)),
    [invoices]
  );

  const totals = useMemo(() => {
    const totalSales = todaysSales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit = todaysSales.reduce((sum, s) => sum + s.profit, 0);
    const count = todaysInvoices.length;
    return { totalSales, totalProfit, count };
  }, [todaysSales, todaysInvoices]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader />

      <section className="mx-auto max-w-md px-4 py-5">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Sales
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Today’s sales, profit, and invoices.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Today’s Sales</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(totals.totalSales)}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Today’s Profit</p>
            <h3 className="mt-2 text-2xl font-bold text-emerald-600">
              {formatCurrency(totals.totalProfit)}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 col-span-2">
            <p className="text-sm text-slate-500">Invoices Today</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {totals.count}
            </h3>
          </div>
        </div>

        {/* Today’s invoices list */}
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">
            Today’s Invoices
          </h3>

          <div className="space-y-3">
            {todaysInvoices.length === 0 ? (
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">
                  No sales recorded today.
                </p>
              </div>
            ) : (
              todaysInvoices.map((inv) => (
                <article
                  key={inv.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {inv.id}
                      </p>
                      <p className="text-xs text-slate-500">{inv.date}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(inv.total)}
                    </p>
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    {inv.customerName} • {inv.customerPhone}
                  </div>

                  <div className="mt-2 text-sm text-emerald-600 font-medium">
                    Profit: {formatCurrency(inv.profit)}
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