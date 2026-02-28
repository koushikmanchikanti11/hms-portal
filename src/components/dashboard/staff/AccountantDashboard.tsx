"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrendingUp, Receipt, BarChart2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

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

                {/* Revenue Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Today's Collections</span>
                                <span className="text-sm font-semibold text-green-600">{formatCurrency(stats?.revenue_today ?? 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Pending Bills</span>
                                <span className="text-sm font-semibold text-amber-600">{stats?.pending_bills ?? 0} invoices</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Outstanding Amount</span>
                                <span className="text-sm font-semibold text-red-600">{formatCurrency(stats?.pending_amount ?? 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600">Monthly Revenue</span>
                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(stats?.revenue_this_month ?? 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/hospital/billing" className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors text-sm font-medium text-emerald-700">
                                <Receipt className="h-4 w-4" /> Billing & Invoices
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm text-emerald-700 font-medium">💰 Accountant View — You have full access to Billing, Invoices, and Revenue Reports.</p>
                </div>
            </div>
        </>
    );
}
