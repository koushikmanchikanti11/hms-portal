"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrendingUp, Receipt, BarChart2, Loader2, ArrowRight, Download, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AccountantStats {
    revenue_today: number;
    pending_bills: number;
    pending_amount: number;
    revenue_this_month: number;
}

export function AccountantDashboard() {
    const [stats, setStats] = useState<AccountantStats | null>(null);
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
                <PageHeader title="Accounts Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            </>
        );
    }

    const pendingInvoices = [
        { id: "INV-2023-001", patient: "Sarah Connor", amount: 1250.00, due: "Today", type: "Surgery" },
        { id: "INV-2023-002", patient: "John Doe", amount: 450.00, due: "Tomorrow", type: "Consultation & Tests" },
        { id: "INV-2023-003", patient: "Emily Davis", amount: 85.00, due: "In 3 Days", type: "Pharmacy" },
    ];

    const weeklyRevenue = [
        { day: "Mon", amount: 4500, height: "15%" },
        { day: "Tue", amount: 6200, height: "35%" },
        { day: "Wed", amount: 8100, height: "65%" },
        { day: "Thu", amount: 5400, height: "25%" },
        { day: "Fri", amount: 9500, height: "85%" },
        { day: "Sat", amount: 11200, height: "100%" },
        { day: "Sun", amount: 3200, height: "5%" },
    ];

    return (
        <>
            <PageHeader title="Accounts Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <KPICard
                        title="Revenue Today"
                        value={formatCurrency(stats?.revenue_today ?? 0)}
                        subtitle="Collected today"
                        icon={TrendingUp}
                        color="green"
                    />
                    <KPICard
                        title="Pending Payments"
                        value={stats?.pending_bills ?? 0}
                        subtitle={`${formatCurrency(stats?.pending_amount ?? 0)} outstanding`}
                        icon={Receipt}
                        color="amber"
                    />
                    <KPICard
                        title="This Month Revenue"
                        value={formatCurrency(stats?.revenue_this_month ?? 0)}
                        subtitle="Total collected this month"
                        icon={BarChart2}
                        color="blue"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Invoices */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-400" /> Pending Invoices
                            </h3>
                            <Link href="/hospital/billing" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice / Patient</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-end">Amount</th>
                                </tr></thead>
                                <tbody>
                                    {pendingInvoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-gray-900">{inv.patient}</p>
                                                <p className="text-xs text-gray-500 font-mono">{inv.id}</p>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{inv.type}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${inv.due === 'Today' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    {inv.due}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span className="font-semibold text-gray-900">{formatCurrency(inv.amount)}</span>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Revenue Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-600">Today's Collections</span>
                                    <span className="text-sm font-semibold text-green-600">{formatCurrency(stats?.revenue_today ?? 0)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-600">Pending Bills</span>
                                    <span className="text-sm font-semibold text-amber-600">{stats?.pending_bills ?? 0} invoices</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-600">Outstanding Amount</span>
                                    <span className="text-sm font-semibold text-red-600">{formatCurrency(stats?.pending_amount ?? 0)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-gray-50">
                                    <span className="text-sm text-gray-600">Monthly Revenue</span>
                                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(stats?.revenue_this_month ?? 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Mock Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden hidden sm:block">
                            <h3 className="text-sm font-semibold text-gray-900 mb-6">Last 7 Days Revenue</h3>
                            <div className="relative h-24 flex items-end justify-between pt-4">
                                {weeklyRevenue.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center group w-full relative z-10">
                                        <div className="w-full flex justify-center h-24 items-end relative">
                                            <div
                                                className="w-1.5 rounded-t-full bg-blue-500 opacity-80 group-hover:opacity-100 transition-all duration-300"
                                                style={{ height: d.height }}
                                            />
                                            <div className="absolute -top-6 bg-gray-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                {formatCurrency(d.amount)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Area graph styling behind bars */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-100/50 to-transparent pointer-events-none rounded-b-lg mask-area" />
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-50">
                                {weeklyRevenue.map((d, i) => (
                                    <span key={i} className="text-[10px] font-medium text-gray-400 uppercase">{d.day.charAt(0)}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center">
                    <p className="text-sm text-blue-800 font-medium">💰 Accountant View — Manage billing, invoices, and revenue tracking.</p>
                </div>
            </div>
        </>
    );
}
