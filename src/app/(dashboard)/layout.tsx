"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  PieChart, 
  Settings, 
  LogOut,
  Bell,
  Plus
} from 'lucide-react';
import { pb } from '@/lib/pocketbase';

const sidebarItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Reports', href: '/analytics', icon: PieChart }, // Analytics/Reports
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-surface-subtle overflow-hidden">
      {/* Sidebar - Hidden on mobile, basic implementation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Oase
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
           <span className="font-bold text-lg text-primary-600">Oase</span>
           <button onClick={handleLogout} className="p-2 text-slate-500">
             <LogOut className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
             <div className="flex justify-around items-center p-2">
                <Link href="/" className={cn("flex flex-col items-center p-2 rounded-lg", pathname === '/' ? "text-primary-600" : "text-slate-400")}>
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Home</span>
                </Link>
                
                <Link href="/transactions" className={cn("flex flex-col items-center p-2 rounded-lg", pathname === '/transactions' ? "text-primary-600" : "text-slate-400")}>
                    <ArrowRightLeft className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Trx</span>
                </Link>

                <Link href="/transactions/new" className="flex flex-col items-center -mt-8">
                     <div className="bg-primary-600 rounded-full p-4 shadow-lg text-white">
                        <Plus className="w-6 h-6" />
                     </div>
                </Link>

                <Link href="/reminders" className={cn("flex flex-col items-center p-2 rounded-lg", pathname === '/reminders' ? "text-primary-600" : "text-slate-400")}>
                    <Bell className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Jatah</span>
                </Link>

                {/* More Menu Toggle - Simple Fullscreen Overlay */}
                <button 
                    onClick={() => document.getElementById('mobile-menu-overlay')?.classList.toggle('hidden')}
                    className={cn("flex flex-col items-center p-2 rounded-lg text-slate-400")}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Menu</span>
                </button>
            </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div id="mobile-menu-overlay" className="hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-20 px-6 pb-24 md:hidden animate-in fade-in slide-in-from-bottom-10 duration-200">
             <button 
                onClick={() => document.getElementById('mobile-menu-overlay')?.classList.add('hidden')}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full"
             >
                <LogOut className="w-5 h-5 rotate-180" /> {/* Close Icon Simulation */}
             </button>

             <h2 className="text-2xl font-bold mb-6 text-slate-900">Menu</h2>
             <div className="grid grid-cols-2 gap-4">
                {sidebarItems.map(item => (
                    <Link 
                        key={item.href}
                        href={item.href}
                        onClick={() => document.getElementById('mobile-menu-overlay')?.classList.add('hidden')}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 active:scale-95 transition-transform"
                    >
                        <item.icon className="w-8 h-8 text-primary-600 mb-2" />
                        <span className="font-medium text-slate-700">{item.name}</span>
                    </Link>
                ))}
                
                <button 
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center p-4 bg-rose-50 rounded-xl border border-rose-100 active:scale-95 transition-transform"
                >
                    <LogOut className="w-8 h-8 text-rose-600 mb-2" />
                    <span className="font-medium text-rose-700">Sign Out</span>
                </button>
             </div>
        </div>
      </main>
    </div>
  );
}
