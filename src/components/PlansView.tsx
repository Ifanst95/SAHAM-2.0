import React, { useState } from 'react';
import { PlanData, UserData } from '../types.ts';

interface PlansViewProps {
  user: UserData | null;
  plans: Record<string, PlanData>;
  onOpenAuth: (mode: 'daftar' | 'masuk') => void;
  onNavigateToApp: () => void;
}

export const PlansView: React.FC<PlansViewProps> = ({
  user,
  plans,
  onOpenAuth,
  onNavigateToApp,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('bulanan');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatRp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

  const inclusions = [
    'Semua tab sinyal, level dan Trade Plan',
    'Data Sesi 1 dan Penutupan setiap hari bursa',
    'VCP, Money Flow, Frequency Analyzer, asing dan pemegang saham',
    'Kalkulator lot, Jurnal dan Video tutorial',
  ];

  const handleSimulatePayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      onNavigateToApp();
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="wrap max-w-4xl">
        <div className="text-center mb-10">
          <span className="eyebrow">Langganan Akses Penuh</span>
          <h2 className="sec">Pilih Paket Belajar Saham BEI</h2>
          <p className="sec-lead mx-auto">
            Akses 900+ saham, screener harian dua kali sehari, kalkulator lot, dan jurnal terintegrasi.
          </p>
        </div>

        {/* User Status Bar */}
        {user ? (
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[var(--up-soft)] text-[var(--up)] flex items-center justify-center font-bold text-sm">
                ✓
              </span>
              <div>
                <b className="text-sm text-[var(--ink)] block">Akun: {user.email}</b>
                <span className="text-xs text-[var(--up)] font-semibold">
                  Status: Langganan Aktif hingga {user.subscriptionExpires || '2028'}
                </span>
              </div>
            </div>
            <button
              onClick={onNavigateToApp}
              className="px-4 py-2 rounded-xl bg-[var(--up)] text-white font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Masuk ke Screener →
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[var(--bg2)] border border-[var(--line)] text-center mb-8">
            <p className="text-xs text-[var(--muted)] mb-2">
              Belum masuk dengan email? Masuk dulu untuk mengaktifkan langganan ke akun kamu.
            </p>
            <button
              onClick={() => onOpenAuth('daftar')}
              className="px-4 py-1.5 rounded-xl bg-[var(--btn)] text-[var(--btn-fg)] font-bold text-xs"
            >
              Daftar / Masuk dengan Email
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {Object.keys(plans).map((k) => {
            const p = plans[k];
            const isSelected = selectedPlan === k;
            const soon = !(Number(p.price) > 0);

            return (
              <div
                key={k}
                onClick={() => !soon && setSelectedPlan(k)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[var(--card)] border-[var(--up)] ring-2 ring-[var(--up)] shadow-md'
                    : 'bg-[var(--card)] border-[var(--line)] hover:border-[var(--line2)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <b className="text-base font-black text-[var(--ink)]">Langganan {p.label}</b>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--up-soft)] text-[var(--up)]">
                      {p.days} hari
                    </span>
                  </div>

                  <div className="text-3xl font-black text-[var(--ink)] mb-1">
                    {soon ? 'Segera hadir' : formatRp(p.price)}
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-4">
                    {soon ? 'Paket ini belum dibuka' : `Akses penuh tanpa batas selama ${p.days} hari`}
                  </p>

                  <ul className="space-y-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
                    {inclusions.map((inc, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-[var(--up)] font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--line)]">
                  {soon ? (
                    <span className="text-xs text-[var(--muted)] font-semibold block text-center">
                      Belum Tersedia
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                        isSelected
                          ? 'bg-[var(--up)] text-white'
                          : 'bg-[var(--bg2)] text-[var(--ink)] hover:bg-[var(--line)]'
                      }`}
                    >
                      {isSelected ? '✓ Paket Terpilih' : 'Pilih Paket Ini'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Confirmation Box */}
        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-sm text-center">
          <h3 className="text-base font-black text-[var(--ink)] mb-2">
            Metode Pembayaran Instan (QRIS &amp; Virtual Account)
          </h3>
          <p className="text-xs text-[var(--muted)] mb-5 max-w-md mx-auto">
            Pembayaran diverifikasi secara otomatis dalam hitungan detik. Akun langsung aktif tanpa perlu konfirmasi manual.
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-lg border border-[var(--line2)] text-xs font-bold bg-[var(--bg2)]">
              QRIS (GoPay, OVO, Dana, ShopeePay)
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-[var(--line2)] text-xs font-bold bg-[var(--bg2)]">
              BCA, Mandiri, BRI, BNI VA
            </span>
          </div>

          {paymentSuccess ? (
            <div className="p-4 rounded-xl bg-[var(--up-soft)] text-[var(--up)] text-sm font-bold animate-bounce">
              ✓ Pembayaran Berhasil! Mengalihkan ke Dashboard Screener…
            </div>
          ) : (
            <button
              onClick={handleSimulatePayment}
              className="px-8 py-3 rounded-xl bg-[var(--btn)] text-[var(--btn-fg)] font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              Bayar Sekarang ({plans[selectedPlan] ? formatRp(plans[selectedPlan].price) : 'Rp50.000'})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
