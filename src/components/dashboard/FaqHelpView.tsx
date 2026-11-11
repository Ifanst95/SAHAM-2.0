import React, { useState } from 'react';
import { FaqData } from '../../types.ts';

interface FaqHelpViewProps {
  faq: FaqData[];
  onOpenVideo: () => void;
}

export const FaqHelpView: React.FC<FaqHelpViewProps> = ({ faq, onOpenVideo }) => {
  const [search, setSearch] = useState('');

  const filteredFaq = faq.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <div>
          <h2 className="font-serif text-2xl font-bold">FAQ &amp; Bantuan Belajar</h2>
          <p className="text-xs text-[#80887f]">
            Panduan lengkap memahami alur sinyal, cara kerja kalkulator risiko, dan aturan screener.
          </p>
        </div>

        <button
          onClick={onOpenVideo}
          className="px-4 py-2 rounded-xl bg-[#1d7a5c] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          ▶ Buka Video Tutorial
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d]">
        <input
          type="text"
          placeholder="Cari pertanyaan, istilah (Pullback, HAKA, ATR, Invalidasi)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-[#f6f2ea] dark:bg-[#121c20] border border-[#d6ccbb] dark:border-[#304349] text-xs font-semibold"
        />
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-2">
        {filteredFaq.map((item) => (
          <details
            key={item.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] cursor-pointer group"
          >
            <summary className="font-bold text-sm list-none flex items-center justify-between">
              <span>{item.question}</span>
              <span className="text-[#80887f] group-open:rotate-180 transition-transform text-sm">
                ▾
              </span>
            </summary>
            <p className="text-xs text-[#56625f] dark:text-[#a9b3ad] mt-3 leading-relaxed border-t border-[#e5ddd0] dark:border-[#26363d] pt-3">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
};
