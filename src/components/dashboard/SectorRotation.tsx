import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface SectorRotationProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const SectorRotation: React.FC<SectorRotationProps> = ({ stocks, onSelectStock }) => {
  const [period, setPeriod] = useState<'1bln' | '3bln' | '6bln'>('3bln');

  const sectorData = [
    { name: 'IDXENERGY', label: 'Energi (Energy)', rsRatio: 104.2, rsMomentum: 102.5, quadrant: 'Leading', change1M: '+6.8%', change3M: '+18.4%', leader: 'MEDC' },
    { name: 'IDXBASIC', label: 'Barang Baku (Basic Materials)', rsRatio: 103.5, rsMomentum: 101.8, quadrant: 'Leading', change1M: '+5.2%', change3M: '+14.2%', leader: 'AMMN' },
    { name: 'IDXFINANCE', label: 'Keuangan (Financials)', rsRatio: 101.8, rsMomentum: 99.4, quadrant: 'Weakening', change1M: '+1.4%', change3M: '+8.1%', leader: 'BBCA' },
    { name: 'IDXINFRA', label: 'Infrastruktur (Infrastructure)', rsRatio: 101.2, rsMomentum: 98.7, quadrant: 'Weakening', change1M: '-0.8%', change3M: '+6.5%', leader: 'BREN' },
    { name: 'IDXTRANS', label: 'Transportasi & Logistik', rsRatio: 99.8, rsMomentum: 103.2, quadrant: 'Improving', change1M: '+4.1%', change3M: '-2.1%', leader: 'MBSS' },
    { name: 'IDXNONCYC', label: 'Konsumer Non-Primer (Non-Cyclicals)', rsRatio: 98.5, rsMomentum: 97.8, quadrant: 'Lagging', change1M: '-2.4%', change3M: '-5.8%', leader: 'ICBP' },
    { name: 'IDXTECHNO', label: 'Teknologi (Technology)', rsRatio: 96.2, rsMomentum: 99.1, quadrant: 'Lagging', change1M: '-4.6%', change3M: '-12.4%', leader: 'GOTO' },
    { name: 'IDXHEALTH', label: 'Kesehatan (Healthcare)', rsRatio: 99.2, rsMomentum: 101.4, quadrant: 'Improving', change1M: '+3.2%', change3M: '-1.5%', leader: 'KLBF' },
    { name: 'IDXINDUST', label: 'Perindustrian (Industrials)', rsRatio: 100.4, rsMomentum: 99.1, quadrant: 'Weakening', change1M: '+0.5%', change3M: '+4.2%', leader: 'ASII' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Rotasi Sektor (Sector Rotation RRG)</h2>
          <p className="text-xs text-[#80887f]">
            Relative Strength (RS-Ratio) vs Momentum (RS-Momentum) sektor-sektor BEI terhadap IHSG.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349] text-xs font-bold">
          {(['1bln', '3bln', '6bln'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                period === p ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
              }`}
            >
              {p.replace('bln', ' Bulan')}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Quadrants Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leading (Memimpin) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border-2 border-[#1d7a5c]/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#1d7a5c] text-white">
              QUADRANT 1: LEADING (MEMIMPIN)
            </span>
            <span className="text-[11px] text-[#1d7a5c] font-bold">RS-Ratio &gt; 100 &amp; RS-Mom &gt; 100</span>
          </div>
          <p className="text-xs text-[#56625f] mb-3">
            Sektor yang sedang memimpin pasar dengan tren kuat dan akselerasi momentum positif. Fokus utama pemilihan saham.
          </p>
          <div className="space-y-2">
            {sectorData
              .filter((s) => s.quadrant === 'Leading')
              .map((sec) => (
                <div
                  key={sec.name}
                  className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] flex items-center justify-between"
                >
                  <div>
                    <b className="text-xs block">{sec.label}</b>
                    <span className="text-[10px] text-[#80887f]">
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#1d7a5c] block">{sec.change3M}</span>
                    <button
                      onClick={() => onSelectStock(sec.leader)}
                      className="text-[10px] font-bold text-[#2f679e] hover:underline"
                    >
                      Top: {sec.leader} ›
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Improving (Membaik) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border-2 border-blue-400/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-600 text-white">
              QUADRANT 2: IMPROVING (MEMBAIK)
            </span>
            <span className="text-[11px] text-blue-600 font-bold">RS-Ratio &lt; 100 &amp; RS-Mom &gt; 100</span>
          </div>
          <p className="text-xs text-[#56625f] mb-3">
            Sektor yang mulai bangkit dari penurunan (bottoming). Momentum sudah positif dan siap masuk zona Leading.
          </p>
          <div className="space-y-2">
            {sectorData
              .filter((s) => s.quadrant === 'Improving')
              .map((sec) => (
                <div
                  key={sec.name}
                  className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] flex items-center justify-between"
                >
                  <div>
                    <b className="text-xs block">{sec.label}</b>
                    <span className="text-[10px] text-[#80887f]">
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-blue-600 block">{sec.change3M}</span>
                    <button
                      onClick={() => onSelectStock(sec.leader)}
                      className="text-[10px] font-bold text-[#2f679e] hover:underline"
                    >
                      Top: {sec.leader} ›
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Weakening (Melemah) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border-2 border-amber-400/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-600 text-white">
              QUADRANT 3: WEAKENING (MELEMAH)
            </span>
            <span className="text-[11px] text-amber-600 font-bold">RS-Ratio &gt; 100 &amp; RS-Mom &lt; 100</span>
          </div>
          <p className="text-xs text-[#56625f] mb-3">
            Sektor yang tren jangka panjangnya masih di atas IHSG, namun momentum jangka pendeknya mulai melambat.
          </p>
          <div className="space-y-2">
            {sectorData
              .filter((s) => s.quadrant === 'Weakening')
              .map((sec) => (
                <div
                  key={sec.name}
                  className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] flex items-center justify-between"
                >
                  <div>
                    <b className="text-xs block">{sec.label}</b>
                    <span className="text-[10px] text-[#80887f]">
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-600 block">{sec.change3M}</span>
                    <button
                      onClick={() => onSelectStock(sec.leader)}
                      className="text-[10px] font-bold text-[#2f679e] hover:underline"
                    >
                      Top: {sec.leader} ›
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Lagging (Tertinggal) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border-2 border-[#c4554a]/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#c4554a] text-white">
              QUADRANT 4: LAGGING (TERTINGGAL)
            </span>
            <span className="text-[11px] text-[#c4554a] font-bold">RS-Ratio &lt; 100 &amp; RS-Mom &lt; 100</span>
          </div>
          <p className="text-xs text-[#56625f] mb-3">
            Sektor yang terus underperform dibanding indeks acuan IHSG. Disarankan hindari posisi agresif di sektor ini.
          </p>
          <div className="space-y-2">
            {sectorData
              .filter((s) => s.quadrant === 'Lagging')
              .map((sec) => (
                <div
                  key={sec.name}
                  className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] flex items-center justify-between"
                >
                  <div>
                    <b className="text-xs block">{sec.label}</b>
                    <span className="text-[10px] text-[#80887f]">
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#c4554a] block">{sec.change3M}</span>
                    <button
                      onClick={() => onSelectStock(sec.leader)}
                      className="text-[10px] font-bold text-[#2f679e] hover:underline"
                    >
                      Top: {sec.leader} ›
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
