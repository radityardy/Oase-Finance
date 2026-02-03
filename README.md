# Oase - Family Financial Manager 🏝️

**Oase** is a premium, mobile-first web application designed to help families manage their wealth with peace of mind. It features multi-user support, detailed budgeting, expense tracking, and a clean, modern UI.

![Oase Dashboard Preview](public/file.svg) *(Replace with actual screenshot)*

## ✨ Features

- **Authentication**: Secure login and registration system.
- **Dashboard**: Real-time overview of total balance, recent transactions, and spending breakdown.
- **Transaction Management**: Record income, expenses, and transfers with ease.
- **Analytics & Reports**: Visual charts (Bar, Pie) to track spending trends daily, weekly, or monthly.
- **Budgets**: Set spending limits for specific categories and track progress.
- **Multi-User**: Dedicated accounts for family members (Admin/Member roles).
- **Responsive Design**: Optimized for both desktop and mobile devices.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Framer Motion
- **Backend**: PocketBase (Self-hosted)
- **Language**: TypeScript
- **Charts**: Recharts

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** 20+
- **PocketBase** (Download latest binary for your OS)

### 2. PocketBase Setup (Backend)

1.  **Download & Extract PocketBase**:
    -   Get the executable from [pocketbase.io](https://pocketbase.io/docs/) and extract it.
2.  **Run PocketBase**:
    ```bash
    ./pocketbase serve
    ```
    -   Access Admin UI: `http://127.0.0.1:8090/_/`
3.  **Create Admin Account**: Follow the on-screen instructions.
4.  **Sync Schema**:
    -   We provided a script to automatically sync the database schema with the codebase.
    -   Ensure PocketBase is running, then run:
        ```bash
        npm run seed
        ```
    -   *Note: This runs `scripts/init-pb.js` which creates collections (Transactions, Budgets, etc.) if they don't exist.*

### 3. Frontend Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    -   Create `.env.local`:
        ```env
        NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
        ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    -   Open `http://localhost:3000` to start using Oase.

## 📂 Project Structure

```
/src
  /app              # Next.js App Router Pages
  /components       # Reusable UI Components
  /lib              # Utilities & PocketBase Client
  /scripts          # Database maintenance scripts
```

## 🤝 Contributing

This project is for personal/family use but open to contributions. Feel free to open an issue or PR.

## 📄 License

MIT
