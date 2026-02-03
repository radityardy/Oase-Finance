# PocketBase Schema Checklist

Mohon verifikasi tab **Fields** untuk setiap collection berikut. Jika ada yang kurang, tambahkan manual.

## 1. families
*   `name` (Text)

## 2. users
*   `name` (Text)
*   `avatar` (File)
*   `family_id` (Relation -> **families**, Max Select: 1)
*   `role` (Select: `admin`, `member`. Max Select: 1)

## 3. accounts
*   `family_id` (Relation -> **families**, Max Select: 1)
*   `name` (Text)
*   `type` (Select: `bank`, `ewallet`, `cash`)
*   `current_balance` (Number)
*   `account_number` (Text)

## 4. categories
*   `family_id` (Relation -> **families**, Max Select: 1)
*   `name` (Text)
*   `type` (Select: `income`, `expense`)
*   `icon` (Text)
*   `color` (Text)

## 5. transactions
*   `family_id` (Relation -> **families**, Max Select: 1)
*   `user_id` (Relation -> **users**, Max Select: 1)
*   `type` (Select: `income`, `expense`, `transfer`)
*   `amount` (Number)
*   `date` (Date)
*   `note` (Text)
*   `category_id` (Relation -> **categories**, Max Select: 1)
*   `source_account_id` (Relation -> **accounts**, Max Select: 1)
*   `destination_account_id` (Relation -> **accounts**, Max Select: 1)
*   `beneficiary` (Text)
*   `importance_level` (Select: `need`, `want`, `general`)

## 6. budgets
*   `family_id` (Relation -> **families**, Max Select: 1)
*   `amount_limit` (Number)
*   `period` (Select: `monthly`)

## 7. reminders
*   `family_id` (Relation -> **families**, Max Select: 1)
*   `title` (Text)
*   `amount` (Number)
*   `interval` (Select: `weekly`, `monthly`)
*   `next_due_date` (Date)
*   `is_active` (Bool)
