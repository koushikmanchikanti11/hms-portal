"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

const STATUS_CONFIGS: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
    full: { bg: "bg-green-50", border: "border-green-400", text: "text-green-700", emoji: "🟢" },
    in_use: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700", emoji: "🔵" },
    empty: { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", emoji: "🔴" },
    under_refill: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", emoji: "🟡" },
    maintenance: { bg: "bg-gray-50", border: "border-gray-400", text: "text-gray-700", emoji: "⚙️" },
    condemned: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-500", emoji: "❌" },
};

const SIZE_LABELS: Record<string, string> = { B_TYPE: "B (200L)", D_TYPE: "D (425L)", E_TYPE: "E (680L)", G_TYPE: "G (6800L)" };

export default function OxygenPage() {
    const [cylinders, setCylinders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ cylinderCode: "", size: "D_TYPE", pressureBar: "", supplierName: "" });

    const fetchData = async () => {
        const params = statusFilter ? `?status=${statusFilter}` : "";
        const res = await fetch(`/api/oxygen${params}`);
        if (res.ok) setCylinders(await res.json());
        setLoading(false);
    };
    useEffect(() => { fetchData(); }, [statusFilter]);

    const handleAdd = async () => {
        if (!form.cylinderCode) return;
        const res = await fetch("/api/oxygen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { setForm({ cylinderCode: "", size: "D_TYPE", pressureBar: "", supplierName: "" }); setShowAdd(false); fetchData(); }
    };

    const handleStatusChange = async (id: string, status: string) => {
        await fetch(`/api/oxygen/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
        fetchData();
    };

    const stats = Object.fromEntries(Object.keys(STATUS_CONFIGS).map(s => [s, cylinders.filter(c => c.status === s).length]));

    return (
        <>
            <PageHeader title="🫁 Oxygen Cylinders" action={<Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-2" />Add Cylinder</Button>} />
            <div className="p-4 md:p-6 space-y-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-2 text-sm">
                    {Object.entries(STATUS_CONFIGS).map(([status, conf]) => (
                        <span key={status} className={`px-3 py-1 rounded-full font-medium ${conf.bg} ${conf.text}`}>
                            {conf.emoji} {status.replace("_", " ")}: {stats[status] || 0}
                        </span>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setStatusFilter("")} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${!statusFilter ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>All</button>
                    {Object.keys(STATUS_CONFIGS).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${statusFilter === s ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>{s.replace("_", " ")}</button>
                    ))}
                </div>

                {/* Add Form */}
                {showAdd && (
                    <div className="bg-white rounded-xl border p-4">
                        <h3 className="text-sm font-semibold mb-3">Add Cylinder</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div><Label className="text-xs">Code *</Label><Input value={form.cylinderCode} onChange={e => setForm({ ...form, cylinderCode: e.target.value })} placeholder="e.g. OX-001" /></div>
                            <div><Label className="text-xs">Size</Label><Select value={form.size} onValueChange={v => setForm({ ...form, size: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(SIZE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label className="text-xs">Pressure (Bar)</Label><Input type="number" value={form.pressureBar} onChange={e => setForm({ ...form, pressureBar: e.target.value })} placeholder="150" /></div>
                            <div><Label className="text-xs">Supplier</Label><Input value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} placeholder="Optional" /></div>
                            <div className="flex items-end"><Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600 text-white w-full">Add</Button></div>
                        </div>
                    </div>
                )}

                {/* Cylinder Grid */}
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div> : cylinders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No oxygen cylinders found. Add your first cylinder.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {cylinders.map((cyl: any) => {
                            const sc = STATUS_CONFIGS[cyl.status] || STATUS_CONFIGS.full;
                            return (
                                <div key={cyl.id} className={`rounded-xl border-2 p-4 text-center ${sc.bg} ${sc.border}`}>
                                    <p className="font-bold text-sm">{cyl.cylinderCode}</p>
                                    <p className="text-xs text-gray-500">{SIZE_LABELS[cyl.size] || cyl.size}</p>
                                    <p className="text-2xl my-2">{sc.emoji}</p>
                                    <p className={`text-xs font-medium capitalize ${sc.text}`}>{cyl.status.replace("_", " ")}</p>
                                    {cyl.pressureBar && <p className="text-xs text-gray-400 mt-1">{cyl.pressureBar} bar</p>}
                                    {cyl.assignedTo && <p className="text-xs text-gray-600 mt-1 truncate">{cyl.assignedTo}</p>}
                                    <div className="mt-2">
                                        <Select onValueChange={v => handleStatusChange(cyl.id, v)}>
                                            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Change status" /></SelectTrigger>
                                            <SelectContent>{Object.keys(STATUS_CONFIGS).map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
