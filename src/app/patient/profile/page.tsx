"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2, UserCircle } from "lucide-react";

export default function PatientProfilePage() {
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/patient/dashboard")
            .then(r => r.json())
            .then(d => { setPatient(d.patient || null); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <><PageHeader title="My Profile" /><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div></>;
    if (!patient) return <><PageHeader title="My Profile" /><div className="p-6 text-center text-gray-500">Profile not found.</div></>;

    const fields = [
        { label: "Name", value: patient.name },
        { label: "Phone", value: patient.phone },
        { label: "Email", value: patient.email },
        { label: "Gender", value: patient.gender },
        { label: "Date of Birth", value: patient.dob ? new Date(patient.dob).toLocaleDateString() : null },
        { label: "Blood Group", value: patient.bloodGroup?.replace("_POS", "+").replace("_NEG", "-") },
        { label: "Address", value: patient.address },
        { label: "Emergency Contact", value: patient.emergencyContactName },
        { label: "Emergency Phone", value: patient.emergencyContactPhone },
    ];

    return (
        <>
            <PageHeader title="My Profile" />
            <div className="p-4 md:p-6 max-w-2xl">
                <div className="bg-white rounded-xl border p-6">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                        <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                            <UserCircle className="h-10 w-10 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                            <p className="text-sm text-gray-500">{patient.phone}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.filter(f => f.value).map((f) => (
                            <div key={f.label}>
                                <p className="text-xs font-medium text-gray-400 uppercase">{f.label}</p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
