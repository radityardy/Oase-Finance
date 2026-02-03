# Oase - Family Financial Manager

Oase is a premium, mobile-first web application for managing household finances. It features multi-user support, detailed budgeting, and a clean, modern UI.

## 🛠 Tech Stack

-   **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Framer Motion
-   **Backend**: PocketBase (Self-hosted)
-   **Language**: TypeScript

## 🚀 Getting Started

### 1. Prerequisites

-   Node.js 18+
-   PocketBase (Download latest binary)

### 2. PocketBase Setup (Backend)

Since Oase uses a self-hosted PocketBase instance, you need to set it up manually.

1.  **Download PocketBase**:
    -   Go to [pocketbase.io/docs](https://pocketbase.io/docs/) and download the executable for your OS (Windows/Linux/Mac).
    -   Extract the zip file to a folder (e.g., `./backend`).

2.  **Run PocketBase**:
    -   Open a terminal in the folder where you extracted `pocketbase`.
    -   Run: `./pocketbase serve`
    -   Access the Admin UI at: `http://127.0.0.1:8090/_/`

3.  **Create Admin Account**:
    -   Follow the on-screen instructions to create your root admin email/password.

4.  **Import Schema**:
    -   I have provided a `pocketbase_schema.json` file in the root of this project.
    -   In the PocketBase Admin UI, go to **Settings** > **Import Collections**.
    -   Click **Load from JSON file** and select the `pocketbase_schema.json` from this project.
    -   **Important**: This will create all necessary collections (`families`, `accounts`, `transactions`, etc.) with the correct relationships and access rules.

5.  **Test Connection**:
    -   Ensure PocketBase is running on `http://127.0.0.1:8090`.

### 3. Frontend Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    -   Create a `.env.local` file in the root directory.
    -   Add the following:
        ```env
        NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
        ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    -   Open `http://localhost:3000` to see the app.

## 📂 Project Structure

```
/src
  /app              # Pages & Routes
  /components       # UI Components
  /lib              # Utils & SDKs
  /types            # TypeScript Definitions
```

## ✨ Features TO-DO

-   [ ] Auth (Login/Register)
-   [ ] Dashboard
-   [ ] Transaction Management
-   [ ] Budgeting
