import React from 'react';
import { StockData } from '../../types.ts';

interface HscViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const HscView: React.FC<HscViewProps> = ({ stocks, onSelectStock }) => {
  // Screen historically strong candidates
  const hscStocks = stocks.filter((s) => s.momentumScore >= 80 || s.vcpStatus === 'Ketat');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <h2 className="font-serif text-2xl font-bold">Saham HSC (Historically Strong Candidates)</h2>
        <p className="text-xs text-[#80887f]">
          Daftar saham kandidat kuat dengan track record historis penguatan tinggi saat breakout dan resiliensi saat pasar terkoreksi.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hscStocks.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectStock(s.ticker)}
            className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3 cursor-pointer hover:border-[#1d7a5c] hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <b className="text-xl font-black tracking-tight">{s.ticker}</b>
                <span className="text-xs text-[#80887f] block">{s.name}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#1d7a5c] text-white">
                Skor {s.momentumScore}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#80887f]">Sektor:</span>
                <b>{s.sector}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Kategori Momentum:</span>
                <b className="text-[#1d7a5c]">{s.momentumRank}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Status VCP:</span>
                <b>{s.vcpStatus}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Batas Invalidasi:</span>
                <b className="text-[#c4554a]">Rp{s.invalidation.toLocaleString('id-ID')}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Target Utama (1):</span>
                <b className="text-[#1d7a5c]">Rp{s.target1.toLocaleString('id-ID')}</b>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#80887f]">Harga: <b>Rp{s.price.toLocaleString('id-ID')}</b></span>
              <span className="text-[#2f679e] font-bold hover:underline">Analisis Lengkap ›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
