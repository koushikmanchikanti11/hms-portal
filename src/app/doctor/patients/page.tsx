"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2, Users, Phone, Mail } from "lucide-react";

export default function DoctorPatientsPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        // Fetch appointments to get unique patients for this doctor
        fetch("/api/appointments")
            .then(r => r.json())
            .then((appointments: any[]) => {
                if (!Array.isArray(appointments)) { setLoading(false); return; }
                // Deduplicate patients from appointments
                const seen = new Set<string>();
                const uniquePatients: any[] = [];
                for (const appt of appointments) {
                    if (appt.patient && !seen.has(appt.patient.id)) {
                        seen.add(appt.patient.id);
                        uniquePatients.push(appt.patient);
                    }
                }
                setPatients(uniquePatients);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = patients.filter(p =>
        !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search)
    );

    return (
        <>
            <PageHeader title="My Patients" />
            <div className="p-4 md:p-6">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full max-w-sm px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border">
                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">{search ? "No patients match your search." : "No patients found."}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((p: any) => (
                            <div key={p.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-600">
                                            {p.name?.charAt(0).toUpperCase() || "?"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{p.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                    {p.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                            <span>{p.phone}</span>
                                        </div>
                                    )}
                                    {p.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="truncate">{p.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
