import { Product, Order, OrderItem } from '../types';

export function formatDimensions(product: Product): string {
  if (!product.length && !product.width && !product.height) return '';
  const l = product.length || 0;
  const w = product.width || 0;
  const h = product.height || 0;
  return `${l} * ${w} * ${h} CM`;
}

export function formatCartonQty(product: Product): string {
  if (!product.cartonQty) return '';
  return `${product.cartonQty}pcs/Carton`;
}

export function formatPrice(price: number): string {
  if (price == null || isNaN(price)) return '';
  return `$${price.toFixed(2)}`;
}

export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function calculateTotalItems(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateTotalCartons(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.cartonQty) return sum;
    return sum + Math.ceil(item.quantity / item.cartonQty);
  }, 0);
}

export function sanitizeValue(value: unknown): string {
  if (value == null) return '';
  const str = String(value).trim();
  if (str === '#N/A' || str === '#N/A ' || str.toLowerCase() === 'n/a') return '';
  return str;
}

export function sanitizeNumber(value: unknown): number {
  if (value == null) return 0;
  const str = String(value).trim();
  if (str === '#N/A' || str === '' || str.toLowerCase() === 'n/a') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
