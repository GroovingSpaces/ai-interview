# User Journey – Alur Nyata (Dapat Diimplementasikan)

Dokumen ini hanya mendeskripsikan alur yang **sudah ada di aplikasi** dan dapat dilakukan di UI sekarang. Tidak ada fitur fiktif atau rencana ke depan.

**Role yang mengakses:** Admin / HR / Recruiter (middleware `admin`). Tanpa login role tersebut, user diarahkan ke portal login atau apply.

---

## 1. Cuti (Leave)

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **Sidebar → Cuti** | Buka `/leave`. Tampil: daftar pengajuan cuti (filter: karyawan, status, tipe), statistik (total/pending/disetujui/ditolak), tabel sisa kuota cuti tahunan per karyawan (quota 12 hari/tahun). |
| 2 | **Tambah pengajuan** | Klik "Tambah" → `/leave/add`. Isi: Pilih karyawan, tipe (tahunan/sakit/izin/tanpa bayar/lainnya), tanggal mulai–akhir (hari terhitung otomatis), alasan. Submit → data masuk store, redirect ke `/leave`. |
| 3 | **Setujui / tolak** | Di list `/leave`: tombol Setujui atau Tolak. Setujui → status jadi approved, isi approvedBy & approvedAt. Tolak → modal isi catatan, status rejected. |
| 4 | **Lihat di kalender & kuota** | Cuti yang **approved** tampil di **WFM → Kalender Cuti** (`/wfm/leave-calendar`) per tanggal. Kuota tahunan terpakai dihitung dari cuti tipe "tahunan" yang approved; sisa = 12 − terpakai (tampil di halaman Cuti). |

**Data:** Store `leave`: `requests[]`, `getAnnualBalance(employeeId, year)`. Tidak ada API eksternal; data in-memory.

---

## 2. Kehadiran (Attendance)

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **Sidebar → Kehadiran** | Buka `/attendance`. List rekap kehadiran dengan filter: tanggal, karyawan, status (hadir/terlambat/tidak hadir/cuti/WFH). |
| 2 | **Tambah / edit** | `/attendance/add` dan `/attendance/[id]/edit`: pilih karyawan, tanggal, check-in, check-out, status, catatan. Field `approved` untuk koreksi yang butuh persetujuan. |
| 3 | **Laporan** | **Laporan Tenaga Kerja** (`/workforce-reports`) punya blok "Kehadiran Hari Ini" dan "Laporan Kehadiran per Periode" (filter tanggal) dari data attendance. |

**Data:** Store `attendance`: `records[]`, `getRecordsByDate(date)`.

---

## 3. Shift & Jadwal

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **Sidebar → Shift & Jadwal** | Buka `/shifts`. Bagian atas: definisi shift (nama, jam mulai–akhir, break, warna). Bagian bawah: roster mingguan (nama karyawan × 7 hari). |
| 2 | **Atur jadwal** | Klik sel hari untuk satu karyawan → modal "Atur Shift": pilih shift, Simpan. Jadwal tersimpan di store. Tombol "Hapus" di sel untuk unassign. |
| 3 | **Navigasi minggu** | Tombol minggu lalu / minggu depan / Hari ini mengubah range tanggal roster. Data diambil dari `getRosterByDateRange(start, end)`. |

**Data:** Store `shifts`: `shifts[]`, `roster[]`, `assignShift`, `unassignRoster`. Compliance (max jam, istirahat) bisa dicek di **WFM → Compliance** (lihat poin 8).

---

## 4. Workforce Management (WFM) – Dashboard

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **Sidebar → Workforce Management** | Expand menu WFM. Klik **Dashboard WFM** → `/wfm`. Tampil kartu modul: Tukar Shift, Ketersediaan, Hari Libur, Compliance, Onboarding/Offboarding, Kalender Cuti, Biaya Tenaga. Masing-masing link ke halaman konkret di bawah. |

---

## 5. WFM – Tukar Shift (Shift Swap)

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **WFM → Tukar Shift** | Buka `/wfm/shift-swap`. List pengajuan tukar/cover dengan filter status (pending/disetujui/ditolak) dan tipe (tukar/cover). |
| 2 | **Setujui / tolak** | Untuk status "Pending": tombol Setujui atau Tolak. Setujui → status approved + approvedBy/approvedAt. Tolak → modal alasan, status rejected. |
| 3 | **Open shift** | Bagian "Open Shift" menampilkan slot tanggal + shift yang belum diisi. Data dari store; saat ini tidak ada form "isi open shift" dari UI (bisa ditambah later dengan `fillOpenShift`). |

**Data:** Store `wfm-shift-swap`: `requests[]`, `openShifts[]`, `approveRequest`, `rejectRequest`.

---

## 6. WFM – Ketersediaan (Availability)

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **WFM → Ketersediaan** | Buka `/wfm/availability`. List tanggal tidak tersedia per karyawan (filter: karyawan). |
| 2 | **Tambah / edit** | Tombol Tambah atau Edit: pilih karyawan, tanggal mulai–akhir, alasan (pribadi/cuti/sakit/pelatihan/lainnya), catatan. Simpan → masuk store. Data ini bisa dipakai saat penjadwalan (logic validasi bisa ditambah di halaman shift). |
| 3 | **Hapus** | Tombol Hapus + konfirmasi → record dihapus dari store. |

**Data:** Store `wfm-availability`: `unavailabilities[]`, `add`, `update`, `remove`, `isUnavailable(employeeId, date)`.

---

## 7. WFM – Hari Libur (Holidays)

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **WFM → Hari Libur** | Buka `/wfm/holidays`. List hari libur dengan filter tahun. |
| 2 | **Tambah / edit** | Tambah atau Edit: nama, tanggal, tipe (nasional/perusahaan/opsional), catatan. Simpan ke store. |
| 3 | **Tampil di kalender** | Hari libur tampil di **Kalender Cuti** (`/wfm/leave-calendar`) sebagai hari libur (beda styling dengan cuti karyawan). |

**Data:** Store `wfm-holidays`: `holidays[]`, `isHoliday(date)`, `getHoliday(date)`.

---

## 8. WFM – Compliance Jadwal

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **WFM → Compliance** | Buka `/wfm/compliance`. Bagian aturan: max jam/minggu, min istirahat antar shift (jam), max hari kerja berturut-turut, grace period (menit). Simpan → aturan tersimpan di store. |
| 2 | **Cek pelanggaran** | Bagian "Pelanggaran minggu ini" menampilkan hasil validasi roster minggu berjalan terhadap aturan di atas (per karyawan): misal melebihi jam, istirahat kurang, hari berturut melebihi batas. Data roster dari store `shifts`. |

**Data:** Store `wfm-compliance`: `rules`, `validateRoster(rosterEntries, getShift)`. Tidak mengubah roster otomatis; hanya menampilkan pelanggaran.

---

## 9. WFM – Onboarding / Offboarding

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **WFM → Onboarding/Offboarding** | Buka `/wfm/onboarding`. List checklist per karyawan (filter: tipe onboarding/offboarding, status). |
| 2 | **Buat checklist** | "Buat Checklist": pilih karyawan, tipe (onboarding/offboarding). Sistem generate task default (onboarding: dokumen, email, kartu, onboarding session, dll.; offboarding: pengembalian, revoke akses, exit interview, handover, dll.). |
| 3 | **Centang task** | Expand satu checklist → centang/undo centang task. Status task: pending / in progress / done. Checklist jadi "completed" jika semua task done. |

**Data:** Store `wfm-onboarding`: `checklists[]`, `createChecklist`, `updateTaskStatus`, task default dari konstanta di store.

---

## 10. WFM – Kalender Cuti

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **WFM → Kalender Cuti** | Buka `/wfm/leave-calendar`. Kalender bulan: tiap hari menampilkan nama karyawan yang cuti (dari leave request **approved**) dan indikator hari libur (dari master hari libur). |
| 2 | **Navigasi** | Bulan lalu / bulan depan / Hari ini. Tidak ada form di halaman ini; hanya tampilan. |

**Data:** Store `leave` (approved requests), store `wfm-holidays`.

---

## 11. WFM – Biaya Tenaga (Labor Cost)

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **WFM → Biaya Tenaga** | Buka `/wfm/labor-cost`. Filter tahun & bulan. Tabel: per departemen, kolom Budget, Actual, Variance, Variance %. |
| 2 | **Sumber data** | Saat ini data budget dan actual di store `wfm-labor-cost` (manual/seed). Untuk implementasi nyata: isi budget/actual dari integrasi payroll atau input manual di halaman lain (bisa ditambah form set budget/actual per dept per bulan). |

**Data:** Store `wfm-labor-cost`: `budgets[]`, `actuals[]`, `varianceByDept` (computed).

---

## 12. Laporan Tenaga Kerja

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **Sidebar → Laporan Tenaga Kerja** | Buka `/workforce-reports`. Tampil: total headcount, hadir/cuti hari ini, turnover rate, kehadiran hari ini (present/late/absent/leave/wfh), headcount per departemen/divisi, breakdown tipe kontrak, Demand vs Kapasitas per departemen, laporan kehadiran per periode (filter tanggal). |
| 2 | **Filter** | Tahun dan (untuk kehadiran) range tanggal. Semua dari store: employees, attendance, leave, demand. |

**Data:** Stores `employees`, `attendance`, `leave`, `demand`, `company`.

---

## 13. Pengumuman (Announcements)

| Langkah | Halaman / Aksi | Yang terjadi (nyata) |
|--------|-----------------|----------------------|
| 1 | **Sidebar → Pengumuman** | Buka `/announcements`. List pengumuman (prioritas, tanggal terbit, kadaluarsa). |
| 2 | **Tambah / edit** | `/announcements/add`, `/announcements/[id]/edit`: judul, isi, prioritas, tanggal terbit, kadaluarsa. Simpan ke store. Pengumuman aktif tampil di dashboard. |

**Data:** Store `announcements`.

---

## Ringkasan: Yang Benar-Benar Bisa Dilakukan Sekarang

- **Cuti:** Ajukan → Approve/Reject → Tampil di kalender & kurangi kuota tahunan.
- **Kehadiran:** Input/edit rekap → Tampil di list & laporan tenaga kerja.
- **Shift:** Definisikan shift → Isi roster per minggu per karyawan → Bisa dicek compliance-nya.
- **WFM Tukar Shift:** Lihat pengajuan → Approve/Reject; lihat open shift.
- **WFM Ketersediaan:** Input tanggal tidak tersedia per karyawan.
- **WFM Hari Libur:** CRUD master hari libur → Tampil di kalender cuti.
- **WFM Compliance:** Set aturan → Lihat pelanggaran roster minggu ini.
- **WFM Onboarding/Offboarding:** Buat checklist per karyawan → Centang task.
- **WFM Kalender Cuti:** Lihat cuti approved + hari libur per bulan.
- **WFM Labor Cost:** Lihat tabel budget vs actual per departemen (data dari store).
- **Laporan Tenaga Kerja:** Lihat headcount, kehadiran, turnover, demand vs kapasitas, kehadiran per periode.
- **Pengumuman:** CRUD pengumuman → Tampil di dashboard.

Semua alur di atas sesuai dengan halaman dan store yang ada di codebase; tidak ada yang halusinasi atau rencana belum dibangun.
