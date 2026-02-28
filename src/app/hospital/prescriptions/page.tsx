"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
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
        <>
            <PageHeader title="Prescriptions" action={<Link href="/hospital/prescriptions/new"><Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />New Prescription</Button></Link>} />
            <div className="p-4 md:p-6">
                <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {["", "active", "dispensed", "completed", "cancelled"].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search by patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                    </div>
                </div>
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                    : filtered.length === 0 ? <EmptyState icon={<Pill className="h-12 w-12" />} title={search ? "No matching prescriptions" : "No prescriptions yet"} description={search ? "Try a different search" : "Create your first prescription"} action={!search && <Link href="/hospital/prescriptions/new"><Button className="bg-orange-500 hover:bg-orange-600 text-white">New Prescription</Button></Link>} />
                        : (
                            <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[700px] w-full text-sm">
                                <thead><tr className="border-b bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Medicines</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr></thead>
                                <tbody>{filtered.map(p => (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-500">{formatDate(p.issuedAt)}</td>
                                        <td className="py-3 px-4 font-medium text-gray-900">{p.patient.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{p.doctor?.name || "—"}</td>
                                        <td className="py-3 px-4 text-gray-600">{(p.items as any[])?.length || 0} items</td>
                                        <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                            <Link href={`/hospital/prescriptions/${p.id}`}><Button variant="ghost" size="sm"><Printer className="h-4 w-4" /></Button></Link>
                                            {p.status === "active" && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDispense(p.id)} className="text-green-600 hover:text-green-700">Dispense</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table></div></div>
                        )}
            </div>
        </>
    );
}
