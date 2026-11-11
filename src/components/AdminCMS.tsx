import React, { useState } from 'react';
import { StockData, SignalData, PlanData, VideoData, FaqData, UserData } from '../types.ts';

interface AdminCMSProps {
  stocks: StockData[];
  signals: SignalData[];
  plans: Record<string, PlanData>;
  videos: VideoData[];
  faq: FaqData[];
  users: UserData[];
  marketStatus?: any;
  onTriggerTick?: () => void;
  onRefreshData: () => void;
  onClose: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  stocks,
  signals,
  plans,
  videos,
  faq,
  users,
  marketStatus,
  onTriggerTick,
  onRefreshData,
  onClose,
}) => {
  const [tab, setTab] = useState<'stocks' | 'signals' | 'automation' | 'plans' | 'videos' | 'faq' | 'users' | 'tools'>('stocks');
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'bad' | '' }>({ text: '', type: '' });
  const [isTickLoading, setIsTickLoading] = useState(false);

  // Stock Form State
  const [stockForm, setStockForm] = useState<Partial<StockData>>({
    ticker: '',
    name: '',
    sector: 'Financials',
    group: 'Lainnya',
    price: 1000,
    change: 0,
    changePercent: 0,
    open: 1000,
    high: 1050,
    low: 980,
    previousClose: 1000,
    volume: 500000,
    frequency: 10000,
    frequencyAvg20: 8000,
    frequencySpike: 1.25,
    netForeign: 50000000000,
    momentumScore: 88,
    momentumRank: 'Pemimpin',
    vcpStatus: 'Ketat',
    vcpContraction: '-8% → -4% → -1.5%',
    pivotBreakout: 1050,
    invalidation: 950,
    target1: 1150,
    target2: 1250,
    ma5: 1010,
    ma20: 980,
    ma50: 940,
    ma200: 880,
    support: 960,
    resistance: 1060,
    trend: 'Uptrend Kuat',
  });

  // Signal Form State
  const [signalForm, setSignalForm] = useState<Partial<SignalData>>({
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk',
    type: 'momentum',
    session: 'Penutupan',
    signalDate: new Date().toISOString().split('T')[0],
    status: 'active',
    entryPrice: 10450,
    breakoutLevel: 10500,
    invalidationLevel: 10150,
    target1: 10950,
    target2: 11400,
    riskRewardRatio: '1:2.8',
    potentialGain: 15.0,
    maxRisk: 4.5,
    recommendedLot: 20,
    notes: 'Breakout konfirmasi volume tebal, didukung akumulasi asing.',
    checklist: {
      trendMa200: true,
      pullbackHealthy: true,
      vcpTight: true,
      volumeConfirmation: true,
      foreignAccumulation: true,
      frequencySpike: true,
    },
  });

  const showNotification = (text: string, type: 'ok' | 'bad') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3500);
  };

  // Stock operations
  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockForm.ticker || !stockForm.name) {
      showNotification('Ticker dan Nama Saham wajib diisi!', 'bad');
      return;
    }

    try {
      const res = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stockForm,
          ticker: stockForm.ticker.toUpperCase(),
          id: stockForm.ticker.toUpperCase(),
          candles: [
            {
              date: new Date().toISOString().split('T')[0],
              open: stockForm.open || stockForm.price || 1000,
              high: stockForm.high || (stockForm.price ? stockForm.price * 1.02 : 1050),
              low: stockForm.low || (stockForm.price ? stockForm.price * 0.98 : 980),
              close: stockForm.price || 1000,
              volume: stockForm.volume || 100000,
            },
          ],
          shareholders: [
            { name: 'Pengendali / Pemegang Utama', percentage: 51.0 },
            { name: 'Masyarakat Publik', percentage: 49.0 },
          ],
          insiderTransactions: [],
        }),
      });

      if (res.ok) {
        showNotification(`Saham ${stockForm.ticker?.toUpperCase()} berhasil disimpan ke database!`, 'ok');
        onRefreshData();
      } else {
        showNotification('Gagal menyimpan data saham.', 'bad');
      }
    } catch {
      showNotification('Terjadi kendala jaringan.', 'bad');
    }
  };

  const handleDeleteStock = async (ticker: string) => {
    if (!confirm(`Hapus saham ${ticker} dari database?`)) return;
    try {
      const res = await fetch(`/api/stocks/${ticker}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`Saham ${ticker} berhasil dihapus.`, 'ok');
        onRefreshData();
      }
    } catch {
      showNotification('Gagal menghapus saham.', 'bad');
    }
  };

  // Signal operations
  const handleSaveSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signalForm.ticker) {
      showNotification('Pilih ticker saham untuk sinyal.', 'bad');
      return;
    }

    try {
      const matched = stocks.find((s) => s.ticker === signalForm.ticker);
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signalForm,
          name: matched ? matched.name : signalForm.name,
        }),
      });

      if (res.ok) {
        showNotification(`Sinyal untuk ${signalForm.ticker} berhasil diterbitkan!`, 'ok');
        onRefreshData();
      }
    } catch {
      showNotification('Gagal menyimpan sinyal.', 'bad');
    }
  };

  const handleDeleteSignal = async (id: string) => {
    if (!confirm('Hapus sinyal ini?')) return;
    try {
      const res = await fetch(`/api/signals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Sinyal berhasil dihapus.', 'ok');
        onRefreshData();
      }
    } catch {
      showNotification('Gagal menghapus sinyal.', 'bad');
    }
  };

  // Plans operations
  const handleUpdatePlans = async (updatedPlans: Record<string, PlanData>, paymentMode: string) => {
    try {
      const res = await fetch('/api/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: updatedPlans, payment_mode: paymentMode }),
      });
      if (res.ok) {
        showNotification('Paket langganan & mode pembayaran berhasil diperbarui!', 'ok');
        onRefreshData();
      }
    } catch {
      showNotification('Gagal memperbarui paket langganan.', 'bad');
    }
  };

  // Reset DB
  const handleResetDb = async () => {
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin mengembalikan seluruh database ke pengaturan awal pabrik (default 900+ emiten, sinyal, dan materi)?')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/reset-db', { method: 'POST' });
      if (res.ok) {
        showNotification('Database berhasil di-reset ke kondisi awal!', 'ok');
        onRefreshData();
      }
    } catch {
      showNotification('Gagal reset database.', 'bad');
    }
  };

  // Market Automation Handlers
  const handleToggleAutoUpdate = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/market/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoUpdateEnabled: enabled }),
      });
      if (res.ok) {
        showNotification(
          enabled ? 'Mesin Pembaruan Otomatis Pasar diaktifkan!' : 'Pembaruan Otomatis dinonaktifkan.',
          'ok'
        );
        onRefreshData();
      }
    } catch {
      showNotification('Gagal memperbarui status auto-update.', 'bad');
    }
  };

  const handleChangeInterval = async (interval: number) => {
    try {
      const res = await fetch('/api/market/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalSeconds: interval }),
      });
      if (res.ok) {
        showNotification(`Interval pembaruan diubah menjadi ${interval} detik.`, 'ok');
        onRefreshData();
      }
    } catch {
      showNotification('Gagal mengubah interval.', 'bad');
    }
  };

  const handleSwitchSession = async (session: 'Sesi 1' | 'Penutupan') => {
    try {
      const res = await fetch('/api/market/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
      });
      if (res.ok) {
        showNotification(`Sesi pasar berhasil dialihkan ke: ${session}`, 'ok');
        onRefreshData();
      }
    } catch {
      showNotification('Gagal mengalihkan sesi.', 'bad');
    }
  };

  const handleManualForceTick = async () => {
    setIsTickLoading(true);
    try {
      if (onTriggerTick) {
        await onTriggerTick();
      } else {
        await fetch('/api/market/tick', { method: 'POST' });
        onRefreshData();
      }
      showNotification('Tick pasar berhasil dipicu seketika!', 'ok');
    } catch {
      showNotification('Gagal memicu tick.', 'bad');
    } finally {
      setTimeout(() => setIsTickLoading(false), 400);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      {/* Top Banner */}
      <div className="bg-[var(--card)] border-b border-[var(--line)] py-4 px-6 shadow-xs sticky top-[68px] z-30 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--up)]">
            Sistem Manajemen Konten (CMS)
          </span>
          <h2 className="text-xl font-black text-[var(--ink)]">
            Pusat Pengelolaan Data &amp; Konten Penyembuh Luka
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
        >
          Kembali ke Aplikasi ✕
        </button>
      </div>

      <div className="wrap mt-6">
        {/* Toast Message */}
        {msg.text && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-bold text-center border ${
              msg.type === 'ok'
                ? 'bg-[var(--up-soft)] border-emerald-500 text-[var(--up)]'
                : 'bg-red-500/10 border-red-500 text-[var(--down)]'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* CMS Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--line)] mb-6 scrollbar-none">
          <button
            onClick={() => setTab('stocks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'stocks'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            Input &amp; Kelola Saham ({stocks.length})
          </button>
          <button
            onClick={() => setTab('signals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'signals'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            Input Sinyal Harian ({signals.length})
          </button>
          <button
            onClick={() => setTab('automation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'automation'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-Update &amp; Pasar BEI
          </button>
          <button
            onClick={() => setTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'plans'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            Paket Langganan &amp; Pembayaran
          </button>
          <button
            onClick={() => setTab('videos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'videos'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            Video Materi Belajar ({videos.length})
          </button>
          <button
            onClick={() => setTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'faq'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            Kelola FAQ ({faq.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'users'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            Pengguna &amp; Akses ({users.length})
          </button>
          <button
            onClick={() => setTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === 'tools'
                ? 'bg-[var(--btn)] text-[var(--btn-fg)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
            }`}
          >
            Import / Export / Reset
          </button>
        </div>

        {/* SUBTAB 1: Input & Kelola Saham BEI */}
        {tab === 'stocks' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <h3 className="text-base font-black text-[var(--ink)] mb-1">
                Formulir Input Data Saham BEI
              </h3>
              <p className="text-xs text-[var(--muted)] mb-5">
                Tambahkan atau perbarui data emiten, harga, level teknikal, VCP, dan indikator momentum.
              </p>

              <form onSubmit={handleSaveStock} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Kode Ticker *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BBRI"
                    value={stockForm.ticker || ''}
                    onChange={(e) => setStockForm({ ...stockForm, ticker: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] font-bold text-[var(--ink)] uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Nama Perusahaan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bank Rakyat Indonesia Tbk"
                    value={stockForm.name || ''}
                    onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Sektor</label>
                  <select
                    value={stockForm.sector || 'Financials'}
                    onChange={(e) => setStockForm({ ...stockForm, sector: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    <option value="Financials">Financials</option>
                    <option value="Energy">Energy</option>
                    <option value="Basic Materials">Basic Materials</option>
                    <option value="Consumer Non-Cyclical">Consumer Non-Cyclical</option>
                    <option value="Consumer Cyclical">Consumer Cyclical</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Properties & Real Estate">Properties &amp; Real Estate</option>
                    <option value="Industrials">Industrials</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Harga Terakhir (Close)</label>
                  <input
                    type="number"
                    value={stockForm.price || 0}
                    onChange={(e) => setStockForm({ ...stockForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] font-bold text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Perubahan Harga (+/-)</label>
                  <input
                    type="number"
                    value={stockForm.change || 0}
                    onChange={(e) => setStockForm({ ...stockForm, change: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Perubahan Persen (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.changePercent || 0}
                    onChange={(e) => setStockForm({ ...stockForm, changePercent: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>

                {/* Technical Levels */}
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Batas Breakout (Pivot)</label>
                  <input
                    type="number"
                    value={stockForm.pivotBreakout || 0}
                    onChange={(e) => setStockForm({ ...stockForm, pivotBreakout: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--down)] block mb-1">Batas Invalidasi (Stoploss)</label>
                  <input
                    type="number"
                    value={stockForm.invalidation || 0}
                    onChange={(e) => setStockForm({ ...stockForm, invalidation: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--down)] font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--up)] block mb-1">Target Harga 1</label>
                  <input
                    type="number"
                    value={stockForm.target1 || 0}
                    onChange={(e) => setStockForm({ ...stockForm, target1: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--up)] font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">MA200 (Tren Utama)</label>
                  <input
                    type="number"
                    value={stockForm.ma200 || 0}
                    onChange={(e) => setStockForm({ ...stockForm, ma200: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Momentum Score (0-100)</label>
                  <input
                    type="number"
                    value={stockForm.momentumScore || 90}
                    onChange={(e) => setStockForm({ ...stockForm, momentumScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">VCP Pattern</label>
                  <select
                    value={stockForm.vcpStatus || 'Ketat'}
                    onChange={(e) => setStockForm({ ...stockForm, vcpStatus: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    <option value="Ketat">Ketat</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Longgar">Longgar</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                </div>

                <div className="md:col-span-3 pt-3 flex justify-end gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[var(--btn)] text-[var(--btn-fg)] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    + Simpan / Update Data Saham
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Stocks Table */}
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <h3 className="text-base font-black text-[var(--ink)] mb-4">
                Daftar Saham Terdaftar ({stocks.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase tracking-wider font-bold">
                      <th className="py-2 px-3">Ticker</th>
                      <th className="py-2 px-3">Nama Emiten</th>
                      <th className="py-2 px-3">Sektor</th>
                      <th className="py-2 px-3">Harga</th>
                      <th className="py-2 px-3">Momentum</th>
                      <th className="py-2 px-3">VCP</th>
                      <th className="py-2 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {stocks.map((s) => (
                      <tr key={s.ticker} className="hover:bg-[var(--bg2)]">
                        <td className="py-2.5 px-3 font-black text-[var(--ink)]">{s.ticker}</td>
                        <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{s.name}</td>
                        <td className="py-2.5 px-3 text-[var(--muted)]">{s.sector}</td>
                        <td className="py-2.5 px-3 font-bold">Rp{s.price.toLocaleString()}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[var(--up)]">{s.momentumScore} ({s.momentumRank})</span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--muted)]">{s.vcpStatus}</td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => setStockForm(s)}
                            className="text-xs font-semibold text-[var(--up)] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStock(s.ticker)}
                            className="text-xs font-semibold text-[var(--down)] hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: Input Sinyal Harian */}
        {tab === 'signals' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <h3 className="text-base font-black text-[var(--ink)] mb-1">
                Formulir Penerbitan Sinyal Baru
              </h3>
              <p className="text-xs text-[var(--muted)] mb-5">
                Terbitkan sinyal Pullback (01), HAKA Menunggu Konfirmasi (02), atau HAKA Momentum Terkonfirmasi (03).
              </p>

              <form onSubmit={handleSaveSignal} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Pilih Saham *</label>
                  <select
                    value={signalForm.ticker || ''}
                    onChange={(e) => {
                      const sel = stocks.find((s) => s.ticker === e.target.value);
                      if (sel) {
                        setSignalForm({
                          ...signalForm,
                          ticker: sel.ticker,
                          name: sel.name,
                          entryPrice: sel.price,
                          breakoutLevel: sel.pivotBreakout,
                          invalidationLevel: sel.invalidation,
                          target1: sel.target1,
                          target2: sel.target2,
                        });
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] font-bold text-[var(--ink)]"
                  >
                    {stocks.map((s) => (
                      <option key={s.ticker} value={s.ticker}>
                        {s.ticker} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Tahap Sinyal</label>
                  <select
                    value={signalForm.type || 'momentum'}
                    onChange={(e) => setSignalForm({ ...signalForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    <option value="pullback">01 ▲ Pullback (Sinyal baru)</option>
                    <option value="haka">02 ◆ HAKA (Menunggu konfirmasi)</option>
                    <option value="momentum">03 ● HAKA Momentum (Terkonfirmasi)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Sesi Publikasi</label>
                  <select
                    value={signalForm.session || 'Penutupan'}
                    onChange={(e) => setSignalForm({ ...signalForm, session: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                  >
                    <option value="Sesi 1">Sesi 1 (Pukul 12:00 WIB)</option>
                    <option value="Penutupan">Penutupan Bursa (EOD)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Harga Acuan / Masuk</label>
                  <input
                    type="number"
                    value={signalForm.entryPrice || 0}
                    onChange={(e) => setSignalForm({ ...signalForm, entryPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] font-bold text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--down)] block mb-1">Batas Invalidasi</label>
                  <input
                    type="number"
                    value={signalForm.invalidationLevel || 0}
                    onChange={(e) => setSignalForm({ ...signalForm, invalidationLevel: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--down)] font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--up)] block mb-1">Target 1</label>
                  <input
                    type="number"
                    value={signalForm.target1 || 0}
                    onChange={(e) => setSignalForm({ ...signalForm, target1: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--up)] font-bold"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="font-bold text-[var(--muted)] block mb-1">Catatan Analisis</label>
                  <textarea
                    rows={2}
                    value={signalForm.notes || ''}
                    onChange={(e) => setSignalForm({ ...signalForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)]"
                    placeholder="Alasan teknikal sinyal masuk, pola chart, volume, dll."
                  />
                </div>

                <div className="md:col-span-3 pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[var(--btn)] text-[var(--btn-fg)] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    + Terbitkan Sinyal ke Dashboard
                  </button>
                </div>
              </form>
            </div>

            {/* Active Signals Table */}
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <h3 className="text-base font-black text-[var(--ink)] mb-4">
                Daftar Sinyal Aktif ({signals.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase font-bold">
                      <th className="py-2 px-3">Tanggal</th>
                      <th className="py-2 px-3">Ticker</th>
                      <th className="py-2 px-3">Tahap</th>
                      <th className="py-2 px-3">Sesi</th>
                      <th className="py-2 px-3">Harga</th>
                      <th className="py-2 px-3">Invalidasi</th>
                      <th className="py-2 px-3">Target 1</th>
                      <th className="py-2 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {signals.map((sig) => (
                      <tr key={sig.id} className="hover:bg-[var(--bg2)]">
                        <td className="py-2 px-3 font-semibold">{sig.signalDate}</td>
                        <td className="py-2 px-3 font-black text-[var(--ink)]">{sig.ticker}</td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-[var(--up)] uppercase">{sig.type}</span>
                        </td>
                        <td className="py-2 px-3 text-[var(--muted)]">{sig.session}</td>
                        <td className="py-2 px-3 font-bold">Rp{sig.entryPrice.toLocaleString()}</td>
                        <td className="py-2 px-3 text-[var(--down)] font-bold">Rp{sig.invalidationLevel.toLocaleString()}</td>
                        <td className="py-2 px-3 text-[var(--up)] font-bold">Rp{sig.target1.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => handleDeleteSignal(sig.id)}
                            className="text-xs font-semibold text-[var(--down)] hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: Otomatisasi & Pembaruan Pasar BEI */}
        {tab === 'automation' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--up-soft)] text-[var(--up)] text-xs font-bold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Mesin Pembaruan Real-Time Aktif
                  </div>
                  <h3 className="text-lg font-black text-[var(--ink)]">
                    Pusat Otomatisasi &amp; Simulasi Pasar BEI
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Kelola generator tick harga otomatis, sinkronisasi sinyal target/stoploss, rotasi sesi bursa, dan interval polling live.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleManualForceTick}
                    disabled={isTickLoading}
                    className="px-5 py-2.5 rounded-xl bg-[var(--btn)] text-[var(--btn-fg)] font-bold text-xs shadow-xs hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isTickLoading ? (
                      <span className="animate-spin inline-block">↻</span>
                    ) : (
                      <span>⚡</span>
                    )}
                    Picu Tick Pasar Sekarang
                  </button>
                </div>
              </div>

              {/* Status Overview Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="p-3.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)] font-medium block mb-1">Status Auto-Update</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${marketStatus?.autoUpdateEnabled !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <b className="text-sm font-black text-[var(--ink)]">
                      {marketStatus?.autoUpdateEnabled !== false ? 'AKTIF (Berjalan)' : 'NONAKTIF (Jeda)'}
                    </b>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)] font-medium block mb-1">Interval Pembaruan</span>
                  <b className="text-sm font-black text-[var(--ink)]">
                    {marketStatus?.intervalSeconds || 5} Detik / Tick
                  </b>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)] font-medium block mb-1">Sesi Pasar Terpilih</span>
                  <b className="text-sm font-black text-[var(--ink)]">
                    {marketStatus?.marketSession || 'Penutupan'}
                  </b>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)] font-medium block mb-1">Indeks IHSG Realtime</span>
                  <div className="flex items-center gap-1.5">
                    <b className="text-sm font-black text-[var(--ink)]">
                      {marketStatus?.ihsg?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '7.284,50'}
                    </b>
                    <span className={`text-xs font-bold ${Number(marketStatus?.ihsgChange || 0) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {Number(marketStatus?.ihsgChange || 0) >= 0 ? '+' : ''}{Number(marketStatus?.ihsgChange || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Control Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Engine Controls */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs space-y-5">
                <div>
                  <h4 className="text-sm font-black text-[var(--ink)] mb-1">
                    Konfigurasi Kecepatan &amp; Status Mesin
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    Atur seberapa cepat server memicu pergerakan fraksi harga dan memperbarui status target sinyal.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Toggle On / Off */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)]">
                    <div>
                      <b className="text-xs font-bold text-[var(--ink)] block">Pembaruan Otomatis Terjadwal</b>
                      <span className="text-[11px] text-[var(--muted)]">Background interval polling pergerakan bursa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAutoUpdate(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          marketStatus?.autoUpdateEnabled !== false
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--line)]'
                        }`}
                      >
                        Aktif
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAutoUpdate(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          marketStatus?.autoUpdateEnabled === false
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--line)]'
                        }`}
                      >
                        Jeda
                      </button>
                    </div>
                  </div>

                  {/* Interval Selection */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] space-y-2">
                    <b className="text-xs font-bold text-[var(--ink)] block">Frekuensi Tick Otomatis</b>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 5, 10, 30].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleChangeInterval(sec)}
                          className={`py-2 rounded-lg text-xs font-bold text-center border cursor-pointer transition-all ${
                            (marketStatus?.intervalSeconds || 5) === sec
                              ? 'bg-[var(--btn)] text-[var(--btn-fg)] border-transparent shadow-xs'
                              : 'bg-[var(--card)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                          }`}
                        >
                          {sec}s {sec === 5 ? '(Standar)' : sec === 2 ? '(Cepat)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sesi Bursa Switcher */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg2)] border border-[var(--line)] space-y-2">
                    <b className="text-xs font-bold text-[var(--ink)] block">Simulasi Sesi Perdagangan BEI</b>
                    <span className="text-[11px] text-[var(--muted)] block mb-2">
                      Mengalihkan status sinyal dan stempel waktu ke Sesi Siang (12:00) atau Penutupan EOD (16:00).
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSwitchSession('Sesi 1')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold text-center border cursor-pointer transition-all ${
                          marketStatus?.marketSession === 'Sesi 1'
                            ? 'bg-[var(--btn)] text-[var(--btn-fg)] border-transparent shadow-xs'
                            : 'bg-[var(--card)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                        }`}
                      >
                        ☀️ Sesi 1 (12:00 WIB)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchSession('Penutupan')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold text-center border cursor-pointer transition-all ${
                          marketStatus?.marketSession !== 'Sesi 1'
                            ? 'bg-[var(--btn)] text-[var(--btn-fg)] border-transparent shadow-xs'
                            : 'bg-[var(--card)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                        }`}
                      >
                        🌙 Penutupan (EOD)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Live Tick Log Feed */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-[var(--ink)]">
                      Log Aktivitas &amp; Pergerakan Pasar
                    </h4>
                    <span className="text-[11px] font-bold text-[var(--up)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Realtime Feed
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-4">
                    Riwayat tick bursa, saham yang mengalami transaksi baru, dan pergeseran indeks.
                  </p>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {(marketStatus?.updateLogs || []).length === 0 ? (
                      <div className="py-8 text-center text-xs text-[var(--muted)]">
                        Menunggu tick pertama dari server...
                      </div>
                    ) : (
                      (marketStatus?.updateLogs || []).map((log: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[var(--bg2)] border border-[var(--line)] text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[var(--muted)] bg-[var(--card)] px-1.5 py-0.5 rounded border border-[var(--line)]">
                              {log.timestamp}
                            </span>
                            <span className="font-medium text-[var(--ink)]">
                              {log.message}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            log.type === 'tick'
                              ? 'bg-blue-500/10 text-blue-600'
                              : log.type === 'session'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {log.type.toUpperCase()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--line)] mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Terakhir diperbarui: {marketStatus?.lastUpdated ? new Date(marketStatus.lastUpdated).toLocaleTimeString('id-ID') : 'Baru saja'}</span>
                  <button
                    onClick={onRefreshData}
                    className="text-xs font-bold text-[var(--up)] hover:underline cursor-pointer"
                  >
                    ↻ Segarkan Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: Paket Langganan & Mode Pembayaran */}
        {tab === 'plans' && (
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-[var(--ink)] mb-1">
                Pengaturan Paket Langganan &amp; Gateway Pembayaran
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Atur harga, hari aktif, dan integrasi pembayaran QRIS / Midtrans / Bank Transfer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(plans).map((k) => {
                const p = plans[k];
                return (
                  <div key={k} className="p-4 rounded-xl bg-[var(--bg2)] border border-[var(--line)] space-y-3">
                    <div className="flex items-center justify-between">
                      <b className="text-sm font-black text-[var(--ink)]">Paket {p.label}</b>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--up-soft)] text-[var(--up)]">
                        {p.days} Hari
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-[var(--muted)] block mb-1">Harga (Rp)</label>
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => {
                            const copy = { ...plans, [k]: { ...p, price: Number(e.target.value) } };
                            handleUpdatePlans(copy, 'midtrans');
                          }}
                          className="w-full p-2 rounded-lg bg-[var(--card)] border border-[var(--line)] font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--muted)] block mb-1">Status</label>
                        <select
                          value={p.status}
                          onChange={(e) => {
                            const copy = { ...plans, [k]: { ...p, status: e.target.value as any } };
                            handleUpdatePlans(copy, 'midtrans');
                          }}
                          className="w-full p-2 rounded-lg bg-[var(--card)] border border-[var(--line)]"
                        >
                          <option value="active">Aktif (Dibuka)</option>
                          <option value="soon">Segera Hadir</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 4: Video Tutorial */}
        {tab === 'videos' && (
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
            <h3 className="text-base font-black text-[var(--ink)] mb-4">
              Daftar Video Materi Belajar ({videos.length})
            </h3>
            <div className="space-y-3">
              {videos.map((vid) => (
                <div key={vid.id} className="p-3 rounded-xl bg-[var(--bg2)] border border-[var(--line)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={vid.poster} alt={vid.title} className="w-16 h-10 object-cover rounded-md" />
                    <div>
                      <b className="text-xs font-bold text-[var(--ink)] block">{vid.title}</b>
                      <span className="text-[11px] text-[var(--muted)]">{vid.description}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--card)] text-[var(--muted)]">
                    {vid.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 5: FAQ */}
        {tab === 'faq' && (
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
            <h3 className="text-base font-black text-[var(--ink)] mb-4">
              Kelola Tanya Jawab (FAQ)
            </h3>
            <div className="space-y-3">
              {faq.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-[var(--bg2)] border border-[var(--line)]">
                  <b className="text-xs font-black text-[var(--ink)] block mb-1">{f.question}</b>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 6: Pengguna & Akses */}
        {tab === 'users' && (
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
            <h3 className="text-base font-black text-[var(--ink)] mb-4">
              Daftar Pengguna &amp; Akses Langganan
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase font-bold">
                    <th className="py-2 px-3">Email Pengguna</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Status Langganan</th>
                    <th className="py-2 px-3">Masa Berlaku</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {users.map((u) => (
                    <tr key={u.email} className="hover:bg-[var(--bg2)]">
                      <td className="py-2.5 px-3 font-bold text-[var(--ink)]">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-500/15 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--up-soft)] text-[var(--up)]">
                          {u.subscriptionActive ? 'AKTIF' : 'KEDALUWARSA'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[var(--muted)]">{u.subscriptionExpires || 'Selamanya'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[11px] text-[var(--up)] font-semibold">Terverifikasi</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 7: Tools (Import, Export, Reset) */}
        {tab === 'tools' && (
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-[var(--ink)] mb-1">
                Alat Impor, Ekspor &amp; Pemulihan Database
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Cadangkan seluruh data ke format JSON, atau pulihkan data awal BEI.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg2)] border border-[var(--line)] space-y-3">
                <b className="text-sm font-bold block text-[var(--ink)]">Ekspor Database</b>
                <p className="text-xs text-[var(--muted)]">Unduh seluruh koleksi saham, sinyal, dan tutorial dalam format JSON.</p>
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ stocks, signals, plans, videos, faq }, null, 2));
                    const dl = document.createElement('a');
                    dl.setAttribute('href', dataStr);
                    dl.setAttribute('download', `penyembuhluka_backup_${new Date().toISOString().split('T')[0]}.json`);
                    dl.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--btn)] text-[var(--btn-fg)] font-bold text-xs"
                >
                  Unduh File Backup JSON
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(196,85,74,0.06)] border border-red-500/20 space-y-3">
                <b className="text-sm font-bold block text-[var(--down)]">Reset Database ke Default</b>
                <p className="text-xs text-[var(--muted)]">Kembalikan semua daftar saham, sinyal, video, dan paket ke setelan awal.</p>
                <button
                  type="button"
                  onClick={handleResetDb}
                  className="px-4 py-2 rounded-xl bg-[var(--down)] text-white font-bold text-xs hover:opacity-90"
                >
                  Reset ke Database Awal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
