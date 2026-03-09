"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CalendarDays, ClipboardList, FileText, Loader2, Clock } from "lucide-react";
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

    if (loading) return <><PageHeader title="My Dashboard" /><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-cyan-600" /></div></>;

    if (data?.error) return <><PageHeader title="My Dashboard" /><div className="p-6 text-center text-gray-500">{data.error}</div></>;

    const nextAppointment = data?.recentAppointments?.find((a: any) => new Date(a.appointmentDate) > new Date() && a.status === 'SCHEDULED');

    // Mocked timeline data for UI
    const timelineData = [
        { id: 1, title: "Dr. Smith • General Checkup", desc: "Blood pressure normal. Prescribed vitamins.", date: "Dec 12, 2025", color: "bg-cyan-500" },
        { id: 2, title: "Lab Results Available", desc: "Comprehensive Metabolic Panel downloaded.", date: "Nov 28, 2025", color: "bg-purple-500" },
        { id: 3, title: "Prescription Refilled", desc: "Amoxicillin 500mg (14 days)", date: "Nov 15, 2025", color: "bg-green-500" },
    ];

    return (
        <>
            <PageHeader title={`Welcome, ${data?.patient?.name || "Patient"}`} />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard
                        title="Next Appointment"
                        value={nextAppointment ? new Date(nextAppointment.appointmentDate).getDate().toString() + ' ' + new Date(nextAppointment.appointmentDate).toLocaleString('default', { month: 'short' }) : "None"}
                        subtitle={nextAppointment ? `Dr. ${nextAppointment.doctor?.name}` : "Book now"}
                        icon={CalendarDays}
                        variant="highlight"
                    />
                    <KPICard title="Appointments" value={data?.counts?.appointments || 0} subtitle="Total visits" icon={CalendarDays} color="cyan" iconColor="blue" />
                    <KPICard title="Medical Records" value={data?.counts?.records || 0} subtitle="Filed records" icon={ClipboardList} color="green" />
                    <KPICard title="Prescriptions" value={data?.counts?.prescriptions || 0} subtitle="Total prescriptions" icon={FileText} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Appointments */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
                        </div>
                        {data?.recentAppointments?.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentAppointments.map((a: any) => (
                                    <div key={a.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-700 font-bold shrink-0">
                                                {a.doctor?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Dr. {a.doctor?.name}</p>
                                                <p className="text-xs text-gray-500">{a.doctor?.specialization} • {formatDate(a.appointmentDate)}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={a.status} />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500 py-4 text-center">No appointments yet.</p>}
                    </div>

                    {/* Recent Prescriptions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
                        {data?.recentPrescriptions?.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentPrescriptions.map((p: any) => (
                                    <div key={p.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{(p.items as any[])?.length || 0} medicines</p>
                                                <p className="text-xs text-gray-500">Dr. {p.doctor?.name} • {formatDate(p.issuedAt)}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500 py-4 text-center">No prescriptions yet.</p>}
                    </div>

                    {/* Health Timeline */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-cyan-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Health Timeline</h3>
                        </div>
                        <div className="relative border-l-2 ml-3 border-gray-100 space-y-8 pb-4">
                            {timelineData.map((item) => (
                                <div key={item.id} className="relative pl-6">
                                    <span className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-[3px] border-white shadow-sm ${item.color}`} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                        <p className="text-xs font-medium text-cyan-600 mb-1">{item.date}</p>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
