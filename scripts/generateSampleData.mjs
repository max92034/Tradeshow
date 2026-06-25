import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const excelPath = path.join(__dirname, '../sample import.xlsx');
const outputPath = path.join(__dirname, '../src/data/sampleProducts.ts');

const workbook = XLSX.readFile(excelPath);
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

const headers = jsonData[0].map(h => String(h || '').trim().toLowerCase());

const COLUMN_MAP = {
  'sku': 'sku',
  'description': 'description',
  'location': 'location',
  'l': 'length',
  'w': 'width',
  'h': 'height',
  'fob': 'fobPrice',
  'fob price': 'fobPrice',
  'unit': 'unit',
  'carton qty': 'cartonQty',
  'cartonqty': 'cartonQty',
  'ctn qty': 'cartonQty',
  'note': 'note',
  'notes': 'note',
  'img': 'imageUrl',
  'image': 'imageUrl',
  'imageurl': 'imageUrl',
  'keyword': 'keyword',
  'keywords': 'keyword',
};

function sanitizeValue(value) {
  if (value == null) return '';
  const str = String(value).trim();
  if (str === '#N/A' || str === '#N/A ' || str.toLowerCase() === 'n/a') return '';
  return str;
}

function sanitizeNumber(value) {
  if (value == null) return 0;
  const str = String(value).trim();
  if (str === '#N/A' || str === '' || str.toLowerCase() === 'n/a') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

const products = [];

for (let i = 1; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (!row || row.every(cell => !cell || String(cell).trim() === '')) continue;

  const product = {
    sku: '',
    description: '',
    location: '',
    length: 0,
    width: 0,
    height: 0,
    fobPrice: 0,
    unit: 'PC',
    cartonQty: 0,
    note: '',
    imageUrl: '',
    keyword: '',
  };

  for (let j = 0; j < headers.length; j++) {
    const header = headers[j];
    const mappedKey = COLUMN_MAP[header];
    if (!mappedKey) continue;

    const value = row[j];
    if (mappedKey === 'length' || mappedKey === 'width' || mappedKey === 'height' || 
        mappedKey === 'fobPrice' || mappedKey === 'cartonQty') {
      product[mappedKey] = sanitizeNumber(value);
    } else {
      product[mappedKey] = sanitizeValue(value);
    }
  }

  if (product.sku) {
    products.push(product);
  }
}

const tsContent = `import { Product } from '../types';

export const sampleProducts: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, tsContent);
console.log(`Generated ${products.length} sample products`);
