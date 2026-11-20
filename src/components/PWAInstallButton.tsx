import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'full') {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Aplikasi sudah terpasang di perangkat dan siap digunakan secara offline.
        </div>
      );
    }
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'full'
            ? 'flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-sky-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800 active:scale-[0.99]'
            : 'inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 active:scale-[0.98]'
        }
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Pasang App</span>
      </button>
    );
  }

  return (
    <>
      {variant === 'full' ? (
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
        >
          <Smartphone className="h-4 w-4 shrink-0 text-sky-800" />
          <span>Cara Pasang ke Layar Utama HP</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/25"
          title="Pasang Aplikasi ke HP"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Pasang App</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
        >
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-xl sm:rounded-2xl sm:pb-6">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="install-guide-title" className="text-lg font-bold text-slate-900">
                  Pasang ke Layar Utama
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Gunakan seperti aplikasi Android asli agar lebih cepat dibuka saat offline di lapangan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Tutup panduan"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <li>1. Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari.</li>
                <li>2. Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama</strong>.</li>
                <li>3. Ketuk <strong>Tambah</strong> di pojok kanan atas.</li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <li>1. Buka aplikasi ini di browser <strong>Google Chrome</strong> Android.</li>
                <li>2. Ketuk ikon menu titik tiga <strong>(⋮)</strong> di pojok kanan atas browser.</li>
                <li>3. Pilih <strong>Tambahkan ke layar utama</strong> atau <strong>Instal aplikasi</strong>.</li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-sky-900 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
