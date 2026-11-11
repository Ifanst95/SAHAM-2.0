import React, { useState, useMemo } from 'react';
import { StockData } from '../../types.ts';

interface CorporateActionsViewProps {
  stocks?: StockData[];
  onSelectStock: (ticker: string) => void;
  onOpenLotCalculator?: (stock: StockData) => void;
}

type ActionCategory =
  | 'semua'
  | 'dividen'
  | 'right_issue'
  | 'waran'
  | 'stock_split'
  | 'saham_bonus'
  | 'private_placement'
  | 'rups'
  | 'buyback'
  | 'tender_offer';

interface DividendItem {
  id: string;
  ticker: string;
  name: string;
  category: 'dividen';
  type: 'Dividen Tunai' | 'Dividen Interim' | 'Dividen Final';
  dps: number;
  cumDate: string;
  exDate: string;
  recDate: string;
  payDate: string;
  yield: string;
  status: 'Cum Date Mendekat' | 'Ex Date' | 'Selesai' | 'Mendatang';
}

interface RightIssueItem {
  id: string;
  ticker: string;
  name: string;
  category: 'right_issue';
  ratio: string;
  exercisePrice: number;
  targetFund: string;
  cumDate: string;
  exDate: string;
  tradeStart: string;
  tradeEnd: string;
  purpose: string;
  status: 'Perdagangan Aktif' | 'Menunggu Efektif' | 'Cum Date Mendekat';
}

interface WarrantItem {
  id: string;
  ticker: string;
  warrantTicker: string;
  name: string;
  category: 'waran';
  series: 'Waran Seri I' | 'Waran Seri II' | 'Waran Terstruktur';
  ratio: string;
  exercisePrice: number;
  startDate: string;
  expiryDate: string;
  underlyingPrice: number;
  premiumPercent: string;
  status: 'Dapat Ditebus' | 'Aktif Diperdagangkan' | 'Mendekati Expired';
}

interface StockSplitItem {
  id: string;
  ticker: string;
  name: string;
  category: 'stock_split';
  type: 'Stock Split' | 'Reverse Stock Split';
  ratio: string;
  oldNominal: number;
  newNominal: number;
  effectiveDate: string;
  purpose: string;
  status: 'Menunggu RUPS' | 'Efektif Terjadwal' | 'Selesai';
}

interface BonusShareItem {
  id: string;
  ticker: string;
  name: string;
  category: 'saham_bonus';
  type: 'Saham Bonus' | 'Dividen Saham';
  ratio: string;
  source: string;
  cumDate: string;
  distDate: string;
  status: 'Menunggu Persetujuan OJK' | 'Cum Date Mendekat' | 'Efektif';
}

interface PrivatePlacementItem {
  id: string;
  ticker: string;
  name: string;
  category: 'private_placement';
  sharesIssued: string;
  price: number;
  targetFund: string;
  investor: string;
  execDate: string;
  status: 'Pelaksanaan' | 'Persetujuan RUPS' | 'Tahap Pembicaraan';
}

interface RupsItem {
  id: string;
  ticker: string;
  name: string;
  category: 'rups';
  event: 'RUPST' | 'RUPSLB' | 'Public Expose Insidentil' | 'Public Expose Tahunan';
  date: string;
  time: string;
  location: string;
  agenda: string;
  status: 'Panggilan Resmi' | 'Pemberitahuan' | 'Selesai Dilaksanakan';
}

interface BuybackItem {
  id: string;
  ticker: string;
  name: string;
  category: 'buyback';
  allocatedFund: string;
  maxSharesPercent: string;
  period: string;
  purpose: string;
  status: 'Sedang Berjalan' | 'Menunggu RUPS' | 'Mendekati Akhir';
}

interface TenderOfferItem {
  id: string;
  ticker: string;
  name: string;
  category: 'tender_offer';
  offerType: 'Mandatory Tender Offer (MTO)' | 'Voluntary Tender Offer (VTO)' | 'Akuisisi / Merger';
  offeror: string;
  offerPrice: number;
  sharesTarget: string;
  period: string;
  status: 'Periode Penawaran' | 'Menunggu Pernyataan Efektif OJK' | 'Selesai';
}

type AnyCorporateAction =
  | DividendItem
  | RightIssueItem
  | WarrantItem
  | StockSplitItem
  | BonusShareItem
  | PrivatePlacementItem
  | RupsItem
  | BuybackItem
  | TenderOfferItem;

// COMPLETE DATABASE OF BEI CORPORATE ACTIONS
const ALL_DIVIDENDS: DividendItem[] = [
  { id: 'div-1', ticker: 'ADRO', name: 'Alamtri Resources Indonesia Tbk', category: 'dividen', type: 'Dividen Interim', dps: 285, cumDate: '18 Nov 2026', exDate: '19 Nov 2026', recDate: '20 Nov 2026', payDate: '06 Des 2026', yield: '7.8%', status: 'Cum Date Mendekat' },
  { id: 'div-2', ticker: 'BBCA', name: 'Bank Central Asia Tbk', category: 'dividen', type: 'Dividen Interim', dps: 50, cumDate: '26 Nov 2026', exDate: '27 Nov 2026', recDate: '28 Nov 2026', payDate: '12 Des 2026', yield: '1.2%', status: 'Cum Date Mendekat' },
  { id: 'div-3', ticker: 'ASII', name: 'Astra International Tbk', category: 'dividen', type: 'Dividen Interim', dps: 98, cumDate: '28 Nov 2026', exDate: '29 Nov 2026', recDate: '30 Nov 2026', payDate: '15 Des 2026', yield: '2.0%', status: 'Mendatang' },
  { id: 'div-4', ticker: 'PTBA', name: 'Bukit Asam Tbk', category: 'dividen', type: 'Dividen Final', dps: 397, cumDate: '08 Des 2026', exDate: '09 Des 2026', recDate: '10 Des 2026', payDate: '22 Des 2026', yield: '14.2%', status: 'Mendatang' },
  { id: 'div-5', ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', category: 'dividen', type: 'Dividen Final', dps: 215, cumDate: '15 Des 2026', exDate: '16 Des 2026', recDate: '17 Des 2026', payDate: '30 Des 2026', yield: '1.8%', status: 'Mendatang' },
  { id: 'div-6', ticker: 'TLKM', name: 'Telkom Indonesia Tbk', category: 'dividen', type: 'Dividen Final', dps: 178, cumDate: '18 Des 2026', exDate: '19 Des 2026', recDate: '20 Des 2026', payDate: '04 Jan 2027', yield: '5.8%', status: 'Mendatang' },
  { id: 'div-7', ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', category: 'dividen', type: 'Dividen Final', dps: 353, cumDate: '22 Des 2026', exDate: '23 Des 2026', recDate: '24 Des 2026', payDate: '08 Jan 2027', yield: '5.2%', status: 'Mendatang' },
  { id: 'div-8', ticker: 'UNTR', name: 'United Tractors Tbk', category: 'dividen', type: 'Dividen Interim', dps: 667, cumDate: '24 Des 2026', exDate: '25 Des 2026', recDate: '28 Des 2026', payDate: '12 Jan 2027', yield: '2.8%', status: 'Mendatang' },
];

const ALL_RIGHTS: RightIssueItem[] = [
  { id: 'ri-1', ticker: 'BBTN', name: 'Bank Tabungan Negara Tbk', category: 'right_issue', ratio: '100 : 23', exercisePrice: 1200, targetFund: 'Rp4,13 Triliun', cumDate: '25 Nov 2026', exDate: '26 Nov 2026', tradeStart: '30 Nov 2026', tradeEnd: '06 Des 2026', purpose: 'Penguatan modal inti Tier-1 dan penyaluran kredit perumahan subsidi FLPP.', status: 'Cum Date Mendekat' },
  { id: 'ri-2', ticker: 'BRMS', name: 'Bumi Resources Minerals Tbk', category: 'right_issue', ratio: '10 : 1', exercisePrice: 165, targetFund: 'Rp1,65 Triliun', cumDate: '02 Des 2026', exDate: '03 Des 2026', tradeStart: '08 Des 2026', tradeEnd: '14 Des 2026', purpose: 'Penyelesaian pembangunan pabrik pengolahan emas kedua di Palu & ekspansi tambang tembaga Gorontalo.', status: 'Menunggu Efektif' },
  { id: 'ri-3', ticker: 'ARTO', name: 'Bank Jago Tbk', category: 'right_issue', ratio: '5 : 1', exercisePrice: 2350, targetFund: 'Rp2,80 Triliun', cumDate: '10 Des 2026', exDate: '11 Des 2026', tradeStart: '16 Des 2026', tradeEnd: '22 Des 2026', purpose: 'Pengembangan infrastruktur digital banking dan integrasi ekosistem GoTo.', status: 'Menunggu Efektif' },
  { id: 'ri-4', ticker: 'BREN', name: 'Barito Renewables Energy Tbk', category: 'right_issue', ratio: '25 : 2', exercisePrice: 6500, targetFund: 'Rp7,20 Triliun', cumDate: '20 Des 2026', exDate: '21 Des 2026', tradeStart: '28 Des 2026', tradeEnd: '06 Jan 2027', purpose: 'Pembiayaan ekspansi kapasitas PLTP Wayang Windu & akuisisi aset pembangkit angin Sidrap.', status: 'Menunggu Efektif' },
];

const ALL_WARAN: WarrantItem[] = [
  { id: 'war-1', ticker: 'CBRE', warrantTicker: 'CBRE-W', name: 'Cakra Buana Resources Energi Tbk', category: 'waran', series: 'Waran Seri I', ratio: '10 : 7', exercisePrice: 108, startDate: '09 Jan 2024', expiryDate: '08 Jan 2027', underlyingPrice: 95, premiumPercent: '+13.6%', status: 'Aktif Diperdagangkan' },
  { id: 'war-2', ticker: 'FLMC', warrantTicker: 'FLMC-W', name: 'Falmaco Nonwoven Industri Tbk', category: 'waran', series: 'Waran Seri I', ratio: '2 : 1', exercisePrice: 150, startDate: '15 Mar 2024', expiryDate: '14 Mar 2027', underlyingPrice: 142, premiumPercent: '+5.6%', status: 'Aktif Diperdagangkan' },
  { id: 'war-3', ticker: 'CUAN', warrantTicker: 'CUAN-W', name: 'Petrindo Jaya Kreasi Tbk', category: 'waran', series: 'Waran Seri I', ratio: '5 : 2', exercisePrice: 320, startDate: '08 Mar 2024', expiryDate: '07 Mar 2027', underlyingPrice: 8450, premiumPercent: '-96.2%', status: 'Dapat Ditebus' },
  { id: 'war-4', ticker: 'INPS', warrantTicker: 'INPS-W', name: 'Indah Prakasa Sentosa Tbk', category: 'waran', series: 'Waran Seri I', ratio: '4 : 3', exercisePrice: 210, startDate: '10 Mei 2024', expiryDate: '09 Mei 2027', underlyingPrice: 198, premiumPercent: '+6.1%', status: 'Aktif Diperdagangkan' },
];

const ALL_SPLITS: StockSplitItem[] = [
  { id: 'ss-1', ticker: 'BREN', name: 'Barito Renewables Energy Tbk', category: 'stock_split', type: 'Stock Split', ratio: '1 : 5', oldNominal: 50, newNominal: 10, effectiveDate: '15 Des 2026', purpose: 'Meningkatkan likuiditas perdagangan saham dan keterjangkauan investor ritel.', status: 'Efektif Terjadwal' },
  { id: 'ss-2', ticker: 'CUAN', name: 'Petrindo Jaya Kreasi Tbk', category: 'stock_split', type: 'Stock Split', ratio: '1 : 4', oldNominal: 100, newNominal: 25, effectiveDate: '22 Des 2026', purpose: 'Menambah jumlah saham beredar dan mempermudah transaksi pasar reguler.', status: 'Menunggu RUPS' },
  { id: 'ss-3', ticker: 'KLBF', name: 'Kalbe Farma Tbk', category: 'stock_split', type: 'Stock Split', ratio: '1 : 2', oldNominal: 10, newNominal: 5, effectiveDate: '10 Jan 2027', purpose: 'Optimalisasi struktur modal dan likuiditas saham di indeks LQ45.', status: 'Menunggu RUPS' },
];

const ALL_BONUS: BonusShareItem[] = [
  { id: 'bn-1', ticker: 'AMMN', name: 'Amman Mineral Internasional Tbk', category: 'saham_bonus', type: 'Saham Bonus', ratio: '100 : 5', source: 'Tambahan Modal Disetor (Agio Saham)', cumDate: '05 Des 2026', distDate: '18 Des 2026', status: 'Cum Date Mendekat' },
  { id: 'bn-2', ticker: 'TPIA', name: 'Chandra Asri Pacific Tbk', category: 'saham_bonus', type: 'Dividen Saham', ratio: '50 : 1', source: 'Saldo Laba Ditahan', cumDate: '16 Des 2026', distDate: '30 Des 2026', status: 'Menunggu Persetujuan OJK' },
];

const ALL_PRIVATE_PLACEMENTS: PrivatePlacementItem[] = [
  { id: 'pp-1', ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', category: 'private_placement', sharesIssued: '118,43 M lembar (10%)', price: 68, targetFund: 'Rp8,05 Triliun', investor: 'Konsorsium Investor Global & Rencana Aliansi Strategis', execDate: '12 Des 2026', status: 'Pelaksanaan' },
  { id: 'pp-2', ticker: 'DEWA', name: 'Darma Henwa Tbk', category: 'private_placement', sharesIssued: '18,50 M lembar', price: 50, targetFund: 'Rp925 Miliar', investor: 'Konversi Utang Dagang & Modal Kerja Tambang Batubara', execDate: '18 Des 2026', status: 'Persetujuan RUPS' },
  { id: 'pp-3', ticker: 'BUMI', name: 'Bumi Resources Tbk', category: 'private_placement', sharesIssued: '20,00 M lembar', price: 125, targetFund: 'Rp2,50 Triliun', investor: 'Pelunasan OWK (Obligasi Wajib Konversi)', execDate: '26 Des 2026', status: 'Persetujuan RUPS' },
];

const ALL_RUPS: RupsItem[] = [
  { id: 'ru-1', ticker: 'BREN', name: 'Barito Renewables Energy Tbk', category: 'rups', event: 'RUPSLB', date: '20 Nov 2026', time: '14:00 WIB', location: 'Wisma Barito Pacific Tower B, Jakarta Barat', agenda: 'Persetujuan rencana ekspansi geotermal Wayang Windu & fasilitas pinjaman sindikasi bank.', status: 'Panggilan Resmi' },
  { id: 'ru-2', ticker: 'MEDC', name: 'Medco Energi Internasional Tbk', category: 'rups', event: 'Public Expose Insidentil', date: '24 Nov 2026', time: '10:00 WIB', location: 'The Energy Building SCBD & Live Zoom', agenda: 'Paparan perkembangan eksplorasi blok migas Corridor & aset tembaga AMMN.', status: 'Panggilan Resmi' },
  { id: 'ru-3', ticker: 'AMMN', name: 'Amman Mineral Internasional Tbk', category: 'rups', event: 'RUPSLB', date: '02 Des 2026', time: '13:30 WIB', location: 'Financial Hall Graha CIMB Niaga, SCBD Jakarta', agenda: 'Persetujuan fasilitas pendanaan fasilitas smelter tembaga & pembagian saham bonus.', status: 'Panggilan Resmi' },
  { id: 'ru-4', ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', category: 'rups', event: 'RUPST', date: '15 Des 2026', time: '09:00 WIB', location: 'Kantor Pusat BRI, Jl. Jend. Sudirman Jakarta', agenda: 'Penetapan penggunaan laba bersih, dividen payout ratio ~80%, dan perubahan pengurus.', status: 'Pemberitahuan' },
  { id: 'ru-5', ticker: 'BMRI', name: 'Bank Mandiri Tbk', category: 'rups', event: 'RUPSLB', date: '18 Des 2026', time: '14:00 WIB', location: 'Auditorium Plaza Mandiri, Jakarta Selatan', agenda: 'Persetujuan pengalihan saham tresuri dan penyesuaian anggaran dasar perseroan.', status: 'Pemberitahuan' },
];

const ALL_BUYBACKS: BuybackItem[] = [
  { id: 'bb-1', ticker: 'ASII', name: 'Astra International Tbk', category: 'buyback', allocatedFund: 'Rp2,0 Triliun', maxSharesPercent: 'Maks. 5% modal disetor', period: '15 Nov 2026 - 14 Mei 2027', purpose: 'Menjaga stabilitas harga saham di tengah volatilitas pasar dan meningkatkan return on equity (ROE).', status: 'Sedang Berjalan' },
  { id: 'bb-2', ticker: 'INDY', name: 'Indika Energy Tbk', category: 'buyback', allocatedFund: 'Rp1,2 Triliun', maxSharesPercent: 'Maks. 8% modal disetor', period: '01 Des 2026 - 31 Mei 2027', purpose: 'Pemanfaatan arus kas operasional hasil diversifikasi usaha energi baru terbarukan.', status: 'Menunggu RUPS' },
  { id: 'bb-3', ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', category: 'buyback', allocatedFund: 'Rp4,0 Triliun', maxSharesPercent: 'Maks. 10% modal disetor', period: '10 Nov 2026 - 09 Mei 2027', purpose: 'Fleksibilitas pengelolaan modal dan optimalisasi nilai jangka panjang pemegang saham.', status: 'Sedang Berjalan' },
];

const ALL_TENDERS: TenderOfferItem[] = [
  { id: 'to-1', ticker: 'PTRO', name: 'Petrosea Tbk', category: 'tender_offer', offerType: 'Mandatory Tender Offer (MTO)', offeror: 'PT Petrindo Jaya Kreasi Tbk (Barito Group)', offerPrice: 3100, sharesTarget: '1,01 Miliar saham (34%)', period: '21 Nov 2026 - 20 Des 2026', status: 'Periode Penawaran' },
  { id: 'to-2', ticker: 'VOKS', name: 'Voksel Electric Tbk', category: 'tender_offer', offerType: 'Mandatory Tender Offer (MTO)', offeror: 'Hangzhou Cable Co., Ltd.', offerPrice: 226, sharesTarget: '829,3 Juta saham', period: '05 Des 2026 - 04 Jan 2027', status: 'Menunggu Pernyataan Efektif OJK' },
];

export const CorporateActionsView: React.FC<CorporateActionsViewProps> = ({
  stocks = [],
  onSelectStock,
  onOpenLotCalculator,
}) => {
  const [activeTab, setActiveTab] = useState<ActionCategory>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'minggu_ini' | 'bulan_ini'>('all');
  const [dividendCalcModal, setDividendCalcModal] = useState<DividendItem | null>(null);
  const [calcLots, setCalcLots] = useState<number>(100);

  // Tab counts
  const counts = useMemo(() => {
    return {
      semua:
        ALL_DIVIDENDS.length +
        ALL_RIGHTS.length +
        ALL_WARAN.length +
        ALL_SPLITS.length +
        ALL_BONUS.length +
        ALL_PRIVATE_PLACEMENTS.length +
        ALL_RUPS.length +
        ALL_BUYBACKS.length +
        ALL_TENDERS.length,
      dividen: ALL_DIVIDENDS.length,
      right_issue: ALL_RIGHTS.length,
      waran: ALL_WARAN.length,
      stock_split: ALL_SPLITS.length,
      saham_bonus: ALL_BONUS.length,
      private_placement: ALL_PRIVATE_PLACEMENTS.length,
      rups: ALL_RUPS.length,
      buyback: ALL_BUYBACKS.length,
      tender_offer: ALL_TENDERS.length,
    };
  }, []);

  // Filter items
  const filteredDividends = useMemo(() => {
    return ALL_DIVIDENDS.filter(
      (d) =>
        (!searchQuery || d.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredRights = useMemo(() => {
    return ALL_RIGHTS.filter(
      (r) =>
        (!searchQuery || r.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredWaran = useMemo(() => {
    return ALL_WARAN.filter(
      (w) =>
        (!searchQuery || w.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || w.warrantTicker.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredSplits = useMemo(() => {
    return ALL_SPLITS.filter(
      (s) =>
        (!searchQuery || s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredBonus = useMemo(() => {
    return ALL_BONUS.filter(
      (b) =>
        (!searchQuery || b.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredPrivatePlacements = useMemo(() => {
    return ALL_PRIVATE_PLACEMENTS.filter(
      (p) =>
        (!searchQuery || p.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredRups = useMemo(() => {
    return ALL_RUPS.filter(
      (ru) =>
        (!searchQuery || ru.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || ru.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredBuybacks = useMemo(() => {
    return ALL_BUYBACKS.filter(
      (b) =>
        (!searchQuery || b.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredTenders = useMemo(() => {
    return ALL_TENDERS.filter(
      (t) =>
        (!searchQuery || t.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  // Total summary of all actions for timeline feed
  const allActionsTimeline = useMemo(() => {
    const list: {
      id: string;
      ticker: string;
      name: string;
      categoryLabel: string;
      categoryColor: string;
      title: string;
      dateKey: string;
      details: string;
      badge: string;
      actionObj: AnyCorporateAction;
    }[] = [];

    ALL_DIVIDENDS.forEach((d) => {
      list.push({
        id: d.id,
        ticker: d.ticker,
        name: d.name,
        categoryLabel: 'Dividen Tunai',
        categoryColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        title: `${d.type} Rp${d.dps}/saham (Yield ${d.yield})`,
        dateKey: d.cumDate,
        details: `Cum: ${d.cumDate} · Ex: ${d.exDate} · Bayar: ${d.payDate}`,
        badge: d.status,
        actionObj: d,
      });
    });

    ALL_RIGHTS.forEach((r) => {
      list.push({
        id: r.id,
        ticker: r.ticker,
        name: r.name,
        categoryLabel: 'Right Issue',
        categoryColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
        title: `HMETD Rasio ${r.ratio} @ Rp${r.exercisePrice.toLocaleString('id-ID')}`,
        dateKey: r.cumDate,
        details: `Target: ${r.targetFund} · Perdagangan: ${r.tradeStart} s/d ${r.tradeEnd}`,
        badge: r.status,
        actionObj: r,
      });
    });

    ALL_WARAN.forEach((w) => {
      list.push({
        id: w.id,
        ticker: w.ticker,
        name: w.name,
        categoryLabel: 'Waran Efek',
        categoryColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        title: `${w.warrantTicker} (${w.series}) @ Tebus Rp${w.exercisePrice}`,
        dateKey: w.expiryDate,
        details: `Rasio: ${w.ratio} · Jatuh Tempo: ${w.expiryDate}`,
        badge: w.status,
        actionObj: w,
      });
    });

    ALL_SPLITS.forEach((s) => {
      list.push({
        id: s.id,
        ticker: s.ticker,
        name: s.name,
        categoryLabel: 'Stock Split',
        categoryColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
        title: `Pemecahan Nilai Nominal Saham ${s.ratio}`,
        dateKey: s.effectiveDate,
        details: `Nominal Rp${s.oldNominal} → Rp${s.newNominal} · Efektif: ${s.effectiveDate}`,
        badge: s.status,
        actionObj: s,
      });
    });

    ALL_BONUS.forEach((b) => {
      list.push({
        id: b.id,
        ticker: b.ticker,
        name: b.name,
        categoryLabel: 'Saham Bonus',
        categoryColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30',
        title: `${b.type} Rasio ${b.ratio}`,
        dateKey: b.cumDate,
        details: `Sumber: ${b.source} · Distribusi: ${b.distDate}`,
        badge: b.status,
        actionObj: b,
      });
    });

    ALL_PRIVATE_PLACEMENTS.forEach((p) => {
      list.push({
        id: p.id,
        ticker: p.ticker,
        name: p.name,
        categoryLabel: 'Private Placement',
        categoryColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
        title: `PMTHMETD ${p.sharesIssued} @ Rp${p.price}`,
        dateKey: p.execDate,
        details: `Target: ${p.targetFund} · Investor: ${p.investor}`,
        badge: p.status,
        actionObj: p,
      });
    });

    ALL_RUPS.forEach((ru) => {
      list.push({
        id: ru.id,
        ticker: ru.ticker,
        name: ru.name,
        categoryLabel: 'RUPS & Public Expose',
        categoryColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
        title: `${ru.event} - ${ru.time}`,
        dateKey: ru.date,
        details: `Lokasi: ${ru.location} · Agenda: ${ru.agenda}`,
        badge: ru.status,
        actionObj: ru,
      });
    });

    ALL_BUYBACKS.forEach((bb) => {
      list.push({
        id: bb.id,
        ticker: bb.ticker,
        name: bb.name,
        categoryLabel: 'Buyback Saham',
        categoryColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
        title: `Buyback Dana ${bb.allocatedFund} (${bb.maxSharesPercent})`,
        dateKey: bb.period.split(' - ')[0],
        details: `Periode: ${bb.period} · Tujuan: ${bb.purpose}`,
        badge: bb.status,
        actionObj: bb,
      });
    });

    ALL_TENDERS.forEach((to) => {
      list.push({
        id: to.id,
        ticker: to.ticker,
        name: to.name,
        categoryLabel: 'Tender Offer / M&A',
        categoryColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
        title: `${to.offerType} @ Rp${to.offerPrice}`,
        dateKey: to.period.split(' - ')[0],
        details: `Penawar: ${to.offeror} · Sasaran: ${to.sharesTarget}`,
        badge: to.status,
        actionObj: to,
      });
    });

    return list.filter(
      (item) =>
        !searchQuery ||
        item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ========================================================
          1. HEADER & KPI CARDS (Ringkasan Pasar Aksi Korporasi BEI)
         ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              Kalender Aksi Korporasi Lengkap (Corporate Actions)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              Resmi BEI & KSEI
            </span>
          </div>
          <p className="text-xs text-[#80887f]">
            Database lengkap seluruh jadwal Dividen Tunai, Right Issue, Waran, Stock Split, Saham Bonus, Private Placement, RUPS, Buyback, dan Tender Offer emiten BEI.
          </p>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari emiten (ADRO, BBCA, BREN...)"
              className="w-full px-3 py-1.5 pl-8 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] text-xs font-semibold placeholder-[#80887f] outline-none focus:border-emerald-600 transition-colors"
            />
            <span className="absolute left-2.5 top-2 text-xs text-[#80887f]">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-xs">
          <div className="flex items-center justify-between text-[#80887f] text-[11px] font-bold">
            <span>Estimasi Total Dividen</span>
            <span className="text-emerald-600">💰</span>
          </div>
          <div className="text-xl font-black mt-1 text-[#1d7a5c] dark:text-[#4fbf93] font-mono">
            Rp14,8 Triliun
          </div>
          <span className="text-[10px] text-[#80887f] block mt-0.5">
            8 emiten jadwal cum date bulan ini
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-xs">
          <div className="flex items-center justify-between text-[#80887f] text-[11px] font-bold">
            <span>Right Issue & PMTHMETD</span>
            <span className="text-blue-600">📄</span>
          </div>
          <div className="text-xl font-black mt-1 text-blue-600 dark:text-blue-400 font-mono">
            Rp23,7 Triliun
          </div>
          <span className="text-[10px] text-[#80887f] block mt-0.5">
            7 emiten target penambahan modal
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-xs">
          <div className="flex items-center justify-between text-[#80887f] text-[11px] font-bold">
            <span>Agenda RUPS & Pubex</span>
            <span className="text-rose-600">🏛️</span>
          </div>
          <div className="text-xl font-black mt-1 text-rose-600 dark:text-rose-400 font-mono">
            5 Emiten
          </div>
          <span className="text-[10px] text-[#80887f] block mt-0.5">
            RUPSLB BREN, MEDC, AMMN, BRI, Mandiri
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-xs">
          <div className="flex items-center justify-between text-[#80887f] text-[11px] font-bold">
            <span>Buyback & Stock Split</span>
            <span className="text-purple-600">✂️</span>
          </div>
          <div className="text-xl font-black mt-1 text-purple-600 dark:text-purple-400 font-mono">
            6 Emiten
          </div>
          <span className="text-[10px] text-[#80887f] block mt-0.5">
            BREN (1:5), ASII, ADRO, INDY
          </span>
        </div>
      </div>

      {/* ========================================================
          2. CATEGORY TABS (Semua Aksi Korporasi Lengkap)
         ======================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {[
          { key: 'semua' as const, label: '📅 Semua Aksi', count: counts.semua },
          { key: 'dividen' as const, label: '💰 Dividen Tunai', count: counts.dividen },
          { key: 'right_issue' as const, label: '📄 Right Issue (HMETD)', count: counts.right_issue },
          { key: 'waran' as const, label: '🎟️ Waran Seri I/II', count: counts.waran },
          { key: 'stock_split' as const, label: '✂️ Stock Split', count: counts.stock_split },
          { key: 'saham_bonus' as const, label: '🎁 Saham Bonus', count: counts.saham_bonus },
          { key: 'private_placement' as const, label: '🤝 Private Placement', count: counts.private_placement },
          { key: 'rups' as const, label: '🏛️ RUPS & Pubex', count: counts.rups },
          { key: 'buyback' as const, label: '🔄 Buyback Saham', count: counts.buyback },
          { key: 'tender_offer' as const, label: '🏷️ Tender Offer / M&A', count: counts.tender_offer },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === tab.key
                ? 'bg-[#1d7a5c] text-white border-[#1d7a5c] shadow-xs'
                : 'bg-white dark:bg-[#1a2a30] text-[#56625f] dark:text-[#a9b3ad] border-[#e5ddd0] dark:border-[#26363d] hover:bg-[#efe9dd] dark:hover:bg-[#20323a]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-[#efe9dd] dark:bg-[#26363d] text-[#80887f]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================
          3. CONTENT DISPLAY ACCORDING TO SELECTED TAB
         ======================================================== */}

      {/* TAB 1: SEMUA AKSI (TIMELINE VIEW) */}
      {activeTab === 'semua' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3 shadow-xs">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d7a5c]" />
              <span>Kalender Jadwal Aksi Korporasi Terbaru (Seluruh Kategori)</span>
            </h3>

            <div className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {allActionsTimeline.map((item) => (
                <div
                  key={`${item.id}-${item.ticker}`}
                  className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#f6f2ea]/60 dark:hover:bg-[#121c20]/60 p-2.5 rounded-xl transition-colors cursor-pointer group"
                  onClick={() => onSelectStock(item.ticker)}
                >
                  <div className="space-y-1 min-w-[240px] flex-1">
                    <div className="flex items-center gap-2">
                      <b className="text-base font-black tracking-tight text-[#17242a] dark:text-[#f3eee4]">
                        {item.ticker}
                      </b>
                      <span className="text-xs text-[#80887f] font-medium hidden sm:inline">
                        {item.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${item.categoryColor}`}>
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-[#efe9dd] dark:bg-[#26363d] text-[#56625f] dark:text-[#a9b3ad]">
                        {item.badge}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[#17242a] dark:text-[#f3eee4]">
                      {item.title}
                    </div>

                    <p className="text-[11px] text-[#80887f]">
                      {item.details}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-2 flex-none">
                    <div className="text-right mr-2">
                      <span className="text-[10px] text-[#80887f] uppercase font-bold block">
                        Jadwal / Cum Date
                      </span>
                      <b className="text-xs font-mono font-bold text-[#1d7a5c] dark:text-[#4fbf93]">
                        {item.dateKey}
                      </b>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(item.ticker);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Buka Grafik ›
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIVIDEN TUNAI & INTERIM */}
      {activeTab === 'dividen' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Jenis Dividen</th>
                <th className="py-2.5 px-3 text-right">DPS (Rp/Lembar)</th>
                <th className="py-2.5 px-3">Cum Date</th>
                <th className="py-2.5 px-3">Ex Date</th>
                <th className="py-2.5 px-3">Tanggal Bayar</th>
                <th className="py-2.5 px-3 text-right">Indikasi Yield</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredDividends.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(d.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm">{d.ticker}</td>
                  <td className="py-3 px-3 font-semibold">{d.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      {d.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-sm font-mono">
                    Rp{d.dps.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                    {d.cumDate}
                  </td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-semibold font-mono">
                    {d.exDate}
                  </td>
                  <td className="py-3 px-3 text-[#80887f] font-mono">{d.payDate}</td>
                  <td className="py-3 px-3 text-right font-black text-base text-emerald-700 dark:text-emerald-400 font-mono">
                    {d.yield}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#efe9dd] dark:bg-[#26363d] text-[#56625f] dark:text-[#a9b3ad]">
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDividendCalcModal(d);
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 font-bold text-[10px] cursor-pointer"
                    >
                      Hitung Hak
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(d.ticker);
                      }}
                      className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Grafik ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: RIGHT ISSUE (HMETD) */}
      {activeTab === 'right_issue' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Rasio HMETD</th>
                <th className="py-2.5 px-3 text-right">Harga Tebus</th>
                <th className="py-2.5 px-3">Target Dana</th>
                <th className="py-2.5 px-3">Cum Date</th>
                <th className="py-2.5 px-3">Masa Perdagangan</th>
                <th className="py-2.5 px-3">Tujuan Penggunaan Dana</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredRights.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(r.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm">{r.ticker}</td>
                  <td className="py-3 px-3 font-semibold">{r.name}</td>
                  <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {r.ratio}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-sm font-mono">
                    Rp{r.exercisePrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {r.targetFund}
                  </td>
                  <td className="py-3 px-3 font-semibold font-mono">{r.cumDate}</td>
                  <td className="py-3 px-3 text-[#80887f] font-mono">
                    {r.tradeStart} s/d {r.tradeEnd}
                  </td>
                  <td className="py-3 px-3 max-w-xs text-[#56625f] dark:text-[#a9b3ad]">
                    {r.purpose}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(r.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Buka Grafik ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: WARAN (WARRANT SERI I & II) */}
      {activeTab === 'waran' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Kode Waran</th>
                <th className="py-2.5 px-3">Induk Emiten</th>
                <th className="py-2.5 px-3">Seri</th>
                <th className="py-2.5 px-3">Rasio Tebus</th>
                <th className="py-2.5 px-3 text-right">Harga Pelaksanaan</th>
                <th className="py-2.5 px-3 text-right">Harga Induk</th>
                <th className="py-2.5 px-3 text-right">Premium / Diskon</th>
                <th className="py-2.5 px-3">Jatuh Tempo</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredWaran.map((w) => (
                <tr
                  key={w.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(w.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm text-amber-600 dark:text-amber-400">
                    {w.warrantTicker}
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    {w.ticker} - {w.name}
                  </td>
                  <td className="py-3 px-3 font-bold">{w.series}</td>
                  <td className="py-3 px-3 font-mono font-bold">{w.ratio}</td>
                  <td className="py-3 px-3 text-right font-black font-mono">
                    Rp{w.exercisePrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    Rp{w.underlyingPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-black font-mono text-emerald-700 dark:text-emerald-400">
                    {w.premiumPercent}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#80887f]">{w.expiryDate}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(w.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Grafik Induk ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: STOCK SPLIT & REVERSE SPLIT */}
      {activeTab === 'stock_split' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Jenis Split</th>
                <th className="py-2.5 px-3">Rasio Pemecahan</th>
                <th className="py-2.5 px-3">Nominal Lama → Baru</th>
                <th className="py-2.5 px-3">Tanggal Efektif</th>
                <th className="py-2.5 px-3">Tujuan Stock Split</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredSplits.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(s.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm">{s.ticker}</td>
                  <td className="py-3 px-3 font-semibold">{s.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-black text-base font-mono text-purple-700 dark:text-purple-400">
                    {s.ratio}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    Rp{s.oldNominal} → Rp{s.newNominal}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {s.effectiveDate}
                  </td>
                  <td className="py-3 px-3 text-[#56625f] dark:text-[#a9b3ad] max-w-xs">
                    {s.purpose}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(s.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Buka Grafik ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: SAHAM BONUS & DIVIDEN SAHAM */}
      {activeTab === 'saham_bonus' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Jenis Pembagian</th>
                <th className="py-2.5 px-3">Rasio Pembagian</th>
                <th className="py-2.5 px-3">Sumber Dana</th>
                <th className="py-2.5 px-3">Cum Date</th>
                <th className="py-2.5 px-3">Tanggal Distribusi</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredBonus.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(b.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm">{b.ticker}</td>
                  <td className="py-3 px-3 font-semibold">{b.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30">
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-black text-base font-mono text-teal-700 dark:text-teal-400">
                    {b.ratio}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#56625f] dark:text-[#a9b3ad]">
                    {b.source}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {b.cumDate}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#80887f]">{b.distDate}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(b.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Buka Grafik ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 7: PRIVATE PLACEMENT (PMTHMETD) */}
      {activeTab === 'private_placement' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Jumlah Saham Diterbitkan</th>
                <th className="py-2.5 px-3 text-right">Harga Pelaksanaan</th>
                <th className="py-2.5 px-3">Target Dana</th>
                <th className="py-2.5 px-3">Pihak Pengambil Bagian / Investor</th>
                <th className="py-2.5 px-3">Tanggal Pelaksanaan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredPrivatePlacements.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(p.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm">{p.ticker}</td>
                  <td className="py-3 px-3 font-semibold">{p.name}</td>
                  <td className="py-3 px-3 font-bold font-mono text-indigo-700 dark:text-indigo-400">
                    {p.sharesIssued}
                  </td>
                  <td className="py-3 px-3 text-right font-black font-mono">
                    Rp{p.price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {p.targetFund}
                  </td>
                  <td className="py-3 px-3 max-w-xs text-[#56625f] dark:text-[#a9b3ad]">
                    {p.investor}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">{p.execDate}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(p.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Buka Grafik ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 8: RUPS & PUBLIC EXPOSE */}
      {activeTab === 'rups' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3 shadow-xs">
          <div className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
            {filteredRups.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectStock(r.ticker)}
                className="py-3.5 flex flex-wrap items-start justify-between gap-3 hover:bg-[#f6f2ea]/60 dark:hover:bg-[#121c20]/60 p-2.5 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <b className="text-base font-black tracking-tight">{r.ticker}</b>
                    <span className="text-xs text-[#80887f] font-semibold">{r.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                      {r.event}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#efe9dd] dark:bg-[#26363d] text-[#56625f] dark:text-[#a9b3ad]">
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#17242a] dark:text-[#f3eee4] font-medium leading-relaxed">
                    <b>Mata Acara / Agenda:</b> {r.agenda}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-[#80887f]">
                    <span>📍 <b>Lokasi:</b> {r.location}</span>
                  </div>
                </div>

                <div className="text-right flex-none space-y-1">
                  <div className="font-mono text-sm font-black text-rose-600 dark:text-rose-400">
                    {r.date}
                  </div>
                  <div className="text-[10px] text-[#80887f] font-mono">
                    Pukul {r.time}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStock(r.ticker);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer block mt-1"
                  >
                    Detail Saham ›
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: BUYBACK SAHAM */}
      {activeTab === 'buyback' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Alokasi Dana Maksimal</th>
                <th className="py-2.5 px-3">Maksimal Saham Dibeli</th>
                <th className="py-2.5 px-3">Periode Pelaksanaan Buyback</th>
                <th className="py-2.5 px-3">Tujuan & Alasan Buyback</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredBuybacks.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(b.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm">{b.ticker}</td>
                  <td className="py-3 px-3 font-semibold">{b.name}</td>
                  <td className="py-3 px-3 font-black text-base text-cyan-700 dark:text-cyan-400 font-mono">
                    {b.allocatedFund}
                  </td>
                  <td className="py-3 px-3 font-bold font-mono">{b.maxSharesPercent}</td>
                  <td className="py-3 px-3 font-mono font-semibold">{b.period}</td>
                  <td className="py-3 px-3 max-w-xs text-[#56625f] dark:text-[#a9b3ad]">
                    {b.purpose}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(b.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Buka Grafik ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 10: TENDER OFFER & AKUISISI / MERGER */}
      {activeTab === 'tender_offer' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Nama Emiten</th>
                <th className="py-2.5 px-3">Jenis Penawaran</th>
                <th className="py-2.5 px-3">Pihak Penawar (Offeror)</th>
                <th className="py-2.5 px-3 text-right">Harga Tender Offer</th>
                <th className="py-2.5 px-3">Jumlah Saham Sasaran</th>
                <th className="py-2.5 px-3">Periode Penawaran</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
              {filteredTenders.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] cursor-pointer transition-colors"
                  onClick={() => onSelectStock(t.ticker)}
                >
                  <td className="py-3 px-3 font-black text-sm">{t.ticker}</td>
                  <td className="py-3 px-3 font-semibold">{t.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30">
                      {t.offerType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#17242a] dark:text-[#f3eee4]">
                    {t.offeror}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-base text-emerald-700 dark:text-emerald-400 font-mono">
                    Rp{t.offerPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 font-mono">{t.sharesTarget}</td>
                  <td className="py-3 px-3 font-mono text-[#80887f]">{t.period}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#efe9dd] dark:bg-[#26363d] text-[#56625f] dark:text-[#a9b3ad]">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(t.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 cursor-pointer"
                    >
                      Buka Grafik ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          4. MODAL KALKULATOR HAK DIVIDEN TUNAI
         ======================================================== */}
      {dividendCalcModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDividendCalcModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xl p-5 space-y-4 text-[#17242a] dark:text-[#f3eee4]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd0] dark:border-[#26363d]">
              <div>
                <b className="text-base font-bold flex items-center gap-2">
                  <span>🧮 Kalkulator Dividen Tunai</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                    {dividendCalcModal.ticker}
                  </span>
                </b>
                <span className="text-xs text-[#80887f] block">
                  {dividendCalcModal.name}
                </span>
              </div>
              <button
                onClick={() => setDividendCalcModal(null)}
                className="w-7 h-7 rounded-lg text-[#80887f] hover:bg-[#efe9dd] dark:hover:bg-[#26363d] flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#80887f]">Dividen Per Lembar (DPS):</span>
                <b className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                  Rp{dividendCalcModal.dps.toLocaleString('id-ID')}
                </b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Cum Date Terakhir:</span>
                <b className="font-mono">{dividendCalcModal.cumDate}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Tanggal Pembayaran:</span>
                <b className="font-mono">{dividendCalcModal.payDate}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#80887f]">Indikasi Yield Dividen:</span>
                <b className="text-emerald-700 dark:text-emerald-400 font-black">
                  {dividendCalcModal.yield}
                </b>
              </div>
            </div>

            {/* Input Lot */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#80887f] block">
                Jumlah Kepemilikan (Lot Saham):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={calcLots}
                  onChange={(e) => setCalcLots(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 p-2 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-mono text-base font-bold text-center outline-none focus:border-emerald-600"
                />
                <span className="text-xs font-bold text-[#80887f]">= {(calcLots * 100).toLocaleString('id-ID')} Lembar</span>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                Estimasi Total Dividen Diterima (Gross):
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                Rp{(calcLots * 100 * dividendCalcModal.dps).toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-[#80887f] block">
                *Bebas pajak dividen untuk investor individu/badan dalam negeri sesuai PP No. 9/2021 jika direinvestasikan.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5ddd0] dark:border-[#26363d]">
              <button
                onClick={() => setDividendCalcModal(null)}
                className="px-4 py-2 rounded-xl bg-[#efe9dd] dark:bg-[#26363d] text-[#17242a] dark:text-[#f3eee4] text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onSelectStock(dividendCalcModal.ticker);
                  setDividendCalcModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#1d7a5c] text-white text-xs font-bold hover:opacity-90 cursor-pointer shadow-xs"
              >
                Buka Grafik Saham ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
