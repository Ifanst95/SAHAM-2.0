import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface ShareholdersViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const ShareholdersView: React.FC<ShareholdersViewProps> = ({ stocks, onSelectStock }) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(stocks[0]?.ticker || 'BBCA');

  const stock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Struktur Pemegang Saham (Shareholders)</h2>
          <p className="text-xs text-[#80887f]">
            Komposisi kepemilikan saham pengendali, institusi besar, publik, dan pemegang saham &gt; 5% resmi BEI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#80887f]">Pilih Emiten:</span>
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold text-xs"
          >
            {stocks.map((s) => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stock && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Summary Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <b className="text-2xl font-black">{stock.ticker}</b>
                <span className="text-xs text-[#80887f] block">{stock.name}</span>
              </div>
              <button
                onClick={() => onSelectStock(stock.ticker)}
                className="px-3 py-1 rounded-xl bg-[#1d7a5c] text-white text-xs font-bold hover:opacity-90"
              >
                Buka Grafik ›
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#80887f]">Sektor:</span>
                <b>{stock.sector}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Harga Saham:</span>
                <b>Rp{stock.price.toLocaleString('id-ID')}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Grup Afiliasi:</span>
                <b className="text-[#2f679e]">{stock.group}</b>
              </div>
            </div>

            <div className="text-[11px] text-[#80887f]">
              Sumber: Laporan Bulanan Registrasi Pemegang Efek resmi KSEI / Bursa Efek Indonesia per periode terakhir.
            </div>
          </div>

          {/* Table of 5%+ Shareholders */}
          <div className="lg:col-span-2 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d7a5c]"></span> Daftar Pemegang Saham &ge; 5%
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Nama Pemegang Saham</th>
                    <th className="py-2.5 px-3">Klasifikasi</th>
                    <th className="py-2.5 px-3 text-right">Persentase Kepemilikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
                  {stock.shareholders.map((sh, idx) => (
                    <tr key={idx} className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20]">
                      <td className="py-2.5 px-3 font-bold">{sh.name}</td>
                      <td className="py-2.5 px-3 text-[#80887f]">
                        {idx === 0 ? 'Pengendali Utama' : sh.name.toLowerCase().includes('masyarakat') || sh.name.toLowerCase().includes('publik') ? 'Masyarakat / Publik' : 'Institusi / Korporasi'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-sm text-[#1d7a5c]">
                        {sh.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
