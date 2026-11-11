import React from 'react';

export const IndicesView: React.FC = () => {
  const indices = [
    { ticker: 'COMPOSITE', name: 'IHSG (Indeks Harga Saham Gabungan)', value: 7283.82, change: -48.2, changePercent: -0.66, high: 7335.10, low: 7268.45, ytd: '+0.15%' },
    { ticker: 'LQ45', name: 'Indeks LQ45 (45 Saham Paling Likuid)', value: 924.15, change: -7.1, changePercent: -0.76, high: 932.80, low: 921.30, ytd: '-4.82%' },
    { ticker: 'IDX30', name: 'Indeks IDX30 (30 Saham Bluechip)', value: 472.60, change: -3.8, changePercent: -0.80, high: 477.10, low: 471.20, ytd: '-5.12%' },
    { ticker: 'KOMPAS100', name: 'Indeks Kompas 100', value: 1145.30, change: -6.5, changePercent: -0.57, high: 1154.20, low: 1142.10, ytd: '-1.40%' },
    { ticker: 'ISSI', name: 'Indeks Saham Syariah Indonesia', value: 218.40, change: +0.85, changePercent: +0.39, high: 219.10, low: 217.50, ytd: '+2.10%' },
    { ticker: 'IDXV30', name: 'IDX Value 30', value: 168.20, change: +1.10, changePercent: +0.66, high: 169.00, low: 167.30, ytd: '+6.80%' },
    { ticker: 'IDXHIDIV20', name: 'IDX High Dividend 20', value: 582.40, change: +2.30, changePercent: +0.40, high: 585.10, low: 579.80, ytd: '+8.45%' },
    { ticker: 'IDXGROWTH', name: 'IDX Growth 30', value: 142.10, change: -1.25, changePercent: -0.87, high: 143.90, low: 141.50, ytd: '-3.15%' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <h2 className="font-serif text-2xl font-bold">Indeks Saham BEI (Market Indices)</h2>
        <p className="text-xs text-[#80887f]">
          Pantau barometer pergerakan seluruh indeks utama dan tematik di Bursa Efek Indonesia.
        </p>
      </div>

      {/* Grid of Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((idx) => {
          const isUp = idx.changePercent >= 0;
          return (
            <div
              key={idx.ticker}
              className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-2 hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between">
                <b className="text-base font-black tracking-tight">{idx.ticker}</b>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    isUp ? 'bg-[#1d7a5c]/10 text-[#1d7a5c]' : 'bg-[#c4554a]/10 text-[#c4554a]'
                  }`}
                >
                  {isUp ? '+' : ''}{idx.changePercent}%
                </span>
              </div>

              <span className="text-[11px] text-[#80887f] block line-clamp-1">{idx.name}</span>

              <div className="pt-2 border-t border-[#e5ddd0] dark:border-[#26363d] flex items-baseline justify-between">
                <b className="text-2xl font-black">{idx.value.toLocaleString('id-ID')}</b>
                <span
                  className={`text-xs font-bold ${
                    isUp ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                  }`}
                >
                  {isUp ? '+' : ''}{idx.change}
                </span>
              </div>

              <div className="text-[10px] text-[#80887f] flex justify-between pt-1">
                <span>Rentang: {idx.low} - {idx.high}</span>
                <span>YTD: <b className="text-[#17242a] dark:text-[#f3eee4]">{idx.ytd}</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
