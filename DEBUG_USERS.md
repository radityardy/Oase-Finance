# Debugging Users Collection

Masalah "Gagal Login" atau "Bengong" sering terjadi karena skema `users` tidak lengkap (karena import `users` seringkali tidak menimpa bawaan PocketBase).

## 1. Cek Fields di Users (WAJIB)
Buka Admin UI > Collections > **users** > Tab **Fields**.
Pastikan ada field ini:
1.  `family_id` (Type: Relation to `families`, Max Select: 1).
    *   *Jika tidak ada, Login akan sukses tapi data kosong/bengong.*
2.  `role` (Type: Select, Options: `admin`, `member`).

**Jika field ini hilang, Tambahkan Manual sekarang.** (Sama seperti cara menambah field di `accounts` tadi).

## 2. Cek Auth Settings
Buka Admin UI > **Settings** > **Auth providers**.
1.  Pastikan **Email** enabled.
2.  Klik opsi Email, pastikan **"Require email verification"** itu **OFF** (kecuali Anda mau setup SMTP).
    *   *Jika ini ON, user baru tidak akan bisa login sebelum klik link di email.*

## 3. Cek API Rules Users
Pastikan Rule `users` seperti ini:
-   **List**: `id = @request.auth.id`
-   **View**: `id = @request.auth.id`
-   **Create**: (KOSONG / Public)
    *   *Jika create terkunci, register akan gagal.*
-   **Update**: `id = @request.auth.id`

## 4. Cek Data
Cek isi tabel `users`.
-   Apakah user `admin@test.com` benar-benar ada?
-   Apakah kolom `family_id` nya terisi?

Jika semua sudah oke, coba Login manual lagi.
