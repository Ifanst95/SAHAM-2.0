import React, { useState, useMemo } from 'react';
import { StockData, JournalEntry } from '../../types.ts';

interface LotCalculatorViewProps {
  stocks: StockData[];
  onAddJournal: (entry: Partial<JournalEntry>) => void;
  onSelectStock: (ticker: string) => void;
}

export const LotCalculatorView: React.FC<LotCalculatorViewProps> = ({
  stocks,
  onAddJournal,
  onSelectStock,
}) => {
  const [ticker, setTicker] = useState<string>(stocks[0]?.ticker || 'BBCA');
  const [capital, setCapital] = useState<number>(50000000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [maxAllocationPercent, setMaxAllocationPercent] = useState<number>(20.0);
  const [entryPrice, setEntryPrice] = useState<number>(stocks[0]?.price || 10000);
  const [invalidationPrice, setInvalidationPrice] = useState<number>(stocks[0]?.invalidation || 9600);
  const [targetPrice, setTargetPrice] = useState<number>(stocks[0]?.target1 || 11000);
  const [savedMsg, setSavedMsg] = useState<string>('');

  const currentStock = stocks.find((s) => s.ticker === ticker);

  // Sync when ticker changes
  const handleTickerChange = (newTicker: string) => {
    setTicker(newTicker);
    const s = stocks.find((x) => x.ticker === newTicker);
    if (s) {
      setEntryPrice(s.price);
      setInvalidationPrice(s.invalidation);
      setTargetPrice(s.target1);
    }
  };

  // Calculations
  const calc = useMemo(() => {
    const maxRiskRp = (capital * riskPercent) / 100;
    const riskPerShare = Math.max(1, entryPrice - invalidationPrice);
    const sharesByRisk = Math.floor(maxRiskRp / riskPerShare);
    const lotsByRisk = Math.floor(sharesByRisk / 100);

    const maxAllocRp = (capital * maxAllocationPercent) / 100;
    const maxLotsByAlloc = Math.floor(maxAllocRp / (entryPrice * 100));

    const finalLots = Math.max(1, Math.min(lotsByRisk, maxLotsByAlloc));
    const totalBuyRp = finalLots * 100 * entryPrice;
    const actualRiskRp = finalLots * 100 * riskPerShare;
    const actualAllocPercent = capital > 0 ? (totalBuyRp / capital) * 100 : 0;

    const rewardPerShare = Math.max(1, targetPrice - entryPrice);
    const potentialProfitRp = finalLots * 100 * rewardPerShare;
    const rrRatio = (rewardPerShare / riskPerShare).toFixed(1);

    return {
      maxRiskRp,
      riskPerShare,
      finalLots,
      totalBuyRp,
      actualRiskRp,
      actualAllocPercent,
      potentialProfitRp,
      rrRatio,
    };
  }, [capital, riskPercent, maxAllocationPercent, entryPrice, invalidationPrice, targetPrice]);

  const handleSave = () => {
    onAddJournal({
      ticker,
      action: 'BUY',
      date: new Date().toISOString().split('T')[0],
      price: entryPrice,
      lots: calc.finalLots,
      invalidationPrice,
      targetPrice,
      status: 'OPEN',
      notes: `Trade Plan: Invalidasi ${invalidationPrice}, Target ${targetPrice}, R:R 1:${calc.rrRatio}`,
    });
    setSavedMsg('Rencana posisi berhasil dicatat ke Jurnal Trading!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <h2 className="font-serif text-2xl font-bold">Kalkulator Lot &amp; Manajemen Risiko</h2>
        <p className="text-xs text-[#80887f]">
          Tentukan jumlah lot pembelian secara presisi berdasarkan batas toleransi risiko (risk per trade) dan jarak invalidasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Inputs */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#56625f] block mb-1">Pilih Saham</label>
            <select
              value={ticker}
              onChange={(e) => handleTickerChange(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold text-sm"
            >
              {stocks.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} - {s.name} (Rp{s.price.toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#56625f] block mb-1">Total Modal Portofolio (Rp)</label>
            <input
              type="number"
              step="1000000"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-black text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#56625f] block mb-1">
                Risiko per Trade: <b className="text-[#1d7a5c]">{riskPercent}%</b>
              </label>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full accent-[#1d7a5c] cursor-pointer"
              />
            </div>
            <div>
              <label className="font-bold text-[#56625f] block mb-1">
                Maks Alokasi: <b className="text-[#2f679e]">{maxAllocationPercent}%</b>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={maxAllocationPercent}
                onChange={(e) => setMaxAllocationPercent(Number(e.target.value))}
                className="w-full accent-[#2f679e] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#56625f] block mb-1">Harga Beli (Entry)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value) || 1)}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-[#c4554a] block mb-1">Invalidasi (Cut Loss)</label>
              <input
                type="number"
                value={invalidationPrice}
                onChange={(e) => setInvalidationPrice(Number(e.target.value) || 1)}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold text-[#c4554a]"
              />
            </div>
            <div>
              <label className="font-bold text-[#1d7a5c] block mb-1">Target Harga (TP)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value) || 1)}
                className="w-full p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold text-[#1d7a5c]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-[#17242a] dark:bg-[#f3eee4] text-white dark:text-[#17242a] font-black text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              + Simpan Rencana ke Jurnal Portofolio
            </button>
            {savedMsg && (
              <p className="mt-2 text-center text-xs font-bold text-[#1d7a5c] bg-[#1d7a5c]/10 p-2 rounded-xl">
                {savedMsg}
              </p>
            )}
          </div>
        </div>

        {/* Right Output Results */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex flex-col justify-between space-y-4">
          <div className="p-5 rounded-2xl bg-[#1d7a5c]/10 border border-[#1d7a5c]/30 text-center space-y-1">
            <span className="text-xs font-bold text-[#1d7a5c] uppercase">Ukuran Posisi Rekomendasi</span>
            <b className="font-sans text-5xl font-black text-[#1d7a5c] block my-1">
              {calc.finalLots} LOT
            </b>
            <span className="text-xs text-[#56625f] block">
              {(calc.finalLots * 100).toLocaleString('id-ID')} Lembar Saham
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#80887f]">Total Modal Dibutuhkan:</span>
              <b className="font-bold text-sm">Rp{calc.totalBuyRp.toLocaleString('id-ID')}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-[#80887f]">Persentase Alokasi Modal:</span>
              <b>{calc.actualAllocPercent.toFixed(1)}% dari modal</b>
            </div>
            <div className="flex justify-between text-[#c4554a]">
              <span>Maksimal Kerugian (jika Invalidasi):</span>
              <b>-Rp{calc.actualRiskRp.toLocaleString('id-ID')} ({riskPercent}%)</b>
            </div>
            <div className="flex justify-between text-[#1d7a5c]">
              <span>Potensi Keuntungan (Target 1):</span>
              <b>+Rp{calc.potentialProfitRp.toLocaleString('id-ID')}</b>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#e5ddd0] dark:border-[#26363d]">
              <span className="font-bold">Risk to Reward Ratio:</span>
              <b className="text-base text-[#1d7a5c] font-black">1 : {calc.rrRatio}</b>
            </div>
          </div>

          <button
            onClick={() => onSelectStock(ticker)}
            className="w-full py-2.5 rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold text-xs text-[#2f679e] hover:bg-[#efe9dd] dark:hover:bg-[#121c20] transition-colors cursor-pointer text-center"
          >
            Buka Halaman Grafik &amp; Analisis {ticker} ›
          </button>
        </div>
      </div>
    </div>
  );
};
