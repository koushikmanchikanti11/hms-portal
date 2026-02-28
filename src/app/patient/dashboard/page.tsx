"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CalendarDays, ClipboardList, FileText, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PatientDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/patient/dashboard")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <><PageHeader title="My Dashboard" /><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div></>;

    if (data?.error) return <><PageHeader title="My Dashboard" /><div className="p-6 text-center text-gray-500">{data.error}</div></>;

    return (
        <>
            <PageHeader title={`Welcome, ${data?.patient?.name || "Patient"}`} />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KPICard title="Appointments" value={data?.counts?.appointments || 0} subtitle="Total visits" icon={CalendarDays} color="blue" />
                    <KPICard title="Medical Records" value={data?.counts?.records || 0} subtitle="Filed records" icon={ClipboardList} color="green" />
                    <KPICard title="Prescriptions" value={data?.counts?.prescriptions || 0} subtitle="Total prescriptions" icon={FileText} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Appointments */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
                        {data?.recentAppointments?.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentAppointments.map((a: any) => (
                                    <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Dr. {a.doctor?.name}</p>
                                            <p className="text-xs text-gray-500">{a.doctor?.specialization} — {formatDate(a.appointmentDate)}</p>
                                        </div>
                                        <StatusBadge status={a.status} />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">No appointments yet.</p>}
                    </div>

                    {/* Recent Prescriptions */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
                        {data?.recentPrescriptions?.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentPrescriptions.map((p: any) => (
                                    <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{(p.items as any[])?.length || 0} medicines</p>
                                            <p className="text-xs text-gray-500">Dr. {p.doctor?.name} — {formatDate(p.issuedAt)}</p>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">No prescriptions yet.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
