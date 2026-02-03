"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pb } from "@/lib/pocketbase";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Building, Wallet, Banknote } from "lucide-react";

type Account = {
    id: string;
    name: string;
    type: "bank" | "ewallet" | "cash";
    current_balance: number;
    account_number?: string;
};

const iconMap = {
    bank: Building,
    ewallet: Wallet,
    cash: Banknote
};

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch accounts
        const fetchAccounts = async () => {
            try {
                if(pb.authStore.isValid){
                     const records = await pb.collection("accounts").getFullList<Account>({
                        sort: '-current_balance',
                    });
                    setAccounts(records);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    if (loading) return <div className="p-4">Loading accounts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your asset sources.</p>
                </div>
                <Link
                    href="/accounts/new"
                    className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Account
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.length === 0 && (
                     <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500">No accounts found. Create one to get started.</p>
                    </div>
                )}
                {accounts.map((account) => {
                    const Icon = iconMap[account.type] || Wallet;
                    return (
                        <div key={account.id} className="relative flex flex-col overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md">
                            <div className="flex items-center gap-x-4">
                                <div className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-lg",
                                    account.type === 'bank' && "bg-blue-50 text-blue-600",
                                    account.type === 'ewallet' && "bg-purple-50 text-purple-600",
                                    account.type === 'cash' && "bg-emerald-50 text-emerald-600",
                                )}>
                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold leading-7 text-slate-900">
                                        {account.name}
                                    </h3>
                                    <p className="capitalize text-xs leading-6 text-slate-500">{account.type}</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <p className="text-sm font-medium text-slate-500">Balance</p>
                                <p className="text-2xl font-bold tracking-tight text-slate-900">
                                    {formatCurrency(account.current_balance)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
