# TODO ADMIN

Task board untuk pengembangan frontend Angular Admin - Membership System.

## Status Legend
| Simbol | Status |
|---|---|
| ✅ | DONE |
| 🟨 | IN_PROGRESS |
| ⬜ | TODO |
| 🔴 | BLOCKED |

---

## Scope Note

File ini sekarang khusus untuk frontend Angular Admin.
Task backend REST API Admin dipisahkan ke `server/AI-agent/todo-admin-server.md`.

---

## Task Board

| Status | ID | Judul | Deskripsi | Owner | Progress | Priority | Depends | Notes |
|---|---|---|---|---|---|---|---|---|
| ✅ | T-000 | Setup Bootstrap + ng-bootstrap | Install bootstrap@5.3.8, @popperjs/core, @ng-bootstrap/ng-bootstrap@17 + pasang CSS di angular.json | AI | DONE | High | - | Build sukses |
| ✅ | T-001 | AGENT-ADMIN.md | Playbook AI Agent lengkap: scope, DB schema, rules, struktur folder | AI | DONE | High | - | Termasuk aturan <any> vs interface |
| ✅ | T-002 | Routing + App Shell | app.routes.ts + AdminShellComponent + protected routes | AI | DONE | High | T-000 | Login tanpa shell, halaman utama pakai shell |
| ✅ | T-003 | Halaman Login | Form login admin: email + password + tombol submit | AI | DONE | High | T-002 | Sudah terhubung API |
| ✅ | T-004 | Members List | Tabel member + search/filter/pagination | AI | DONE | High | T-002 | Sudah live API |
| ✅ | T-005 | Member Detail | Profil member, saldo point, histori point | AI | DONE | High | T-004 | Sudah live API |
| ✅ | T-006 | Redemptions List | Tabel redeem global + filter | AI | DONE | Medium | T-002 | Sudah live API |
| ✅ | T-007 | Redemption Detail | Detail redeem (code, approval, member, amount) | AI | DONE | Medium | T-006 | Sudah live API |
| ✅ | T-008 | Tiers List | Master data tier + konfigurasi | AI | DONE | Medium | T-002 | Sudah live API |
| ✅ | T-009 | Transactions List | Ledger transaksi point in/out | AI | DONE | Medium | T-002 | Sudah live API |
| ✅ | T-010 | Transaction Detail | Detail transaksi (bill, point, member, merchant) | AI | DONE | Medium | T-009 | Sudah live API |
| ✅ | T-011 | Users List | Daftar admin/staff + ringkasan token POS | AI | DONE | Low | T-002 | Sudah live API |
| ✅ | T-012 | User Detail | Profil admin + list/create/delete token POS per merchant | AI | DONE | Low | T-011 | Opaque token lifecycle aktif |
| ✅ | T-013 | Auth Session Service | localStorage JWT, getCurrentUser(), clearSession() | AI | DONE | High | T-003 | Selesai |
| ✅ | T-014 | HTTP Interceptor | Auto sisipkan Authorization: Bearer | AI | DONE | High | T-013 | Selesai |
| ✅ | T-015 | Auth Guard | Redirect ke /login jika belum login | AI | DONE | High | T-013 | Selesai |
| ✅ | T-016 | Integrasi API Auth | POST /api/admin/auth/login, simpan token ke session | AI | DONE | High | T-014, T-015 | Selesai |
| ✅ | T-019 | Integrasi API Members | List + detail member dari API nyata | AI | DONE | High | - | Endpoint backend tersedia |
| ✅ | T-022 | Integrasi API Transactions + Redemptions | Tabel transaksi/redeem dari API nyata | AI | DONE | Medium | - | Endpoint backend tersedia |
| ✅ | T-024 | Integrasi API Tiers | Read master tier dari API | AI | DONE | Medium | - | Endpoint backend tersedia |
| ✅ | T-027 | UI Bahasa Inggris | Ubah label/text UI admin dari Indonesia ke Inggris | AI | DONE | Medium | T-003..T-012 | Konsistensi UI selesai |
| ✅ | T-028 | Vouchers List + CRUD Header | Halaman voucher list + create/update/delete (soft delete) untuk data header voucher | AI | DONE | High | T-002 | Delete pakai `presence=0`, build sukses |
| ✅ | T-029 | Voucher Detail Merchant Scope | Halaman detail voucher untuk atur relasi `voucher_merchant`; kosong = voucher global | AI | DONE | High | T-028 | Save merchant scope via API detail |
| ✅ | T-030 | Member Detail Voucher History | Tambah list riwayat redeem voucher (`members_voucher`) di halaman member detail | AI | DONE | Medium | T-005, T-029 | Ditampilkan di Member Detail |
| ✅ | T-031 | Promo List + CRUD Header | Halaman promo list + create/update/delete (soft delete) untuk info promo di app | AI | DONE | High | T-002 | Build sukses |
| ✅ | T-032 | Promo Detail Merchant Scope | Halaman detail promo untuk atur relasi `promo_merchant`; kosong = promo global | AI | DONE | High | T-031 | API + UI tervalidasi |
| 🟨 | T-026 | QA Visual | Cek semua halaman responsif + edge state kosong, validasi report filter, error handling, datepicker, dan build fix | PAIR | IN_PROGRESS | Low | T-019, T-022, T-024 | Validasi report filter, error handling, datepicker, build fix Angular sukses |
| ⬜ | T-025 | Dashboard KPI | Agregat: total member, point, redeem hari ini | PAIR | TODO | Low | T-019, T-022 | Fase berikutnya |

---

## Change Log

| Tanggal | ID Task | Perubahan | Oleh |
|---|---|---|---|
| 2026-04-21 | T-000..T-012 | Setup UI awal (shell, login, members, redemptions, tiers, transactions, users) | AI |
| 2026-04-21 | T-013..T-016 | Auth session + interceptor + guard + integrasi login admin | AI |
| 2026-04-21 | T-019, T-022, T-024 | Integrasi seluruh halaman admin ke API nyata | AI |
| 2026-04-21 | T-012 | Tambah manajemen POS token (create/delete/copy) di User Detail | AI |
| 2026-04-21 | T-027 | Standardisasi label Angular Admin ke bahasa Inggris | AI |
| 2026-04-21 | - | Pisah board backend admin ke `server/AI-agent/todo-admin-server.md` | AI |
| 2026-04-22 | T-028..T-030 | Tambah planning modul Voucher (header CRUD, merchant scope detail, history di member detail) | AI |
| 2026-04-22 | T-028..T-030 | Implementasi modul Voucher frontend selesai + build Angular sukses | AI |
| 2026-04-22 | T-026 | Validasi report filter, error handling, datepicker, build fix Angular sukses | AI |
| 2026-04-22 | T-031..T-032 | Tambah planning modul Promo (header CRUD + merchant scope detail) | AI |
| 2026-04-22 | T-031..T-032 | Implementasi modul Promo frontend selesai + build Angular sukses | AI |
| 2026-04-23 | T-026, T-031..T-032 | Added `birthdayMember`, `birthdayAfter`, `birthdayBefore` fields: UI inputs in promo detail, backend create/update support; fixed Angular template binding and removed stray code. `ng build` completed successfully (bundle warning). | AI |
