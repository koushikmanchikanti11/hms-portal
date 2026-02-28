"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertTriangle, Pill, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

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

    return (
        <>
            <PageHeader title="Pharmacy Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
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

                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/hospital/pharmacy" className="flex items-center gap-2 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-sm font-medium text-green-700">
                            <Pill className="h-4 w-4" /> Pharmacy
                        </Link>
                        <Link href="/hospital/prescriptions" className="flex items-center gap-2 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-sm font-medium text-green-700">
                            <Pill className="h-4 w-4" /> Prescriptions
                        </Link>
                    </div>
                </div>

                {stats && stats.low_stock_count > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-700 font-medium">
                            ⚠️ {stats.low_stock_count} medicine(s) are below minimum stock threshold. Please restock immediately.
                        </p>
                    </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-700 font-medium">💊 Pharmacist View — You have full access to Pharmacy inventory and Prescription dispensing.</p>
                </div>
            </div>
        </>
    );
}
