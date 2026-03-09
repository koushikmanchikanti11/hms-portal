"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CalendarDays, Users, FileText, ClipboardList, Loader2, Activity, Play, Plus, Clock, BarChart3 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DoctorDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/doctor/dashboard")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <><PageHeader title="My Dashboard" /><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div></>;
    if (data?.error) return <><PageHeader title="My Dashboard" /><div className="p-6 text-center text-gray-500">{data.error}</div></>;

    // Mock data for UI components not fully backed by API yet
    const pendingRecords = [
        { id: 1, patient: "Sarah Connor", type: "Post-Op Checkup", time: "Waiting (2 days)" },
        { id: 2, patient: "John Doe", type: "Lab Results Follow-up", time: "Waiting (5 hours)" },
    ];

    const weeklyData = [
        { day: "Mon", count: 12, height: "h-24" },
        { day: "Tue", count: 18, height: "h-36" },
        { day: "Wed", count: 15, height: "h-32" },
        { day: "Thu", count: 22, height: "h-40" },
        { day: "Fri", count: 14, height: "h-28" },
        { day: "Sat", count: 8, height: "h-16" },
        { day: "Sun", count: 2, height: "h-6" },
    ];

    return (
        <>
            <PageHeader title={`Welcome, Dr. ${data?.doctor?.name || "Doctor"}`} />
            <div className="p-4 md:p-6 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    <KPICard title="Today's Appointments" value={data?.counts?.todayAppointments || 0} subtitle="Scheduled today" icon={Activity} color="green" />
                    <KPICard title="Total Appointments" value={data?.counts?.totalAppointments || 0} subtitle="All time" icon={CalendarDays} color="indigo" />
                    <KPICard title="My Patients" value={data?.counts?.totalPatients || 0} subtitle="Unique patients" icon={Users} color="blue" />
                    <KPICard title="Prescriptions" value={data?.counts?.totalPrescriptions || 0} subtitle="Total issued" icon={FileText} color="purple" />
                    <KPICard title="Medical Records" value={data?.counts?.totalRecords || 0} subtitle="Filed records" icon={ClipboardList} color="orange" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
                            <Button variant="outline" size="sm" className="text-xs">View Full Calendar</Button>
                        </div>
                        {data?.recentAppointments?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {data.recentAppointments.map((a: any) => (
                                            <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-3 font-medium text-gray-900 flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-100/50">
                                                        {a.patient?.name?.charAt(0)}
                                                    </div>
                                                    {a.patient?.name}
                                                </td>
                                                <td className="py-3 px-3 text-gray-600">{new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="py-3 px-3"><StatusBadge status={a.status} /></td>
                                                <td className="py-3 px-3 flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                                                        <Plus className="w-3.5 h-3.5 mr-1" /> Record
                                                    </Button>
                                                    <Button size="sm" className="h-8 text-xs bg-[#059669] hover:bg-[#047857] text-white">
                                                        <Play className="w-3.5 h-3.5 mr-1" /> Start
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-sm text-gray-500 py-6 text-center">No appointments scheduled for today.</p>}
                    </div>

                    <div className="space-y-6">
                        {/* Pending Records */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-amber-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Pending Records</h3>
                            </div>
                            <div className="space-y-3">
                                {pendingRecords.map((r) => (
                                    <div key={r.id} className="p-3 rounded-lg border border-amber-100 bg-amber-50/30 hover:bg-amber-50/80 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-semibold text-gray-900">{r.patient}</p>
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">{r.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{r.type}</p>
                                        <span className="text-xs font-medium text-[#059669] hover:underline">Complete now →</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Schedule Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-[#059669]" />
                                    <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
                                </div>
                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100/50">83 Appts</span>
                            </div>

                            <div className="flex items-end justify-between h-40 pt-4 border-b border-gray-100/50 pb-2">
                                {weeklyData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                                        <div className="relative flex justify-center w-8">
                                            <div className="absolute -top-8 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {d.count}
                                            </div>
                                            <div className={`w-full ${d.height} bg-[#059669]/20 group-hover:bg-[#059669] rounded-t-sm transition-colors duration-300`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                                {weeklyData.map((d, i) => (
                                    <span key={i} className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{d.day}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
