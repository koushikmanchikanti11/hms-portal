"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
    CalendarDays,
    Clock,
    User,
    Stethoscope,
    FileText,
    Activity,
    Loader2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                // There might not be a specific GET /id endpoint yet, 
                // but usually it exists or we can just fetch it from the list
                const res = await fetch(`/api/appointments`);
                if (res.ok) {
                    const data = await res.json();
                    const appt = data.find((a: any) => a.id === id);
                    if (appt) setAppointment(appt);
                }
            } catch (error) {
                console.error("Failed to fetch appointment", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex flex-col h-full bg-[#F9FAFB]">
                <PageHeader title="Appointment Details" backHref="/hospital/appointments" />
                <div className="flex flex-col items-center justify-center p-12 flex-1">
                    <CalendarDays className="h-16 w-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Not Found</h2>
                    <p className="text-gray-500 mb-6 text-center max-w-md">
                        The appointment you are looking for might have been deleted or doesn't exist.
                    </p>
                    <Button onClick={() => router.push("/hospital/appointments")} className="bg-[#1A56DB] hover:bg-[#1E40AF]">
                        Return to Appointments
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto page-enter">
            <PageHeader title="Appointment Details" backHref="/hospital/appointments" />

            <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 font-dm-sans">
                            {formatDateTime(appointment.appointmentDate)}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <StatusBadge status={appointment.status} />
                            <StatusBadge status={appointment.type || "consultation"} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.push(`/hospital/patients/${appointment.patientId}`)} className="text-gray-600">
                            <User className="w-4 h-4 mr-2" /> View Patient
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-gray-200 shadow-[var(--shadow-sm)]">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <User className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 font-dm-sans">Patient Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm font-medium text-gray-500">Name</span>
                                    <span className="text-sm font-semibold text-gray-900 col-span-2">{appointment.patient?.name || "Unknown"}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm font-medium text-gray-500">Phone</span>
                                    <span className="text-sm text-gray-900 col-span-2">{appointment.patient?.phone || "—"}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm font-medium text-gray-500">ID</span>
                                    <span className="text-sm text-gray-600 font-mono col-span-2 truncate">{appointment.patientId}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 shadow-[var(--shadow-sm)]">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Stethoscope className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 font-dm-sans">Doctor Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm font-medium text-gray-500">Name</span>
                                    <span className="text-sm font-semibold text-gray-900 col-span-2">{appointment.doctor?.name || "Unassigned"}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm font-medium text-gray-500">Specialization</span>
                                    <span className="text-sm text-gray-900 col-span-2">{appointment.doctor?.specialization || "—"}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm font-medium text-gray-500">Department</span>
                                    <span className="text-sm text-gray-900 col-span-2">{appointment.doctor?.department || "—"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 shadow-[var(--shadow-sm)] md:col-span-2">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 font-dm-sans">Appointment Notes</h3>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 min-h-[100px]">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {appointment.reason || "No specific reason or notes provided for this appointment."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
