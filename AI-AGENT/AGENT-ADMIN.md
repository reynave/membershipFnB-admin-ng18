# AGENT ADMIN PLAYBOOK

Dokumen ini adalah onboarding cepat untuk AI Agent admin (Angular + API admin) agar bisa kerja aman, cepat, dan konsisten.

## 1) Tujuan

- Mempercepat delivery dashboard admin untuk monitoring data membership.
- Menjaga sinkronisasi kerja antara AI Agent dan Developer.
- Menghindari perubahan yang memecah flow bisnis existing.

## 2) Ringkasan Arsitektur

- Path frontend admin: `admin/`
- Framework frontend: Angular 18 (standalone components)
- Backend API: Node.js Express di `server/`
- Base endpoint admin: `/api/admin/*`
- Auth: JWT Bearer token via login admin
- UI Library: `@ng-bootstrap/ng-bootstrap` v17 + Bootstrap 5.3 CSS
- Bootstrap CSS dimuat via `angular.json` styles (bukan CDN, bukan Bootstrap JS)

### Cara Pakai ng-bootstrap (Standalone)

Karena app Angular admin pakai standalone components, import langsung komponen ng-bootstrap yang dibutuhkan per komponen:

```ts
import { NgbPaginationModule, NgbAlertModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  imports: [NgbPaginationModule, NgbAlertModule],
  ...
})
export class MembersListComponent { }
```

Komponen ng-bootstrap yang umum dipakai di admin:

| Komponen | Import | Kegunaan |
|---|---|---|
| Pagination | `NgbPaginationModule` | Tabel data member/transaksi |
| Modal | `NgbModalModule` | Konfirmasi aksi, detail popup |
| Alert | `NgbAlertModule` | Notifikasi sukses/error |
| Dropdown | `NgbDropdownModule` | Filter/action menu |
| Badge | `NgbModule` atau CSS Bootstrap langsung | Status member/tier |
| Tooltip | `NgbTooltipModule` | Info tambahan di tabel |

> **Catatan:** Bootstrap JS **tidak dipasang** — semua interaksi JS ditangani ng-bootstrap via Angular. Jangan tambahkan `bootstrap.bundle.min.js` ke scripts.

## 3) Scope Fitur Admin

Fokus fitur admin yang diharapkan (urutan prioritas):

1. **Autentikasi**
   - Halaman login admin yang aman
   - Tabel DB: `users` (id, name, email, password_hash)
   - Catatan: tabel `users` terpisah dari `members` (member = customer, users = staff/admin)

2. **Manajemen Anggota**
   - Daftar semua member + pagination + search + filter status/tier
   - Detail member: profil lengkap, tier aktif, saldo point, histori transaksi
   - Tabel DB: `members` (id, tierId, phone, name, email, status, verified, activated, presence)

3. **Penukaran Produk (Redeem)**
   - Daftar semua transaksi redeem global (semua member, semua merchant)
   - Detail redeem: redeemCode, approvalCode, amount, member, tanggal
   - Tabel DB: `transaction` (totalRedeem, redeemCode, approvalCode), `members_code` (redeemCode, expDateTime, presence)

4. **Tier / Level Keanggotaan**
   - Master data tier: daftar tier aktif dan konfigurasinya
   - Field penting: name, percentOfCashBack, accumulationAmount, minAmount, maxPercentOfBill, expDate, status
   - Tabel DB: `tier`

5. **Keuangan & Audit (Transaksi)**
   - Buku besar transaksi: semua transaksi point masuk/keluar lintas member dan merchant
   - Detail transaksi: bill, totalAmount, pointIn, pointOut, tierId, merchantId, tanggal
   - Tabel DB: `transaction`, `points`

6. **Administrasi Sistem**
   - Daftar admin/user pengelola sistem
   - Detail user: nama, email, token POS terkait, merchant yang dikelola
   - Tabel DB: `users`, `users_token` (userId, merchantId, token)

> **Dashboard agregat (KPI summary)** direncanakan sebagai fase berikutnya setelah fitur inti selesai.

## 4) Referensi Skema Database (Ringkasan)

Tabel utama yang diakses admin:

| Tabel | Fungsi | Field Kunci |
|---|---|---|
| `users` | Akun admin/staff | id, name, email, password_hash |
| `users_token` | Token POS per merchant | userId, merchantId, token |
| `members` | Data customer/anggota | id, tierId, phone, name, email, status, verified, activated, presence |
| `tier` | Master level keanggotaan | id, name, percentOfCashBack, accumulationAmount, minAmount, maxPercentOfBill, expDate, status |
| `merchant` | Data merchant/outlet | id, name, startDate, expDate, status, presence |
| `transaction` | Transaksi dari POS | id, memberId, merchantId, bill, totalAmount, totalRedeem, redeemCode, approvalCode, billDate, syncType |
| `points` | Buku besar point | id, transactionId, memberId, merchantId, tierId, pointIn, pointOut, transactionDate, archived |
| `members_code` | QR/redeem code member | id, memberId, redeemCode, expDateTime, presence |

Kolom `presence = 1` = data aktif/tidak dihapus (soft delete pattern).
Kolom `status = 1` = aktif.
Kolom `archived = 0` = belum diarsipkan (dipakai untuk kalkulasi saldo point aktif).

## 5) Sumber Kebenaran (Wajib Dibaca Dulu)

1. `AI-AGENT/TODO-ADMIN.md` (status task dan ownership)
2. `AI-AGENT/RULES-ADMIN.md` (aturan teknis wajib)
3. `src/app/app.routes.ts` (map halaman admin)
4. `server/src/routes/admin/` (kontrak endpoint admin)
5. `server/src/modules/` (logika bisnis backend)

## 6) Aturan Wajib Frontend Admin

Ikuti aturan ini tanpa pengecualian:

1. Dilarang pakai fitur Angular experimental/preview.
2. Dilarang pakai `loadChildren`.
3. Request API wajib generic `any`:

```ts
this.http.get<any>(url, options)
this.http.post<any>(url, body, options)
```

4. Aksi back wajib `history.back()`.
5. Jangan ubah kontrak API backend tanpa instruksi eksplisit.
6. Jangan ubah task owner lain yang sedang `IN_PROGRESS`.

### Catatan: Penggunaan `<any>` vs Interface/Class

Karena semua request HTTP wajib `<any>`, **interface TypeScript untuk response API ditiadakan** selama kontrak API belum final. Ini disengaja agar tidak ada overhead maintenance ketika shape response berubah.

Yang **boleh** tetap pakai interface/type:
- Model form input (contoh: `LoginForm`, `FilterParams`) — karena ini kontrak internal komponen, bukan dari API.
- State lokal yang kompleks di dalam komponen (opsional, jika membantu keterbacaan).

Yang **tidak perlu** dibuat:
- Interface untuk response HTTP (`MemberResponse`, `PointData`, dll.) — cukup akses properti langsung dari `response.data`.

Contoh benar:

```ts
// ✅ form model internal — boleh pakai interface
interface LoginForm {
  email: string;
  password: string;
}

// ✅ HTTP call — wajib <any>
this.http.post<any>(`${this.baseUrl}/auth/login`, payload)
  .subscribe(res => {
    const token = res.data.token; // akses langsung, tanpa cast
  });
```

## 7) Kontrak API Admin (Baseline)

Endpoint yang sudah tersedia dan bisa dijadikan baseline:

- `POST /api/admin/auth/register`
- `POST /api/admin/auth/login`
- `GET /api/admin/ping`
- `GET /api/admin/members/profile` (profil user admin login)
- `GET /api/admin/members/points/history` (history point user login)
- `GET /api/admin/reports/members` (HTML report)

Catatan:

- Sebagian endpoint untuk kebutuhan "lihat semua data" kemungkinan belum lengkap.
- Jika butuh endpoint baru (list semua member, detail member by id, agregasi dashboard), AI boleh usulkan draft endpoint tapi implementasi final harus align dengan keputusan Developer.

## 8) Pembagian Peran (AI vs Developer)

### AI Agent fokus

- Scaffolding page/module admin
- Integrasi API di sisi presentasi
- Tabel/filter/pagination untuk data admin
- Refactor aman tanpa mengubah behavior bisnis
- Update TODO dan change log

### Developer fokus

- Keputusan bisnis final
- Approval endpoint/kontrak baru
- Security policy produksi (role, permission, audit)
- QA/UAT final

### Pair (AI + Developer)

- Finalisasi spesifikasi endpoint list/detail/agregasi
- Validasi data parity dari DB ke UI admin
- Hardening sebelum release

## 9) Workflow Task yang Benar

1. Cek `TODO-ADMIN.md`.
2. Pilih task yang statusnya bukan `IN_PROGRESS` owner lain.
3. Set owner lalu ubah status jadi `IN_PROGRESS`.
4. Kerjakan perubahan kecil dan terfokus.
5. Validasi minimal: build sukses dan route target berjalan.
6. Ubah status ke `DONE` atau `REVIEW`.
7. Tambah entri change log dengan tanggal.

## 10) Definition of Done (DoD)

Task admin dianggap selesai jika:

- UI admin bisa diakses dan sesuai kebutuhan task
- Integrasi API berjalan tanpa menambah error compile
- Tidak melanggar `RULES-ADMIN.md`
- Tidak merusak flow auth/session admin
- `TODO-ADMIN.md` terupdate lengkap (owner, status, notes, changelog)

## 11) Larangan Umum

- Jangan hardcode data bisnis permanen di komponen.
- Jangan menambah dependency baru tanpa alasan kuat.
- Jangan refactor lintas banyak fitur dalam satu task kecil.
- Jangan mengubah endpoint backend existing tanpa komunikasi.

## 12) Struktur Awal Frontend Admin (Rekomendasi)

Gunakan struktur berikut sebagai baseline saat app masih kosong:

- `src/app/core/`
  - `guards/`
  - `interceptors/`
  - `services/` (session/auth/api)
- `src/app/features/`
  - `auth/` (login admin)
  - `members/` (list + detail member)
  - `redemptions/` (list + detail redeem code)
  - `tiers/` (master tier/level)
  - `transactions/` (ledger + detail transaksi)
  - `users/` (manajemen admin)
- `src/app/shared/`
  - `components/`
  - `pipes/`
  - `utils/`

## 13) Checklist AI Agent Sebelum Coding

- [ ] Sudah baca `TODO-ADMIN.md`
- [ ] Sudah baca `RULES-ADMIN.md`
- [ ] Sudah cek endpoint backend yang dipakai
- [ ] Sudah tahu dampak perubahan ke auth/routing
- [ ] Sudah rencanakan validasi build
- [ ] Sudah siap update changelog setelah selesai

## 14) text / label / note pakai bahasa englsih
