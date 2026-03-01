"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CalendarDays, Plus, Loader2, Search, Check, X, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cancelId, setCancelId] = useState<string | null>(null);

    const fetchAppointments = async () => {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        const r = await fetch(`/api/appointments?${params}`);
        if (r.ok) setAppointments(await r.json());
        setLoading(false);
    };

    useEffect(() => { fetchAppointments(); }, [statusFilter]);

    const markComplete = async (id: string) => {
        await fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) });
        fetchAppointments();
    };

    const cancelAppointment = async () => {
        if (!cancelId) return;
        await fetch(`/api/appointments/${cancelId}`, { method: "DELETE" });
        setCancelId(null);
        fetchAppointments();
    };

    const filtered = appointments.filter(a =>
        (a.patient?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.doctor?.name || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans">Appointments</h1>
                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search appointments..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 bg-gray-50 border-gray-200 focus:border-[#1A56DB] focus:ring-[#1A56DB] h-9 text-sm rounded-lg"
                        />
                    </div>
                    <Link href="/hospital/appointments/new">
                        <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium">
                            <Plus className="w-4 h-4" /> Book Appointment
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] h-9 bg-gray-50 border-gray-200 text-sm">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Appointments</SelectItem>
                                <SelectItem value="scheduled">Upcoming</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">Date:</span>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] h-9 bg-gray-50 border-gray-200 text-sm">
                                <SelectValue placeholder="All Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" /></div>
                    : filtered.length === 0 ? <EmptyState icon={<CalendarDays className="w-12 h-12 text-gray-400" />} title="No appointments" description={search ? "No matching appointments found" : "Book your first appointment"} action={!search && <Link href="/hospital/appointments/new"><Button className="bg-[#1A56DB] hover:bg-[#1E40AF]">Book Appointment</Button></Link>} />
                        : (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(a => (
                                                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors last:border-0 group">
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 tabular">
                                                        {formatDateTime(a.appointmentDate)}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                                                                {a.patient?.name ? a.patient.name.charAt(0) : "?"}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">{a.patient?.name || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-medium text-gray-800">{a.doctor?.name || "Unassigned"}</p>
                                                        <p className="text-[11px] text-gray-500">{a.doctor?.specialization || ""}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={a.type || "consultation"} />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={a.status} />
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 transition-opacity">
                                                            <Link href={`/hospital/appointments/${a.id}`}>
                                                                <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-[#1A56DB] hover:bg-blue-50 transition-all duration-200">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            {a.status === "scheduled" && (
                                                                <>
                                                                    <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200" onClick={() => markComplete(a.id)}>
                                                                        <Check className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200" onClick={() => setCancelId(a.id)}>
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                }
            </div>
            <ConfirmDialog
                open={!!cancelId}
                onOpenChange={(open) => !open && setCancelId(null)}
                title="Cancel Appointment"
                description="Are you sure you want to cancel this appointment?"
                onConfirm={cancelAppointment}
            />
        </div>
    );
}
