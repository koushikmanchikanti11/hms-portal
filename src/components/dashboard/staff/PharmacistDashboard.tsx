"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertTriangle, Pill, Clock, Loader2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PharmacistStats {
    low_stock_count: number;
    prescriptions_today: number;
    expiring_soon: number;
}

export function PharmacistDashboard() {
    const [stats, setStats] = useState<PharmacistStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/staff-stats")
            .then(r => r.json())
            .then(d => { setStats(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <PageHeader title="Pharmacy Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>
            </>
        );
    }

    const pendingPrescriptions = [
        { id: "RX-10492", patient: "Michael Johnson", doctor: "Dr. Smith", items: 3, status: "pending" },
        { id: "RX-10493", patient: "Emily Davis", doctor: "Dr. Adams", items: 1, status: "pending" },
    ];

    const stockLevels = [
        { name: "Amoxicillin 500mg", current: 25, req: 100, height: "h-8" },
        { name: "Paracetamol 650mg", current: 85, req: 200, height: "h-24" },
        { name: "Ibuprofen 400mg", current: 40, req: 150, height: "h-12" },
        { name: "Omeprazole 20mg", current: 120, req: 150, height: "h-36" },
        { name: "Lisinopril 10mg", current: 60, req: 100, height: "h-16" },
    ];

    return (
        <>
            <PageHeader title="Pharmacy Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                {stats && stats.low_stock_count > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900">Low Stock Alert</h4>
                            <p className="text-sm text-red-700 mt-1">
                                {stats.low_stock_count} medicine(s) are below minimum stock threshold. Please restock immediately to avoid shortages.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto bg-white text-red-700 border-red-200 hover:bg-red-50">View Inventory</Button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <KPICard
                        title="Low Stock Alerts"
                        value={stats?.low_stock_count ?? 0}
                        subtitle="Below minimum threshold"
                        icon={AlertTriangle}
                        color={stats?.low_stock_count ? "red" : "green"}
                    />
                    <KPICard
                        title="Prescriptions Today"
                        value={stats?.prescriptions_today ?? 0}
                        subtitle="Issued today"
                        icon={Pill}
                        color="blue"
                    />
                    <KPICard
                        title="Expiring in 30 Days"
                        value={stats?.expiring_soon ?? 0}
                        subtitle="Medicines near expiry"
                        icon={Clock}
                        color="amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Prescriptions to Dispense */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Pill className="h-5 w-5 text-green-600" /> Prescriptions to Dispense
                            </h3>
                            <Link href="/hospital/prescriptions" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {pendingPrescriptions.map((px) => (
                                <div key={px.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-500">{px.id}</span>
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{px.status}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">{px.patient}</p>
                                        <p className="text-xs text-gray-500">From {px.doctor} • {px.items} items</p>
                                    </div>
                                    <Button size="sm" className="bg-[#10B981] hover:bg-[#059669] text-white">Dispense</Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stock Chart */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-gray-400" /> Selected Inventory Levels
                            </h3>
                        </div>
                        <div className="flex-1 flex items-end justify-between pt-4 border-b border-gray-100 pb-2 gap-2">
                            {stockLevels.map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full flex-1">
                                    <div className="relative flex justify-center w-full max-w-[40px]">
                                        <div className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {item.name}: {item.current} units
                                        </div>
                                        <div className={`w-full ${item.height} ${item.current < 50 ? 'bg-red-400' : 'bg-[#10B981]'} rounded-t-sm transition-opacity duration-300 opacity-80 group-hover:opacity-100`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 px-1 gap-2">
                            {stockLevels.map((item, i) => (
                                <span key={i} className="text-[10px] font-medium text-gray-400 truncate max-w-[60px] text-center">{item.name.split(' ')[0]}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
                    <p className="text-sm text-green-700 font-medium">💊 Pharmacist View — You have full access to Pharmacy inventory and Prescription dispensing.</p>
                    <Link href="/hospital/pharmacy" className="text-sm font-bold text-green-700 hover:underline flex items-center gap-1">Open Pharmacy POS <ArrowRight className="w-4 h-4" /></Link>
                </div>
            </div>
        </>
    );
}
