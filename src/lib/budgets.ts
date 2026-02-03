import { pb } from "./pocketbase";

export type GlobalBudget = {
    id?: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    period: string;
};

export async function getGlobalBudget(): Promise<GlobalBudget> {
    if (!pb.authStore.isValid) return { limit: 0, spent: 0, remaining: 0, percentage: 0, period: 'monthly' };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    try {
        const user = pb.authStore.model;
        if (!user?.family_id) {
            console.warn("getGlobalBudget: User has no family_id", user);
            return { limit: 0, spent: 0, remaining: 0, percentage: 0, period: 'monthly' };
        }

        // 1. Fetch Global Budget (Limit)
        console.log("Fetching budgets...");
        // Use getFullList to be safe, though getList should work. identifying if sort is the issue.
        const budgets = await pb.collection("budgets").getFullList({
             // sort: '-created', // Removing sort to debug 400 error
             requestKey: null // Disable auto-cancellation
        }).catch(err => {
            console.error("Error fetching budgets list:", err);
            throw err;
        });
        const currentBudget = budgets[0];

        // 2. Calculate Total Expenses for this Month
        console.log("Fetching transactions...");
        const transactions = await pb.collection("transactions").getFullList({
            filter: `type = "expense" && date >= "${startOfMonth}" && date <= "${endOfMonth}"`,
            fields: "amount" // Minimize data transfer
        }).catch(err => {
             console.error("Error fetching transactions list:", err);
             throw err;
        });

        const totalSpent = transactions.reduce((sum, trx) => sum + trx.amount, 0);
        const limit = currentBudget ? currentBudget.amount_limit : 0;

        return {
            id: currentBudget?.id,
            limit: limit,
            spent: totalSpent,
            remaining: limit > 0 ? limit - totalSpent : 0,
            percentage: limit > 0 ? (totalSpent / limit) * 100 : 0,
             period: currentBudget?.period || 'monthly'
        };

    } catch (e) {
        console.error("Error fetching global budget:", e);
        if (e instanceof Error && 'data' in e) {
             console.error("PB Error Data:", (e as any).data);
        }
        return { limit: 0, spent: 0, remaining: 0, percentage: 0, period: 'monthly' };
    }
}
