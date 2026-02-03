export default function Loading() {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-pulse">
            
            {/* Logo Placeholder */}
            <div className="flex justify-center">
                <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
            </div>
  
            {/* Card Skeleton */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                 {/* Header Line */}
                 <div className="h-6 w-3/4 bg-slate-200 rounded mx-auto"></div>
                 
                 {/* Input Lines */}
                 <div className="space-y-4">
                    <div className="h-12 w-full bg-slate-100 rounded-lg"></div>
                    <div className="h-12 w-full bg-slate-100 rounded-lg"></div>
                 </div>
  
                 {/* Button */}
                 <div className="h-12 w-full bg-slate-200 rounded-xl mt-4"></div>
            </div>
            
            <p className="text-center text-slate-400 text-sm">Preparing your financial oasis...</p>
        </div>
      </div>
    );
  }
