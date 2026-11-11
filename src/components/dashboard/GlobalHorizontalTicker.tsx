import React, { useState, useEffect, useRef } from 'react';
import { GlobalAssetData } from '../../types.ts';

interface GlobalHorizontalTickerProps {
  speed?: 'slow' | 'normal' | 'fast';
  isPaused?: boolean;
  onTogglePause?: () => void;
  onSelectAsset?: (asset: GlobalAssetData) => void;
}

export const GlobalHorizontalTicker: React.FC<GlobalHorizontalTickerProps> = ({
  speed = 'slow',
  isPaused: externalPaused,
  onTogglePause,
  onSelectAsset,
}) => {
  const [assets, setAssets] = useState<GlobalAssetData[]>([]);
  const [category, setCategory] = useState<'all' | 'stock' | 'index' | 'commodity' | 'forex'>('all');
  const [internalPaused, setInternalPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<GlobalAssetData | null>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const isPaused = externalPaused !== undefined ? externalPaused : internalPaused;
  const togglePause = onTogglePause || (() => setInternalPaused((p) => !p));

  const fetchGlobalQuotes = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/global/quotes');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.assets)) {
          setAssets(data.assets);
        }
      }
    } catch {
      // Keep existing data
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalQuotes();
    const interval = setInterval(fetchGlobalQuotes, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAssets = assets.filter((a) => {
    if (category === 'stock') return a.category === 'stock';
    if (category === 'index') return a.category === 'index';
    if (category === 'commodity') return a.category === 'commodity' || a.category === 'crypto';
    if (category === 'forex') return a.category === 'forex';
    return true;
  });

  const formatPrice = (asset: GlobalAssetData) => {
    if (asset.currency === 'IDR') {
      return `Rp ${asset.price.toLocaleString('id-ID')}`;
    }
    if (asset.category === 'index') {
      return asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAssetClick = (asset: GlobalAssetData) => {
    setSelectedAssetDetail(asset);
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'index': return '📈 Indeks Dunia';
      case 'stock': return '🏢 Saham Global';
      case 'commodity': return '🪙 Komoditas/Kripto';
      case 'forex': return '💵 Valas';
      case 'all':
      default: return '🌐 Semua Aset';
    }
  };

  return (
    <div className="flex items-center gap-2 pt-1 pb-1 border-t border-[#e5ddd0]/60 dark:border-[#26363d]/60 text-[11px] bg-[#f3ede1]/40 dark:bg-[#152328]/50 relative z-20">
      {/* Left Compact Category Selector */}
      <div className="flex items-center gap-1.5 flex-none pl-1 pr-2 border-r border-[#e5ddd0] dark:border-[#26363d] relative" ref={categoryMenuRef}>
        <button
          onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold border border-blue-500/30 hover:bg-blue-500/20 cursor-pointer text-[10px] whitespace-nowrap transition-colors"
          title="Pilih Kategori Bursa Dunia"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>{getCategoryLabel()}</span>
          <span className="text-[9px] opacity-70">▾</span>
        </button>

        {categoryMenuOpen && (
          <div
            className="absolute left-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#1a2a30] border border-[#d6ccbb] dark:border-[#304349] shadow-xl py-1 z-50 text-[10px] font-semibold space-y-0.5"
            onClick={() => setCategoryMenuOpen(false)}
          >
            <button
              onClick={() => setCategory('all')}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer ${
                category === 'all' ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-950/30' : ''
              }`}
            >
              <span>🌐 Semua Aset Global</span>
              {category === 'all' && <span>✓</span>}
            </button>
            <button
              onClick={() => setCategory('index')}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer ${
                category === 'index' ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-950/30' : ''
              }`}
            >
              <span>📈 Indeks Utama Dunia</span>
              {category === 'index' && <span>✓</span>}
            </button>
            <button
              onClick={() => setCategory('stock')}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer ${
                category === 'stock' ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-950/30' : ''
              }`}
            >
              <span>🏢 Saham Global & Wall St</span>
              {category === 'stock' && <span>✓</span>}
            </button>
            <button
              onClick={() => setCategory('commodity')}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer ${
                category === 'commodity' ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-950/30' : ''
              }`}
            >
              <span>🪙 Komoditas & Kripto</span>
              {category === 'commodity' && <span>✓</span>}
            </button>
            <button
              onClick={() => setCategory('forex')}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer ${
                category === 'forex' ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-950/30' : ''
              }`}
            >
              <span>💵 Valas (USD/IDR, dll)</span>
              {category === 'forex' && <span>✓</span>}
            </button>
          </div>
        )}
      </div>

      {/* Smooth Marquee Track: Running Kesamping with Max Width */}
      <div className="overflow-hidden relative flex-1 min-w-0">
        <div
          className={`global-ticker-horizontal-track speed-${speed} ${isPaused ? 'paused' : ''}`}
        >
          {[...filteredAssets, ...filteredAssets].map((asset, idx) => {
            const isUp = asset.changePercent >= 0;
            return (
              <div
                key={`${asset.symbol}-${idx}`}
                onClick={() => handleAssetClick(asset)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors flex-none mx-0.5 font-bold"
                title={`${asset.symbol} (${asset.name}) · Wilayah: ${asset.region} · Klik untuk lihat detail harga`}
              >
                <span className="text-xs select-none">{asset.flag}</span>
                <span className="tracking-tight text-[11px] text-[#17242a] dark:text-[#f3eee4]">
                  {asset.symbol}
                </span>
                <span className="text-[9.5px] font-normal text-[#56625f] dark:text-[#a9b3ad] hidden sm:inline max-w-[90px] truncate">
                  {asset.name}
                </span>
                <span className="font-mono text-[11px] text-[#17242a] dark:text-[#f3eee4]">
                  {formatPrice(asset)}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.2 py-0.2 rounded flex items-center gap-0.5 ${
                    isUp
                      ? 'text-emerald-700 bg-emerald-100/70 dark:text-emerald-300 dark:bg-emerald-950/50'
                      : 'text-rose-700 bg-rose-100/70 dark:text-rose-300 dark:bg-rose-950/50'
                  }`}
                >
                  <span>{isUp ? '▲' : '▼'}</span>
                  <span>{isUp ? '+' : ''}{asset.changePercent}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Controls: Refresh & Pause */}
      <div className="flex items-center gap-1.5 flex-none pr-1 pl-2 border-l border-[#e5ddd0] dark:border-[#26363d]">
        <button
          onClick={fetchGlobalQuotes}
          disabled={isRefreshing}
          className={`w-6 h-6 rounded-md hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] flex items-center justify-center text-xs cursor-pointer transition-colors ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          title="Perbarui Harga Bursa Dunia Realtime"
        >
          🔄
        </button>
        <button
          onClick={togglePause}
          className="w-6 h-6 rounded-md hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] flex items-center justify-center text-xs cursor-pointer font-bold transition-colors"
          title={isPaused ? 'Lanjutkan Ticker Bursa Dunia' : 'Jeda Ticker Bursa Dunia'}
          aria-label={isPaused ? 'Play Global Ticker' : 'Pause Global Ticker'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      {/* Asset Quick Detail Modal */}
      {selectedAssetDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAssetDetail(null)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--line)] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedAssetDetail.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-[var(--ink)]">
                      {selectedAssetDetail.symbol}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-[var(--line)] text-[var(--muted)]">
                      {selectedAssetDetail.region}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{selectedAssetDetail.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="w-7 h-7 rounded-lg hover:bg-[var(--line)] flex items-center justify-center text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[var(--muted)] font-medium">Harga Terkini</span>
                <div className="text-right">
                  <div className="font-mono text-xl font-black text-[var(--ink)]">
                    {formatPrice(selectedAssetDetail)}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                      selectedAssetDetail.changePercent >= 0
                        ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                        : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
                    }`}
                  >
                    <span>{selectedAssetDetail.changePercent >= 0 ? '▲' : '▼'}</span>
                    <span>
                      {selectedAssetDetail.changePercent >= 0 ? '+' : ''}
                      {selectedAssetDetail.changePercent}%
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      ({selectedAssetDetail.change >= 0 ? '+' : ''}
                      {selectedAssetDetail.change})
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--bg2)]/60 text-center font-mono">
                <div>
                  <div className="text-[10px] text-[var(--muted)] uppercase font-sans font-bold">Tertinggi</div>
                  <div className="text-xs font-bold text-[var(--ink)] mt-0.5">
                    {selectedAssetDetail.high ? formatPrice({ ...selectedAssetDetail, price: selectedAssetDetail.high }) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)] uppercase font-sans font-bold">Terendah</div>
                  <div className="text-xs font-bold text-[var(--ink)] mt-0.5">
                    {selectedAssetDetail.low ? formatPrice({ ...selectedAssetDetail, price: selectedAssetDetail.low }) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)] uppercase font-sans font-bold">Prev Close</div>
                  <div className="text-xs font-bold text-[var(--ink)] mt-0.5">
                    {selectedAssetDetail.previousClose ? formatPrice({ ...selectedAssetDetail, price: selectedAssetDetail.previousClose }) : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>Kategori: <b className="text-[var(--ink)] capitalize">{selectedAssetDetail.category}</b></span>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="px-3 py-1 bg-[var(--btn)] text-[var(--btn-fg)] rounded-lg font-bold text-xs cursor-pointer hover:opacity-90"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
