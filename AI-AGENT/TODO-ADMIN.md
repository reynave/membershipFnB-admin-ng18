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
| 🟨 | T-026 | QA Visual | Cek semua halaman responsif + edge state kosong | PAIR | IN_PROGRESS | Low | T-019, T-022, T-024 | Smoke test utama sudah jalan |
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
