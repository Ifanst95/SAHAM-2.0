import React, { useState } from 'react';
import { VideoData } from '../../types.ts';
import { TutorialVideoModal } from '../TutorialVideoModal.tsx';

interface TutorialVideosViewProps {
  videos: VideoData[];
}

export const TutorialVideosView: React.FC<TutorialVideosViewProps> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(videos[0] || null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialVideo, setModalInitialVideo] = useState<VideoData | null>(null);

  const handlePlayFull = () => {
    setModalInitialVideo(null);
    setModalOpen(true);
  };

  const handlePlayModule = (vid: VideoData) => {
    setSelectedVideo(vid);
    setModalInitialVideo(vid);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold">Materi Belajar: Video Tutorial</h2>
          <p className="text-xs text-[#80887f]">
            Satu fitur satu video. Pelajari cara memanfaatkan setiap modul dashboard Penyembuh Luka.
          </p>
        </div>

        <button
          onClick={handlePlayFull}
          className="px-4 py-2 rounded-xl bg-[#1d7a5c] text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          ▶ Putar Video Lengkap (6 Menit)
        </button>
      </div>

      {/* Main Video Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Player Area */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-3">
            {selectedVideo && (
              <div className="space-y-3">
                <div
                  className="aspect-video w-full rounded-xl overflow-hidden bg-black relative flex items-center justify-center cursor-pointer group"
                  onClick={() => handlePlayModule(selectedVideo)}
                  title="Klik untuk memutar video tutorial interaktif"
                >
                  <img
                    src={selectedVideo.poster}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#1d7a5c] text-white flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-transform">
                      ▶
                    </div>
                    <span className="text-xs text-white/90 font-bold mt-2">
                      Klik untuk Putar Video Interaktif
                    </span>
                  </div>
                </div>
                <div>
                  <b className="text-lg font-bold block">{selectedVideo.title}</b>
                  <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mt-1">
                    {selectedVideo.description}
                  </p>
                  <span className="text-[11px] text-[#80887f] font-semibold mt-2 inline-block">
                    Durasi: {selectedVideo.duration}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Playlist */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] space-y-2 max-h-[500px] overflow-y-auto scrollbar-none">
          <span className="text-xs font-bold text-[#80887f] uppercase block mb-1">
            Daftar Modul Tutorial ({videos.length})
          </span>
          {videos.map((vid) => {
            const isCurrent = selectedVideo?.id === vid.id;
            return (
              <div
                key={vid.id}
                onClick={() => handlePlayModule(vid)}
                className={`p-3 rounded-xl cursor-pointer transition-colors space-y-1 ${
                  isCurrent
                    ? 'bg-[#1d7a5c]/15 border border-[#1d7a5c]/40'
                    : 'bg-[#f6f2ea] dark:bg-[#121c20] hover:bg-[#efe9dd]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <b className="text-xs">{vid.title}</b>
                  <span className="text-[10px] text-[#80887f] font-bold">{vid.duration}</span>
                </div>
                <p className="text-[11px] text-[#56625f] dark:text-[#a9b3ad] line-clamp-1">
                  {vid.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL VIDEO POPUP */}
      <TutorialVideoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialVideo={modalInitialVideo}
        videos={videos}
      />
    </div>
  );
};
