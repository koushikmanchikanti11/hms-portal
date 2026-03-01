"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClipboardList, Plus, Loader2, Search, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/records")
            .then(r => r.json())
            .then(d => { setRecords(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
                        <ClipboardList className="w-5 h-5 text-indigo-600" />
                    </div>
                    Medical Records
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search records by patient or diagnosis..."
                            className="w-full pl-10 h-9 border border-gray-200 bg-gray-50 shadow-sm rounded-lg text-sm focus:ring-2 focus:ring-[#1A56DB] focus:border-[#1A56DB] outline-none transition-shadow"
                        />
                    </div>
                    <Link href="/hospital/records/new" className="w-full sm:w-auto">
                        <Button className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium transition-colors">
                            <Plus className="w-4 h-4" /> New Record
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                    </div>
                ) : records.length === 0 ? (
                    <EmptyState
                        icon={<FileText className="h-12 w-12 text-indigo-500/50" />}
                        title="No medical records found"
                        description="Create your first medical record"
                        action={
                            <Link href="/hospital/records/new">
                                <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm mt-2">
                                    <Plus className="w-4 h-4 mr-2" /> Add Record
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200">
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnosis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="py-4 px-5 text-gray-500 font-medium">
                                                {formatDate(r.createdAt)}
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="font-bold text-gray-900">{r.patient?.name || "Unknown"}</div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="text-gray-900 font-medium">{r.doctor?.name || "—"}</div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <StatusBadge status={r.type} />
                                            </td>
                                            <td className="py-4 px-5 max-w-xs">
                                                <div className="truncate text-gray-600 font-medium">
                                                    {r.diagnosis || "—"}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
