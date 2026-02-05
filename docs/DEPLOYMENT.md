# Deployment Guide

## 1. Prerequisites

-   A VPS or Server for **PocketBase** (or use PocketBase Cloud).
-   A Vercel account (or other Node.js hosting) for the **Next.js Frontend**.

## 2. Deploying Backend (PocketBase)

1.  **Get the Binary**: Download the latest PocketBase release for your server's OS (Linux/Windows).
2.  **Upload to Server**: Copy the `pocketbase` executable to your server.
3.  **Run Service**:
    ```bash
    ./pocketbase serve --http="0.0.0.0:8090"
    ```
    *Tip: Use a process manager like `systemd` or `pm2` to keep it running.*

4.  **Sync Schema**:
    -   Run the seed script from your local machine (pointing to the remote URL) or upload the script to the server.
    -   Ensure the collections (`transactions`, `accounts`, etc.) are created.

## 3. Deploying Frontend (Vercel)

1.  **Push to GitHub**: Ensure your latest code is pushed to your repository.
2.  **Import to Vercel**:
    -   Go to Vercel Dashboard -> Add New -> Project.
    -   Select your repository.
3.  **Configure Environment Variables**:
    -   Add `NEXT_PUBLIC_POCKETBASE_URL`.
    -   Value: `https://your-pocketbase-server-url.com` (or IP address).
4.  **Deploy**: Click Deploy.

## 4. Post-Deployment Checks

-   **CORS**: Ensure your PocketBase server allows requests from your Vercel domain. Check PocketBase Admin UI -> Settings.
-   **Middleware**: Verify that redirects (Login protection) work correctly in production.
-   **Cron Jobs**: If using Vercel Cron (`vercel.json`), ensure the cron endpoint is protecting properly.
