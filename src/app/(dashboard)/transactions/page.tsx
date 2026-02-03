"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pb } from "@/lib/pocketbase";
import { cn, formatCurrency } from "@/lib/utils";
import { Plus, Search, Calendar, Filter } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

type Transaction = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  date: string;
  note: string;
  expand: {
    category_id?: { name: string; icon: string; color: string };
    source_account_id?: { name: string };
    destination_account_id?: { name: string };
  };
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if(pb.authStore.isValid){
             const records = await pb.collection("transactions").getFullList<Transaction>({
                sort: "-date",
                expand: "category_id,source_account_id,destination_account_id",
            });
            setTransactions(records);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Group by Date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    if (!transaction.date) return groups;
    
    try {
        const date = transaction.date.split('T')[0];
        if (!groups[date]) {
        groups[date] = [];
        }
        groups[date].push(transaction);
    } catch (e) {
        console.warn("Invalid date for transaction", transaction);
    }
    return groups;
  }, {} as Record<string, Transaction[]>);

  if (loading) return <div className="p-4">Loading transactions...</div>;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                <p className="mt-1 text-sm text-slate-500">History of your financial moves.</p>
            </div>
            <Link
                href="/transactions/new"
                className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Link>
       </div>

       {/* List */}
       <div className="space-y-8">
            {Object.keys(groupedTransactions).length === 0 && (
                 <div className="text-center py-10">
                    <p className="text-slate-500">No transactions recorded yet.</p>
                 </div>
            )}

            {Object.entries(groupedTransactions).map(([date, items]) => {
                let dateLabel = date;
                try {
                    const d = new Date(date);
                    if (isNaN(d.getTime())) throw new Error("Invalid date");
                    dateLabel = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "EEEE, dd MMM yyyy");
                } catch {
                    dateLabel = "Unknown Date";
                }

                return (
                <div key={date}>
                    <h3 className="text-sm font-medium text-slate-500 mb-3 ml-1">
                        {dateLabel}
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
                        {items.map((trx) => (
                            <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                                        trx.type === 'expense' ? "bg-rose-50 text-rose-600" :
                                        trx.type === 'income' ? "bg-emerald-50 text-emerald-600" :
                                        "bg-blue-50 text-blue-600"
                                    )}>
                                        {trx.type === 'expense' && (trx.expand.category_id?.icon || "💸")}
                                        {trx.type === 'income' && "💰"}
                                        {trx.type === 'transfer' && "🔁"}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {trx.type === 'expense' ? (trx.expand.category_id?.name || "Expense") :
                                             trx.type === 'income' ? "Income" : "Transfer"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {trx.type === 'transfer' 
                                                ? `${trx.expand.source_account_id?.name} -> ${trx.expand.destination_account_id?.name}`
                                                : trx.note || (trx.type === 'expense' ? trx.expand.source_account_id?.name : trx.expand.destination_account_id?.name)
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "font-semibold text-right whitespace-nowrap",
                                    trx.type === 'expense' ? "text-rose-600" :
                                    trx.type === 'income' ? "text-emerald-600" :
                                    "text-blue-600"
                                )}>
                                    {trx.type === 'expense' ? '-' : '+'} {formatCurrency(trx.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );})}
       </div>
    </div>
          )}
