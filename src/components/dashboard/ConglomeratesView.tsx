import React from 'react';
import { StockData } from '../../types.ts';

interface ConglomeratesViewProps {
  stocks?: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const ConglomeratesView: React.FC<ConglomeratesViewProps> = ({ stocks = [], onSelectStock }) => {
  const groupsDefinition = [
    {
      name: 'Grup Barito (Prajogo Pangestu)',
      founder: 'Prajogo Pangestu',
      tickers: ['BREN', 'BRPT', 'TPIA', 'CUAN', 'PTRO'],
      description: 'Konglomerasi petrokimia, energi terbarukan geotermal, dan kontraktor tambang terbesar di Indonesia.',
    },
    {
      name: 'Grup Astra',
      founder: 'PT Astra International Tbk (Jardine Matheson)',
      tickers: ['ASII', 'UNTR', 'AALI', 'AUTO', 'ASGR'],
      description: 'Konglomerasi otomotif, alat berat Komatsu, perkebunan kelapa sawit, dan jasa keuangan terintegrasi.',
    },
    {
      name: 'Grup Salim',
      founder: 'Anthoni Salim',
      tickers: ['ICBP', 'INDF', 'MEDC', 'AMMN', 'BRMS'],
      description: 'Raksasa konsumen FMCG Indomie, pertambangan tembaga/emas Amman, serta energi migas Medco.',
    },
    {
      name: 'Grup Djarum',
      founder: 'Keluarga Hartono (Budi & Michael Hartono)',
      tickers: ['BBCA', 'TOWR', 'BELI', 'RANC'],
      description: 'Pengendali bank swasta terbesar (BCA), menara telekomunikasi (Protelindo), dan e-commerce Blibli.',
    },
    {
      name: 'Grup Sinarmas',
      founder: 'Keluarga Widjaja',
      tickers: ['INKP', 'TKIM', 'BSDE', 'SMMA', 'DSSA'],
      description: 'Kertas & pulp global (Asia Pulp & Paper), properti BSD City, dan energi batu bara DSSA.',
    },
    {
      name: 'Grup Bakrie',
      founder: 'Keluarga Bakrie',
      tickers: ['BUMI', 'BRMS', 'ENRG', 'VKTR', 'BNBR'],
      description: 'Produsen batu bara terbesar BUMI, tambang mineral emas, dan transisi kendaraan listrik VKTR.',
    },
    {
      name: 'Grup Saratoga',
      founder: 'Edwin Soeryadjaya & Sandiaga Uno',
      tickers: ['SRTG', 'ADRO', 'MDKA', 'MBMA', 'PALM'],
      description: 'Perusahaan investasi aktif di sektor energi bersih, sumber daya alam mineral kritis, dan infrastruktur.',
    },
    {
      name: 'Grup MNC',
      founder: 'Hary Tanoesoedibjo',
      tickers: ['MNCN', 'BMTR', 'BHIT', 'KPIG', 'MSIN'],
      description: 'Konglomerasi media terintegrasi, hiburan digital, perhotelan/resort KEK Lido, dan jasa keuangan.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold">Grup Konglomerat (Conglomerate Groups)</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live BEI Realtime
            </span>
          </div>
          <p className="text-xs text-[#80887f] mt-0.5">
            Pantau pergerakan harga agregat dan emiten di bawah naungan kelompok konglomerasi terkemuka Bursa Efek Indonesia.
          </p>
        </div>
      </div>

      {/* Grid of Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {groupsDefinition.map((g) => {
          // Compute live average return for group based on constituent stocks
          const matchedStocks = g.tickers
            .map((t) => stocks.find((s) => s.ticker === t))
            .filter((s): s is StockData => Boolean(s));

          const avgChange =
            matchedStocks.length > 0
              ? Number(
                  (
                    matchedStocks.reduce((acc, s) => acc + s.changePercent, 0) /
                    matchedStocks.length
                  ).toFixed(2)
                )
              : 0;

          const isUp = avgChange >= 0;

          return (
            <div
              key={g.name}
              className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <b className="text-sm font-bold block">{g.name}</b>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded ${
                      isUp
                        ? 'bg-[#1d7a5c]/10 text-[#1d7a5c]'
                        : 'bg-[#c4554a]/10 text-[#c4554a]'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {avgChange}%
                  </span>
                </div>
                <span className="text-[11px] text-[#80887f] block mt-0.5">{g.founder}</span>
                <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mt-2 line-clamp-2">
                  {g.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#e5ddd0] dark:border-[#26363d]">
                <span className="text-[10px] text-[#80887f] font-bold uppercase block mb-1.5">
                  Emiten Anggota Grup (Live):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {g.tickers.map((t) => {
                    const stk = stocks.find((s) => s.ticker === t);
                    const chg = stk ? stk.changePercent : 0;
                    const chgUp = chg >= 0;
                    return (
                      <button
                        key={t}
                        onClick={() => onSelectStock(t)}
                        className={`px-2 py-1 rounded-lg border font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          chgUp
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100'
                        }`}
                        title={`${t}: ${stk ? `Rp${stk.price.toLocaleString('id-ID')} (${chgUp ? '+' : ''}${chg}%)` : t}`}
                      >
                        <span>{t}</span>
                        <span className="text-[9px]">{chgUp ? '+' : ''}{chg}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
