SISTEM CARIAN SLIP PENCAPAIAN MURID V2
SMK PUTRAJAYA PRESINT 11(2)
=================================================

FAIL DALAM PAKEJ
- index.html    : laman web siap untuk GitHub Pages, tema ungu
- Code.gs       : kod Apps Script baharu, sudah menggunakan folder Drive sekolah
- README.txt    : panduan ini

KONFIGURASI
ID folder Drive: 1tIqUShZP8GHFc_uw52Fekdol76T3xBa_
URL Web App sedia ada: https://script.google.com/macros/s/AKfycbzaQm8c573i8wx0s2kVwDSfn-UoDaFLsR5m3TBrhWyYNZmtdWFmIFxYQUtpEwxV-ltS/exec

PENTING: URL Web App sedia ada hanya akan menggunakan kod baharu selepas anda
mengemas kini projek Apps Script yang menerbitkan URL tersebut, kemudian
DEPLOY VERSI BAHARU. Menukar Code.gs dalam ZIP tidak mengubah deployment Google.

A. KEMAS KINI APPS SCRIPT
1. Buka projek Apps Script milik URL Web App yang diberikan.
2. Gantikan keseluruhan Code.gs dengan kandungan fail Code.gs dalam ZIP ini.
3. Save. Pilih fungsi ujiSambungan > Run > benarkan kebenaran Drive jika diminta.
4. Deploy > Manage deployments > pilih Web App sedia ada > Edit (ikon pensel).
5. Pilih Version: New version dan Deploy. Pastikan URL /exec kekal sama.
6. Web App perlu dijalankan oleh pemilik yang boleh membaca folder Drive.
   Tetapan akses Web App mesti mematuhi dasar sekolah dan keselamatan data.

B. GITHUB PAGES
1. GitHub > repository laman carian slip sekolah.
2. Muat naik index.html dari pakej ini (gantikan fail lama jika perlu).
3. Commit changes.
4. Settings > Pages > Deploy from branch > main > /(root) > Save.
5. Uji pada URL GitHub Pages di komputer dan telefon.

C. FORMAT PDF (SEKOLAH BOLEH TAMBAH BANYAK SLIP SETIAP MURID)
  120101011234_UPSA_2026.pdf
  120101011234_UASA_2026.pdf
  120101011234_PBD_AKHIR_2026.pdf
  120101011234_PBD_PERTENGAHAN_2026.pdf

  Nama bermula 12 digit KP. Fail PDF berada terus dalam folder Drive.
  Satu murid boleh mempunyai banyak fail dengan jenis pentaksiran berbeza.
  Fail disusun mengikut tahun (terkini dahulu).

D. UJIAN
1. Masukkan dua fail PDF ujian menggunakan KP REKAAN sama (bukan KP murid sebenar).
2. Cari KP rekaan tersebut pada laman GitHub Pages.
3. Semak kedua-dua rekod muncul, boleh dilihat dan dimuat turun.
4. Cuba carian KP yang tiada untuk memastikan tiada slip salah keluar.
5. Jika carian gagal, semak ID folder, kebenaran akaun Apps Script, dan
   pastikan deployment telah dikemas kini ke New version.

NOTA TEKNIKAL
- Laman menggunakan JSONP untuk komunikasi dengan Apps Script dari GitHub Pages.
- PDF diambil dalam beberapa bahagian melalui Apps Script dan dibina di browser.
- Had PDF 8MB setiap satu (MAX_PDF_MB dalam Code.gs).
- Fail tidak perlu dijadikan awam dalam Drive; pemilik Apps Script membaca fail.
- URL Apps Script di index.html ialah URL yang anda telah berikan.
- Folder yang dinamakan sebagai folder ID bukanlah ID fail individu.

KESELAMATAN / PRIVASI
Nombor kad pengenalan TIDAK mencukupi sebagai pengesahan identiti. Jika akses
Web App dibuka kepada sesiapa, orang lain yang mengetahui nombor KP berpotensi
mengakses slip murid. Dapatkan kelulusan sekolah dan gunakan pengesahan tambahan
seperti PIN unik atau akaun berautoriti SEBELUM data sebenar diumumkan kepada umum.
Jangan simpan rahsia atau PIN dalam index.html awam GitHub.
