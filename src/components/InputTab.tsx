import React, { useState } from 'react';
import { Check, RotateCcw, Save, UserCheck, X } from 'lucide-react';
import { getDesaByKecamatan, WAKATOBI_REGIONS } from '../data/wakatobiRegions';
import {
  FASILITAS_OPTIONS,
  JENIS_USAHA_OPTIONS,
  type FormValues,
} from '../types/kuesioner';

interface InputTabProps {
  form: FormValues;
  petugas: string;
  recordCount: number;
  isEditing: boolean;
  inlineSuccess: string | null;
  onChangeForm: (updater: (prev: FormValues) => FormValues) => void;
  onSavePetugasInline: (name: string) => void;
  onOpenSettings: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onCancelEdit: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const InputTab: React.FC<InputTabProps> = ({
  form,
  petugas,
  recordCount,
  isEditing,
  inlineSuccess,
  onChangeForm,
  onSavePetugasInline,
  onOpenSettings,
  onSubmit,
  onReset,
  onCancelEdit,
  onNotify,
}) => {
  const [quickPetugas, setQuickPetugas] = useState(petugas);

  const lakiNum = parseInt(form.lakiLaki, 10) || 0;
  const perempuanNum = parseInt(form.perempuan, 10) || 0;
  const totalGender = lakiNum + perempuanNum;
  const totalKaryawanNum = parseInt(form.jmlKaryawan, 10) || 0;
  const hasMismatch = totalKaryawanNum !== totalGender;

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    onChangeForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFacility = (facility: string) => {
    onChangeForm((prev) => {
      const exists = prev.fasilitas.includes(facility);
      return {
        ...prev,
        fasilitas: exists
          ? prev.fasilitas.filter((item) => item !== facility)
          : [...prev.fasilitas, facility],
      };
    });
  };

  const desaOptions = getDesaByKecamatan(form.kecamatan);

  const handleKecamatanChange = (nextKecamatan: string) => {
    onChangeForm((prev) => ({
      ...prev,
      kecamatan: nextKecamatan,
      desaKelurahan: '',
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petugas.trim()) {
      onNotify('Isi nama petugas terlebih dahulu sebelum menyimpan data.', 'error');
      return;
    }
    if (
      !form.namaUsaha.trim() ||
      !form.noTelp.trim() ||
      !form.jenisUsaha ||
      !form.kecamatan ||
      !form.desaKelurahan ||
      !form.alamatLengkap.trim()
    ) {
      onNotify('Mohon lengkapi semua kolom wajib bertanda *.', 'error');
      return;
    }
    if (hasMismatch) {
      onNotify('Jumlah Laki-laki + Perempuan harus sama dengan Total Karyawan.', 'error');
      return;
    }
    onSubmit();
  };

  const inputClass =
    'min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 focus:outline-none';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-800';

  return (
    <div className="space-y-5">
      {/* Inline Petugas Setup or Active Petugas Bar */}
      {!petugas ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="quick-petugas" className="mb-1.5 block text-sm font-bold text-sky-950">
                Nama Petugas / Tim Pendata <span className="text-rose-600">*</span>
              </label>
              <p className="mb-2 text-xs text-slate-600">
                Isi sekali sebelum mendata di lapangan. Tersimpan offline di HP ini.
              </p>
              <input
                id="quick-petugas"
                type="text"
                value={quickPetugas}
                onChange={(e) => setQuickPetugas(e.target.value)}
                placeholder="Contoh: Budi - Tim A"
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!quickPetugas.trim()) {
                  onNotify('Masukkan nama petugas terlebih dahulu.', 'error');
                  return;
                }
                onSavePetugasInline(quickPetugas.trim());
              }}
              className="flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
            >
              <UserCheck className="h-4 w-4" />
              <span>Simpan Nama</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0 text-sm text-slate-600">
            <span className="font-medium">Petugas aktif: </span>
            <span className="font-bold text-slate-900">{petugas}</span>
            <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
            <span className="tabular-nums text-slate-600">{recordCount} usaha tersimpan</span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="min-h-[40px] shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Ubah Petugas / Kop
          </button>
        </div>
      )}

      {inlineSuccess && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
        >
          <Check className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>{inlineSuccess}</span>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <div className="min-w-0 text-sm text-amber-950">
            <span className="font-bold">Mode Edit Data: </span>
            <span className="truncate">{form.namaUsaha || 'Usaha terpilih'}</span>
          </div>
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            <X className="h-3.5 w-3.5" />
            <span>Batal Edit</span>
          </button>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* Kolom Kiri (Desktop) */}
          <div className="space-y-6">
            {/* 01. Identitas Usaha */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-sky-950">
                01. Identitas Usaha
              </h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="namaUsaha" className={labelClass}>
                      Nama Usaha <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="namaUsaha"
                      type="text"
                      required
                      value={form.namaUsaha}
                      onChange={(e) => setField('namaUsaha', e.target.value)}
                      placeholder="Contoh: Hotel Nusantara Wakatobi"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="jenisUsaha" className={labelClass}>
                      Jenis Usaha <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="jenisUsaha"
                      required
                      value={form.jenisUsaha}
                      onChange={(e) => setField('jenisUsaha', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">-- Pilih Jenis Usaha --</option>
                      {JENIS_USAHA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="kecamatan" className={labelClass}>
                    Kecamatan (Kab. Wakatobi) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="kecamatan"
                    required
                    value={form.kecamatan}
                    onChange={(e) => handleKecamatanChange(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {WAKATOBI_REGIONS.map((region) => (
                      <option key={region.kecamatan} value={region.kecamatan}>
                        {region.kecamatan}
                      </option>
                    ))}
                  </select>
                </div>

                {form.kecamatan && (
                  <div>
                    <label htmlFor="desaKelurahan" className={labelClass}>
                      Desa / Kelurahan (Kec. {form.kecamatan}) <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="desaKelurahan"
                      required
                      value={form.desaKelurahan}
                      onChange={(e) => setField('desaKelurahan', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">-- Pilih Desa / Kelurahan --</option>
                      {desaOptions.map((desa) => (
                        <option key={desa} value={desa}>
                          {desa}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="alamatLengkap" className={labelClass}>
                    Alamat Lengkap (Jalan / Dusun / RT-RW) <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="alamatLengkap"
                    rows={2}
                    required
                    value={form.alamatLengkap}
                    onChange={(e) => setField('alamatLengkap', e.target.value)}
                    placeholder="Contoh: Jl. Poros Wisata No. 12, Dusun ..."
                    className={`${inputClass} min-h-[84px] resize-y`}
                  />
                </div>
              </div>
            </section>

            {/* 02. Identitas Pemilik & Legalitas */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-sky-950">
                02. Identitas Pemilik & Legalitas
              </h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="namaPemilik" className={labelClass}>
                      Nama Pemilik
                    </label>
                    <input
                      id="namaPemilik"
                      type="text"
                      value={form.namaPemilik}
                      onChange={(e) => setField('namaPemilik', e.target.value)}
                      placeholder="Nama lengkap pemilik"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="jabatan" className={labelClass}>
                      Jabatan Responden
                    </label>
                    <input
                      id="jabatan"
                      type="text"
                      value={form.jabatan}
                      onChange={(e) => setField('jabatan', e.target.value)}
                      placeholder="Pemilik / Manajer"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="noTelp" className={labelClass}>
                    No. Telepon / WhatsApp <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="noTelp"
                    type="tel"
                    inputMode="tel"
                    required
                    value={form.noTelp}
                    onChange={(e) => setField('noTelp', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tahunBerdiri" className={labelClass}>
                      Tahun Berdiri
                    </label>
                    <input
                      id="tahunBerdiri"
                      type="number"
                      inputMode="numeric"
                      min="1900"
                      max="2100"
                      value={form.tahunBerdiri}
                      onChange={(e) => setField('tahunBerdiri', e.target.value)}
                      placeholder="Contoh: 2018"
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label htmlFor="nib" className={labelClass}>
                      NIB (Nomor Induk Berusaha)
                    </label>
                    <input
                      id="nib"
                      type="text"
                      inputMode="numeric"
                      value={form.nib}
                      onChange={(e) => setField('nib', e.target.value)}
                      placeholder="Nomor NIB"
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Kolom Kanan (Desktop) */}
          <div className="space-y-6">
            {/* 03. Skala Usaha & Fasilitas */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-sky-950">
                03. Skala Usaha & Fasilitas
              </h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="luasLahan" className={labelClass}>
                      Luas Lahan (m²)
                    </label>
                    <input
                      id="luasLahan"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={form.luasLahan}
                      onChange={(e) => setField('luasLahan', e.target.value)}
                      placeholder="500"
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label htmlFor="kapasitasPengunjung" className={labelClass}>
                      Kapasitas / Hari
                    </label>
                    <input
                      id="kapasitasPengunjung"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={form.kapasitasPengunjung}
                      onChange={(e) => setField('kapasitasPengunjung', e.target.value)}
                      placeholder="100"
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="jmlKamar" className={labelClass}>
                      Jumlah Kamar
                    </label>
                    <input
                      id="jmlKamar"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={form.jmlKamar}
                      onChange={(e) => setField('jmlKamar', e.target.value)}
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label htmlFor="jmlKaryawan" className={labelClass}>
                      Total Karyawan <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="jmlKaryawan"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      required
                      value={form.jmlKaryawan}
                      onChange={(e) => setField('jmlKaryawan', e.target.value)}
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Fasilitas Tambahan (Pilih yang tersedia)</span>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {FASILITAS_OPTIONS.map((fac) => {
                      const active = form.fasilitas.includes(fac);
                      return (
                        <button
                          key={fac}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleFacility(fac)}
                          className={`flex min-h-[48px] items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
                            active
                              ? 'border-sky-900 bg-sky-900 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{fac}</span>
                          {active && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 04. Data Tenaga Kerja & Pelatihan */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-sky-950">
                04. Data Karyawan & Sertifikasi
              </h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  <div>
                    <label htmlFor="lakiLaki" className={labelClass}>
                      Laki-laki <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="lakiLaki"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      required
                      value={form.lakiLaki}
                      onChange={(e) => setField('lakiLaki', e.target.value)}
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label htmlFor="perempuan" className={labelClass}>
                      Perempuan <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="perempuan"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      required
                      value={form.perempuan}
                      onChange={(e) => setField('perempuan', e.target.value)}
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label htmlFor="totalGender" className={labelClass}>
                      Jumlah L+P
                    </label>
                    <input
                      id="totalGender"
                      type="number"
                      readOnly
                      value={totalGender}
                      className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 font-mono text-base font-bold text-sky-950 tabular-nums"
                    />
                  </div>
                </div>

                {hasMismatch && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-900">
                    <span>
                      Jumlah L+P (<strong className="tabular-nums">{totalGender}</strong>) belum sama dengan Total Karyawan (
                      <strong className="tabular-nums">{totalKaryawanNum}</strong>).
                    </span>
                    <button
                      type="button"
                      onClick={() => setField('jmlKaryawan', String(totalGender))}
                      className="min-h-[36px] shrink-0 whitespace-nowrap rounded-lg bg-rose-700 px-3 py-1.5 font-semibold text-white hover:bg-rose-800"
                    >
                      Samakan ({totalGender})
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="ikutPelatihan" className={labelClass}>
                      Ikut Pelatihan
                    </label>
                    <input
                      id="ikutPelatihan"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={form.ikutPelatihan}
                      onChange={(e) => setField('ikutPelatihan', e.target.value)}
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label htmlFor="sertifikatLSP" className={labelClass}>
                      Sertifikat LSP
                    </label>
                    <input
                      id="sertifikatLSP"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={form.sertifikatLSP}
                      onChange={(e) => setField('sertifikatLSP', e.target.value)}
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="catatan" className={labelClass}>
                    Catatan Lapangan (Opsional)
                  </label>
                  <textarea
                    id="catatan"
                    rows={2}
                    value={form.catatan}
                    onChange={(e) => setField('catatan', e.target.value)}
                    placeholder="Keterangan tambahan kondisi usaha..."
                    className={`${inputClass} min-h-[76px] resize-y`}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onReset}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-sky-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-sky-800 active:scale-[0.98]"
          >
            <Save className="h-5 w-5" />
            <span>{isEditing ? 'Perbarui Data Usaha' : 'Simpan & Lanjut Input'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
