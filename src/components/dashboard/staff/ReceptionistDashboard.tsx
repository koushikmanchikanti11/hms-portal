"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarCheck, Clock, Receipt, Users, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface ReceptionistStats {
    appointments_today: number;
    patients_waiting: number;
    pending_bills: number;
    pending_amount: number;
}

export function ReceptionistDashboard() {
    const [stats, setStats] = useState<ReceptionistStats | null>(null);
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
                <PageHeader title="Reception Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Reception Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <KPICard
                        title="Today's Check-ins"
                        value={stats?.appointments_today ?? 0}
                        subtitle="Appointments today"
                        icon={CalendarCheck}
                        color="blue"
                    />
                    <KPICard
                        title="Patients Waiting"
                        value={stats?.patients_waiting ?? 0}
                        subtitle="In queue right now"
                        icon={Clock}
                        color="amber"
                    />
                    <KPICard
                        title="Pending Invoices"
                        value={stats?.pending_bills ?? 0}
                        subtitle={`${formatCurrency(stats?.pending_amount ?? 0)} outstanding`}
                        icon={Receipt}
                        color="red"
                    />
                </div>

                {/* Quick Navigation */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Link href="/hospital/patients" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-700">
                            <Users className="h-4 w-4" /> Patients
                        </Link>
                        <Link href="/hospital/appointments" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-700">
                            <CalendarCheck className="h-4 w-4" /> Appointments
                        </Link>
                        <Link href="/hospital/billing" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-700">
                            <Receipt className="h-4 w-4" /> Billing
                        </Link>
                    </div>
                </div>

                {/* Role Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700 font-medium">👋 Receptionist View — You have access to Patient check-ins, Appointment scheduling, and Billing.</p>
                </div>
            </div>
        </>
    );
}
