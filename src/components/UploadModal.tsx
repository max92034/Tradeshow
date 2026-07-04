import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile, isExcelFile } from '../utils/excelParser';
import { useProductStore } from '../store/useProductStore';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadProducts = useProductStore(state => state.loadProducts);
  const performSearch = useSearchStore(state => state.performSearch);

  const handleFile = async (file: File) => {
    if (!isExcelFile(file)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setLoading(true);
    setSuccess(false);
    setProgress(30);

    try {
      const products = await parseExcelFile(file);
      setProgress(70);
      
      if (products.length === 0) {
        setError('No products found in the file. Make sure there is a SKU column.');
        setLoading(false);
        setProgress(0);
        return;
      }
      
      loadProducts(products);
      performSearch('');
      setProductCount(products.length);
      setProgress(100);
      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedFile(null);
        setProgress(0);
      }, 1500);
    } catch {
      setError('Failed to parse file. Please check the format.');
      setLoading(false);
      setProgress(0);
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (selectedFile && !loading && !success) {
      handleFile(selectedFile);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-modal">
      <div
        className="bg-[var(--bg-card)] w-full sm:max-w-lg sm:rounded-xl rounded-t-xl sm:shadow-xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up sm:animate-scale-enter"
      >
        <div className="flex items-center justify-between px-6 py-6 pb-4 border-b border-[var(--border-soft)] flex-shrink-0">
          <h2
            className="font-semibold"
            style={{ fontSize: 'var(--text-h3)', color: 'var(--text-primary)' }}
          >
            Upload Catalog
          </h2>
          <button
            onClick={onClose}
            className="icon-btn text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: '70vh' }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !loading && !success && fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
              dragOver
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] cursor-pointer'
                : success
                ? 'border-[var(--success)] bg-[var(--success)]/10'
                : error
                ? 'border-[var(--danger)] bg-[var(--danger)]/10'
                : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] cursor-pointer'
            )}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <p style={{ color: 'var(--text-secondary)' }}>Parsing file...</p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle size={48} style={{ color: 'var(--success)' }} />
                <div>
                  <p
                    className="font-semibold"
                    style={{ fontSize: 'var(--text-h3)', color: 'var(--success)' }}
                  >
                    {productCount} products loaded!
                  </p>
                  <p style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>
                    Ready to search
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3">
                <AlertCircle size={48} style={{ color: 'var(--danger)' }} />
                <div>
                  <p
                    className="font-semibold"
                    style={{ fontSize: 'var(--text-h3)', color: 'var(--danger)' }}
                  >
                    Upload failed
                  </p>
                  <p style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>
                    {error}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  <Upload size={28} />
                </div>
                <p
                  className="font-semibold mb-1"
                  style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}
                >
                  Drop your catalog here
                </p>
                <p
                  className="mb-4"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--text-secondary)' }}
                >
                  or click to browse
                </p>
                <p
                  style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}
                >
                  Supports XLSX, CSV, PDF
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf"
            onChange={handleFileInput}
            className="hidden"
          />

          {selectedFile && !success && (
            <div className="mt-4 p-4 rounded-lg bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}
                  >
                    {selectedFile.name}
                  </p>
                  <p
                    style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}
                  >
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!loading && (
                  <button
                    onClick={handleRemoveFile}
                    className="icon-btn text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10"
                    style={{ width: '32px', height: '32px' }}
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {loading && (
                <div className="mt-3">
                  <div className="w-full h-1.5 rounded-full bg-[var(--border-soft)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        background: 'var(--accent)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 rounded-lg bg-[var(--bg-secondary)]">
            <p
              className="font-medium mb-2"
              style={{ fontSize: 'var(--text-small)', color: 'var(--text-primary)' }}
            >
              Required columns:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['SKU', 'Description', 'Location', 'L', 'W', 'H', 'FOB', 'Carton Qty', 'IMG', 'Keyword'].map(col => (
                <span
                  key={col}
                  className="px-2.5 py-1 rounded-full font-medium"
                  style={{
                    fontSize: 'var(--text-caption)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-soft)] flex-shrink-0">
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading || success}
            className={cn(
              'btn-primary',
              (!selectedFile || loading || success) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Upload size={18} />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
