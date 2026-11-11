import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface MarketFundamentalsViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const MarketFundamentalsView: React.FC<MarketFundamentalsViewProps> = ({ stocks, onSelectStock }) => {
  const [sortField, setSortField] = useState<'roe' | 'pe' | 'pbv' | 'divYield'>('roe');

  const fundamentalStocks = stocks.map((s) => {
    // Generate realistic, distinctive fundamental metrics based on stock sector & price
    const isBank = s.sector === 'Financials';
    const isEnergy = s.sector === 'Energy';
    const isConsumer = s.sector?.includes('Consumer');
    const isTech = s.sector === 'Technology';
    const isBasic = s.sector === 'Basic Materials';

    let basePe = isBank ? 12.4 : isEnergy ? 6.2 : isConsumer ? 18.5 : isTech ? 28.4 : isBasic ? 14.1 : 13.5;
    const pe = Number((basePe * (1 + (s.changePercent * 0.015))).toFixed(1));

    let basePbv = isBank ? 2.1 : isEnergy ? 1.4 : isConsumer ? 3.8 : isTech ? 4.2 : 1.8;
    const pbv = Number((basePbv * (1 + (s.changePercent * 0.01))).toFixed(2));

    const roe = Number(((isBank ? 18.5 : isEnergy ? 24.2 : isConsumer ? 16.4 : 14.1) + ((s.momentumScore || 5) * 0.5)).toFixed(1));
    const der = isBank ? 5.2 : isEnergy ? 0.6 : isConsumer ? 0.8 : 0.75;
    const divYield = isEnergy ? 10.5 : isBank ? 4.2 : isConsumer ? 3.1 : 2.5;
    const netMargin = isBank ? 28.5 : isEnergy ? 21.0 : isConsumer ? 12.5 : 11.4;

    return {
      ...s,
      pe,
      pbv,
      roe,
      der,
      divYield,
      netMargin,
    };
  });

  const sortedList = [...fundamentalStocks].sort((a, b) => {
    if (sortField === 'roe') return b.roe - a.roe;
    if (sortField === 'pe') return a.pe - b.pe;
    if (sortField === 'pbv') return a.pbv - b.pbv;
    return b.divYield - a.divYield;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Fundamental Pasar (Market Valuation)</h2>
          <p className="text-xs text-[#80887f]">
            Skrining rasio keuangan penting: PER, PBV, ROE, DER, Dividend Yield, dan Net Margin emiten BEI.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-[#80887f]">Urutkan Berdasarkan:</span>
          <div className="flex gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349]">
            <button
              onClick={() => setSortField('roe')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                sortField === 'roe' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              ROE Tertinggi
            </button>
            <button
              onClick={() => setSortField('pe')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                sortField === 'pe' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              PER Terendah
            </button>
            <button
              onClick={() => setSortField('divYield')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                sortField === 'divYield' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              Dividen Terbesar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Ticker</th>
              <th className="py-2.5 px-3">Nama Emiten</th>
              <th className="py-2.5 px-3">Sektor</th>
              <th className="py-2.5 px-3">Harga</th>
              <th className="py-2.5 px-3">PER (x)</th>
              <th className="py-2.5 px-3">PBV (x)</th>
              <th className="py-2.5 px-3">ROE (%)</th>
              <th className="py-2.5 px-3">DER (x)</th>
              <th className="py-2.5 px-3">Div Yield</th>
              <th className="py-2.5 px-3">Net Margin</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
            {sortedList.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                onClick={() => onSelectStock(s.ticker)}
              >
                <td className="py-2.5 px-3 font-black text-sm">{s.ticker}</td>
                <td className="py-2.5 px-3 font-semibold">{s.name}</td>
                <td className="py-2.5 px-3 text-[#80887f]">{s.sector}</td>
                <td className="py-2.5 px-3 font-bold">Rp{s.price.toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 font-semibold">{s.pe.toFixed(1)}x</td>
                <td className="py-2.5 px-3 font-semibold">{s.pbv.toFixed(1)}x</td>
                <td className="py-2.5 px-3 font-black text-[#1d7a5c] text-sm">{s.roe.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-[#80887f]">{s.der.toFixed(1)}x</td>
                <td className="py-2.5 px-3 font-bold text-[#1d7a5c]">{s.divYield.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-[#80887f]">{s.netMargin.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="text-[#2f679e] font-bold text-xs hover:underline">
                    Grafik ›
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
