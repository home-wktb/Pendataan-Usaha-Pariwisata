import React from 'react';
import { ImagePlus } from 'lucide-react';

interface KopSuratProps {
  logoKiri: string | null;
  logoKanan: string | null;
  onOpenSettings: () => void;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  logoKiri,
  logoKanan,
  onOpenSettings,
}) => {
  return (
    <section
      aria-label="Kop Surat Dinas Pariwisata Kabupaten Wakatobi"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {logoKiri ? (
            <img
              src={logoKiri}
              alt="Logo Kabupaten Wakatobi"
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
              referrerPolicy="no-referrer"
            />
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-colors hover:border-sky-600 hover:text-sky-700 sm:flex"
              title="Unggah Logo Kiri"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0 flex-1 text-center">
            <p className="text-[11px] font-bold tracking-wider text-slate-700 uppercase sm:text-xs">
              Pemerintah Kabupaten Wakatobi
            </p>
            <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-slate-950 sm:text-lg">
              DINAS PARIWISATA
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-xs">
              Jalan La Ruku No. 11, Kompleks Perkantoran Motika, Kec. Wangi-Wangi Selatan
            </p>
          </div>

          {logoKanan ? (
            <img
              src={logoKanan}
              alt="Logo Pariwisata Wakatobi"
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
              referrerPolicy="no-referrer"
            />
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-colors hover:border-sky-600 hover:text-sky-700 sm:flex"
              title="Unggah Logo Kanan"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 h-0.5 w-full bg-slate-900" />
      </div>
    </section>
  );
};
