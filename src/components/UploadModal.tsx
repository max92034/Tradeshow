import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile, isExcelFile } from '../utils/excelParser';
import { useProductStore } from '../store/useProductStore';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadProducts = useProductStore(state => state.loadProducts);
  const performSearch = useSearchStore(state => state.performSearch);

  const handleFile = async (file: File) => {
    if (!isExcelFile(file)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const products = await parseExcelFile(file);
      if (products.length === 0) {
        setError('No products found in the file. Make sure there is a SKU column.');
        setLoading(false);
        return;
      }
      
      loadProducts(products);
      performSearch('');
      setProductCount(products.length);
      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Failed to parse file. Please check the format.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Upload Products</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all",
              dragOver
                ? "border-cyan-500 bg-cyan-50"
                : success
                ? "border-emerald-500 bg-emerald-50"
                : error
                ? "border-red-300 bg-red-50"
                : "border-slate-300 hover:border-cyan-400 hover:bg-slate-50"
            )}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-600 font-medium">Parsing file...</p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle size={48} className="text-emerald-500" />
                <div>
                  <p className="text-emerald-700 font-semibold text-lg">{productCount} products loaded!</p>
                  <p className="text-emerald-600 text-sm">Ready to search</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3">
                <AlertCircle size={48} className="text-red-500" />
                <div>
                  <p className="text-red-700 font-semibold">Upload failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet size={32} className="text-cyan-600" />
                </div>
                <p className="text-slate-800 font-semibold mb-1">Drop your Excel file here</p>
                <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                <p className="text-xs text-slate-400">Supports .xlsx, .xls, .csv</p>
                <p className="text-xs text-slate-400 mt-1">#N/A values are treated as blank</p>
              </>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-600 mb-2">Required columns:</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['SKU', 'Description', 'Location', 'L', 'W', 'H', 'FOB', 'Carton Qty', 'IMG', 'Keyword'].map(col => (
                <span key={col} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
