"use client";

import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { Plus, Trash2, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type UserProfile = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "member";
    avatar?: string;
};

export default function UserManagement() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    // Form
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<"admin" | "member">("member");

    useEffect(() => {
        loadUsers();
        if (pb.authStore.model) {
            setCurrentUser(pb.authStore.model as unknown as UserProfile);
        }
    }, []);

    const loadUsers = async () => {
        try {
            const records = await pb.collection("users").getFullList();
            setUsers(records as unknown as UserProfile[]);
        } catch (e: any) {
            console.error("Load users failed:", e);
            console.error("Status:", e.status);
            console.error("Response:", e.response);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const current = pb.authStore.model;
            if (!current?.family_id) {
                alert("You must be part of a family to add members.");
                return;
            }

            await pb.collection("users").create({
                email,
                password,
                passwordConfirm: password,
                name,
                role,
                family_id: current.family_id,
                emailVisibility: true,
            });

            alert("User created successfully!");
            setShowForm(false);
            setEmail("");
            setPassword("");
            setName("");
            loadUsers();
        } catch (e: any) {
            console.error(e);
            alert("Failed to create user: " + (e.message || JSON.stringify(e)));
        }
    };

    const handleUpdateRole = async (id: string, newRole: "admin" | "member") => {
        try {
            await pb.collection("users").update(id, { role: newRole });
            loadUsers();
        } catch (e) {
            alert("Failed to update role");
        }
    };

    if (loading) return <div>Loading users...</div>;

    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-medium text-slate-900">Family Members</h2>
                    <p className="text-sm text-slate-500">Manage access and roles.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Full Name"
                            value={name} onChange={e => setName(e.target.value)}
                            className="rounded-md border-slate-300 px-3 py-2"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="rounded-md border-slate-300 px-3 py-2"
                            required
                        />
                         <input
                            type="password"
                            placeholder="Password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="rounded-md border-slate-300 px-3 py-2"
                            required
                        />
                        <select
                            value={role} onChange={e => setRole(e.target.value as any)}
                            className="rounded-md border-slate-300 px-3 py-2"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 text-slate-500">Cancel</button>
                        <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded-md">Create User</button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{user.name || user.email}</p>
                                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                        
                        {isAdmin && user.id !== currentUser?.id && (
                            <select
                                value={user.role}
                                onChange={(e) => handleUpdateRole(user.id, e.target.value as "admin" | "member")}
                                className="text-sm border-slate-200 rounded-md py-1 px-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        )}
                        
                         {!isAdmin && (
                            <span className="text-sm text-slate-400 capitalize bg-white px-2 py-1 rounded border border-slate-200">
                                {user.role}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
