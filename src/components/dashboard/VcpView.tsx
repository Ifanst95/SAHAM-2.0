import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface VcpViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const VcpView: React.FC<VcpViewProps> = ({ stocks, onSelectStock }) => {
  const [tightness, setTightness] = useState<'Ketat' | 'Sedang' | 'Longgar' | 'Semua'>('Semua');

  const vcpStocks = stocks.filter((s) => {
    if (s.vcpStatus === 'Tidak Ada') return false;
    if (tightness !== 'Semua' && s.vcpStatus !== tightness) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">VCP (Volatility Contraction Pattern)</h2>
          <p className="text-xs text-[#80887f]">
            Pola kontraksi volatilitas harga yang makin merapat (Mark Minervini) menjelang ledakan breakout.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-[#80887f]">Tingkat Kontraksi:</span>
          <div className="flex gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349]">
            {(['Semua', 'Ketat', 'Sedang', 'Longgar'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTightness(t)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  tightness === t ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Concept Card */}
      <div className="p-4 rounded-2xl bg-[#1d7a5c]/10 border border-[#1d7a5c]/30 flex items-center gap-3 text-xs">
        <span className="text-2xl">📉➔📈</span>
        <div>
          <b className="text-[#1d7a5c] block font-bold">Prinsip Volatility Contraction Pattern (VCP):</b>
          <span className="text-[#56625f] dark:text-[#a9b3ad]">
            Setiap ayunan pullback harga memiliki kedalaman yang makin dangkal (contoh: -15% &rarr; -8% &rarr; -3%) diiringi volume yang mengering (volume dry-up). Saat harga menembus Pivot Breakout dengan volume besar, risiko penurunan minimal dan potensi reward maksimal.
          </span>
        </div>
      </div>

      {/* Grid of VCP Setups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vcpStocks.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectStock(s.ticker)}
            className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3 cursor-pointer hover:border-[#1d7a5c] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <b className="text-lg font-black tracking-tight">{s.ticker}</b>
                <span className="text-[11px] text-[#80887f] block">{s.name}</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                  s.vcpStatus === 'Ketat'
                    ? 'bg-[#1d7a5c] text-white'
                    : s.vcpStatus === 'Sedang'
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#2f679e] text-white'
                }`}
              >
                VCP {s.vcpStatus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#80887f]">Tahap Kontraksi:</span>
                <b className="text-[#1d7a5c]">{s.vcpContraction}</b>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#80887f]">Pivot Breakout:</span>
                <b className="font-bold">Rp{s.pivotBreakout.toLocaleString('id-ID')}</b>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#80887f]">Batas Invalidasi:</span>
                <b className="text-[#c4554a]">Rp{s.invalidation.toLocaleString('id-ID')}</b>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#80887f]">Target Utama (1):</span>
                <b className="text-[#1d7a5c]">Rp{s.target1.toLocaleString('id-ID')}</b>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#80887f]">Harga Sekarang: <b>Rp{s.price.toLocaleString('id-ID')}</b></span>
              <span className="text-[#2f679e] font-bold hover:underline">Detail Setup ›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
