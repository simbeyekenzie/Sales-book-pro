import { Product } from "@/lib/types";

export function getTotalProducts(products: Product[]) {
  return products.length;
}

export function getTotalStockUnits(products: Product[]) {
  return products.reduce((total, product) => total + product.quantity, 0);
}

export function getLowStockCount(products: Product[]) {
  return products.filter((product) => product.quantity <= product.lowStock).length;
}

export function getTotalStockValue(products: Product[]) {
  return products.reduce(
    (total, product) => total + product.quantity * product.buyingPrice,
    0
  );
}

export function getTotalPotentialProfit(products: Product[]) {
  return products.reduce((total, product) => {
    const profitPerUnit = product.sellingPrice - product.buyingPrice;
    return total + profitPerUnit * product.quantity;
  }, 0);
}

export function getProductProfit(product: Product) {
  const profitPerUnit = product.sellingPrice - product.buyingPrice;
  const totalProfit = profitPerUnit * product.quantity;

  return {
    profitPerUnit,
    totalProfit,
  };
}