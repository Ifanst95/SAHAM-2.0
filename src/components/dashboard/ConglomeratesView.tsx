import React from 'react';

interface ConglomeratesViewProps {
  onSelectStock: (ticker: string) => void;
}

export const ConglomeratesView: React.FC<ConglomeratesViewProps> = ({ onSelectStock }) => {
  const groups = [
    {
      name: 'Grup Barito (Prajogo Pangestu)',
      founder: 'Prajogo Pangestu',
      avgChange: '+2.8%',
      isUp: true,
      tickers: ['BREN', 'BRPT', 'TPIA', 'CUAN', 'PTRO'],
      description: 'Konglomerasi petrokimia, energi terbarukan geotermal, dan kontraktor tambang terbesar.',
    },
    {
      name: 'Grup Astra',
      founder: 'PT Astra International Tbk',
      avgChange: '+0.5%',
      isUp: true,
      tickers: ['ASII', 'UNTR', 'AALI', 'AUTO', 'ASGR'],
      description: 'Konglomerasi otomotif, alat berat, perkebunan kelapa sawit, dan jasa keuangan.',
    },
    {
      name: 'Grup Salim',
      founder: 'Anthoni Salim',
      avgChange: '-0.4%',
      isUp: false,
      tickers: ['ICBP', 'INDF', 'MEDC', 'AMMN', 'BRMS'],
      description: 'Raksasa konsumen FMCG, pertambangan tembaga/emas, serta energi migas.',
    },
    {
      name: 'Grup Djarum',
      founder: 'Keluarga Hartono (Budi & Michael)',
      avgChange: '-0.8%',
      isUp: false,
      tickers: ['BBCA', 'TOWR', 'BELI', 'RANC'],
      description: 'Pengendali bank swasta terbesar (BCA), menara telekomunikasi (Protelindo), dan e-commerce Blibli.',
    },
    {
      name: 'Grup Sinarmas',
      founder: 'Keluarga Widjaja',
      avgChange: '+1.2%',
      isUp: true,
      tickers: ['INKP', 'TKIM', 'BSDE', 'SMMA', 'DSSA'],
      description: 'Kertas & pulp, properti terkemuka (BSD City), dan energi batu bara (DSSA).',
    },
    {
      name: 'Grup Bakrie',
      founder: 'Keluarga Bakrie',
      avgChange: '+3.4%',
      isUp: true,
      tickers: ['BUMI', 'BRMS', 'ENRG', 'VKTR', 'BNBR'],
      description: 'Produsen batu bara terbesar (BUMI), tambang mineral emas, dan transisi kendaraan listrik (VKTR).',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <h2 className="font-serif text-2xl font-bold">Grup Konglomerat (Conglomerate Groups)</h2>
        <p className="text-xs text-[#80887f]">
          Pantau pergerakan harga saham emiten yang berada di bawah naungan kelompok konglomerasi besar Indonesia.
        </p>
      </div>

      {/* Grid of Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div
            key={g.name}
            className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <b className="text-sm font-bold block">{g.name}</b>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded ${
                    g.isUp ? 'bg-[#1d7a5c]/10 text-[#1d7a5c]' : 'bg-[#c4554a]/10 text-[#c4554a]'
                  }`}
                >
                  {g.avgChange}
                </span>
              </div>
              <span className="text-[11px] text-[#80887f] block mt-0.5">{g.founder}</span>
              <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mt-2 line-clamp-2">
                {g.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#e5ddd0] dark:border-[#26363d]">
              <span className="text-[10px] text-[#80887f] font-bold uppercase block mb-1.5">
                Emiten Anggota Grup:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {g.tickers.map((t) => (
                  <button
                    key={t}
                    onClick={() => onSelectStock(t)}
                    className="px-2.5 py-1 rounded-lg bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-black text-xs hover:border-[#1d7a5c] hover:text-[#1d7a5c] transition-colors cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
