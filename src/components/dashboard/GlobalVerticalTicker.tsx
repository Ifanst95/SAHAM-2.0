import React, { useState, useEffect } from 'react';
import { GlobalAssetData } from '../../types.ts';

interface GlobalVerticalTickerProps {
  onClose?: () => void;
  isFloating?: boolean;
}

export const GlobalVerticalTicker: React.FC<GlobalVerticalTickerProps> = ({
  onClose,
  isFloating = false,
}) => {
  const [assets, setAssets] = useState<GlobalAssetData[]>([]);
  const [category, setCategory] = useState<'all' | 'stock' | 'index' | 'commodity' | 'forex'>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGlobalQuotes = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/global/quotes');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.assets)) {
          setAssets(data.assets);
          setLastSync(new Date().toLocaleTimeString('id-ID'));
        }
      }
    } catch {
      // keep existing
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalQuotes();
    const interval = setInterval(fetchGlobalQuotes, 25000);
    return () => clearInterval(interval);
  }, []);

  const filteredAssets = category === 'all'
    ? assets
    : assets.filter((a) => {
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

  return (
    <div
      className={`flex flex-col bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-xl overflow-hidden transition-all ${
        isFloating ? 'w-80 max-h-[85vh]' : 'w-full h-full'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[var(--line)] bg-[var(--bg2)]/60 flex items-center justify-between flex-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5 text-[var(--ink)]">
              <span>🌐</span>
              <span>Bursa Dunia Realtime</span>
            </h3>
            <p className="text-[10px] text-[var(--muted)] font-mono">
              Ticker Berjalan Kebawah · {assets.length} Aset Global
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-6 h-6 rounded-md hover:bg-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer transition-colors"
            title={isPaused ? 'Lanjutkan Pergerakan Kebawah' : 'Jeda Pergerakan Kebawah'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            onClick={fetchGlobalQuotes}
            disabled={isRefreshing}
            className={`w-6 h-6 rounded-md hover:bg-[var(--line)] flex items-center justify-center text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Perbarui Harga Realtime Sekarang"
          >
            🔄
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md hover:bg-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--muted)] hover:text-[var(--down)] cursor-pointer transition-colors"
              title="Tutup Panel Bursa Dunia"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-2 py-1.5 border-b border-[var(--line)] bg-[var(--bg)]/40 flex items-center gap-1 text-[10px] overflow-x-auto no-scrollbar flex-none">
        <button
          onClick={() => setCategory('all')}
          className={`px-2 py-1 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
            category === 'all'
              ? 'bg-[var(--up-soft)] text-[var(--up)] border border-[var(--up)]/30'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setCategory('stock')}
          className={`px-2 py-1 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
            category === 'stock'
              ? 'bg-[var(--up-soft)] text-[var(--up)] border border-[var(--up)]/30'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Saham AS & Global
        </button>
        <button
          onClick={() => setCategory('index')}
          className={`px-2 py-1 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
            category === 'index'
              ? 'bg-[var(--up-soft)] text-[var(--up)] border border-[var(--up)]/30'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Indeks Dunia
        </button>
        <button
          onClick={() => setCategory('commodity')}
          className={`px-2 py-1 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
            category === 'commodity'
              ? 'bg-[var(--up-soft)] text-[var(--up)] border border-[var(--up)]/30'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Komoditas & Kripto
        </button>
        <button
          onClick={() => setCategory('forex')}
          className={`px-2 py-1 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
            category === 'forex'
              ? 'bg-[var(--up-soft)] text-[var(--up)] border border-[var(--up)]/30'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Valas
        </button>
      </div>

      {/* Downward Scrolling Marquee Container */}
      <div className="relative flex-1 overflow-hidden min-h-[360px] max-h-[500px]">
        {/* Subtle gradient overlays top and bottom for smooth visual edge */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[var(--card)] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[var(--card)] to-transparent z-10 pointer-events-none" />

        {/* Downward Track: duplicated list so animation is seamless */}
        <div
          className={`global-ticker-down-track p-2 space-y-2 ${isPaused ? 'paused' : ''}`}
        >
          {[...filteredAssets, ...filteredAssets].map((asset, idx) => {
            const isUp = asset.changePercent >= 0;
            return (
              <div
                key={`${asset.symbol}-${idx}`}
                className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 hover:bg-[var(--bg2)] hover:border-[var(--line2)] transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-none select-none">{asset.flag}</span>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <b className="font-bold text-xs text-[var(--ink)] tracking-tight">
                        {asset.symbol}
                      </b>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider bg-[var(--line)]/50 text-[var(--muted)]">
                        {asset.region}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--muted)] truncate font-medium">
                      {asset.name}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-none">
                  <div className="font-mono text-xs font-black text-[var(--ink)]">
                    {formatPrice(asset)}
                  </div>
                  <div
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${
                      isUp
                        ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                        : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
                    }`}
                  >
                    <span>{isUp ? '▲' : '▼'}</span>
                    <span>{isUp ? '+' : ''}{asset.changePercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-[var(--line)] bg-[var(--bg2)]/40 flex items-center justify-between text-[10px] text-[var(--muted)] flex-none">
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Realtime Feed Dunia</span>
        </span>
        {lastSync && <span>Sinkron: {lastSync} WIB</span>}
      </div>
    </div>
  );
};
