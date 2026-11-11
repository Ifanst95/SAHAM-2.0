import React, { useState } from 'react';

interface CorporateActionsViewProps {
  onSelectStock: (ticker: string) => void;
}

export const CorporateActionsView: React.FC<CorporateActionsViewProps> = ({ onSelectStock }) => {
  const [tab, setTab] = useState<'dividen' | 'rups' | 'rights'>('dividen');

  const dividends = [
    { ticker: 'ADRO', name: 'Alamtri Resources Indonesia Tbk', type: 'Dividen Interim', dps: 285, cumDate: '18 Nov 2026', exDate: '19 Nov 2026', payDate: '06 Des 2026', yield: '7.8%' },
    { ticker: 'BBCA', name: 'Bank Central Asia Tbk', type: 'Dividen Interim', dps: 50, cumDate: '26 Nov 2026', exDate: '27 Nov 2026', payDate: '12 Des 2026', yield: '1.2%' },
    { ticker: 'ASII', name: 'Astra International Tbk', type: 'Dividen Interim', dps: 98, cumDate: '14 Okt 2026', exDate: '15 Okt 2026', payDate: '31 Okt 2026', yield: '2.0%' },
    { ticker: 'PTBA', name: 'Bukit Asam Tbk', type: 'Dividen Final', dps: 397, cumDate: '08 Des 2026', exDate: '09 Des 2026', payDate: '22 Des 2026', yield: '14.2%' },
    { ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', type: 'Dividen Final', dps: 215, cumDate: '15 Des 2026', exDate: '16 Des 2026', payDate: '30 Des 2026', yield: '1.8%' },
  ];

  const rupsList = [
    { ticker: 'BREN', name: 'Barito Renewables Energy Tbk', event: 'RUPS Luar Biasa (RUPSLB)', date: '20 Nov 2026', agenda: 'Persetujuan rencana ekspansi geotermal & pinjaman sindikasi bank.' },
    { ticker: 'MEDC', name: 'Medco Energi Internasional Tbk', event: 'Public Expose Insidentil', date: '24 Nov 2026', agenda: 'Paparan perkembangan eksplorasi blok migas Corridor & Oman.' },
    { ticker: 'AMMN', name: 'Amman Mineral Internasional Tbk', event: 'RUPS Luar Biasa (RUPSLB)', date: '02 Des 2026', agenda: 'Persetujuan fasilitas pendanaan fasilitas smelter tembaga.' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Kalender Aksi Korporasi (Corporate Actions)</h2>
          <p className="text-xs text-[#80887f]">
            Jadwal pembagian dividen tunai, RUPS, Public Expose, Right Issue, dan Stock Split emiten BEI.
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349] text-xs font-bold">
          <button
            onClick={() => setTab('dividen')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              tab === 'dividen' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
            }`}
          >
            Dividen Tunai
          </button>
          <button
            onClick={() => setTab('rups')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              tab === 'rups' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
            }`}
          >
            RUPS &amp; Public Expose
          </button>
        </div>
      </div>

      {tab === 'dividen' ? (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Jenis Dividen</th>
                <th className="py-2.5 px-3">DPS (Rupiah/Lembar)</th>
                <th className="py-2.5 px-3">Cum Date</th>
                <th className="py-2.5 px-3">Ex Date</th>
                <th className="py-2.5 px-3">Tanggal Bayar</th>
                <th className="py-2.5 px-3">Indikasi Yield</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {dividends.map((d) => (
                <tr
                  key={d.ticker}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(d.ticker)}
                >
                  <td className="py-2.5 px-3 font-black text-sm">{d.ticker}</td>
                  <td className="py-2.5 px-3 font-semibold">{d.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1d7a5c]/10 text-[#1d7a5c]">
                      {d.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-sm">Rp{d.dps}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#1d7a5c]">{d.cumDate}</td>
                  <td className="py-2.5 px-3 text-[#c4554a] font-semibold">{d.exDate}</td>
                  <td className="py-2.5 px-3 text-[#80887f]">{d.payDate}</td>
                  <td className="py-2.5 px-3 font-black text-base text-[#1d7a5c]">{d.yield}</td>
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
      ) : (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3">
          {rupsList.map((r) => (
            <div
              key={r.ticker}
              onClick={() => onSelectStock(r.ticker)}
              className="p-3.5 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] flex items-center justify-between cursor-pointer hover:shadow-xs transition-shadow"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <b className="text-sm">{r.ticker}</b>
                  <span className="text-xs text-[#80887f]">{r.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600">
                    {r.event}
                  </span>
                </div>
                <p className="text-xs text-[#56625f] dark:text-[#a9b3ad]">{r.agenda}</p>
              </div>
              <div className="text-right flex-none">
                <span className="text-xs font-bold text-[#1d7a5c] block">{r.date}</span>
                <span className="text-[10px] text-[#2f679e] hover:underline font-bold">Detail Saham ›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
