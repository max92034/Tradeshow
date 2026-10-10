// Temporary verification for legacy localStorage migration to zustand persist.
// Run: npx esbuild scripts/verify-migration.ts --bundle --platform=node --format=esm --outfile=node_modules/.tmp/verify-migration.mjs && node node_modules/.tmp/verify-migration.mjs

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
} as Storage;

// Seed legacy bare-JSON values (old utils/storage format)
store.set('tradeshow_products', JSON.stringify([{ sku: 'A1', description: 'Chair' }]));
store.set('tradeshow_orders', JSON.stringify([
  { id: 'o1', items: [{ sku: 'A1', quantity: 2, unitPrice: 10 }], subtotal: 20, totalItems: 2, totalCartons: 0, buyer: null, status: 'saved' },
]));

const assert = (cond: boolean, msg: string) => {
  if (!cond) { console.error('FAIL:', msg); process.exit(1); }
  console.log('ok:', msg);
};

const { useProductStore } = await import('../src/store/useProductStore');
const { useOrderStore } = await import('../src/store/useOrderStore');

// 1. Legacy products read back
const ps = useProductStore.getState();
assert(ps.products.length === 1, 'legacy products loaded');
assert(ps.products[0].sku === 'A1', 'sku preserved');
assert(ps.products[0].unit === 'PC', 'migrateProduct filled defaults');
assert(ps.isLoaded === true, 'isLoaded true for non-empty legacy products');

// 2. Legacy orders read back
const os = useOrderStore.getState();
assert(os.savedOrders.length === 1, 'legacy orders loaded');
assert(os.savedOrders[0].items[0].quantity === 2, 'order item quantity preserved');
assert(os.savedOrders[0].items[0].cartonQty === 0, 'migrateOrderItem filled defaults');
assert(os.isDrawerOpen === false, 'isDrawerOpen not persisted');

// 3. Next set writes new persist format
useProductStore.getState().loadProducts([{ sku: 'B2' } as never]);
const raw = store.get('tradeshow_products')!;
const parsed = JSON.parse(raw);
assert(parsed && typeof parsed === 'object' && 'state' in parsed && parsed.version === 0, 'products rewritten in persist format');
assert(parsed.state.products[0].sku === 'B2', 'new products persisted');

useOrderStore.getState().saveOrder();
const rawO = JSON.parse(store.get('tradeshow_orders')!);
assert('state' in rawO && Array.isArray(rawO.state.savedOrders), 'orders rewritten in persist format');
assert(!('currentOrder' in rawO.state) && !('isDrawerOpen' in rawO.state), 'only savedOrders persisted');

// 4. New-format value passes through untouched on next load
const { createLegacyJsonStorage } = await import('../src/utils/legacyStorage');
const storage = createLegacyJsonStorage(() => ({}));
assert(storage.getItem('tradeshow_products') === raw, 'persist-format value returned as-is');
assert(storage.getItem('missing_key') === null, 'missing key returns null');

// 5. Corrupt value does not crash
store.set('tradeshow_orders', 'not json{{{');
assert(storage.getItem('tradeshow_orders') === null, 'corrupt value returns null');

console.log('\nAll migration checks passed.');
