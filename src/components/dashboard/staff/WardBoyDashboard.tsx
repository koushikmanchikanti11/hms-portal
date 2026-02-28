"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { BedDouble, Loader2 } from "lucide-react";
import Link from "next/link";

interface WardBoyStats {
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
}

export function WardBoyDashboard() {
    const [stats, setStats] = useState<WardBoyStats | null>(null);
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
                <PageHeader title="Ward Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>
            </>
        );
    }

    const occupancyRate = stats && stats.total_beds > 0
        ? Math.round((stats.occupied_beds / stats.total_beds) * 100)
        : 0;

    return (
        <>
            <PageHeader title="Ward Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <KPICard
                        title="Total Beds"
                        value={stats?.total_beds ?? 0}
                        subtitle="Overall capacity"
                        icon={BedDouble}
                        color="purple"
                    />
                    <KPICard
                        title="Occupied Beds"
                        value={stats?.occupied_beds ?? 0}
                        subtitle={`${occupancyRate}% occupancy rate`}
                        icon={BedDouble}
                        color="red"
                    />
                    <KPICard
                        title="Available Beds"
                        value={stats?.available_beds ?? 0}
                        subtitle="Ready for admission"
                        icon={BedDouble}
                        color="green"
                    />
                </div>

                {/* Occupancy Bar */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bed Occupancy</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Occupancy Rate</span>
                            <span className="font-semibold">{occupancyRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full transition-all ${occupancyRate > 80 ? "bg-red-500" : occupancyRate > 60 ? "bg-amber-500" : "bg-green-500"}`}
                                style={{ width: `${occupancyRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats?.occupied_beds ?? 0} of {stats?.total_beds ?? 0} beds in use
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                    <Link href="/hospital/beds" className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm font-medium text-purple-700 w-fit">
                        <BedDouble className="h-4 w-4" /> Manage Beds
                    </Link>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-sm text-purple-700 font-medium">🛏 Ward Boy View — You can view and update bed status assignments.</p>
                </div>
            </div>
        </>
    );
}
