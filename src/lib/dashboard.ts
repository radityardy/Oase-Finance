import { pb } from "@/lib/pocketbase";

export interface DashboardStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    recentTransactions: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        if (!pb.authStore.isValid) throw new Error("Not authenticated");

        const user = pb.authStore.model;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        // 1. Get Total Balance
        let totalBalance = 0;
        try {
            const accounts = await pb.collection("accounts").getFullList({
                fields: "current_balance",
            });
            totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
        } catch (err: any) {
            console.error("Dashboard: Failed to fetch accounts", err);
        }

        // 2. Get Monthly Income & Expense
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        try {
            const monthTransactions = await pb.collection("transactions").getFullList({
                filter: `date >= "${startOfMonth}" && date <= "${endOfMonth}"`,
                fields: "type,amount",
            });

            monthTransactions.forEach((trx) => {
                if (trx.type === 'income') monthlyIncome += trx.amount;
                if (trx.type === 'expense') monthlyExpense += trx.amount;
            });
        } catch (err: any) {
            console.error("Dashboard: Failed to fetch monthly transactions", err);
        }

        // 3. Recent Transactions
        let recentTransactions: any[] = [];
        try {
            const recent = await pb.collection("transactions").getList(1, 5, {
                sort: "-date",
                expand: "category_id,source_account_id,destination_account_id",
            });
            recentTransactions = recent.items;
        } catch (err: any) {
            console.error("Dashboard: Failed to fetch recent transactions", err);
        }

        return {
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            recentTransactions,
        };

    } catch (e) {
        console.error("Dashboard Stats General Error:", e);
        return {
            totalBalance: 0,
            monthlyIncome: 0,
            monthlyExpense: 0,
            recentTransactions: [],
        };
    }
}
