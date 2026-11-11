export interface Candlestick {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Shareholder {
  name: string;
  percentage: number;
}

export interface InsiderTx {
  date: string;
  person: string;
  role: string;
  type: 'Beli' | 'Jual';
  shares: string;
  price: number;
}

export interface StockData {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  group: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  frequency: number;
  frequencyAvg20: number;
  frequencySpike: number;
  foreignBuy: number;
  foreignSell: number;
  netForeign: number;
  momentumScore: number;
  momentumRank: 'Pemimpin' | 'Kuat' | 'Sedang' | 'Lemah';
  vcpStatus: 'Ketat' | 'Sedang' | 'Longgar' | 'Tidak Ada';
  vcpContraction: string;
  pivotBreakout: number;
  invalidation: number;
  target1: number;
  target2: number;
  ma5: number;
  ma20: number;
  ma50: number;
  ma200: number;
  support: number;
  resistance: number;
  trend: 'Uptrend Kuat' | 'Uptrend' | 'Sideway' | 'Downtrend';
  candles: Candlestick[];
  shareholders: Shareholder[];
  insiderTransactions: InsiderTx[];
}

export interface SignalData {
  id: string;
  ticker: string;
  name: string;
  type: 'pullback' | 'haka' | 'momentum';
  session: 'Sesi 1' | 'Penutupan';
  signalDate: string;
  status: 'active' | 'hit_target' | 'invalidated' | 'archived';
  entryPrice: number;
  breakoutLevel: number;
  invalidationLevel: number;
  target1: number;
  target2: number;
  riskRewardRatio: string;
  potentialGain: number;
  maxRisk: number;
  recommendedLot: number;
  notes: string;
  checklist: {
    trendMa200: boolean;
    pullbackHealthy: boolean;
    vcpTight: boolean;
    volumeConfirmation: boolean;
    foreignAccumulation: boolean;
    frequencySpike: boolean;
  };
}

export interface PlanData {
  id: string;
  label: string;
  days: number;
  price: number;
  status: 'active' | 'soon';
  isPopular?: boolean;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: string;
  poster: string;
  videoUrl: string;
}

export interface FaqData {
  id: string;
  question: string;
  answer: string;
}

export interface UserData {
  email: string;
  role: 'admin' | 'member';
  subscriptionActive: boolean;
  subscriptionExpires: string | null;
  lastLogin: string;
}

export interface JournalEntry {
  id: string;
  userEmail: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  date: string;
  price: number;
  lots: number;
  invalidationPrice: number;
  targetPrice: number;
  status: 'OPEN' | 'CLOSED_WIN' | 'CLOSED_LOSS';
  pnl?: number;
  notes?: string;
}

export interface GlobalAssetData {
  symbol: string;
  name: string;
  region: string;
  category: 'stock' | 'index' | 'commodity' | 'crypto' | 'forex';
  flag: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  previousClose?: number;
  lastUpdated?: string;
}

