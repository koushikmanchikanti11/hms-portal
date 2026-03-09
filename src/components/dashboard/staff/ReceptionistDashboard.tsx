"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarCheck, Clock, Receipt, Users, Loader2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

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

    // Mock OPD Queue
    const liveQueue = [
        { id: "OPD-102", patient: "Michael Johnson", doctor: "Dr. Smith", status: "WAITING", time: "10:15 AM", waitTime: "15 min" },
        { id: "OPD-103", patient: "Emily Davis", doctor: "Dr. Adams", status: "IN_PROGRESS", time: "10:00 AM", waitTime: "30 min" },
        { id: "OPD-104", patient: "Robert Brown", doctor: "Dr. Smith", status: "WAITING", time: "10:45 AM", waitTime: "-" },
    ];

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live OPD Queue */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Live OPD Queue</h3>
                            <Link href="/hospital/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                View Full Schedule <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Token</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wait Time</th>
                                </tr></thead>
                                <tbody>
                                    {liveQueue.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-700 bg-blue-50/50 rounded-l-lg">{item.id}</td>
                                            <td className="py-3 px-4 font-medium text-gray-900">{item.patient}</td>
                                            <td className="py-3 px-4 text-gray-600">{item.doctor}</td>
                                            <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${item.waitTime === '-' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-700'}`}>
                                                    {item.waitTime}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <Link href="/hospital/patients" className="flex items-center gap-3 p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                                    <div className="bg-white p-2 border border-gray-200 rounded-md group-hover:border-blue-200 group-hover:text-blue-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Patient Registry</p>
                                        <p className="text-xs text-gray-500">Register or search patients</p>
                                    </div>
                                </Link>
                                <Link href="/hospital/appointments" className="flex items-center gap-3 p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                                    <div className="bg-white p-2 border border-gray-200 rounded-md group-hover:border-blue-200 group-hover:text-blue-600">
                                        <CalendarCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Book Appointment</p>
                                        <p className="text-xs text-gray-500">Schedule new visits</p>
                                    </div>
                                </Link>
                                <Link href="/hospital/billing" className="flex items-center gap-3 p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                                    <div className="bg-white p-2 border border-gray-200 rounded-md group-hover:border-blue-200 group-hover:text-blue-600">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Billing Desk</p>
                                        <p className="text-xs text-gray-500">Process patient payments</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Role Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-700 font-medium">👋 Receptionist View — Manage check-ins and billing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
