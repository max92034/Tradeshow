import { useState, useEffect } from 'react';
import { SearchHeader } from '@/components/SearchHeader';
import { ResultsGrid } from '@/components/ResultsGrid';
import { UploadModal } from '@/components/UploadModal';
import { OrderDrawer } from '@/components/OrderDrawer';
import { OrderHistoryModal } from '@/components/OrderHistoryModal';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { useSearchStore } from '@/store/useSearchStore';
import { useProductStore } from '@/store/useProductStore';
import { useOrderStore } from '@/store/useOrderStore';
import { Package, Upload as UploadIcon, Sparkles } from 'lucide-react';

export default function Home() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const results = useSearchStore(state => state.results);
  const query = useSearchStore(state => state.query);
  const isLoaded = useProductStore(state => state.isLoaded);
  const products = useProductStore(state => state.products);
  const isDrawerOpen = useOrderStore(state => state.isDrawerOpen);
  const toggleDrawer = useOrderStore(state => state.toggleDrawer);
  const loadSampleData = useProductStore(state => state.loadSampleData);
  const performSearch = useSearchStore(state => state.performSearch);

  useEffect(() => {
    if (isLoaded && products.length > 0) {
      performSearch('');
    }
  }, [isLoaded, products.length, performSearch]);

  const handleLoadSample = () => {
    loadSampleData();
    performSearch('');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <SearchHeader
        onUploadClick={() => setUploadOpen(true)}
        onHistoryClick={() => setHistoryOpen(true)}
      />
      
      <main className="px-3 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-32">
        {!isLoaded || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="text-cyan-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              Welcome to TradeShow Order Manager
            </h2>
            <p className="text-slate-500 mb-6 max-w-md">
              Upload your product catalog to start searching and building orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-600/25"
              >
                <UploadIcon size={20} />
                Upload Products
              </button>
              <button
                onClick={handleLoadSample}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 font-semibold rounded-xl transition-all active:scale-95"
              >
                <Sparkles size={20} />
                Try Sample Data
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Supports .xlsx, .xls, and .csv files
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                {query ? (
                  <span>
                    <span className="font-semibold text-slate-800">{results.length}</span> results
                    {results.length > 0 && (
                      <span className="text-slate-400"> of {products.length}</span>
                    )}
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold text-slate-800">{products.length}</span> products
                  </span>
                )}
              </p>
            </div>
            <ResultsGrid products={results} />
          </>
        )}
      </main>
      
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
      <OrderDrawer isOpen={isDrawerOpen} onClose={() => toggleDrawer(false)} />
      <OrderHistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <VoiceSearchButton />
    </div>
  );
}
