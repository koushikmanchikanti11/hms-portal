"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DoctorRecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/records")
            .then(r => r.json())
            .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <PageHeader title="Medical Records" />
            <div className="p-4 md:p-6">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : records.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border">
                        <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No medical records found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Diagnosis</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                            </tr></thead>
                            <tbody>
                                {records.map((r: any) => (
                                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{r.patient?.name || "—"}</td>
                                        <td className="py-3 px-4 text-gray-700 max-w-xs truncate">{r.diagnosis || "—"}</td>
                                        <td className="py-3 px-4 text-gray-600">{formatDate(r.createdAt)}</td>
                                        <td className="py-3 px-4"><StatusBadge status={r.visitType || "OP"} /></td>
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
