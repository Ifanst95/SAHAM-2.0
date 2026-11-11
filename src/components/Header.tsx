import React from 'react';
import { UserData } from '../types.ts';

interface HeaderProps {
  user: UserData | null;
  currentView: 'landing' | 'app' | 'plans';
  setCurrentView: (view: 'landing' | 'app' | 'plans') => void;
  openAuthModal: (mode: 'daftar' | 'masuk') => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentView,
  setCurrentView,
  openAuthModal,
  onLogout,
  theme,
  toggleTheme,
}) => {
  return (
    <header className="top on" id="top">
      <div className="wrap">
        <a
          className="brand cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img src="/logo.svg?v=2" width="32" height="32" alt="Logo Penyembuh Luka" />
          <span>Penyembuh Luka</span>
        </a>

        {currentView === 'landing' ? (
          <nav className="nav" aria-label="Bagian halaman">
            <a href="#cara-kerja">Yang kamu pelajari</a>
            <a href="#video">Materi belajar</a>
            <a href="#fitur">Alat praktik</a>
            <a href="#harga">Gabung belajar</a>
            <a href="#faq">FAQ</a>
          </nav>
        ) : (
          <nav className="nav" aria-label="Navigasi Aplikasi">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              Beranda
            </button>
            <button
              onClick={() => setCurrentView('app')}
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'app' ? 'bg-[var(--up-soft)] text-[var(--up)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Screener & Grafik
            </button>
            <button
              onClick={() => setCurrentView('plans')}
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'plans' ? 'bg-[var(--up-soft)] text-[var(--up)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Langganan
            </button>
          </nav>
        )}

        {user ? (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCurrentView('app')}
              className={`go text-sm ${currentView === 'app' ? 'ring-2 ring-[var(--up)]' : ''}`}
            >
              Buka Screener
            </button>
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-2.5 py-1.5 text-[var(--muted)] hover:text-[var(--down)] transition-colors"
              title={`Keluar dari ${user.email}`}
            >
              Keluar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="go ghost"
              onClick={() => openAuthModal('daftar')}
            >
              Daftar
            </button>
            <button
              className="go"
              onClick={() => openAuthModal('masuk')}
            >
              Masuk
            </button>
          </div>
        )}

        <button
          className="theme-btn"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        >
          {theme === 'dark' ? (
            <svg
              className="sun"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg
              className="moon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
