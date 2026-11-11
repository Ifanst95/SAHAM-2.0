import React from 'react';
import { StockData } from '../../types.ts';

interface WatchlistViewProps {
  watchlist: string[];
  stocks: StockData[];
  onToggleWatchlist: (ticker: string) => void;
  onSelectStock: (ticker: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  stocks,
  onToggleWatchlist,
  onSelectStock,
}) => {
  const watchedStocks = stocks.filter((s) => watchlist.includes(s.ticker));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <span className="text-amber-400">★</span> Saham Dipantau (Watchlist Pribadi)
          </h2>
          <p className="text-xs text-[#80887f]">
            Daftar saham yang kamu tandai untuk dipantau secara intensif sebelum konfirmasi masuk.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/30">
          {watchedStocks.length} Saham di Watchlist
        </span>
      </div>

      {watchedStocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchedStocks.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3 hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <b className="text-xl font-black tracking-tight">{s.ticker}</b>
                    <span className="text-xs text-[#80887f] block">{s.name}</span>
                  </div>
                  <button
                    onClick={() => onToggleWatchlist(s.ticker)}
                    className="p-2 text-amber-400 hover:text-amber-500 text-lg cursor-pointer"
                    title="Hapus dari Pantauan"
                  >
                    ★
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black">Rp{s.price.toLocaleString('id-ID')}</span>
                  <span
                    className={`text-xs font-bold ${
                      s.changePercent >= 0 ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                    }`}
                  >
                    {s.changePercent > 0 ? '+' : ''}{s.changePercent}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#80887f]">Sektor:</span>
                  <b>{s.sector}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#80887f]">Batas Invalidasi:</span>
                  <b className="text-[#c4554a]">Rp{s.invalidation.toLocaleString('id-ID')}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#80887f]">Target Utama:</span>
                  <b className="text-[#1d7a5c]">Rp{s.target1.toLocaleString('id-ID')}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#80887f]">VCP / Pola:</span>
                  <b>{s.vcpStatus}</b>
                </div>
              </div>

              <button
                onClick={() => onSelectStock(s.ticker)}
                className="w-full py-2 rounded-xl bg-[#1d7a5c] text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer text-center"
              >
                Buka Grafik &amp; Trade Plan ›
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] text-center space-y-3">
          <span className="text-4xl block">⭐</span>
          <b className="font-serif text-lg block">Belum ada saham di daftar pantau</b>
          <p className="text-xs text-[#80887f] max-w-sm mx-auto">
            Buka menu <b>Sinyal Saham</b> atau <b>Peta Saham</b>, lalu klik tombol bintang (★) pada saham yang ingin kamu pantau setiap hari.
          </p>
        </div>
      )}
    </div>
  );
};
