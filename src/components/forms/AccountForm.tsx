"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";

export default function AccountForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [displayBalance, setDisplayBalance] = useState("");
    
    // Check if user has a family_id (should be in authStore)
    const user = pb.authStore.model;
    
    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-digits
        const rawValue = e.target.value.replace(/\D/g, "");
        if (!rawValue) {
            setDisplayBalance("");
            return;
        }
        // Format with dots
        const formatted = new Intl.NumberFormat("id-ID").format(parseInt(rawValue));
        setDisplayBalance(formatted);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            if (!user?.family_id) throw new Error("No family associated with this user.");

            // Parse formatted balance back to number
            const rawBalance = displayBalance.replace(/\./g, "");
            const balance = rawBalance ? parseFloat(rawBalance) : 0;

            await pb.collection("accounts").create({
                family_id: user.family_id,
                name: formData.get("name"),
                type: formData.get("type"),
                current_balance: balance,
                account_number: formData.get("account_number"), // Optional
            });
            
            router.push("/accounts");
            router.refresh();
        } catch (error) {
            alert("Failed to create account");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            <div>
                <label className="block text-sm font-medium text-slate-700">Account Name</label>
                <input 
                    name="name" 
                    required 
                    placeholder="e.g. BCA Utama"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border ring-1 ring-slate-200"
                />
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-700">Type</label>
                 <select 
                    name="type" 
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border ring-1 ring-slate-200"
                 >
                    <option value="bank">Bank Transfer</option>
                    <option value="ewallet">E-Wallet (GoPay/Ovo)</option>
                    <option value="cash">Cash / Tunai</option>
                 </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Initial Balance</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                        type="text"
                        name="current_balance_display"
                        value={displayBalance}
                        onChange={handleBalanceChange}
                        required
                        className="block w-full rounded-md border-slate-300 pl-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border ring-1 ring-slate-200"
                        placeholder="0"
                    />
                </div>
                {/* Hidden input to ensure logic requiring 'current_balance' field if any generic handlers matched it, 
                    but here we handle it manually in handleSubmit so strictly strictly not needed if we process manually, 
                    but good to have if we revert to FormData get. actually we use manual parse in handleSubmit. */}
            </div>

             <div>
                <label className="block text-sm font-medium text-slate-700">Account Number (Optional)</label>
                <input 
                    name="account_number" 
                    placeholder="xxxx-xxxx-xxxx"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border ring-1 ring-slate-200"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className={cn(
                    "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
                    loading && "opacity-50 cursor-not-allowed"
                )}
            >
                {loading ? "Saving..." : "Create Account"}
            </button>
        </form>
    )
}
