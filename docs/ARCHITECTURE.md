# Project Architecture

## Tech Stack

-   **Frontend Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS v4
-   **Animation**: Framer Motion
-   **Language**: TypeScript
-   **Backend**: PocketBase (Self-hosted)
-   **Charts**: Recharts
-   **State Management**: React Hooks + URL State (Nuqs recommended for future)

## Folder Structure

```
/src
  /app                 # Next.js App Router (File-system based routing)
    /(auth)            # Authentication Group (Login/Register) - Shared Layout
    /(dashboard)       # Protected Dashboard Routes - Shared Sidebar Layout
    /api               # API Routes (Cron jobs, etc.)
    globals.css        # Global Styles & Tailwind Directives
    layout.tsx         # Root Layout
    page.tsx           # Home Page (Redirects to Dashboard)

  /components          # Reusable UI Components
    /forms             # TransactionForm, AccountForm, AccountSelect, CategorySelect
    /ui                # Primitive UI Elements (Buttons, Inputs, Cards)
    /settings          # Admin Features (CategoryManagement, UserManagement)
  
  /lib                 # Utilities & Libraries
    pocketbase.ts      # PocketBase Client Instance
    utils.ts           # Class merging (cn) & Currency Formatter
    analytics.ts       # Data aggregation for charts
    budgets.ts         # Budget tracking logic
    reminders.ts       # Reminder utilities
  
  /scripts             # Maintenance Scripts
    init-pb.js         # PocketBase Schema Synchronization / Seeding
```

## Core Concepts

### 1. Authentication
Authentication is handled via PocketBase's `authWithPassword`. The session token is stored in cookies to allow Middleware to protect routes.

### 2. Dashboard Layout
The `(dashboard)` group uses a shared layout `src/app/(dashboard)/layout.tsx` which includes the `Sidebar`. This ensures navigation persists while browsing specific features.

### 3. Data Fetching
-   Most data fetching happens client-side using the `pocketbase` SDK in `useEffect`.
-   **Future Improvement**: Move to Server Components for initial data fetching for better performance.

### 4. Database Schema (PocketBase)
-   **users**: App users (Admin/Member roles).
-   **families**: Groups users together.
-   **accounts**: Bank accounts / Wallets linked to a family.
-   **transactions**: Income/Expense records.
-   **budgets**: Spending limits per category.
-   **reminders**: Recurring bill reminders.

### 5. Background Jobs (Cron)
-   **Reminders**: `src/app/api/cron/reminders`
    -   Checks for due reminders in the database.
    -   Intended to be called via Vercel Cron or external scheduler to send notifications.
