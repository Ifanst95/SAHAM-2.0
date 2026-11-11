import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StockData, SignalData, JournalEntry, UserData, FaqData, VideoData, PlanData } from '../types.ts';
import { MarketHeatmap } from './dashboard/MarketHeatmap.tsx';
import { SectorRotation } from './dashboard/SectorRotation.tsx';
import { MoneyFlowView } from './dashboard/MoneyFlowView.tsx';
import { FrequencyAnalyzerView } from './dashboard/FrequencyAnalyzerView.tsx';
import { IndicesView } from './dashboard/IndicesView.tsx';
import { ConglomeratesView } from './dashboard/ConglomeratesView.tsx';
import { VcpView } from './dashboard/VcpView.tsx';
import { ShareholdersView } from './dashboard/ShareholdersView.tsx';
import { InsiderTransactionsView } from './dashboard/InsiderTransactionsView.tsx';
import { CorporateActionsView } from './dashboard/CorporateActionsView.tsx';
import { HscView } from './dashboard/HscView.tsx';
import { MarketFundamentalsView } from './dashboard/MarketFundamentalsView.tsx';
import { LotCalculatorView } from './dashboard/LotCalculatorView.tsx';
import { TradingJournalView } from './dashboard/TradingJournalView.tsx';
import { WatchlistView } from './dashboard/WatchlistView.tsx';
import { FaqHelpView } from './dashboard/FaqHelpView.tsx';
import { TutorialVideosView } from './dashboard/TutorialVideosView.tsx';
import { CommandPalette } from './dashboard/CommandPalette.tsx';
import { AccountModal } from './dashboard/AccountModal.tsx';
import { GlobalVerticalTicker } from './dashboard/GlobalVerticalTicker.tsx';
import { LiveBeiCandlestickChart } from './dashboard/LiveBeiCandlestickChart.tsx';
import { AdminCMS } from './AdminCMS.tsx';


interface AppDashboardProps {
  user: UserData | null;
  stocks: StockData[];
  signals: SignalData[];
  watchlist: string[];
  journal: JournalEntry[];
  faq?: FaqData[];
  videos?: VideoData[];
  users?: UserData[];
  plans?: Record<string, PlanData>;
  marketStatus?: any;
  isAutoUpdating?: boolean;
  onToggleAutoUpdate?: () => void;
  onTriggerTick?: () => void;
  onToggleWatchlist: (ticker: string) => void;
  onAddJournal: (entry: Partial<JournalEntry>) => void;
  onBackToLanding: () => void;
  onNavigateToPlans?: () => void;
  onLogout?: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onRefreshData?: () => void;
}

export const AppDashboard: React.FC<AppDashboardProps> = ({
  user,
  stocks,
  signals,
  watchlist,
  journal,
  faq = [],
  videos = [],
  users = [],
  plans = {},
  marketStatus,
  isAutoUpdating = true,
  onToggleAutoUpdate = () => {},
  onTriggerTick = () => {},
  onToggleWatchlist,
  onAddJournal,
  onBackToLanding,
  onNavigateToPlans = () => {},
  onLogout = () => {},
  theme,
  toggleTheme,
  onRefreshData = () => {},
}) => {
  // Navigation & View State
  const [sidebarMenu, setSidebarMenu] = useState<string>('sinyal');
  const [topMode, setTopMode] = useState<'overview' | 'analysis'>('overview');
  const [selectedTicker, setSelectedTicker] = useState<string>('MBSS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);
  const [adminCmsOpen, setAdminCmsOpen] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
  const [quickAddWatchlistOpen, setQuickAddWatchlistOpen] = useState<boolean>(false);
  const [mobileDataMenuOpen, setMobileDataMenuOpen] = useState<boolean>(false);
  const [tickerPaused, setTickerPaused] = useState<boolean>(false);
  const [showGlobalTicker, setShowGlobalTicker] = useState<boolean>(false);

  // Horizontal Ticker: Filter only stocks that are UP today (>900 BEI stocks)
  const upStocks = useMemo(() => {
    const gainers = stocks.filter((s) => s.changePercent > 0 || s.change > 0);
    return gainers.length > 0 ? gainers : stocks;
  }, [stocks]);

  // Screener Filters & Pilihan Masuk (Matching Screenshot 1)
  const [sessionType, setSessionType] = useState<'Penutupan' | 'Sesi 1 (12:00)'>('Penutupan');
  const [levelType, setLevelType] = useState<'ATR' | 'N-candle 1' | 'N-candle 2'>('ATR');
  const [stageTab, setStageTab] = useState<'01' | '02' | '03' | 'kolestrol' | 'jendela' | 'semua' | 'kena_target' | 'invalidasi'>('03');
  const [strategyFilter, setStrategyFilter] = useState<'all' | 'pullback' | 'haka' | 'haka_momentum' | 'momentum'>('all');
  const [viewFormat, setViewFormat] = useState<'kartu' | 'tabel' | 'rapat'>('kartu');
  const [exitStrategy, setExitStrategy] = useState<'fixed' | 'trailing'>('fixed');
  const [otherStageMenuOpen, setOtherStageMenuOpen] = useState<boolean>(false);

  // Filter Drawer State
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterLiquidity, setFilterLiquidity] = useState<'all' | '1m' | '5m' | '10m'>('all');
  const [sortBy, setSortBy] = useState<'momentum' | 'gain' | 'volume' | 'risk'>('momentum');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Chart Controls (Matching Screenshot 2)
  const [chartPeriod, setChartPeriod] = useState<'3bln' | '6bln' | '9bln' | '1thn' | 'panjang'>('3bln');
  const [chartZoom, setChartZoom] = useState<number>(1);
  const [chartSubtab, setChartSubtab] = useState<
    'grafik' | 'fundamental' | 'teknikal' | 'sinyal' | 'arusdana' | 'kepemilikan'
  >('grafik');
  const [checklistOpen, setChecklistOpen] = useState<boolean>(false);
  const [activeAnalysisTool, setActiveAnalysisTool] = useState<string | null>(null);

  // Lot Calculator Modal
  const [lotModalOpen, setLotModalOpen] = useState<boolean>(false);
  const [capital, setCapital] = useState<number>(50000000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [lotModalStock, setLotModalStock] = useState<StockData | null>(null);
  const [calcNotice, setCalcNotice] = useState<string>('');

  // Realtime BEI Chart Engine State
  const [chartEngine, setChartEngine] = useState<'realtime' | 'pattern' | 'split'>('realtime');
  const [isSyncingLiveBei, setIsSyncingLiveBei] = useState<boolean>(false);
  const [liveBeiNotice, setLiveBeiNotice] = useState<string>('');

  const handleSyncCurrentStockLiveBei = async (ticker: string) => {
    setIsSyncingLiveBei(true);
    setLiveBeiNotice('Menghubungkan ke Bursa Efek Indonesia (IDX)…');
    try {
      const res = await fetch(`/api/bei/quote/${ticker}`);
      if (res.ok) {
        const d = await res.json();
        if (d.ok) {
          setLiveBeiNotice(`Data BEI diperbarui: ${d.ticker} Rp${d.price.toLocaleString('id-ID')} (${d.changePercent >= 0 ? '+' : ''}${d.changePercent}%)`);
          onRefreshData?.();
        }
      }
    } catch {
      setLiveBeiNotice('Menggunakan cache data BEI.');
    } finally {
      setIsSyncingLiveBei(false);
      setTimeout(() => setLiveBeiNotice(''), 3500);
    }
  };

  // Auto-sync real-time BEI price when a stock is selected
  useEffect(() => {
    if (selectedTicker) {
      fetch(`/api/bei/quote/${selectedTicker}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.ok && onRefreshData) {
            onRefreshData();
          }
        })
        .catch(() => {});
    }
  }, [selectedTicker]);

  // Close dropdowns on outer click

  const moreMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ctrl+K key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current Stock for Analysis
  const currentStock = useMemo(() => {
    return stocks.find((s) => s.ticker === selectedTicker) || stocks[0] || null;
  }, [stocks, selectedTicker]);

  // Index of current stock among filtered list for < 1 dari 32 > navigation
  const currentStockIndex = useMemo(() => {
    const idx = stocks.findIndex((s) => s.ticker === selectedTicker);
    return idx >= 0 ? idx + 1 : 1;
  }, [stocks, selectedTicker]);

  const handleNextStock = () => {
    const idx = stocks.findIndex((s) => s.ticker === selectedTicker);
    if (idx >= 0 && idx < stocks.length - 1) {
      setSelectedTicker(stocks[idx + 1].ticker);
    } else if (stocks.length > 0) {
      setSelectedTicker(stocks[0].ticker);
    }
  };

  const handlePrevStock = () => {
    const idx = stocks.findIndex((s) => s.ticker === selectedTicker);
    if (idx > 0) {
      setSelectedTicker(stocks[idx - 1].ticker);
    } else if (stocks.length > 0) {
      setSelectedTicker(stocks[stocks.length - 1].ticker);
    }
  };

  // Filtered Signals according to all criteria
  const filteredSignals = useMemo(() => {
    return signals.filter((sig) => {
      // Session filter
      if (sessionType.startsWith('Sesi 1') && sig.session !== 'Sesi 1') return false;
      if (sessionType.startsWith('Penutupan') && sig.session !== 'Penutupan') return false;

      // Stage / Tahap Masuk filter
      if (stageTab === '01' && sig.type !== 'pullback') return false;
      if (stageTab === '02' && sig.type !== 'haka') return false;
      if (stageTab === '03' && sig.status !== 'active') return false;
      if (stageTab === 'kolestrol') {
        const stk = stocks.find((s) => s.ticker === sig.ticker);
        if (!stk || stk.volume * stk.price >= 1000000000) return false;
      }
      if (stageTab === 'jendela' && sig.status !== 'invalidated') return false;
      if (stageTab === 'kena_target' && sig.status !== 'hit_target') return false;
      if (stageTab === 'invalidasi' && sig.status !== 'invalidated') return false;

      // Strategi filter
      if (strategyFilter === 'pullback' && sig.type !== 'pullback') return false;
      if (strategyFilter === 'haka' && sig.type !== 'haka') return false;
      if (strategyFilter === 'haka_momentum' && sig.type !== 'momentum') return false;
      if (strategyFilter === 'momentum' && sig.type !== 'momentum') return false;

      // Sector filter
      if (filterSector !== 'all') {
        const stk = stocks.find((s) => s.ticker === sig.ticker);
        if (stk && stk.sector.toLowerCase() !== filterSector.toLowerCase()) return false;
      }

      // Liquidity filter
      if (filterLiquidity !== 'all') {
        const stk = stocks.find((s) => s.ticker === sig.ticker);
        const val = stk ? stk.volume * stk.price : 0;
        if (filterLiquidity === '1m' && val < 1000000000) return false;
        if (filterLiquidity === '5m' && val < 5000000000) return false;
        if (filterLiquidity === '10m' && val < 10000000000) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!sig.ticker.toLowerCase().includes(q) && !sig.name.toLowerCase().includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'gain') return b.potentialGain - a.potentialGain;
      if (sortBy === 'risk') return a.maxRisk - b.maxRisk;
      if (sortBy === 'volume') return (b.recommendedLot * b.entryPrice) - (a.recommendedLot * a.entryPrice);
      return b.potentialGain - a.potentialGain;
    });
  }, [signals, stocks, sessionType, stageTab, strategyFilter, filterSector, filterLiquidity, searchQuery, sortBy]);

  // Paginated Signals
  const paginatedSignals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSignals.slice(start, start + itemsPerPage);
  }, [filteredSignals, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredSignals.length / itemsPerPage));

  const formatRp = (n: number) => n.toLocaleString('id-ID');
  const formatCompact = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'M';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'Jt';
    if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
    return String(num || 0);
  };

  const openLotCalculator = (stk: StockData) => {
    setLotModalStock(stk);
    setLotModalOpen(true);
  };

  const calculatedPosition = useMemo(() => {
    const s = lotModalStock || currentStock;
    if (!s) return { maxRiskRp: 0, riskPerShare: 0, lots: 0, totalBuyRp: 0, allocPercent: 0 };
    const maxRiskRp = (capital * riskPercent) / 100;
    const entry = s.price;
    const inv = s.invalidation;
    const riskPerShare = Math.max(1, entry - inv);
    const shares = Math.floor(maxRiskRp / riskPerShare);
    const lots = Math.max(1, Math.floor(shares / 100));
    const totalBuyRp = lots * 100 * entry;
    const allocPercent = capital > 0 ? (totalBuyRp / capital) * 100 : 0;
    return { maxRiskRp, riskPerShare, lots, totalBuyRp, allocPercent };
  }, [capital, riskPercent, lotModalStock, currentStock]);

  const handleSaveToJournal = () => {
    const s = lotModalStock || currentStock;
    if (!s) return;
    onAddJournal({
      ticker: s.ticker,
      action: 'BUY',
      date: new Date().toISOString().split('T')[0],
      price: s.price,
      lots: calculatedPosition.lots,
      invalidationPrice: s.invalidation,
      targetPrice: s.target1,
      status: 'OPEN',
      notes: `Trade Plan: Invalidasi ${s.invalidation}, Target ${s.target1}, R:R 1:2.0`,
    });
    setCalcNotice('Tersimpan ke Jurnal Portofolio!');
    setTimeout(() => {
      setCalcNotice('');
      setLotModalOpen(false);
    }, 1200);
  };

  // Stage counts for badges
  const stageCounts = useMemo(() => {
    return {
      c01: signals.filter((s) => s.type === 'pullback').length || 52,
      c02: signals.filter((s) => s.type === 'haka').length || 15,
      c03: signals.filter((s) => s.status === 'active').length || 32,
      kolestrol: 192,
      jendela: 71,
      semua: 921,
      pullback: 23,
      haka: 32,
      haka_momentum: 32,
      momentum: 18,
    };
  }, [signals]);

  return (
    <div className="min-h-screen flex bg-[#f6f2ea] dark:bg-[#121c20] text-[#17242a] dark:text-[#f3eee4] text-xs font-sans">
      {/* ========================================================
          1. LEFT SIDEBAR NAVIGATION (Matching Screenshots 1 & 2)
         ======================================================== */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } border-r border-[#e5ddd0] dark:border-[#26363d] bg-[#fbf9f4] dark:bg-[#152227] flex flex-col justify-between p-3.5 sticky top-0 h-screen overflow-y-auto scrollbar-none z-40 hidden md:flex flex-none transition-all duration-200 select-none`}
      >
        <div className="space-y-4">
          {/* Logo & Brand + Minimize Menu Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd0] dark:border-[#26363d]">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onBackToLanding();
              }}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
              title="Penyembuh Luka · Beranda"
            >
              <div className="w-8 h-8 rounded-lg bg-[#17242a] dark:bg-[#f3eee4] text-[#f6f2ea] dark:text-[#17242a] flex items-center justify-center font-bold text-sm shadow-xs flex-none">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="8" fill="currentColor" />
                  <circle cx="8" cy="11" r="1.5" fill="#17242a" className="dark:fill-[#f3eee4]" />
                  <circle cx="14" cy="11" r="1.5" fill="#17242a" className="dark:fill-[#f3eee4]" />
                  <path d="M8 14 Q11 17 14 14" stroke="#17242a" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-[#f3eee4]" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <b className="font-serif text-[15px] block font-bold leading-tight truncate">Penyembuh Luka</b>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSidebarCollapsed(true);
                    }}
                    className="text-[10px] text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] block cursor-pointer transition-colors"
                  >
                    Minimize Menu
                  </button>
                </div>
              )}
            </a>

            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="w-6 h-6 rounded-md hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] text-[#80887f] flex items-center justify-center cursor-pointer text-xs"
                title="Perluas Menu"
              >
                ›
              </button>
            )}
          </div>

          {/* Primary Top Items: Beranda, Sinyal, Cari */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setSidebarMenu('beranda');
                setTopMode('overview');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
                sidebarMenu === 'beranda'
                  ? 'bg-[#1d7a5c]/10 dark:bg-[#4fbf93]/15 text-[#1d7a5c] dark:text-[#4fbf93] font-bold'
                  : 'text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
              }`}
              title="Beranda"
            >
              <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {!sidebarCollapsed && <span>Beranda</span>}
            </button>

            <button
              onClick={() => {
                setSidebarMenu('sinyal');
                setTopMode('overview');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
                sidebarMenu === 'sinyal'
                  ? 'bg-[#1d7a5c]/10 dark:bg-[#4fbf93]/15 text-[#1d7a5c] dark:text-[#4fbf93] font-bold'
                  : 'text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
              }`}
              title="Sinyal"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                {!sidebarCollapsed && <span>Sinyal</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1d7a5c] text-white">
                  32
                </span>
              )}
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] cursor-pointer"
              title="Cari (Ctrl K)"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {!sidebarCollapsed && <span>Cari</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="text-[10px] text-[#80887f] bg-[#efe9dd] dark:bg-[#26363d] px-1.5 py-0.5 rounded font-mono font-bold">
                  Ctrl K
                </span>
              )}
            </button>
          </div>

          {/* SECTION 1: ANALISIS PASAR */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#80887f] dark:text-[#86908b] uppercase tracking-wider px-3 mb-1">
                ANALISIS PASAR
              </p>
            )}
            <div className="space-y-0.5">
              {[
                { id: 'peta', label: 'Peta saham', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
                { id: 'rotasi', label: 'Rotasi sektor', icon: 'M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' },
                { id: 'aliran', label: 'Aliran dana', icon: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5' },
                { id: 'moneyflow', label: 'Money Flow Tracker', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
                { id: 'freq', label: 'Frequency Analyzer', icon: 'M18 20V10M12 20V4M6 20v-6' },
                { id: 'indeks', label: 'Indeks saham', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
                { id: 'konglomerat', label: 'Grup konglomerat', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
                { id: 'vcp', label: 'VCP', icon: 'M3 3v18h18M7 16l4-8 4 6 5-10' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSidebarMenu(item.id);
                    setTopMode('overview');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    sidebarMenu === item.id
                      ? 'bg-[#1d7a5c]/10 dark:bg-[#4fbf93]/15 text-[#1d7a5c] dark:text-[#4fbf93] font-bold'
                      : 'text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
                  }`}
                  title={item.label}
                >
                  <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={item.icon} />
                  </svg>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: DATA EMITEN */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#80887f] dark:text-[#86908b] uppercase tracking-wider px-3 mb-1">
                DATA EMITEN
              </p>
            )}
            <div className="space-y-0.5">
              {[
                { id: 'pemegang', label: 'Pemegang saham', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
                { id: 'orangdalam', label: 'Transaksi orang dalam', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
                { id: 'corpaction', label: 'Corporate action', icon: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18' },
                { id: 'hsc', label: 'Saham HSC', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
                { id: 'fundamental', label: 'Fundamental pasar', icon: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSidebarMenu(item.id);
                    setTopMode('overview');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    sidebarMenu === item.id
                      ? 'bg-[#1d7a5c]/10 dark:bg-[#4fbf93]/15 text-[#1d7a5c] dark:text-[#4fbf93] font-bold'
                      : 'text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
                  }`}
                  title={item.label}
                >
                  <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={item.icon} />
                  </svg>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: BANTUAN */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#80887f] dark:text-[#86908b] uppercase tracking-wider px-3 mb-1">
                BANTUAN
              </p>
            )}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setSidebarMenu('faq');
                  setTopMode('overview');
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  sidebarMenu === 'faq'
                    ? 'bg-[#1d7a5c]/10 dark:bg-[#4fbf93]/15 text-[#1d7a5c] dark:text-[#4fbf93] font-bold'
                    : 'text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
                }`}
                title="FAQ dan cara pakai"
              >
                <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {!sidebarCollapsed && <span>FAQ dan cara pakai</span>}
              </button>
            </div>
          </div>

          {/* SECTION 4: ALAT */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#80887f] dark:text-[#86908b] uppercase tracking-wider px-3 mb-1">
                ALAT
              </p>
            )}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setSidebarMenu('kalkulator');
                  setTopMode('overview');
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  sidebarMenu === 'kalkulator'
                    ? 'bg-[#1d7a5c]/10 dark:bg-[#4fbf93]/15 text-[#1d7a5c] dark:text-[#4fbf93] font-bold'
                    : 'text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
                }`}
                title="Kalkulator"
              >
                <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
                </svg>
                {!sidebarCollapsed && <span>Kalkulator</span>}
              </button>

              <button
                onClick={() => {
                  setSidebarMenu('jurnal');
                  setTopMode('overview');
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  sidebarMenu === 'jurnal'
                    ? 'bg-[#1d7a5c]/10 dark:bg-[#4fbf93]/15 text-[#1d7a5c] dark:text-[#4fbf93] font-bold'
                    : 'text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
                }`}
                title="Jurnal"
              >
                <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {!sidebarCollapsed && <span>Jurnal</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Account Info & Theme */}
        <div className="pt-3 border-t border-[#e5ddd0] dark:border-[#26363d] flex items-center justify-between">
          <div
            onClick={() => setAccountModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
            title="Pengaturan Akun"
          >
            <div className="w-7 h-7 rounded-full bg-[#1d7a5c] text-white flex items-center justify-center font-bold text-xs flex-none">
              {user?.email?.slice(0, 1).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <b className="block text-xs truncate leading-tight">{user?.email || 'ifan@demo.com'}</b>
                <span className="text-[10px] text-[#1d7a5c] font-semibold block leading-tight">Akun Aktif</span>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <button
              onClick={toggleTheme}
              className="w-7 h-7 rounded-lg border border-[#e5ddd0] dark:border-[#26363d] flex items-center justify-center text-xs hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] cursor-pointer text-[#56625f] dark:text-[#a9b3ad]"
              title="Ganti Tema (Gelap/Terang)"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================
          2. MAIN CONTENT AREA
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP BAR (Matching Screenshots 1 & 2) */}
        <header className="sticky top-0 z-30 bg-[#fbf9f4]/95 dark:bg-[#152227]/95 backdrop-blur-md border-b border-[#e5ddd0] dark:border-[#26363d] px-4 py-2.5 space-y-2">
          {/* Main Top Navbar Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Search Box */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a2a30] border border-[#d6ccbb] dark:border-[#304349] text-xs cursor-pointer hover:border-[#1d7a5c] transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-[#80887f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="text-[#80887f] flex-1 truncate">
                  Cari saham, menu, atau pertanyaan
                </span>
                <kbd className="px-1.5 py-0.5 rounded text-[9px] bg-[#efe9dd] dark:bg-[#121c20] text-[#80887f] font-mono font-bold">
                  Ctrl K
                </kbd>
              </div>
            </div>

            {/* Middle Switch: Overview & Analysis */}
            <div className="flex items-center p-1 bg-[#efe9dd] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349]">
              <button
                onClick={() => setTopMode('overview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  topMode === 'overview'
                    ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs'
                    : 'text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4]'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Overview</span>
              </button>

              <button
                onClick={() => setTopMode('analysis')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  topMode === 'analysis'
                    ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs'
                    : 'text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4]'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span>Analysis</span>
              </button>
            </div>

            {/* Right Menu Links: Langganan, Akun, S&K, Video tutorial, ···, Theme */}
            <div className="flex items-center gap-4 text-xs font-semibold text-[#56625f] dark:text-[#a9b3ad]">
              <button
                onClick={onNavigateToPlans}
                className="hover:text-[#17242a] dark:hover:text-[#f3eee4] cursor-pointer transition-colors hidden sm:inline"
              >
                Langganan
              </button>

              <button
                onClick={() => setAccountModalOpen(true)}
                className="hover:text-[#17242a] dark:hover:text-[#f3eee4] cursor-pointer transition-colors"
              >
                Akun
              </button>

              <button
                onClick={() => setTermsModalOpen(true)}
                className="hover:text-[#17242a] dark:hover:text-[#f3eee4] cursor-pointer transition-colors hidden sm:inline"
              >
                S&amp;K
              </button>

              <button
                onClick={() => {
                  setSidebarMenu('video');
                  setTopMode('overview');
                }}
                className="hover:text-[#17242a] dark:hover:text-[#f3eee4] cursor-pointer transition-colors hidden md:inline"
              >
                Video tutorial
              </button>

              {/* Three dots '···' dropdown */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="w-7 h-7 rounded-lg border border-[#d6ccbb] dark:border-[#304349] flex items-center justify-center font-bold text-xs hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] cursor-pointer"
                  title="Menu Lainnya"
                >
                  ···
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#d6ccbb] dark:border-[#304349] shadow-xl py-2 z-50 text-xs font-medium space-y-1">
                    <button
                      onClick={() => {
                        setAdminCmsOpen(true);
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#efe9dd] dark:hover:bg-[#121c20] flex items-center gap-2 cursor-pointer font-bold text-[#1d7a5c]"
                    >
                      <span>⚙</span> CMS Admin Data Pasar
                    </button>

                    <button
                      onClick={() => {
                        onToggleAutoUpdate();
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#efe9dd] dark:hover:bg-[#121c20] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isAutoUpdating ? 'bg-[#1d7a5c]' : 'bg-[#80887f]'}`}></span>
                        <span>Auto-Update Pasar</span>
                      </span>
                      <span className="text-[10px] text-[#80887f] font-mono">{isAutoUpdating ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onTriggerTick();
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#efe9dd] dark:hover:bg-[#121c20] flex items-center gap-2 cursor-pointer"
                    >
                      <span>↻</span> Update Tick Pasar Sekarang
                    </button>

                    <button
                      onClick={() => {
                        setTermsModalOpen(true);
                        setMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#efe9dd] dark:hover:bg-[#121c20] flex items-center gap-2 cursor-pointer sm:hidden"
                    >
                      <span>📄</span> Syarat &amp; Ketentuan (S&amp;K)
                    </button>

                    <div className="border-t border-[#e5ddd0] dark:border-[#26363d] my-1"></div>

                    <a
                      href="https://wa.me/6281234567890?text=Halo%20Admin%20Penyembuh%20Luka,%20saya%20butuh%20bantuan"
                      target="_blank"
                      rel="noreferrer"
                      className="block px-4 py-2 text-left hover:bg-[#efe9dd] dark:hover:bg-[#121c20] text-[#2f679e] cursor-pointer"
                    >
                      💬 Hubungi Kami (WhatsApp)
                    </a>

                    <button
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#c4554a]/10 text-[#c4554a] cursor-pointer font-bold"
                    >
                      ✕ Keluar (Logout)
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-7 h-7 rounded-lg border border-[#d6ccbb] dark:border-[#304349] flex items-center justify-center text-xs hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] cursor-pointer"
                title="Ganti Tema"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* RUNNING TICKER BAR: Menampilkan HANYA Saham Yang Naik Hari Ini dari 900+ Saham BEI */}
          <div className="flex items-center gap-3 pt-1 border-t border-[#e5ddd0]/60 dark:border-[#26363d]/60 text-[11px] overflow-hidden group">
            {/* Left Tag: Khusus Saham Yang Naik Hari Ini */}
            <div className="flex items-center gap-2 flex-none pl-1 pr-2.5 border-r border-[#e5ddd0] dark:border-[#26363d]">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] tracking-wider uppercase font-black">
                  🟢 SAHAM NAIK HARI INI
                </span>
                <span className="hidden sm:inline font-mono text-[9.5px] bg-emerald-500/20 px-1.5 py-0.2 rounded-full text-emerald-900 dark:text-emerald-100 font-extrabold">
                  {upStocks.length} Menguat
                </span>
              </div>

              {/* Quick Add To Watchlist Button */}
              <button
                onClick={() => setQuickAddWatchlistOpen(true)}
                className="w-5 h-5 rounded-md border border-[#d6ccbb] dark:border-[#304349] flex items-center justify-center text-xs font-bold text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] cursor-pointer"
                title="Tambah Pantauan Saham"
              >
                +
              </button>
            </div>

            {/* Smooth Marquee Track: HANYA SAHAM YANG NAIK HARI INI DARI 900+ SAHAM BEI */}
            <div className="overflow-hidden relative flex-1">
              <div className={`bei-ticker-track ${tickerPaused ? 'paused' : ''}`}>
                {[...upStocks, ...upStocks].map((stk, idx) => (
                  <div
                    key={`${stk.ticker}-${idx}`}
                    onClick={() => {
                      setSelectedTicker(stk.ticker);
                      setTopMode('analysis');
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors flex-none mx-0.5 font-bold"
                    title={`BEI Realtime IDX:${stk.ticker} (${stk.name}) · Naik +${stk.changePercent}% · Klik untuk Buka Grafik & Trade Plan`}
                  >
                    <span className="tracking-tight text-[11px] text-[#17242a] dark:text-[#f3eee4]">
                      {stk.ticker}
                    </span>
                    <span className="font-mono text-[11px] text-[#56625f] dark:text-[#a9b3ad]">
                      {formatRp(stk.price)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/40 px-1 py-0.2 rounded flex items-center gap-0.5">
                      <span>▲</span>
                      <span>+{stk.changePercent}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls: Count, Play/Pause, Real-Time BEI Sync, and Toggle Bursa Dunia Realtime */}
            <div className="flex items-center gap-2 flex-none pr-1 pl-2 border-l border-[#e5ddd0] dark:border-[#26363d]">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 hidden lg:inline font-mono font-bold">
                🟢 {upStocks.length} Naik / {stocks.length} BEI
              </span>

              {/* Toggle Vertical Global Ticker */}
              <button
                onClick={() => setShowGlobalTicker(!showGlobalTicker)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showGlobalTicker
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                    : 'bg-[#efe9dd] dark:bg-[#1a2a30] text-[#56625f] dark:text-[#a9b3ad] hover:text-[#17242a] dark:hover:text-[#f3eee4]'
                }`}
                title="Buka / Tutup Ticker Berjalan Kebawah Saham Realtime Seluruh Dunia"
              >
                <span>🌐</span>
                <span className="hidden sm:inline">Bursa Dunia</span>
                <span className="text-[9px] font-mono px-1 bg-black/10 dark:bg-white/10 rounded">↓ Kebawah</span>
              </button>

              {/* Play/Pause Control */}
              <button
                onClick={() => setTickerPaused(!tickerPaused)}
                className="w-6 h-6 rounded-md hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] flex items-center justify-center text-xs cursor-pointer font-bold transition-colors"
                title={tickerPaused ? 'Lanjutkan Pergerakan Ticker' : 'Jeda Pergerakan Ticker'}
                aria-label={tickerPaused ? 'Play Ticker' : 'Pause Ticker'}
              >
                {tickerPaused ? '▶' : '⏸'}
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            MAIN BODY VIEWS
           ======================================================== */}
        <main className="p-4 md:p-6 space-y-6">
          {/* --------------------------------------------------------
              VIEW: BERANDA (Matching Screenshot 3)
             -------------------------------------------------------- */}
          {topMode === 'overview' && sidebarMenu === 'beranda' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Top Banner Status */}
              <div className="p-5 rounded-3xl bg-linear-to-r from-[#17242a] to-[#26363d] text-[#f3eee4] space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#4fbf93] uppercase tracking-wider">
                    KONDISI PASAR BEI
                  </span>
                  <span className="text-xs text-[#a9b3ad]">Penutupan 6 Nov · 11:05 WIB</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <b className="text-4xl font-black font-serif">5.050,43</b>
                  <span className="text-sm font-bold text-[#e27c70] px-2 py-0.5 rounded-full bg-[#e27c70]/20">
                    ✕ Bearish
                  </span>
                </div>
                <p className="text-xs text-[#a9b3ad]">
                  <b className="text-[#e27c70]">-15,09%</b> dari MA50 (5.948)
                </p>

                {/* Sub-cards Global Indices from Screenshot 3 */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#a9b3ad] block">Hang Seng</span>
                    <b className="text-sm block mt-0.5">20.538,38</b>
                    <span className="text-[10px] text-[#e27c70]">-1,07%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#a9b3ad] block">Shanghai</span>
                    <b className="text-sm block mt-0.5">3.649,18</b>
                    <span className="text-[10px] text-[#e27c70]">-1,10%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#a9b3ad] block">KOSPI</span>
                    <b className="text-sm block mt-0.5">5.059,69</b>
                    <span className="text-[10px] text-[#e27c70]">-6,02%</span>
                  </div>
                </div>
              </div>

              {/* Big Green Banner from Screenshot 3 */}
              <div
                onClick={() => {
                  setSidebarMenu('sinyal');
                  setStageTab('03');
                }}
                className="p-4 rounded-2xl bg-[#1d7a5c] text-white flex items-center justify-between cursor-pointer hover:opacity-95 shadow-md transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <b className="text-lg font-bold block">6 breakout hari ini</b>
                  <p className="text-xs opacity-90 mt-0.5">
                    52 sinyal baru, 15 menunggu konfirmasi. Ketuk untuk melihat daftarnya.
                  </p>
                </div>
                <span className="text-2xl font-bold">›</span>
              </div>

              {/* Tahap Sinyal Sequential Cards (Screenshot 3) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-2xl font-bold">Tahap sinyal</h3>
                  <button
                    onClick={() => setSidebarMenu('sinyal')}
                    className="text-xs font-semibold text-[#1d7a5c] hover:underline cursor-pointer"
                  >
                    Lihat semua ›
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 items-center">
                  <div
                    onClick={() => {
                      setSidebarMenu('sinyal');
                      setStageTab('01');
                    }}
                    className="p-4 rounded-2xl bg-[#fbe7df] dark:bg-[#1a2a30] border border-[#f39a8c] cursor-pointer hover:shadow-xs transition-shadow"
                  >
                    <span className="text-xs font-bold text-[#c4554a] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#c4554a]"></span> Sinyal baru
                    </span>
                    <b className="text-3xl font-extrabold block mt-2 text-[#17242a] dark:text-[#f3eee4]">52</b>
                  </div>

                  <div
                    onClick={() => {
                      setSidebarMenu('sinyal');
                      setStageTab('02');
                    }}
                    className="p-4 rounded-2xl bg-[#fcf4e6] dark:bg-[#1a2a30] border border-[#e3ac52] cursor-pointer hover:shadow-xs transition-shadow"
                  >
                    <span className="text-xs font-bold text-[#a86f1c] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#a86f1c]"></span> Menunggu konfirmasi
                    </span>
                    <b className="text-3xl font-extrabold block mt-2 text-[#17242a] dark:text-[#f3eee4]">15</b>
                  </div>

                  <div
                    onClick={() => {
                      setSidebarMenu('sinyal');
                      setStageTab('03');
                    }}
                    className="p-4 rounded-2xl bg-[#e3f4ec] dark:bg-[#1a2a30] border border-[#1d7a5c] cursor-pointer hover:shadow-xs transition-shadow"
                  >
                    <span className="text-xs font-bold text-[#1d7a5c] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1d7a5c]"></span> Terkonfirmasi
                    </span>
                    <b className="text-3xl font-extrabold block mt-2 text-[#17242a] dark:text-[#f3eee4]">32</b>
                  </div>
                </div>

                {/* Additional Category Items from Screenshot 3 */}
                <div className="mt-4 space-y-2">
                  <div
                    onClick={() => {
                      setSidebarMenu('sinyal');
                      setStageTab('kolestrol');
                    }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex items-center justify-between cursor-pointer hover:bg-[#efe9dd]/50"
                  >
                    <div>
                      <b className="text-xs font-bold flex items-center gap-1.5 text-[#c4554a]">
                        <span className="w-2 h-2 rounded-full bg-[#f39a8c]"></span> Kolestrol Tinggi
                      </b>
                      <span className="text-[11px] text-[#80887f]">Alur yang sama, value di bawah Rp1 M</span>
                    </div>
                    <span className="text-sm font-bold text-[#80887f]">192 ›</span>
                  </div>

                  <div
                    onClick={() => {
                      setSidebarMenu('sinyal');
                      setStageTab('jendela');
                    }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex items-center justify-between cursor-pointer hover:bg-[#efe9dd]/50"
                  >
                    <div>
                      <b className="text-xs font-bold flex items-center gap-1.5 text-[#a86f1c]">
                        <span className="w-2 h-2 rounded-full bg-[#a86f1c]"></span> Jendela habis
                      </b>
                      <span className="text-[11px] text-[#80887f]">5 candle tanpa konfirmasi</span>
                    </div>
                    <span className="text-sm font-bold text-[#80887f]">71 ›</span>
                  </div>

                  <div
                    onClick={() => {
                      setSidebarMenu('sinyal');
                      setStageTab('kena_target');
                    }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex items-center justify-between cursor-pointer hover:bg-[#efe9dd]/50"
                  >
                    <div>
                      <b className="text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1d7a5c]"></span> Kena Target
                      </b>
                      <span className="text-[11px] text-[#80887f]">Breakout lalu sentuh Target, 5 candle terakhir</span>
                    </div>
                    <span className="text-sm font-bold text-[#80887f]">3 ›</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------
              VIEW: SINYAL SAHAM (Exact replica of Screenshot 1)
             -------------------------------------------------------- */}
          {topMode === 'overview' && sidebarMenu === 'sinyal' && (
            <div className="space-y-4">
              {/* Row 1: Title, Session Date, Stats Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <h1 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight">Sinyal Saham</h1>
                  <span className="text-xs text-[#80887f]">
                    {sessionType.startsWith('Penutupan') ? 'Penutupan 6 Nov 2026' : 'Sesi 1 (12:00) 6 Nov 2026'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#80887f]">921 saham dihitung</span>
                  <span className="px-3 py-1 rounded-full border border-[#f39a8c] bg-[#fbe7df] dark:bg-[#1a2a30] text-[#c4554a] font-semibold">
                    IHSG -15,09% dari MA50
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#fbe7df] dark:bg-[#1a2a30] text-[#c4554a] font-bold">
                    Bearish
                  </span>
                  <button
                    onClick={() => {
                      setStageTab('03');
                      setStrategyFilter('all');
                    }}
                    className="px-3 py-1 rounded-full bg-[#1d7a5c] text-white font-bold hover:opacity-90 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>6 breakout hari ini</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Filter Controls Bar (Filter & Urutkan, Data Sesi, Level, Lainnya) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xs">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setFilterDrawerOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold text-xs bg-[#f6f2ea] dark:bg-[#121c20] hover:bg-[#efe9dd] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Filter &amp; urutkan</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#80887f] font-semibold text-xs">Data</span>
                    <div className="flex items-center p-0.5 bg-[#efe9dd] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349]">
                      <button
                        onClick={() => setSessionType('Sesi 1 (12:00)')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          sessionType === 'Sesi 1 (12:00)'
                            ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs'
                            : 'text-[#80887f]'
                        }`}
                      >
                        Sesi 1 (12:00)
                      </button>
                      <button
                        onClick={() => setSessionType('Penutupan')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          sessionType === 'Penutupan'
                            ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs'
                            : 'text-[#80887f]'
                        }`}
                      >
                        Penutupan
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#80887f] font-semibold text-xs">Level</span>
                    <div className="flex items-center p-0.5 bg-[#efe9dd] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349]">
                      {(['ATR', 'N-candle 1', 'N-candle 2'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setLevelType(lvl)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            levelType === lvl
                              ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs'
                              : 'text-[#80887f]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Tahap Sinyal Tabs (01, 02, 03, Kolestrol, Jendela, Semua, Lainnya) */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 border-b border-[#e5ddd0] dark:border-[#26363d] text-xs font-bold">
                <button
                  onClick={() => setStageTab('01')}
                  className={`px-3 py-2 rounded-t-xl transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 flex-none ${
                    stageTab === '01'
                      ? 'border-[#c4554a] text-[#c4554a] bg-white dark:bg-[#1a2a30]'
                      : 'border-transparent text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span>01 Sinyal baru</span>
                  <span className="font-normal opacity-80">{stageCounts.c01}</span>
                </button>

                <button
                  onClick={() => setStageTab('02')}
                  className={`px-3 py-2 rounded-t-xl transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 flex-none ${
                    stageTab === '02'
                      ? 'border-[#a86f1c] text-[#a86f1c] bg-white dark:bg-[#1a2a30]'
                      : 'border-transparent text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span>02 Menunggu konfirmasi</span>
                  <span className="font-normal opacity-80">{stageCounts.c02}</span>
                </button>

                <button
                  onClick={() => setStageTab('03')}
                  className={`px-3 py-2 rounded-t-xl transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 flex-none ${
                    stageTab === '03'
                      ? 'border-[#1d7a5c] text-[#1d7a5c] bg-white dark:bg-[#1a2a30]'
                      : 'border-transparent text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span>03 Terkonfirmasi</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#1d7a5c]/10 text-[#1d7a5c]">
                    {stageCounts.c03}
                  </span>
                </button>

                <button
                  onClick={() => setStageTab('kolestrol')}
                  className={`px-3 py-2 rounded-t-xl transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 flex-none ${
                    stageTab === 'kolestrol'
                      ? 'border-[#c4554a] text-[#c4554a] bg-white dark:bg-[#1a2a30]'
                      : 'border-transparent text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#f39a8c]"></span>
                  <span>Kolestrol Tinggi</span>
                  <span className="font-normal opacity-80">{stageCounts.kolestrol}</span>
                </button>

                <button
                  onClick={() => setStageTab('jendela')}
                  className={`px-3 py-2 rounded-t-xl transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 flex-none ${
                    stageTab === 'jendela'
                      ? 'border-[#2f679e] text-[#2f679e] bg-white dark:bg-[#1a2a30]'
                      : 'border-transparent text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#2f679e]"></span>
                  <span>Jendela habis</span>
                  <span className="font-normal opacity-80">{stageCounts.jendela}</span>
                </button>

                <button
                  onClick={() => setStageTab('semua')}
                  className={`px-3 py-2 rounded-t-xl transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 flex-none ${
                    stageTab === 'semua'
                      ? 'border-[#1d7a5c] text-[#1d7a5c] bg-white dark:bg-[#1a2a30]'
                      : 'border-transparent text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span>Semua saham</span>
                  <span className="font-normal opacity-80">{stageCounts.semua}</span>
                </button>

                {/* Dropdown Lainnya positioned as in Screenshot 1 */}
                <div className="relative flex-none">
                  <button
                    onClick={() => setOtherStageMenuOpen(!otherStageMenuOpen)}
                    className="px-2.5 py-2 text-xs font-semibold text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lainnya</span>
                    <span>˅</span>
                  </button>

                  {otherStageMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1a2a30] border border-[#d6ccbb] dark:border-[#304349] shadow-lg py-1 z-30 text-xs font-normal">
                      <button
                        onClick={() => {
                          setStageTab('kena_target');
                          setOtherStageMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-[#efe9dd] dark:hover:bg-[#121c20] flex items-center justify-between"
                      >
                        <span>Kena Target</span>
                        <span className="font-bold text-[#1d7a5c]">3</span>
                      </button>
                      <button
                        onClick={() => {
                          setStageTab('invalidasi');
                          setOtherStageMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-[#efe9dd] dark:hover:bg-[#121c20] flex items-center justify-between"
                      >
                        <span>Invalidasi</span>
                        <span className="font-bold text-[#c4554a]">8</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Strategi Pills (Matching Screenshot 1) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
                <span className="text-[#80887f] mr-1">Strategi</span>
                <button
                  onClick={() => setStrategyFilter('all')}
                  className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                    strategyFilter === 'all'
                      ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs border border-[#d6ccbb] dark:border-[#304349] font-bold'
                      : 'text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  Semua {stageCounts.c03}
                </button>

                <button
                  onClick={() => setStrategyFilter('pullback')}
                  className={`px-3 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                    strategyFilter === 'pullback'
                      ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs border border-[#d6ccbb] dark:border-[#304349] font-bold'
                      : 'text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span className="text-[#1d7a5c]">▲</span> Pullback {stageCounts.pullback}
                </button>

                <button
                  onClick={() => setStrategyFilter('haka')}
                  className={`px-3 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                    strategyFilter === 'haka'
                      ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs border border-[#d6ccbb] dark:border-[#304349] font-bold'
                      : 'text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span className="text-[#2f679e]">◆</span> HAKA {stageCounts.haka}
                </button>

                <button
                  onClick={() => setStrategyFilter('haka_momentum')}
                  className={`px-3 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                    strategyFilter === 'haka_momentum'
                      ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs border border-[#d6ccbb] dark:border-[#304349] font-bold'
                      : 'text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span className="text-[#e3ac52]">●</span> HAKA Momentum {stageCounts.haka_momentum}
                </button>

                <button
                  onClick={() => setStrategyFilter('momentum')}
                  className={`px-3 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                    strategyFilter === 'momentum'
                      ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs border border-[#d6ccbb] dark:border-[#304349] font-bold'
                      : 'text-[#80887f] hover:text-[#17242a]'
                  }`}
                >
                  <span className="text-[#2f679e]">○</span> Momentum {stageCounts.momentum}
                </button>
              </div>

              {/* Row 5: Sub-bar (Snapshot text + Tampilan switcher + Cara keluar) */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                <span className="text-[#80887f]">Snapshot setelah pasar tutup.</span>

                <div className="flex items-center gap-4">
                  {/* Tampilan: Tabel, Rapat, Kartu */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#80887f]">Tampilan</span>
                    <div className="flex items-center p-0.5 bg-[#efe9dd] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold">
                      {(['tabel', 'rapat', 'kartu'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setViewFormat(fmt)}
                          className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                            viewFormat === fmt
                              ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs'
                              : 'text-[#80887f]'
                          }`}
                        >
                          {fmt === 'kartu' ? 'Kartu' : fmt === 'tabel' ? 'Tabel' : 'Rapat'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cara Keluar: Invalidasi tetap vs Trailing stop */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#80887f]">Cara keluar</span>
                    <div className="flex items-center p-0.5 bg-[#efe9dd] dark:bg-[#121c20] rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold">
                      <button
                        onClick={() => setExitStrategy('fixed')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          exitStrategy === 'fixed'
                            ? 'bg-[#17242a] dark:bg-[#f3eee4] text-white dark:text-[#17242a]'
                            : 'text-[#80887f]'
                        }`}
                      >
                        Invalidasi tetap
                      </button>
                      <button
                        onClick={() => setExitStrategy('trailing')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          exitStrategy === 'trailing'
                            ? 'bg-[#17242a] dark:bg-[#f3eee4] text-white dark:text-[#17242a]'
                            : 'text-[#80887f]'
                        }`}
                      >
                        Trailing stop
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: Section Header (Terkonfirmasi & Explanation & Pagination) */}
              <div className="pt-2">
                <h2 className="font-serif text-xl font-bold">
                  {stageTab === '03'
                    ? 'Terkonfirmasi'
                    : stageTab === '01'
                    ? 'Sinyal Baru'
                    : stageTab === '02'
                    ? 'Menunggu Konfirmasi'
                    : stageTab === 'kolestrol'
                    ? 'Kolestrol Tinggi'
                    : 'Semua Saham'}
                </h2>
                <p className="text-xs text-[#56625f] mt-1 max-w-3xl leading-relaxed">
                  Konfirmasi baru = lolos di candle terakhir, harga acuan open berikutnya (batal kalau open lewat Target atau Invalidasi, atau terkunci ARA). Sisanya posisi yang sudah masuk dan belum kena Target atau Invalidasi, maksimal 20 hari bursa.
                </p>

                <div className="flex items-center justify-between mt-3 text-xs text-[#80887f]">
                  <span>
                    {filteredSignals.length === 0
                      ? '0 saham ditemukan'
                      : `1-${Math.min(itemsPerPage, filteredSignals.length)} dari ${filteredSignals.length} saham`}
                  </span>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1 font-bold">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      ‹ Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 rounded-lg cursor-pointer transition-colors ${
                          currentPage === i + 1
                            ? 'bg-[#17242a] dark:bg-[#f3eee4] text-white dark:text-[#17242a]'
                            : 'hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Berikutnya ›
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  FORMAT 1: KARTU (Exact replica of Screenshot 1)
                 ======================================================== */}
              {viewFormat === 'kartu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {paginatedSignals.map((sig) => {
                    const stock = stocks.find((s) => s.ticker === sig.ticker);
                    const isHsc = stock?.group?.includes('HSC') || sig.ticker === 'SSMS';

                    // Live chart derived metrics for today
                    const entryPrice = stock?.price || sig.entryPrice;
                    const breakoutLevel = stock?.pivotBreakout || sig.breakoutLevel;
                    const invalidationLevel = stock?.invalidation || sig.invalidationLevel;
                    const target1 = stock?.target1 || sig.target1;
                    const potentialGain = Math.round(((target1 - entryPrice) / (entryPrice || 1)) * 1000) / 10;
                    const maxRisk = Math.abs(Math.round(((entryPrice - invalidationLevel) / (entryPrice || 1)) * 1000) / 10);
                    const recommendedLot = Math.max(1, Math.floor(500000 / (Math.max(1, entryPrice - invalidationLevel) * 100)));
                    const isBreakout = entryPrice >= breakoutLevel;
                    const isPullback = entryPrice >= (stock?.ma20 || entryPrice * 0.98);

                    return (
                      <div
                        key={sig.id}
                        className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
                      >
                        {/* Top Row: Ticker, Badges, Price, Change */}
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <b className="text-xl font-black tracking-tight">{sig.ticker}</b>
                                {isHsc && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border border-[#e3ac52] text-[#a86f1c] bg-[#fcf4e6] dark:bg-[#1a2a30]">
                                    HSC
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#56625f] truncate max-w-[170px] mt-0.5">
                                {sig.name}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-lg font-black block leading-tight font-mono">
                                {formatRp(entryPrice)}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  (stock?.changePercent ?? sig.potentialGain) >= 0 ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                                }`}
                              >
                                {(stock?.changePercent ?? sig.potentialGain) >= 0 ? '+' : ''}
                                {stock?.changePercent ?? sig.potentialGain}%
                              </span>
                            </div>
                          </div>

                          {/* Tag row: Membaca Grafik Hari Ini */}
                          <div className="flex items-center gap-1.5 text-[10px] mt-2 text-[#80887f] truncate">
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded flex-none ${
                                isBreakout
                                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                                  : isPullback
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {isBreakout
                                ? '⚡ Breakout Hari Ini'
                                : isPullback
                                ? '🔄 Pullback Sehat'
                                : '⏳ Uji Level Support'}
                            </span>
                            <span className="truncate">
                              {isBreakout
                                ? `Tembus batas Rp ${formatRp(breakoutLevel)}`
                                : `Target TP1 Rp ${formatRp(target1)} (+${potentialGain}%)`}
                            </span>
                          </div>
                        </div>

                        {/* 6-Grid Metrics Box: Membaca Grafik Hari Ini */}
                        <div className="p-2.5 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] text-xs space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-[#80887f] block">Batas breakout</span>
                              <b className="font-bold block font-mono text-[11px]">{formatRp(breakoutLevel)}</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#80887f] block">Invalidasi</span>
                              <b className="font-bold text-[#c4554a] block font-mono text-[11px]">{formatRp(invalidationLevel)}</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#80887f] block">Target</span>
                              <b className="font-bold text-[#1d7a5c] block font-mono text-[11px]">{formatRp(target1)}</b>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#e5ddd0] dark:border-[#26363d]">
                            <div>
                              <span className="text-[10px] text-[#80887f] block">Lot</span>
                              <b className="font-bold block font-mono text-[11px]">{recommendedLot}</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#80887f] block">Risiko</span>
                              <b className="font-bold block font-mono text-[11px] text-rose-500">{maxRisk}%</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#80887f] block">Potensi</span>
                              <b className="font-bold text-[#1d7a5c] block font-mono text-[11px]">+{potentialGain}%</b>
                            </div>
                          </div>
                        </div>

                        {/* Subtext info dari pembacaan grafik */}
                        <p className="text-[10px] text-[#80887f] truncate">
                          Vol {formatCompact(stock?.volume || 1000000)} · Rasio R:R 1 : {((target1 - entryPrice) / Math.max(1, entryPrice - invalidationLevel)).toFixed(1)} · VCP {stock?.vcpStatus || 'Ketat'}
                        </p>

                        {/* Card Buttons: [ Grafik ] [ Hitung lot ] [ ☆ ] */}
                        <div className="flex items-center gap-2 pt-1 border-t border-[#e5ddd0] dark:border-[#26363d]">
                          <button
                            onClick={() => {
                              setSelectedTicker(sig.ticker);
                              setTopMode('analysis');
                            }}
                            className="flex-1 py-1.5 rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold text-xs hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer text-center"
                          >
                            Grafik
                          </button>

                          <button
                            onClick={() => {
                              if (stock) openLotCalculator(stock);
                            }}
                            className="flex-1 py-1.5 rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold text-xs hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer text-center"
                          >
                            Hitung lot
                          </button>

                          <button
                            onClick={() => onToggleWatchlist(sig.ticker)}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm cursor-pointer transition-colors ${
                              watchlist.includes(sig.ticker)
                                ? 'bg-amber-400 text-white border-amber-400'
                                : 'border-[#d6ccbb] dark:border-[#304349] hover:bg-[#efe9dd] text-[#80887f]'
                            }`}
                            title="Pantau Saham"
                          >
                            {watchlist.includes(sig.ticker) ? '★' : '☆'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ========================================================
                  FORMAT 2: TABEL (Full Screener Table)
                 ======================================================== */}
              {viewFormat === 'tabel' && (
                <div className="rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e5ddd0] dark:border-[#26363d] text-[#80887f] font-bold bg-[#fbf9f4] dark:bg-[#152227]">
                        <th className="py-3 px-4">Saham</th>
                        <th className="py-3 px-3 text-right">Harga</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Strategi</th>
                        <th className="py-3 px-3 text-right">Batas Breakout</th>
                        <th className="py-3 px-3 text-right">Invalidasi</th>
                        <th className="py-3 px-3 text-right">Target 1</th>
                        <th className="py-3 px-3 text-right">Lot (1%)</th>
                        <th className="py-3 px-3 text-right">Risiko %</th>
                        <th className="py-3 px-3 text-right">Momentum</th>
                        <th className="py-3 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
                      {paginatedSignals.map((sig) => {
                        const stock = stocks.find((s) => s.ticker === sig.ticker);
                        const entryPrice = stock?.price || sig.entryPrice;
                        const breakoutLevel = stock?.pivotBreakout || sig.breakoutLevel;
                        const invalidationLevel = stock?.invalidation || sig.invalidationLevel;
                        const target1 = stock?.target1 || sig.target1;
                        const potentialGain = Math.round(((target1 - entryPrice) / (entryPrice || 1)) * 1000) / 10;
                        const maxRisk = Math.abs(Math.round(((entryPrice - invalidationLevel) / (entryPrice || 1)) * 1000) / 10);
                        const recommendedLot = Math.max(1, Math.floor(500000 / (Math.max(1, entryPrice - invalidationLevel) * 100)));
                        const isBreakout = entryPrice >= breakoutLevel;

                        return (
                          <tr key={sig.id} className="hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] transition-colors">
                            <td className="py-3 px-4">
                              <b
                                onClick={() => {
                                  setSelectedTicker(sig.ticker);
                                  setTopMode('analysis');
                                }}
                                className="font-black text-sm cursor-pointer hover:underline block"
                              >
                                {sig.ticker}
                              </b>
                              <span className="text-[11px] text-[#80887f] block truncate max-w-[140px]">
                                {sig.name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <b className="block font-mono">{formatRp(entryPrice)}</b>
                              <span
                                className={`text-[11px] font-bold ${
                                  (stock?.changePercent ?? potentialGain) >= 0 ? 'text-[#1d7a5c]' : 'text-[#c4554a]'
                                }`}
                              >
                                {(stock?.changePercent ?? potentialGain) >= 0 ? '+' : ''}
                                {stock?.changePercent ?? potentialGain}%
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isBreakout
                                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                                    : 'bg-[#1d7a5c]/10 text-[#1d7a5c]'
                                }`}
                              >
                                {isBreakout ? 'Breakout' : 'Terkonfirmasi'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold capitalize text-[#56625f]">
                              {sig.type}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold">
                              {formatRp(breakoutLevel)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[#c4554a]">
                              {formatRp(invalidationLevel)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[#1d7a5c]">
                              {formatRp(target1)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold">{recommendedLot}</td>
                            <td className="py-3 px-3 text-right font-bold text-rose-500">{maxRisk}%</td>
                            <td className="py-3 px-3 text-right font-bold text-[#1d7a5c]">+{potentialGain}%</td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedTicker(sig.ticker);
                                    setTopMode('analysis');
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-[#d6ccbb] hover:bg-[#efe9dd] cursor-pointer font-bold"
                                >
                                  Grafik
                                </button>
                                <button
                                  onClick={() => {
                                    if (stock) openLotCalculator(stock);
                                  }}
                                  className="px-2 py-1 rounded-lg border border-[#d6ccbb] hover:bg-[#efe9dd] cursor-pointer font-bold"
                                >
                                  Lot
                                </button>
                                <button
                                  onClick={() => onToggleWatchlist(sig.ticker)}
                                  className={`p-1 rounded-lg border cursor-pointer ${
                                    watchlist.includes(sig.ticker) ? 'bg-amber-400 text-white' : 'hover:bg-[#efe9dd]'
                                  }`}
                                >
                                  {watchlist.includes(sig.ticker) ? '★' : '☆'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ========================================================
                  FORMAT 3: RAPAT (Compact Density View)
                 ======================================================== */}
              {viewFormat === 'rapat' && (
                <div className="rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] overflow-x-auto shadow-2xs">
                  <div className="divide-y divide-[#e5ddd0] dark:divide-[#26363d]">
                    {paginatedSignals.map((sig) => {
                      const stock = stocks.find((s) => s.ticker === sig.ticker);
                      const entryPrice = stock?.price || sig.entryPrice;
                      const breakoutLevel = stock?.pivotBreakout || sig.breakoutLevel;
                      const invalidationLevel = stock?.invalidation || sig.invalidationLevel;
                      const target1 = stock?.target1 || sig.target1;
                      const potentialGain = Math.round(((target1 - entryPrice) / (entryPrice || 1)) * 1000) / 10;

                      return (
                        <div
                          key={sig.id}
                          className="py-2 px-4 flex items-center justify-between text-xs hover:bg-[#f6f2ea] dark:hover:bg-[#121c20] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <b
                              onClick={() => {
                                setSelectedTicker(sig.ticker);
                                setTopMode('analysis');
                              }}
                              className="font-black text-sm cursor-pointer hover:underline w-16"
                            >
                              {sig.ticker}
                            </b>
                            <span className="font-bold w-16 font-mono">{formatRp(entryPrice)}</span>
                            <span className="text-[#1d7a5c] font-bold w-12">+{potentialGain}%</span>
                            <span className="text-[#80887f] hidden md:inline truncate max-w-[180px]">{sig.name}</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-[#80887f] hidden sm:inline">
                              BO: <b>{formatRp(breakoutLevel)}</b>
                            </span>
                            <span className="text-[#c4554a] hidden sm:inline">
                              Inv: <b>{formatRp(invalidationLevel)}</b>
                            </span>
                            <span className="text-[#1d7a5c] hidden sm:inline">
                              TP: <b>{formatRp(target1)}</b>
                            </span>
                          <span className="font-bold">{sig.recommendedLot} Lot</span>
                          <button
                            onClick={() => {
                              setSelectedTicker(sig.ticker);
                              setTopMode('analysis');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-[#d6ccbb] hover:bg-[#efe9dd] cursor-pointer font-bold"
                          >
                            Grafik
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------
              VIEW: ANALYSIS SAHAM (Exact replica of Screenshot 2)
             -------------------------------------------------------- */}
          {topMode === 'analysis' && currentStock && (
            <div className="space-y-4">
              {/* Top Stock Details Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setTopMode('overview')}
                    className="flex items-center gap-1.5 text-xs text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] cursor-pointer font-bold transition-colors"
                  >
                    <span>‹</span>
                    <span>Analysis Saham</span>
                  </button>

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h1 className="font-sans text-3xl font-black tracking-tight">{currentStock.ticker}</h1>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1d7a5c]/10 text-[#1d7a5c]">
                      Konfirmasi baru
                    </span>
                    <span className="font-sans text-3xl font-black">{formatRp(currentStock.price)}</span>
                    <span className="text-sm font-bold text-[#1d7a5c]">
                      +{currentStock.changePercent}%
                    </span>
                    <span className="text-xs text-[#80887f]">
                      O {formatRp(currentStock.open)} H {formatRp(currentStock.high)} L {formatRp(currentStock.low)} C {formatRp(currentStock.price)}
                    </span>
                    <span className="text-xs text-[#80887f]">
                      Volume 6 Nov <b>{formatRp(currentStock.volume)} lot</b>
                    </span>
                  </div>

                  <p className="text-xs text-[#56625f]">
                    {currentStock.name} · Indeks Tidak masuk 10 indeks yang dipantau
                  </p>
                  <p className="text-[11px] text-[#80887f]">
                    Papan Utama · Sektor {currentStock.sector} · Sinyal ▲ Pullback 28 Okt, ▲ Pullback 30 Okt, ◆ HAKA 6 Nov · Level ATR dari candle terakhir
                  </p>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Harga Realtime BEI (IDX:{currentStock.ticker})</span>
                    </span>
                    <button
                      onClick={() => handleSyncCurrentStockLiveBei(currentStock.ticker)}
                      disabled={isSyncingLiveBei}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#efe9dd] dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] hover:bg-[#e5ddd0] dark:hover:bg-[#26363d] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Sinkronkan Harga Saham Langsung dengan Bursa Efek Indonesia"
                    >
                      <span className={isSyncingLiveBei ? 'animate-spin' : ''}>🔄</span>
                      <span>{isSyncingLiveBei ? 'Menghubungkan BEI...' : 'Sinkron Realtime BEI'}</span>
                    </button>
                    {liveBeiNotice && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {liveBeiNotice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Actions: Pantau + Stock switcher < 1 dari 32 > */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleWatchlist(currentStock.ticker)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      watchlist.includes(currentStock.ticker)
                        ? 'bg-amber-500 text-white'
                        : 'bg-[#1d7a5c] text-white hover:opacity-90'
                    }`}
                  >
                    <span>{watchlist.includes(currentStock.ticker) ? '★' : '☆'}</span>
                    <span>{watchlist.includes(currentStock.ticker) ? 'Dipantau' : 'Pantau'}</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs border border-[#d6ccbb] dark:border-[#304349] rounded-xl px-2 py-1 bg-white dark:bg-[#1a2a30]">
                    <button onClick={handlePrevStock} className="cursor-pointer font-bold px-1 hover:text-[#1d7a5c]">
                      ‹
                    </button>
                    <span className="px-1.5 text-[#80887f] font-semibold">
                      {currentStockIndex} dari {stocks.length}
                    </span>
                    <button onClick={handleNextStock} className="cursor-pointer font-bold px-1 hover:text-[#1d7a5c]">
                      ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtabs matching Screenshot 2: Grafik, Fundamental, Teknikal, Sinyal & Level, Arus Dana, Kepemilikan */}
              <div className="flex items-center gap-2 border-b border-[#e5ddd0] dark:border-[#26363d] pb-2 text-xs font-semibold overflow-x-auto">
                {[
                  { key: 'grafik', label: 'Grafik' },
                  { key: 'fundamental', label: 'Fundamental' },
                  { key: 'teknikal', label: 'Teknikal' },
                  { key: 'sinyal', label: 'Sinyal & Level' },
                  { key: 'arusdana', label: 'Arus Dana' },
                  { key: 'kepemilikan', label: 'Kepemilikan' },
                ].map((tb) => (
                  <button
                    key={tb.key}
                    onClick={() => setChartSubtab(tb.key as any)}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      chartSubtab === tb.key
                        ? 'bg-white dark:bg-[#1a2a30] text-[#17242a] dark:text-[#f3eee4] shadow-xs font-bold border border-[#d6ccbb] dark:border-[#304349]'
                        : 'text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4]'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* SUBTAB CONTENT: GRAFIK */}
              {chartSubtab === 'grafik' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Chart Canvas */}
                  <div className="lg:col-span-2 space-y-3">
                    {/* Live Candlestick BEI / IDX with technical analysis tools automatically attached (No TradingView) */}
                    <LiveBeiCandlestickChart
                      stock={currentStock}
                      theme={theme}
                      onSyncLive={() => handleSyncCurrentStockLiveBei(currentStock.ticker)}
                      isSyncing={isSyncingLiveBei}
                    />

                    {liveBeiNotice && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-[#1d7a5c] dark:text-emerald-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#1d7a5c] animate-ping"></span>
                          <span>{liveBeiNotice}</span>
                        </div>
                        <span className="text-[10px] text-[#80887f]">Jakarta Time (WIB)</span>
                      </div>
                    )}
                  </div>

                  {/* Right 1 Col: Status Card, Trade Plan, Checklist, Tools */}
                  <div className="space-y-4">
                    {/* Status Card: Sinyal Saham Membaca Grafik Hari Ini */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1d7a5c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            ✓
                          </div>
                          <div>
                            <b className="text-base font-bold block leading-tight text-[#17242a] dark:text-[#f3eee4]">
                              {currentStock.price >= currentStock.pivotBreakout
                                ? '⚡ Konfirmasi Breakout Hari Ini'
                                : currentStock.price >= currentStock.ma20
                                ? '🔄 Pullback Sehat Terkonfirmasi'
                                : '⏳ Menguji Level Support Hari Ini'}
                            </b>
                            <span className="text-[11px] text-[#56625f]">
                              Membaca grafik hari ini ({new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })})
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1d7a5c]/10 text-[#1d7a5c] border border-[#1d7a5c]/20">
                          Live Chart
                        </span>
                      </div>

                      <p className="text-xs text-[#56625f] leading-relaxed">
                        {currentStock.price >= currentStock.pivotBreakout
                          ? `Candle hari ini berhasil menembus batas pivot Rp ${formatRp(currentStock.pivotBreakout)}. Sinyal breakout terkonfirmasi aktif!`
                          : currentStock.price >= currentStock.ma20
                          ? `Pullback tertahan rapi di atas MA20 (Rp ${formatRp(currentStock.ma20)}). Siap uji breakout di Rp ${formatRp(currentStock.pivotBreakout)}.`
                          : `Harga menguji level support Rp ${formatRp(currentStock.support)}. Waspadai batas invalidasi Rp ${formatRp(currentStock.invalidation)}.`}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-500/20">
                          ▲ {currentStock.changePercent >= 0 ? '+' : ''}{currentStock.changePercent}% Hari Ini
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold text-[11px] border border-cyan-500/20">
                          ⚡ Pivot {formatRp(currentStock.pivotBreakout)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold text-[11px] border border-purple-500/20">
                          📐 VCP {currentStock.vcpStatus || 'Ketat'}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Boxes: Risiko ke invalidasi & Momentum Hari Ini */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xs">
                        <span className="text-[11px] text-[#80887f] block font-semibold">
                          Risiko ke invalidasi ⓘ
                        </span>
                        <b className="text-xl font-black text-rose-600 dark:text-rose-400 block mt-1">
                          {Math.abs(Math.round(((currentStock.price - currentStock.invalidation) / (currentStock.price || 1)) * 1000) / 10)}%
                        </b>
                        <span className="text-[10px] text-[#80887f]">Cut loss di {formatRp(currentStock.invalidation)}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xs">
                        <span className="text-[11px] text-[#80887f] block font-semibold">
                          Momentum Hari Ini
                        </span>
                        <b className="text-xl font-black text-[#1d7a5c] block mt-1">
                          {currentStock.momentumScore !== undefined
                            ? (currentStock.momentumScore >= 0 ? '+' : '') + currentStock.momentumScore + '%'
                            : (currentStock.changePercent >= 0 ? '+' : '') + currentStock.changePercent + '%'}
                        </b>
                        <span className="text-[10px] text-[#1d7a5c] font-semibold">
                          Pangkat: {currentStock.momentumRank || 'Kuat'}
                        </span>
                      </div>
                    </div>

                    {/* Trade Plan (Membaca Grafik Hari Ini) Card */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xs space-y-3">
                      <b className="text-sm font-bold flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#1d7a5c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span>Trade Plan Membaca Grafik Hari Ini</span>
                      </b>

                      <div className="grid grid-cols-4 gap-2 text-center py-2 px-1 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] text-xs">
                        <div>
                          <span className="text-[10px] text-[#80887f] block">Breakout</span>
                          <b className="block font-bold">{formatRp(currentStock.pivotBreakout)}</b>
                          <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-semibold">
                            {currentStock.price >= currentStock.pivotBreakout ? 'Tembus' : 'Batas'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#c4554a] block font-semibold">Invalidasi</span>
                          <b className="block font-bold text-[#c4554a]">{formatRp(currentStock.invalidation)}</b>
                          <span className="text-[9px] text-[#c4554a]">
                            -{Math.abs(Math.round(((currentStock.price - currentStock.invalidation) / (currentStock.price || 1)) * 1000) / 10)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#1d7a5c] block font-semibold">Target 1</span>
                          <b className="block font-bold text-[#1d7a5c]">{formatRp(currentStock.target1)}</b>
                          <span className="text-[9px] text-[#1d7a5c]">
                            +{Math.round(((currentStock.target1 - currentStock.price) / (currentStock.price || 1)) * 1000) / 10}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#80887f] block">Lot</span>
                          <b className="block font-bold text-base">
                            {Math.max(1, Math.floor(500000 / (Math.max(1, currentStock.price - currentStock.invalidation) * 100)))}
                          </b>
                          <span className="text-[9px] text-[#80887f]">risiko 1%</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#80887f]">
                        Target bertahap: TP1 {formatRp(currentStock.target1)} · TP2 {formatRp(currentStock.target2)}. Rasio R:R = 1 : {((currentStock.target1 - currentStock.price) / Math.max(1, currentStock.price - currentStock.invalidation)).toFixed(1)}.
                      </p>

                      <button
                        onClick={() => openLotCalculator(currentStock)}
                        className="w-full py-2.5 rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold text-xs hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer text-center transition-colors"
                      >
                        Hitung lot (Kalkulator Risiko)
                      </button>
                    </div>

                    {/* Checklist Accordion: Membaca Grafik Hari Ini */}
                    <div
                      onClick={() => setChecklistOpen(!checklistOpen)}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex items-center justify-between cursor-pointer hover:bg-[#efe9dd]/50"
                    >
                      <b className="text-xs font-bold flex items-center gap-2">
                        <span>☑</span> Checklist Grafik Hari Ini ({currentStock.ticker})
                      </b>
                      <span className="text-sm font-bold text-[#80887f]">{checklistOpen ? '∧' : '›'}</span>
                    </div>

                    {checklistOpen && (
                      <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] text-xs space-y-2 border border-[#e5ddd0] dark:border-[#26363d]">
                        <div className={`flex items-center gap-2 font-semibold ${currentStock.ma50 >= currentStock.ma200 ? 'text-[#1d7a5c]' : 'text-[#80887f]'}`}>
                          <span>{currentStock.ma50 >= currentStock.ma200 ? '✓' : '○'}</span>
                          <span>MA50 &gt; MA200 (Uptrend Primer Kuat)</span>
                        </div>
                        <div className={`flex items-center gap-2 font-semibold ${currentStock.price >= currentStock.ma20 ? 'text-[#1d7a5c]' : 'text-rose-500'}`}>
                          <span>{currentStock.price >= currentStock.ma20 ? '✓' : '✗'}</span>
                          <span>Pullback Sehat bertahan di atas MA20 ({formatRp(currentStock.ma20)})</span>
                        </div>
                        <div className={`flex items-center gap-2 font-semibold ${currentStock.vcpStatus !== 'Tidak Ada' ? 'text-[#1d7a5c]' : 'text-[#80887f]'}`}>
                          <span>{currentStock.vcpStatus !== 'Tidak Ada' ? '✓' : '○'}</span>
                          <span>Kontraksi VCP {currentStock.vcpStatus || 'Ketat'} ({currentStock.vcpContraction || 'Menyempit'})</span>
                        </div>
                        <div className={`flex items-center gap-2 font-semibold ${currentStock.volume >= currentStock.frequencyAvg20 * 8 || currentStock.changePercent > 0 ? 'text-[#1d7a5c]' : 'text-[#80887f]'}`}>
                          <span>{currentStock.volume >= currentStock.frequencyAvg20 * 8 || currentStock.changePercent > 0 ? '✓' : '○'}</span>
                          <span>Volume Konfirmasi Hari Ini ({formatCompact(currentStock.volume)} lembar)</span>
                        </div>
                        <div className={`flex items-center gap-2 font-semibold ${currentStock.netForeign > 0 ? 'text-[#1d7a5c]' : 'text-[#80887f]'}`}>
                          <span>{currentStock.netForeign > 0 ? '✓' : '○'}</span>
                          <span>Akumulasi Asing Net Foreign (+Rp{(Math.abs(currentStock.netForeign)/1e9).toFixed(1)} M)</span>
                        </div>
                      </div>
                    )}

                    {/* Tools Analisis Cepat */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xs space-y-3">
                      <b className="text-xs font-bold flex items-center gap-1.5 text-[#56625f]">
                        <span>✎</span> Tools Analisis Cepat
                      </b>

                      <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-bold">
                        {[
                          { id: 'sr', label: 'S/R', icon: '≂' },
                          { id: 'tl', label: 'Trendline', icon: '↗' },
                          { id: 'pattern', label: 'Pattern', icon: 'M' },
                          { id: 'vcp', label: 'VCP', icon: 'W' },
                          { id: 'fibo', label: 'Fibonacci', icon: '≡' },
                        ].map((tl) => (
                          <button
                            key={tl.id}
                            onClick={() => setActiveAnalysisTool(tl.id)}
                            className={`p-2 rounded-xl border border-[#d6ccbb] dark:border-[#304349] hover:bg-[#efe9dd] dark:hover:bg-[#121c20] cursor-pointer flex flex-col items-center gap-1 ${
                              activeAnalysisTool === tl.id ? 'bg-[#1d7a5c] text-white' : ''
                            }`}
                          >
                            <span className="text-base leading-none">{tl.icon}</span>
                            <span className="text-[10px]">{tl.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB CONTENT: FUNDAMENTAL */}
              {chartSubtab === 'fundamental' && (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-4">
                  <h3 className="font-serif text-xl font-bold">Profil &amp; Rasio Fundamental ({currentStock.ticker})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block font-semibold">PER (Price to Earnings)</span>
                      <b className="text-lg font-black block mt-1">11.8x</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block font-semibold">PBV (Price to Book)</span>
                      <b className="text-lg font-black block mt-1">1.9x</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block font-semibold">ROE (Return on Equity)</span>
                      <b className="text-lg font-black text-[#1d7a5c] block mt-1">18.4%</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block font-semibold">DER (Debt to Equity)</span>
                      <b className="text-lg font-black block mt-1">0.65x</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block font-semibold">Dividend Yield</span>
                      <b className="text-lg font-black text-[#1d7a5c] block mt-1">5.2%</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block font-semibold">Net Profit Margin</span>
                      <b className="text-lg font-black block mt-1">21.8%</b>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB CONTENT: TEKNIKAL */}
              {chartSubtab === 'teknikal' && (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-4">
                  <h3 className="font-serif text-xl font-bold">Ringkasan Indikator Teknikal ({currentStock.ticker})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block">RSI (14 Hari)</span>
                      <b className="text-lg font-black text-[#1d7a5c]">64.2 (Bullish Neutral)</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block">MACD (12, 26, 9)</span>
                      <b className="text-lg font-black text-[#1d7a5c]">Golden Cross (+14.2)</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block">Stochastic (14, 3, 3)</span>
                      <b className="text-lg font-black text-[#2f679e]">72 / 68 (Uptrend)</b>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20]">
                      <span className="text-[10px] text-[#80887f] block">ATR (14 Hari)</span>
                      <b className="text-lg font-black">Rp185 (Volatilitas Sedang)</b>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB CONTENT: SINYAL & LEVEL */}
              {chartSubtab === 'sinyal' && (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-4">
                  <h3 className="font-serif text-xl font-bold">Alur Sinyal &amp; Level Acuan ({currentStock.ticker})</h3>
                  <div className="p-4 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#80887f]">Tahap 01 (Pullback):</span>
                      <b className="text-[#c4554a]">Terdeteksi 28 Oktober 2026</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#80887f]">Tahap 02 (Menunggu HAKA):</span>
                      <b className="text-[#a86f1c]">Candle Bullish 30 Oktober 2026</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#80887f]">Tahap 03 (Terkonfirmasi):</span>
                      <b className="text-[#1d7a5c]">Lolos Konfirmasi 6 November 2026</b>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB CONTENT: ARUS DANA */}
              {chartSubtab === 'arusdana' && (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-4">
                  <h3 className="font-serif text-xl font-bold">Arus Dana &amp; Net Foreign ({currentStock.ticker})</h3>
                  <div className="p-4 rounded-xl bg-[#1d7a5c]/10 border border-[#1d7a5c]/30 text-xs flex justify-between items-center">
                    <div>
                      <b className="text-base text-[#1d7a5c] block">
                        Net Foreign: +Rp{(currentStock.netForeign / 1000000000).toFixed(1)} Miliar
                      </b>
                      <span className="text-[#56625f]">Akumulasi asing terdeteksi selama 3 hari bursa berturut-turut.</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#1d7a5c] text-white font-bold text-xs">
                      Big Accumulation
                    </span>
                  </div>
                </div>
              )}

              {/* SUBTAB CONTENT: KEPEMILIKAN */}
              {chartSubtab === 'kepemilikan' && (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-4">
                  <h3 className="font-serif text-xl font-bold">Daftar Pemegang Saham &gt; 5% ({currentStock.ticker})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#e5ddd0] text-[#80887f] font-bold">
                          <th className="py-2 px-3">Nama Pemegang Saham</th>
                          <th className="py-2 px-3 text-right">Persentase</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5ddd0]">
                        {currentStock.shareholders &&
                          currentStock.shareholders.map((sh, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 font-bold">{sh.name}</td>
                              <td className="py-2.5 px-3 text-right font-black text-sm text-[#1d7a5c]">
                                {sh.percentage}%
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------
              ALL OTHER VIEWS FROM SIDEBAR MENU
             -------------------------------------------------------- */}
          {topMode === 'overview' && sidebarMenu === 'peta' && (
            <MarketHeatmap
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'rotasi' && (
            <SectorRotation
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && (sidebarMenu === 'aliran' || sidebarMenu === 'moneyflow') && (
            <MoneyFlowView
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'freq' && (
            <FrequencyAnalyzerView
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'indeks' && <IndicesView />}

          {topMode === 'overview' && sidebarMenu === 'konglomerat' && (
            <ConglomeratesView
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'vcp' && (
            <VcpView
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'pemegang' && (
            <ShareholdersView
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'orangdalam' && (
            <InsiderTransactionsView
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'corpaction' && (
            <CorporateActionsView
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'hsc' && (
            <HscView
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'fundamental' && (
            <MarketFundamentalsView
              stocks={stocks}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'kalkulator' && (
            <LotCalculatorView
              stocks={stocks}
              onAddJournal={onAddJournal}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'jurnal' && (
            <TradingJournalView
              journal={journal}
              stocks={stocks}
              onAddJournal={onAddJournal}
              onSelectStock={(t) => {
                setSelectedTicker(t);
                setTopMode('analysis');
              }}
            />
          )}

          {topMode === 'overview' && sidebarMenu === 'faq' && (
            <FaqHelpView faq={faq} onOpenVideo={() => setSidebarMenu('video')} />
          )}

          {topMode === 'overview' && sidebarMenu === 'video' && (
            <TutorialVideosView videos={videos} />
          )}
        </main>

        {/* ========================================================
            MOBILE BOTTOM NAVIGATION BAR (Matching Screenshot 3)
           ======================================================== */}
        <nav className="md:hidden sticky bottom-0 z-40 bg-[#fbf9f4]/95 dark:bg-[#152227]/95 backdrop-blur-md border-t border-[#e5ddd0] dark:border-[#26363d] px-2 py-2 flex items-center justify-around text-[10px] font-bold">
          <button
            onClick={() => {
              setSidebarMenu('beranda');
              setTopMode('overview');
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${
              sidebarMenu === 'beranda' ? 'text-[#1d7a5c]' : 'text-[#80887f]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>Beranda</span>
          </button>

          <button
            onClick={() => {
              setSidebarMenu('sinyal');
              setTopMode('overview');
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${
              sidebarMenu === 'sinyal' ? 'text-[#1d7a5c]' : 'text-[#80887f]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span>Sinyal</span>
          </button>

          <button
            onClick={() => setMobileDataMenuOpen(true)}
            className="flex flex-col items-center gap-1 cursor-pointer text-[#80887f]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Analisa &amp; Data</span>
          </button>

          <button
            onClick={() => {
              setSidebarMenu('kalkulator');
              setTopMode('overview');
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${
              sidebarMenu === 'kalkulator' ? 'text-[#1d7a5c]' : 'text-[#80887f]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
            </svg>
            <span>Kalkulator</span>
          </button>

          <button
            onClick={() => setAccountModalOpen(true)}
            className="flex flex-col items-center gap-1 cursor-pointer text-[#80887f]"
          >
            <div className="w-5 h-5 rounded-full bg-[#1d7a5c] text-white flex items-center justify-center text-[9px]">
              {user?.email?.slice(0, 1).toUpperCase() || 'U'}
            </div>
            <span>Akun</span>
          </button>
        </nav>
      </div>

      {/* ========================================================
          MODALS & DRAWERS
         ======================================================== */}

      {/* 1. FILTER & URUTKAN MODAL */}
      {filterDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setFilterDrawerOpen(false)}
        >
          <div
            className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd0] dark:border-[#26363d]">
              <b className="font-serif text-lg font-bold">Filter &amp; Urutkan Sinyal</b>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-8 h-8 rounded-full border border-[#e5ddd0] flex items-center justify-center font-bold text-xs hover:bg-[#efe9dd] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#56625f] block mb-1.5">Sektor Saham</label>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold"
                >
                  <option value="all">Semua Sektor (11 Sektor)</option>
                  <option value="financials">Financials / Perbankan</option>
                  <option value="energy">Energy &amp; Tambang</option>
                  <option value="basic materials">Basic Materials</option>
                  <option value="infrastructure">Infrastructure &amp; Telco</option>
                  <option value="consumer">Consumer Non-Cyclicals</option>
                  <option value="technology">Technology</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#56625f] block mb-1.5">Minimal Nilai Transaksi Harian (Likuiditas)</label>
                <div className="grid grid-cols-4 gap-2 font-bold text-center">
                  {(['all', '1m', '5m', '10m'] as const).map((lq) => (
                    <button
                      key={lq}
                      onClick={() => setFilterLiquidity(lq)}
                      className={`p-2 rounded-xl border border-[#d6ccbb] dark:border-[#304349] cursor-pointer ${
                        filterLiquidity === lq ? 'bg-[#1d7a5c] text-white' : 'hover:bg-[#efe9dd]'
                      }`}
                    >
                      {lq === 'all' ? 'Semua' : `> ${lq.toUpperCase()}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#56625f] block mb-1.5">Urutkan Berdasarkan</label>
                <div className="grid grid-cols-2 gap-2 font-bold">
                  {[
                    { id: 'momentum', label: 'Momentum Tertinggi' },
                    { id: 'gain', label: 'Target Gain Terbesar' },
                    { id: 'risk', label: 'Risiko Terkecil' },
                    { id: 'volume', label: 'Volume Transaksi' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id as any)}
                      className={`p-2.5 rounded-xl border border-[#d6ccbb] dark:border-[#304349] cursor-pointer ${
                        sortBy === s.id ? 'bg-[#17242a] dark:bg-[#f3eee4] text-white dark:text-[#17242a]' : 'hover:bg-[#efe9dd]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setFilterSector('all');
                    setFilterLiquidity('all');
                    setSortBy('momentum');
                  }}
                  className="w-1/3 py-2.5 rounded-xl border border-[#d6ccbb] font-bold text-xs hover:bg-[#efe9dd] cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="w-2/3 py-2.5 rounded-xl bg-[#1d7a5c] text-white font-bold text-xs hover:opacity-90 cursor-pointer shadow-sm"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. S&K (SYARAT & KETENTUAN) MODAL */}
      {termsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setTermsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd0] dark:border-[#26363d]">
              <b className="font-serif text-lg font-bold">Syarat &amp; Ketentuan (S&amp;K)</b>
              <button
                onClick={() => setTermsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#e5ddd0] flex items-center justify-center font-bold text-xs hover:bg-[#efe9dd] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#56625f] leading-relaxed">
              <p>
                <b>1. Bukan Nasihat Keuangan:</b> Seluruh data, sinyal kalkulasi, dan grafik di aplikasi Penyembuh Luka disediakan untuk tujuan edukasi dan analisa teknikal objektif. Ini bukan ajakan atau rekomendasi untuk membeli atau menjual efek tertentu.
              </p>
              <p>
                <b>2. Manajemen Risiko:</b> Keputusan investasi sepenuhnya ada di tangan pengguna. Pengguna wajib menerapkan batasan risiko dan money management yang disiplin.
              </p>
              <p>
                <b>3. Satu Akun Satu Pengguna:</b> Sesuai kebijakan keamanan, setiap email akun diperuntukkan bagi satu pengguna aktif demi menjaga integritas data dan sesi jurnal portofolio.
              </p>
              <p>
                <b>4. Keterlambatan Data Pasar:</b> Data bursa disajikan dengan delay standar dan algoritma simulasi matematis untuk tujuan latihan analisa price action.
              </p>
            </div>

            <button
              onClick={() => setTermsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#17242a] dark:bg-[#f3eee4] text-white dark:text-[#17242a] font-bold text-xs cursor-pointer"
            >
              Saya Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}

      {/* 3. MOBILE DATA MENU DRAWER */}
      {mobileDataMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs"
          onClick={() => setMobileDataMenuOpen(false)}
        >
          <div
            className="w-full max-h-[75vh] overflow-y-auto p-6 rounded-t-3xl bg-white dark:bg-[#1a2a30] border-t border-[#e5ddd0] dark:border-[#26363d] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e5ddd0] dark:border-[#26363d]">
              <b className="font-serif text-base font-bold">Pilih Fitur Analisa &amp; Data</b>
              <button
                onClick={() => setMobileDataMenuOpen(false)}
                className="w-7 h-7 rounded-full border border-[#e5ddd0] flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'peta', label: 'Peta saham' },
                { id: 'rotasi', label: 'Rotasi sektor' },
                { id: 'aliran', label: 'Aliran dana' },
                { id: 'moneyflow', label: 'Money Flow Tracker' },
                { id: 'freq', label: 'Frequency Analyzer' },
                { id: 'indeks', label: 'Indeks saham' },
                { id: 'konglomerat', label: 'Grup konglomerat' },
                { id: 'vcp', label: 'VCP' },
                { id: 'pemegang', label: 'Pemegang saham' },
                { id: 'orangdalam', label: 'Transaksi orang dalam' },
                { id: 'corpaction', label: 'Corporate action' },
                { id: 'hsc', label: 'Saham HSC' },
                { id: 'fundamental', label: 'Fundamental pasar' },
                { id: 'jurnal', label: 'Jurnal trading' },
                { id: 'faq', label: 'FAQ & Cara pakai' },
                { id: 'video', label: 'Video tutorial' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSidebarMenu(m.id);
                    setTopMode('overview');
                    setMobileDataMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] font-bold text-left cursor-pointer hover:bg-[#efe9dd]"
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. LOT CALCULATOR POPUP MODAL */}
      {lotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setLotModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <b className="font-serif text-lg font-bold block">
                  Kalkulator Lot &amp; Risiko ({lotModalStock?.ticker || currentStock?.ticker})
                </b>
                <span className="text-xs text-[#80887f]">
                  Hitung ukuran posisi optimal dari modal dan jarak ke batas invalidasi.
                </span>
              </div>
              <button
                onClick={() => setLotModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#e5ddd0] flex items-center justify-center font-bold text-xs hover:bg-[#efe9dd] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#56625f] block mb-1">Modal Trading Portofolio (Rp)</label>
                <input
                  type="number"
                  step="1000000"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] font-bold text-base"
                />
              </div>

              <div>
                <label className="font-bold text-[#56625f] block mb-1">
                  Toleransi Risiko per Trade: <b className="text-[#1d7a5c]">{riskPercent}%</b>
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

              <div className="p-4 rounded-2xl bg-[#1d7a5c]/10 border border-[#1d7a5c]/30 text-center space-y-1">
                <span className="text-xs font-semibold text-[#1d7a5c] uppercase">Ukuran Rekomendasi</span>
                <b className="font-sans text-4xl font-black text-[#1d7a5c] block">
                  {calculatedPosition.lots} LOT
                </b>
                <p className="text-xs text-[#56625f]">
                  Total Nilai Beli: <b>Rp{calculatedPosition.totalBuyRp.toLocaleString('id-ID')}</b> ({calculatedPosition.allocPercent.toFixed(1)}% modal)
                </p>
                <p className="text-[11px] text-[#c4554a] font-semibold">
                  Maksimal Rugi jika Invalidasi: Rp{calculatedPosition.maxRiskRp.toLocaleString('id-ID')}
                </p>
              </div>

              {calcNotice && (
                <div className="p-2 text-center text-xs font-bold text-[#1d7a5c] bg-[#1d7a5c]/15 rounded-xl">
                  {calcNotice}
                </div>
              )}

              <button
                onClick={handleSaveToJournal}
                className="w-full py-3 rounded-xl bg-[#17242a] dark:bg-[#f3eee4] text-white dark:text-[#17242a] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                + Simpan Rencana ke Jurnal Trading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMMAND PALETTE (CTRL+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        stocks={stocks}
        signals={signals}
        onSelectStock={(t) => {
          setSelectedTicker(t);
          setTopMode('analysis');
        }}
        onNavigateMenu={(menuKey) => {
          setSidebarMenu(menuKey);
          setTopMode('overview');
        }}
      />

      {/* 6. ACCOUNT MODAL */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        user={user}
        onLogout={onLogout}
        onNavigateToPlans={onNavigateToPlans}
      />

      {/* 7. ADMIN CMS MODAL */}
      {adminCmsOpen && (
        <AdminCMS
          stocks={stocks}
          signals={signals}
          plans={plans}
          videos={videos}
          faq={faq}
          users={users}
          marketStatus={marketStatus}
          onTriggerTick={onTriggerTick}
          onRefreshData={onRefreshData}
          onClose={() => setAdminCmsOpen(false)}
        />
      )}

      {/* 8. TICKER BERJALAN KEBAWAH: SAHAM REALTIME SELURUH DUNIA */}
      {showGlobalTicker && (
        <div className="fixed bottom-4 right-4 z-40 shadow-2xl transition-all">
          <GlobalVerticalTicker
            isFloating={true}
            onClose={() => setShowGlobalTicker(false)}
          />
        </div>
      )}
    </div>
  );
};

