# Debugging API Rules

Jika Anda mengalami error `ClientResponseError 400` atau `Failed to authenticate`, kemungkinan besar **API Rules** terkunci.

Mohon buka **PocketBase Admin UI** > **Collections** dan cek Rules berikut:

### 1. Collection `users`
klik tombol **Settings (roda gigi)** di samping `users`.
-   **List/Search Rule**: `id = @request.auth.id`
-   **View Rule**: `id = @request.auth.id`
-   **Create Rule**: *(Biarkan Kosong)* -> Artinya **Public** (siapapun bisa daftar).
-   **Update Rule**: `id = @request.auth.id`
-   **Delete Rule**: `id = @request.auth.id`

> **Note**: Jika `Create Rule` berisi `null` (abu-abu/disabled), ganti menjadi kosong (klik icon gembok sampai terbuka).

### 2. Collection `families`
-   **List/Search Rule**: `id = @request.auth.family_id`
-   **View Rule**: `id = @request.auth.family_id`
-   **Create Rule**: `@request.auth.id != ""` 
    -   ⚠️ **PENTING**: Rule ini berbeda! Artinya "User yang sudah login boleh buat Family". Jangan pakai `family_id` di sini.
-   **Update Rule**: `id = @request.auth.family_id`

### 3. Collection `accounts`, `transactions`, `categories`, `budgets`
Semuanya sama:
-   **List**: `family_id = @request.auth.family_id`
-   **View**: `family_id = @request.auth.family_id`
-   **Create**: `family_id = @request.auth.family_id`
-   **Update**: `family_id = @request.auth.family_id`

### 4. Test Ulang
Setelah memperbaiki Rules di atas:
1.  Buka `/seed` lagi.
2.  Klik "Generate".
3.  Jika sukses, coba Login.
