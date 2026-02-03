"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { getGlobalBudget, GlobalBudget } from "@/lib/budgets";
import { pb } from "@/lib/pocketbase";
import { Pencil, AlertCircle } from "lucide-react";

export default function BudgetPage() {
    const [budget, setBudget] = useState<GlobalBudget | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState("");

    const loadData = async () => {
        setLoading(true);
        const data = await getGlobalBudget();
        setBudget(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveBudget = async () => {
        const amount = parseFloat(editAmount);
        if (isNaN(amount) || amount < 0) return;

        try {
            const user = pb.authStore.model;
            if (!user?.family_id) throw new Error("No family ID found");

            if (budget?.id) {
                 await pb.collection("budgets").update(budget.id, { amount_limit: amount });
            } else {
                 await pb.collection("budgets").create({
                    family_id: user.family_id,
                    amount_limit: amount,
                    period: "monthly"
                });
            }
            
            setIsEditing(false);
            setEditAmount("");
            loadData(); // Refresh

        } catch (e) {
            console.error("Failed to save budget", e);
            alert("Failed to save budget.");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading budget...</div>;

    const isOverBudget = budget && budget.limit > 0 && budget.spent > budget.limit;
    const isNearLimit = budget && budget.limit > 0 && budget.percentage >= 80 && !isOverBudget;

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Monthly Global Budget</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Managing your overall spending limit.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Monthly Spending Limit</h2>
                    
                    {isEditing ? (
                        <div className="flex items-center justify-center gap-2 mt-4">
                             <input 
                                type="number" 
                                className="border rounded-lg px-4 py-2 w-48 text-lg font-bold text-center"
                                placeholder="e.g. 5000000"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                autoFocus
                            />
                            <div className="flex flex-col gap-1">
                                <button 
                                    onClick={handleSaveBudget}
                                    className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="text-slate-400 hover:text-slate-600 px-2 text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                             <span className="text-4xl font-extrabold text-slate-900">
                                {formatCurrency(budget?.limit || 0)}
                             </span>
                             <button 
                                onClick={() => {
                                    setIsEditing(true);
                                    setEditAmount(budget?.limit.toString() || "");
                                }}
                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-full transition"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className={cn("font-medium", isOverBudget ? "text-rose-600" : "text-slate-700")}>
                            {formatCurrency(budget?.spent || 0)} Spent
                        </span>
                        <span className="text-slate-500">
                             {budget?.limit && budget.limit > 0 ? `${budget.percentage.toFixed(0)}%` : "0%"}
                        </span>
                    </div>

                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={cn("h-full rounded-full transition-all duration-500", 
                                isOverBudget ? "bg-rose-500" : 
                                isNearLimit ? "bg-amber-400" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(budget?.percentage || 0, 100)}%` }}
                        />
                    </div>

                    {isOverBudget && (
                        <p className="text-sm font-medium text-rose-600 flex items-center justify-center gap-1 mt-2 bg-rose-50 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            Over budget by {formatCurrency((budget?.spent || 0) - (budget?.limit || 0))}
                        </p>
                    )}
                     {!isOverBudget && budget && budget.limit > 0 && (
                        <p className="text-sm text-emerald-600 text-center mt-2">
                             Safe! You have {formatCurrency(budget.remaining)} remaining.
                        </p>
                    )}
                </div>
            </div>
            
            <div className="text-center text-sm text-slate-400">
                This budget applies to all your expense categories combined.
            </div>
        </div>
    );
}
