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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg">
      <div className="flex justify-around py-3">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center text-xs transition ${
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.8 : 2}
                className={`mb-1 transition ${
                  isActive ? "scale-110" : ""
                }`}
              />

              <span className={isActive ? "font-semibold" : ""}>
                {tab.name}
              </span>

              {isActive && (
                <div className="mt-1 h-[3px] w-6 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}