"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const authData = await pb.collection("users").authWithPassword(email, password);
      console.log("Login Success:", authData);
      
      const cookieStr = pb.authStore.exportToCookie({ httpOnly: false, secure: false });
      document.cookie = cookieStr;
      
      window.location.href = "/";
      
    } catch (err: any) {
        console.error("Login Error:", err);
        const msg = err?.response?.message || err?.message || "Invalid email or password";
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Sign in
        </h2>
        <div className="flex justify-center gap-4 mt-4">
             {/* Social Icons Placeholder - matching design */}
             <button type="button" className="border border-slate-200 rounded-full p-2 hover:bg-slate-50 transition">
                <span className="sr-only">Google</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12s5.333 12 11.947 12c3.48 0 6.147-1.147 7.947-3.04 1.827-1.827 2.32-4.48 2.32-6.507 0-.587-.04-1.213-.107-1.533H12.48z" />
                </svg>
             </button>
             {/* Add other icons if needed */}
        </div>
        <p className="mt-4 text-xs text-slate-400">or use your email account</p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border-none bg-slate-100 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-md border-none bg-slate-100 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Password"
            />
          </div>

          <div className="flex items-center justify-between">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-800">Forgot your password?</a>
          </div>

        {error && (
          <div className="text-sm font-medium text-red-500 text-center">
            {error}
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
            {loading ? "Please wait..." : "Sign In"}
          </button>

          <div className="mt-6 text-xs text-slate-500 md:hidden text-center">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
