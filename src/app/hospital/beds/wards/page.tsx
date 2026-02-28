"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function WardsPage() {
    const [wards, setWards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [floor, setFloor] = useState("");
    const [showAdd, setShowAdd] = useState(false);

    const fetchWards = async () => { const res = await fetch("/api/beds/wards"); if (res.ok) setWards(await res.json()); setLoading(false); };
    useEffect(() => { fetchWards(); }, []);

    const handleAdd = async () => {
        if (!name.trim()) return;
        await fetch("/api/beds/wards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, floor }) });
        setName(""); setFloor(""); setShowAdd(false); fetchWards();
    };

    return (
        <>
            <PageHeader title="Ward Management" backHref="/hospital/beds" action={<Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-2" />Add Ward</Button>} />
            <div className="p-4 md:p-6 space-y-4">
                {showAdd && (
                    <div className="bg-white rounded-xl border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div><Label>Ward Name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. General Ward A" /></div>
                            <div><Label>Floor</Label><Input value={floor} onChange={e => setFloor(e.target.value)} placeholder="e.g. 2nd Floor" /></div>
                            <div className="flex items-end"><Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600 text-white w-full">Create Ward</Button></div>
                        </div>
                    </div>
                )}

                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div> : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ward Name</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Floor</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Beds</th>
                            </tr></thead>
                            <tbody>{wards.map((w: any) => (
                                <tr key={w.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{w.name}</td>
                                    <td className="py-3 px-4 text-gray-500">{w.floor || "—"}</td>
                                    <td className="py-3 px-4 text-gray-500">{w._count?.beds || 0}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
