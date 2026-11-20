import React, { useEffect, useState } from 'react';
import {
  ClipboardEdit,
  Database,
  Send,
  Settings,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { DataTab } from './components/DataTab';
import { InputTab } from './components/InputTab';
import { KopSurat } from './components/KopSurat';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SettingsSheet } from './components/SettingsSheet';
import { ShareTab } from './components/ShareTab';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type { FormValues, TourismRecord } from './types/kuesioner';
import {
  BANNER_KEY,
  emptyFormValues,
  generateRecordId,
  LAST_BACKUP_KEY,
  LAST_SENT_KEY,
  loadDraft,
  loadRecords,
  loadSettings,
  LOGO_KANAN_KEY,
  LOGO_KIRI_KEY,
  PETUGAS_KEY,
  saveDraft,
  saveRecords,
  saveSettingValue,
} from './utils/storage';

type TabKey = 'form' | 'data' | 'share';

export default function App() {
  const isOnline = useOnlineStatus();

  const [activeTab, setActiveTab] = useState<TabKey>('form');
  const [records, setRecords] = useState<TourismRecord[]>([]);
  const [petugas, setPetugas] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [logoKiri, setLogoKiri] = useState<string | null>(null);
  const [logoKanan, setLogoKanan] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [form, setForm] = useState<FormValues>(() => loadDraft() || emptyFormValues());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      const [loadedRecords, loadedSettings] = await Promise.all([
        loadRecords(),
        loadSettings(),
      ]);
      if (!mounted) return;
      setRecords(loadedRecords);
      setPetugas(loadedSettings.petugas);
      setDeviceId(loadedSettings.deviceId);
      setLogoKiri(loadedSettings.logoKiri);
      setLogoKanan(loadedSettings.logoKanan);
      setLastSent(loadedSettings.lastSent);
      setLastBackup(loadedSettings.lastBackup);
      setBannerDismissed(loadedSettings.bannerDismissed);
      setHydrated(true);
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!form.id) {
      saveDraft(form);
    }
  }, [form, hydrated]);

  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ msg, type });
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const persistRecords = async (next: TourismRecord[]) => {
    setRecords(next);
    const res = await saveRecords(next);
    if (!res.ok && res.warning) {
      showToast(res.warning, 'error');
    }
  };

  const handleSaveSettings = async (next: {
    petugas: string;
    logoKiri: string | null;
    logoKanan: string | null;
  }) => {
    setPetugas(next.petugas);
    setLogoKiri(next.logoKiri);
    setLogoKanan(next.logoKanan);
    await Promise.all([
      saveSettingValue(PETUGAS_KEY, next.petugas),
      saveSettingValue(LOGO_KIRI_KEY, next.logoKiri),
      saveSettingValue(LOGO_KANAN_KEY, next.logoKanan),
    ]);
    showToast('Pengaturan petugas & kop surat disimpan.', 'success');
  };

  const handleSavePetugasInline = async (name: string) => {
    setPetugas(name);
    await saveSettingValue(PETUGAS_KEY, name);
    showToast(`Petugas "${name}" tersimpan.`, 'success');
  };

  const handleSubmitForm = async () => {
    const now = new Date().toISOString();
    const isEdit = Boolean(form.id);
    const existing = isEdit ? records.find((r) => r.id === form.id) : undefined;

    const alamatLengkap = form.alamatLengkap.trim();
    const formattedAlamat = [
      alamatLengkap,
      form.desaKelurahan,
      form.kecamatan ? `Kec. ${form.kecamatan}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    const nextRecord: TourismRecord = {
      id: form.id || generateRecordId(),
      namaUsaha: form.namaUsaha.trim(),
      noTelp: form.noTelp.trim(),
      jenisUsaha: form.jenisUsaha,
      kecamatan: form.kecamatan,
      desaKelurahan: form.desaKelurahan,
      alamatLengkap,
      alamat: formattedAlamat,
      namaPemilik: form.namaPemilik.trim(),
      jabatan: form.jabatan.trim(),
      tahunBerdiri: form.tahunBerdiri.trim(),
      nib: form.nib.trim(),
      luasLahan: form.luasLahan.trim(),
      kapasitasPengunjung: form.kapasitasPengunjung.trim(),
      fasilitas: form.fasilitas,
      jmlKamar: parseInt(form.jmlKamar, 10) || 0,
      jmlKaryawan: parseInt(form.jmlKaryawan, 10) || 0,
      lakiLaki: parseInt(form.lakiLaki, 10) || 0,
      perempuan: parseInt(form.perempuan, 10) || 0,
      ikutPelatihan: parseInt(form.ikutPelatihan, 10) || 0,
      sertifikatLSP: parseInt(form.sertifikatLSP, 10) || 0,
      catatan: form.catatan.trim(),
      petugas: petugas || 'Unknown',
      deviceId,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    const nextRecords = isEdit
      ? records.map((r) => (r.id === nextRecord.id ? nextRecord : r))
      : [nextRecord, ...records];

    await persistRecords(nextRecords);
    saveDraft(null);
    setForm(emptyFormValues());

    setInlineSuccess(
      isEdit
        ? `Data "${nextRecord.namaUsaha}" diperbarui.`
        : `Data #${nextRecords.length} (${nextRecord.namaUsaha}) tersimpan lokal. Siap input berikutnya.`
    );
    window.setTimeout(() => setInlineSuccess(null), 4000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    saveDraft(null);
    setForm(emptyFormValues());
    showToast('Formulir dikosongkan.');
  };

  const handleEditRecord = (rec: TourismRecord) => {
    setForm({
      id: rec.id,
      namaUsaha: rec.namaUsaha || '',
      noTelp: rec.noTelp || '',
      jenisUsaha: rec.jenisUsaha || '',
      kecamatan: rec.kecamatan || '',
      desaKelurahan: rec.desaKelurahan || '',
      alamatLengkap: rec.alamatLengkap || rec.alamat || '',
      namaPemilik: rec.namaPemilik || '',
      jabatan: rec.jabatan || '',
      tahunBerdiri: rec.tahunBerdiri || '',
      nib: rec.nib || '',
      luasLahan: rec.luasLahan || '',
      kapasitasPengunjung: rec.kapasitasPengunjung || '',
      fasilitas: Array.isArray(rec.fasilitas) ? rec.fasilitas : [],
      jmlKamar: String(rec.jmlKamar ?? 0),
      jmlKaryawan: String(rec.jmlKaryawan ?? 0),
      lakiLaki: String(rec.lakiLaki ?? 0),
      perempuan: String(rec.perempuan ?? 0),
      ikutPelatihan: String(rec.ikutPelatihan ?? 0),
      sertifikatLSP: String(rec.sertifikatLSP ?? 0),
      catatan: rec.catatan || '',
    });
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = async (id: string) => {
    const next = records.filter((r) => r.id !== id);
    await persistRecords(next);
    if (form.id === id) {
      setForm(emptyFormValues());
    }
    showToast('Data usaha dihapus.');
  };

  const handleClearAll = async () => {
    await persistRecords([]);
    saveDraft(null);
    setForm(emptyFormValues());
    showToast('Semua data di HP ini berhasil dihapus.', 'success');
  };

  const handleMarkSent = async () => {
    const now = new Date().toISOString();
    setLastSent(now);
    await saveSettingValue(LAST_SENT_KEY, now);
  };

  const handleMarkBackup = async () => {
    const now = new Date().toISOString();
    setLastBackup(now);
    await saveSettingValue(LAST_BACKUP_KEY, now);
  };

  const handleDismissBanner = async () => {
    setBannerDismissed(true);
    await saveSettingValue(BANNER_KEY, '1');
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      {/* Kop Surat Resmi (Scrolls naturally, does not consume sticky viewport budget) */}
      <KopSurat
        logoKiri={logoKiri}
        logoKanan={logoKanan}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Sticky Top App Bar (52px compact height) */}
      <header className="sticky top-0 z-30 h-[52px] border-b border-sky-900/20 bg-sky-950 text-white">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-tight sm:text-base">
              Kuesioner Usaha Pariwisata
            </h1>
          </div>

          {/* Desktop Navigation Tabs (hidden on mobile where thumb bottom bar is used) */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigasi utama">
            <button
              type="button"
              onClick={() => switchTab('form')}
              className={`min-h-[40px] whitespace-nowrap shrink-0 border-b-2 px-1 text-sm font-semibold transition-colors ${
                activeTab === 'form'
                  ? 'border-amber-400 text-white'
                  : 'border-transparent text-sky-200 hover:text-white'
              }`}
            >
              Input Data
            </button>
            <button
              type="button"
              onClick={() => switchTab('data')}
              className={`min-h-[40px] whitespace-nowrap shrink-0 border-b-2 px-1 text-sm font-semibold transition-colors tabular-nums ${
                activeTab === 'data'
                  ? 'border-amber-400 text-white'
                  : 'border-transparent text-sky-200 hover:text-white'
              }`}
            >
              Data ({records.length})
            </button>
            <button
              type="button"
              onClick={() => switchTab('share')}
              className={`min-h-[40px] whitespace-nowrap shrink-0 border-b-2 px-1 text-sm font-semibold transition-colors ${
                activeTab === 'share'
                  ? 'border-amber-400 text-white'
                  : 'border-transparent text-sky-200 hover:text-white'
              }`}
            >
              Kirim &amp; Gabung
            </button>
          </nav>

          {/* Compact Right Controls: Connectivity + Install + Settings */}
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-amber-500/25 text-amber-200'
              }`}
              title={isOnline ? 'Koneksi internet aktif' : 'Mode offline aktif — penyimpanan lokal siap'}
            >
              {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </span>

            <PWAInstallButton variant="compact" />

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Pengaturan petugas dan kop surat"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        {!bannerDismissed && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950 sm:items-center sm:text-sm">
            <p>
              <strong>Siap Offline &amp; Online:</strong> Isi data di lapangan tanpa internet — semua data tersimpan otomatis di HP ini dan dapat dikirim ke koordinator setelah terhubung kembali.
            </p>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg text-amber-800 hover:bg-amber-100"
              aria-label="Tutup informasi mode offline"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeTab === 'form' && (
          <InputTab
            form={form}
            petugas={petugas}
            recordCount={records.length}
            isEditing={Boolean(form.id)}
            inlineSuccess={inlineSuccess}
            onChangeForm={setForm}
            onSavePetugasInline={handleSavePetugasInline}
            onOpenSettings={() => setSettingsOpen(true)}
            onSubmit={handleSubmitForm}
            onReset={handleResetForm}
            onCancelEdit={() => setForm(emptyFormValues())}
            onNotify={(msg, type) => showToast(msg, type)}
          />
        )}

        {activeTab === 'data' && (
          <DataTab
            records={records}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
            onGoToInput={() => switchTab('form')}
          />
        )}

        {activeTab === 'share' && (
          <ShareTab
            records={records}
            petugas={petugas}
            deviceId={deviceId}
            lastSent={lastSent}
            lastBackup={lastBackup}
            isOnline={isOnline}
            onMarkSent={handleMarkSent}
            onMarkBackup={handleMarkBackup}
            onMergedRecords={persistRecords}
            onClearAll={handleClearAll}
            onNotify={(msg, type) => showToast(msg, type)}
            onGoToData={() => switchTab('data')}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Tab Bar (Thumb Zone, 56px height + safe-area) */}
      <nav
        aria-label="Menu navigasi bawah"
        className="pb-safe fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
      >
        <div className="grid h-14 grid-cols-3 items-center">
          <button
            type="button"
            onClick={() => switchTab('form')}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'form' ? 'text-sky-900' : 'text-slate-500'
            }`}
          >
            <ClipboardEdit className="h-5 w-5" />
            <span className="text-[11px] font-bold tracking-tight">Input</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('data')}
            className={`relative flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'data' ? 'text-sky-900' : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <Database className="h-5 w-5" />
              {records.length > 0 && (
                <span className="absolute -top-1.5 -right-3 rounded-full bg-sky-900 px-1.5 py-0.5 font-mono text-[9px] leading-none font-bold text-white tabular-nums">
                  {records.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold tracking-tight">Data</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('share')}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'share' ? 'text-sky-900' : 'text-slate-500'
            }`}
          >
            <Send className="h-5 w-5" />
            <span className="text-[11px] font-bold tracking-tight">Kirim</span>
          </button>
        </div>
      </nav>

      {/* Settings Bottom Sheet */}
      <SettingsSheet
        open={settingsOpen}
        petugas={petugas}
        logoKiri={logoKiri}
        logoKanan={logoKanan}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
        onNotify={(msg, type) => showToast(msg, type)}
      />

      {/* Non-intrusive Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-20 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg md:bottom-6 ${
            toast.type === 'error'
              ? 'bg-rose-700'
              : toast.type === 'success'
              ? 'bg-emerald-700'
              : 'bg-slate-900'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
