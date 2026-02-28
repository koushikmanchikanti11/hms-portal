"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BookAppointmentModal } from "@/components/appointments/BookAppointmentModal";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function PatientAppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = () => {
        setLoading(true);
        fetch("/api/patient/appointments")
            .then(r => r.json())
            .then(d => { setAppointments(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchAppointments(); }, []);

    return (
        <>
            <PageHeader
                title="My Appointments"
                action={
                    <BookAppointmentModal
                        onSuccess={fetchAppointments}
                        trigger={
                            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                                <Plus className="h-4 w-4 mr-2" />Book Appointment
                            </Button>
                        }
                    />
                }
            />
            <div className="p-4 md:p-6">
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div> : appointments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No appointments found.</div>
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Specialization</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr></thead>
                            <tbody>{appointments.map((a: any) => (
                                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-900">{formatDate(a.appointmentDate)}</td>
                                    <td className="py-3 px-4 font-medium">Dr. {a.doctor?.name || "—"}</td>
                                    <td className="py-3 px-4 text-gray-500">{a.doctor?.specialization || "—"}</td>
                                    <td className="py-3 px-4"><StatusBadge status={a.type} /></td>
                                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
