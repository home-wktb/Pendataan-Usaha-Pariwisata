import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FolderInput,
  Send,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import type { MergeSummary, TourismRecord } from '../types/kuesioner';
import {
  buildFilename,
  buildPayload,
  downloadBlob,
  exportExcelXLS,
  parseAndMergeFiles,
  shareOrDownloadJSON,
} from '../utils/exportImport';

interface ShareTabProps {
  records: TourismRecord[];
  petugas: string;
  deviceId: string;
  lastSent: string | null;
  lastBackup: string | null;
  isOnline: boolean;
  onMarkSent: () => void;
  onMarkBackup: () => void;
  onMergedRecords: (nextRecords: TourismRecord[]) => void;
  onClearAll: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  onGoToData: () => void;
}

export const ShareTab: React.FC<ShareTabProps> = ({
  records,
  petugas,
  deviceId,
  lastSent,
  lastBackup,
  isOnline,
  onMarkSent,
  onMarkBackup,
  onMergedRecords,
  onClearAll,
  onNotify,
  onGoToData,
}) => {
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearPhrase, setClearPhrase] = useState('');
  const [mergeSummary, setMergeSummary] = useState<MergeSummary | null>(null);

  const totalKaryawan = records.reduce((sum, r) => sum + (r.jmlKaryawan || 0), 0);

  const formatDaysAgo = (iso: string | null, emptyText: string) => {
    if (!iso) return emptyText;
    const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Hari ini';
    if (diffDays === 1) return '1 hari lalu';
    return `${diffDays} hari lalu`;
  };

  const needsBackupReminder = (() => {
    if (records.length < 5) return false;
    if (!lastBackup) return true;
    const diffDays = Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  })();

  const handleConfirmShare = async () => {
    setConfirmSendOpen(false);
    const result = await shareOrDownloadJSON(records, petugas, deviceId);
    if (result === 'cancelled') return;
    onMarkSent();
    if (result === 'shared') {
      onNotify('File data berhasil dikirim ke admin.', 'success');
    } else {
      onNotify('File JSON diunduh. Kirim manual via WhatsApp atau Email.', 'success');
    }
  };

  const handleDownloadJSON = () => {
    if (records.length === 0) {
      onNotify('Belum ada data untuk di-backup.', 'error');
      return;
    }
    const content = JSON.stringify(buildPayload(records, petugas, deviceId), null, 2);
    downloadBlob(content, buildFilename(petugas, 'json'), 'application/json');
    onMarkBackup();
    onNotify('File backup JSON berhasil diunduh.', 'success');
  };

  const handleDownloadExcel = () => {
    if (records.length === 0) {
      onNotify('Belum ada data untuk diekspor ke Excel.', 'error');
      return;
    }
    exportExcelXLS(records, petugas);
    onMarkBackup();
    onNotify('File Excel (.xls) berhasil diunduh.', 'success');
  };

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const { merged, summary } = await parseAndMergeFiles(files, records);
    onMergedRecords(merged);
    setMergeSummary(summary);
    onNotify(
      `${summary.totalAdded + summary.totalUpdated} data berhasil digabung.`,
      'success'
    );
  };

  const handleConfirmClearAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (clearPhrase.trim().toUpperCase() !== 'HAPUS') {
      onNotify('Ketik "HAPUS" untuk mengonfirmasi penghapusan.', 'error');
      return;
    }
    onClearAll();
    setClearPhrase('');
    setConfirmClearOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Status Penyimpanan Lokal */}
      <section className="rounded-2xl bg-sky-950 p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Smartphone className="h-6 w-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold tabular-nums">
                  {records.length}
                </span>
                <span className="text-sm font-medium text-sky-100">
                  usaha tersimpan di HP ini
                </span>
              </div>
              <p className="mt-1 text-xs text-sky-200">
                Terakhir kirim: {formatDaysAgo(lastSent, 'Belum pernah dikirim')}
                <span className="mx-2 text-sky-400" aria-hidden="true">·</span>
                Backup: {formatDaysAgo(lastBackup, 'Belum pernah backup')}
              </p>
            </div>
          </div>

          <div className="text-xs font-medium text-sky-100">
            {isOnline
              ? 'Koneksi Online · Siap kirim via WhatsApp / Email'
              : 'Mode Offline · Data tetap aman tersimpan lokal'}
          </div>
        </div>
      </section>

      {needsBackupReminder && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Pengingat Backup:</strong> Anda memiliki {records.length} data tersimpan lokal. Sebaiknya unduh file cadangan sekarang untuk berjaga-jaga.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Kirim ke Admin */}
        <section className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kirim ke Admin (Koordinator)
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Saat kembali mendapatkan sinyal internet, kirim semua data lapangan ke koordinator melalui WhatsApp, Email, atau aplikasi lain.
            </p>
          </div>
          <button
            type="button"
            disabled={records.length === 0}
            onClick={() => setConfirmSendOpen(true)}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <Send className="h-4 w-4" />
            <span>Kirim Semua Data ke Admin</span>
          </button>
        </section>

        {/* Backup & Export Excel */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cadangan & Ekspor Spreadsheet
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Simpan arsip file JSON ke memori HP atau unduh laporan siap cetak dalam format Excel (.xls).
            </p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              disabled={records.length === 0}
              onClick={handleDownloadJSON}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-sky-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <Download className="h-4 w-4" />
              <span>Backup (.json)</span>
            </button>
            <button
              type="button"
              disabled={records.length === 0}
              onClick={handleDownloadExcel}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
              <span>Unduh Excel (.xls)</span>
            </button>
          </div>
        </section>

        {/* Gabungkan Data Tim (Admin) */}
        <section className="flex flex-col justify-between rounded-2xl border border-sky-200 bg-white p-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Khusus Admin — Gabungkan Data Tim
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Pilih satu atau beberapa file <strong>.json</strong> dari petugas lapangan. Sistem otomatis menggabungkan dan melewati data duplikat.
            </p>
          </div>
          <label className="mt-5 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-800">
            <FolderInput className="h-4 w-4" />
            <span>Pilih File JSON untuk Digabung</span>
            <input
              type="file"
              accept=".json,application/json"
              multiple
              className="sr-only"
              onChange={handleImportFiles}
            />
          </label>
        </section>

        {/* Zona Hati-hati: Hapus Semua */}
        <section className="flex flex-col justify-between rounded-2xl border border-rose-200 bg-white p-5">
          <div>
            <h3 className="text-base font-bold text-rose-900">
              Bersihkan Penyimpanan HP
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Hapus seluruh data kuesioner di perangkat ini setelah Anda memastikan seluruh data sudah diterima admin dan di-backup.
            </p>
          </div>
          <button
            type="button"
            disabled={records.length === 0}
            onClick={() => {
              setClearPhrase('');
              setConfirmClearOpen(true);
            }}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Trash2 className="h-4 w-4" />
            <span>Hapus Semua Data di HP Ini</span>
          </button>
        </section>
      </div>

      {/* Modal Konfirmasi Kirim */}
      {confirmSendOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-confirm-title"
        >
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-2xl sm:rounded-2xl sm:pb-6">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
            <h3 id="send-confirm-title" className="text-lg font-bold text-slate-900">
              Kirim Data ke Admin
            </h3>
            <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>Petugas: <strong>{petugas || '-'}</strong></p>
              <p>Jumlah usaha: <strong className="font-mono tabular-nums">{records.length}</strong></p>
              <p>Total karyawan: <strong className="font-mono tabular-nums">{totalKaryawan}</strong></p>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              File JSON akan dibagikan melalui WhatsApp, Email, atau diunduh ke HP untuk digabungkan oleh admin.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmSendOpen(false)}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmShare}
                className="flex min-h-[48px] flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                <Send className="h-4 w-4" />
                <span>Lanjutkan Kirim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hasil Gabung File Admin */}
      {mergeSummary && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="merge-summary-title"
        >
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 pb-8 shadow-2xl sm:rounded-2xl sm:pb-6">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <h3 id="merge-summary-title" className="text-lg font-bold text-slate-900">
                Hasil Penggabungan Data
              </h3>
              <button
                type="button"
                onClick={() => setMergeSummary(null)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Tutup ringkasan"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="font-mono text-xl font-bold text-emerald-800 tabular-nums">
                  +{mergeSummary.totalAdded}
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">Baru</div>
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="font-mono text-xl font-bold text-sky-800 tabular-nums">
                  {mergeSummary.totalUpdated}
                </div>
                <div className="text-[11px] font-semibold text-sky-700">Diperbarui</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-mono text-xl font-bold text-slate-700 tabular-nums">
                  {mergeSummary.totalSkipped}
                </div>
                <div className="text-[11px] font-semibold text-slate-600">Dilewati</div>
              </div>
            </div>

            {mergeSummary.details.length > 0 && (
              <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-700">
                {mergeSummary.details.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2.5">
                    <span className="truncate font-semibold">{item.label}</span>
                    <span className="shrink-0 font-mono tabular-nums text-slate-500">
                      +{item.added} baru · {item.updated} ubah
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {mergeSummary.errors.length > 0 && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <p className="font-bold">Gagal dibaca:</p>
                <ul className="mt-1 list-disc pl-4">
                  {mergeSummary.errors.slice(0, 4).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-sm text-slate-700">
              Total data saat ini: <strong className="font-mono tabular-nums">{mergeSummary.totalRecordsAfter} usaha</strong>.
            </p>

            <button
              type="button"
              onClick={() => {
                setMergeSummary(null);
                onGoToData();
              }}
              className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-sky-900 px-4 py-3 text-sm font-bold text-white hover:bg-sky-800"
            >
              Lihat Daftar Data
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Semua Data */}
      {confirmClearOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-all-title"
        >
          <form
            onSubmit={handleConfirmClearAll}
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 pb-8 shadow-2xl sm:rounded-2xl sm:pb-6"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
            <h3 id="clear-all-title" className="text-lg font-bold text-rose-800">
              Hapus Semua Data?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Anda akan menghapus <strong className="tabular-nums">{records.length}</strong> data usaha dari HP ini. Ketik <strong>HAPUS</strong> untuk melanjutkan.
            </p>
            <input
              type="text"
              value={clearPhrase}
              onChange={(e) => setClearPhrase(e.target.value)}
              placeholder='Ketik "HAPUS"'
              className="mt-3 min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-base font-semibold uppercase focus:border-rose-600 focus:bg-white focus:outline-none"
            />
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
              >
                Hapus Semua
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
