"use client";

import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";


export default function SeedPage() {
    const [status, setStatus] = useState("Ready");
    const [loading, setLoading] = useState(false);

    const seedUsers = async () => {
        setLoading(true);
        setStatus("Starting...");
        try {
            // 1. Create User Admin first (to get ID) - Standard Registration Flow
            // Note: In a real scenario, we create Family first if we are fully authed, 
            // but for public registration, we usually create User -> Login -> Create Family -> Update User.
            // Let's try the direct approach assuming public create access on logic.
            
            // Create Admin
            setStatus("Creating Admin User...");
            const adminEmail = "admin@test.com";
            const password = "password123";

            try {
                await pb.collection("users").create({
                    email: adminEmail,
                    password: password,
                    passwordConfirm: password,
                    name: "Bapak Admin",
                    role: "admin"
                });
            } catch (e: any) {
                if (e.status !== 400) throw e; // Ignore if already exists
                setStatus("Admin user might already exist, proceeding...");
            }

            // Authenticate as Admin to create Family
            setStatus("Authenticating as Admin...");
            const authData = await pb.collection("users").authWithPassword(adminEmail, password);
            const userAdmin = authData.record;

            // Create Family
            setStatus("Creating Family 'Keluarga Cemara'...");
            const family = await pb.collection("families").create({
                name: "Keluarga Cemara"
            });

            // Update Admin with Family
            setStatus("Linking Admin to Family...");
            await pb.collection("users").update(userAdmin.id, {
                family_id: family.id
            });

            // Create Member (Now that we are Authed as Admin, strictly speaking creating another user might log us out if we use same client? 
            // No, creating user is just an API call. But usually `users` create is Public type.
            setStatus("Creating Member User...");
            const memberEmail = "member@test.com";
            
            // We create the member directly linked to the family since we are Admin of that family (depending on API rules)
            // But since `users` create is public, we can just create it.
            // However, linking `family_id` immediately might be blocked if Create Rule doesn't allow setting family_id?
            // My schema `createRule` for users is `""` (Public). 
            // So anyone can create user. But can anyone set `family_id`? 
            // Default PB logic: Field rules? 
            // Let's assume we can.
            
            await pb.collection("users").create({
                email: memberEmail,
                password: password,
                passwordConfirm: password,
                name: "Anak Member",
                role: "member",
                family_id: family.id 
            });

            // 4. Create Default Categories
            setStatus("Creating Categories...");
            const categoriesData = [
                { name: "Salary", type: "income", icon: "💰", color: "green" },
                { name: "Food", type: "expense", icon: "🍔", color: "orange" },
                { name: "Transport", type: "expense", icon: "🚌", color: "blue" },
                { name: "Shopping", type: "expense", icon: "🛍️", color: "purple" }
            ];

            const createdCategories: any[] = [];
            for (const cat of categoriesData) {
                try {
                    const res = await pb.collection("categories").create({
                        ...cat,
                        family_id: family.id
                    });
                    createdCategories.push(res);
                } catch (e) {
                     console.log("Category might exist", e);
                     // Try to fetch if exists to link transactions
                     const existing = await pb.collection("categories").getFirstListItem(`name="${cat.name}"`);
                     createdCategories.push(existing);
                }
            }

            // 5. Create Default Account (if not exists)
            setStatus("Creating Bank Account...");
            // Check if BCA exists, if not create
            let bankAccount;
            try {
                const existing = await pb.collection("accounts").getFirstListItem(`name="BCA"`);
                bankAccount = existing;
            } catch {
                bankAccount = await pb.collection("accounts").create({
                    name: "BCA",
                    type: "bank",
                    current_balance: 5000000,
                    account_number: "1234567890",
                    family_id: family.id
                });
            }

            // 6. Create Dummy Transactions
            setStatus("Seeding Transactions...");
            const today = new Date();
            
            // Salary Income
            await pb.collection("transactions").create({
                family_id: family.id,
                user_id: userAdmin.id,
                type: "income",
                amount: 10000000,
                date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
                note: "Monthly Salary",
                category_id: createdCategories.find(c => c.name === "Salary")?.id,
                destination_account_id: bankAccount.id
            });

            // Some Expenses
            await pb.collection("transactions").create({
                family_id: family.id,
                user_id: userAdmin.id,
                type: "expense",
                amount: 50000,
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString(),
                note: "Lunch at McD",
                category_id: createdCategories.find(c => c.name === "Food")?.id,
                source_account_id: bankAccount.id
            });

            await pb.collection("transactions").create({
                family_id: family.id,
                user_id: userAdmin.id,
                type: "expense",
                amount: 150000,
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString(),
                note: "Grab to Office",
                category_id: createdCategories.find(c => c.name === "Transport")?.id,
                source_account_id: bankAccount.id
            });
            
            setStatus("✅ Success! Data Populated.");
            alert("Seeding Complete! Login now to see data.");
            
        } catch (e: any) {
            console.error(e);
            setStatus("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 space-y-4">
            <h1 className="text-2xl font-bold">Test Data Seeder</h1>
            <p className="text-slate-500 max-w-md text-center">
                This tool will create a "Keluarga Cemara", an Admin account, and a Member account.
            </p>
            
            <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm">
                <p>Admin: admin@test.com</p>
                <p>Member: member@test.com</p>
                <p>Pass: password123</p>
            </div>

            <button
                onClick={seedUsers}
                disabled={loading}
                className={cn(
                    "px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition",
                    loading && "opacity-50 cursor-wait"
                )}
            >
                {loading ? "Seeding..." : "Generate Test Accounts"}
            </button>

            
            <p className="text-sm font-medium text-slate-700">{status}</p>
        </div>
    )
}
