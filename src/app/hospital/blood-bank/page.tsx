"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, AlertTriangle, Droplet, ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/utils";

const BLOOD_GROUPS = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"];
const LABELS: Record<string, string> = { A_POS: "A+", A_NEG: "A-", B_POS: "B+", B_NEG: "B-", AB_POS: "AB+", AB_NEG: "AB-", O_POS: "O+", O_NEG: "O-" };

function getBloodStatus(units: number) {
    if (units === 0) return { bg: "bg-white", border: "border-t-red-500", text: "text-red-600", badge: "bg-red-50 text-red-700 ring-1 ring-red-600/20", label: "Critical", icon: "⚠️" };
    if (units <= 4) return { bg: "bg-white", border: "border-t-amber-500", text: "text-amber-600", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20", label: "Low", icon: "📉" };
    return { bg: "bg-white", border: "border-t-emerald-500", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20", label: "Optimal", icon: "✅" };
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
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-red-50 p-1.5 rounded-lg border border-red-100">
                        <Droplet className="w-5 h-5 text-red-500 fill-red-500/20" />
                    </div>
                    Blood Bank
                </h1>
                <div className="flex items-center gap-3">
                    <Link href="/hospital/blood-bank/requests">
                        <Button variant="outline" className="h-9 px-4 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm font-medium">
                            <ClipboardList className="w-4 h-4 mr-2" /> Requests
                        </Button>
                    </Link>
                    <Button
                        className="bg-red-500 hover:bg-red-600 text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium"
                        onClick={() => setShowAdd(!showAdd)}
                    >
                        <Plus className="w-4 h-4" /> Add Unit
                    </Button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div> : (
                    <>
                        {/* Alerts List */}
                        {data?.expiringSoon?.length > 0 && (
                            <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm flex">
                                <div className="bg-amber-50 border-r border-amber-200 p-4 flex flex-col items-center justify-center min-w-[100px]">
                                    <AlertTriangle className="w-6 h-6 text-amber-500 mb-1" />
                                    <span className="text-sm font-bold text-amber-700 text-center">Expiring<br />Soon</span>
                                </div>
                                <div className="p-4 flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">{data.expiringSoon.length} units expiring within 7 days</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {data.expiringSoon.map((u: any) => (
                                            <div key={u.id} className="text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-lg border border-amber-100 flex justify-between items-center">
                                                <span className="font-bold">{LABELS[u.bloodGroup]}</span>
                                                <span>{u.units} unit(s) &bull; {formatDate(u.expiryDate)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Inventory Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-base font-semibold text-gray-900 font-dm-sans">Inventory by Blood Group</h3>
                                <div className="h-px bg-gray-200 flex-1 ml-4 hidden sm:block"></div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                                {BLOOD_GROUPS.map(bg => {
                                    const units = inventoryMap[bg] || 0;
                                    const status = getBloodStatus(units);
                                    return (
                                        <div key={bg} className={`bg-white rounded-xl border border-gray-200 border-t-4 ${status.border} p-4 text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Droplet className="w-8 h-8 text-gray-900" />
                                            </div>
                                            <p className="text-2xl font-black text-gray-900 mb-0 leading-tight font-dm-sans">{LABELS[bg]}</p>
                                            <p className={`text-3xl font-bold tracking-tight mb-2 ${units === 0 ? "text-gray-300" : "text-gray-900"}`}>{units}</p>
                                            <div className="inline-flex mt-auto">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.badge} flex items-center gap-1`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Add Form */}
                        {showAdd && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-top-4">
                                <h3 className="text-[15px] font-semibold text-gray-900 mb-4 font-dm-sans">Register Blood Unit</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                    <div className="space-y-1.5 lg:col-span-1">
                                        <Label className="text-xs font-medium text-gray-700">Blood Group <span className="text-red-500">*</span></Label>
                                        <Select value={form.bloodGroup} onValueChange={v => setForm({ ...form, bloodGroup: v })}>
                                            <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{LABELS[bg]}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5 lg:col-span-1">
                                        <Label className="text-xs font-medium text-gray-700">Units (bags) <span className="text-red-500">*</span></Label>
                                        <Input type="number" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} placeholder="1" className="h-9" />
                                    </div>
                                    <div className="space-y-1.5 lg:col-span-1">
                                        <Label className="text-xs font-medium text-gray-700">Expiry Date <span className="text-red-500">*</span></Label>
                                        <Input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="h-9" />
                                    </div>
                                    <div className="space-y-1.5 lg:col-span-1">
                                        <Label className="text-xs font-medium text-gray-700">Donor Name</Label>
                                        <Input value={form.donorName} onChange={e => setForm({ ...form, donorName: e.target.value })} placeholder="Optional" className="h-9" />
                                    </div>
                                    <div className="space-y-1.5 lg:col-span-1">
                                        <Label className="text-xs font-medium text-gray-700">Donor Contact</Label>
                                        <Input value={form.donorContact} onChange={e => setForm({ ...form, donorContact: e.target.value })} placeholder="Optional" className="h-9" />
                                    </div>
                                    <div className="flex items-end lg:col-span-1">
                                        <Button onClick={handleAdd} className="bg-red-500 hover:bg-red-600 text-white w-full h-9">Save Unit</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Units Table */}
                        {data?.allUnits?.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="text-[15px] font-semibold text-gray-900 font-dm-sans">Recent Log</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/50">
                                                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Group</th>
                                                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Units</th>
                                                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Donor</th>
                                                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Collected</th>
                                                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Expires</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.allUnits.slice(0, 15).map((u: any) => (
                                                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-3 px-5 font-bold text-gray-900 bg-red-50/30">
                                                        <span className="flex items-center gap-2">
                                                            <Droplet className="w-3.5 h-3.5 text-red-500" />
                                                            {LABELS[u.bloodGroup]}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-5 font-medium text-gray-700">{u.units}</td>
                                                    <td className="py-3 px-5 capitalize">
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${u.status === "available" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
                                                            {u.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-5 text-gray-600">{u.donorName || <span className="text-gray-400 italic">Unknown</span>}</td>
                                                    <td className="py-3 px-5 text-gray-500">{formatDate(u.collectedAt)}</td>
                                                    <td className="py-3 px-5 text-gray-500">{formatDate(u.expiryDate)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
