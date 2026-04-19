"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Dashboard", path: "/" },
    { name: "Stock", path: "/stock" },
    { name: "Sales", path: "/sales" },
    { name: "Daily", path: "/daily" },
    { name: "Invoices", path: "/invoices" },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => router.push(tab.path)}
          className={`text-sm font-medium ${
            pathname === tab.path ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  );
}