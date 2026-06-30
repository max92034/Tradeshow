import { useState, useEffect } from 'react';
import { SearchHeader } from '@/components/SearchHeader';
import { ResultsGrid } from '@/components/ResultsGrid';
import { UploadModal } from '@/components/UploadModal';
import { OrderDrawer } from '@/components/OrderDrawer';
import { OrderHistoryModal } from '@/components/OrderHistoryModal';
import { SettingsModal } from '@/components/SettingsModal';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { useSearchStore } from '@/store/useSearchStore';
import { useProductStore } from '@/store/useProductStore';
import { useOrderStore } from '@/store/useOrderStore';
import { Package, Upload as UploadIcon, Sparkles } from 'lucide-react';

export default function Home() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <SearchHeader
        onUploadClick={() => setUploadOpen(true)}
        onHistoryClick={() => setHistoryOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      
      <main className="px-4 sm:px-8 py-6 sm:py-8 pb-32 sm:pb-8 content-layer">
        {!isLoaded || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-fade-in">
            <div className="w-24 h-24 bg-[var(--accent-soft)] rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[var(--accent)]/10">
              <Package size={44} className="text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mb-3">
              Welcome to TradeShow
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md leading-relaxed">
              Upload your product catalog to start searching and building orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setUploadOpen(true)}
                className="btn-primary"
              >
                <UploadIcon size={18} />
                Upload Products
              </button>
              <button
                onClick={handleLoadSample}
                className="btn-secondary"
              >
                <Sparkles size={18} />
                Try Sample Data
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-5">
              Supports .xlsx, .xls, and .csv files
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <p className="text-sm text-[var(--text-secondary)] font-body">
                {query ? (
                  <span>
                    <span className="font-semibold text-[var(--text-primary)]">{results.length}</span> results
                    {results.length > 0 && (
                      <span className="text-[var(--text-muted)]"> of {products.length}</span>
                    )}
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold text-[var(--text-primary)]">{products.length}</span> products
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
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <VoiceSearchButton />
    </div>
  );
}
