import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface FrequencyAnalyzerViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const FrequencyAnalyzerView: React.FC<FrequencyAnalyzerViewProps> = ({ stocks, onSelectStock }) => {
  const [minSpike, setMinSpike] = useState<number>(1.2);

  const sortedBySpike = [...stocks]
    .filter((s) => s.frequencySpike >= minSpike)
    .sort((a, b) => b.frequencySpike - a.frequencySpike);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Frequency Analyzer (Lonjakan Frekuensi Transaksi)</h2>
          <p className="text-xs text-[#80887f]">
            Deteksi saham dengan lonjakan jumlah transaksi (order count) signifikan dibanding rata-rata 20 hari (SMA20 Freq).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-[#80887f]">Filter Minimal Spike:</span>
          <div className="flex gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349]">
            {[1.0, 1.2, 1.5, 2.0].map((val) => (
              <button
                key={val}
                onClick={() => setMinSpike(val)}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  minSpike === val ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
                }`}
              >
                &ge; {val}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-3">
        <span className="text-xl">⚡</span>
        <div>
          <b className="text-amber-700 dark:text-amber-400 block font-bold">
            Mengapa Frekuensi Transaksi Penting?
          </b>
          <span className="text-[#56625f] dark:text-[#a9b3ad]">
            Lonjakan frekuensi transaksi mengindikasikan partisipasi masif pelaku pasar (smart money / institusi). Jika disertai kenaikan harga dan volume tebal, merupakan tanda breakout valid.
          </span>
        </div>
      </div>

      {/* Frequency Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Ticker</th>
              <th className="py-2.5 px-3">Nama Emiten</th>
              <th className="py-2.5 px-3">Harga</th>
              <th className="py-2.5 px-3">Perubahan %</th>
              <th className="py-2.5 px-3">Frekuensi Hari Ini</th>
              <th className="py-2.5 px-3">Rata-rata 20 Hari</th>
              <th className="py-2.5 px-3">Lonjakan (Spike)</th>
              <th className="py-2.5 px-3">Status Indikator</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
            {sortedBySpike.map((s) => {
              const isSuperSpike = s.frequencySpike >= 2.0;
              return (
                <tr
                  key={s.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(s.ticker)}
                >
                  <td className="py-2.5 px-3 font-black text-sm">{s.ticker}</td>
                  <td className="py-2.5 px-3 font-semibold">{s.name}</td>
                  <td className="py-2.5 px-3 font-bold">Rp{s.price.toLocaleString('id-ID')}</td>
                  <td
                    className={`py-2.5 px-3 font-bold ${
                      s.changePercent >= 0 ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                    }`}
                  >
                    {s.changePercent > 0 ? '+' : ''}
                    {s.changePercent}%
                  </td>
                  <td className="py-2.5 px-3 font-bold text-base">{s.frequency.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-[#80887f]">{s.frequencyAvg20.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black text-xs inline-flex items-center gap-1 ${
                        isSuperSpike
                          ? 'bg-[#1d7a5c] text-white'
                          : 'bg-[#1d7a5c]/15 text-[#1d7a5c]'
                      }`}
                    >
                      ⚡ {s.frequencySpike}x
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.changePercent > 0 && s.frequencySpike > 1.5
                          ? 'bg-[#1d7a5c]/10 text-[#1d7a5c]'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {s.changePercent > 0 && s.frequencySpike > 1.5
                        ? 'Anomali Akumulasi'
                        : 'Aktivitas Tinggi'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[#2f679e] font-bold text-xs hover:underline">
                      Lihat Grafik ›
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
