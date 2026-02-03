"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { getFinancialReport, FinancialReport } from "@/lib/analytics";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, Calendar as CalendarIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, addWeeks, addMonths, addYears, format } from "date-fns";

type RangeType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function AnalyticsPage() {
    const [rangeType, setRangeType] = useState<RangeType>('monthly');
    const [referenceDate, setReferenceDate] = useState(new Date());
    
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(true);

    // Calculate start/end based on referenceDate and rangeType
    const getDateRange = () => {
        let start = new Date();
        let end = new Date();

        switch (rangeType) {
            case 'daily':
                start = startOfDay(referenceDate);
                end = endOfDay(referenceDate);
                break;
            case 'weekly':
                start = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday start
                end = endOfWeek(referenceDate, { weekStartsOn: 1 });
                break;
            case 'monthly':
                start = startOfMonth(referenceDate);
                end = endOfMonth(referenceDate);
                break;
            case 'yearly':
                start = startOfYear(referenceDate);
                end = endOfYear(referenceDate);
                break;
        }
        return { start, end };
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const { start, end } = getDateRange();
            
            // Format Label
            let label = "";
            if (rangeType === 'daily') label = format(start, "eeee, dd MMM yyyy");
            else if (rangeType === 'weekly') label = `${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
            else if (rangeType === 'monthly') label = format(start, "MMMM yyyy");
            else if (rangeType === 'yearly') label = format(start, "yyyy");

            const data = await getFinancialReport(start, end, label);
            setReport(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [referenceDate, rangeType]);

    const navigate = (dir: number) => {
        const newDate = new Date(referenceDate);
        switch (rangeType) {
            case 'daily': newDate.setDate(newDate.getDate() + dir); break;
            case 'weekly': newDate.setDate(newDate.getDate() + (dir * 7)); break;
            case 'monthly': newDate.setMonth(newDate.getMonth() + dir); break;
            case 'yearly': newDate.setFullYear(newDate.getFullYear() + dir); break;
        }
        setReferenceDate(newDate);
    };

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    return (
        <div className="space-y-8">
            {/* Header controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as RangeType[]).map((t) => (
                         <button
                            key={t}
                            onClick={() => { setRangeType(t); setReferenceDate(new Date()); }}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all",
                                rangeType === t ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-white rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="text-center min-w-[180px]">
                        <span className="text-sm font-bold text-slate-900 block">
                            {report?.label || "Loading..."}
                        </span>
                    </div>
                    <button onClick={() => navigate(1)} className="p-1 hover:bg-white rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {loading && !report ? (
                 <div className="p-12 text-center text-slate-500">Loading Report...</div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-emerald-800">Income</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(report?.totalIncome || 0)}</p>
                        </div>
                        
                        <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg text-rose-600 shadow-sm">
                                    <TrendingDown className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-rose-800">Expense</span>
                            </div>
                            <p className="text-2xl font-bold text-rose-700">{formatCurrency(report?.totalExpense || 0)}</p>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                                    <PiggyBank className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-blue-800">Net Savings</span>
                            </div>
                            <p className={cn("text-2xl font-bold", (report?.netSavings || 0) >= 0 ? "text-blue-700" : "text-rose-600")}>
                                {formatCurrency(report?.netSavings || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Activity Trend</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={report?.dailyStats}>
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(val) => {
                                            // Smart formatting based on range
                                            if (rangeType === 'yearly') return val.split('-')[1]; // Month
                                            if (rangeType === 'daily') return ''; // Too crowded
                                            const d = val.split('-')[2];
                                            return parseInt(d) % 2 === 0 ? d : '';
                                        }}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                        labelFormatter={(label) => new Date(label).toDateString()}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} stackId="a" />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full mr-2"></span>
                                Income Breakdown
                            </h3>
                            <div className="h-64 w-full relative">
                                {report?.incomeCategoryStats && report.incomeCategoryStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={report.incomeCategoryStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="total"
                                            >
                                                {report.incomeCategoryStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">No income data</div>
                                )}
                            </div>
                        </div>

                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <span className="w-2 h-6 bg-rose-500 rounded-full mr-2"></span>
                                Expense Breakdown
                            </h3>
                            <div className="h-64 w-full relative">
                                {report?.expenseCategoryStats && report.expenseCategoryStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={report.expenseCategoryStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="total"
                                            >
                                                {report.expenseCategoryStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">No expense data</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Expenses List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Top Expenses</h3>
                        <div className="space-y-4">
                            {report?.expenseCategoryStats.map((cat, index) => (
                                <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                     <div className="flex items-center gap-4">
                                        <span className="text-slate-400 font-bold w-6">#{index + 1}</span>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                                            {cat.icon || "📦"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{cat.name}</p>
                                            <p className="text-xs text-slate-500">{cat.percentage.toFixed(1)}% of total</p>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                        <p className="font-bold text-slate-900">{formatCurrency(cat.total)}</p>
                                        <div className="w-24 bg-slate-100 h-1 rounded-full mt-1 ml-auto">
                                            <div 
                                                className="h-full bg-rose-500 rounded-full"
                                                style={{ width: `${cat.percentage}%` }}
                                            />
                                        </div>
                                     </div>
                                </div>
                            ))}
                            {report?.expenseCategoryStats.length === 0 && (
                                 <div className="text-center text-slate-500 py-4">No expenses recorded this period.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

