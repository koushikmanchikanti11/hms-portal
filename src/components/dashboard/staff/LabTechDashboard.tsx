"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarDays, ClipboardList, Users, Loader2, ArrowRight, FlaskConical, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LabTechStats {
    orders_today: number;
    reports_today: number;
    total_patients: number;
}

export function LabTechDashboard() {
    const [stats, setStats] = useState<LabTechStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/staff-stats")
            .then(r => r.json())
            .then(d => { setStats(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <PageHeader title="Lab Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
            </>
        );
    }

    const pendingOrders = [
        { id: "LAB-8234", patient: "Michael Johnson", test: "Complete Blood Count", doctor: "Dr. Smith", priority: "Routine" },
        { id: "LAB-8235", patient: "Emily Davis", test: "Lipid Profile", doctor: "Dr. Adams", priority: "Urgent" },
        { id: "LAB-8236", patient: "Robert Brown", test: "Liver Function Test", doctor: "Dr. Smith", priority: "Routine" },
    ];

    const testVolumes = [
        { name: "Blood Tests", count: 145, percentage: 45, color: "bg-red-400" },
        { name: "Urinalysis", count: 86, percentage: 25, color: "bg-amber-400" },
        { name: "Imaging", count: 52, percentage: 15, color: "bg-indigo-400" },
        { name: "Other", count: 30, percentage: 15, color: "bg-gray-300" },
    ];

    return (
        <>
            <PageHeader title="Lab Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <KPICard
                        title="Pending Lab Orders"
                        value={stats?.orders_today ?? 0}
                        subtitle="Today's appointments"
                        icon={CalendarDays}
                        color="amber"
                    />
                    <KPICard
                        title="Reports Today"
                        value={stats?.reports_today ?? 0}
                        subtitle="Records created today"
                        icon={ClipboardList}
                        color="blue"
                    />
                    <KPICard
                        title="Total Patients"
                        value={stats?.total_patients ?? 0}
                        subtitle="In the system"
                        icon={Users}
                        color="indigo"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Lab Orders */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FlaskConical className="h-5 w-5 text-indigo-500" /> Pending Lab Orders
                            </h3>
                            <Link href="/hospital/records" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                View Medical Records <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Details</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient & Doctor</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr></thead>
                                <tbody>
                                    {pendingOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-gray-900">{order.test}</p>
                                                <p className="text-xs text-gray-500 font-mono">{order.id}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">{order.patient}</p>
                                                <p className="text-xs text-gray-500">{order.doctor}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${order.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {order.priority}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">
                                                    <FileCheck2 className="w-3.5 h-3.5 mr-1" /> Add Result
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Test Volumes Distribution */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Distribution (This Month)</h3>
                            <div className="mb-6 flex overflow-hidden rounded-full h-3">
                                {testVolumes.map((item, i) => (
                                    <div key={i} style={{ width: `${item.percentage}%` }} className={item.color} title={item.name} />
                                ))}
                            </div>
                            <div className="space-y-3">
                                {testVolumes.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                            <span className="text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="space-x-3">
                                            <span className="font-medium text-gray-900">{item.count}</span>
                                            <span className="text-gray-400 font-medium text-xs w-10 text-right inline-block">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-sm text-indigo-700 font-medium">🔬 Lab Technician View — Manage incoming orders and upload lab reports directly to Medical Records.</p>
                </div>
            </div>
        </>
    );
}
