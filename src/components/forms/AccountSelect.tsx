"use client";

import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { cn, formatCurrency } from "@/lib/utils";

type Account = {
  id: string;
  name: string;
  current_balance: number;
  type: string;
};

interface AccountSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  excludeId?: string; // For transfers, exclude source
  error?: string;
}

export default function AccountSelect({ label, value, onChange, excludeId, error }: AccountSelectProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
         if(pb.authStore.isValid){
             const records = await pb.collection("accounts").getFullList<Account>({
                sort: "-current_balance",
             });
             setAccounts(records);
         }
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const filteredAccounts = excludeId 
    ? accounts.filter(a => a.id !== excludeId)
    : accounts;

  return (
    <div>
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
            className={cn(
                "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border ring-1 ring-slate-200 bg-white",
                 error && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
        >
            <option value="">Select account</option>
            {filteredAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.current_balance)})
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
