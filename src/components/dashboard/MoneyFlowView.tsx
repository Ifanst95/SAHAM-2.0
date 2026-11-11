import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface MoneyFlowViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const MoneyFlowView: React.FC<MoneyFlowViewProps> = ({ stocks, onSelectStock }) => {
  const [filter, setFilter] = useState<'all' | 'foreign_in' | 'foreign_out'>('all');

  const sortedStocks = [...stocks].sort((a, b) => b.netForeign - a.netForeign);
  const foreignIn = sortedStocks.filter((s) => s.netForeign > 0);
  const foreignOut = [...stocks].filter((s) => s.netForeign < 0).sort((a, b) => a.netForeign - b.netForeign);

  const displayList =
    filter === 'foreign_in' ? foreignIn : filter === 'foreign_out' ? foreignOut : sortedStocks;

  const totalNet = stocks.reduce((acc, s) => acc + s.netForeign, 0);

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold">Money Flow Tracker (Aliran Dana Asing)</h2>
          <p className="text-xs text-[#80887f]">
            Arus akumulasi dan distribusi modal asing serta bandar pasar modal Indonesia (BEI).
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-[#80887f] block font-semibold">Total Net Foreign Hari Ini</span>
            <b
              className={`text-xl font-black ${
                totalNet >= 0 ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
              }`}
            >
              {totalNet >= 0 ? '+' : ''}Rp{(totalNet / 1000000000).toFixed(1)} Miliar
            </b>
          </div>

          <div className="flex gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349] text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                filter === 'all' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('foreign_in')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                filter === 'foreign_in' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              Akumulasi (Inflow)
            </button>
            <button
              onClick={() => setFilter('foreign_out')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                filter === 'foreign_out' ? 'bg-[#c4554a] text-white' : 'text-[#80887f]'
              }`}
            >
              Distribusi (Outflow)
            </button>
          </div>
        </div>
      </div>

      {/* Top Cards: Top Accumulation vs Top Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top 5 Net Buy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5ddd0] dark:border-[#26363d]">
            <b className="text-xs font-bold text-[#1d7a5c] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1d7a5c]"></span> TOP 5 NET BUY ASING
            </b>
            <span className="text-[10px] text-[#80887f]">Akumulasi Kuat</span>
          </div>
          {foreignIn.slice(0, 5).map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectStock(s.ticker)}
              className="flex items-center justify-between p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] cursor-pointer hover:shadow-xs"
            >
              <div className="flex items-center gap-2">
                <b className="text-xs">{s.ticker}</b>
                <span className="text-[10px] text-[#80887f]">{s.name.slice(0, 20)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-[#1d7a5c]">
                  +Rp{(s.netForeign / 1000000000).toFixed(1)} M
                </span>
                <span className="text-[10px] text-[#80887f] block">
                  {s.changePercent > 0 ? '+' : ''}
                  {s.changePercent}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Top 5 Net Sell */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5ddd0] dark:border-[#26363d]">
            <b className="text-xs font-bold text-[#c4554a] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c4554a]"></span> TOP 5 NET SELL ASING
            </b>
            <span className="text-[10px] text-[#80887f]">Distribusi Keluar</span>
          </div>
          {foreignOut.slice(0, 5).map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectStock(s.ticker)}
              className="flex items-center justify-between p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] cursor-pointer hover:shadow-xs"
            >
              <div className="flex items-center gap-2">
                <b className="text-xs">{s.ticker}</b>
                <span className="text-[10px] text-[#80887f]">{s.name.slice(0, 20)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-[#c4554a]">
                  Rp{(s.netForeign / 1000000000).toFixed(1)} M
                </span>
                <span className="text-[10px] text-[#80887f] block">
                  {s.changePercent > 0 ? '+' : ''}
                  {s.changePercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Detailed Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Ticker</th>
              <th className="py-2.5 px-3">Nama Emiten</th>
              <th className="py-2.5 px-3">Sektor</th>
              <th className="py-2.5 px-3">Harga</th>
              <th className="py-2.5 px-3">Hari Ini</th>
              <th className="py-2.5 px-3">Net Asing</th>
              <th className="py-2.5 px-3">Frekuensi</th>
              <th className="py-2.5 px-3">Status Arus Dana</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
            {displayList.map((s) => {
              const isBuy = s.netForeign > 0;
              return (
                <tr
                  key={s.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(s.ticker)}
                >
                  <td className="py-2.5 px-3 font-black text-sm">{s.ticker}</td>
                  <td className="py-2.5 px-3 font-semibold">{s.name}</td>
                  <td className="py-2.5 px-3 text-[#80887f]">{s.sector}</td>
                  <td className="py-2.5 px-3 font-bold">Rp{s.price.toLocaleString('id-ID')}</td>
                  <td
                    className={`py-2.5 px-3 font-bold ${
                      s.changePercent >= 0 ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                    }`}
                  >
                    {s.changePercent > 0 ? '+' : ''}
                    {s.changePercent}%
                  </td>
                  <td
                    className={`py-2.5 px-3 font-black ${
                      isBuy ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                    }`}
                  >
                    {isBuy ? '+' : ''}Rp{(s.netForeign / 1000000000).toFixed(1)} M
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{s.frequency.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isBuy
                          ? 'bg-[#1d7a5c]/10 text-[#1d7a5c]'
                          : 'bg-[#c4554a]/10 text-[#c4554a]'
                      }`}
                    >
                      {isBuy ? 'Akumulasi Asing' : 'Distribusi Asing'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[#2f679e] font-bold text-xs hover:underline">
                      Grafik ›
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
