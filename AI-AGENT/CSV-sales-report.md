Analisis selesai. Berikut hasil lengkapnya, sudah saya validasi langsung terhadap file asli di disk (bukan sekadar dari tampilan).

---

# Analisis File `DATA/MEMBER Sales Listing Report.csv`

## 1. Kesimpulan utama

File ini **bukan CSV standar**, meski berekstensi `.csv`. Ini adalah **laporan teks fixed-report dari mesin POS** (vendor: **EDP Mitrasys**, outlet: **THE LEAF**). Kolom dipisahkan oleh **`,,` (koma ganda)** — kolom kosong diselipkan di antara tiap field — dan angka di-pad dengan spasi. Periode data: **Januari 2026** (Bus Date `01/01/2026 – 31/01/2026`).

## 2. Ringkasan isi (angka hasil parse)

| Metrik | Nilai |
|---|---|
| Total baris file | 4.893 |
| Blok member | **189** (104 member tahun 2023, 85 member tahun 2024) |
| Baris item | **2.617** |
| Jumlah transaksi (Check) | **274** |
| Produk unik (PLU) | **243** |
| Item gratis (harga 0) | **33** |
| Item dengan `Item Total ≠ Item Sales` | **196** (~7,5%) |

## 3. Struktur & format

```
Member Sales Listing Report      ← judul
(THE LEAF)                       ← nama outlet
Bus Date :, 01/01/2026 to 31/01/2026, Printed At :, 05/10/2026 ...
Printed By :, EDP Mitrasys
---- (separator) ----

Member ID:,00002023000000000029,,Member Name:,LUSIANA SETIADI
Check#,,PLU,,Description,,Price,,Qty,,Item Sales,,Item Disc,,Item Total
00033,,ACCH0006,,AYAM KUNG PAO,,  98000,,  1,,  98000,,  0,,  98000
      ,,ACFR0012,,NS PUTIH,,       12500,,  1,,  12500,,  0,,  12500
...
---- (separator) ----
Total:,,  13,, 517900,,  0,, 517900
Item Sales:, 517900,,#Check:, 1
Check Disc:, 105945,,Sales/#Check:, 506472
TAX:, 55674
SC:,  38843
Gross Total:, 506472
```

**8 kolom item:** `Check#`, `PLU`, `Description`, `Price`, `Qty`, `Item Sales`, `Item Disc`, `Item Total`.

Aturan parsing penting:
1. **Delimiter `,,`** — `line -split ',,'` menghasilkan field bersih.
2. **Check# hanya di baris pertama tiap transaksi** — baris lanjutan (baris item berikutnya di check yang sama) kosong di kolom Check#. Jadi baris item berjumlah **8 field** (punya Check#) atau **7 field** (tanpa Check#, forward-fill ke check sebelumnya).
3. **Angka di-pad spasi** — wajib `.Trim()` sebelum konversi (tidak ada pemisah ribuan).
4. **Blok ringkasan** campur struktur: baris `Total:` (label + 4 angka), baris `Item Sales:,X,,#Check:,Y` (2 pasang label:nilai), dan baris tunggal `TAX:`, `SC:`, `Gross Total:`.

## 4. Semantik kolom & rumus keuangan

- `Item Sales` = `Price × Qty` — **selalu konsisten** (0 pengecualian dari 2.617 item).
- `Item Disc` (diskon level item) = **selalu 0**.
- `Check Disc` = diskon level cek/transaksi (nilai besar, bervariasi antar member — kemungkinan **diskon member/tier**).
- `Cover` = jumlah pax/tamu.
- **Rumus yang terbukti valid** (saya verifikasi ke beberapa member):

  **`Gross Total = Item Total − Check Disc + TAX + SC`**

  Contoh LUSIANA: `517900 − 105945 + 55674 + 38843 = 506472` ✓
  Contoh SHIRLEY: `3016900 − 601240 + 324318 + 226268 = 2966246` ✓

## 5. Format Member ID

20 digit, pola `0000 + YYYY + 0000 + 0000 + SEQ`. Angka tahun di posisi 5–8 (`2023`/`2024`) menandakan tahun join, sisanya sequence. Contoh `00002023000000000029` → tahun 2023, seq 29.

## 6. Anomali & masalah kualitas data (penting untuk import)

1. **`Item Total ≠ Price × Qty` pada 196 item.** Distribusi rasio `Item Total / Item Sales`:
   | Rasio | Jumlah |
   |---|---|
   | 1.25× | 3 |
   | 1.375× | 2 |
   | 1.5× | 133 |
   | 1.75× | 3 |
   | 1.8× | 8 |
   | 1.875× | 2 |
   | 2.0× | 45 |

   Ini **bukan bug** — polanya konsisten dan beragam, hampir pasti **modifier tersembunyi (ukuran porsi / upsize / harga level menu)** yang tidak diekspos sebagai kolom sendiri. Contoh: `AYM TLG GRG PEDAS` price 108000 × qty 1 → Item Sales 108000 tapi Item Total 162000 (×1.5). **Jika poin dihitung dari nominal, kolom mana yang dipakai harus dipastikan dulu.**

2. **Item gratis (harga 0) = 33 item**, ditandai `(F)`/`(IG F)`: `BIRTHDAY BUN (F)`, `MIE ULANG TAHUN (F)`, `MANGGA SAGO (IG F)`, `PUDING MANGGA (IG F)`, dll — komplimen ulang tahun / promo Instagram. Perlu keputusan apakah masuk hitungan poin.

3. **Tidak ada timestamp per transaksi.** Hanya rentang periode (Jan 2026). Check# di-reset harian (maks ~00067), jadi tanggal tidak bisa direkonstruksi dari check#. Ini keterbatasan jika butuh `timestamp` (salah satu field event socket `point:in` backend).

4. **Deskripsi disingkat** (mis. `NS PUTIH` = nasi putih). **PLU adalah kunci identitas produk yang reliabel.**

5. Nama member dobel (`IVAN`, `ANDI` muncul 2× dengan Member ID berbeda) — normal, member berbeda.

## 7. Kaitan dengan sistem membership

Laporan ini kemungkinan besar sumber data untuk **backfill transaksi & poin member Jan 2026**. Backend membership punya event socket `point:in` dengan payload `{transactionId, pointIn, bill, totalAmount, tier, timestamp}`, plus tabel transaksi/poin. Pemetaan yang perlu disiapkan:
- Member ID POS (20 digit) → member di DB membership.
- Check# → transaction/check.
- Nominal untuk hitung poin → `Item Total` atau `Item Total − Check Disc`?

## 8. Rekomendasi langkah berikutnya

Sebelum saya bangun parser/import, saya butuh kepastian 3 hal ini (ini yang menentukan kebenaran hitungan poin):

1. **`Item Total ≠ Item Sales`** — apa artinya? (saya duga modifier porsi). Kolom mana yang jadi dasar nominal poin?
2. **`Check Disc`** — apakah ini diskon member/tier yang harus dikurangi dari dasar poin?
3. **Item gratis (harga 0)** — dikecualikan dari perhitungan poin, ya?

Kalau Anda mau, saya bisa lanjut ke salah satu opsi berikut:
- **(A)** Buat skrip parser (Node.js/PowerShell) untuk mengubah laporan ini jadi JSON/baris terstruktur (Member → Check → Item), dengan validasi & laporan anomali.
- **(B)** Buat modul import ke backend membership (insert transaksi + poin), sesuai kontrak API yang ada di `server/`.
- **(C)** Keduanya, bertahap.

Mau saya lanjut ke opsi yang mana — dan bagaimana jawaban atas 3 pertanyaan klarifikasi di atas?