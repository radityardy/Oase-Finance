"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { getReminders, createReminder, deleteReminder, Reminder } from "@/lib/reminders";
import { Plus, Trash2, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import { format, isPast, parseISO } from "date-fns";

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [displayAmount, setDisplayAmount] = useState("");

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
    const [dueDate, setDueDate] = useState("");
    const [frequency, setFrequency] = useState("1");
    const [unit, setUnit] = useState("months");

    const loadData = async () => {
        setLoading(true);
        const data = await getReminders();
        setReminders(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !dueDate) return;

        try {
            await createReminder({
                title,
                amount: parseFloat(amount),
                next_due_date: new Date(dueDate).toISOString(),
                frequency: parseInt(frequency),
                unit: unit as any
            });
            setShowForm(false);
            setTitle("");
            setAmount("");
            setDisplayAmount("");
            setDueDate("");
            setFrequency("1");
            setUnit("months");
            loadData();
        } catch (e) {
            alert("Failed to create reminder");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this reminder?")) return;
        await deleteReminder(id);
        loadData();
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading reminders...</div>;

    const formatInterval = (freq: number, u: string) => {
        if (freq === 1) return `Every ${u.slice(0, -1)}`; // Every month
        return `Every ${freq} ${u}`; // Every 3 days
    };

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reminders (Jatah)</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Track monthly bills and routine allocations.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            placeholder="Title (e.g. Listrik)" 
                            className="rounded-md border-slate-300 px-3 py-2"
                            value={title} onChange={e => setTitle(e.target.value)} required
                        />
                         <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500 text-sm">Rp</span>
                             <input 
                                type="text"
                                placeholder="Amount" 
                                className="rounded-md border-slate-300 pl-8 pr-3 py-2 w-full"
                                value={displayAmount} onChange={handleAmountChange} required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Every</span>
                            <input 
                                type="number"
                                min="1"
                                className="w-16 rounded-md border-slate-300 px-3 py-2"
                                value={frequency} onChange={e => setFrequency(e.target.value)} required
                            />
                             <select 
                                className="rounded-md border-slate-300 px-3 py-2 flex-1"
                                value={unit} onChange={e => setUnit(e.target.value)}
                            >
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                                <option value="years">Years</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <input 
                                type="date"
                                className="w-full rounded-md border-slate-300 px-3 py-2"
                                value={dueDate} onChange={e => setDueDate(e.target.value)} required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                         <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 text-slate-500">Cancel</button>
                         <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded-md">Save</button>
                    </div>
                </form>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reminders.map((item) => {
                    const isOverdue = isPast(parseISO(item.next_due_date)) && item.is_active;
                    
                    return (
                        <div key={item.id} className={cn(
                            "bg-white rounded-xl p-5 shadow-sm border transaction-all hover:shadow-md",
                            isOverdue ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
                        )}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        {formatInterval(item.frequency, item.unit)}
                                    </p>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-rose-500 mt-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                            <p className="text-2xl font-bold text-primary-600 mt-1">{formatCurrency(item.amount)}</p>
                            
                            <div className="mt-4 flex items-center justify-between">
                                <span className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-full",
                                    isOverdue ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                                )}>
                                    Due: {format(parseISO(item.next_due_date), "dd MMM yyyy")}
                                </span>
                                
                                <Link 
                                    href={`/transactions/new?amount=${item.amount}&note=${encodeURIComponent(item.title)}&date=${item.next_due_date.split('T')[0]}`}
                                    className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                    <CreditCard className="w-4 h-4 mr-1" />
                                    Pay Now
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {reminders.length === 0 && !showForm && (
                     <div className="col-span-full text-center py-10 text-slate-500">
                        No reminders set. Click "Add New" to start.
                     </div>
                )}
            </div>
        </div>
    );
}
