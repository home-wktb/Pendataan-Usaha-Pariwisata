import React, { useEffect, useState } from 'react';
import { ImagePlus, Share2, Trash2, X } from 'lucide-react';
import { resizeLogoFile } from '../utils/exportImport';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsSheetProps {
  open: boolean;
  petugas: string;
  logoKiri: string | null;
  logoKanan: string | null;
  onClose: () => void;
  onSave: (next: { petugas: string; logoKiri: string | null; logoKanan: string | null }) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  open,
  petugas,
  logoKiri,
  logoKanan,
  onClose,
  onSave,
  onNotify,
}) => {
  const [nama, setNama] = useState(petugas);
  const [tempKiri, setTempKiri] = useState<string | null>(logoKiri);
  const [tempKanan, setTempKanan] = useState<string | null>(logoKanan);
  const [loadingLogo, setLoadingLogo] = useState<'kiri' | 'kanan' | null>(null);

  useEffect(() => {
    if (open) {
      setNama(petugas);
      setTempKiri(logoKiri);
      setTempKanan(logoKanan);
    }
  }, [open, petugas, logoKiri, logoKanan]);

  if (!open) return null;

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: 'kiri' | 'kanan'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoadingLogo(side);
    try {
      const dataUrl = await resizeLogoFile(file);
      if (side === 'kiri') setTempKiri(dataUrl);
      else setTempKanan(dataUrl);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Gagal memproses logo', 'error');
    } finally {
      setLoadingLogo(null);
      event.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nama.trim();
    if (!trimmed) {
      onNotify('Nama petugas atau tim wajib diisi.', 'error');
      return;
    }
    onSave({
      petugas: trimmed,
      logoKiri: tempKiri,
      logoKanan: tempKanan,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-sheet-title"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 pb-8 shadow-2xl sm:rounded-2xl sm:pb-6">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="settings-sheet-title" className="text-lg font-bold text-slate-900">
              Pengaturan Petugas & Kop Surat
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Identitas petugas dan logo disimpan lokal di perangkat ini untuk bekerja tanpa internet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Tutup pengaturan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label htmlFor="settings-petugas" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Nama Petugas / Tim <span className="text-rose-600">*</span>
            </label>
            <input
              id="settings-petugas"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi - Tim Wangi-Wangi"
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 transition-colors focus:border-sky-700 focus:bg-white focus:ring-2 focus:ring-sky-700/15 focus:outline-none"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Logo Kop Surat Resmi</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white p-2">
                  {tempKiri ? (
                    <img
                      src={tempKiri}
                      alt="Pratinjau Logo Kiri"
                      className="max-h-16 max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-center text-xs text-slate-400">Logo Kiri<br />(Kabupaten)</span>
                  )}
                </div>
                <div className="mt-2.5 flex w-full items-center gap-1.5">
                  <label className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800">
                    <ImagePlus className="h-3.5 w-3.5 shrink-0" />
                    <span>{loadingLogo === 'kiri' ? 'Memuat...' : 'Pilih Kiri'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleLogoChange(e, 'kiri')}
                    />
                  </label>
                  {tempKiri && (
                    <button
                      type="button"
                      onClick={() => setTempKiri(null)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50"
                      aria-label="Hapus logo kiri"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white p-2">
                  {tempKanan ? (
                    <img
                      src={tempKanan}
                      alt="Pratinjau Logo Kanan"
                      className="max-h-16 max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-center text-xs text-slate-400">Logo Kanan<br />(Wakatobi)</span>
                  )}
                </div>
                <div className="mt-2.5 flex w-full items-center gap-1.5">
                  <label className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800">
                    <ImagePlus className="h-3.5 w-3.5 shrink-0" />
                    <span>{loadingLogo === 'kanan' ? 'Memuat...' : 'Pilih Kanan'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleLogoChange(e, 'kanan')}
                    />
                  </label>
                  {tempKanan && (
                    <button
                      type="button"
                      onClick={() => setTempKanan(null)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50"
                      aria-label="Hapus logo kanan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-slate-200 pt-4">
            <p className="text-sm font-semibold text-slate-800">Aplikasi Android / Bagikan ke Tim</p>
            <PWAInstallButton variant="full" />
            <button
              type="button"
              onClick={async () => {
                const url = window.location.origin;
                const shareData = {
                  title: 'Kuesioner Pariwisata Wakatobi',
                  text: 'Buka link ini di Chrome HP Android lalu ketuk "Pasang App" agar ikon aplikasi terpasang dan bisa dipakai offline di lapangan:',
                  url,
                };
                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                    return;
                  }
                } catch (err) {
                  if (err instanceof Error && err.name === 'AbortError') return;
                }
                try {
                  await navigator.clipboard.writeText(url);
                  onNotify('Link aplikasi disalin! Silakan kirim ke grup WhatsApp tim.', 'success');
                } catch {
                  onNotify(`Salin link ini untuk dibagikan: ${url}`, 'success');
                }
              }}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 transition-colors hover:bg-sky-100"
            >
              <Share2 className="h-4 w-4 shrink-0" />
              <span>Bagikan Link Aplikasi ke Tim (WA)</span>
            </button>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
            Catatan penyimpanan: Data tersimpan aman di penyimpanan lokal browser (IndexedDB &amp; LocalStorage). Jangan hapus data situs browser sebelum mengirim atau mem-backup data ke admin.
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex min-h-[48px] flex-[2] items-center justify-center rounded-xl bg-sky-900 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
