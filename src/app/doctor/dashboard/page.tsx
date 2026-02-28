"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CalendarDays, Users, FileText, ClipboardList, Loader2, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DoctorDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/doctor/dashboard")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <><PageHeader title="My Dashboard" /><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div></>;
    if (data?.error) return <><PageHeader title="My Dashboard" /><div className="p-6 text-center text-gray-500">{data.error}</div></>;

    return (
        <>
            <PageHeader title={`Welcome, Dr. ${data?.doctor?.name || "Doctor"}`} />
            <div className="p-4 md:p-6 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    <KPICard title="Today's Appointments" value={data?.counts?.todayAppointments || 0} subtitle="Scheduled today" icon={Activity} color="blue" />
                    <KPICard title="Total Appointments" value={data?.counts?.totalAppointments || 0} subtitle="All time" icon={CalendarDays} color="indigo" />
                    <KPICard title="My Patients" value={data?.counts?.totalPatients || 0} subtitle="Unique patients" icon={Users} color="green" />
                    <KPICard title="Prescriptions" value={data?.counts?.totalPrescriptions || 0} subtitle="Total issued" icon={FileText} color="purple" />
                    <KPICard title="Medical Records" value={data?.counts?.totalRecords || 0} subtitle="Filed records" icon={ClipboardList} color="orange" />
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
                    {data?.recentAppointments?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr></thead>
                                <tbody>
                                    {data.recentAppointments.map((a: any) => (
                                        <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-2 px-3 font-medium text-gray-900">{a.patient?.name}</td>
                                            <td className="py-2 px-3 text-gray-600">{formatDate(a.appointmentDate)}</td>
                                            <td className="py-2 px-3"><StatusBadge status={a.type} /></td>
                                            <td className="py-2 px-3"><StatusBadge status={a.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-sm text-gray-500">No appointments yet.</p>}
                </div>
            </div>
        </>
    );
}
