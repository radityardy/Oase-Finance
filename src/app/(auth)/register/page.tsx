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
      // 1. Create User
      const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm,
        name,
        role: "admin" // First user is always admin
      });

      // 2. Auth as User to create Family (assuming rules allow it or we lift restrictions)
      // Actually, standard flow: Create Family -> Update User with Family ID.
      // But we need to be authed to create family usually.
      // Solution: Auth first, then create family, then update self.
      
      await pb.collection("users").authWithPassword(email, password);

      const family = await pb.collection("families").create({
        name: familyName,
      });

      // 3. Update User with Family ID
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
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface p-8 shadow-xl ring-1 ring-slate-900/5">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-900">
            Create your Oase
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Start managing your family finances today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {/* Same fields as before */}
            {/* Family Name */}
            <div>
              <label htmlFor="familyName" className="block text-sm font-medium leading-6 text-slate-900">
                Family Name
              </label>
              <div className="mt-2">
                <input
                  id="familyName"
                  name="familyName"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                  placeholder="The Smiths"
                />
              </div>
            </div>

            {/* User Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                Your Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                  placeholder="john@example.com"
                />
              </div>
            </div>

             {/* Password */}
             <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                Password (min 8 chars)
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                />
              </div>
            </div>

             {/* Password Confirm */}
             <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium leading-6 text-slate-900">
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  minLength={8}
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                />
              </div>
            </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
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
              {loading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold leading-6 text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
