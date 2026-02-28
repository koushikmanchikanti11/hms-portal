"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PatientRecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/patient/records")
            .then(r => r.json())
            .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <PageHeader title="Medical Records" />
            <div className="p-4 md:p-6">
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div> : records.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No medical records found.</div>
                ) : (
                    <div className="space-y-4">
                        {records.map((r: any) => (
                            <div key={r.id} className="bg-white rounded-xl border p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{r.diagnosis || "General Consultation"}</p>
                                        <p className="text-xs text-gray-500">Dr. {r.doctor?.name || "—"} — {formatDate(r.createdAt)}</p>
                                    </div>
                                    <StatusBadge status={r.type} />
                                </div>
                                {r.prescription && <p className="text-sm text-gray-600 mb-1"><strong>Prescription: </strong>{r.prescription}</p>}
                                {r.notes && <p className="text-sm text-gray-500"><strong>Notes: </strong>{r.notes}</p>}
                                {r.type === "IP" && (
                                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                                        {r.admissionDate && <span>Admitted: {formatDate(r.admissionDate)}</span>}
                                        {r.dischargeDate && <span>Discharged: {formatDate(r.dischargeDate)}</span>}
                                        {r.ward && <span>Ward: {r.ward}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
