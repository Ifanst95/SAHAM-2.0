import React from 'react';
import { UserData } from '../../types.ts';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onLogout: () => void;
  onNavigateToPlans: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigateToPlans,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#1a2a30] border border-[#e5ddd0] dark:border-[#26363d] shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd0] dark:border-[#26363d]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#1d7a5c]/10 text-[#1d7a5c] font-black text-sm flex items-center justify-center border border-[#1d7a5c]/30">
              {user?.email?.slice(0, 2).toUpperCase() || 'PL'}
            </div>
            <div>
              <b className="font-serif text-base block font-bold">Akun Saya</b>
              <span className="text-xs text-[#80887f]">{user?.email || 'Belum masuk'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#e5ddd0] flex items-center justify-center text-xs hover:bg-[#efe9dd] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status card */}
        <div className="p-4 rounded-2xl bg-[#f6f2ea] dark:bg-[#121c20] space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#80887f]">Status Langganan:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#1d7a5c] text-white">
              {user?.subscriptionActive ? 'AKUN AKTIF' : 'BELUM AKTIF'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#80887f]">Tipe Akun:</span>
            <b className="capitalize">{user?.role || 'Member'}</b>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#80887f]">Masa Aktif Sampai:</span>
            <b>{user?.subscriptionExpires || '31 Desember 2027'}</b>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#80887f]">Sesi Aktif:</span>
            <span className="text-[#1d7a5c] font-bold">1 Perangkat (Online)</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToPlans();
            }}
            className="w-full py-2.5 rounded-xl bg-[#1d7a5c] text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer text-center"
          >
            Kelola / Perpanjang Paket Langganan
          </button>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl border border-[#d6ccbb] dark:border-[#304349] font-bold text-xs text-[#c4554a] hover:bg-[#c4554a]/10 transition-colors cursor-pointer text-center"
          >
            Keluar dari Akun (Logout)
          </button>
        </div>
      </div>
    </div>
  );
};
