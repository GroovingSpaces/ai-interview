# Product Requirements Document (Revamp)
## Web Portal HCM - Frontend Journey Only

> Dokumen ini adalah revamp PRD yang berfokus pada **journey frontend** dengan stack **Nuxt.js**.  
> Backend, database, integrasi service internal, dan infrastruktur deployment tidak dibahas detail di sini.

---

## 1. Document Info

| Field | Value |
|---|---|
| Title | PRD Web Portal HCM - Frontend Journey |
| Version | 2.0 (Revamp) |
| Status | Ready for Product & Engineering Review |
| Owner | Product Manager + Frontend Lead |
| Stack | Nuxt.js 3 + Vue 3 + TypeScript |
| Date | 27 Apr 2026 |
| Scope | Frontend web app only |

---

## 2. Product Vision

Membangun satu portal HCM berbasis web yang:
- cepat dipahami user lintas role,
- konsisten antarmodul,
- mudah diskalakan,
- dan memberikan pengalaman kerja harian yang sederhana dari login sampai task completion.

Fokus utama adalah **end-to-end user journey di sisi UI/UX frontend**, bukan proses backend.

---

## 3. Goals & Success Metrics

### 3.1 Goals
- Menyatukan modul HR dalam satu super navigation.
- Mempercepat task utama (akses data, submit request, monitoring, approval).
- Menyediakan struktur halaman yang konsisten (list -> detail -> action -> feedback).
- Menjamin UI siap bilingual (ID/EN) dan accessibility dasar.

### 3.2 Success Metrics (Frontend)
| Metric | Target |
|---|---|
| Task completion rate (journey utama) | >= 95% |
| Time to complete simple task (submit request) | <= 60 detik |
| First meaningful navigation after login | <= 3 detik (P75) |
| LCP | < 2.5 detik (P75) |
| INP | < 200 ms (P75) |
| Frontend critical bug pada release | 0 |

---

## 4. Scope

### In Scope
- Semua halaman frontend pada portal admin/manager/employee.
- Sidebar + topbar + breadcrumb + page title behavior.
- Journey navigasi modul dan submodul.
- State UI: loading, empty, error, success.
- Form interaction, validasi sisi client, toast/alert feedback.
- Role-based menu visibility di level frontend.

### Out of Scope
- Logic approval engine di backend.
- Perhitungan payroll/analytics di backend.
- Integrasi API detail per endpoint.
- Arsitektur DB, queue, caching server.
- IAM enterprise design.

---

## 5. Frontend Tech Direction (Nuxt.js)

### 5.1 Mandatory Stack
- **Nuxt.js 3** (SSR/CSR hybrid)
- **Vue 3 + `<script setup>`**
- **TypeScript**
- **Pinia** untuk state lintas halaman
- **TailwindCSS** untuk styling utility
- **Vue I18n** untuk locale switching

### 5.2 Routing & Layout
- File-based routing Nuxt (`pages/**`).
- Layout utama: `layouts/default.vue`.
- Middleware frontend:
  - `auth` (sudah login atau belum),
  - `admin` (akses role tertentu),
  - middleware tambahan untuk guard modul spesifik jika dibutuhkan.

### 5.3 Frontend Principles
- Konsistensi UX lebih penting daripada variasi visual.
- Setiap halaman wajib punya `title`, state loading, state empty, state error.
- Navigasi tidak boleh membingungkan (active state jelas).
- Komponen reusable lebih diutamakan daripada implementasi ad-hoc per halaman.

---

## 6. User Persona & Context

| Persona | Kebutuhan Utama di Frontend |
|---|---|
| Admin HR | Setup data, monitoring lintas modul, service console |
| Manager | Approve, monitor tim, lihat insight tim |
| Employee | Self-service: profile, dokumen, attendance, request, learning |
| C-Level | Dashboard & insight ringkas untuk keputusan |

---

## 7. Global Journey Framework

Semua modul mengikuti pola journey yang sama:

1. **Entry**: user login -> landing dashboard role.
2. **Discovery**: user pilih modul dari sidebar.
3. **Action**:
   - list page (lihat data),
   - detail page (lihat konteks),
   - form/action page (submit/update/approve).
4. **Feedback**: toast + inline status + badge status.
5. **Recovery**: user bisa retry saat error atau kembali ke list.

Pola ini harus konsisten agar user tidak re-learn setiap modul.

---

## 8. Information Architecture (Current Frontend Journey)

### 8.1 Main Navigation
- Dashboard
- Management
  - Users
  - Roles
- Employee
  - Database
  - Documents
- Time & Attendance
  - My Attendance
  - Team Attendance
  - Shift Schedule
  - Overtime
  - Attendance Reports
- Leave & Permission
  - My Leave
  - Leave Request
  - Business Trip
  - Leave Reports
- Performance
  - My KPI
  - Self-Assessment
  - Team Review
  - Calibration
  - PIP
  - 9-Grid Box
  - Promotion
  - Mutation
- Compensation & Benefits
  - Payslip
  - Benefits
  - Bonus & Incentive
  - Comp Adjustment
  - Payroll Run
- Talent Acquisition
  - Requisitions
  - Job Openings
  - Candidate
  - Recruitment
- Workforce Planning
  - Headcount Forecast
  - Demand Tracker
  - Resource Allocation
- Succession
  - Key Roles
  - Successor Pool
- Learning
  - My Learning
  - Course Catalog
  - Certifications
  - Training
- Insights
  - Burnout Indicator
  - Attrition Forecast
  - Training Suggestions
- HR Service
  - Submit Request
  - My Tickets
  - Service Console
- Tasks
  - My Tasks
  - Assign Task
  - Evidence Review

---

## 9. Detail Journey per Area

### 9.1 Authentication Journey
- User membuka `/portal-login`.
- Submit credential -> jika valid, diarahkan ke dashboard sesuai role.
- Jika role tidak berhak akses halaman tertentu, tampil redirect aman ke route valid.
- Session invalid -> redirect ke login + pesan yang jelas.

### 9.2 Dashboard Journey
- Entry point untuk ringkasan aktivitas.
- Menampilkan card shortcut ke modul prioritas.
- Role-based content:
  - Admin: fokus operasional dan setup.
  - Manager: fokus approval + tim.
  - Employee: fokus self-service.

### 9.3 Master Data Journey (Management + Employee)
- List data -> filter/search -> buka detail -> update -> simpan.
- Semua action penting menampilkan feedback visual.
- Untuk data dokumen dan profile, form harus mendukung field panjang, dropdown, upload, dan validasi.

### 9.4 Transaction Journey
Area: Attendance, Leave, HR Service, Tasks.

Pattern:
- User create request/action.
- UI tampilkan status progress (draft/submitted/approved/rejected/done).
- User bisa cek histori di halaman list terkait.

### 9.5 Insight Journey
Area: Insights, Workforce Planning, Succession.

Pattern:
- User melihat indikator utama.
- Drill-down (jika tersedia) ke detail konteks.
- Insight harus mudah dipahami non-teknis (judul, ringkasan, trend indicator).

### 9.6 Learning Journey
- User melihat daftar learning pribadi, katalog, sertifikasi, training.
- Fokus UX: discovery cepat, status progres jelas, dan CTA yang konsisten.

---

## 10. Functional Requirements (Frontend)

### 10.1 Navigation & State
- Sidebar support expand/collapse group menu.
- Active state akurat per route.
- Parent menu dapat dibuka/tutup tanpa mengganggu route aktif.

### 10.2 Page Baseline
Setiap halaman wajib memiliki:
- judul halaman,
- deskripsi singkat (opsional),
- konten utama,
- handling loading/empty/error.

### 10.3 Form Baseline
- Validasi required field.
- Error message jelas dan dekat dengan field.
- Tombol submit disabled saat invalid/loading.
- Success state setelah submit.

### 10.4 Dropdown & Overlay
- Dropdown tidak boleh overlap tertutup kontainer lain.
- Komponen select wajib punya z-index dan stacking behavior yang konsisten.

### 10.5 Localization
- Semua label user-facing memakai key i18n.
- Toggle locale harus mempertahankan route saat ini.

---

## 11. Non-Functional Requirements

### 11.1 Performance
- Route-level code splitting.
- Lazy load komponen berat.
- Hindari render berulang yang tidak perlu.

### 11.2 Accessibility
- Navigasi keyboard untuk menu dan form.
- Kontras warna memenuhi standar minimum.
- Komponen interaktif memiliki focus style terlihat.

### 11.3 Reliability UX
- Tidak ada dead-link.
- Tidak ada route blank tanpa fallback UI.
- Error API harus dipetakan ke pesan user-friendly.

---

## 12. Design & Interaction Rules

- Gunakan design token yang konsisten.
- Struktur spacing, radius, dan typography konsisten lintas modul.
- Komponen global:
  - `UiInput`, `UiSelect`, `UiButton`, `UiCard`, `UiModal`, `UiToast`.
- Hindari variasi komponen custom yang duplikatif bila sudah ada komponen UI standar.

---

## 13. Analytics & Instrumentation (Frontend)

Minimal event yang harus dicatat:
- login_success / login_failed
- menu_clicked
- form_submit_success / form_submit_failed
- page_error_rendered
- locale_switched

Tujuan: mengukur friction pada journey, bukan sekadar traffic.

---

## 14. QA & Acceptance Criteria

### 14.1 Definition of Done per Page
Halaman dianggap selesai jika:
- route bisa diakses sesuai role,
- UI tidak broken pada viewport desktop,
- state loading/empty/error tersedia,
- title dan i18n key valid,
- tidak ada linter error,
- happy-path manual test lolos.

### 14.2 Regression Checklist
- Active menu tetap benar setelah perubahan routing.
- Dropdown tidak ketutup elemen lain.
- Form validation tetap berjalan.
- Locale switch tidak merusak label/menu.

---

## 15. Delivery Plan (Frontend)

### Phase 1 - Navigation Foundation
- Stabilkan sidebar, grouping, active state, page title mapping.

### Phase 2 - Journey Consistency
- Samakan baseline semua halaman (header, content shell, states).

### Phase 3 - UX Hardening
- Performa, a11y, i18n completeness, edge-state polish.

### Phase 4 - Insight & Quality
- Tambah telemetry, observability UI, dan regression guard.

---

## 16. Open Questions

- Apakah semua submenu tetap role-restricted `admin/c_level` atau ada ekspansi role?
- Apakah halaman blank akan diisi bertahap berdasarkan prioritas bisnis tertentu?
- Standar translasi Indonesia final ingin formal atau conversational?
- Apakah dibutuhkan dark mode parity checklist per modul?

---

## 17. Appendix: Frontend Route Naming Guideline

- Gunakan slug konsisten dan kebab-case.
- Untuk submenu, gunakan prefix modul:
  - `/workforce-planning/headcount-forecast`
  - `/hr-service/my-tickets`
  - `/tasks/evidence-review`
- Hindari nama route ambigu.

---

*End of Revamped PRD (Frontend Journey, Nuxt.js)*
