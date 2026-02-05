"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    const familyName = formData.get("familyName") as string;
    const name = formData.get("name") as string;

    if (password !== passwordConfirm) {
        setError("Passwords do not match");
        setLoading(false);
        return;
    }

    try {
      const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm,
        name,
        role: "admin"
      });

      await pb.collection("users").authWithPassword(email, password);

      const family = await pb.collection("families").create({
        name: familyName,
      });

      await pb.collection("users").update(user.id, {
        family_id: family.id
      });
      
      router.push("/");
      router.refresh();
    } catch (err: any) {
        console.error("Register Error:", err);
        const data = err.data?.data || {};
        const msg = Object.entries(data).map(([key, val]: any) => `${key}: ${val.message}`).join(", ");
        setError(msg || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Create Account
          </h2>
          <div className="flex justify-center gap-4 mt-4">
               {/* Social Icons Placeholder */}
               <button type="button" className="border border-slate-200 rounded-full p-2 hover:bg-slate-50 transition">
                  <span className="sr-only">Google</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12s5.333 12 11.947 12c3.48 0 6.147-1.147 7.947-3.04 1.827-1.827 2.32-4.48 2.32-6.507 0-.587-.04-1.213-.107-1.533H12.48z" />
                  </svg>
               </button>
          </div>
          <p className="mt-4 text-xs text-slate-400">or use your email for registration</p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
            <div>
                <input
                  id="familyName"
                  name="familyName"
                  type="text"
                  required
                  className="w-full rounded-md border-none bg-slate-100 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Family Name"
                />
            </div>

            <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-md border-none bg-slate-100 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your Name"
                />
            </div>

            <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border-none bg-slate-100 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Email"
                />
            </div>

             <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-md border-none bg-slate-100 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Password"
                />
            </div>

             <div>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-md border-none bg-slate-100 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Confirm Password"
                />
            </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
                  <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-full bg-primary-600 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white transition-transform active:scale-95 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>
    </div>
  );
}
