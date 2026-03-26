import React from "react";

export default function PlatformLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Top Stats/Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div 
                        key={i} 
                        className="bg-slate-200 rounded-2xl h-48 border border-slate-100 shadow-sm"
                    />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-slate-200 rounded-3xl h-96 border border-slate-100 shadow-sm w-full" />
            
            {/* Additional bottom row just for extra polish */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-200 rounded-2xl h-64 border border-slate-100 shadow-sm" />
                 <div className="bg-slate-200 rounded-2xl h-64 border border-slate-100 shadow-sm" />
            </div>
        </div>
    );
}
