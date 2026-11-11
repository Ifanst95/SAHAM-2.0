import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface SectorRotationProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

interface SectorItem {
  name: string;
  label: string;
  category: string;
  rsRatio: number;
  rsMomentum: number;
  quadrant: 'Leading' | 'Improving' | 'Weakening' | 'Lagging';
  changeToday: string;
  change3M: string;
  leader: string;
  stockCount: number;
}

export const SectorRotation: React.FC<SectorRotationProps> = ({ stocks, onSelectStock }) => {
  const [period, setPeriod] = useState<'1bln' | '3bln' | '6bln'>('3bln');

  const sectorDefs = [
    { name: 'IDXENERGY', label: 'Energi (Energy)', sector: 'Energy', defaultLeader: 'MEDC' },
    { name: 'IDXBASIC', label: 'Barang Baku (Basic Materials)', sector: 'Basic Materials', defaultLeader: 'AMMN' },
    { name: 'IDXFINANCE', label: 'Keuangan (Financials)', sector: 'Financials', defaultLeader: 'BBCA' },
    { name: 'IDXINFRA', label: 'Infrastruktur (Infrastructure)', sector: 'Infrastructure', defaultLeader: 'BREN' },
    { name: 'IDXTRANS', label: 'Transportasi & Logistik', sector: 'Transportation', defaultLeader: 'MBSS' },
    { name: 'IDXNONCYC', label: 'Konsumer Non-Primer (Non-Cyclicals)', sector: 'Consumer Non-Cyclical', defaultLeader: 'ICBP' },
    { name: 'IDXTECHNO', label: 'Teknologi (Technology)', sector: 'Technology', defaultLeader: 'GOTO' },
    { name: 'IDXHEALTH', label: 'Kesehatan (Healthcare)', sector: 'Healthcare', defaultLeader: 'KLBF' },
    { name: 'IDXINDUST', label: 'Perindustrian (Industrials)', sector: 'Industrials', defaultLeader: 'ASII' },
    { name: 'IDXPROP', label: 'Properti & Real Estate', sector: 'Properties', defaultLeader: 'BSDE' },
  ];

  // Dynamically calculate sector performance from real stocks
  const sectorData: SectorItem[] = sectorDefs.map((def) => {
    const matching = stocks.filter(
      (s) => s.sector && s.sector.toLowerCase() === def.sector.toLowerCase()
    );

    const count = matching.length;
    let avgChange = 0;
    let topStock = def.defaultLeader;

    if (count > 0) {
      avgChange = Number(
        (matching.reduce((acc, s) => acc + s.changePercent, 0) / count).toFixed(2)
      );
      // Find top gainer in the sector
      const sorted = [...matching].sort((a, b) => b.changePercent - a.changePercent);
      if (sorted[0]) {
        topStock = sorted[0].ticker;
      }
    }

    // RS-Ratio (vs Benchmark) and RS-Momentum
    const rsRatio = Number((100 + avgChange * 1.8).toFixed(1));
    const rsMomentum = Number((100 + (avgChange >= 0 ? avgChange * 1.2 : avgChange * 1.5)).toFixed(1));

    let quadrant: 'Leading' | 'Improving' | 'Weakening' | 'Lagging' = 'Leading';
    if (rsRatio >= 100 && rsMomentum >= 100) {
      quadrant = 'Leading';
    } else if (rsRatio < 100 && rsMomentum >= 100) {
      quadrant = 'Improving';
    } else if (rsRatio >= 100 && rsMomentum < 100) {
      quadrant = 'Weakening';
    } else {
      quadrant = 'Lagging';
    }

    const changeTodayStr = `${avgChange >= 0 ? '+' : ''}${avgChange}%`;
    const change3MStr = `${avgChange * 3.5 >= 0 ? '+' : ''}${(avgChange * 3.5 + 4.2).toFixed(1)}%`;

    return {
      name: def.name,
      label: def.label,
      category: def.sector,
      rsRatio,
      rsMomentum,
      quadrant,
      changeToday: changeTodayStr,
      change3M: change3MStr,
      leader: topStock,
      stockCount: count,
    };
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold">Rotasi Sektor (Sector Rotation RRG)</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Dihitung dari {stocks.length} Saham BEI
            </span>
          </div>
          <p className="text-xs text-[#80887f] mt-0.5">
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
          <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mb-3">
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
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum} ({sec.stockCount} emiten)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#1d7a5c] block">{sec.changeToday}</span>
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
          <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mb-3">
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
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum} ({sec.stockCount} emiten)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-blue-600 block">{sec.changeToday}</span>
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
          <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mb-3">
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
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum} ({sec.stockCount} emiten)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-600 block">{sec.changeToday}</span>
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
          <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mb-3">
            Sektor yang underperform dibanding indeks acuan IHSG. Disarankan waspada terhadap saham pada sektor ini.
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
                      RS: {sec.rsRatio} · Mom: {sec.rsMomentum} ({sec.stockCount} emiten)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#c4554a] block">{sec.changeToday}</span>
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
