"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PatientPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/patient/prescriptions")
            .then(r => r.json())
            .then(d => { setPrescriptions(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <PageHeader title="My Prescriptions" />
            <div className="p-4 md:p-6">
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div> : prescriptions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No prescriptions found.</div>
                ) : (
                    <div className="space-y-4">
                        {prescriptions.map((p: any) => {
                            const items = (p.items || []) as any[];
                            return (
                                <div key={p.id} className="bg-white rounded-xl border p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{items.length} Medicine{items.length !== 1 ? "s" : ""}</p>
                                            <p className="text-xs text-gray-500">Dr. {p.doctor?.name || "—"} — {formatDate(p.issuedAt)}</p>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>
                                    <div className="space-y-2">
                                        {items.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400">{i + 1}.</span>
                                                <span className="font-medium text-gray-800">{item.medicineName}</span>
                                                {item.dosage && <span className="text-gray-500">— {item.dosage}</span>}
                                                {item.frequency && <span className="text-gray-500">— {item.frequency}</span>}
                                                {item.duration && <span className="text-gray-500">× {item.duration}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    {p.notes && <p className="mt-3 text-xs italic text-gray-500">{p.notes}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
