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
      
      // Explicitly set cookie (secure: false for localhost is CRITICAL)
      const cookieStr = pb.authStore.exportToCookie({ httpOnly: false, secure: false });
      console.log("Setting Cookie:", cookieStr);
      document.cookie = cookieStr;
      
      // Force full reload to ensure middleware sees the cookie
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your Oase account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                name="email"
                type="email"
                required
                className={cn(
                  "relative block w-full rounded-t-md border-0 py-3 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6",
                  "bg-white"
                )}
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className={cn(
                    "relative block w-full rounded-b-md border-0 py-3 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6",
                    "bg-white"
                  )}
                placeholder="Password"
              />
            </div>
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
                "group relative flex w-full justify-center rounded-lg bg-primary-600 px-3 py-3 text-sm font-semibold text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500">
          Not a member?{" "}
          <Link
            href="/register"
            className="font-semibold leading-6 text-primary-600 hover:text-primary-500"
          >
            Start a family
          </Link>
        </p>
      </div>
    </div>
  );
}
