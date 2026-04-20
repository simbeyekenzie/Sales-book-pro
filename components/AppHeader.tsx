"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BriefcaseBusiness } from "lucide-react";

export default function AppHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={`flex items-center justify-between border-b border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_5px_30px_rgba(0,0,0,0.3)] transition-all duration-300 ${
          scrolled ? "px-2 py-1" : "px-2 py-1.5"
        }`}
      >
        <Link href="/" className="flex items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-lg" />
            <img
              src="/logo.png"
              alt="BlueCount Pro Logo"
              className={`relative object-contain transition-all duration-300 ${
                scrolled
                  ? "h-[72px] w-[72px] md:h-[80px] md:w-[80px]"
                  : "h-[86px] w-[86px] md:h-[96px] md:w-[96px]"
              }`}
            />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`flex items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/15 ${
              scrolled ? "h-10 w-10" : "h-11 w-11"
            }`}
            aria-label="Notifications"
          >
            <Bell size={22} className="text-black" />
          </button>

          <Link
            href="/admin"
            className={`flex items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 ${
              scrolled ? "h-10 w-10" : "h-11 w-11"
            }`}
            aria-label="Admin or Sales"
          >
            <BriefcaseBusiness size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}