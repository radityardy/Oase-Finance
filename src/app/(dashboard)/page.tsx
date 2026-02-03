"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Plus,
  PieChart as PieChartIcon
} from "lucide-react";
import Link from "next/link";
import { getFinancialReport, FinancialReport } from "@/lib/analytics";
import { pb } from "@/lib/pocketbase";
import { motion } from "framer-motion";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Period = 'today' | 'week' | 'month';

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('month');
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTrx, setRecentTrx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
        // 1. Get Total Balance (Always globally, not affected by period)
        const accounts = await pb.collection("accounts").getFullList();
        const balance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
        setTotalBalance(balance);

        // 2. Get Recent Transactions (Global or Period? Usually global recent is better for Dashboard, but let's stick to global 5)
        const trxs = await pb.collection("transactions").getList(1, 5, {
            sort: '-date',
            expand: 'category_id'
        });
        setRecentTrx(trxs.items);

        // 3. Get Report for selected period
        let start = new Date();
        let end = new Date();
        let label = "";

        const now = new Date();
        if (period === 'today') {
            start = startOfDay(now);
            end = endOfDay(now);
            label = "Today";
        } else if (period === 'week') {
            start = startOfWeek(now, { weekStartsOn: 1 });
            end = endOfWeek(now, { weekStartsOn: 1 });
            label = "This Week";
        } else {
            start = startOfMonth(now);
            end = endOfMonth(now);
            label = "This Month";
        }

        const reportData = await getFinancialReport(start, end, label);
        setReport(reportData);

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

  if (loading && !report) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your family finances.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3">
             <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
                {(['today', 'week', 'month'] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all",
                            period === p ? "bg-primary-50 text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {p}
                    </button>
                ))}
            </div>
            <Link
                href="/transactions/new"
                className="inline-flex items-center justify-center rounded-full bg-primary-600 p-2 text-white shadow-lg hover:bg-primary-700 hover:scale-105 transition-all"
            >
                <Plus className="h-5 w-5" />
            </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Balance (Global) */}
        <motion.div variants={item} className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-24 h-24" />
           </div>
           <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400">Total Balance</p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight">
                {formatCurrency(totalBalance)}
              </h3>
           </div>
        </motion.div>

        {/* Income (Period) */}
        <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-slate-500">Income ({period})</p>
               <h3 className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                + {formatCurrency(report?.totalIncome || 0)}
               </h3>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <ArrowUpRight className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        {/* Expenses (Period) */}
        <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-slate-500">Expense ({period})</p>
               <h3 className="mt-2 text-2xl font-bold tracking-tight text-rose-600">
                - {formatCurrency(report?.totalExpense || 0)}
               </h3>
            </div>
            <div className="rounded-lg bg-rose-50 p-3">
              <ArrowDownRight className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid: Breakdown + Recent Trx */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Breakdown Chart */}
          <motion.div variants={item} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">Expense Breakdown</h3>
                    <PieChartIcon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="h-64 w-full relative">
                    {report?.expenseCategoryStats && report.expenseCategoryStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={report.expenseCategoryStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="total"
                                >
                                    {report.expenseCategoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
                            <div className="bg-slate-100 p-3 rounded-full">
                                <PieChartIcon className="w-6 h-6 text-slate-300" />
                            </div>
                            No expenses {period === 'today' ? 'today' : 'this ' + period}
                        </div>
                    )}
                </div>
                 {/* Mini Legend */}
                 <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {report?.expenseCategoryStats.slice(0, 5).map((cat, idx) => (
                        <div key={cat.id} className="flex items-center justify-between text-xs">
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }}></span>
                                <span className="text-slate-600 truncate max-w-[100px]">{cat.name}</span>
                             </div>
                             <span className="font-medium text-slate-900">{((cat.total / (report?.totalExpense || 1)) * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                 </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={item} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Recent Transactions</h3>
                <Link href="/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View All
                </Link>
            </div>
            <div className="space-y-4">
                {recentTrx.length === 0 && (
                    <p className="text-slate-500 text-sm py-8 text-center">No transactions yet.</p>
                )}
                
                {recentTrx.map((trx) => (
                     <div key={trx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                     <div className="flex items-center gap-4">
                         <div className={cn(
                             "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                             trx.type === 'expense' ? "bg-rose-50 text-rose-600" :
                             trx.type === 'income' ? "bg-emerald-50 text-emerald-600" :
                             "bg-blue-50 text-blue-600"
                         )}>
                             {trx.type === 'expense' && (trx.expand?.category_id?.icon || "💸")}
                             {trx.type === 'income' && "💰"}
                             {trx.type === 'transfer' && "🔁"}
                         </div>
                         <div>
                             <p className="font-medium text-slate-900">
                                 {trx.type === 'expense' ? (trx.expand?.category_id?.name || "Expense") :
                                  trx.type === 'income' ? "Income" : "Transfer"}
                             </p>
                             <p className="text-xs text-slate-500">
                                 {trx.date.split('T')[0]} • {trx.note || "No note"}
                             </p>
                         </div>
                     </div>
                     <div className={cn(
                         "font-semibold whitespace-nowrap",
                         trx.type === 'expense' ? "text-rose-600" :
                         trx.type === 'income' ? "text-emerald-600" :
                         "text-blue-600"
                     )}>
                         {trx.type === 'expense' ? '-' : '+'} {formatCurrency(trx.amount)}
                     </div>
                 </div>
                ))}
            </div>
          </motion.div>
      </div>
    </motion.div>
  );
}

