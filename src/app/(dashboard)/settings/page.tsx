"use client";

import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import UserManagement from "@/components/settings/UserManagement";
import CategoryManagement from "@/components/settings/CategoryManagement";

const DEFAULT_CATEGORIES = [
    { name: "Makan & Minum", type: "expense", icon: "🍔", color: "#f87171" },
    { name: "Transportasi", type: "expense", icon: "🚗", color: "#60a5fa" },
    { name: "Belanja Rutin", type: "expense", icon: "🛒", color: "#a5b4fc" },
    { name: "Tagihan & Utilitas", type: "expense", icon: "💡", color: "#fbbf24" },
    { name: "Hiburan", type: "expense", icon: "🎬", color: "#e879f9" },
    { name: "Kesehatan", type: "expense", icon: "💊", color: "#34d399" },
    { name: "Pendidikan", type: "expense", icon: "🎓", color: "#818cf8" },
    { name: "Lainnya", type: "expense", icon: "📦", color: "#94a3b8" },
    { name: "Gaji", type: "income", icon: "💵", color: "#10b981" },
    { name: "Bonus", type: "income", icon: "🎁", color: "#fcd34d" },
];

export default function SettingsPage() {
    const [seeding, setSeeding] = useState(false);
    
    const handleSeedCategories = async () => {
        if (!confirm("Add default categories?")) return;
        setSeeding(true);
        try {
            const user = pb.authStore.model;
            for (const cat of DEFAULT_CATEGORIES) {
                await pb.collection("categories").create({
                    ...cat,
                    family_id: user?.family_id
                });
            }
            alert("Categories added!");
            // Reload page to reflect changes
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Failed to seed categories");
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your family preferences.</p>
            </div>

            <UserManagement />
            
            <CategoryManagement />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Quick Start</h2>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                        <h3 className="font-medium text-slate-900">Default Categories</h3>
                        <p className="text-sm text-slate-500">Populate your app with standard expense categories.</p>
                    </div>
                    <button
                        onClick={handleSeedCategories}
                        disabled={seeding}
                        className={cn(
                            "px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm",
                            seeding && "opacity-50"
                        )}
                    >
                        {seeding ? "Importing..." : "Import Defaults"}
                    </button>
                </div>
            </div>
        </div>
    )
}

