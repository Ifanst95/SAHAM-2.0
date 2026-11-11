import React, { useState } from 'react';
import { StockData } from '../../types.ts';

interface InsiderTransactionsViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
}

export const InsiderTransactionsView: React.FC<InsiderTransactionsViewProps> = ({ stocks, onSelectStock }) => {
  const [filterType, setFilterType] = useState<'all' | 'Beli' | 'Jual'>('all');

  // Collect all insider tx from all stocks
  const allInsiderTx = stocks.flatMap((s) =>
    (s.insiderTransactions || []).map((tx) => ({
      ...tx,
      ticker: s.ticker,
      stockName: s.name,
    }))
  );

  const filteredTx = allInsiderTx.filter((tx) =>
    filterType === 'all' ? true : tx.type === filterType
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Transaksi Orang Dalam (Insider Trading Filings)</h2>
          <p className="text-xs text-[#80887f]">
            Laporan keterbukaan informasi transaksi Direksi, Dewan Komisaris, dan Pemegang Saham Pengendali BEI.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#f6f2ea] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349] text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterType === 'all' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
            }`}
          >
            Semua Transaksi
          </button>
          <button
            onClick={() => setFilterType('Beli')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterType === 'Beli' ? 'bg-[#1d7a5c] text-white' : 'text-[#80887f]'
            }`}
          >
            Pembelian (Akumulasi Insiders)
          </button>
          <button
            onClick={() => setFilterType('Jual')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterType === 'Jual' ? 'bg-[#c4554a] text-white' : 'text-[#80887f]'
            }`}
          >
            Penjualan
          </button>
        </div>
      </div>

      {/* Info note */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs flex items-center gap-3">
        <span className="text-xl">👔</span>
        <div>
          <b className="text-blue-700 dark:text-blue-400 block font-bold">
            Insight Transaksi Orang Dalam (Management Insider Trading)
          </b>
          <span className="text-[#56625f] dark:text-[#a9b3ad]">
            Ketika Direksi atau Komisaris membeli saham perusahaannya sendiri dengan uang pribadi, ini adalah sinyal keyakinan fundamental paling kuat.
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Tanggal Lapor</th>
              <th className="py-2.5 px-3">Ticker</th>
              <th className="py-2.5 px-3">Pihak Terafiliasi</th>
              <th className="py-2.5 px-3">Jabatan</th>
              <th className="py-2.5 px-3">Jenis Transaksi</th>
              <th className="py-2.5 px-3">Volume Lembar</th>
              <th className="py-2.5 px-3">Harga Rata-rata</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
            {filteredTx.map((tx, idx) => {
              const isBuy = tx.type === 'Beli';
              return (
                <tr
                  key={idx}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(tx.ticker)}
                >
                  <td className="py-2.5 px-3 text-[#80887f]">{tx.date}</td>
                  <td className="py-2.5 px-3 font-black text-sm">{tx.ticker}</td>
                  <td className="py-2.5 px-3 font-bold">{tx.person}</td>
                  <td className="py-2.5 px-3 text-[#56625f]">{tx.role}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isBuy
                          ? 'bg-[#1d7a5c]/10 text-[#1d7a5c]'
                          : 'bg-[#c4554a]/10 text-[#c4554a]'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{tx.shares}</td>
                  <td className="py-2.5 px-3 font-black">Rp{tx.price.toLocaleString('id-ID')}</td>
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
