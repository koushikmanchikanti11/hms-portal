"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, BedDouble, Settings2 } from "lucide-react";

// DOCTRACK updated bed status colors
const BED_STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
    available: { bg: "bg-white", border: "border-t-emerald-500 border-x-gray-200 border-b-gray-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "Available" },
    occupied: { bg: "bg-white", border: "border-t-red-500 border-x-gray-200 border-b-gray-200", text: "text-red-700", dot: "bg-red-500", label: "Occupied" },
    maintenance: { bg: "bg-white", border: "border-t-amber-500 border-x-gray-200 border-b-gray-200", text: "text-amber-700", dot: "bg-amber-500", label: "Maintenance" },
    reserved: { bg: "bg-white", border: "border-t-blue-500 border-x-gray-200 border-b-gray-200", text: "text-blue-700", dot: "bg-blue-500", label: "Reserved" },
};

export default function BedsPage() {
    const [beds, setBeds] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [wardFilter, setWardFilter] = useState("");
    const [showAddBed, setShowAddBed] = useState(false);
    const [showAssign, setShowAssign] = useState<string | null>(null);
    const [assignPatientId, setAssignPatientId] = useState("");
    const [newBed, setNewBed] = useState({ wardId: "", bedNumber: "", type: "general" });

    const fetchData = async () => {
        const [bedsRes, wardsRes, patientsRes] = await Promise.all([
            fetch(`/api/beds${wardFilter ? `?ward_id=${wardFilter}` : ""}`),
            fetch("/api/beds/wards"),
            fetch("/api/patients"),
        ]);
        if (bedsRes.ok) setBeds(await bedsRes.json());
        if (wardsRes.ok) setWards(await wardsRes.json());
        if (patientsRes.ok) setPatients(await patientsRes.json());
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [wardFilter]);

    const handleAction = async (bedId: string, action: string, extra?: any) => {
        await fetch(`/api/beds/${bedId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ...extra }),
        });
        setShowAssign(null);
        setAssignPatientId("");
        fetchData();
    };

    const handleAddBed = async () => {
        if (!newBed.wardId || !newBed.bedNumber) return;
        await fetch("/api/beds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newBed) });
        setNewBed({ wardId: "", bedNumber: "", type: "general" });
        setShowAddBed(false);
        fetchData();
    };

    const stats = {
        available: beds.filter(b => b.status === "available").length,
        occupied: beds.filter(b => b.status === "occupied").length,
        maintenance: beds.filter(b => b.status === "maintenance").length,
        reserved: beds.filter(b => b.status === "reserved").length,
    };

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <BedDouble className="w-6 h-6 text-[#1A56DB]" />
                    Bed Management
                </h1>
                <div className="flex items-center gap-3">
                    <Link href="/hospital/beds/wards">
                        <Button variant="outline" className="h-9 px-4 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm font-medium">
                            <Settings2 className="w-4 h-4 mr-2" /> Manage Wards
                        </Button>
                    </Link>
                    <Button
                        className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium"
                        onClick={() => setShowAddBed(!showAddBed)}
                    >
                        <Plus className="w-4 h-4" /> Add Bed
                    </Button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats Row */}
                <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-emerald-800">Available: <strong className="font-bold">{stats.available}</strong></span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-red-800">Occupied: <strong className="font-bold">{stats.occupied}</strong></span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-2 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium text-amber-800">Maintenance: <strong className="font-bold">{stats.maintenance}</strong></span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-2 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium text-blue-800">Reserved: <strong className="font-bold">{stats.reserved}</strong></span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setWardFilter("")} className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${!wardFilter ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                        All Wards
                    </button>
                    {wards.map((w: any) => (
                        <button key={w.id} onClick={() => setWardFilter(w.id)} className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${wardFilter === w.id ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                            {w.name}
                        </button>
                    ))}
                </div>

                {/* Add Bed Form */}
                {showAddBed && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-[15px] font-semibold text-gray-900 mb-4 font-dm-sans">Add New Bed</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">Ward</Label>
                                <Select value={newBed.wardId} onValueChange={v => setNewBed({ ...newBed, wardId: v })}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select ward" /></SelectTrigger>
                                    <SelectContent>{wards.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">Bed Number</Label>
                                <Input placeholder="e.g. A-101" value={newBed.bedNumber} onChange={e => setNewBed({ ...newBed, bedNumber: e.target.value })} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">Type</Label>
                                <Select value={newBed.type} onValueChange={v => setNewBed({ ...newBed, type: v })}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>{["general", "semi_private", "private_room", "ICU", "NICU", "HDU", "emergency"].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleAddBed} className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white w-full h-9">Create Bed</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bed Grid */}
                {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" /></div> : beds.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BedDouble className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No beds found.</p>
                        <p className="text-sm text-gray-400 mt-1">Create wards first, then add beds to them.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {beds.map((bed: any) => {
                            const sc = BED_STATUS_COLORS[bed.status] || BED_STATUS_COLORS.available;
                            return (
                                <div key={bed.id} className={`rounded-xl border border-t-4 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col ${sc.bg} ${sc.border}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-base text-gray-900">{bed.bedNumber}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${sc.text}`}>{sc.label}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 capitalize mb-1">{bed.type.replace("_", " ")} &bull; {bed.ward?.name}</p>

                                    <div className="flex-1 mt-2 flex flex-col justify-center">
                                        {bed.status === "occupied" && bed.currentPatient ? (
                                            <div className="bg-gray-50 rounded bg-opacity-50 p-2 border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-800 line-clamp-1" title={bed.currentPatient.name}>{bed.currentPatient.name}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">Admitted</p>
                                            </div>
                                        ) : (
                                            <div className="h-10"></div> // Spacer to keep heights consistent
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        {bed.status === "available" && (
                                            showAssign === bed.id ? (
                                                <div className="space-y-2">
                                                    <Select value={assignPatientId} onValueChange={setAssignPatientId}>
                                                        <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Patient" /></SelectTrigger>
                                                        <SelectContent>{patients.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" className="flex-1 text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(bed.id, "assign", { patientId: assignPatientId })}>Confirm</Button>
                                                        <Button size="sm" variant="ghost" className="px-2 h-7" onClick={() => setShowAssign(null)}>Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" className="w-full text-xs h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => setShowAssign(bed.id)}>
                                                    Assign Patient
                                                </Button>
                                            )
                                        )}
                                        {bed.status === "occupied" && (
                                            <Button size="sm" variant="outline" className="w-full text-xs h-8 border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleAction(bed.id, "discharge")}>
                                                Discharge
                                            </Button>
                                        )}
                                        {bed.status === "maintenance" && (
                                            <Button size="sm" variant="outline" className="w-full text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => handleAction(bed.id, "maintenance", { maintenance: false })}>
                                                Mark Ready
                                            </Button>
                                        )}
                                        {bed.status === "reserved" && (
                                            <Button size="sm" variant="outline" className="w-full text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => handleAction(bed.id, "maintenance", { maintenance: false })}>
                                                Check In
                                            </Button>
                                        )}
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
