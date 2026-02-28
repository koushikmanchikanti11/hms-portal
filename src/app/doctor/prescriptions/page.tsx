"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DoctorPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/prescriptions")
            .then(r => r.json())
            .then(d => { setPrescriptions(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <PageHeader title="Prescriptions" />
            <div className="p-4 md:p-6">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No prescriptions found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date Issued</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Medicines</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr></thead>
                            <tbody>
                                {prescriptions.map((p: any) => (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{p.patient?.name || "—"}</td>
                                        <td className="py-3 px-4 text-gray-600">{formatDate(p.issuedAt)}</td>
                                        <td className="py-3 px-4 text-gray-700">{(p.items as any[])?.length || 0} item(s)</td>
                                        <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
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
