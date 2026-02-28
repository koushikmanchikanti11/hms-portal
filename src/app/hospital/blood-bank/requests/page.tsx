"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

const BLOOD_GROUPS = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"];
const LABELS: Record<string, string> = { A_POS: "A+", A_NEG: "A-", B_POS: "B+", B_NEG: "B-", AB_POS: "AB+", AB_NEG: "AB-", O_POS: "O+", O_NEG: "O-" };

export default function BloodRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ patientId: "", bloodGroup: "", unitsNeeded: "", urgency: "routine", notes: "" });

    const fetchData = async () => {
        const [reqRes, patRes] = await Promise.all([fetch("/api/blood-bank/requests"), fetch("/api/patients")]);
        if (reqRes.ok) setRequests(await reqRes.json());
        if (patRes.ok) setPatients(await patRes.json());
        setLoading(false);
    };
    useEffect(() => { fetchData(); }, []);

    const handleAdd = async () => {
        if (!form.patientId || !form.bloodGroup || !form.unitsNeeded) return;
        await fetch("/api/blood-bank/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        setForm({ patientId: "", bloodGroup: "", unitsNeeded: "", urgency: "routine", notes: "" });
        setShowAdd(false);
        fetchData();
    };

    return (
        <>
            <PageHeader title="Blood Requests" backHref="/hospital/blood-bank" action={<Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-2" />New Request</Button>} />
            <div className="p-4 md:p-6 space-y-4">
                {showAdd && (
                    <div className="bg-white rounded-xl border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div><Label>Patient *</Label><Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{patients.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Blood Group *</Label><Select value={form.bloodGroup} onValueChange={v => setForm({ ...form, bloodGroup: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{LABELS[bg]}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Units Needed *</Label><Input type="number" value={form.unitsNeeded} onChange={e => setForm({ ...form, unitsNeeded: e.target.value })} /></div>
                            <div><Label>Urgency</Label><Select value={form.urgency} onValueChange={v => setForm({ ...form, urgency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="routine">Routine</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent></Select></div>
                            <div className="flex items-end"><Button onClick={handleAdd} className="bg-red-500 hover:bg-red-600 text-white w-full">Submit</Button></div>
                        </div>
                    </div>
                )}

                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div> : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Blood Group</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Units</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Urgency</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr></thead>
                            <tbody>{requests.map((r: any) => (
                                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-500">{formatDate(r.requestedAt)}</td>
                                    <td className="py-3 px-4 font-medium">{r.patient?.name || "—"}</td>
                                    <td className="py-3 px-4 font-bold">{LABELS[r.bloodGroup]}</td>
                                    <td className="py-3 px-4">{r.unitsNeeded}</td>
                                    <td className="py-3 px-4"><StatusBadge status={r.urgency} /></td>
                                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
