import * as XLSX from 'xlsx';
import { Product } from '../types';
import { sanitizeValue, sanitizeNumber } from './formatters';

const COLUMN_MAP: Record<string, keyof Product> = {
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

export function parseExcelFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as unknown[][];
        
        if (jsonData.length < 2) {
          resolve([]);
          return;
        }

        const headers = (jsonData[0] as string[]).map(h => String(h || '').trim().toLowerCase());
        const products: Product[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.every(cell => !cell || String(cell).trim() === '')) continue;

          const product: Product = {
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
              (product[mappedKey] as number) = sanitizeNumber(value);
            } else {
              (product[mappedKey] as string) = sanitizeValue(value);
            }
          }

          if (product.sku) {
            products.push(product);
          }
        }

        resolve(products);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

export function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv');
}
