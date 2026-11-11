import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface MarketHeatmapProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ stocks, onSelectStock }) => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [metric, setMetric] = useState<'change' | 'foreign' | 'volume'>('change');

  const sectors = [
    'all',
    'Financials',
    'Energy',
    'Basic Materials',
    'Consumer Non-Cyclical',
    'Infrastructure',
    'Consumer Cyclical',
    'Healthcare',
    'Technology',
    'Industrials',
    'Transportation',
  ];

  const filteredStocks = stocks.filter((s) =>
    selectedSector === 'all' ? true : s.sector.toLowerCase() === selectedSector.toLowerCase()
  );

  const getTileBg = (s: StockData) => {
    if (metric === 'change') {
      if (s.changePercent > 5) return 'bg-[#1d7a5c] text-white';
      if (s.changePercent > 0) return 'bg-[#2ea37d] text-white';
      if (s.changePercent === 0) return 'bg-[#80887f] text-white';
      if (s.changePercent > -3) return 'bg-[#d66b60] text-white';
      return 'bg-[#c4554a] text-white';
    }
    if (metric === 'foreign') {
      if (s.netForeign > 20000000000) return 'bg-[#1d7a5c] text-white';
      if (s.netForeign > 0) return 'bg-[#2ea37d] text-white';
      if (s.netForeign === 0) return 'bg-[#80887f] text-white';
      return 'bg-[#c4554a] text-white';
    }
    // volume
    if (s.volume > 1000000) return 'bg-[#2f679e] text-white';
    return 'bg-[#5b8ec2] text-white';
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            Peta Saham BEI (Market Heatmap)
          </h2>
          <p className="text-xs text-[#80887f]">
            Visualisasi peta pasar saham BEI berdasarkan performa sektoral dan bobot kapitalisasi pasar.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          {/* Metric Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349]">
            <button
              onClick={() => setMetric('change')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                metric === 'change' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              Perubahan %
            </button>
            <button
              onClick={() => setMetric('foreign')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                metric === 'foreign' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              Net Asing
            </button>
            <button
              onClick={() => setMetric('volume')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                metric === 'volume' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              Volume
            </button>
          </div>

          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec === 'all' ? 'Semua Sektor' : sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {filteredStocks.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectStock(s.ticker)}
              className={`p-3 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-md flex flex-col justify-between ${getTileBg(
                s
              )}`}
              style={{ minHeight: '100px' }}
            >
              <div className="flex items-center justify-between">
                <b className="text-base font-black tracking-tight">{s.ticker}</b>
                <span className="text-[10px] font-bold opacity-80">{s.sector.slice(0, 8)}</span>
              </div>

              <div>
                <span className="text-xs font-bold block">Rp{s.price.toLocaleString('id-ID')}</span>
                <span className="text-sm font-black block">
                  {s.changePercent > 0 ? '+' : ''}
                  {s.changePercent}%
                </span>
              </div>

              <div className="text-[10px] opacity-80 flex items-center justify-between pt-1 border-t border-white/20">
                <span>Vol: {(s.volume / 1000).toFixed(0)}k</span>
                <span>Asing: {(s.netForeign / 1000000000).toFixed(1)}M</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
