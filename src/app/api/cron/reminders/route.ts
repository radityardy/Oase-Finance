import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export const dynamic = 'force-dynamic'; // Static by default, we need dynamic

export async function GET(request: Request) {
    // 1. Security Check (Optional: Check for CRON_SECRET if strict security needed)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

    // 2. Initialize PocketBase Admin Client
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
    const pb = new PocketBase(pbUrl);

    try {
        const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
        const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error('Missing Admin Credentials in Environment Variables');
        }

        await pb.admins.authWithPassword(adminEmail, adminPassword);
    } catch (error: any) {
        return NextResponse.json({ error: 'Admin Authentication Failed', details: error.message }, { status: 500 });
    }

    // 3. Calculate "Today" (UTC)
    // We assume reminders are stored as YYYY-MM-DD 00:00:00 UTC
    // So we look for any records falling within the current UTC day.
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // PocketBase filter formatstrings need strictly formatted strings
    const startStr = startOfDay.toISOString().replace('T', ' ');
    const endStr = endOfDay.toISOString().replace('T', ' ');

    try {
        // 4. Query Reminders
        const reminders = await pb.collection('reminders').getFullList({
            filter: `is_active = true && next_due_date >= "${startStr}" && next_due_date <= "${endStr}"`
        });

        // 5. Trigger n8n Webhook
        const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-kamu.com/webhook/pengingat-jatah';
        const results = [];

        for (const item of reminders) {
            try {
                const res = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: item.id,
                        nama_tagihan: item.title,
                        nominal: item.amount,
                        due_date: item.next_due_date,
                        family_id: item.family_id
                    })
                });
                results.push({ id: item.id, title: item.title, status: res.status });
            } catch (err: any) {
                results.push({ id: item.id, title: item.title, status: 'failed', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${reminders.length} reminders`,
            date_filter: { start: startStr, end: endStr },
            results
        });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to process reminders', details: error.message }, { status: 500 });
    }
}
