"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import AccountSelect from "./AccountSelect";
import CategorySelect from "./CategorySelect";
import { CalendarIcon, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";

type TransactionType = "income" | "expense" | "transfer";

export default function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>("expense"); // Default to expense (most common)

  // Fields
  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [displayAmount, setDisplayAmount] = useState("");

  // Initialize display amount if amount exists (e.g. from URL or edit)
  useState(() => {
      if (searchParams.get("amount")) {
          const initial = searchParams.get("amount") || "";
          setDisplayAmount(new Intl.NumberFormat("id-ID").format(parseInt(initial)));
      }
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      if (!rawValue) {
          setDisplayAmount("");
          setAmount("");
          return;
      }
      const val = parseInt(rawValue);
      setAmount(val.toString());
      setDisplayAmount(new Intl.NumberFormat("id-ID").format(val));
  };
  const [date, setDate] = useState(searchParams.get("date") || new Date().toISOString().split('T')[0]); 
  const [note, setNote] = useState(searchParams.get("note") || "");
  
  // Expense Specific
  const [categoryId, setCategoryId] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [beneficiary, setBeneficiary] = useState("Common"); // Default: Common
  const [importance, setImportance] = useState("need"); // Default: Need

  // Income Specific
  const [destinationAccountId, setDestinationAccountId] = useState("");
  
  // Transfer Specific
  // Uses sourceAccountId and destinationAccountId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const user = pb.authStore.model;
        if (!user?.family_id) throw new Error("No family found");

        const data: any = {
            family_id: user.family_id,
            user_id: user.id,
            type,
            amount: parseFloat(amount),
            date: new Date(date).toISOString(),
            note,
        };

        if (type === "expense") {
            data.source_account_id = sourceAccountId;
            data.category_id = categoryId;
            data.beneficiary = beneficiary;
            data.importance_level = importance;

            // Logic: Decrease Source Balance
            const account = await pb.collection("accounts").getOne(sourceAccountId);
            await pb.collection("accounts").update(sourceAccountId, {
                current_balance: account.current_balance - parseFloat(amount)
            });
        } 
        else if (type === "income") {
            data.destination_account_id = destinationAccountId;
            
            // Logic: Increase Dest Balance
            const account = await pb.collection("accounts").getOne(destinationAccountId);
            await pb.collection("accounts").update(destinationAccountId, {
                current_balance: account.current_balance + parseFloat(amount)
            });
        }
        else if (type === "transfer") {
            data.source_account_id = sourceAccountId;
            data.destination_account_id = destinationAccountId;

             // Logic: Move money
             const src = await pb.collection("accounts").getOne(sourceAccountId);
             await pb.collection("accounts").update(sourceAccountId, {
                 current_balance: src.current_balance - parseFloat(amount)
             });

             const dst = await pb.collection("accounts").getOne(destinationAccountId);
             await pb.collection("accounts").update(destinationAccountId, {
                 current_balance: dst.current_balance + parseFloat(amount)
             });
        }

        await pb.collection("transactions").create(data);
        router.push("/transactions");
        router.refresh();

    } catch (e) {
        alert("Failed to save transaction");
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        
        {/* Type Toggle */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
                type="button"
                onClick={() => setType("expense")}
                className={cn(
                    "flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all",
                    type === "expense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
            >
                <TrendingDown className="w-4 h-4 mr-1.5" />
                Expense
            </button>
            <button
                type="button"
                onClick={() => setType("income")}
                className={cn(
                    "flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all",
                    type === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
            >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Income
            </button>
            <button
                type="button"
                onClick={() => setType("transfer")}
                className={cn(
                    "flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all",
                    type === "transfer" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
            >
                <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                Transfer
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Amount */}
            <div>
                <label className="block text-sm font-medium text-slate-700">Amount</label>
                <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 font-semibold">Rp</span>
                    </div>
                    <input
                        type="text"
                        required
                        value={displayAmount}
                        onChange={handleAmountChange}
                        className="block w-full rounded-md border-slate-300 pl-10 py-3 text-lg font-semibold text-slate-900 border ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Date */}
            <div>
                 <label className="block text-sm font-medium text-slate-700">Date</label>
                 <div className="relative mt-1">
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                         className="block w-full rounded-md border-slate-300 py-2 px-3 border ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500"
                    />
                 </div>
            </div>

            {/* EXPENSE FIELDS */}
            {type === "expense" && (
                <>
                    <AccountSelect 
                        label="Paid From" 
                        value={sourceAccountId} 
                        onChange={setSourceAccountId} 
                    />
                    
                    <CategorySelect 
                        type="expense"
                        value={categoryId} 
                        onChange={setCategoryId}
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700">For Whom?</label>
                        <div className="mt-1 flex gap-2">
                             {['Raditya', 'She/He', 'Common'].map((who) => (
                                 <button
                                    key={who}
                                    type="button"
                                    onClick={() => setBeneficiary(who)}
                                    className={cn(
                                        "flex-1 py-2 text-sm border rounded-md transition-colors",
                                        beneficiary === who 
                                            ? "bg-primary-50 border-primary-500 text-primary-700" 
                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                 >
                                     {who}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-slate-700">Importance</label>
                         <select
                            value={importance}
                            onChange={(e) => setImportance(e.target.value)}
                             className="mt-1 block w-full rounded-md border-slate-300 py-2 px-3 border ring-1 ring-slate-200"
                         >
                             <option value="need">Need (Important)</option>
                             <option value="want">Want (Not Critical)</option>
                             <option value="general">General (Fixed Cost)</option>
                         </select>
                    </div>
                </>
            )}

            {/* INCOME FIELDS */}
            {type === "income" && (
                 <>
                    <AccountSelect 
                        label="Deposit To" 
                        value={destinationAccountId} 
                        onChange={setDestinationAccountId} 
                    />
                    <CategorySelect 
                        type="income"
                        value={categoryId} 
                        onChange={setCategoryId}
                    />
                 </>
            )}

            {/* TRANSFER FIELDS */}
            {type === "transfer" && (
                 <div className="grid grid-cols-2 gap-4">
                     <AccountSelect 
                         label="From Account" 
                         value={sourceAccountId} 
                         onChange={setSourceAccountId} 
                     />
                     <AccountSelect 
                         label="To Account" 
                         value={destinationAccountId} 
                         onChange={setDestinationAccountId}
                         excludeId={sourceAccountId}
                     />
                 </div>
            )}

            {/* Note */}
            <div>
                 <label className="block text-sm font-medium text-slate-700">Note (Optional)</label>
                 <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                     className="mt-1 block w-full rounded-md border-slate-300 py-2 px-3 border ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500"
                 />
            </div>

            <button
                type="submit"
                disabled={loading}
                 className={cn(
                    "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                    type === 'expense' ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500" :
                    type === 'income' ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500" :
                    "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                    loading && "opacity-50 cursor-not-allowed"
                )}
            >
                {loading ? "Saving..." : "Save Transaction"}
            </button>
        </form>
    </div>
  );
}
