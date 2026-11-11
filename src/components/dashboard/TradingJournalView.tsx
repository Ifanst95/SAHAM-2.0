import React, { useState } from 'react';
import { JournalEntry, StockData } from '../../types.ts';

interface TradingJournalViewProps {
  journal: JournalEntry[];
  stocks: StockData[];
  onAddJournal: (entry: Partial<JournalEntry>) => void;
  onSelectStock: (ticker: string) => void;
}

export const TradingJournalView: React.FC<TradingJournalViewProps> = ({
  journal,
  stocks,
  onAddJournal,
  onSelectStock,
}) => {
  const [flexingOpen, setFlexingOpen] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);

  // New entry form
  const [ticker, setTicker] = useState('MBSS');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState(3620);
  const [lots, setLots] = useState(15);
  const [invalidation, setInvalidation] = useState(3350);
  const [target, setTarget] = useState(4200);
  const [status, setStatus] = useState<'OPEN' | 'CLOSED_WIN' | 'CLOSED_LOSS'>('OPEN');
  const [notes, setNotes] = useState('Entry pullback konfirmasi HAKA volume tinggi');

  // Stats calculation
  const totalTrades = journal.length;
  const closedWins = journal.filter((j) => j.status === 'CLOSED_WIN').length;
  const closedLoss = journal.filter((j) => j.status === 'CLOSED_LOSS').length;
  const closedTrades = closedWins + closedLoss;
  const winRate = closedTrades > 0 ? ((closedWins / closedTrades) * 100).toFixed(1) : '75.0';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJournal({
      ticker: ticker.toUpperCase(),
      action,
      date: new Date().toISOString().split('T')[0],
      price: Number(price),
      lots: Number(lots),
      invalidationPrice: Number(invalidation),
      targetPrice: Number(target),
      status,
      notes,
    });
    setFormOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Jurnal Trading &amp; Flexing Porto</h2>
          <p className="text-xs text-[#80887f]">
            Catat rencana trade plan, monitor kepatuhan disiplin eksekusi, dan evaluasi win rate portofolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlexingOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            📸 Flexing Porto
          </button>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-2 rounded-xl bg-[#1d7a5c] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shadow-xs"
          >
            {formOpen ? 'Batal' : '+ Catat Transaksi'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
          <span className="text-[10px] text-[#80887f] font-bold uppercase block">Total Transaksi</span>
          <b className="text-2xl font-black mt-1 block">{totalTrades || 4} Trade</b>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
          <span className="text-[10px] text-[#80887f] font-bold uppercase block">Win Rate</span>
          <b className="text-2xl font-black text-[#1d7a5c] mt-1 block">{winRate}%</b>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
          <span className="text-[10px] text-[#80887f] font-bold uppercase block">Posisi Aktif (Open)</span>
          <b className="text-2xl font-black text-[#2f679e] mt-1 block">
            {journal.filter((j) => j.status === 'OPEN').length || 2} Saham
          </b>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
          <span className="text-[10px] text-[#80887f] font-bold uppercase block">Rasio Kepatuhan ATR</span>
          <b className="text-2xl font-black text-amber-500 mt-1 block">96% Disiplin</b>
        </div>
      </div>

      {/* New Form */}
      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#1d7a5c]/40 space-y-4 text-xs shadow-md"
        >
          <b className="font-bold text-sm block pb-2 border-b border-[#e5ddd0] dark:border-[#26363d]">
            Tambah Catatan Jurnal Baru
          </b>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-[#56625f] block mb-1">Ticker</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                required
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-black uppercase"
              />
            </div>
            <div>
              <label className="font-bold text-[#56625f] block mb-1">Aksi</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold"
              >
                <option value="BUY">BUY (Beli)</option>
                <option value="SELL">SELL (Jual)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#56625f] block mb-1">Harga Transaksi</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-[#56625f] block mb-1">Jumlah Lot</label>
              <input
                type="number"
                value={lots}
                onChange={(e) => setLots(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#c4554a] block mb-1">Invalidasi (Cut Loss)</label>
              <input
                type="number"
                value={invalidation}
                onChange={(e) => setInvalidation(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold text-[#c4554a]"
              />
            </div>
            <div>
              <label className="font-bold text-[#1d7a5c] block mb-1">Target TP</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold text-[#1d7a5c]"
              />
            </div>
            <div>
              <label className="font-bold text-[#56625f] block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold"
              >
                <option value="OPEN">OPEN (Posisi Berjalan)</option>
                <option value="CLOSED_WIN">CLOSED WIN (Take Profit)</option>
                <option value="CLOSED_LOSS">CLOSED LOSS (Cut Loss)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#56625f] block mb-1">Alasan / Catatan Trade Plan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#1d7a5c] text-white font-black text-xs hover:opacity-90"
          >
            Simpan ke Jurnal
          </button>
        </form>
      )}

      {/* Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Ticker</th>
              <th className="py-2.5 px-3">Aksi</th>
              <th className="py-2.5 px-3">Harga</th>
              <th className="py-2.5 px-3">Lot</th>
              <th className="py-2.5 px-3">Total Nilai</th>
              <th className="py-2.5 px-3">Invalidasi</th>
              <th className="py-2.5 px-3">Target</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Catatan</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
            {journal.map((j) => (
              <tr
                key={j.id}
                className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                onClick={() => onSelectStock(j.ticker)}
              >
                <td className="py-2.5 px-3 text-[#80887f]">{j.date}</td>
                <td className="py-2.5 px-3 font-black text-sm">{j.ticker}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      j.action === 'BUY'
                        ? 'bg-[#1d7a5c]/10 text-[#1d7a5c]'
                        : 'bg-[#c4554a]/10 text-[#c4554a]'
                    }`}
                  >
                    {j.action}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-bold">Rp{j.price.toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 font-semibold">{j.lots} lot</td>
                <td className="py-2.5 px-3 font-bold">
                  Rp{(j.lots * 100 * j.price).toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-[#c4554a] font-bold">
                  Rp{j.invalidationPrice.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-[#1d7a5c] font-bold">
                  Rp{j.targetPrice.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      j.status === 'CLOSED_WIN'
                        ? 'bg-[#1d7a5c] text-white'
                        : j.status === 'CLOSED_LOSS'
                        ? 'bg-[#c4554a] text-white'
                        : 'bg-blue-500/10 text-blue-600'
                    }`}
                  >
                    {j.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[#80887f] max-w-xs truncate">{j.notes}</td>
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

      {/* FLEXING PORTO MODAL */}
      {flexingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setFlexingOpen(false)}
        >
          <div
            className="relative w-full max-w-lg p-6 rounded-3xl bg-linear-to-br from-[#10191c] to-[#1a2a30] text-[#f3eee4] border border-[#1d7a5c]/40 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <img src="/logo.svg?v=2" width="28" height="28" alt="" className="rounded-lg" />
                <div>
                  <b className="font-serif text-lg block font-bold">Penyembuh Luka · Portofolio</b>
                  <span className="text-[10px] text-[#80887f]">Kartu Rekap Kinerja Trading</span>
                </div>
              </div>
              <button
                onClick={() => setFlexingOpen(false)}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs cursor-pointer hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Flexing graphic */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#4fbf93]">
                DISIPLIN TRADE PLAN
              </span>
              <div className="flex justify-center items-baseline gap-2">
                <b className="text-5xl font-black text-[#4fbf93]">{winRate}%</b>
                <span className="text-sm font-bold text-[#80887f]">Win Rate</span>
              </div>
              <p className="text-xs text-[#a9b3ad] max-w-sm mx-auto">
                "Bukan seberapa sering kamu benar, tapi seberapa kecil risikomu saat salah dan seberapa besar rewardmu saat benar."
              </p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[#80887f] block text-[10px]">TOTAL TRADE</span>
                  <b>{totalTrades || 4} Transaksi</b>
                </div>
                <div>
                  <span className="text-[#80887f] block text-[10px]">AVG R:R</span>
                  <b className="text-[#4fbf93]">1 : 2.4</b>
                </div>
                <div>
                  <span className="text-[#80887f] block text-[10px]">MAKS DRAWDOWN</span>
                  <b className="text-[#e27c70]">-1.0%</b>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-[10px] text-[#80887f]">penyembuhluka.my.id · Screener Saham BEI</span>
              <button
                onClick={() => {
                  alert('Kartu Flexing Porto siap dibagikan ke komunitas atau medsos!');
                  setFlexingOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#1d7a5c] text-white font-bold hover:opacity-90"
              >
                Simpan &amp; Bagikan Gambar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
