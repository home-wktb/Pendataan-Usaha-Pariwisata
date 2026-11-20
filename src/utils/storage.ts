import type { AppSettings, FormValues, TourismRecord } from '../types/kuesioner';

export const STORAGE_KEY = 'kuesioner_pariwisata_v3';
export const PETUGAS_KEY = 'kuesioner_v3_petugas';
export const DEVICE_KEY = 'kuesioner_v3_device';
export const LAST_SENT_KEY = 'kuesioner_v3_last_sent';
export const LAST_BACKUP_KEY = 'kuesioner_v3_last_backup';
export const BANNER_KEY = 'kuesioner_v3_banner_dismissed';
export const LOGO_KIRI_KEY = 'kuesioner_logo_kiri';
export const LOGO_KANAN_KEY = 'kuesioner_logo_kanan';
export const DRAFT_KEY = 'kuesioner_v3_draft';

const DB_NAME = 'wakatobi_kuesioner_db';
const DB_VERSION = 1;
const STORE_RECORDS = 'records';
const STORE_META = 'meta';

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_RECORDS)) {
          db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGetAllRecords(): Promise<TourismRecord[] | null> {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = (req.result || []) as TourismRecord[];
        rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(rows);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbReplaceAllRecords(records: TourismRecord[]): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECORDS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDS);
      store.clear();
      for (const rec of records) {
        store.put(rec);
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbGetMeta(key: string): Promise<string | null> {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, 'readonly');
      const req = tx.objectStore(STORE_META).get(key);
      req.onsuccess = () => {
        const result = req.result as { key: string; value: string } | undefined;
        resolve(result ? result.value : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSetMeta(key: string, value: string | null): Promise<void> {
  const db = await openDatabase();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, 'readwrite');
      const store = tx.objectStore(STORE_META);
      if (value === null) {
        store.delete(key);
      } else {
        store.put({ key, value });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function generateRecordId(): string {
  return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
    try {
      localStorage.setItem(DEVICE_KEY, deviceId);
    } catch {
      // Ignore quota errors
    }
  }
  return deviceId;
}

export async function loadRecords(): Promise<TourismRecord[]> {
  let lsRecords: TourismRecord[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        lsRecords = parsed;
      }
    }
  } catch {
    lsRecords = [];
  }

  const dbRecords = await idbGetAllRecords();
  if (dbRecords && dbRecords.length > 0) {
    return dbRecords;
  }

  // Migrate existing localStorage records into IndexedDB if present
  if (lsRecords.length > 0) {
    await idbReplaceAllRecords(lsRecords);
  }
  return lsRecords;
}

export async function saveRecords(records: TourismRecord[]): Promise<{ ok: boolean; warning?: string }> {
  const idbOk = await idbReplaceAllRecords(records);
  let lsOk = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    lsOk = false;
  }

  if (!idbOk && !lsOk) {
    return { ok: false, warning: 'Penyimpanan HP penuh! Segera kirim & backup data.' };
  }
  return { ok: true };
}

export async function loadSettings(): Promise<AppSettings> {
  const deviceId = getOrCreateDeviceId();
  const petugas = localStorage.getItem(PETUGAS_KEY) || (await idbGetMeta(PETUGAS_KEY)) || '';
  const logoKiri = localStorage.getItem(LOGO_KIRI_KEY) || (await idbGetMeta(LOGO_KIRI_KEY));
  const logoKanan = localStorage.getItem(LOGO_KANAN_KEY) || (await idbGetMeta(LOGO_KANAN_KEY));
  const lastSent = localStorage.getItem(LAST_SENT_KEY) || (await idbGetMeta(LAST_SENT_KEY));
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY) || (await idbGetMeta(LAST_BACKUP_KEY));
  const bannerDismissed = localStorage.getItem(BANNER_KEY) === '1';

  return {
    petugas,
    deviceId,
    logoKiri: logoKiri || null,
    logoKanan: logoKanan || null,
    lastSent: lastSent || null,
    lastBackup: lastBackup || null,
    bannerDismissed,
  };
}

export async function saveSettingValue(key: string, value: string | null): Promise<void> {
  await idbSetMeta(key, value);
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore localStorage quota overflow (IndexedDB already saved it)
  }
}

export function loadDraft(): FormValues | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FormValues> & { alamat?: string };
    return {
      ...emptyFormValues(),
      ...parsed,
      kecamatan: parsed.kecamatan || '',
      desaKelurahan: parsed.desaKelurahan || '',
      alamatLengkap: parsed.alamatLengkap || parsed.alamat || '',
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: FormValues | null): void {
  try {
    if (!draft) {
      localStorage.removeItem(DRAFT_KEY);
    } else {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  } catch {
    // Ignore
  }
}

export function emptyFormValues(): FormValues {
  return {
    id: '',
    namaUsaha: '',
    noTelp: '',
    jenisUsaha: '',
    kecamatan: '',
    desaKelurahan: '',
    alamatLengkap: '',
    namaPemilik: '',
    jabatan: '',
    tahunBerdiri: '',
    nib: '',
    luasLahan: '',
    kapasitasPengunjung: '',
    fasilitas: [],
    jmlKamar: '0',
    jmlKaryawan: '0',
    lakiLaki: '0',
    perempuan: '0',
    ikutPelatihan: '0',
    sertifikatLSP: '0',
    catatan: '',
  };
}
