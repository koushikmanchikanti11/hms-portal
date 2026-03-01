"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pill, Plus, Loader2, Search, Minus, Trash2, AlertTriangle, Stethoscope } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

function getStockStatus(m: any): string {
    if (!m.stockQty || m.stockQty === 0) return "critical";
    if (m.expiryDate && new Date(m.expiryDate) < new Date()) return "expired";
    if (m.stockQty <= m.minThreshold * 0.5) return "critical";
    if (m.stockQty <= m.minThreshold) return "low_stock";
    if (m.expiryDate) { const t = new Date(); t.setDate(t.getDate() + 30); if (new Date(m.expiryDate) <= t) return "low_stock"; }
    return "in_stock";
}

export default function PharmacyPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchMedicines = async () => {
        const r = await fetch("/api/pharmacy");
        if (r.ok) setMedicines(await r.json());
        setLoading(false);
    };

    useEffect(() => { fetchMedicines(); }, []);

    const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.genericName && m.genericName.toLowerCase().includes(search.toLowerCase())));
    const lowStockCount = medicines.filter(m => ["critical", "low_stock"].includes(getStockStatus(m))).length;

    const updateStock = async (id: string, delta: number) => {
        await fetch(`/api/pharmacy/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockDelta: delta }) });
        fetchMedicines();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/pharmacy/${deleteId}`, { method: "DELETE" });
        setDeleteId(null);
        fetchMedicines();
    };

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                        <Pill className="w-5 h-5 text-emerald-600 fill-emerald-600/20" />
                    </div>
                    Pharmacy Inventory
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or generic name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-9 border-gray-200 bg-gray-50 shadow-sm rounded-lg focus-visible:ring-[#1A56DB] text-sm"
                        />
                    </div>
                    <Link href="/hospital/pharmacy/new" className="w-full sm:w-auto">
                        <Button className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium">
                            <Plus className="w-4 h-4" /> Add Medicine
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Alerts */}
                {lowStockCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">Low Stock Alert</p>
                            <p className="text-[13px] text-amber-700 font-medium mt-0.5">
                                {lowStockCount} medicines are running low on stock or have reached critical levels.
                            </p>
                        </div>
                    </div>
                )}



                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<Pill className="h-12 w-12 text-emerald-500/50" />}
                        title="No medicines found"
                        description={search ? "Try adjusting your search terms" : "Start building your pharmacy inventory"}
                        action={!search && (
                            <Link href="/hospital/pharmacy/new">
                                <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white">Add First Medicine</Button>
                            </Link>
                        )}
                    />
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200">
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock qty</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                                        <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Unit</th>
                                        <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-gray-900">{m.name}</p>
                                                {m.genericName && <p className="text-[11px] font-medium text-gray-500 mt-0.5">{m.genericName}</p>}
                                            </td>
                                            <td className="py-4 px-5 text-gray-600 font-medium">{m.category || "—"}</td>
                                            <td className="py-4 px-5">
                                                <div className="inline-flex items-center gap-1.5 bg-gray-50 p-1 rounded-md border border-gray-200">
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white hover:shadow-sm disabled:opacity-50 text-gray-500" onClick={() => updateStock(m.id, -1)} disabled={m.stockQty <= 0}>
                                                        <Minus className="h-3.5 w-3.5 text-gray-700" />
                                                    </Button>
                                                    <span className="font-bold text-[13px] w-10 text-center text-gray-900 font-mono tracking-tight">{m.stockQty}</span>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white hover:shadow-sm text-gray-500" onClick={() => updateStock(m.id, 1)}>
                                                        <Plus className="h-3.5 w-3.5 text-gray-700" />
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <StatusBadge status={getStockStatus(m)} />
                                            </td>
                                            <td className="py-4 px-5 text-gray-500 font-medium">
                                                {formatDate(m.expiryDate)}
                                            </td>
                                            <td className="py-4 px-5 text-gray-900 font-medium">
                                                {m.sellingPrice ? formatCurrency(m.sellingPrice) : "—"}
                                                {m.unit && <span className="text-gray-400 text-xs font-normal ml-1">/ {m.unit}</span>}
                                            </td>
                                            <td className="py-4 px-5 text-right space-x-1">
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(m.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Medicine"
                description="Are you sure you want to remove this medicine from inventory? This action cannot be undone."
                onConfirm={handleDelete}
            />
        </div>
    );
}
