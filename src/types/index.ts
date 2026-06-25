export interface Product {
  sku: string;
  description: string;
  location: string;
  length: number;
  width: number;
  height: number;
  fobPrice: number;
  unit: string;
  cartonQty: number;
  note: string;
  imageUrl: string;
  keyword: string;
}

export interface Buyer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  nationality: string;
  website: string;
  notes: string;
}

export interface OrderItem {
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
  cartonQty: number;
}

export interface Order {
  id: string;
  buyer: Buyer | null;
  items: OrderItem[];
  status: 'draft' | 'saved' | 'sent';
  subtotal: number;
  totalItems: number;
  totalCartons: number;
  createdAt: string;
  updatedAt: string;
  notes: string;
}
