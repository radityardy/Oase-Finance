# Debugging Reminders Schema

Untuk fitur **"Jatah / Tagihan Rutin"**, kita butuh Collection `reminders`.

## Cek Collection: `reminders`
Buka Admin UI > **reminders**

### Tab: Fields
Pastikan field ini ada:
1.  `family_id` (Relation -> `families`) **<-- Wajib**
2.  `title` (Text) -> misal "Bayar Listrik", "Jatah Istri"
3.  `amount` (Number) -> misal 500000
4.  `next_due_date` (Date/Time) -> Kapan harus dibayar?
5.  `is_active` (Bool) -> Aktif atau tidak?

### Tab: API Rules
Pastikan gembok terbuka:
*   **List/View/Create/Update/Delete**: `family_id = @request.auth.family_id`

Jika sudah aman, silakan konfirmasi "Lanjut" biar saya buatkan halamannya!
