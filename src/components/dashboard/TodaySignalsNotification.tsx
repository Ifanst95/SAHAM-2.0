import React, { useState, useEffect, useRef } from 'react';

export interface TodaySignalItem {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  type: 'breakout' | 'target' | 'rebound' | 'invalidation' | 'volume_haka';
  title: string;
  description: string;
  price: number;
  changePercent: number;
  triggerLevel: number;
  targetPrice?: number;
  invalidationPrice?: number;
  timestamp: string;
  timeLabel: string;
  read: boolean;
}

interface TodaySignalsNotificationProps {
  notifications: TodaySignalItem[];
  unreadCount: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  onSelectStock: (ticker: string) => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerTestSignal?: () => void;
}

export const TodaySignalsNotification: React.FC<TodaySignalsNotificationProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onToggleOpen,
  onClose,
  onSelectStock,
  onMarkAllRead,
  onMarkRead,
  soundEnabled,
  onToggleSound,
  onTriggerTestSignal,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'all') return true;
    if (filterType === 'breakout') return notif.type === 'breakout';
    if (filterType === 'target') return notif.type === 'target';
    if (filterType === 'rebound') return notif.type === 'rebound' || notif.type === 'volume_haka';
    if (filterType === 'invalidation') return notif.type === 'invalidation';
    return true;
  });

  const getTypeBadge = (type: TodaySignalItem['type']) => {
    switch (type) {
      case 'breakout':
        return {
          label: '⚡ Breakout',
          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
      case 'target':
        return {
          label: '🎯 Target TP',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800',
        };
      case 'rebound':
        return {
          label: '🔄 Rebound Support',
          className: 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-300 dark:border-teal-800',
        };
      case 'volume_haka':
        return {
          label: '🔥 Lonjakan HAKA',
          className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'invalidation':
        return {
          label: '⚠️ Invalidasi',
          className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        };
      default:
        return {
          label: 'Sinyal',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={onToggleOpen}
        aria-label="Notifikasi Sinyal Hari Ini"
        title="Notifikasi Sinyal Hari Ini (Real-time BEI)"
        className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#1d7a5c] text-white border-[#1d7a5c] shadow-xs'
            : 'border-[#d6ccbb] dark:border-[#304349] text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] hover:text-[#17242a] dark:hover:text-[#f3eee4]'
        }`}
      >
        <svg
          className={`w-4 h-4 transition-transform ${unreadCount > 0 ? 'animate-wiggle' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs ring-2 ring-[#fbf9f4] dark:ring-[#152227] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Flyout */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md bg-white dark:bg-[#152227] rounded-2xl border border-[#d6ccbb] dark:border-[#304349] shadow-2xl z-50 overflow-hidden flex flex-col font-sans">
          {/* Header */}
          <div className="p-3.5 border-b border-[#e5ddd0] dark:border-[#26363d] bg-[#fbf9f4] dark:bg-[#121c20] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-serif font-extrabold text-[#17242a] dark:text-[#f3eee4] flex items-center gap-1.5">
                <span>🔔 Sinyal Hari Ini</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live BEI</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Alert Toggle */}
              <button
                onClick={onToggleSound}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  soundEnabled
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'border-[#d6ccbb] dark:border-[#304349] text-[#80887f] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30]'
                }`}
                title={soundEnabled ? 'Suara notifikasi aktif (Klik untuk membisukan)' : 'Suara notifikasi nonaktif (Klik untuk mengaktifkan)'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#1d7a5c] dark:text-[#4fbf93] hover:bg-[#1d7a5c]/10 rounded-lg cursor-pointer transition-colors"
                >
                  Tandai dibaca
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-[#d6ccbb] dark:border-[#304349] flex items-center justify-center text-xs text-[#80887f] hover:bg-[#efe9dd] dark:hover:bg-[#1a2a30] cursor-pointer"
                title="Tutup"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="px-3 py-2 border-b border-[#e5ddd0] dark:border-[#26363d] bg-white dark:bg-[#152227] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {[
              { id: 'all', label: 'Semua', count: notifications.length },
              { id: 'breakout', label: '⚡ Breakout', count: notifications.filter((n) => n.type === 'breakout').length },
              { id: 'target', label: '🎯 Target TP', count: notifications.filter((n) => n.type === 'target').length },
              { id: 'rebound', label: '🚀 Rebound', count: notifications.filter((n) => n.type === 'rebound' || n.type === 'volume_haka').length },
              { id: 'invalidation', label: '⚠️ Invalidasi', count: notifications.filter((n) => n.type === 'invalidation').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === tab.id
                    ? 'bg-[#1d7a5c] text-white shadow-2xs'
                    : 'bg-[#efe9dd]/70 dark:bg-[#1a2a30] text-[#56625f] dark:text-[#a9b3ad] hover:bg-[#efe9dd] dark:hover:bg-[#22353d]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1 rounded-full font-bold ${
                      filterType === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-[#d6ccbb] dark:bg-[#2c3d44] text-[#17242a] dark:text-[#f3eee4]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-88 overflow-y-auto divide-y divide-[#e5ddd0] dark:divide-[#26363d] bg-white dark:bg-[#152227]">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#efe9dd] dark:bg-[#1a2a30] flex items-center justify-center text-lg mb-2">
                  🔔
                </div>
                <p className="text-xs font-bold text-[#17242a] dark:text-[#f3eee4]">
                  Belum ada sinyal di filter ini
                </p>
                <p className="text-[11px] text-[#80887f] mt-1 max-w-xs mx-auto">
                  Sistem otomatis mendeteksi perubahan harga real-time BEI ketika menembus batas pivot breakout, invalidasi, atau target.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const badge = getTypeBadge(notif.type);
                const isPositive = notif.changePercent >= 0;

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkRead(notif.id);
                      onSelectStock(notif.ticker);
                      onClose();
                    }}
                    className={`p-3.5 transition-colors cursor-pointer group hover:bg-[#f6f2ea] dark:hover:bg-[#1a2a30] relative ${
                      !notif.read ? 'bg-[#1d7a5c]/5 dark:bg-[#4fbf93]/5' : ''
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.read && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#1d7a5c] rounded-r" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      {/* Left: Ticker + Type Badge */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm px-2 py-0.5 rounded-md bg-[#17242a] text-[#f3eee4] dark:bg-white dark:text-[#17242a]">
                          {notif.ticker}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Right: Price & Time */}
                      <div className="text-right flex-none">
                        <div className="text-xs font-mono font-bold text-[#17242a] dark:text-[#f3eee4]">
                          Rp {notif.price.toLocaleString('id-ID')}
                        </div>
                        <div
                          className={`text-[10px] font-bold font-mono ${
                            isPositive ? 'text-[#1d7a5c] dark:text-[#4fbf93]' : 'text-[#c4554a]'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {notif.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Stock Name & Trigger Title */}
                    <div className="mt-1.5">
                      <div className="text-xs font-bold text-[#17242a] dark:text-[#f3eee4] flex items-center justify-between">
                        <span className="truncate">{notif.title}</span>
                        <span className="text-[10px] font-normal text-[#80887f] ml-2 flex-none">
                          {notif.timeLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#56625f] dark:text-[#a9b3ad] mt-0.5 leading-snug">
                        {notif.description}
                      </p>
                    </div>

                    {/* Footer Details: Levels & Quick Action */}
                    <div className="mt-2 pt-2 border-t border-[#e5ddd0]/60 dark:border-[#26363d]/60 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2 text-[#80887f]">
                        {notif.triggerLevel > 0 && (
                          <span>
                            Trigger: <b className="font-mono text-[#17242a] dark:text-[#f3eee4]">Rp {notif.triggerLevel.toLocaleString('id-ID')}</b>
                          </span>
                        )}
                        {notif.targetPrice && notif.targetPrice > 0 && (
                          <span>
                            TP1: <b className="font-mono text-emerald-600 dark:text-emerald-400">Rp {notif.targetPrice.toLocaleString('id-ID')}</b>
                          </span>
                        )}
                      </div>

                      <span className="text-[#1d7a5c] dark:text-[#4fbf93] font-bold group-hover:underline flex items-center gap-0.5">
                        <span>Lihat Analisis</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 border-t border-[#e5ddd0] dark:border-[#26363d] bg-[#fbf9f4] dark:bg-[#121c20] flex items-center justify-between text-[11px] text-[#80887f]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Auto-detect saat tick harga BEI</span>
            </span>

            {onTriggerTestSignal && (
              <button
                onClick={onTriggerTestSignal}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-[#1d7a5c] dark:text-[#4fbf93] hover:bg-[#1d7a5c]/10 cursor-pointer transition-colors"
                title="Simulasi deteksi sinyal baru"
              >
                + Simulasi Sinyal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================
   Floating Toast Popup Component for Real-time Signal Alerts
   ======================================================== */
interface TodaySignalToastProps {
  notification: TodaySignalItem | null;
  onClose: () => void;
  onSelectStock: (ticker: string) => void;
}

export const TodaySignalToast: React.FC<TodaySignalToastProps> = ({
  notification,
  onClose,
  onSelectStock,
}) => {
  if (!notification) return null;

  const isPositive = notification.changePercent >= 0;

  return (
    <aside
      aria-label="Notifikasi sinyal langsung"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] animate-slide-up shadow-2xl rounded-2xl bg-white/95 dark:bg-[#152227]/95 backdrop-blur-md border border-[#1d7a5c] dark:border-[#4fbf93] overflow-hidden"
    >
      <div className="p-3.5 flex items-start gap-3">
        {/* Animated Icon */}
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 flex-none text-base">
          ⚡
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1d7a5c] dark:text-[#4fbf93] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Sinyal Hari Ini Terdeteksi!</span>
            </span>
            <span className="text-[10px] text-[#80887f] font-mono">{notification.timeLabel}</span>
          </div>

          <div className="flex items-baseline gap-2 mt-0.5">
            <b className="font-mono font-black text-sm text-[#17242a] dark:text-[#f3eee4]">
              {notification.ticker}
            </b>
            <span className="text-xs font-mono font-bold text-[#17242a] dark:text-[#f3eee4]">
              Rp {notification.price.toLocaleString('id-ID')}
            </span>
            <span
              className={`text-xs font-mono font-extrabold ${
                isPositive ? 'text-[#1d7a5c] dark:text-[#4fbf93]' : 'text-[#c4554a]'
              }`}
            >
              ({isPositive ? '+' : ''}{notification.changePercent.toFixed(2)}%)
            </span>
          </div>

          <p className="text-xs font-semibold text-[#17242a] dark:text-[#f3eee4] mt-0.5 truncate">
            {notification.title}
          </p>

          <p className="text-[11px] text-[#56625f] dark:text-[#a9b3ad] mt-0.5 leading-snug line-clamp-2">
            {notification.description}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#e5ddd0] dark:border-[#26363d]">
            <button
              onClick={() => {
                onSelectStock(notification.ticker);
                onClose();
              }}
              className="px-3 py-1 rounded-lg bg-[#1d7a5c] hover:bg-[#166048] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Lihat Analisis Saham</span>
              <span>→</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] px-2 py-1 rounded cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="text-[#80887f] hover:text-[#17242a] dark:hover:text-[#f3eee4] text-xs p-1 cursor-pointer"
          title="Tutup Notifikasi"
        >
          ✕
        </button>
      </div>

      {/* Progress countdown bar */}
      <div className="h-0.5 bg-[#e5ddd0] dark:bg-[#26363d] w-full overflow-hidden">
        <div className="h-full bg-[#1d7a5c] dark:bg-[#4fbf93] animate-toast-progress" />
      </div>
    </aside>
  );
};
