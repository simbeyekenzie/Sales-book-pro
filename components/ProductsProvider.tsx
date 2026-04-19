"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { initialProducts } from "@/lib/data";
import { loadProducts, saveProducts } from "@/lib/storage";
import { Product } from "@/lib/types";

type ProductsContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addStock: (productId: number, amount: number) => void;
  reduceStock: (productId: number, amount: number) => boolean;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const savedProducts = loadProducts();
    if (savedProducts && savedProducts.length > 0) {
      setProducts(savedProducts);
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    saveProducts(products);
  }, [products, hasLoaded]);

  const addStock = (productId: number, amount: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: product.quantity + amount }
          : product
      )
    );
  };

  const reduceStock = (productId: number, amount: number) => {
    let wasSuccessful = true;

    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id !== productId) return product;

        const newQuantity = product.quantity - amount;

        if (newQuantity < 0) {
          wasSuccessful = false;
          return product;
        }

        return { ...product, quantity: newQuantity };
      })
    );

    return wasSuccessful;
  };

  const value = useMemo(
    () => ({
      products,
      setProducts,
      addStock,
      reduceStock,
    }),
    [products]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductsProvider");
  }

  return context;
}