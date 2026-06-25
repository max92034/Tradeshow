# Tradeshow Order Manager - Code Wiki

## 1. Project Overview

**Tradeshow Order Manager** is a mobile-first web application designed for sales representatives at trade shows. It enables instant product lookup via SKU search, barcode scanning, and voice input, with built-in order management, buyer profiles, and export capabilities.

- **Primary User**: Sales representatives (no login required)
- **Deployment**: Pure client-side (frontend only, no backend)
- **Key Advantage**: Works offline - all data stored locally in browser

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React UI Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ SearchHeader │  │ ResultsGrid  │  │ OrderDrawer      │   │
│  │ UploadModal  │  │ ProductCard  │  │ BuyerInfoForm    │   │
│  │ OrderHistory │  │ EmptyState   │  │ CartItem/Summary │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     Zustand State Store                      │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ useProductStore │  │ useSearchStore │  │ useOrderStore │   │
│  └─────────────────┘  └──────────────┘  └───────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     Data & Utilities                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ excelParser  │  │ formatters   │  │ localStorage     │   │
│  │ orderExport  │  │ sampleData   │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Mobile-First** | Phone and iPad are primary targets. Desktop is secondary. |
| **Offline-First** | All data client-side. Works without internet after initial load. |
| **Instant Feedback** | Real-time search with 150ms debounce. No submit button needed. |
| **Local Persistence** | Products and orders saved in `localStorage` across sessions. |
| **No Backend** | Zero server dependency. Deploy as static files anywhere. |

## 3. Project Structure

```
Tradeshow App/
├── .trae/documents/           # PRD and technical architecture docs
├── public/                    # Static assets
├── scripts/                   # Build scripts (sample data generator)
├── src/
│   ├── components/            # React components
│   │   ├── SearchHeader.tsx       # Sticky header with search bar
│   │   ├── ResultsGrid.tsx        # Product results grid layout
│   │   ├── ProductCard.tsx        # Individual product display card
│   │   ├── UploadModal.tsx        # Excel/CSV file upload modal
│   │   ├── OrderDrawer.tsx        # Side drawer for current order
│   │   ├── BuyerInfoForm.tsx      # Buyer profile form
│   │   ├── CartItem.tsx           # Single line item in cart
│   │   ├── OrderSummary.tsx       # Order totals + action buttons
│   │   ├── OrderHistoryModal.tsx  # Saved orders list
│   │   └── Empty.tsx              # Default empty component
│   ├── data/
│   │   └── sampleProducts.ts      # Pre-loaded demo product data
│   ├── hooks/
│   │   ├── useDebounce.ts         # Debounce hook for search
│   │   ├── useVoiceSearch.ts      # Web Speech API integration
│   │   └── useTheme.ts            # Theme toggle (default template)
│   ├── lib/
│   │   └── utils.ts               # cn() class merging utility
│   ├── pages/
│   │   └── Home.tsx               # Main application page
│   ├── store/
│   │   ├── useProductStore.ts     # Product catalog state
│   │   ├── useSearchStore.ts      # Search query + results state
│   │   └── useOrderStore.ts       # Cart + orders state
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── utils/
│   │   ├── excelParser.ts         # Excel/CSV parsing (SheetJS)
│   │   ├── formatters.ts          # Data formatting helpers
│   │   └── storage.ts             # localStorage wrappers
│   ├── App.tsx                    # Root app component with routing
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Global styles + Tailwind + animations
│   └── vite-env.d.ts              # Vite type definitions
├── sample import.xlsx          # Sample product catalog (Excel)
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── index.html                  # HTML entry point
```

## 4. Core Modules

### 4.1 State Management (Zustand)

The application uses **Zustand** for state management with three separate stores for clean separation of concerns.

#### useProductStore — Product Catalog
**File**: [src/store/useProductStore.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/store/useProductStore.ts)

Manages the loaded product catalog.

| State | Type | Description |
|-------|------|-------------|
| `products` | `Product[]` | Array of all loaded products |
| `isLoaded` | `boolean` | Whether products have been loaded |

| Action | Parameters | Description |
|--------|------------|-------------|
| `loadProducts` | `products: Product[]` | Replace entire product list |
| `clearProducts` | — | Clear all products |
| `getProductBySku` | `sku: string` | Find product by SKU (case-insensitive) |
| `loadSampleData` | — | Load bundled demo products |

**Persistence**: Products are cached in `localStorage` under key `tradeshow_products`. Automatically restored on app load.

---

#### useSearchStore — Search & Results
**File**: [src/store/useSearchStore.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/store/useSearchStore.ts)

Manages search query and filtered results.

| State | Type | Description |
|-------|------|-------------|
| `query` | `string` | Current search query |
| `results` | `Product[]` | Filtered product results |

| Action | Parameters | Description |
|--------|------------|-------------|
| `setQuery` | `query: string` | Update the search query |
| `performSearch` | `query: string` | Filter products by query across SKU, description, keyword, and location |

**Search algorithm**: Case-insensitive substring matching across 4 fields:
1. `sku` — product code (highest implicit priority by specificity)
2. `description` — product name/description
3. `keyword` — tags/categories
4. `location` — warehouse/booth location

---

#### useOrderStore — Cart & Orders
**File**: [src/store/useOrderStore.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/store/useOrderStore.ts)

Manages the current order, saved order history, and drawer state.

| State | Type | Description |
|-------|------|-------------|
| `currentOrder` | `Order` | The active order being built |
| `savedOrders` | `Order[]` | List of all saved orders |
| `isDrawerOpen` | `boolean` | Whether the order drawer is visible |

| Action | Parameters | Description |
|--------|------------|-------------|
| `addItem` | `product: Product, qty?: number` | Add product to order (increments if exists) |
| `removeItem` | `sku: string` | Remove item by SKU |
| `updateQuantity` | `sku: string, qty: number` | Set exact quantity (removes if qty ≤ 0) |
| `setBuyer` | `buyer: Partial<Buyer>` | Update buyer info on current order |
| `saveOrder` | — | Persist current order to saved list |
| `loadOrder` | `id: string` | Load a saved order as current |
| `deleteOrder` | `id: string` | Delete a saved order |
| `newOrder` | — | Create a fresh empty order |
| `toggleDrawer` | `open?: boolean` | Open/close the order drawer |
| `recalcTotals` | — | Recompute subtotal, items, cartons |

**Auto-calculated fields** on the order:
- `subtotal` — sum of (quantity × unitPrice)
- `totalItems` — total units across all items
- `totalCartons` — estimated cartons (ceil(quantity / cartonQty))

**Persistence**: Saved orders stored in `localStorage` under key `tradeshow_orders`.

### 4.2 Components

#### SearchHeader
**File**: [src/components/SearchHeader.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/SearchHeader.tsx)

Sticky top header containing:
- Large search input with search icon
- Clear button (visible when query exists)
- Voice search microphone button (Web Speech API)
- Barcode scan button (UI only — Barcode Detection API integration ready)
- Upload button (opens UploadModal)
- Order history button (opens OrderHistoryModal)
- Cart button with item count badge (opens OrderDrawer)

**Responsive**: On mobile, the logo text hides and scan button moves to overflow. Badge animates with bounce effect when items change.

---

#### ResultsGrid
**File**: [src/components/ResultsGrid.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/ResultsGrid.tsx)

Responsive grid layout for product cards:
- 1 column on mobile (sm)
- 2 columns on tablet (md)
- 3 columns on desktop (xl)

Features:
- Skeleton loading state (6 placeholders)
- Empty state when no products match
- Staggered fade-in animation for results (30ms delay per card, max 300ms)

---

#### ProductCard
**File**: [src/components/ProductCard.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/ProductCard.tsx)

Product display card with horizontal layout (image left, content right on desktop; stacked on mobile).

Displays:
- Product image (or package icon placeholder)
- SKU code (monospace, cyan badge)
- Description (2-line clamp)
- Location pin
- Dimensions: `L * W * H CM` format
- Carton quantity: `?pcs/Carton` format
- FOB Price (bold, emerald green)
- Note (italic, 1-line clamp)
- Quantity stepper (+/- buttons)
- "Add" button (turns green with checkmark on add)
- "Add & View" button (desktop only — adds and opens drawer)

---

#### UploadModal
**File**: [src/components/UploadModal.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/UploadModal.tsx)

Modal dialog for uploading product catalog files.

Features:
- Drag-and-drop zone + click-to-browse
- Supports `.xlsx`, `.xls`, `.csv`
- Visual states: idle, dragging, loading (spinner), success (checkmark), error
- Displays required column names as reference
- Auto-closes 1.5s after successful upload
- Treats `#N/A` values as blank

---

#### OrderDrawer
**File**: [src/components/OrderDrawer.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/OrderDrawer.tsx)

Side drawer (right side on desktop) containing the full order interface.

Sections (top to bottom):
1. Header with order title, item count, new order button, close button
2. BuyerInfoForm (collapsible)
3. Cart items list (scrollable) — or empty state
4. OrderSummary (fixed at bottom when items exist)

**Animation**: Slides in from right with 300ms ease-out transition. Backdrop with 50% opacity + backdrop blur.

---

#### BuyerInfoForm
**File**: [src/components/BuyerInfoForm.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/BuyerInfoForm.tsx)

Collapsible form for entering buyer details.

Fields:
- Buyer Name (user icon)
- Company (building icon)
- Email (mail icon)
- Phone (phone icon)

Header shows summary when collapsed. All icons positioned inside input (left-padded).

---

#### CartItem
**File**: [src/components/CartItem.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/CartItem.tsx)

Single line item in the order cart.

Layout:
- Thumbnail image (64×64px)
- SKU (monospace, cyan)
- Description (2-line clamp)
- Quantity stepper (+/-)
- Line total price (bold, emerald)
- Trash/remove button

---

#### OrderSummary
**File**: [src/components/OrderSummary.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/OrderSummary.tsx)

Order totals and action buttons (fixed at bottom of drawer).

Display:
- Items count in pcs
- Estimated cartons count
- Subtotal in USD

Actions:
- **Save Order** — saves to localStorage, shows checkmark animation
- **Export** — downloads Excel file
- **Send via Email** — opens mailto: with order details

---

#### OrderHistoryModal
**File**: [src/components/OrderHistoryModal.tsx](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/components/OrderHistoryModal.tsx)

Modal listing all saved orders with:
- Company / buyer name
- Date & time updated
- Item count
- Subtotal
- Email (if available)
- Delete button (shows on hover)
- Click to load/resume order

Empty state when no saved orders.

### 4.3 Custom Hooks

#### useDebounce
**File**: [src/hooks/useDebounce.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/hooks/useDebounce.ts)

Generic debounce hook. Returns value that updates only after `delay` ms of inactivity.

Used by: SearchHeader → debounces search input to 150ms.

---

#### useVoiceSearch
**File**: [src/hooks/useVoiceSearch.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/hooks/useVoiceSearch.ts)

Web Speech API integration for voice-to-text search.

| Return | Type | Description |
|--------|------|-------------|
| `isListening` | `boolean` | Whether recognition is active |
| `isSupported` | `boolean` | Browser support detection |
| `transcript` | `string` | Live transcription text |
| `startListening` | `() => void` | Start voice recognition |
| `stopListening` | `() => void` | Stop recognition |

**Browser support**: Chrome, Edge, Safari (webkitSpeechRecognition prefix handled). Button hidden if unsupported.

### 4.4 Utilities

#### excelParser
**File**: [src/utils/excelParser.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/utils/excelParser.ts)

Parses Excel/CSV files into `Product[]` using **SheetJS (xlsx)**.

Column mapping (case-insensitive):
| Excel Header | Product Property |
|--------------|------------------|
| SKU | `sku` |
| Description | `description` |
| Location | `location` |
| L | `length` |
| W | `width` |
| H | `height` |
| FOB / FOB Price | `fobPrice` |
| Unit | `unit` |
| Carton Qty / CTN Qty | `cartonQty` |
| Note / Notes | `note` |
| IMG / Image / ImageUrl | `imageUrl` |
| Keyword / Keywords | `keyword` |

**Data cleaning**:
- `#N/A`, `N/A`, empty strings → treated as blank/0
- Rows without SKU are skipped
- Empty rows are skipped

---

#### formatters
**File**: [src/utils/formatters.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/utils/formatters.ts)

| Function | Signature | Description |
|----------|-----------|-------------|
| `formatDimensions` | `(Product) => string` | Returns `L * W * H CM` |
| `formatCartonQty` | `(Product) => string` | Returns `?pcs/Carton` |
| `formatPrice` | `(number) => string` | Returns `$X.XX` |
| `calculateSubtotal` | `(OrderItem[]) => number` | Sum of qty × price |
| `calculateTotalItems` | `(OrderItem[]) => number` | Total unit count |
| `calculateTotalCartons` | `(OrderItem[]) => number` | Ceiling of qty/carton per item |
| `sanitizeValue` | `(unknown) => string` | Clean string, handle #N/A |
| `sanitizeNumber` | `(unknown) => number` | Clean number, handle #N/A |
| `generateId` | `() => string` | Timestamp + random alphanumeric |

---

#### storage
**File**: [src/utils/storage.ts](file:///c:/Users/max92034/Documents/Tradeshow%20App/src/utils/storage.ts)

Type-safe localStorage wrappers with error handling.

| Function | Description |
|----------|-------------|
| `saveToStorage<T>(key, data)` | Serialize and save JSON |
| `loadFromStorage<T>(key)` | Parse and return JSON (null if missing/error) |
| `removeFromStorage(key)` | Delete item |
| `storageKeys` | Constants: `ORDERS`, `PRODUCTS` |

## 5. Data Models

### 5.1 Product
```typescript
interface Product {
  sku: string;           // Product code (primary identifier)
  description: string;   // Product name/description
  location: string;      // Warehouse or booth location
  length: number;        // cm
  width: number;         // cm
  height: number;        // cm
  fobPrice: number;      // FOB price in USD
  unit: string;          // Unit of measure (default: "PC")
  cartonQty: number;     // Pieces per carton
  note: string;          // Additional notes
  imageUrl: string;      // Product image URL
  keyword: string;       // Search keywords/tags
}
```

### 5.2 Buyer
```typescript
interface Buyer {
  id: string;            // Unique identifier
  name: string;          // Buyer name
  company: string;       // Company name
  email: string;         // Email address
  phone: string;         // Phone number
  notes: string;         // Additional notes
}
```

### 5.3 OrderItem
```typescript
interface OrderItem {
  sku: string;           // Product SKU
  description: string;   // Snapshot of product description
  quantity: number;      // Units ordered
  unitPrice: number;     // Price at time of adding
  imageUrl: string;      // Snapshot of image URL
  cartonQty: number;     // Pieces per carton (for estimates)
}
```

### 5.4 Order
```typescript
interface Order {
  id: string;                  // Unique order ID
  buyer: Buyer | null;         // Associated buyer profile
  items: OrderItem[];          // Line items
  status: 'draft' | 'saved' | 'sent';
  subtotal: number;            // Auto-calculated
  totalItems: number;          // Auto-calculated (units)
  totalCartons: number;        // Auto-calculated (estimated)
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
  notes: string;               // Order-level notes
}
```

## 6. Dependency Relationships

```
                        App.tsx
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      SearchHeader    ResultsGrid    OrderDrawer (and modals)
            │              │              │
            ├──────────────┴──────────────┤
            │                             │
            ▼                             ▼
    useSearchStore              useOrderStore ──────┐
            │                             │        │
            ▼                             ▼        ▼
    useProductStore ──────────────── localStorage  │
            │                                      │
            ▼                                      ▼
    sampleProducts.ts                        OrderSummary
    (initial data)                              │
                                                 ▼
                                            excelParser
                                            (SheetJS/xlsx)
```

### Key Dependency Rules

| Layer | Depends On | Never Depends On |
|-------|-----------|-----------------|
| Components | Hooks, Store, Types | Other components' internals |
| Hooks | Store, Types | Components |
| Store | Types, Utils | Components, Hooks |
| Utils | Types | Everything else (pure) |
| Types | Nothing | Everything |

## 7. Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | 18.3 | UI rendering |
| Language | TypeScript | 5.8 | Type safety |
| Build Tool | Vite | 6.x | Dev server + build |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS |
| State Management | Zustand | 5.0 | Global state |
| Routing | React Router | 7.x | Client-side routing |
| Icons | Lucide React | 0.511 | Icon library |
| Excel | SheetJS (xlsx) | latest | Parse & export Excel |
| Voice | Web Speech API | Browser native | Voice-to-text |
| Storage | localStorage | Browser native | Local persistence |
| Class Utils | clsx + tailwind-merge | latest | Conditional className merging |

## 8. Running the Project

### 8.1 Prerequisites
- **Node.js** ≥ 18 (LTS recommended)
- **npm** or **pnpm**

### 8.2 Installation
```bash
cd "Tradeshow App"
npm install
```

### 8.3 Development
```bash
npm run dev
```
- Starts Vite dev server at `http://localhost:5173/`
- Hot module replacement (HMR) enabled
- Type checking on save

### 8.4 Production Build
```bash
npm run build
```
- Outputs to `dist/` directory
- TypeScript type check + Vite build
- Static files can be deployed to any host (Netlify, Vercel, S3, etc.)

### 8.5 Preview Production Build
```bash
npm run preview
```

### 8.6 Type Checking
```bash
npm run check
```

### 8.7 Linting
```bash
npm run lint
```

## 9. Performance Notes

### Real-Time Search Performance

**Q: Will real-time (as-you-type) search impact performance?**

**A: No — it's perfectly safe and highly recommended.** Here's why:

| Factor | Analysis |
|--------|----------|
| **Data location** | All products in browser memory — no network latency |
| **Search algorithm** | Simple `Array.filter()` with substring matching — O(n) per search, microseconds per item |
| **Debouncing** | 150ms delay prevents search on every single keystroke — only fires when user pauses typing |
| **Dataset size** | 1,000 products → ~0.5ms search. 10,000 products → ~5ms. Both well under 16ms frame budget |
| **Memory** | 1,000 products ≈ 200-500KB in memory. Negligible. |
| **Render cost** | The main bottleneck is rendering many result cards. For 100+ results, virtualization could be added. |

**Recommendation**: Keep real-time search. The UX benefit of instant feedback is enormous for a fast-paced trade show environment, and the performance cost is zero for realistic catalog sizes.

**If you need 50,000+ products**: Add virtualized list rendering (e.g., `react-window`) and/or index-based search.

### Bundle Size
- Current bundle: ~230KB gzipped
- Largest dependency: SheetJS (xlsx) — required for client-side Excel parsing
- No backend means no server round-trips

## 10. Key Flows

### 10.1 Product Search Flow
```
User types → setQuery() → 150ms debounce → performSearch()
    → filter products by SKU/desc/keyword/location → results update → re-render grid
```

### 10.2 Add to Order Flow
```
Click "Add" → addItem(product, qty)
    → find existing item (increment qty) OR create new OrderItem
    → recalc subtotal/totalItems/totalCartons
    → update currentOrder → cart badge bounces
```

### 10.3 Save Order Flow
```
Click "Save" → saveOrder()
    → set status = 'saved'
    → add/update in savedOrders array
    → persist to localStorage
    → button shows checkmark animation
```

### 10.4 Excel Export Flow
```
Click "Export" → build 2D array (buyer info + headers + items + totals)
    → XLSX.utils.aoa_to_sheet → XLSX.writeFile
    → downloads order-<id>.xlsx
```

### 10.5 Email Order Flow
```
Click "Send via Email" → build order summary text
    → window.location.href = mailto:<buyer email>?subject=...&body=...
    → opens user's default mail client
```

## 11. Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Core App | ✅ | ✅ | ✅ | ✅ |
| Voice Search | ✅ | ✅ | ✅ | ❌ |
| Barcode Detection | ✅ | ✅ | Partial | ❌ |
| localStorage | ✅ | ✅ | ✅ | ✅ |
| Excel Export | ✅ | ✅ | ✅ | ✅ |

**Fallback strategy**: Features not supported by the browser are hidden from the UI (graceful degradation).

## 12. Customization Points

- **Colors**: Tailwind config → primary slate, accent cyan, success emerald, warning amber
- **Sample data**: Edit `src/data/sampleProducts.ts`
- **Excel column mapping**: Edit `COLUMN_MAP` in `src/utils/excelParser.ts`
- **Debounce delay**: Edit `delay` parameter in `useDebounce` usage in SearchHeader
- **LocalStorage keys**: Edit `storageKeys` in `src/utils/storage.ts`

## 13. File Reference

| File | Lines | Responsibility |
|------|-------|----------------|
| `src/pages/Home.tsx` | 102 | Main page layout + state orchestration |
| `src/components/SearchHeader.tsx` | ~120 | Sticky search bar with all header actions |
| `src/components/ProductCard.tsx` | ~130 | Product display + add-to-order |
| `src/components/OrderDrawer.tsx` | ~85 | Order drawer layout |
| `src/components/OrderSummary.tsx` | ~100 | Order totals + save/export/email |
| `src/store/useOrderStore.ts` | ~130 | Cart and order state management |
| `src/store/useProductStore.ts` | ~50 | Product catalog state |
| `src/store/useSearchStore.ts` | ~35 | Search query and results |
| `src/utils/excelParser.ts` | ~85 | Excel/CSV parsing logic |
| `src/utils/formatters.ts` | ~60 | Data formatting + calculations |
| `src/types/index.ts` | ~40 | All TypeScript interfaces |
