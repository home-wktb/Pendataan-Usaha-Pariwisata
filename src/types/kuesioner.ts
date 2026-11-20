export const APP_VERSION = 8;

export const JENIS_USAHA_OPTIONS = [
  'Hotel',
  'Homestay',
  'Restoran / Rumah Makan',
  'Kafe',
  'Tour & Travel',
  'Pemandu Wisata',
  'Objek Wisata',
  'Toko Souvenir',
  'Dive Operator',
  'Lainnya',
] as const;

export const FASILITAS_OPTIONS = [
  'WiFi',
  'AC',
  'Musholla',
  'Toilet',
  'Parkir',
  'Kolam Renang',
  'TV',
  'Rental Motor',
  'Rental Mobil',
  'Ruang Rapat',
] as const;

export interface TourismRecord {
  id: string;
  namaUsaha: string;
  noTelp: string;
  jenisUsaha: string;
  kecamatan?: string;
  desaKelurahan?: string;
  alamatLengkap?: string;
  alamat: string;
  namaPemilik: string;
  jabatan: string;
  tahunBerdiri: string;
  nib: string;
  luasLahan: string;
  kapasitasPengunjung: string;
  fasilitas: string[];
  jmlKamar: number;
  jmlKaryawan: number;
  lakiLaki: number;
  perempuan: number;
  ikutPelatihan: number;
  sertifikatLSP: number;
  catatan: string;
  petugas: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormValues {
  id: string;
  namaUsaha: string;
  noTelp: string;
  jenisUsaha: string;
  kecamatan: string;
  desaKelurahan: string;
  alamatLengkap: string;
  namaPemilik: string;
  jabatan: string;
  tahunBerdiri: string;
  nib: string;
  luasLahan: string;
  kapasitasPengunjung: string;
  fasilitas: string[];
  jmlKamar: string;
  jmlKaryawan: string;
  lakiLaki: string;
  perempuan: string;
  ikutPelatihan: string;
  sertifikatLSP: string;
  catatan: string;
}

export interface ExportPayload {
  app: string;
  version: number;
  petugas: string;
  deviceId: string;
  exportedAt: string;
  count: number;
  records: TourismRecord[];
}

export interface MergeFileDetail {
  label: string;
  added: number;
  updated: number;
  skipped: number;
}

export interface MergeSummary {
  fileCount: number;
  totalAdded: number;
  totalUpdated: number;
  totalSkipped: number;
  totalRecordsAfter: number;
  details: MergeFileDetail[];
  errors: string[];
}

export interface AppSettings {
  petugas: string;
  deviceId: string;
  logoKiri: string | null;
  logoKanan: string | null;
  lastSent: string | null;
  lastBackup: string | null;
  bannerDismissed: boolean;
}
