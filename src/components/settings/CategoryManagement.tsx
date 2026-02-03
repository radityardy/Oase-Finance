"use client";

import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { Plus, Trash2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
};

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Form
    const [name, setName] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [icon, setIcon] = useState("📦");
    const [color, setColor] = useState("#94a3b8");

    useEffect(() => {
        loadCategories();
        setCurrentUser(pb.authStore.model);
    }, []);

    const loadCategories = async () => {
        try {
            const records = await pb.collection("categories").getFullList({
                sort: "name",
            });
            setCategories(records as unknown as Category[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const current = pb.authStore.model;
            if (!current?.family_id) return;

            await pb.collection("categories").create({
                name,
                type,
                icon,
                color,
                family_id: current.family_id,
            });

            setShowForm(false);
            setName("");
            setIcon("📦");
            loadCategories();
        } catch (e) {
            alert("Failed to create category");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category?")) return;
        try {
            await pb.collection("categories").delete(id);
            loadCategories();
        } catch (e) {
            alert("Failed to delete category");
        }
    };

    const isAdmin = currentUser?.role === 'admin';

    if (loading) return <div>Loading categories...</div>;

    const incomeCats = categories.filter(c => c.type === "income");
    const expenseCats = categories.filter(c => c.type === "expense");

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-medium text-slate-900">Categories</h2>
                    <p className="text-sm text-slate-500">Customize income & expense categories.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreateCategory} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Category Name"
                            value={name} onChange={e => setName(e.target.value)}
                            className="rounded-md border-slate-300 px-3 py-2"
                            required
                        />
                        <select
                            value={type} onChange={e => setType(e.target.value as any)}
                            className="rounded-md border-slate-300 px-3 py-2"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                        <div className="flex gap-2">
                             <input
                                placeholder="Icon (emoji)"
                                value={icon} onChange={e => setIcon(e.target.value)}
                                className="rounded-md border-slate-300 px-3 py-2 w-20 text-center"
                                maxLength={2}
                            />
                             <input
                                type="color"
                                value={color} onChange={e => setColor(e.target.value)}
                                className="rounded-md border-slate-300 h-10 w-full cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 text-slate-500">Cancel</button>
                        <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded-md">Save</button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {/* Income */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Income</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {incomeCats.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md border border-transparent hover:border-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl" style={{color: cat.color}}>{cat.icon}</span>
                                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                </div>
                                {isAdmin && (
                                    <button onClick={() => handleDelete(cat.id)} className="text-slate-300 hover:text-rose-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expense */}
                <div>
                     <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expense</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {expenseCats.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md border border-transparent hover:border-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl" style={{color: cat.color}}>{cat.icon}</span>
                                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                </div>
                                {isAdmin && (
                                    <button onClick={() => handleDelete(cat.id)} className="text-slate-300 hover:text-rose-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
