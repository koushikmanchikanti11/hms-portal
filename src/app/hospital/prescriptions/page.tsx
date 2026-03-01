"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pill, Plus, Search, Loader2, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Prescription {
    id: string;
    status: string;
    issuedAt: string;
    notes: string | null;
    items: any[];
    patient: { id: string; name: string; phone: string };
    doctor: { id: string; name: string; specialization: string } | null;
}

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchPrescriptions = async () => {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        const res = await fetch(`/api/prescriptions?${params}`);
        if (res.ok) setPrescriptions(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchPrescriptions(); }, [statusFilter]);

    const filtered = prescriptions.filter(p =>
        p.patient.name.toLowerCase().includes(search.toLowerCase()) ||
        p.doctor?.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDispense = async (id: string) => {
        if (!confirm("Dispense this prescription? This will deduct stock from pharmacy.")) return;
        await fetch(`/api/prescriptions/${id}/dispense`, { method: "PATCH" });
        fetchPrescriptions();
    };

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                        <Pill className="w-5 h-5 text-purple-600 fill-purple-600/20" />
                    </div>
                    Prescriptions
                </h1>
                <div className="flex items-center gap-3">
                    <Link href="/hospital/prescriptions/new">
                        <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium">
                            <Plus className="w-4 h-4" /> New Prescription
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {["", "active", "dispensed", "completed", "cancelled"].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${statusFilter === s ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                            >
                                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Status"}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by patient or doctor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 h-10 border-gray-200 bg-white shadow-sm rounded-lg focus-visible:ring-[#1A56DB]"
                        />
                    </div>
                </div>

                {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" /></div>
                    : filtered.length === 0 ? <EmptyState icon={<Pill className="w-12 h-12 text-gray-400" />} title={search ? "No matching prescriptions" : "No prescriptions yet"} description={search ? "Try a different search" : "Create your first prescription"} action={!search && <Link href="/hospital/prescriptions/new"><Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white">New Prescription</Button></Link>} />
                        : (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[700px] w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/50">
                                                <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                                <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                                <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Medicines</th>
                                                <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filtered.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-3.5 px-5 text-gray-500 font-medium">{formatDate(p.issuedAt)}</td>
                                                    <td className="py-3.5 px-5 font-bold text-gray-900">{p.patient.name}</td>
                                                    <td className="py-3.5 px-5 text-gray-600">{p.doctor?.name || "—"}</td>
                                                    <td className="py-3.5 px-5 text-gray-600 font-medium">
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                                            {(p.items as any[])?.length || 0} items
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-5"><StatusBadge status={p.status} /></td>
                                                    <td className="py-3.5 px-5 text-right space-x-2">
                                                        {p.status === "active" && (
                                                            <Button variant="outline" size="sm" onClick={() => handleDispense(p.id)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs font-semibold">
                                                                Dispense
                                                            </Button>
                                                        )}
                                                        <Link href={`/hospital/prescriptions/${p.id}`}>
                                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                                                <Printer className="w-4 h-4" />
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
