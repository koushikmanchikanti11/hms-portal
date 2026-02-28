"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const BLOOD_GROUPS = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"];
const LABELS: Record<string, string> = { A_POS: "A+", A_NEG: "A-", B_POS: "B+", B_NEG: "B-", AB_POS: "AB+", AB_NEG: "AB-", O_POS: "O+", O_NEG: "O-" };

function getBloodStatus(units: number) {
    if (units === 0) return { color: "bg-red-50 border-red-400 text-red-700", label: "Critical", ring: "ring-red-300" };
    if (units <= 4) return { color: "bg-amber-50 border-amber-400 text-amber-700", label: "Low", ring: "ring-amber-300" };
    return { color: "bg-green-50 border-green-400 text-green-700", label: "OK", ring: "ring-green-300" };
}

export default function BloodBankPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ bloodGroup: "", units: "", donorName: "", donorContact: "", expiryDate: "", notes: "" });

    const fetchData = async () => {
        const res = await fetch("/api/blood-bank");
        if (res.ok) setData(await res.json());
        setLoading(false);
    };
    useEffect(() => { fetchData(); }, []);

    const handleAdd = async () => {
        if (!form.bloodGroup || !form.units || !form.expiryDate) return;
        await fetch("/api/blood-bank", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        setForm({ bloodGroup: "", units: "", donorName: "", donorContact: "", expiryDate: "", notes: "" });
        setShowAdd(false);
        fetchData();
    };

    const inventoryMap: Record<string, number> = {};
    if (data?.inventory) {
        for (const item of data.inventory) {
            inventoryMap[item.bloodGroup] = (inventoryMap[item.bloodGroup] || 0) + (item._sum.units || 0);
        }
    }

    return (
        <>
            <PageHeader title="🩸 Blood Bank" action={
                <div className="flex gap-2">
                    <Link href="/hospital/blood-bank/requests"><Button variant="outline">Requests</Button></Link>
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-2" />Add Blood Unit</Button>
                </div>
            } />
            <div className="p-4 md:p-6 space-y-6">
                {/* Inventory Grid */}
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div> : (
                    <>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">INVENTORY BY BLOOD GROUP</h3>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                {BLOOD_GROUPS.map(bg => {
                                    const units = inventoryMap[bg] || 0;
                                    const status = getBloodStatus(units);
                                    return (
                                        <div key={bg} className={`rounded-xl border-2 p-4 text-center ${status.color}`}>
                                            <p className="text-lg font-bold">{LABELS[bg]}</p>
                                            <p className="text-2xl font-bold mt-1">{units}u</p>
                                            <p className="text-xs mt-1 font-medium">{status.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Alerts */}
                        {data?.expiringSoon?.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-semibold text-amber-700">⚠️ EXPIRING WITHIN 7 DAYS: {data.expiringSoon.length} units</span>
                                </div>
                                <div className="space-y-1">
                                    {data.expiringSoon.map((u: any) => (
                                        <p key={u.id} className="text-xs text-amber-600">{LABELS[u.bloodGroup]} — {u.units} units — Expires: {formatDate(u.expiryDate)}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Add Form */}
                {showAdd && (
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Blood Unit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><Label>Blood Group *</Label><Select value={form.bloodGroup} onValueChange={v => setForm({ ...form, bloodGroup: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{LABELS[bg]}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Units (bags) *</Label><Input type="number" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} placeholder="1" /></div>
                            <div><Label>Expiry Date *</Label><Input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
                            <div><Label>Donor Name</Label><Input value={form.donorName} onChange={e => setForm({ ...form, donorName: e.target.value })} placeholder="Optional" /></div>
                            <div><Label>Donor Contact</Label><Input value={form.donorContact} onChange={e => setForm({ ...form, donorContact: e.target.value })} placeholder="Optional" /></div>
                            <div className="flex items-end"><Button onClick={handleAdd} className="bg-red-500 hover:bg-red-600 text-white w-full">Add</Button></div>
                        </div>
                    </div>
                )}

                {/* All Units table */}
                {data?.allUnits?.length > 0 && (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Blood Group</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Units</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Donor</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Collected</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Expires</th>
                            </tr></thead>
                            <tbody>{data.allUnits.map((u: any) => (
                                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-bold">{LABELS[u.bloodGroup]}</td>
                                    <td className="py-3 px-4">{u.units}</td>
                                    <td className="py-3 px-4 capitalize"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{u.status}</span></td>
                                    <td className="py-3 px-4 text-gray-500">{u.donorName || "—"}</td>
                                    <td className="py-3 px-4 text-gray-500">{formatDate(u.collectedAt)}</td>
                                    <td className="py-3 px-4 text-gray-500">{formatDate(u.expiryDate)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
