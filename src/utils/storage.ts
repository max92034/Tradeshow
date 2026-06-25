const ORDERS_KEY = 'tradeshow_orders';
const PRODUCTS_KEY = 'tradeshow_products';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : null;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

export const storageKeys = {
  ORDERS: ORDERS_KEY,
  PRODUCTS: PRODUCTS_KEY,
};
