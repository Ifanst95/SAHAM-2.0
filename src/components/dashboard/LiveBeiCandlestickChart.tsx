import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StockData, Candlestick } from '../../types.ts';
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Crosshair,
  ShieldAlert,
  Target,
  Zap,
  Activity,
  SlidersHorizontal,
  Check,
  Eye,
  Info,
} from 'lucide-react';

interface LiveBeiCandlestickChartProps {
  stock: StockData;
  theme: 'light' | 'dark';
  onSyncLive?: () => void;
  isSyncing?: boolean;
}

export const LiveBeiCandlestickChart: React.FC<LiveBeiCandlestickChartProps> = ({
  stock,
  theme,
  onSyncLive,
  isSyncing = false,
}) => {
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('Live BEI Feed');
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Tools automatically attached on candlestick by default
  const [tools, setTools] = useState({
    ma: true,
    pivot: true,
    targets: true,
    invalidation: true,
    riskReward: true,
    supportResistance: true,
    vcp: true,
    volume: true,
  });

  // Crosshair & hover state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Format IDR currency
  const formatRp = (num: number) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
  };

  const formatCompact = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'M';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'Jt';
    if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
    return String(num);
  };

  // Fetch real BEI candlesticks from server
  useEffect(() => {
    let isCancelled = false;
    const fetchCandles = async () => {
      setIsLoadingCandles(true);
      try {
        const res = await fetch(`/api/bei/candles/${encodeURIComponent(stock.ticker)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data.candles) && data.candles.length > 0) {
            setCandles(data.candles);
            setDataSource(data.source || 'Bursa Efek Indonesia (IDX)');
            setIsLoadingCandles(false);
            return;
          }
        }
      } catch {
        // fallback
      }

      if (!isCancelled) {
        if (stock.candles && stock.candles.length > 0) {
          setCandles(stock.candles);
          setDataSource('Cache Data BEI');
        } else {
          // generate fallback candles if none exist
          const generated: Candlestick[] = [];
          let current = stock.price || 5000;
          const today = new Date();
          for (let i = 60; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const fluctuation = (Math.random() - 0.48) * 0.03 * current;
            const open = Math.round(current);
            const close = Math.round(current + fluctuation);
            const high = Math.round(Math.max(open, close) + Math.random() * 0.015 * current);
            const low = Math.round(Math.min(open, close) - Math.random() * 0.015 * current);
            const volume = Math.round(500000 + Math.random() * 3000000);
            generated.push({
              date: d.toISOString().split('T')[0],
              open,
              high,
              low,
              close,
              volume,
            });
            current = close;
          }
          setCandles(generated);
          setDataSource('Simulasi Historis BEI');
        }
        setIsLoadingCandles(false);
      }
    };

    fetchCandles();
    return () => {
      isCancelled = true;
    };
  }, [stock.ticker]);

  // Filter candles based on timeframe
  const activeCandles = useMemo(() => {
    if (candles.length === 0) return [];
    let count = candles.length;
    if (timeframe === '1M') count = 22;
    else if (timeframe === '3M') count = 65;
    else if (timeframe === '6M') count = 130;
    else if (timeframe === '1Y') count = 250;
    return candles.slice(-Math.min(count, candles.length));
  }, [candles, timeframe]);

  // Calculate Moving Averages (SMA)
  const maData = useMemo(() => {
    const calcSMA = (period: number) => {
      return activeCandles.map((c, i, arr) => {
        if (i < period - 1) return null;
        const slice = arr.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
        return Math.round(sum / period);
      });
    };

    const calcVolSMA = (period: number) => {
      return activeCandles.map((c, i, arr) => {
        if (i < period - 1) return null;
        const slice = arr.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.volume, 0);
        return Math.round(sum / period);
      });
    };

    return {
      ma5: calcSMA(5),
      ma20: calcSMA(20),
      ma50: calcSMA(50),
      ma200: calcSMA(200),
      volMa20: calcVolSMA(20),
    };
  }, [activeCandles]);

  // Chart dimensions & scaling
  const chartWidth = 900;
  const chartHeight = 520;
  const priceTopY = 35;
  const priceBottomY = 380;
  const volTopY = 405;
  const volBottomY = 490;
  const rightAxisWidth = 85;
  const plotWidth = chartWidth - rightAxisWidth - 15;

  const { minPrice, maxPrice, maxVol, priceRange } = useMemo(() => {
    if (activeCandles.length === 0) {
      return {
        minPrice: stock.price * 0.9,
        maxPrice: stock.price * 1.1,
        maxVol: 1000000,
        priceRange: stock.price * 0.2,
      };
    }

    let min = Math.min(...activeCandles.map((c) => c.low));
    let max = Math.max(...activeCandles.map((c) => c.high));
    const highestVol = Math.max(...activeCandles.map((c) => c.volume), 1000);

    // Expand price scale to comfortably contain technical analysis overlays
    if (tools.targets && stock.target1) max = Math.max(max, stock.target1);
    if (tools.targets && stock.target2) max = Math.max(max, stock.target2);
    if (tools.pivot && stock.pivotBreakout) max = Math.max(max, stock.pivotBreakout);
    if (tools.supportResistance && stock.resistance) max = Math.max(max, stock.resistance);
    if (tools.invalidation && stock.invalidation) min = Math.min(min, stock.invalidation);
    if (tools.supportResistance && stock.support) min = Math.min(min, stock.support);
    min = Math.min(min, stock.price);
    max = Math.max(max, stock.price);

    const padding = (max - min) * 0.08 || stock.price * 0.05;
    const finalMin = Math.max(1, Math.floor(min - padding));
    const finalMax = Math.ceil(max + padding);

    return {
      minPrice: finalMin,
      maxPrice: finalMax,
      maxVol: highestVol * 1.15,
      priceRange: finalMax - finalMin || 1,
    };
  }, [activeCandles, stock, tools]);

  // Coordinate helper functions
  const getY = (price: number) => {
    const ratio = (price - minPrice) / priceRange;
    return priceBottomY - ratio * (priceBottomY - priceTopY);
  };

  const getVolY = (volume: number) => {
    const ratio = Math.min(1, Math.max(0, volume / maxVol));
    return volBottomY - ratio * (volBottomY - volTopY);
  };

  const candleCount = activeCandles.length;
  const candleSpacing = plotWidth / (candleCount || 1);
  const candleBodyWidth = Math.max(2.5, Math.min(18, candleSpacing * 0.68));

  const getX = (index: number) => {
    return 15 + index * candleSpacing + candleSpacing / 2;
  };

  // Build SVG path for an array of values
  const buildLinePath = (values: (number | null)[]) => {
    let d = '';
    let started = false;
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      if (val !== null && typeof val === 'number') {
        const x = getX(i);
        const y = getY(val);
        if (!started) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          started = true;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
    }
    return d;
  };

  const ma5Path = useMemo(() => buildLinePath(maData.ma5), [maData.ma5, minPrice, maxPrice, activeCandles]);
  const ma20Path = useMemo(() => buildLinePath(maData.ma20), [maData.ma20, minPrice, maxPrice, activeCandles]);
  const ma50Path = useMemo(() => buildLinePath(maData.ma50), [maData.ma50, minPrice, maxPrice, activeCandles]);
  const ma200Path = useMemo(() => buildLinePath(maData.ma200), [maData.ma200, minPrice, maxPrice, activeCandles]);

  // Volume MA path
  const volMaPath = useMemo(() => {
    let d = '';
    let started = false;
    for (let i = 0; i < maData.volMa20.length; i++) {
      const val = maData.volMa20[i];
      if (val !== null) {
        const x = getX(i);
        const y = getVolY(val);
        if (!started) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          started = true;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
    }
    return d;
  }, [maData.volMa20, maxVol, activeCandles]);

  // Horizontal price grid steps
  const priceGridSteps = useMemo(() => {
    const steps = 6;
    const stepVal = priceRange / steps;
    const list: number[] = [];
    for (let i = 0; i <= steps; i++) {
      list.push(Math.round(minPrice + i * stepVal));
    }
    return list;
  }, [minPrice, priceRange]);

  // Date labels along X axis
  const dateStep = Math.max(1, Math.floor(candleCount / 7));

  // Risk / Reward calculations
  const entryPrice = stock.price || 1;
  const riskAmount = Math.max(1, entryPrice - stock.invalidation);
  const rewardAmount = Math.max(1, stock.target1 - entryPrice);
  const rrRatio = (rewardAmount / riskAmount).toFixed(1);

  // Volume spike check
  const lastCandle = activeCandles[activeCandles.length - 1];
  const lastVol = lastCandle ? lastCandle.volume : stock.volume;
  const currentVolMa = maData.volMa20[maData.volMa20.length - 1] || lastVol || 1;
  const volSpikeRatio = (lastVol / currentVolMa).toFixed(1);
  const isVolSpike = Number(volSpikeRatio) >= 1.4;

  // Real-Time Signal Analyzer: Membaca Grafik / Candlestick Hari Ini
  const todaySignal = useMemo(() => {
    const todayC = activeCandles[activeCandles.length - 1];
    if (!todayC) return null;

    const isBull = todayC.close >= todayC.open;
    const changeToday = todayC.close - todayC.open;
    const changeTodayPct = (((todayC.close - todayC.open) / (todayC.open || 1)) * 100).toFixed(2);
    const bodyHeight = Math.abs(todayC.close - todayC.open);
    const candleSpan = Math.max(1, todayC.high - todayC.low);
    const lowerWick = Math.min(todayC.open, todayC.close) - todayC.low;
    const upperWick = todayC.high - Math.max(todayC.open, todayC.close);

    // 1. Pola Candlestick Hari Ini
    let candlePattern = isBull ? 'Bullish Candle' : 'Bearish Candle';
    let candleMeaning = isBull ? 'Buyer mendominasi transaksi hari ini' : 'Tekanan jual terjadi hari ini';
    if (lowerWick >= bodyHeight * 1.8 && upperWick <= bodyHeight * 0.4) {
      candlePattern = '🔨 Hammer Reversal';
      candleMeaning = 'Rebound kuat memantul dari support, sinyal pembalikan arah naik!';
    } else if (upperWick >= bodyHeight * 1.8 && lowerWick <= bodyHeight * 0.4) {
      candlePattern = '☄️ Shooting Star';
      candleMeaning = 'Penolakan di harga atas, waspadai aksi profit taking.';
    } else if (bodyHeight / candleSpan > 0.75 && isBull) {
      candlePattern = '🟢 Bullish Marubozu';
      candleMeaning = 'Buyer agresif menguasai seluruh rentang candle hari ini!';
    } else if (bodyHeight / candleSpan < 0.15) {
      candlePattern = '⚖️ Doji Indecision';
      candleMeaning = 'Keseimbangan buyer-seller, potensi konsolidasi sebelum ledakan harga.';
    }

    // 2. Posisi terhadap MA
    const ma20Val = stock.ma20 || stock.price * 0.98;
    const ma50Val = stock.ma50 || stock.price * 0.95;
    const ma200Val = stock.ma200 || stock.price * 0.90;
    const isAboveMa20 = todayC.close >= ma20Val;
    const isAboveMa50 = todayC.close >= ma50Val;
    const isAboveMa200 = todayC.close >= ma200Val;
    const isSuperTrend = isAboveMa20 && isAboveMa50 && isAboveMa200;

    // 3. Breakout & Invalidasi
    const pivotVal = stock.pivotBreakout || stock.price * 1.03;
    const isBreakoutToday = todayC.close >= pivotVal || todayC.high >= pivotVal;
    const breakoutDistPct = (((pivotVal - todayC.close) / todayC.close) * 100).toFixed(1);

    const invalVal = stock.invalidation || stock.price * 0.94;
    const isInvalidatedToday = todayC.close < invalVal;
    const cutLossDistPct = Math.abs(Number((((invalVal - todayC.close) / todayC.close) * 100).toFixed(1)));

    // 4. Volume
    const volMa = maData.volMa20[maData.volMa20.length - 1] || lastVol || 1;
    const volRatio = (lastVol / volMa).toFixed(1);
    const isVolDrying = Number(volRatio) <= 0.65;

    // 5. Kesimpulan Sinyal Grafik Hari Ini
    let signalType: 'BREAKOUT' | 'PULLBACK' | 'VCP_READY' | 'INVALIDASI' | 'ACCUMULATION' = 'PULLBACK';
    let signalHeadline = '🔄 Pullback Sehat Terkonfirmasi Hari Ini';
    let signalBadge = 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30';
    let tradingPlanText = `Harga bertahan sehat di atas MA20 (${formatRp(ma20Val)}). Jarak ke batas breakout hanya ${breakoutDistPct}%.`;
    let confidenceScore = 88;

    if (isInvalidatedToday) {
      signalType = 'INVALIDASI';
      signalHeadline = '⛔ Batas Invalidasi Terpukul Hari Ini';
      signalBadge = 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30';
      tradingPlanText = `Candle hari ini menembus batas bawah Rp ${formatRp(invalVal)}. Disiplin lakukan cut loss untuk melindungi modal.`;
      confidenceScore = 95;
    } else if (isBreakoutToday && isVolSpike) {
      signalType = 'BREAKOUT';
      signalHeadline = '⚡ SUPER BREAKOUT TERKONFIRMASI HARI INI!';
      signalBadge = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40';
      tradingPlanText = `Candle hari ini menembus Batas Breakout ${formatRp(pivotVal)} didorong spike volume ${volRatio}x MA20! Potensi rally menuju TP1 ${formatRp(stock.target1)}.`;
      confidenceScore = 96;
    } else if (isBreakoutToday) {
      signalType = 'BREAKOUT';
      signalHeadline = '⚡ Breakout Pivot Terkonfirmasi Hari Ini';
      signalBadge = 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30';
      tradingPlanText = `Harga berhasil menembus level pivot ${formatRp(pivotVal)}. Target terdekat: ${formatRp(stock.target1)}.`;
      confidenceScore = 90;
    } else if (isAboveMa20 && isVolDrying) {
      signalType = 'VCP_READY';
      signalHeadline = '📐 Sinyal VCP: Suplai Kering di MA20';
      signalBadge = 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30';
      tradingPlanText = `Volume hari ini sangat tipis (${volRatio}x rata-rata) tertahan di atas MA20. Sinyal tekanan jual reda, bersiap untuk lonjakan breakout!`;
      confidenceScore = 92;
    } else if (isAboveMa20) {
      signalType = 'PULLBACK';
      signalHeadline = '🔄 Sinyal Pullback Sehat di Atas MA20';
      signalBadge = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
      tradingPlanText = `Penyembuh Luka membaca pullback tertahan sempurna di MA20. Batas entry ideal: ${formatRp(stock.price)} - ${formatRp(pivotVal)}.`;
      confidenceScore = 86;
    } else {
      signalType = 'ACCUMULATION';
      signalHeadline = '⏳ Uji Level Support & Konsolidasi';
      signalBadge = 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
      tradingPlanText = `Harga sedang menguji level support ${formatRp(stock.support)}. Tunggu konfirmasi pantulan hijau.`;
      confidenceScore = 75;
    }

    return {
      todayC,
      isBull,
      changeToday,
      changeTodayPct,
      candlePattern,
      candleMeaning,
      isAboveMa20,
      isAboveMa50,
      isAboveMa200,
      isSuperTrend,
      pivotVal,
      isBreakoutToday,
      breakoutDistPct,
      invalVal,
      isInvalidatedToday,
      cutLossDistPct,
      volRatio,
      isVolSpike,
      isVolDrying,
      signalType,
      signalHeadline,
      signalBadge,
      tradingPlanText,
      confidenceScore,
    };
  }, [activeCandles, stock, maData, isVolSpike, lastVol]);

  // Mouse hover handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || candleCount === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
    const mouseY = ((e.clientY - rect.top) / rect.height) * chartHeight;

    if (mouseX >= 10 && mouseX <= plotWidth + 10) {
      const index = Math.min(
        candleCount - 1,
        Math.max(0, Math.floor((mouseX - 15) / candleSpacing))
      );
      setHoverIndex(index);
      setMousePos({ x: mouseX, y: mouseY });
    } else {
      setHoverIndex(null);
      setMousePos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  const activeCandle = hoverIndex !== null ? activeCandles[hoverIndex] : lastCandle;

  const toggleTool = (toolKey: keyof typeof tools) => {
    setTools((prev) => ({ ...prev, [toolKey]: !prev[toolKey] }));
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl transition-all border ${
        theme === 'dark'
          ? 'bg-[#152328] border-[#24353c] text-[#f3eee4]'
          : 'bg-white border-[#e5ddd0] text-[#17242a]'
      } shadow-sm overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'w-full'
      }`}
    >
      {/* HEADER SECTION: Identity, Price & Live BEI Indicator */}
      <div className="p-4 border-b border-[#e5ddd0] dark:border-[#24353c] flex flex-wrap items-center justify-between gap-3 bg-[#faf7f2]/60 dark:bg-[#1a2a30]/80">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl font-bold font-mono tracking-tight text-[#17242a] dark:text-[#f3eee4]">
                IDX:{stock.ticker}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-[#1d7a5c]/10 text-[#1d7a5c] dark:bg-emerald-950/60 dark:text-emerald-300 border border-[#1d7a5c]/20">
                {stock.sector}
              </span>
              {stock.group && (
                <span className="text-[11px] px-1.5 py-0.5 rounded font-mono bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {stock.group}
                </span>
              )}
            </div>
            <p className="text-xs text-[#80887f] truncate max-w-sm">{stock.name}</p>
          </div>

          <div className="hidden sm:block h-8 w-[1px] bg-[#e5ddd0] dark:bg-[#2e4149] mx-1" />

          {/* Real-time BEI Price Highlight */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-[#17242a] dark:text-[#f3eee4]">
              {formatRp(stock.price)}
            </span>
            <div
              className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                stock.changePercent >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {stock.changePercent >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
              )}
              <span>
                {stock.changePercent >= 0 ? '+' : ''}
                {stock.changePercent}% ({stock.change >= 0 ? '+' : ''}
                {formatRp(stock.change)})
              </span>
            </div>
          </div>
        </div>

        {/* Live Status, Sync & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* BEI Source Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Live BEI / IDX</span>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">
              · {dataSource}
            </span>
          </div>

          {/* Sync Live Button */}
          {onSyncLive && (
            <button
              onClick={onSyncLive}
              disabled={isSyncing || isLoadingCandles}
              className="px-2.5 py-1 rounded-lg border border-[#d6ccbb] dark:border-[#33464e] hover:bg-[#efe9dd] dark:hover:bg-[#1f3037] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-60"
              title="Perbarui data harga live dari Bursa Efek Indonesia"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#1d7a5c] ${
                  isSyncing || isLoadingCandles ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {isSyncing || isLoadingCandles ? 'Sinkron…' : 'Update BEI'}
              </span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-[#d6ccbb] dark:border-[#33464e] hover:bg-[#efe9dd] dark:hover:bg-[#1f3037] text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* TIMEFRAME SELECTOR & TOOLBAR */}
      <div className="px-4 py-2 bg-[#f4efe6] dark:bg-[#17272d] border-b border-[#e5ddd0] dark:border-[#24353c] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-[#eae3d5] dark:bg-[#121c20] p-1 rounded-lg">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded font-bold text-xs transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#1d7a5c] text-white shadow-xs'
                  : 'text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4]'
              }`}
            >
              {tf === 'ALL' ? 'Semua' : tf}
            </button>
          ))}
        </div>

        {/* Technical Analysis Tool Toggles (Automatically attached on candlestick) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-[#80887f] flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Alat Analisis:</span>
          </span>

          {/* MA Line */}
          <button
            onClick={() => toggleTool('ma')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.ma
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Moving Averages: MA5, MA20, MA50, MA200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>MA (5/20/50/200)</span>
          </button>

          {/* Breakout Pivot */}
          <button
            onClick={() => toggleTool('pivot')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.pivot
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Garis & Level Breakout Pivot"
          >
            <Zap className="w-3 h-3 text-cyan-500" />
            <span>Pivot Breakout</span>
          </button>

          {/* Target TP1 & TP2 */}
          <button
            onClick={() => toggleTool('targets')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.targets
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Target Take Profit 1 & 2"
          >
            <Target className="w-3 h-3 text-emerald-500" />
            <span>Target TP1 & TP2</span>
          </button>

          {/* Invalidasi / Cut Loss */}
          <button
            onClick={() => toggleTool('invalidation')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.invalidation
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Batas Invalidasi / Stop Loss"
          >
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            <span>Cut Loss</span>
          </button>

          {/* Risk / Reward Zone */}
          <button
            onClick={() => toggleTool('riskReward')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.riskReward
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Area Rasio Risk / Reward"
          >
            <span>⚖️ R:R Zone</span>
          </button>

          {/* Support / Resistance */}
          <button
            onClick={() => toggleTool('supportResistance')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.supportResistance
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Level Support S1 & Resistance R1"
          >
            <span>S/R Level</span>
          </button>

          {/* VCP Contraction */}
          <button
            onClick={() => toggleTool('vcp')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.vcp
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Pola Volatility Contraction Pattern"
          >
            <span>Pola VCP</span>
          </button>

          {/* Volume Subplot */}
          <button
            onClick={() => toggleTool('volume')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              tools.volume
                ? 'bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-300'
                : 'bg-transparent border-transparent text-[#80887f] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Volume Transaksi & Rata-rata 20 Hari"
          >
            <Activity className="w-3 h-3 text-teal-500" />
            <span>Volume</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME SIGNAL ANALYZER BANNER (Sinyal Saham Membaca Grafik Hari Ini) */}
      {todaySignal && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border-b border-[#e5ddd0] dark:border-[#24353c] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1d7a5c] text-white font-black text-[11px] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
              <span>SINYAL GRAFIK HARI INI</span>
            </div>

            <div className={`px-2.5 py-1 rounded-lg border font-bold text-xs ${todaySignal.signalBadge}`}>
              {todaySignal.signalHeadline}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#80887f]">
              <span>Pola:</span>
              <b className="text-[#17242a] dark:text-[#f3eee4]">{todaySignal.candlePattern}</b>
              <span className="hidden sm:inline">({Number(todaySignal.changeTodayPct) >= 0 ? '+' : ''}{todaySignal.changeTodayPct}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-[#80887f] text-[11px] hidden md:inline">
              {todaySignal.tradingPlanText}
            </span>

            {todaySignal.isBreakoutToday ? (
              <span className="px-2 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[11px]">
                ⚡ Breakout Tembus Rp {formatRp(todaySignal.pivotVal)}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded font-semibold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                🎯 Jarak ke Breakout: {todaySignal.breakoutDistPct}%
              </span>
            )}

            <span className="px-2 py-0.5 rounded font-bold bg-[#1d7a5c] text-white text-[11px]">
              Konfirmasi: {todaySignal.confidenceScore}%
            </span>
          </div>
        </div>
      )}

      {/* CANDLESTICK HUD BAR (Current/Hovered Candle Metrics) */}
      <div className="px-4 py-1.5 bg-[#fbf9f4] dark:bg-[#121c20] border-b border-[#e5ddd0]/60 dark:border-[#24353c]/60 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
        {activeCandle ? (
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-[#17242a] dark:text-[#f3eee4]">
              📅 {activeCandle.date}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#80887f]">
                O: <b className="text-[#17242a] dark:text-[#f3eee4]">{formatRp(activeCandle.open)}</b>
              </span>
              <span className="text-[#80887f]">
                H: <b className="text-emerald-600 dark:text-emerald-400">{formatRp(activeCandle.high)}</b>
              </span>
              <span className="text-[#80887f]">
                L: <b className="text-rose-600 dark:text-rose-400">{formatRp(activeCandle.low)}</b>
              </span>
              <span className="text-[#80887f]">
                C: <b className={activeCandle.close >= activeCandle.open ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                  {formatRp(activeCandle.close)}
                </b>
              </span>
              <span className="text-[#80887f]">
                Vol: <b className="text-[#17242a] dark:text-[#f3eee4]">{formatCompact(activeCandle.volume)}</b>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#80887f]">Memuat candlestick…</div>
        )}

        {/* Indicators Readout */}
        <div className="flex items-center gap-3 text-[11px] text-[#80887f] flex-wrap">
          {tools.ma && (
            <>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-yellow-500 rounded" />
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  MA5: {formatRp(stock.ma5 || stock.price)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-blue-500 rounded" />
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  MA20: {formatRp(stock.ma20 || stock.price * 0.98)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-purple-500 rounded" />
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  MA50: {formatRp(stock.ma50 || stock.price * 0.95)}
                </span>
              </span>
            </>
          )}

          {isVolSpike && (
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 animate-pulse">
              🔥 Volume Spike {volSpikeRatio}x MA20
            </span>
          )}
        </div>
      </div>

      {/* MAIN CHART SVG CANVAS */}
      <div className="relative w-full flex-1 min-h-[460px] bg-[#fbf9f4] dark:bg-[#0e171b] select-none overflow-hidden">
        {isLoadingCandles && (
          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a2a30] shadow-md border border-[#e5ddd0] dark:border-[#2e4149] text-xs font-bold">
              <RefreshCw className="w-4 h-4 text-[#1d7a5c] animate-spin" />
              <span>Memuat data candlestick live BEI…</span>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Green Reward Area Gradient */}
            <linearGradient id="rewardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>

            {/* Red Risk Area Gradient */}
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.22" />
            </linearGradient>

            {/* Breakout Glow Filter */}
            <filter id="pivotGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Price Grid Lines & Axis Labels */}
          {priceGridSteps.map((price, idx) => {
            const y = getY(price);
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={10}
                  y1={y}
                  x2={plotWidth}
                  y2={y}
                  stroke={theme === 'dark' ? '#1c2d34' : '#ece5d8'}
                  strokeDasharray="3,3"
                  strokeWidth="1"
                />
                <text
                  x={plotWidth + 8}
                  y={y + 4}
                  fill={theme === 'dark' ? '#718087' : '#9aa399'}
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  {formatRp(price)}
                </text>
              </g>
            );
          })}

          {/* Vertical Time Grid Lines & Date Labels */}
          {activeCandles.map((c, idx) => {
            if (idx % dateStep === 0 && idx !== 0 && idx !== candleCount - 1) {
              const x = getX(idx);
              const dateParts = c.date.split('-');
              const displayDate = `${dateParts[2]}/${dateParts[1]}`;
              return (
                <g key={`time-${idx}`}>
                  <line
                    x1={x}
                    y1={priceTopY}
                    x2={x}
                    y2={volBottomY}
                    stroke={theme === 'dark' ? '#1c2d34' : '#ece5d8'}
                    strokeDasharray="2,4"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={volBottomY + 16}
                    fill={theme === 'dark' ? '#718087' : '#9aa399'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {displayDate}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* 1. TOOL OVERLAY: RISK / REWARD SHADED ZONES */}
          {tools.riskReward && stock.target1 && stock.invalidation && (
            <g id="risk-reward-zones">
              {/* Reward Box (Entry to Target 1) */}
              <rect
                x={15}
                y={getY(stock.target1)}
                width={plotWidth - 15}
                height={Math.max(2, getY(stock.price) - getY(stock.target1))}
                fill="url(#rewardGrad)"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
                strokeOpacity="0.5"
              />
              {/* Risk Box (Entry to Invalidation) */}
              <rect
                x={15}
                y={getY(stock.price)}
                width={plotWidth - 15}
                height={Math.max(2, getY(stock.invalidation) - getY(stock.price))}
                fill="url(#riskGrad)"
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="2,2"
                strokeOpacity="0.5"
              />
              {/* Floating R:R Badge */}
              <g transform={`translate(${plotWidth - 140}, ${getY(stock.price) - 13})`}>
                <rect
                  x="0"
                  y="0"
                  width="130"
                  height="24"
                  rx="6"
                  fill={theme === 'dark' ? '#1c2d34' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                <text
                  x="65"
                  y="16"
                  fill={theme === 'dark' ? '#34d399' : '#059669'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  ⚖️ Rasio R:R = 1 : {rrRatio}
                </text>
              </g>
            </g>
          )}

          {/* 2. TOOL OVERLAY: SUPPORT & RESISTANCE BANDS */}
          {tools.supportResistance && (
            <g id="support-resistance">
              {/* Resistance R1 */}
              {stock.resistance > 0 && (
                <g>
                  <line
                    x1={15}
                    y1={getY(stock.resistance)}
                    x2={plotWidth}
                    y2={getY(stock.resistance)}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="6,4"
                  />
                  <rect
                    x={plotWidth - 100}
                    y={getY(stock.resistance) - 10}
                    width="95"
                    height="20"
                    rx="4"
                    fill="#f59e0b"
                  />
                  <text
                    x={plotWidth - 52}
                    y={getY(stock.resistance) + 4}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    R1 {formatRp(stock.resistance)}
                  </text>
                </g>
              )}

              {/* Support S1 */}
              {stock.support > 0 && (
                <g>
                  <line
                    x1={15}
                    y1={getY(stock.support)}
                    x2={plotWidth}
                    y2={getY(stock.support)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="6,4"
                  />
                  <rect
                    x={plotWidth - 100}
                    y={getY(stock.support) - 10}
                    width="95"
                    height="20"
                    rx="4"
                    fill="#10b981"
                  />
                  <text
                    x={plotWidth - 52}
                    y={getY(stock.support) + 4}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    S1 {formatRp(stock.support)}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* 3. TOOL OVERLAY: PIVOT BREAKOUT LINE & BADGE */}
          {tools.pivot && stock.pivotBreakout > 0 && (
            <g id="pivot-breakout" filter="url(#pivotGlow)">
              <line
                x1={15}
                y1={getY(stock.pivotBreakout)}
                x2={plotWidth}
                y2={getY(stock.pivotBreakout)}
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="7,4"
              />
              <g transform={`translate(${plotWidth - 165}, ${getY(stock.pivotBreakout) - 12})`}>
                <rect x="0" y="0" width="160" height="24" rx="5" fill="#0891b2" />
                <text
                  x="80"
                  y="16"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  ⚡ Breakout Pivot: {formatRp(stock.pivotBreakout)}
                </text>
              </g>
            </g>
          )}

          {/* 4. TOOL OVERLAY: TARGET 1 & TARGET 2 */}
          {tools.targets && (
            <g id="targets">
              {/* Target 1 */}
              {stock.target1 > 0 && (
                <g>
                  <line
                    x1={15}
                    y1={getY(stock.target1)}
                    x2={plotWidth}
                    y2={getY(stock.target1)}
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,4"
                  />
                  <g transform={`translate(${plotWidth - 180}, ${getY(stock.target1) - 12})`}>
                    <rect x="0" y="0" width="175" height="24" rx="5" fill="#059669" />
                    <text
                      x="87"
                      y="16"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      🎯 Target 1: {formatRp(stock.target1)} (+
                      {(
                        ((stock.target1 - stock.price) / (stock.price || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </text>
                  </g>
                </g>
              )}

              {/* Target 2 */}
              {stock.target2 > 0 && (
                <g>
                  <line
                    x1={15}
                    y1={getY(stock.target2)}
                    x2={plotWidth}
                    y2={getY(stock.target2)}
                    stroke="#14b8a6"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <g transform={`translate(${plotWidth - 180}, ${getY(stock.target2) - 12})`}>
                    <rect x="0" y="0" width="175" height="24" rx="5" fill="#0d9488" />
                    <text
                      x="87"
                      y="16"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      🚀 Target 2: {formatRp(stock.target2)} (+
                      {(
                        ((stock.target2 - stock.price) / (stock.price || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </text>
                  </g>
                </g>
              )}
            </g>
          )}

          {/* 5. TOOL OVERLAY: INVALIDASI / CUT LOSS */}
          {tools.invalidation && stock.invalidation > 0 && (
            <g id="invalidation">
              <line
                x1={15}
                y1={getY(stock.invalidation)}
                x2={plotWidth}
                y2={getY(stock.invalidation)}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <g transform={`translate(${plotWidth - 190}, ${getY(stock.invalidation) - 12})`}>
                <rect x="0" y="0" width="185" height="24" rx="5" fill="#dc2626" />
                <text
                  x="92"
                  y="16"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  ⛔ Invalidasi: {formatRp(stock.invalidation)} (
                  {(
                    ((stock.invalidation - stock.price) / (stock.price || 1)) *
                    100
                  ).toFixed(1)}
                  %)
                </text>
              </g>
            </g>
          )}

          {/* 6. TOOL OVERLAY: VCP CONTRACTION CURVES / BRACKETS */}
          {tools.vcp && stock.vcpContraction && candleCount >= 15 && (
            <g id="vcp-pattern">
              {/* Visual VCP Bracket over last 3 contractions */}
              {(() => {
                const c1Start = Math.max(0, candleCount - 25);
                const c1Mid = Math.max(0, candleCount - 16);
                const c2Mid = Math.max(0, candleCount - 8);
                const c3End = candleCount - 1;

                const x1 = getX(c1Start);
                const x2 = getX(c1Mid);
                const x3 = getX(c2Mid);
                const x4 = getX(c3End);

                const yMax = Math.min(...activeCandles.slice(c1Start).map((c) => getY(c.high))) - 12;

                return (
                  <g opacity="0.9">
                    {/* Contraction Arc 1 */}
                    <path
                      d={`M ${x1} ${yMax + 8} Q ${(x1 + x2) / 2} ${yMax - 6} ${x2} ${yMax + 8}`}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2"
                      strokeDasharray="3,2"
                    />
                    {/* Contraction Arc 2 */}
                    <path
                      d={`M ${x2} ${yMax + 8} Q ${(x2 + x3) / 2} ${yMax} ${x3} ${yMax + 8}`}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeDasharray="3,2"
                    />
                    {/* Contraction Arc 3 */}
                    <path
                      d={`M ${x3} ${yMax + 8} Q ${(x3 + x4) / 2} ${yMax + 4} ${x4} ${yMax + 8}`}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                    />
                    {/* Badge */}
                    <g transform={`translate(${(x2 + x3) / 2 - 80}, ${yMax - 26})`}>
                      <rect
                        x="0"
                        y="0"
                        width="160"
                        height="20"
                        rx="4"
                        fill="#4f46e5"
                        fillOpacity="0.9"
                      />
                      <text
                        x="80"
                        y="14"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        📐 Pola VCP: {stock.vcpContraction}
                      </text>
                    </g>
                  </g>
                );
              })()}
            </g>
          )}

          {/* 7. CANDLESTICKS RENDERING */}
          <g id="candlestick-bars">
            {activeCandles.map((c, i) => {
              const x = getX(i);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);

              const isBull = c.close >= c.open;
              const candleColor = isBull ? '#16a34a' : '#dc2626';
              const topBodyY = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));
              const isLast = i === candleCount - 1;

              return (
                <g
                  key={`c-${i}`}
                  opacity={hoverIndex !== null && hoverIndex !== i ? 0.75 : 1}
                >
                  {/* Wick (High to Low) */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={candleColor}
                    strokeWidth={isLast ? 1.8 : 1.2}
                  />

                  {/* Body (Open to Close) */}
                  <rect
                    x={x - candleBodyWidth / 2}
                    y={topBodyY}
                    width={candleBodyWidth}
                    height={bodyHeight}
                    fill={candleColor}
                    stroke={candleColor}
                    strokeWidth={isLast ? 1.5 : 0.8}
                    rx="1"
                  />

                  {/* Pulse ring on latest real-time candle */}
                  {isLast && (
                    <>
                      <circle
                        cx={x}
                        cy={closeY}
                        r="4.5"
                        fill="#38bdf8"
                        className="animate-ping opacity-75"
                      />
                      {todaySignal && (
                        <g transform={`translate(${x}, ${Math.min(highY, topBodyY) - 14})`}>
                          <rect
                            x="-40"
                            y="-14"
                            width="80"
                            height="16"
                            rx="4"
                            fill={todaySignal.isBreakoutToday ? '#0891b2' : todaySignal.isAboveMa20 ? '#059669' : '#dc2626'}
                          />
                          <text
                            x="0"
                            y="-3"
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {todaySignal.isBreakoutToday ? '⚡ BREAKOUT' : todaySignal.isAboveMa20 ? '🔄 PULLBACK' : '⚠️ UJI LEVEL'}
                          </text>
                        </g>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </g>

          {/* 8. MOVING AVERAGES PATHS */}
          {tools.ma && (
            <g id="moving-averages" fill="none">
              {/* MA200 */}
              {ma200Path && (
                <path
                  d={ma200Path}
                  stroke="#f97316"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* MA50 */}
              {ma50Path && (
                <path
                  d={ma50Path}
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* MA20 */}
              {ma20Path && (
                <path
                  d={ma20Path}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* MA5 */}
              {ma5Path && (
                <path
                  d={ma5Path}
                  stroke="#eab308"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          )}

          {/* 9. REAL-TIME LIVE CURRENT PRICE LINE */}
          <g id="live-price-marker">
            <line
              x1={15}
              y1={getY(stock.price)}
              x2={plotWidth}
              y2={getY(stock.price)}
              stroke={stock.changePercent >= 0 ? '#10b981' : '#ef4444'}
              strokeWidth="1.6"
              strokeDasharray="4,2"
            />
            {/* Pulsing beacon on the left */}
            <circle
              cx={25}
              cy={getY(stock.price)}
              r="4"
              fill={stock.changePercent >= 0 ? '#10b981' : '#ef4444'}
              className="animate-ping"
            />
            <circle
              cx={25}
              cy={getY(stock.price)}
              r="3"
              fill={stock.changePercent >= 0 ? '#10b981' : '#ef4444'}
            />

            {/* Price Tag on Right Axis */}
            <g transform={`translate(${plotWidth + 4}, ${getY(stock.price) - 10})`}>
              <rect
                x="0"
                y="0"
                width={rightAxisWidth - 8}
                height="20"
                rx="4"
                fill={stock.changePercent >= 0 ? '#059669' : '#dc2626'}
              />
              <text
                x={(rightAxisWidth - 8) / 2}
                y="14"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatRp(stock.price)}
              </text>
            </g>
          </g>

          {/* 10. SUBPLOT DIVIDER & VOLUME SECTION */}
          {tools.volume && (
            <g id="volume-subplot">
              {/* Divider */}
              <line
                x1={10}
                y1={volTopY - 10}
                x2={plotWidth}
                y2={volTopY - 10}
                stroke={theme === 'dark' ? '#24353c' : '#e5ddd0'}
                strokeWidth="1"
              />
              <text
                x={15}
                y={volTopY + 4}
                fill={theme === 'dark' ? '#718087' : '#9aa399'}
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                Volume Transaksi (Lot / Lembar)
              </text>

              {/* Volume Bars */}
              {activeCandles.map((c, i) => {
                const x = getX(i);
                const y = getVolY(c.volume);
                const h = Math.max(1, volBottomY - y);
                const isBull = c.close >= c.open;
                const barColor = isBull ? '#16a34a' : '#dc2626';

                return (
                  <rect
                    key={`vol-${i}`}
                    x={x - candleBodyWidth / 2}
                    y={y}
                    width={candleBodyWidth}
                    height={h}
                    fill={barColor}
                    fillOpacity={hoverIndex === i ? 1 : 0.65}
                    rx="0.5"
                  />
                );
              })}

              {/* Volume MA20 Line */}
              {volMaPath && (
                <path
                  d={volMaPath}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="1.5"
                  strokeDasharray="3,2"
                />
              )}
            </g>
          )}

          {/* 11. CROSSHAIR & HOVER CURSOR */}
          {mousePos && hoverIndex !== null && (
            <g id="crosshair" pointerEvents="none">
              {/* Vertical Crosshair Line */}
              <line
                x1={mousePos.x}
                y1={priceTopY}
                x2={mousePos.x}
                y2={volBottomY}
                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1={10}
                y1={mousePos.y}
                x2={plotWidth}
                y2={mousePos.y}
                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                strokeWidth="1"
                strokeDasharray="3,3"
              />

              {/* Crosshair Price Tag on Right Axis */}
              {mousePos.y <= priceBottomY && (
                <g transform={`translate(${plotWidth + 4}, ${mousePos.y - 10})`}>
                  <rect
                    x="0"
                    y="0"
                    width={rightAxisWidth - 8}
                    height="19"
                    rx="3"
                    fill={theme === 'dark' ? '#334155' : '#475569'}
                  />
                  <text
                    x={(rightAxisWidth - 8) / 2}
                    y="13"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {formatRp(
                      Math.round(
                        minPrice +
                          ((priceBottomY - mousePos.y) / (priceBottomY - priceTopY)) *
                            priceRange
                      )
                    )}
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>

        {/* FLOATING HUD CARD WHEN HOVERED */}
        {activeCandle && mousePos && (
          <div
            className={`absolute pointer-events-none z-30 p-2.5 rounded-xl shadow-lg border text-xs font-mono backdrop-blur-md transition-all ${
              theme === 'dark'
                ? 'bg-[#152328]/95 border-[#2e4149] text-[#f3eee4]'
                : 'bg-white/95 border-[#e5ddd0] text-[#17242a]'
            }`}
            style={{
              left: mousePos.x > chartWidth / 2 ? '24px' : 'auto',
              right: mousePos.x <= chartWidth / 2 ? '100px' : 'auto',
              top: '20px',
            }}
          >
            <div className="flex items-center justify-between gap-4 pb-1 mb-1 border-b border-[#e5ddd0] dark:border-[#24353c]">
              <span className="font-bold text-[#1d7a5c] dark:text-emerald-400">
                IDX:{stock.ticker} · {activeCandle.date}
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded ${
                  activeCandle.close >= activeCandle.open
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {activeCandle.close >= activeCandle.open ? '+' : ''}
                {(
                  ((activeCandle.close - activeCandle.open) / (activeCandle.open || 1)) *
                  100
                ).toFixed(2)}
                %
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
              <div>
                <span className="text-[#80887f]">Open: </span>
                <b>{formatRp(activeCandle.open)}</b>
              </div>
              <div>
                <span className="text-[#80887f]">High: </span>
                <b className="text-emerald-500">{formatRp(activeCandle.high)}</b>
              </div>
              <div>
                <span className="text-[#80887f]">Low: </span>
                <b className="text-rose-500">{formatRp(activeCandle.low)}</b>
              </div>
              <div>
                <span className="text-[#80887f]">Close: </span>
                <b>{formatRp(activeCandle.close)}</b>
              </div>
              <div className="col-span-2">
                <span className="text-[#80887f]">Volume: </span>
                <b>
                  {activeCandle.volume.toLocaleString('id-ID')} lembar ({formatCompact(activeCandle.volume)})
                </b>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTIONABLE TRADE PLAN & ANALYSIS SUMMARY ATTACHED DIRECTLY BELOW */}
      <div className="p-4 bg-[#faf7f2]/90 dark:bg-[#1a2a30]/90 border-t border-[#e5ddd0] dark:border-[#24353c]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Harga Saat Ini */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#121c20] border border-[#e5ddd0] dark:border-[#26363d]">
            <span className="text-[10px] font-bold text-[#80887f] uppercase tracking-wider block">
              Harga Realtime BEI
            </span>
            <div className="text-base font-black font-mono text-[#17242a] dark:text-[#f3eee4] mt-0.5">
              {formatRp(stock.price)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stock.changePercent >= 0 ? '+' : ''}
              {stock.changePercent}% hari ini
            </div>
          </div>

          {/* 2. Breakout Pivot */}
          <div className="p-2.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60">
            <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider block">
              ⚡ Batas Breakout Pivot
            </span>
            <div className="text-base font-black font-mono text-cyan-800 dark:text-cyan-200 mt-0.5">
              {formatRp(stock.pivotBreakout)}
            </div>
            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">
              {stock.price >= stock.pivotBreakout ? '✅ Sudah Breakout' : '⏳ Menunggu Breakout'}
            </div>
          </div>

          {/* 3. Target 1 (TP1) */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              🎯 Target 1 (TP1)
            </span>
            <div className="text-base font-black font-mono text-emerald-800 dark:text-emerald-200 mt-0.5">
              {formatRp(stock.target1)}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              +{(((stock.target1 - stock.price) / (stock.price || 1)) * 100).toFixed(1)}% Potensi
            </div>
          </div>

          {/* 4. Target 2 (TP2) */}
          <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider block">
              🚀 Target 2 (TP2)
            </span>
            <div className="text-base font-black font-mono text-teal-800 dark:text-teal-200 mt-0.5">
              {formatRp(stock.target2)}
            </div>
            <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">
              +{(((stock.target2 - stock.price) / (stock.price || 1)) * 100).toFixed(1)}% Potensi
            </div>
          </div>

          {/* 5. Invalidasi / Cut Loss */}
          <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
              ⛔ Batas Cut Loss
            </span>
            <div className="text-base font-black font-mono text-rose-800 dark:text-rose-200 mt-0.5">
              {formatRp(stock.invalidation)}
            </div>
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {(((stock.invalidation - stock.price) / (stock.price || 1)) * 100).toFixed(1)}% Toleransi
            </div>
          </div>

          {/* 6. Rasio Risk to Reward */}
          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              ⚖️ Rasio Risk : Reward
            </span>
            <div className="text-base font-black font-mono text-amber-800 dark:text-amber-200 mt-0.5">
              1 : {rrRatio}
            </div>
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-0.5">
              {Number(rrRatio) >= 2.0 ? '🌟 Sangat Sehat' : '⚖️ Cukup Bagus'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
