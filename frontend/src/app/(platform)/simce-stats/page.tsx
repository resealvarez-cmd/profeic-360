"use client";

import React from "react";

export default function SimceAdminDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard Institucional SIMCE</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Adecuado</span>
                    <p className="text-4xl font-bold text-blue-900 mt-2">45%</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                    <span className="text-yellow-600 text-sm font-semibold uppercase tracking-wider">Elemental</span>
                    <p className="text-4xl font-bold text-yellow-900 mt-2">30%</p>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">Insuficiente</span>
                    <p className="text-4xl font-bold text-red-900 mt-2">25%</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Desglose por Dominios Cognitivos</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Localizar</span>
                            <span>65%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: '65%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Relacionar</span>
                            <span>48%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: '48%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Reflexionar</span>
                            <span>32%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: '32%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
