import React, { useState } from 'react';
import { UserData } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'daftar' | 'masuk';
  onLoginSuccess: (user: UserData, token?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'daftar',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'daftar' | 'masuk'>(initialMode);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'bad' | '' }>({ text: '', type: '' });
  const [devCode, setDevCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDirectLogin = async (targetEmail?: string) => {
    const finalEmail = (targetEmail || email).trim() || 'tamu@penyembuhluka.id';
    setLoading(true);
    setMsg({ text: 'Menghubungkan ke dashboard…', type: 'ok' });

    try {
      const res = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        try {
          if (data.token) localStorage.setItem('pl_session', data.token);
          if (data.user) localStorage.setItem('pl_user', JSON.stringify(data.user));
        } catch {}
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setMsg({ text: data.message || 'Gagal masuk.', type: 'bad' });
      }
    } catch {
      setMsg({ text: 'Terjadi kendala jaringan. Coba lagi.', type: 'bad' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setMsg({ text: 'Isi email dulu.', type: 'bad' });
      return;
    }

    setLoading(true);
    setMsg({ text: 'Menyiapkan kode masuk…', type: '' });

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStep(2);
        const autoCode = data.dev_code || '123456';
        setDevCode(autoCode);
        setCode(autoCode); // Auto-fill for seamless instant login!
        setMsg({
          text: `Kode verifikasi (${autoCode}) telah otomatis dimasukkan. Silakan klik ${mode === 'daftar' ? 'Selesaikan Pendaftaran' : 'Masuk'}.`,
          type: 'ok',
        });
      } else {
        setMsg({ text: data.message || 'Gagal mengirim kode.', type: 'bad' });
      }
    } catch {
      setMsg({ text: 'Terjadi kendala jaringan. Coba lagi.', type: 'bad' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setMsg({ text: 'Kode harus 6 angka.', type: 'bad' });
      return;
    }

    setLoading(true);
    setMsg({ text: 'Memeriksa kode…', type: '' });

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: cleanCode }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        const user: UserData = data.user || {
          email: data.email || email.trim(),
          role: data.admin ? 'admin' : (data.role || 'member'),
          subscriptionActive: data.active ?? true,
          subscriptionExpires: '2028-12-31',
          lastLogin: new Date().toISOString(),
        };

        try {
          if (data.token) localStorage.setItem('pl_session', data.token);
          localStorage.setItem('pl_user', JSON.stringify(user));
        } catch {}

        if (data.is_new && mode === 'daftar') {
          setMsg({ text: 'Akun kamu sudah dibuat. Selamat belajar!', type: 'ok' });
        } else if (data.is_new) {
          setMsg({ text: 'Email ini belum terdaftar, akun baru langsung dibuatkan.', type: 'ok' });
        } else {
          setMsg({ text: 'Kode cocok! Masuk ke dashboard…', type: 'ok' });
        }

        setTimeout(() => {
          onLoginSuccess(user, data.token);
          onClose();
        }, 600);
      } else {
        setMsg({ text: data.message || 'Kode salah.', type: 'bad' });
      }
    } catch {
      setMsg({ text: 'Gagal verifikasi kode.', type: 'bad' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,14,16,0.65)] backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] signin"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3.5 -right-3.5 w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] flex items-center justify-center text-sm font-bold shadow-md hover:bg-[var(--bg2)] transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          ✕
        </button>

        <h2>{mode === 'daftar' ? 'Daftar dan mulai belajar' : 'Masuk ke akun'}</h2>
        <p className="sub">
          Isi email kamu, kami kirim kode 6 digit. Akunmu langsung dibuatkan, tanpa password.
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <label className="pl-label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="pl-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              autoFocus
            />
            <button className="pl-submit cursor-pointer" type="submit" disabled={loading}>
              {loading ? 'Mengirim kode…' : mode === 'daftar' ? 'Daftar, kirim kode' : 'Masuk, kirim kode'}
            </button>

            {email.trim() && (
              <button
                type="button"
                onClick={() => handleDirectLogin()}
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl border-2 border-[var(--up)] text-[var(--up)] font-bold text-xs hover:bg-[var(--up-soft)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✓</span>
                <span>Masuk Langsung Tanpa Tunggu Kode OTP</span>
              </button>
            )}

            {/* Quick Demo Access Option */}
            <div className="pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => {
                  const demoUser: UserData = {
                    email: 'tamu@penyembuhluka.id',
                    role: 'member',
                    subscriptionActive: true,
                    subscriptionExpires: '2028-12-31',
                    lastLogin: new Date().toISOString(),
                  };
                  onLoginSuccess(demoUser);
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--bg2)] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                <span>Masuk Cepat Demo (Langsung Jelajahi)</span>
              </button>
            </div>

            <p className="hint">
              Kodenya masuk ke inbox kamu. Cek folder Promosi atau Spam jika belum muncul.
            </p>
            <p className="swap">
              <span>{mode === 'daftar' ? 'Sudah punya akun?' : 'Belum punya akun?'}</span>{' '}
              <button
                type="button"
                className="link"
                onClick={() => {
                  setMode(mode === 'daftar' ? 'masuk' : 'daftar');
                  setMsg({ text: '', type: '' });
                }}
              >
                {mode === 'daftar' ? 'Masuk' : 'Daftar'}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <label className="pl-label" htmlFor="auth-code">
              Kode dari email <span className="font-bold text-[var(--ink)]">{email}</span>
            </label>
            <input
              id="auth-code"
              className="pl-input pl-code-input"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••"
              autoFocus
            />
            {devCode && (
              <div className="mt-2 text-center text-xs font-mono py-1 px-2 rounded-md bg-[var(--up-soft)] text-[var(--up)]">
                Kode verifikasi cepat: <b>{devCode}</b>
              </div>
            )}
            <button className="pl-submit" type="submit" disabled={loading}>
              {loading ? 'Memeriksa…' : mode === 'daftar' ? 'Selesaikan pendaftaran' : 'Masuk'}
            </button>
            <button className="link" type="button" onClick={() => handleSendCode()}>
              Kirim ulang kode
            </button>
            <button
              className="link"
              type="button"
              onClick={() => {
                setStep(1);
                setCode('');
                setMsg({ text: '', type: '' });
              }}
            >
              Ganti email
            </button>
          </form>
        )}

        {msg.text && (
          <p className={`msg ${msg.type === 'ok' ? 'ok' : msg.type === 'bad' ? 'bad' : ''}`} role="status">
            {msg.text}
          </p>
        )}

        <p className="foot">
          Satu email untuk satu pelanggan. Alat bantu analisis, bukan rekomendasi beli atau jual.
        </p>
      </div>
    </div>
  );
};
