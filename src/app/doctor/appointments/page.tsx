"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | today | scheduled | completed

    const fetchAppointments = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter === "today") params.set("date", "today");
        else if (filter !== "all") params.set("status", filter);

        fetch(`/api/appointments?${params}`)
            .then(r => r.json())
            .then(d => { setAppointments(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchAppointments(); }, [filter]);

    return (
        <>
            <PageHeader title="Appointments" />
            <div className="p-4 md:p-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {["all", "today", "scheduled", "completed", "cancelled"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border">
                        <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No appointments found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr></thead>
                            <tbody>
                                {appointments.map((a: any) => (
                                    <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{a.patient?.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{a.patient?.phone || "—"}</td>
                                        <td className="py-3 px-4">{formatDate(a.appointmentDate)}</td>
                                        <td className="py-3 px-4"><StatusBadge status={a.type} /></td>
                                        <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
