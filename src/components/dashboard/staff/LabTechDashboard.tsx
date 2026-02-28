"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarDays, ClipboardList, Users, Loader2 } from "lucide-react";
import Link from "next/link";

interface LabTechStats {
    orders_today: number;
    reports_today: number;
    total_patients: number;
}

export function LabTechDashboard() {
    const [stats, setStats] = useState<LabTechStats | null>(null);
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
                <PageHeader title="Lab Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Lab Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <KPICard
                        title="Pending Lab Orders"
                        value={stats?.orders_today ?? 0}
                        subtitle="Today's appointments"
                        icon={CalendarDays}
                        color="amber"
                    />
                    <KPICard
                        title="Reports Today"
                        value={stats?.reports_today ?? 0}
                        subtitle="Records created today"
                        icon={ClipboardList}
                        color="blue"
                    />
                    <KPICard
                        title="Total Patients"
                        value={stats?.total_patients ?? 0}
                        subtitle="In the system"
                        icon={Users}
                        color="indigo"
                    />
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                    <Link href="/hospital/records" className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm font-medium text-indigo-700 w-fit">
                        <ClipboardList className="h-4 w-4" /> Medical Records
                    </Link>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-sm text-indigo-700 font-medium">🔬 Lab Technician View — You have access to Medical Records and Lab Reports.</p>
                </div>
            </div>
        </>
    );
}
