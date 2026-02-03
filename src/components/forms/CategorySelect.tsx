"use client";

import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
};

interface CategorySelectProps {
  type: "income" | "expense";
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function CategorySelect({ type, value, onChange, error }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if(pb.authStore.isValid) {
            const records = await pb.collection("categories").getFullList<Category>({
                filter: `type = "${type}"`, // Fixed string interpolation for PB filter
                sort: "name",
            });
            setCategories(records);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  return (
    <div>
        <label className="block text-sm font-medium text-slate-700">Category</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
            className={cn(
                "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border ring-1 ring-slate-200 bg-white",
                error && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
        >
            <option value="">Select a category</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                    {cat.name}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        
        {/* Simple Seeder Trigger if empty */}
        {!loading && categories.length === 0 && (
            <p className="text-xs text-slate-400 mt-2">
                No categories found. Go to Settings to add them.
            </p>
        )}
    </div>
  );
}
