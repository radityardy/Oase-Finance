import { pb } from "./pocketbase";
import { format } from "date-fns";

export type DailyStat = {
    date: string;
    income: number;
    expense: number;
};

export type CategoryStat = {
    id: string;
    name: string;
    icon: string;
    color: string;
    total: number;
    percentage: number;
};

export type FinancialReport = {
    label: string;
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    dailyStats: DailyStat[];
    expenseCategoryStats: CategoryStat[];
    incomeCategoryStats: CategoryStat[];
};

export async function getFinancialReport(startDate: Date, endDate: Date, label: string): Promise<FinancialReport> {
    if (!pb.authStore.isValid) throw new Error("Not authenticated");
    
    // Format for PocketBase filter (UTC or local string depending on PB, usually ISO)
    // IMPORTANT: Ensure we cover the full day range.
    const startStr = startDate.toISOString().replace('T', ' '); // PocketBase uses 'YYYY-MM-DD HH:MM:SS' roughly or ISO
    const endStr = endDate.toISOString().replace('T', ' ');
    // Actually PB accepts standard ISO strings in filter

    try {
        const transactions = await pb.collection("transactions").getFullList({
             filter: `date >= "${startDate.toISOString()}" && date <= "${endDate.toISOString()}"`,
             sort: "date",
             expand: "category_id"
        });

        const dailyMap: Record<string, DailyStat> = {};
        const expenseCategoryMap: Record<string, number> = {};
        const incomeCategoryMap: Record<string, number> = {};
        const categoryDetails: Record<string, any> = {};

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(trx => {
            const dateKey = format(new Date(trx.date), 'yyyy-MM-dd');
            
            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
            }

            if (trx.type === 'income') {
                totalIncome += trx.amount;
                dailyMap[dateKey].income += trx.amount;
                
                const catId = trx.category_id;
                if (catId) {
                    incomeCategoryMap[catId] = (incomeCategoryMap[catId] || 0) + trx.amount;
                    if (!categoryDetails[catId] && trx.expand?.category_id) {
                        categoryDetails[catId] = trx.expand.category_id;
                    }
                }

            } else if (trx.type === 'expense') {
                totalExpense += trx.amount;
                dailyMap[dateKey].expense += trx.amount;

                const catId = trx.category_id;
                if (catId) {
                    expenseCategoryMap[catId] = (expenseCategoryMap[catId] || 0) + trx.amount;
                    if (!categoryDetails[catId] && trx.expand?.category_id) {
                        categoryDetails[catId] = trx.expand.category_id;
                    }
                }
            }
        });

        // Fill gaps in daily stats? 
        // For custom ranges, it might be too many days. Let's just return what we have OR fill if range is small.
        // For now, let's just return the days that have activity + boundaries if needed.
        // BETTER: Iterate from start to end date (if < 365 days)
        const dailyStats: DailyStat[] = [];
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 60) { // Only fill gaps for ranges <= 2 months
             let curr = new Date(startDate);
             while (curr <= endDate) {
                const dateKey = format(curr, 'yyyy-MM-dd');
                dailyStats.push(dailyMap[dateKey] || { date: dateKey, income: 0, expense: 0 });
                curr.setDate(curr.getDate() + 1);
             }
        } else {
            // Just return sorted keys
             const sortedKeys = Object.keys(dailyMap).sort();
             sortedKeys.forEach(k => dailyStats.push(dailyMap[k]));
        }

        const buildCategoryStats = (map: Record<string, number>, totalAmount: number): CategoryStat[] => {
            return Object.entries(map).map(([id, total]) => {
                const details = categoryDetails[id] || { name: 'Unknown', icon: '?', color: 'gray' };
                return {
                    id,
                    name: details.name,
                    icon: details.icon,
                    color: details.color,
                    total,
                    percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
                };
            }).sort((a, b) => b.total - a.total);
        };

        return {
            label,
            totalIncome,
            totalExpense,
            netSavings: totalIncome - totalExpense,
            dailyStats,
            expenseCategoryStats: buildCategoryStats(expenseCategoryMap, totalExpense),
            incomeCategoryStats: buildCategoryStats(incomeCategoryMap, totalIncome)
        };

    } catch (e) {
        console.error("Analytics Error:", e);
        throw e;
    }
}

// Keep generic MonthlyReport type alias for backward compat if needed, or remove.
export type MonthlyReport = FinancialReport;

export async function getMonthlyReport(year: number, month: number): Promise<FinancialReport> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const label = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Adjust endDate to end of day? 
    // Actually full ISO 'YYYY-MM-DD' filter matches 00:00:00 usually. 
    // To match inclusive end date, we should set time to 23:59:59 OR use next day 00:00:00 as exclusive upper bound.
    // My previous implementation used `endDate` (last day of month), likely 00:00:00.
    // Let's refine:
    
    // Start: first day 00:00:00
    const start = new Date(year, month, 1);
    start.setHours(0,0,0,0);
    
    // End: last day 23:59:59.999
    const end = new Date(year, month + 1, 0);
    end.setHours(23,59,59,999);

    return getFinancialReport(start, end, label);
}
