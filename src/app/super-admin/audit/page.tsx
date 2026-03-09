"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2, Activity } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/utils";

interface AuditLog {
    id: string;
    hospital: { name: string } | null;
    userName: string;
    userRole: string;
    action: string;
    model: string;
    recordId: string;
    ipAddress: string | null;
    createdAt: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/admin/audit");
                if (res.ok) {
                    setLogs(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch audit logs");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <>
            <PageHeader title="Platform Audit Logs" />

            <div className="p-4 md:p-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center flex-col items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB] mb-4" />
                        <p className="text-gray-500">Loading system activity...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <EmptyState
                        icon={<Activity className="h-12 w-12 text-gray-400" />}
                        title="No Audit Logs"
                        description="There is no recorded activity in the system yet."
                    />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Timestamp</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Hospital</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">User</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Action</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Module</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Record ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {formatDateTime(log.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">{log.hospital?.name || "System"}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{log.userName}</span>
                                                    <span className="text-xs text-gray-500 capitalize">{log.userRole.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                                                    ${log.action === 'CREATE' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' :
                                                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' :
                                                            log.action === 'DELETE' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20' :
                                                                'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono text-xs uppercase">
                                                {log.model}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs truncate max-w-[120px]" title={log.recordId}>
                                                {log.recordId}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
