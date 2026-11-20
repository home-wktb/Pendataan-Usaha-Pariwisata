import React, { useMemo, useState } from 'react';
import { Inbox, Pencil, Search, Trash2, X } from 'lucide-react';
import { JENIS_USAHA_OPTIONS, type TourismRecord } from '../types/kuesioner';

interface DataTabProps {
  records: TourismRecord[];
  onEdit: (record: TourismRecord) => void;
  onDelete: (id: string) => void;
  onGoToInput: () => void;
}

export const DataTab: React.FC<DataTabProps> = ({
  records,
  onEdit,
  onDelete,
  onGoToInput,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [pendingDelete, setPendingDelete] = useState<TourismRecord | null>(null);

  const stats = useMemo(() => {
    return records.reduce(
      (acc, r) => {
        acc.karyawan += r.jmlKaryawan || 0;
        acc.pelatihan += r.ikutPelatihan || 0;
        acc.lsp += r.sertifikatLSP || 0;
        return acc;
      },
      { karyawan: 0, pelatihan: 0, lsp: 0 }
    );
  }, [records]);

  const availableTypes = useMemo(() => {
    const present = new Set(records.map((r) => r.jenisUsaha).filter(Boolean));
    return ['Semua', ...JENIS_USAHA_OPTIONS.filter((opt) => present.has(opt))];
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((d) => {
      if (selectedType !== 'Semua' && d.jenisUsaha !== selectedType) return false;
      if (!q) return true;
      return (
        (d.namaUsaha || '').toLowerCase().includes(q) ||
        (d.alamat || '').toLowerCase().includes(q) ||
        (d.kecamatan || '').toLowerCase().includes(q) ||
        (d.desaKelurahan || '').toLowerCase().includes(q) ||
        (d.jenisUsaha || '').toLowerCase().includes(q) ||
        (d.namaPemilik || '').toLowerCase().includes(q) ||
        (d.petugas || '').toLowerCase().includes(q)
      );
    });
  }, [records, search, selectedType]);

  return (
    <div className="space-y-5">
      {/* KPI Ringkasan */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-mono text-2xl font-bold text-sky-950 tabular-nums">
            {records.length}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">Total Usaha</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-mono text-2xl font-bold text-sky-950 tabular-nums">
            {stats.karyawan}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">Total Karyawan</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-mono text-2xl font-bold text-sky-950 tabular-nums">
            {stats.pelatihan}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">Ikut Pelatihan</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-mono text-2xl font-bold text-sky-950 tabular-nums">
            {stats.lsp}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">Sertifikat LSP</div>
        </div>
      </div>

      {/* Pencarian & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama usaha, alamat, pemilik, atau petugas..."
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-10 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-1.5 flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {availableTypes.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter jenis usaha">
            {availableTypes.map((type) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-sky-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Daftar Data */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">
            {records.length === 0 ? 'Belum ada data usaha' : 'Data tidak ditemukan'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {records.length === 0
              ? 'Mulai pendataan usaha pariwisata di lapangan melalui tab Input.'
              : 'Coba ubah kata kunci pencarian atau pilih filter jenis usaha lain.'}
          </p>
          {records.length === 0 && (
            <button
              type="button"
              onClick={onGoToInput}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Mulai Input Data
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((d) => (
            <article
              key={d.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-sky-800">
                      {d.jenisUsaha || 'Usaha Pariwisata'}
                      {d.tahunBerdiri ? ` · Berdiri ${d.tahunBerdiri}` : ''}
                    </p>
                    <h4 className="mt-0.5 text-base font-bold text-slate-900 break-words">
                      {d.namaUsaha}
                    </h4>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(d)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-900"
                      aria-label={`Edit ${d.namaUsaha}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(d)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100"
                      aria-label={`Hapus ${d.namaUsaha}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-600 break-words">
                  {d.alamat}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                  <span className="font-mono tabular-nums">{d.noTelp}</span>
                  {d.namaPemilik && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {d.namaPemilik}
                        {d.jabatan ? ` (${d.jabatan})` : ''}
                      </span>
                    </>
                  )}
                  {d.nib && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">NIB {d.nib}</span>
                    </>
                  )}
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-700 tabular-nums">
                  <span>{d.jmlKamar || 0} kamar</span>
                  <span className="mx-1.5 text-slate-300" aria-hidden="true">·</span>
                  <span>
                    {d.jmlKaryawan || 0} karyawan (L:{d.lakiLaki || 0} / P:{d.perempuan || 0})
                  </span>
                  <span className="mx-1.5 text-slate-300" aria-hidden="true">·</span>
                  <span>{d.ikutPelatihan || 0} pelatihan</span>
                  <span className="mx-1.5 text-slate-300" aria-hidden="true">·</span>
                  <span>{d.sertifikatLSP || 0} LSP</span>
                </div>

                {d.fasilitas && d.fasilitas.length > 0 && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Fasilitas: {d.fasilitas.join(', ')}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                <span>Petugas: {d.petugas || '-'}</span>
                <span className="tabular-nums">
                  {new Date(d.updatedAt || d.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="w-full max-w-sm rounded-t-3xl bg-white p-6 pb-8 shadow-2xl sm:rounded-2xl sm:pb-6">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
            <h3 id="delete-confirm-title" className="text-lg font-bold text-slate-900">
              Hapus Data Usaha?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Data <strong>{pendingDelete.namaUsaha}</strong> akan dihapus permanen dari penyimpanan lokal HP ini.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
