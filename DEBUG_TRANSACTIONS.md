# Debugging Transactions & Categories Error 400

Error 400 biasanya berarti ada "Rule" yang invalid atau "Field" yang hilang.

## 1. Cek Collection: `transactions`
Buka Admin UI > **transactions**

### Tab: Fields
Pastikan field ini ada dan **SAMA PERSIS**:
1.  `family_id` (Relation -> `families`, Max Select: 1)
2.  `category_id` (Relation -> `categories`)
3.  `source_account_id` (Relation -> `accounts`)
4.  `destination_account_id` (Relation -> `accounts`)
5.  `date` (Date/Time)
6.  `amount` (Number)
7.  `type` (Select: `income`, `expense`, `transfer`)

### Tab: API Rules
Pastikan Rules diisi seperti ini (Gembok Terbuka/Hijau):
*   **List Rule**: `family_id = @request.auth.family_id`
*   **View Rule**: `family_id = @request.auth.family_id`
*   **Create Rule**: `family_id = @request.auth.family_id`
*   **Update Rule**: `family_id = @request.auth.family_id`
*   **Delete Rule**: `family_id = @request.auth.family_id`

*(Jika salah tulis rule, misal `id = ...` atau `@request.auth.id`, bisa error 400)*

---

## 2. Cek Collection: `categories`
Buka Admin UI > **categories**

### Tab: Fields
Pastikan ada:
1.  `family_id` (Relation -> `families`)
2.  `name` (Text)
3.  `type` (Select: `income`, `expense`)

### Tab: API Rules
Sama seperti Transactions:
*   **List Rule**: `family_id = @request.auth.family_id`
*   dll.

---

## 3. Cek Data Keluarga User
Cek user admin Anda di tabel `users`.
*   Pastikan kolom `family_id` **TERISI** (tidak kosong).
*   Jika kosong, Rule `@request.auth.family_id` akan error.

---

**Cara Cek Error Spesifik:**
1.  Klik kanan di Browser > Inspect > **Console**.
2.  Lihat log yang saya baru tambahkan ("Failed to fetch...").
3.  Error yang mana? `accounts`, `monthly transactions`, atau `recent transactions`?
