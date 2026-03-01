"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Wind } from "lucide-react";

// DOCTRACK updated status colors
const STATUS_CONFIGS: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
    full: { bg: "bg-white", border: "border-t-emerald-500", text: "text-emerald-700", dot: "bg-emerald-500", label: "Full" },
    in_use: { bg: "bg-white", border: "border-t-[#1A56DB]", text: "text-[#1A56DB]", dot: "bg-[#1A56DB]", label: "In Use" },
    empty: { bg: "bg-white", border: "border-t-red-500", text: "text-red-700", dot: "bg-red-500", label: "Empty" },
    under_refill: { bg: "bg-white", border: "border-t-amber-500", text: "text-amber-700", dot: "bg-amber-500", label: "Refilling" },
    maintenance: { bg: "bg-white", border: "border-t-purple-500", text: "text-purple-700", dot: "bg-purple-500", label: "Maintenance" },
    condemned: { bg: "bg-white", border: "border-t-slate-500", text: "text-slate-600", dot: "bg-slate-500", label: "Condemned" },
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
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-sky-50 p-1.5 rounded-lg border border-sky-100">
                        <Wind className="w-5 h-5 text-sky-500 fill-sky-500/20" />
                    </div>
                    Oxygen Cylinders
                </h1>
                <div className="flex items-center gap-3">
                    <Button
                        className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium"
                        onClick={() => setShowAdd(!showAdd)}
                    >
                        <Plus className="w-4 h-4" /> Add Cylinder
                    </Button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="flex flex-wrap gap-3">
                    {Object.entries(STATUS_CONFIGS).map(([status, conf]) => {
                        const count = stats[status] || 0;
                        if (count === 0 && status !== 'full' && status !== 'in_use' && status !== 'empty') return null;

                        return (
                            <div key={status} className="px-4 py-2 rounded-lg bg-white border border-gray-200 flex items-center gap-2 shadow-sm min-w-[120px]">
                                <span className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                                <span className="text-sm font-medium text-gray-600">{conf.label}: <strong className={`font-bold ml-1 ${conf.text}`}>{count}</strong></span>
                            </div>
                        );
                    })}
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setStatusFilter("")} className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${!statusFilter ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                        All
                    </button>
                    {Object.entries(STATUS_CONFIGS).map(([s, conf]) => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${statusFilter === s ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                            {conf.label}
                        </button>
                    ))}
                </div>

                {/* Add Form */}
                {showAdd && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-[15px] font-semibold text-gray-900 mb-4 font-dm-sans">Register Oxygen Cylinder</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-1.5 lg:col-span-1">
                                <Label className="text-xs font-medium text-gray-700">Cylinder Code <span className="text-red-500">*</span></Label>
                                <Input value={form.cylinderCode} onChange={e => setForm({ ...form, cylinderCode: e.target.value })} placeholder="OX-001" className="h-9" />
                            </div>
                            <div className="space-y-1.5 lg:col-span-1">
                                <Label className="text-xs font-medium text-gray-700">Size</Label>
                                <Select value={form.size} onValueChange={v => setForm({ ...form, size: v })}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SIZE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 lg:col-span-1">
                                <Label className="text-xs font-medium text-gray-700">Pressure (Bar)</Label>
                                <Input type="number" value={form.pressureBar} onChange={e => setForm({ ...form, pressureBar: e.target.value })} placeholder="150" className="h-9" />
                            </div>
                            <div className="space-y-1.5 lg:col-span-1">
                                <Label className="text-xs font-medium text-gray-700">Supplier Name</Label>
                                <Input value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} placeholder="Optional" className="h-9" />
                            </div>
                            <div className="flex items-end lg:col-span-1">
                                <Button onClick={handleAdd} className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white w-full h-9">Save Cylinder</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cylinder Grid */}
                {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" /></div> : cylinders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wind className="w-8 h-8 text-sky-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No oxygen cylinders found.</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first cylinder to start tracking inventory.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {cylinders.map((cyl: any) => {
                            const sc = STATUS_CONFIGS[cyl.status] || STATUS_CONFIGS.full;
                            return (
                                <div key={cyl.id} className={`bg-white rounded-xl border border-gray-200 border-t-4 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col ${sc.border}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-base text-gray-900 font-mono tracking-tight">{cyl.cylinderCode}</p>
                                        <div className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                            {SIZE_LABELS[cyl.size] ? SIZE_LABELS[cyl.size].split(' ')[0] : cyl.size}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-3">
                                        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${sc.text}`}>{sc.label}</span>
                                    </div>

                                    <div className="flex-1 bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex flex-col justify-center">
                                        {cyl.pressureBar ? (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pressure</span>
                                                <span className={`font-mono text-sm font-bold ${Number(cyl.pressureBar) < 50 ? 'text-red-600' : 'text-gray-900'}`}>{cyl.pressureBar} <span className="text-[10px] text-gray-500 font-normal">BAR</span></span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic text-center">No reading</span>
                                        )}
                                    </div>

                                    {cyl.assignedTo ? (
                                        <p className="text-[11px] text-gray-600 mt-3 truncate font-medium bg-gray-100/50 px-2 py-1 rounded" title={cyl.assignedTo}>
                                            <span className="text-gray-400 mr-1">@</span>{cyl.assignedTo}
                                        </p>
                                    ) : (
                                        <div className="h-[26px] mt-3"></div>
                                    )}

                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <Select onValueChange={v => handleStatusChange(cyl.id, v)} defaultValue={cyl.status}>
                                            <SelectTrigger className="h-8 text-xs border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(STATUS_CONFIGS).map(([s, conf]) => (
                                                    <SelectItem key={s} value={s}>
                                                        <span className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                                                            {conf.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
