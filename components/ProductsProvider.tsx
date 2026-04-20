"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Product } from "@/lib/types";

type ProductsContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addStock: (id: number, amount: number) => void;
  reduceStock: (id: number, amount: number) => boolean;
};

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "sales-book-pro-products";

const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Hammer",
    quantity: 20,
    unit: "Pieces",
    buyingPrice: 45,
    sellingPrice: 70,
    lowStock: 5,
    barcode: "100001",
  },
  {
    id: 2,
    name: "Cement",
    quantity: 50,
    unit: "Bags",
    buyingPrice: 120,
    sellingPrice: 150,
    lowStock: 10,
    barcode: "100002",
  },
  {
    id: 3,
    name: "Paint",
    quantity: 15,
    unit: "Buckets",
    buyingPrice: 180,
    sellingPrice: 240,
    lowStock: 4,
    barcode: "100003",
  },
];

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEY);

    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts) as Product[];
        setProducts(parsedProducts);
      } catch (error) {
        console.error("Failed to parse saved products:", error);
        setProducts(defaultProducts);
      }
    } else {
      setProducts(defaultProducts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addStock = (id: number, amount: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, quantity: product.quantity + amount }
          : product
      )
    );
  };

  const reduceStock = (id: number, amount: number) => {
    let success = true;

    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          if (product.quantity - amount < 0) {
            success = false;
            return product;
          }

          return { ...product, quantity: product.quantity - amount };
        }

        return product;
      })
    );

    return success;
  };

  return (
    <ProductsContext.Provider
      value={{ products, setProducts, addStock, reduceStock }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }

  return context;
}