import React, { useState, useEffect } from 'react';
import { StockData, SignalData } from '../../types.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockData[];
  signals: SignalData[];
  onSelectStock: (ticker: string) => void;
  onNavigateMenu: (menuKey: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  stocks,
  signals,
  onSelectStock,
  onNavigateMenu,
}) => {
  const [query, setQuery] = useState('');

  // Close on Escape, toggle on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  const matchingStocks = stocks.filter(
    (s) => s.ticker.toLowerCase().includes(cleanQ) || s.name.toLowerCase().includes(cleanQ)
  );

  const navigationItems = [
    { key: 'sinyal', label: 'Sinyal Saham & Screener', group: 'Menu Utama' },
    { key: 'beranda', label: 'Beranda / Overview Pasar', group: 'Menu Utama' },
    { key: 'peta', label: 'Peta Saham BEI (Heatmap)', group: 'Analisis Pasar' },
    { key: 'rotasi', label: 'Rotasi Sektor (RRG)', group: 'Analisis Pasar' },
    { key: 'moneyflow', label: 'Money Flow Tracker & Aliran Dana', group: 'Analisis Pasar' },
    { key: 'freq', label: 'Frequency Analyzer (Lonjakan Transaksi)', group: 'Analisis Pasar' },
    { key: 'vcp', label: 'VCP (Volatility Contraction Pattern)', group: 'Analisis Pasar' },
    { key: 'indeks', label: 'Indeks Saham BEI', group: 'Analisis Pasar' },
    { key: 'grup', label: 'Grup Konglomerat', group: 'Analisis Pasar' },
    { key: 'pemegang', label: 'Pemegang Saham', group: 'Data Emiten' },
    { key: 'orangdalam', label: 'Transaksi Orang Dalam', group: 'Data Emiten' },
    { key: 'corporate', label: 'Kalender Aksi Korporasi', group: 'Data Emiten' },
    { key: 'hsc', label: 'Saham HSC (Kandidat Kuat)', group: 'Data Emiten' },
    { key: 'fundamental', label: 'Fundamental Pasar (PER, PBV, ROE)', group: 'Data Emiten' },
    { key: 'kalkulator', label: 'Kalkulator Lot & Risiko', group: 'Alat' },
    { key: 'jurnal', label: 'Jurnal Trading & Flexing Porto', group: 'Alat' },
    { key: 'pantau', label: 'Saham Dipantau (Watchlist)', group: 'Alat' },
    { key: 'faq', label: 'FAQ & Panduan Belajar', group: 'Bantuan' },
    { key: 'video', label: 'Video Tutorial Modul', group: 'Bantuan' },
  ].filter((item) => !cleanQ || item.label.toLowerCase().includes(cleanQ));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#e5ddd0] dark:border-[#26363d]">
          <span className="text-[#80887f] text-base">🔍</span>
          <input
            type="text"
            placeholder="Ketik ticker saham (MBSS, BBCA…), fitur, atau menu…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none outline-hidden text-sm font-semibold text-[#17242a] dark:text-[#f3eee4]"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#efe9dd] dark:bg-[#121c20] text-[#80887f]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs scrollbar-none">
          {/* Stocks matches */}
          {matchingStocks.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-[#80887f] uppercase px-2 block mb-1">
                Saham BEI ({matchingStocks.length})
              </span>
              <div className="space-y-1">
                {matchingStocks.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectStock(s.ticker);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <b className="text-sm font-black">{s.ticker}</b>
                      <span className="text-xs text-[#80887f]">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <b className="block">Rp{s.price.toLocaleString('id-ID')}</b>
                      <span
                        className={`text-[10px] font-bold ${
                          s.changePercent >= 0 ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                        }`}
                      >
                        {s.changePercent > 0 ? '+' : ''}
                        {s.changePercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Menu matches */}
          {navigationItems.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-[#80887f] uppercase px-2 block mb-1">
                Fitur &amp; Menu
              </span>
              <div className="space-y-1">
                {navigationItems.slice(0, 8).map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      onNavigateMenu(item.key);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span className="font-bold">{item.label}</span>
                    <span className="text-[10px] text-[#80887f] px-2 py-0.5 rounded bg-[#efe9dd] dark:bg-[#121c20]">
                      {item.group}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingStocks.length === 0 && navigationItems.length === 0 && (
            <div className="p-8 text-center text-[#80887f]">
              Tidak ditemukan hasil untuk "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
