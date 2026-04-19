export type Product = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  buyingPrice: number;
  sellingPrice: number;
  lowStock: number;
  barcode?: string;
};

export type SaleItem = {
  productId: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  costPrice: number;
};

export type Invoice = {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: SaleItem[];
  total: number;
  profit: number;
};

export type DailySale = {
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  total: number;
  profit: number;
};