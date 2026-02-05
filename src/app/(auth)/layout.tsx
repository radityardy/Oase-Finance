"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isRegister = pathname === "/register";
  
  // Prevent hydration mismatch by rendering only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className={cn("auth-container", isRegister && "container-right-panel-active")}>
        
        {/* Form Container */}
        {/* We position the children (Form) based on the route */}
        {/* If Login: Right Side. If Register: Left Side. */}
        <div 
            className={cn(
                "absolute top-0 h-full w-1/2 transition-all duration-[800ms] ease-in-out bg-white flex items-center justify-center p-12",
                isRegister ? "left-1/2 z-20 opacity-100" : "left-0 z-20 opacity-100" 
            )}
        >
             {children}
        </div>

        {/* Overlay Container */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            
            {/* Left Overlay Panel (Visible on Register Page -> Prompts Login) */}
            <div className="auth-overlay-panel auth-overlay-left">
              <h1 className="font-bold text-3xl mb-2">Welcome Back!</h1>
              <p className="text-sm mb-8 leading-relaxed">
                To keep connected with us please login with your personal info
              </p>
              <button 
                className="rounded-full border border-white bg-transparent px-12 py-3 text-xs font-bold uppercase tracking-wider text-white transition-transform active:scale-95 hover:bg-white/10"
                onClick={() => router.push("/login")}
              >
                Sign In
              </button>
            </div>

            {/* Right Overlay Panel (Visible on Login Page -> Prompts Register) */}
            <div className="auth-overlay-panel auth-overlay-right">
              <h1 className="font-bold text-3xl mb-2">Hello, Friend!</h1>
              <p className="text-sm mb-8 leading-relaxed">
                Enter your personal details and start journey with us
              </p>
              <button 
                className="rounded-full border border-white bg-transparent px-12 py-3 text-xs font-bold uppercase tracking-wider text-white transition-transform active:scale-95 hover:bg-white/10"
                onClick={() => router.push("/register")}
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
