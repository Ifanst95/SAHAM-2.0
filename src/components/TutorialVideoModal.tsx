import React, { useState, useEffect, useRef } from 'react';
import { VideoData } from '../types.ts';

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideo?: VideoData | null;
  videos?: VideoData[];
}

interface Chapter {
  title: string;
  startTime: number; // in seconds
  duration: number;
  badge: string;
  description: string;
  subtitles: string;
}

const FULL_TUTORIAL_CHAPTERS: Chapter[] = [
  {
    title: '1. Pengenalan & Navigasi Dashboard BEI',
    startTime: 0,
    duration: 65,
    badge: 'BEI Live Feed',
    description: 'Mengenal strip ticker harga real-time, status sesi bursa (Sesi 1 & Penutupan), serta indikator pasar IHSG.',
    subtitles: 'Selamat datang di Penyembuh Luka. Dashboard ini memantau lebih dari 900 saham Bursa Efek Indonesia secara real-time, terintegrasi dengan data BEI, KSEI, dan OJK.',
  },
  {
    title: '2. Membaca Sinyal: Pullback, HAKA & Konfirmasi',
    startTime: 65,
    duration: 85,
    badge: 'Sinyal Momentum',
    description: 'Memahami 3 tahapan sinyal: Sinyal Baru (Pullback), Menunggu Konfirmasi (HAKA), dan Terkonfirmasi (Open Sesi Berikutnya).',
    subtitles: 'Setiap saham yang lolos screener dianalisis berdasarkan momentum price action. Saham kuat yang sedang pullback masuk tab Sinyal Baru sebelum diverifikasi.',
  },
  {
    title: '3. Menentukan Batas Breakout, Invalidasi & Target',
    startTime: 150,
    duration: 80,
    badge: 'Level Kunci',
    description: 'Level harga objektif: batas beli saat breakout, batas invalidasi (stop loss terukur), dan target profit multi-tahap.',
    subtitles: 'Level invalidasi dikunci secara ketat. Anda langsung tahu di mana batas risiko maksimal sebelum memutuskan membuka posisi trading.',
  },
  {
    title: '4. Kalkulator Lot & Trade Plan Berdasarkan Risiko',
    startTime: 230,
    duration: 75,
    badge: 'Risk Management',
    description: 'Menghitung jumlah lot yang aman berdasarkan modal Anda dan persentase toleransi risiko (1%-2% per trade).',
    subtitles: 'Kalkulator lot otomatis menghitung jumlah lot maksimal berdasarkan jarak harga beli ke batas invalidasi, melindungi modal dari kerugian berlebih.',
  },
  {
    title: '5. Money Flow, VCP, & Keterbukaan KSEI / OJK',
    startTime: 305,
    duration: 65,
    badge: 'KSEI & OJK Filings',
    description: 'Menganalisis akumulasi asing, lonjakan frekuensi transaksi, dan data kepemilikan saham pengendali resmi KSEI.',
    subtitles: 'Fitur Money Flow dan Keterbukaan KSEI menyajikan data akumulasi investor institusi dan aksi korporasi yang telah divalidasi oleh OJK.',
  },
];

export const TutorialVideoModal: React.FC<TutorialVideoModalProps> = ({
  isOpen,
  onClose,
  initialVideo,
  videos = [],
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [activeTab, setActiveTab] = useState<'interactive' | 'modules'>('interactive');
  const [selectedModule, setSelectedModule] = useState<VideoData | null>(initialVideo || (videos.length > 0 ? videos[0] : null));

  const totalDuration = 370; // 6 mins 10 secs
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (initialVideo) {
      setSelectedModule(initialVideo);
    }
  }, [initialVideo]);

  // Simulated animated video playback loop
  useEffect(() => {
    if (isOpen && isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, playbackSpeed, totalDuration]);

  if (!isOpen) return null;

  // Find active chapter
  let currentChapter = FULL_TUTORIAL_CHAPTERS[0];
  for (const ch of FULL_TUTORIAL_CHAPTERS) {
    if (currentTime >= ch.startTime) {
      currentChapter = ch;
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.min(totalDuration, Math.max(0, pos * totalDuration)));
  };

  const jumpToChapter = (startTime: number) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#121c20] text-[#f3eee4] rounded-2xl sm:rounded-3xl border border-[#304349] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#26363d] bg-[#152227]/90">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4fbf93] animate-pulse"></span>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Tutorial Penyembuh Luka</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#1d7a5c]/30 text-[#4fbf93] font-sans font-semibold border border-[#1d7a5c]/40">
                  Panduan Lengkap (6 Menit)
                </span>
              </h3>
              <p className="text-[11px] text-[#86908b] hidden sm:block">
                Tutorial interaktif cara membaca sinyal, level teknikal, kalkulator lot, dan keterbukaan KSEI/OJK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'interactive' ? 'modules' : 'interactive')}
              className="px-3 py-1.5 rounded-xl bg-[#1f3138] hover:bg-[#2c4047] text-xs font-semibold text-[#f3eee4] border border-[#304349] transition-colors cursor-pointer"
            >
              {activeTab === 'interactive' ? '📂 Pilih Modul Fitur' : '▶ Video Lengkap (6 Menit)'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1f3138] hover:bg-[#c4554a] hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              aria-label="Tutup video"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Canvas & Player Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'interactive' ? (
            <div className="p-3 sm:p-5 space-y-4">
              {/* Virtual High Definition Video Screen */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0d1518] border border-[#26363d] shadow-inner flex flex-col justify-between">
                {/* Background Poster & Dynamic Screen Visuals */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="/video/tutorial-penyembuh-luka.jpg"
                    alt="Tutorial Penyembuh Luka"
                    className="w-full h-full object-cover opacity-25 filter blur-[1px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1518] via-[#0d1518]/70 to-[#0d1518]/50"></div>
                </div>

                {/* Simulated Screen Graphics & Live Demonstration Overlay */}
                <div className="relative z-10 p-4 sm:p-6 flex-1 flex flex-col justify-between">
                  {/* Top HUD Display */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-[#17242a]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-[#304349]">
                      <span className="text-[10px] font-bold text-[#4fbf93] uppercase tracking-wider">
                        {currentChapter.badge}
                      </span>
                      <span className="text-white/40 text-xs">•</span>
                      <span className="text-xs text-[#a9b3ad] font-semibold">{currentChapter.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 text-[11px] font-mono text-[#4fbf93]">
                      <span>● LIVE TUTORIAL HD</span>
                    </div>
                  </div>

                  {/* Center Visual Mockup & Interactive Demonstration Graphics */}
                  <div className="my-auto py-2">
                    <div className="max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#152227]/90 border border-[#304349] shadow-xl backdrop-blur-md text-left space-y-3">
                      <div className="flex items-center justify-between border-b border-[#26363d] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#1d7a5c] text-white text-xs font-bold">BBCA</span>
                          <span className="text-xs text-[#a9b3ad]">PT Bank Central Asia Tbk</span>
                          <span className="text-xs font-bold text-[#4fbf93]">Rp10.250 (+1,75%)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f3138] text-[#86908b] font-mono">
                          IHSG: 7.283,82
                        </span>
                      </div>

                      {/* Live Chart Simulation */}
                      <div className="h-28 sm:h-36 w-full relative flex items-end justify-between px-2 pt-4 pb-2 border-b border-[#26363d]/60 bg-black/30 rounded-xl">
                        {/* Candlesticks */}
                        {[
                          { o: 40, c: 55, h: 62, l: 36, green: true },
                          { o: 54, c: 48, h: 58, l: 44, green: false },
                          { o: 48, c: 68, h: 72, l: 45, green: true },
                          { o: 67, c: 62, h: 70, l: 58, green: false },
                          { o: 63, c: 78, h: 82, l: 60, green: true },
                          { o: 77, c: 72, h: 80, l: 70, green: false },
                          { o: 72, c: 88, h: 92, l: 70, green: true },
                          { o: 88, c: 96, h: 100, l: 85, green: true },
                        ].map((c, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full px-1">
                            <div
                              className="w-[2px] bg-white/40"
                              style={{ height: `${c.h - c.l}%`, marginBottom: `${c.l}%` }}
                            ></div>
                            <div
                              className={`w-full max-w-[14px] rounded-xs ${
                                c.green ? 'bg-[#4fbf93]' : 'bg-[#e27c70]'
                              }`}
                              style={{ height: `${Math.abs(c.c - c.o)}%`, marginBottom: `${Math.min(c.o, c.c)}%` }}
                            ></div>
                          </div>
                        ))}

                        {/* Trade Plan Line Overlays */}
                        <div className="absolute top-[18%] left-0 right-0 border-b border-dashed border-[#4fbf93] flex justify-between px-2 text-[10px] text-[#4fbf93]">
                          <span>Target 1: Rp10.600 (+3.4%)</span>
                          <span>TP1</span>
                        </div>
                        <div className="absolute top-[45%] left-0 right-0 border-b border-dashed border-[#78a6d8] flex justify-between px-2 text-[10px] text-[#78a6d8]">
                          <span>Batas Breakout: Rp10.200</span>
                          <span>ENTRY</span>
                        </div>
                        <div className="absolute bottom-[20%] left-0 right-0 border-b border-dashed border-[#e27c70] flex justify-between px-2 text-[10px] text-[#e27c70]">
                          <span>Batas Invalidasi: Rp9.850 (-3.4%)</span>
                          <span>STOP LOSS</span>
                        </div>
                      </div>

                      {/* Trade Plan Pill Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-[#1f3138]">
                          <span className="text-[10px] text-[#86908b] block">Status Sinyal</span>
                          <b className="text-[#4fbf93]">Terkonfirmasi</b>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#1f3138]">
                          <span className="text-[10px] text-[#86908b] block">Momentum Score</span>
                          <b className="text-[#f3eee4]">88/100 (Leader)</b>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#1f3138]">
                          <span className="text-[10px] text-[#86908b] block">Rasio R:R</span>
                          <b className="text-[#78a6d8]">1 : 2.5</b>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#1f3138]">
                          <span className="text-[10px] text-[#86908b] block">Rekomendasi Lot</span>
                          <b className="text-[#e3ac52]">45 Lot (Rp4,6 Juta)</b>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle / Narration Banner */}
                  <div className="bg-black/80 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-white/10 text-center">
                    <p className="text-xs sm:text-sm text-[#f3eee4] font-medium leading-relaxed">
                      💬 &ldquo;{currentChapter.subtitles}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="relative z-20 px-3 sm:px-4 py-2.5 bg-[#152227]/95 border-t border-[#26363d] flex flex-col gap-2">
                  {/* Progress Seek Bar */}
                  <div
                    className="relative w-full h-2 bg-[#26363d] rounded-full overflow-hidden cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-[#4fbf93] rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    ></div>
                    {/* Chapter Tick Marks */}
                    {FULL_TUTORIAL_CHAPTERS.map((ch, idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 w-[2px] bg-white/40"
                        style={{ left: `${(ch.startTime / totalDuration) * 100}%` }}
                        title={ch.title}
                      ></div>
                    ))}
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-7 h-7 rounded-lg bg-[#1d7a5c] hover:bg-[#4fbf93] text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
                        aria-label={isPlaying ? 'Jeda' : 'Putar'}
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </button>

                      <div className="text-[11px] font-mono text-[#a9b3ad]">
                        <span className="text-white font-bold">{formatTime(currentTime)}</span> / {formatTime(totalDuration)}
                      </div>

                      {/* Volume */}
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-xs text-[#a9b3ad] hover:text-white cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Speed selector */}
                      <div className="flex items-center gap-1 bg-[#1f3138] p-0.5 rounded-lg border border-[#304349]">
                        {[1, 1.25, 1.5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setPlaybackSpeed(s)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              playbackSpeed === s ? 'bg-[#1d7a5c] text-white' : 'text-[#86908b] hover:text-white'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => jumpToChapter(0)}
                        className="px-2 py-1 rounded bg-[#1f3138] hover:bg-[#2c4047] text-[11px] text-[#a9b3ad] cursor-pointer"
                      >
                        Ulangi ↺
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapters List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#86908b] block">
                  Daftar Pembahasan Tutorial ({FULL_TUTORIAL_CHAPTERS.length} Babak)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {FULL_TUTORIAL_CHAPTERS.map((ch, idx) => {
                    const isCurrent = currentTime >= ch.startTime && currentTime < ch.startTime + ch.duration;
                    return (
                      <div
                        key={idx}
                        onClick={() => jumpToChapter(ch.startTime)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#1d7a5c]/20 border-[#4fbf93] text-white shadow-md'
                            : 'bg-[#152227] border-[#26363d] text-[#a9b3ad] hover:bg-[#1a2a30] hover:text-[#f3eee4]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className={isCurrent ? 'text-[#4fbf93]' : 'text-[#86908b]'}>{ch.badge}</span>
                          <span className="font-mono text-[10px]">{formatTime(ch.startTime)}</span>
                        </div>
                        <b className="text-xs block line-clamp-1 text-[#f3eee4]">{ch.title}</b>
                        <p className="text-[11px] text-[#86908b] mt-1 line-clamp-2">{ch.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Module-by-module view */
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-3">
                {selectedModule && (
                  <div className="p-4 rounded-2xl bg-[#152227] border border-[#26363d] space-y-3">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
                      <img
                        src={selectedModule.poster}
                        alt={selectedModule.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                        <button
                          onClick={() => {
                            setActiveTab('interactive');
                            setIsPlaying(true);
                          }}
                          className="w-14 h-14 rounded-full bg-[#1d7a5c] text-white flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        >
                          ▶
                        </button>
                        <p className="text-xs text-white/90 mt-3 font-semibold">
                          Klik untuk memutar simulasi video {selectedModule.title}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <b className="text-base font-bold text-white">{selectedModule.title}</b>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1f3138] text-[#4fbf93] font-bold">
                          {selectedModule.duration}
                        </span>
                      </div>
                      <p className="text-xs text-[#a9b3ad] mt-1">{selectedModule.description}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Playlist of modules */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#86908b] block mb-2">
                  Daftar Fitur ({videos.length})
                </span>
                {videos.map((vid) => {
                  const isSel = selectedModule?.id === vid.id;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setSelectedModule(vid)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors space-y-1 ${
                        isSel
                          ? 'bg-[#1d7a5c]/25 border-[#4fbf93] text-white'
                          : 'bg-[#152227] border-[#26363d] text-[#a9b3ad] hover:bg-[#1a2a30]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <b className="text-xs text-[#f3eee4]">{vid.title}</b>
                        <span className="text-[10px] text-[#86908b] font-mono">{vid.duration}</span>
                      </div>
                      <p className="text-[11px] text-[#86908b] line-clamp-1">{vid.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#26363d] bg-[#152227] flex items-center justify-between text-xs text-[#86908b]">
          <span>Data pasar bersumber resmi dari Bursa Efek Indonesia (BEI), KSEI &amp; OJK</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1d7a5c] text-white font-bold hover:bg-[#4fbf93] transition-colors cursor-pointer"
          >
            Selesai Menonton
          </button>
        </div>
      </div>
    </div>
  );
};
