import React, { useState, useEffect } from 'react';
import { Mascot } from './Mascot.tsx';
import { PlanData, VideoData, FaqData, UserData } from '../types.ts';

interface LandingViewProps {
  user?: UserData | null;
  onOpenAuth: (mode: 'daftar' | 'masuk') => void;
  onNavigateToApp: () => void;
  onLoginSuccess: (user: UserData, token?: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  user,
  onOpenAuth,
  onNavigateToApp,
  onLoginSuccess,
  theme,
  toggleTheme,
}) => {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [paymentMode, setPaymentMode] = useState('midtrans');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [faq, setFaq] = useState<FaqData[]>([]);

  // Signin form state
  const [authMode, setAuthMode] = useState<'daftar' | 'masuk'>('daftar');
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'bad' | '' }>({ text: '', type: '' });
  const [devCode, setDevCode] = useState<string | null>(null);

  // Popups
  const [signinPopOpen, setSigninPopOpen] = useState(false);
  const [vbigOpen, setVbigOpen] = useState(false);

  useEffect(() => {
    // Plans
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.plans) {
          const list = Object.keys(d.plans).map((k) => ({ id: k, ...d.plans[k] }));
          setPlans(list);
          if (d.payment_mode) setPaymentMode(d.payment_mode);
        }
      })
      .catch(() => {});

    // Videos
    fetch('/api/videos')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.videos && d.videos.length > 0) {
          setVideos(d.videos);
          setSelectedVideo(d.videos[0]);
        }
      })
      .catch(() => {});

    // FAQ
    fetch('/api/faq')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.faq) setFaq(d.faq);
      })
      .catch(() => {});
  }, []);

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
        setSigninPopOpen(false);
        onNavigateToApp();
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
        setAuthStep(2);
        const autoCode = data.dev_code || '123456';
        setDevCode(autoCode);
        setCode(autoCode); // Auto-fill 6-digit code for instant login!
        setMsg({
          text: `Kode verifikasi (${autoCode}) telah otomatis dimasukkan. Silakan klik ${authMode === 'daftar' ? 'Selesaikan pendaftaran' : 'Masuk'}.`,
          type: 'ok',
        });
      } else {
        setMsg({ text: data.message || 'Gagal mengirim kode.', type: 'bad' });
      }
    } catch {
      setMsg({ text: 'Gagal mengirim kode.', type: 'bad' });
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

        if (data.is_new && authMode === 'daftar') {
          setMsg({ text: 'Akun kamu sudah dibuat. Selamat belajar!', type: 'ok' });
        } else if (data.is_new) {
          setMsg({ text: 'Email ini belum terdaftar, jadi akun baru langsung dibuatkan.', type: 'ok' });
        } else if (authMode === 'daftar') {
          setMsg({ text: 'Email ini sudah terdaftar, kamu langsung masuk.', type: 'ok' });
        } else {
          setMsg({ text: 'Kode cocok. Masuk ke dashboard…', type: 'ok' });
        }

        setTimeout(() => {
          onLoginSuccess(user, data.token);
          setSigninPopOpen(false);
          onNavigateToApp();
        }, 500);
      } else {
        setMsg({ text: data.message || 'Kode salah.', type: 'bad' });
      }
    } catch {
      setMsg({ text: 'Gagal verifikasi kode.', type: 'bad' });
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

  const inclusions = [
    'Semua tab sinyal, level dan Trade Plan',
    'Data Sesi 1 dan Penutupan setiap hari bursa',
    'VCP, Money Flow, Frequency Analyzer, asing dan pemegang saham',
    'Kalkulator lot, Jurnal dan Video tutorial',
  ];

  const renderSigninForm = () => (
    <div className="signin" id="masuk">
      <h2 id="si-title">{authMode === 'daftar' ? 'Daftar dan mulai belajar' : 'Masuk ke akun'}</h2>
      <p className="sub" id="si-sub">
        Isi email kamu, kami kirim kode 6 digit. Akunmu langsung dibuatkan, tanpa password.
      </p>
      <p className="nextnote" id="nextnote" hidden>
        Setelah kodenya benar, kamu langsung ke halaman Langganan untuk memilih paket dan membayar.
      </p>

      {authStep === 1 ? (
        <form id="f1" onSubmit={handleSendCode}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button id="b1" type="submit" disabled={loading} className="cursor-pointer">
            {loading ? 'Mengirim kode…' : authMode === 'daftar' ? 'Daftar, kirim kode' : 'Masuk, kirim kode'}
          </button>

          {email.trim() && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDirectLogin()}
              className="cursor-pointer"
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--up)',
                color: 'var(--up)',
                background: 'transparent',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>✓</span>
              <span>Masuk Langsung Tanpa Tunggu Kode OTP</span>
            </button>
          )}

          {/* Quick Demo Button */}
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
            <button
              type="button"
              className="btn ghost cursor-pointer"
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => handleDirectLogin('tamu@penyembuhluka.id')}
            >
              <span>⚡</span>
              <span>Masuk Cepat Demo (Langsung ke Dashboard)</span>
            </button>
          </div>

          <p className="hint">Kodenya masuk ke inbox kamu. Kalau belum ada, cek folder Promosi atau Spam.</p>
          <p className="swap" id="si-swap">
            <span id="si-swap-t">{authMode === 'daftar' ? 'Sudah punya akun?' : 'Belum punya akun?'}</span>{' '}
            <button
              type="button"
              className="link cursor-pointer"
              id="si-swap-b"
              onClick={() => {
                setAuthMode(authMode === 'daftar' ? 'masuk' : 'daftar');
                setMsg({ text: '', type: '' });
              }}
            >
              {authMode === 'daftar' ? 'Masuk' : 'Daftar'}
            </button>
          </p>
        </form>
      ) : (
        <form id="f2" onSubmit={handleVerifyCode}>
          <label htmlFor="code">
            Kode dari email <span id="to" className="font-bold">{email}</span>
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
          />
          {devCode && (
            <p className="hint" style={{ color: 'var(--up)', fontWeight: 'bold' }}>
              Mode dev kode cepat: {devCode}
            </p>
          )}
          <button id="b2" type="submit" disabled={loading} className="cursor-pointer">
            {loading ? 'Memeriksa…' : authMode === 'daftar' ? 'Selesaikan pendaftaran' : 'Masuk'}
          </button>
          <button
            type="button"
            className="link cursor-pointer"
            onClick={() => handleDirectLogin()}
            style={{ marginTop: '6px', fontSize: '12px', color: 'var(--up)', fontWeight: 600 }}
          >
            Lewati verifikasi &amp; langsung masuk ke dashboard
          </button>
          <button className="link cursor-pointer" id="resend" type="button" onClick={() => handleSendCode()}>
            Kirim ulang kode
          </button>
          <button
            className="link cursor-pointer"
            id="back"
            type="button"
            onClick={() => {
              setAuthStep(1);
              setCode('');
              setMsg({ text: '', type: '' });
            }}
          >
            Ganti email
          </button>
        </form>
      )}

      {msg.text && (
        <p className={`msg ${msg.type === 'ok' ? 'ok' : msg.type === 'bad' ? 'bad' : ''}`} id="msg" role="status">
          {msg.text}
        </p>
      )}

      <p className="foot">Satu email untuk satu pelanggan. Alat bantu analisis, bukan rekomendasi beli atau jual.</p>
    </div>
  );

  return (
    <>
      {/* Top Header */}
      <header className="top on" id="top">
        <div className="wrap">
          <a className="brand" href="/">
            <img src="/logo.svg?v=2" width="32" height="32" alt="" />
            <span>Penyembuh Luka</span>
          </a>
          <nav className="nav" aria-label="Bagian halaman">
            <a href="#cara-kerja">Yang kamu pelajari</a>
            <a href="#video">Materi belajar</a>
            <a href="#fitur">Alat praktik</a>
            <a href="#harga">Gabung belajar</a>
            <a href="#faq">FAQ</a>
          </nav>
          {user ? (
            <button
              className="go cursor-pointer"
              onClick={onNavigateToApp}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Buka Dashboard</span>
              <span>→</span>
            </button>
          ) : (
            <>
              <a
                className="go ghost cursor-pointer"
                href="#daftar"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthMode('daftar');
                  setSigninPopOpen(true);
                }}
              >
                Daftar
              </a>
              <a
                className="go cursor-pointer"
                href="#masuk"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthMode('masuk');
                  setSigninPopOpen(true);
                }}
              >
                Masuk
              </a>
            </>
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

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="hero" aria-labelledby="judul">
          <div className="wrap">
            <div>
              <p className="pill">
                <i aria-hidden="true"></i>Belajar saham dengan data BEI · diperbarui 2 kali sehari
              </p>
              <h1 id="judul">
                Dari bingung jadi <em>paham</em> pilih saham.
              </h1>
              <p className="lead">Belajar langkah demi langkah: lihat tren, tunggu tanda, pasang batas rugi.</p>
              <div className="hero-cta">
                <a
                  className="btn"
                  href="#daftar"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthMode('daftar');
                    setSigninPopOpen(true);
                  }}
                >
                  Mulai belajar
                </a>
                <a className="btn ghost" href="#cara-kerja">
                  Lihat yang dipelajari
                </a>
                <button
                  type="button"
                  className="btn ghost cursor-pointer"
                  onClick={onNavigateToApp}
                  style={{ borderColor: 'var(--up)', color: 'var(--up)', fontWeight: 700 }}
                  title="Langsung jelajahi Dashboard & Screener Saham"
                >
                  Buka Screener Saham →
                </button>
              </div>
              <ul className="facts">
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  <span>
                    <b>900+</b> saham BEI
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  <span>
                    <b>Sesi 1</b> dan <b>Penutupan</b>
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  <span>Video tutorial per fitur</span>
                </li>
              </ul>
            </div>

            <Mascot />

            {/* In mobile, zone-masuk appears right here in the hero grid */}
            <div className="zone" id="zona-masuk">
              <p className="ztag">
                <i aria-hidden="true"></i>Daftar atau masuk
              </p>
              {renderSigninForm()}
            </div>
          </div>

          {/* Show / Product Mockup Images */}
          <div className="show">
            <div
              className="frame cursor-pointer"
              onClick={onNavigateToApp}
              title="Klik untuk membuka Screener Penyembuh Luka"
            >
              <div className="bar" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
              </div>
              <img
                className="lt"
                src="/landing/sinyal-terang.jpg"
                width="1600"
                height="1000"
                alt="Halaman Sinyal di laptop: strip harga, status pasar, tab Sinyal baru, Menunggu konfirmasi dan Terkonfirmasi, dan kartu sinyal dengan batas breakout, invalidasi dan target"
              />
              <img
                className="dk"
                src="/landing/sinyal-gelap.jpg"
                width="1600"
                height="1000"
                alt="Halaman Sinyal di laptop, tema gelap"
                loading="lazy"
              />
            </div>
            <div
              className="phone cursor-pointer"
              aria-hidden="true"
              onClick={onNavigateToApp}
              title="Klik untuk membuka Screener Penyembuh Luka"
            >
              <img className="dk" src="/landing/hp-gelap.jpg" width="600" height="1298" alt="" loading="lazy" />
              <img className="lt" src="/landing/hp-terang.jpg" width="600" height="1298" alt="" loading="lazy" />
            </div>
          </div>
          <div className="after-show"></div>
        </section>

        {/* Section: Yang kamu pelajari */}
        <section id="cara-kerja" className="alt">
          <div className="wrap">
            <p className="eyebrow">Yang kamu pelajari</p>
            <h2 className="sec">Dari sinyal sampai rencana masuk, dalam tiga tahap</h2>
            <p className="sec-lead">
              Setiap saham melewati tahap yang sama, dengan aturan yang sama setiap hari. Kamu tidak perlu membuka grafik satu per satu untuk tahu saham mana yang perlu diperhatikan.
            </p>
            <div className="steps">
              <div className="step">
                <div className="n">
                  01<span className="tag">▲ Pullback</span>
                </div>
                <h3>Sinyal baru</h3>
                <p>Saham dengan momentum kuat yang harganya sedang turun sehat. Masuk daftar pantau dulu, belum waktunya masuk.</p>
              </div>
              <div className="step">
                <div className="n">
                  02<span className="tag b">◆ HAKA</span>
                </div>
                <h3>Menunggu konfirmasi</h3>
                <p>Muncul candle bullish dalam 5 candle setelah pullback. Tinggal menunggu syarat konfirmasinya terpenuhi.</p>
              </div>
              <div className="step on">
                <div className="n">
                  03<span className="tag a">● HAKA Momentum</span>
                </div>
                <h3>Terkonfirmasi</h3>
                <p>Lolos semua syarat. Harga acuannya open sesi berikutnya, dan invalidasi serta target langsung dikunci.</p>
              </div>
              <div className="step">
                <div className="n">
                  +<span className="tag g">Trade plan</span>
                </div>
                <h3>Lot dari risikomu</h3>
                <p>Jumlah lot dihitung dari jarak ke invalidasi dan risiko per trade. Atur modalmu sendiri di Kalkulator, lalu catat di Jurnal.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Materi belajar (Tutorial Videos) */}
        <section id="video">
          <div className="wrap">
            <p className="eyebrow">Materi belajar</p>
            <h2 className="sec">Lihat cara pakainya, satu fitur satu video</h2>
            <p className="sec-lead">
              Video pendek 30 detik sampai 1,5 menit, direkam di HP dengan data uji. Pilih fitur di kanan, videonya langsung diputar.
            </p>
            <div className="vid">
              <div className="vphone">
                {selectedVideo && (
                  <>
                    <video
                      id="lv"
                      controls
                      playsInline
                      preload="none"
                      key={selectedVideo.id}
                      poster={selectedVideo.poster}
                      aria-label="Video tutorial"
                    >
                      <source id="lv-src" src={selectedVideo.videoUrl} type="video/mp4" />
                    </video>
                    <p className="cap" id="lv-cap">
                      {selectedVideo.title} · {selectedVideo.duration}
                    </p>
                  </>
                )}
              </div>
              <div>
                <ul className="vlist" id="vlist" aria-label="Daftar video tutorial">
                  {videos.map((vid) => {
                    const isPressed = selectedVideo?.id === vid.id;
                    return (
                      <li key={vid.id}>
                        <button
                          type="button"
                          aria-pressed={isPressed}
                          onClick={() => setSelectedVideo(vid)}
                        >
                          <span className="ic">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M7 4.5v15l13-7.5z" />
                            </svg>
                          </span>
                          <b>{vid.title}</b>
                          <span>{vid.description}</span>
                          <small>{vid.duration}</small>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="vfull">
                  <button
                    type="button"
                    className="pv"
                    id="vfull-open"
                    aria-label="Putar video lengkap, sekitar 6 menit"
                    onClick={() => setVbigOpen(true)}
                  >
                    <img src="/video/tutorial-penyembuh-luka.jpg" width="1280" height="720" alt="" loading="lazy" />
                    <i aria-hidden="true">
                      <span>
                        <svg viewBox="0 0 24 24">
                          <path d="M7 4.5v15l13-7.5z" />
                        </svg>
                      </span>
                    </i>
                  </button>
                  <div>
                    <h3>Video lengkap, sekitar 6 menit</h3>
                    <p>
                      Cara membaca dashboard dari awal: daftar saham, grafik dan levelnya, kalkulator lot, cek posisi, dan contoh price action. Bukan ajakan membeli atau menjual saham.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Alat praktik */}
        <section id="fitur" className="alt">
          <div className="wrap">
            <div className="feat">
              <div>
                <p className="eyebrow">Alat praktik</p>
                <h2 className="sec">Satu saham, semua yang perlu kamu cek</h2>
                <ul className="ticks">
                  <li>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    <span>
                      <b>Periode sekaligus jangka momentum.</b> 3, 6, 9 bulan atau 1 tahun mengatur grafik dan Momentum Score serta Momentum Ranking.
                    </span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    <span>
                      <b>Indikator dalam satu tempat.</b> MA5 sampai MA200, support &amp; resistance, trendline, chart pattern, VCP, Fibonacci, frekuensi dan asing.
                    </span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    <span>
                      <b>Trade Plan dan Checklist.</b> Batas breakout, invalidasi, target dan lot, plus syarat mana yang sudah lolos.
                    </span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    <span>
                      <b>Simpan grafik jadi gambar</b> dengan satu tombol.
                    </span>
                  </li>
                </ul>
              </div>
              <div
                className="frame cursor-pointer"
                onClick={onNavigateToApp}
                title="Buka Analisis Saham"
              >
                <img
                  className="lt"
                  src="/landing/analysis-terang.jpg"
                  width="1600"
                  height="1000"
                  alt="Halaman Analysis: grafik candle dengan level breakout, invalidasi dan target, panel status, Trade Plan dan Tools Analisis Cepat"
                  loading="lazy"
                />
                <img
                  className="dk"
                  src="/landing/analysis-gelap.jpg"
                  width="1600"
                  height="1000"
                  alt="Halaman Analysis, tema gelap"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="grid3">
              <div>
                <h3>Momentum Score &amp; Ranking</h3>
                <p>Seberapa kuat saham dibanding IHSG dan dibanding saham lain, dari Pemimpin sampai Lemah.</p>
              </div>
              <div>
                <h3>VCP</h3>
                <p>Kontraksi harga yang makin dangkal dan garis pivotnya, dengan setelan Ketat, Sedang atau Longgar.</p>
              </div>
              <div>
                <h3>Money Flow Tracker</h3>
                <p>Aliran dana asing dan semua investor per saham dan per sektor.</p>
              </div>
              <div>
                <h3>Frequency Analyzer</h3>
                <p>Lonjakan jumlah transaksi dibanding rata-rata 20 hari.</p>
              </div>
              <div>
                <h3>Pemegang saham &amp; orang dalam</h3>
                <p>Komposisi pemegang saham dan transaksi direksi, komisaris dan pengendali dari laporan resmi BEI.</p>
              </div>
              <div>
                <h3>Peta, sektor &amp; grup</h3>
                <p>Peta saham, rotasi sektor dan grup konglomerat dalam satu menu.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Gabung belajar (Plans) */}
        <section id="harga">
          <div className="wrap">
            <div style={{ textAlign: 'center' }}>
              <p className="eyebrow">Gabung belajar</p>
              <h2 className="sec">Satu langganan, semua fitur</h2>
              <p className="sec-lead" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                Daftar pakai email dulu, lalu pilih paket dan bayar di halaman Langganan. Akun aktif setelah pembayaran terkonfirmasi.
              </p>
            </div>

            <div className="plans" id="plans" aria-live="polite">
              {plans.map((p) => {
                const soon = !(Number(p.price) > 0);
                return (
                  <div className="plan" key={p.id}>
                    <div className="name">
                      Langganan {p.label || p.days + ' hari'}
                      <span>{p.days} hari</span>
                    </div>
                    <div className="price">{soon ? 'Segera hadir' : formatRp(Number(p.price))}</div>
                    <div className="per">
                      {soon ? 'Paket ini belum dibuka' : 'untuk ' + p.days + ' hari akses penuh'}
                    </div>
                    <ul>
                      {inclusions.map((t, idx) => (
                        <li key={idx}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                    {!soon && (
                      <a
                        className="btn"
                        href="/?next=/langganan#masuk"
                        data-pay
                        onClick={(e) => {
                          e.preventDefault();
                          setAuthMode('masuk');
                          setSigninPopOpen(true);
                        }}
                      >
                        Berlangganan
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="paynote" id="paynote">
              {paymentMode === 'midtrans' ? (
                <>
                  <span>Bayar online lewat</span> <span className="chip">Midtrans</span>{' '}
                  <span>(QRIS, e-wallet atau virtual account)</span>
                </>
              ) : (
                <>
                  <span>Bayar dengan</span> <span className="chip">QRIS</span> <span>atau</span>{' '}
                  <span className="chip">Transfer bank</span>
                </>
              )}
            </p>
          </div>
        </section>

        {/* Section: FAQ */}
        <section id="faq" className="alt">
          <div className="wrap">
            <div style={{ textAlign: 'center' }}>
              <p className="eyebrow">FAQ</p>
              <h2 className="sec">Pertanyaan yang sering masuk</h2>
            </div>
            <div className="faq">
              {faq.map((item) => (
                <details key={item.id}>
                  <summary>
                    {item.question}
                    <i aria-hidden="true"></i>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Section: End CTA */}
        <section className="end">
          <div className="wrap">
            <div className="endbox">
              <div>
                <h2>Lihat sinyal hari ini</h2>
                <p>Masuk pakai email, ambil kodenya, dan kamu langsung ke dashboard.</p>
              </div>
              <a
                className="btn"
                href="#daftar"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthMode('daftar');
                  setSigninPopOpen(true);
                }}
              >
                Mulai belajar
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <p>
            <b style={{ color: 'var(--ink)' }}>Penyembuh Luka</b> · Alat bantu analisis saham, bukan rekomendasi beli atau jual. Semua keputusan dan risiko investasi ada di tangan kamu. Harga dan data bisa tertunda.
          </p>
          <nav aria-label="Tautan bawah">
            <a href="#video">Materi belajar</a>
            <a href="#harga">Gabung belajar</a>
            <a href="#faq">FAQ</a>
            <a
              href="#daftar"
              onClick={(e) => {
                e.preventDefault();
                setAuthMode('daftar');
                setSigninPopOpen(true);
              }}
            >
              Daftar
            </a>
            <a
              href="#masuk"
              onClick={(e) => {
                e.preventDefault();
                setAuthMode('masuk');
                setSigninPopOpen(true);
              }}
            >
              Masuk
            </a>
          </nav>
        </div>
      </footer>

      {/* Desktop Dialog: signin-pop */}
      {signinPopOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,14,16,0.62)] backdrop-blur-xs"
          onClick={() => setSigninPopOpen(false)}
        >
          <div
            className="relative w-full max-w-[440px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-3.5 -right-3.5 w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] flex items-center justify-center text-sm font-bold shadow-md hover:bg-[var(--bg2)] cursor-pointer z-10"
              onClick={() => setSigninPopOpen(false)}
              aria-label="Tutup"
            >
              ✕
            </button>
            {renderSigninForm()}
          </div>
        </div>
      )}

      {/* Full Video Modal: vbig */}
      {vbigOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(5,10,12,0.85)] backdrop-blur-md"
          onClick={() => setVbigOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 cursor-pointer"
              onClick={() => setVbigOpen(false)}
              aria-label="Tutup video"
            >
              ✕
            </button>
            <video
              id="vbig-v"
              controls
              autoPlay
              playsInline
              poster="/video/tutorial-penyembuh-luka.jpg"
              className="w-full aspect-video object-contain"
            >
              <source src="/media/tutorial.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </>
  );
};
