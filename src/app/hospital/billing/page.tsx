"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Plus, Loader2, Eye, Filter } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function BillingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        fetch(`/api/billing?${params}`)
            .then(r => r.json())
            .then(d => { setInvoices(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [statusFilter]);

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-[#1A56DB]/10 p-1.5 rounded-lg border border-[#1A56DB]/20">
                        <Receipt className="w-5 h-5 text-[#1A56DB]" />
                    </div>
                    Billing & Invoices
                </h1>
                <div className="flex items-center gap-3">
                    <Link href="/hospital/billing/new">
                        <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium transition-colors">
                            <Plus className="w-4 h-4" /> Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Toolbar */}
                <div className="flex justify-end relative">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-700">Filter Status:</span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] h-9 bg-white border-gray-200 shadow-sm focus:ring-[#1A56DB] focus:border-[#1A56DB]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-medium text-gray-700">All Statuses</SelectItem>
                                <SelectItem value="pending" className="font-medium text-amber-700">Pending</SelectItem>
                                <SelectItem value="partial" className="font-medium text-blue-700">Partial</SelectItem>
                                <SelectItem value="paid" className="font-medium text-emerald-700">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                    </div>
                ) : invoices.length === 0 ? (
                    <EmptyState
                        icon={<Receipt className="h-12 w-12 text-[#1A56DB]/50" />}
                        title="No invoices found"
                        description={statusFilter !== 'all' ? "No invoices match the selected filter." : "Create your first invoice"}
                        action={
                            statusFilter === 'all' && (
                                <Link href="/hospital/billing/new">
                                    <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm mt-2">
                                        <Plus className="w-4 h-4 mr-2" /> Create First Invoice
                                    </Button>
                                </Link>
                            )
                        }
                    />
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200">
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice #</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                                        <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                                        <th className="text-center py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="py-4 px-5">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-gray-100 text-gray-700 ring-1 ring-gray-200">
                                                    {inv.invoiceNumber}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-gray-900">{inv.patient?.name || "Unknown Patient"}</p>
                                            </td>
                                            <td className="py-4 px-5 text-right font-medium text-gray-900">
                                                {formatCurrency(inv.totalAmount)}
                                            </td>
                                            <td className="py-4 px-5 text-right font-medium text-emerald-600">
                                                {formatCurrency(inv.paidAmount)}
                                            </td>
                                            <td className="py-4 px-5 text-right font-bold text-red-600">
                                                {formatCurrency(Number(inv.totalAmount) - Number(inv.paidAmount))}
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <StatusBadge status={inv.status} />
                                            </td>
                                            <td className="py-4 px-5 text-gray-500 font-medium">
                                                {formatDate(inv.createdAt)}
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <Link href={`/hospital/billing/${inv.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-[#1A56DB] hover:bg-blue-50 transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
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
