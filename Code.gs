/**
 * SISTEM CARIAN SLIP PENCAPAIAN MURID — V2 (PELBAGAI PENTAKSIRAN)
 * SMK PUTRAJAYA PRESINT 11(2)
 *
 * Folder PDF peribadi: tidak perlu berkongsi fail sebagai "Anyone with link".
 * Web App: Execute as Me; Who has access Anyone (jika polisi sekolah benarkan).
 * PENTING: No. KP sahaja BUKAN pengesahan identiti. Dapatkan kelulusan sekolah.
 */
const CONFIG = Object.freeze({
  FOLDER_ID: '1tIqUShZP8GHFc_uw52Fekdol76T3xBa_',
  MAX_PDF_MB: 8,
  CHUNK_CHARS: 240000 // Gandaan 4 supaya pecahan Base64 boleh disambung
});

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = String(p.callback || '');
  if (!/^[A-Za-z_$][A-Za-z0-9_$]{0,79}$/.test(callback)) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false, message: 'Callback tidak sah.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  let output;
  try {
    switch (String(p.action || '')) {
      case 'health':
        output = { ok: true, service: 'SMK PUTRAJAYA PRESINT 11(2)', version: 2 };
        break;
      case 'search':
        output = cariSemuaSlip_(p.ic);
        break;
      case 'pdf':
        output = ambilPdfBahagian_(p.ic, p.fileId, p.part);
        break;
      default:
        output = { ok: false, message: 'Tindakan tidak sah.' };
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    output = { ok: false, message: 'Ralat pelayan. Sila cuba lagi atau hubungi pentadbir.' };
  }
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(output) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function formatIC_(raw) {
  const ic = String(raw || '').replace(/[\s-]/g, '');
  if (!/^\d{12}$/.test(ic)) throw new Error('Format nombor kad pengenalan tidak sah.');
  return ic;
}

/**
 * Nama fail yang disokong:
 * 120101011234.pdf
 * 120101-01-1234_UASA_2026.pdf
 * 120101011234_PBD_AKHIR_2026.pdf
 * Tidak menerima nama yang sekadar mengandungi nombor KP murid di tengah.
 */
function bacaNamaFail_(name) {
  const match = String(name || '').match(/^(\d{6}-?\d{2}-?\d{4})(?:[_\s-]+(.+))?\.pdf$/i);
  if (!match) return null;
  const ic = match[1].replace(/-/g, '');
  const suffix = (match[2] || '').trim();
  let year = null;
  let code = suffix;
  const yearMatch = suffix.match(/^(.*?)[_\s-]+(20\d{2})$/);
  if (yearMatch) {
    code = yearMatch[1];
    year = Number(yearMatch[2]);
  } else if (/^20\d{2}$/.test(suffix)) {
    code = '';
    year = Number(suffix);
  }
  code = code.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  const display = {
    UASA: 'UASA',
    UPSA: 'UPSA',
    PBD: 'PBD',
    'PBD AKHIR': 'PBD Akhir Tahun',
    'PBD PERTENGAHAN': 'PBD Pertengahan Tahun',
    PAT: 'Peperiksaan Akhir Tahun',
    PPT: 'Peperiksaan Pertengahan Tahun'
  };
  const type = code ? (display[code] || code) : 'Slip Pencapaian';
  return {
    ic: ic,
    assessment: type,
    year: year,
    label: type + (year ? ' ' + year : '')
  };
}

function cariSemuaSlip_(rawIC) {
  const ic = formatIC_(rawIC);
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const iterator = folder.getFiles();
  const results = [];
  while (iterator.hasNext()) {
    const file = iterator.next();
    if (file.getMimeType() !== MimeType.PDF || file.isTrashed()) continue;
    const parsed = bacaNamaFail_(file.getName());
    if (!parsed || parsed.ic !== ic) continue;
    results.push({
      fileId: file.getId(),
      filename: file.getName(),
      assessment: parsed.assessment,
      year: parsed.year,
      label: parsed.label,
      bytes: file.getSize(),
      tooLarge: file.getSize() > CONFIG.MAX_PDF_MB * 1024 * 1024
    });
  }
  results.sort(function(a, b) {
    return (b.year || 0) - (a.year || 0) || a.label.localeCompare(b.label, 'ms') || a.filename.localeCompare(b.filename);
  });
  return { ok: true, slips: results, count: results.length };
}

/** Bahagian Base64 PDF untuk PDF preview/muat turun tanpa menjadikan Drive public. */
function ambilPdfBahagian_(rawIC, rawFileId, rawPart) {
  const ic = formatIC_(rawIC);
  const fileId = String(rawFileId || '');
  if (!/^[A-Za-z0-9_-]{15,100}$/.test(fileId)) return { ok: false, message: 'ID fail tidak sah.' };
  const part = Number(rawPart);
  if (!Number.isSafeInteger(part) || part < 0) return { ok: false, message: 'Bahagian PDF tidak sah.' };

  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const file = DriveApp.getFileById(fileId);
  const parents = file.getParents();
  let inFolder = false;
  while (parents.hasNext()) {
    if (parents.next().getId() === folder.getId()) { inFolder = true; break; }
  }
  const parsed = bacaNamaFail_(file.getName());
  // Periksa semula bahawa fail ini berada dalam folder yang betul DAN milik KP dicari.
  if (!inFolder || file.isTrashed() || file.getMimeType() !== MimeType.PDF || !parsed || parsed.ic !== ic) {
    return { ok: false, message: 'Fail tidak dibenarkan atau tidak dijumpai.' };
  }
  if (file.getSize() > CONFIG.MAX_PDF_MB * 1024 * 1024) {
    return { ok: false, message: 'PDF melebihi had ' + CONFIG.MAX_PDF_MB + ' MB. Hubungi pentadbir.' };
  }
  const b64 = Utilities.base64Encode(file.getBlob().getBytes());
  const total = Math.ceil(b64.length / CONFIG.CHUNK_CHARS);
  if (part >= total) return { ok: false, message: 'Bahagian PDF melebihi jumlah.' };
  return {
    ok: true,
    filename: file.getName(),
    part: part,
    total: total,
    data: b64.slice(part * CONFIG.CHUNK_CHARS, (part + 1) * CONFIG.CHUNK_CHARS)
  };
}

// Uji fungsi ini sekali dalam editor untuk benarkan akses ke Google Drive.
function ujiSambungan() {
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  Logger.log('Berjaya akses folder: ' + folder.getName());
  Logger.log('Jumlah fail dalam folder (semua jenis): ' + folder.getFiles().hasNext());
}
