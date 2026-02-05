"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isRegister = pathname === "/register";
  
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;

  const direction = isRegister ? 1 : -1;

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className={cn("auth-container", isRegister && "container-right-panel-active")}>
        
        {/* Form Container */}
        <div 
            className={cn(
                "relative w-full h-auto min-h-[600px] md:min-h-0 md:absolute md:top-0 md:h-full md:w-1/2 transition-all duration-[800ms] ease-in-out bg-white flex items-center justify-center overflow-hidden",
                isRegister ? "md:left-1/2 z-20 opacity-100" : "md:left-0 z-20 opacity-100" 
            )}
        >
            {isMobile ? (
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div
                        key={pathname}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center p-8 md:p-12 w-full h-full bg-white"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            ) : (
                 <div className="w-full h-full flex items-center justify-center p-8 md:p-12">
                   {children}
                 </div>
            )}
        </div>

        {/* Overlay Container */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            
            {/* Left Overlay Panel */}
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

            {/* Right Overlay Panel */}
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
