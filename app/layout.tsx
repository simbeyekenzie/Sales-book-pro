import type { Metadata } from "next";
import "./globals.css";
import { ProductsProvider } from "@/components/ProductsProvider";

export const metadata: Metadata = {
  title: "Sales Book Pro",
  description: "Stock and sales management system for Janus Enterprises Ltd",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ProductsProvider>{children}</ProductsProvider>
      </body>
    </html>
  );
}