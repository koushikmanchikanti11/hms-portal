"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, BedDouble } from "lucide-react";

const BED_STATUS_COLORS: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
    available: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", emoji: "🟢" },
    occupied: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", emoji: "🔴" },
    maintenance: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", emoji: "🟡" },
    reserved: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", emoji: "🔵" },
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
        <>
            <PageHeader title="🛏️ Bed Management" action={
                <div className="flex gap-2">
                    <Link href="/hospital/beds/wards"><Button variant="outline">Manage Wards</Button></Link>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setShowAddBed(!showAddBed)}><Plus className="h-4 w-4 mr-2" />Add Bed</Button>
                </div>
            } />
            <div className="p-4 md:p-6 space-y-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">🟢 Available: {stats.available}</span>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">🔴 Occupied: {stats.occupied}</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">🟡 Maintenance: {stats.maintenance}</span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">🔵 Reserved: {stats.reserved}</span>
                </div>

                {/* Ward Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setWardFilter("")} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${!wardFilter ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>All Wards</button>
                    {wards.map((w: any) => (
                        <button key={w.id} onClick={() => setWardFilter(w.id)} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${wardFilter === w.id ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>{w.name}</button>
                    ))}
                </div>

                {/* Add Bed Form */}
                {showAddBed && (
                    <div className="bg-white rounded-xl border p-4">
                        <h3 className="text-sm font-semibold mb-3">Add New Bed</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div><Label className="text-xs">Ward</Label><Select value={newBed.wardId} onValueChange={v => setNewBed({ ...newBed, wardId: v })}><SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger><SelectContent>{wards.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label className="text-xs">Bed Number</Label><Input placeholder="e.g. A-101" value={newBed.bedNumber} onChange={e => setNewBed({ ...newBed, bedNumber: e.target.value })} /></div>
                            <div><Label className="text-xs">Type</Label><Select value={newBed.type} onValueChange={v => setNewBed({ ...newBed, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["general", "semi_private", "private_room", "ICU", "NICU", "HDU", "emergency"].map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
                            <div className="flex items-end"><Button onClick={handleAddBed} className="bg-orange-500 hover:bg-orange-600 text-white w-full">Add</Button></div>
                        </div>
                    </div>
                )}

                {/* Bed Grid */}
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div> : beds.length === 0 ? (
                    <div className="text-center py-12">
                        <BedDouble className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No beds found. Create wards first, then add beds.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {beds.map((bed: any) => {
                            const sc = BED_STATUS_COLORS[bed.status] || BED_STATUS_COLORS.available;
                            return (
                                <div key={bed.id} className={`rounded-xl border-2 p-3 ${sc.bg} ${sc.border} text-center`}>
                                    <p className="font-bold text-sm">{bed.bedNumber}</p>
                                    <p className="text-xs text-gray-500 capitalize">{bed.type.replace("_", " ")}</p>
                                    <p className="text-lg my-1">{sc.emoji}</p>
                                    {bed.status === "occupied" && bed.currentPatient && (
                                        <p className="text-xs font-medium text-gray-700 truncate">{bed.currentPatient.name}</p>
                                    )}
                                    <p className="text-xs text-gray-400">{bed.ward?.name}</p>
                                    <div className="mt-2">
                                        {bed.status === "available" && (
                                            showAssign === bed.id ? (
                                                <div className="space-y-1">
                                                    <Select value={assignPatientId} onValueChange={setAssignPatientId}><SelectTrigger className="text-xs h-7"><SelectValue placeholder="Patient" /></SelectTrigger><SelectContent>{patients.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
                                                    <Button size="sm" className="w-full text-xs h-6 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleAction(bed.id, "assign", { patientId: assignPatientId })}>Confirm</Button>
                                                </div>
                                            ) : <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => setShowAssign(bed.id)}>Assign</Button>
                                        )}
                                        {bed.status === "occupied" && <Button size="sm" variant="outline" className="w-full text-xs h-7 text-red-600" onClick={() => handleAction(bed.id, "discharge")}>Discharge</Button>}
                                        {bed.status === "maintenance" && <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => handleAction(bed.id, "maintenance", { maintenance: false })}>Mark Ready</Button>}
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
