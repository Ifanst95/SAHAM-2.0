import React, { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView.tsx';
import { AppDashboard } from './components/AppDashboard.tsx';
import { PlansView } from './components/PlansView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { StockData, SignalData, PlanData, VideoData, FaqData, UserData, JournalEntry } from './types.ts';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'plans'>('landing');
  const [user, setUser] = useState<UserData | null>(null);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'daftar' | 'masuk'>('daftar');

  // App Data
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanData>>({});
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [faq, setFaq] = useState<FaqData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  // Initialize theme and cached user session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pl-theme') as 'light' | 'dark' | null;
    const initialTheme = saved === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Restore cached user session immediately for instant login state
    try {
      const savedUserStr = localStorage.getItem('pl_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.email) {
          setUser(savedUser);
        }
      }
    } catch {}

    // Check URL parameters & hash
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    if (pathname === '/app') {
      setCurrentView('app');
    } else if (pathname === '/langganan') {
      setCurrentView('plans');
    }

    if (hash === '#masuk' || params.get('next') || params.get('r')) {
      setAuthMode('masuk');
      setAuthModalOpen(true);
    } else if (hash === '#daftar') {
      setAuthMode('daftar');
      setAuthModalOpen(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('pl-theme', next);
    } catch {}
  };

  // Helper to get auth headers with token from localStorage
  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pl_session') : null;
    if (token) {
      return {
        'x-session-token': token,
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  };

  // Fetch initial app state & user session
  const refreshAllData = async () => {
    try {
      const authHeaders = getAuthHeaders();

      // Auth me
      const meRes = await fetch('/api/auth/me', {
        headers: authHeaders,
        credentials: 'include',
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.ok && meData.user) {
          setUser(meData.user);
          try {
            localStorage.setItem('pl_user', JSON.stringify(meData.user));
          } catch {}
        }
      }

      // Stocks
      const stockRes = await fetch('/api/stocks');
      if (stockRes.ok) {
        const sData = await stockRes.json();
        if (sData.ok) setStocks(sData.stocks || []);
      }

      // Signals
      const sigRes = await fetch('/api/signals');
      if (sigRes.ok) {
        const sigData = await sigRes.json();
        if (sigData.ok) setSignals(sigData.signals || []);
      }

      // Plans
      const planRes = await fetch('/api/plans');
      if (planRes.ok) {
        const pData = await planRes.json();
        if (pData.ok && pData.plans) setPlans(pData.plans);
      }

      // Videos
      const vidRes = await fetch('/api/videos');
      if (vidRes.ok) {
        const vData = await vidRes.json();
        if (vData.ok) setVideos(vData.videos || []);
      }

      // FAQ
      const faqRes = await fetch('/api/faq');
      if (faqRes.ok) {
        const fData = await faqRes.json();
        if (fData.ok) setFaq(fData.faq || []);
      }

      // Watchlist
      const watchRes = await fetch('/api/watchlist', {
        headers: authHeaders,
        credentials: 'include',
      });
      if (watchRes.ok) {
        const watchData = await watchRes.json();
        if (watchData.ok) setWatchlist(watchData.watchlist || []);
      }

      // Journal
      const jrnRes = await fetch('/api/journal', {
        headers: authHeaders,
        credentials: 'include',
      });
      if (jrnRes.ok) {
        const jData = await jrnRes.json();
        if (jData.ok) setJournal(jData.journal || []);
      }

      // Users (for admin)
      const uRes = await fetch('/api/users', {
        headers: authHeaders,
        credentials: 'include',
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.ok) setUsers(uData.users || []);
      }
    } catch (e) {
      console.warn('Network sync warning:', e);
    }
  };

  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(true);

  useEffect(() => {
    refreshAllData();
    // Initial fetch for market status
    fetch('/api/market/status')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.ok && d.marketConfig) setMarketStatus(d.marketConfig);
      })
      .catch(() => {});
  }, []);

  // Real-time automatic background polling every 4 seconds
  useEffect(() => {
    let intervalId: any;
    if (isAutoUpdating) {
      intervalId = setInterval(async () => {
        try {
          const [stocksRes, signalsRes, marketRes] = await Promise.all([
            fetch('/api/stocks'),
            fetch('/api/signals'),
            fetch('/api/market/status'),
          ]);
          if (stocksRes.ok) {
            const sData = await stocksRes.json();
            if (sData.ok && sData.stocks) setStocks(sData.stocks);
          }
          if (signalsRes.ok) {
            const sigData = await signalsRes.json();
            if (sigData.ok && sigData.signals) setSignals(sigData.signals);
          }
          if (marketRes.ok) {
            const mData = await marketRes.json();
            if (mData.ok && mData.marketConfig) setMarketStatus(mData.marketConfig);
          }
        } catch {
          // silent update
        }
      }, 4000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoUpdating]);

  const handleTriggerTick = async () => {
    try {
      await fetch('/api/market/tick', { method: 'POST' });
      const [stocksRes, signalsRes, marketRes] = await Promise.all([
        fetch('/api/stocks'),
        fetch('/api/signals'),
        fetch('/api/market/status'),
      ]);
      if (stocksRes.ok) {
        const sData = await stocksRes.json();
        if (sData.ok && sData.stocks) setStocks(sData.stocks);
      }
      if (signalsRes.ok) {
        const sigData = await signalsRes.json();
        if (sigData.ok && sigData.signals) setSignals(sigData.signals);
      }
      if (marketRes.ok) {
        const mData = await marketRes.json();
        if (mData.ok && mData.marketConfig) setMarketStatus(mData.marketConfig);
      }
    } catch {}
  };

  const handleToggleWatchlist = async (ticker: string) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ ticker }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) setWatchlist(data.watchlist);
      }
    } catch {
      setWatchlist((prev) =>
        prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
      );
    }
  };

  const handleAddJournal = async (entry: Partial<JournalEntry>) => {
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.entry) {
          setJournal((prev) => [data.entry, ...prev]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAuth = (mode: 'daftar' | 'masuk') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {}
    try {
      localStorage.removeItem('pl_session');
      localStorage.removeItem('pl_user');
    } catch {}
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* View Router */}
      {currentView === 'landing' && (
        <LandingView
          user={user}
          onOpenAuth={handleOpenAuth}
          onNavigateToApp={() => setCurrentView('app')}
          onLoginSuccess={(loggedInUser, token) => {
            setUser(loggedInUser);
            if (token) {
              try {
                localStorage.setItem('pl_session', token);
              } catch {}
            }
            try {
              localStorage.setItem('pl_user', JSON.stringify(loggedInUser));
            } catch {}
            setCurrentView('app');
            refreshAllData();
          }}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {currentView === 'app' && (
        <AppDashboard
          user={user}
          stocks={stocks}
          signals={signals}
          watchlist={watchlist}
          journal={journal}
          faq={faq}
          videos={videos}
          users={users}
          plans={plans}
          marketStatus={marketStatus}
          isAutoUpdating={isAutoUpdating}
          onToggleAutoUpdate={() => setIsAutoUpdating((prev) => !prev)}
          onTriggerTick={handleTriggerTick}
          onToggleWatchlist={handleToggleWatchlist}
          onAddJournal={handleAddJournal}
          onBackToLanding={() => setCurrentView('landing')}
          onNavigateToPlans={() => setCurrentView('plans')}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          onRefreshData={refreshAllData}
        />
      )}

      {currentView === 'plans' && (
        <PlansView
          user={user}
          plans={plans}
          onOpenAuth={handleOpenAuth}
          onNavigateToApp={() => setCurrentView('app')}
        />
      )}

      {/* Sign-in / OTP Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser, token) => {
          setUser(loggedInUser);
          if (token) {
            try {
              localStorage.setItem('pl_session', token);
            } catch {}
          }
          try {
            localStorage.setItem('pl_user', JSON.stringify(loggedInUser));
          } catch {}
          setAuthModalOpen(false);
          setCurrentView('app');
          refreshAllData();
        }}
      />
    </div>
  );
}
