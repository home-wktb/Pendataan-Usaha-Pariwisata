import {
  APP_VERSION,
  type ExportPayload,
  type MergeFileDetail,
  type MergeSummary,
  type TourismRecord,
} from '../types/kuesioner';

export function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c] || c;
  });
}

export function buildPayload(
  records: TourismRecord[],
  petugas: string,
  deviceId: string
): ExportPayload {
  return {
    app: 'kuesioner-pariwisata',
    version: APP_VERSION,
    petugas: petugas || 'Unknown',
    deviceId,
    exportedAt: new Date().toISOString(),
    count: records.length,
    records,
  };
}

export function buildFilename(petugas: string, ext: 'json' | 'xls' = 'json'): string {
  const safeName = (petugas || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(':', '');
  if (ext === 'xls') {
    return `kuesioner_${safeName}_${date}.xls`;
  }
  return `kuesioner_${safeName}_${date}_${time}.json`;
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareOrDownloadJSON(
  records: TourismRecord[],
  petugas: string,
  deviceId: string
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const fileName = buildFilename(petugas, 'json');
  const content = JSON.stringify(buildPayload(records, petugas, deviceId), null, 2);

  try {
    const file = new File([content], fileName, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Data Kuesioner Pariwisata Wakatobi',
        text: `Data lapangan dari ${petugas || 'Petugas'} (${records.length} usaha)`,
      });
      return 'shared';
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return 'cancelled';
    }
  }

  downloadBlob(content, fileName, 'application/json');
  return 'downloaded';
}

export function exportExcelXLS(records: TourismRecord[], petugas: string): void {
  const headers = [
    'No',
    'Nama Usaha',
    'Jenis',
    'No Telp',
    'Kecamatan',
    'Desa / Kelurahan',
    'Alamat Lengkap',
    'Nama Pemilik',
    'Jabatan',
    'Tahun Berdiri',
    'NIB',
    'Luas Lahan',
    'Kapasitas/Hari',
    'Fasilitas',
    'Kamar',
    'Total Karyawan',
    'L',
    'P',
    'Pelatihan',
    'Sertifikat LSP',
    'Catatan',
    'Petugas',
    'Tanggal',
  ];

  let excelHtml = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1">`;
  excelHtml += `<tr style="background-color: #0C4A6E; color: white; font-weight: bold;">`;
  for (const h of headers) {
    excelHtml += `<th>${escapeHtml(h)}</th>`;
  }
  excelHtml += `</tr>`;

  records.forEach((d, i) => {
    const fasStr = d.fasilitas && d.fasilitas.length > 0 ? d.fasilitas.join(', ') : '';
    excelHtml += `<tr>`;
    excelHtml += `<td>${i + 1}</td>`;
    excelHtml += `<td>${escapeHtml(d.namaUsaha)}</td>`;
    excelHtml += `<td>${escapeHtml(d.jenisUsaha)}</td>`;
    excelHtml += `<td>'${escapeHtml(d.noTelp)}</td>`;
    excelHtml += `<td>${escapeHtml(d.kecamatan || '')}</td>`;
    excelHtml += `<td>${escapeHtml(d.desaKelurahan || '')}</td>`;
    excelHtml += `<td>${escapeHtml(d.alamatLengkap || d.alamat)}</td>`;
    excelHtml += `<td>${escapeHtml(d.namaPemilik)}</td>`;
    excelHtml += `<td>${escapeHtml(d.jabatan)}</td>`;
    excelHtml += `<td>${escapeHtml(d.tahunBerdiri)}</td>`;
    excelHtml += `<td>'${escapeHtml(d.nib)}</td>`;
    excelHtml += `<td>${escapeHtml(d.luasLahan)}</td>`;
    excelHtml += `<td>${escapeHtml(d.kapasitasPengunjung)}</td>`;
    excelHtml += `<td>${escapeHtml(fasStr)}</td>`;
    excelHtml += `<td>${d.jmlKamar || 0}</td>`;
    excelHtml += `<td>${d.jmlKaryawan || 0}</td>`;
    excelHtml += `<td>${d.lakiLaki || 0}</td>`;
    excelHtml += `<td>${d.perempuan || 0}</td>`;
    excelHtml += `<td>${d.ikutPelatihan || 0}</td>`;
    excelHtml += `<td>${d.sertifikatLSP || 0}</td>`;
    excelHtml += `<td>${escapeHtml(d.catatan)}</td>`;
    excelHtml += `<td>${escapeHtml(d.petugas)}</td>`;
    excelHtml += `<td>${escapeHtml(new Date(d.createdAt).toLocaleString('id-ID'))}</td>`;
    excelHtml += `</tr>`;
  });

  excelHtml += `</table></body></html>`;

  downloadBlob('\uFEFF' + excelHtml, buildFilename(petugas, 'xls'), 'application/vnd.ms-excel');
}

export async function parseAndMergeFiles(
  files: File[],
  currentRecords: TourismRecord[]
): Promise<{ merged: TourismRecord[]; summary: MergeSummary }> {
  const next = [...currentRecords];
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  const details: MergeFileDetail[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as Partial<ExportPayload>;

      if (!payload.records || !Array.isArray(payload.records)) {
        errors.push(`${file.name}: format tidak sesuai`);
        continue;
      }

      let added = 0;
      let updated = 0;
      let skipped = 0;

      for (const rec of payload.records) {
        if (!rec || !rec.id) {
          skipped++;
          continue;
        }
        const idx = next.findIndex((item) => item.id === rec.id);
        if (idx >= 0) {
          const existingTime = new Date(next[idx].updatedAt || next[idx].createdAt).getTime();
          const incomingTime = new Date(rec.updatedAt || rec.createdAt).getTime();
          if (incomingTime > existingTime) {
            next[idx] = rec;
            updated++;
          } else {
            skipped++;
          }
        } else {
          next.push(rec);
          added++;
        }
      }

      totalAdded += added;
      totalUpdated += updated;
      totalSkipped += skipped;
      details.push({
        label: payload.petugas || file.name,
        added,
        updated,
        skipped,
      });
    } catch (err) {
      errors.push(`${file.name}: ${err instanceof Error ? err.message : 'Gagal membaca file'}`);
    }
  }

  next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    merged: next,
    summary: {
      fileCount: files.length,
      totalAdded,
      totalUpdated,
      totalSkipped,
      totalRecordsAfter: next.length,
      details,
      errors,
    },
  };
}

export function resizeLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca gambar'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 180;
        let { width, height } = img;
        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height >= width && height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas tidak tersedia'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = String(e.target?.result || '');
    };
    reader.readAsDataURL(file);
  });
}
