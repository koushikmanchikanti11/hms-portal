"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutDashboard, Users, CalendarDays, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface GenericStats {
    total_patients: number;
    appointments_today: number;
}

export function GenericStaffDashboard() {
    const [stats, setStats] = useState<GenericStats | null>(null);
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
                <PageHeader title="Staff Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Staff Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <KPICard
                        title="Total Patients"
                        value={stats?.total_patients ?? 0}
                        subtitle="In the hospital"
                        icon={Users}
                        color="orange"
                    />
                    <KPICard
                        title="Today's Appointments"
                        value={stats?.appointments_today ?? 0}
                        subtitle="Scheduled today"
                        icon={CalendarDays}
                        color="blue"
                    />
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <LayoutDashboard className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-orange-800">No specific role assigned yet</p>
                        <p className="text-xs text-orange-600 mt-1">Please contact your administrator to assign you a specialized staff role to unlock your personalized dashboard.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
