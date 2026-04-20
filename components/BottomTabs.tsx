"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
} from "lucide-react";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Stock", href: "/stock", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Daily", href: "/daily", icon: BarChart3 },
  { name: "Invoices", href: "/invoices", icon: FileText },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-lg -translate-x-1/2">
      <div className="relative overflow-hidden rounded-full border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.35)] supports-[backdrop-filter]:bg-white/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5" />
        <div className="relative flex items-center justify-between px-2 py-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-full px-2 py-2 text-[11px] transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-white/12 shadow-inner shadow-white/10" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                <div
  className={`mb-1 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
    isActive
      ? "bg-white/15 shadow-[0_4px_18px_rgba(255,255,255,0.12)] scale-110"
      : "bg-transparent group-hover:bg-white/10"
  }`}
>
  <Icon
    size={20}
    strokeWidth={isActive ? 2.5 : 2}
    className="transition-all duration-300"
  />
</div>

                  <span
                    className={`truncate transition-all duration-300 ${
                      isActive
                        ? "font-semibold tracking-wide"
                        : "font-medium"
                    }`}
                  >
                    {tab.name}
                  </span>

                  <div
                    className={`mt-1 h-[3px] rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-6 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                        : "w-0 bg-transparent"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}