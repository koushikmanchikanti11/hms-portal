"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Zap } from "lucide-react";

const TRIAGE_OPTIONS = [
    { value: "critical", label: "🔴 CRITICAL", desc: "Immediate life threat", color: "border-red-500 bg-red-50 text-red-700" },
    { value: "urgent", label: "🟠 URGENT", desc: "Serious, <30 min", color: "border-orange-500 bg-orange-50 text-orange-700" },
    { value: "semi_urgent", label: "🟡 SEMI-URGENT", desc: "Stable, <1 hour", color: "border-yellow-500 bg-yellow-50 text-yellow-700" },
    { value: "non_urgent", label: "🟢 NON-URGENT", desc: "Minor, can wait", color: "border-green-500 bg-green-50 text-green-700" },
];

export default function NewEmergencyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [doctors, setDoctors] = useState<any[]>([]);
    const [form, setForm] = useState({
        patientName: "", patientAge: "", patientGender: "", chiefComplaint: "",
        triageLevel: "urgent", vitalsBP: "", vitalsHR: "", vitalsTemp: "", vitalsSpO2: "", vitalsRR: "", doctorId: "",
    });

    useEffect(() => { fetch("/api/doctors").then(r => r.json()).then(setDoctors).catch(() => { }); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await fetch("/api/emergency", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; }
        router.push("/hospital/emergency");
        router.refresh();
    };

    return (
        <>
            <PageHeader title="⚡ New Emergency Case" backHref="/hospital/emergency" />
            <div className="p-4 md:p-6 max-w-2xl">
                <div className="bg-white rounded-xl border p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2"><Label>Patient Name *</Label><Input value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} required placeholder="Full name" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Age</Label><Input type="number" value={form.patientAge} onChange={e => setForm({ ...form, patientAge: e.target.value })} placeholder="Age" /></div>
                                <div><Label>Gender</Label>
                                    <Select value={form.patientGender} onValueChange={v => setForm({ ...form, patientGender: v })}>
                                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                        <SelectContent><SelectItem value="Male">M</SelectItem><SelectItem value="Female">F</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div><Label>Chief Complaint *</Label><Input value={form.chiefComplaint} onChange={e => setForm({ ...form, chiefComplaint: e.target.value })} required placeholder="e.g. Chest pain, Road accident, Seizure" /></div>

                        <div>
                            <Label className="mb-2 block">Triage Level</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {TRIAGE_OPTIONS.map(t => (
                                    <button key={t.value} type="button" onClick={() => setForm({ ...form, triageLevel: t.value })}
                                        className={`p-3 rounded-lg border-2 text-center transition-all ${form.triageLevel === t.value ? t.color + " ring-2 ring-offset-1" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                                        <p className="font-bold text-sm">{t.label}</p>
                                        <p className="text-xs mt-1 opacity-75">{t.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Assign Doctor</Label>
                            <Select value={form.doctorId} onValueChange={v => setForm({ ...form, doctorId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select doctor (optional)" /></SelectTrigger>
                                <SelectContent>{doctors.map((d: any) => <SelectItem key={d.id} value={d.id}>Dr. {d.name} — {d.specialization}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="mb-2 block text-gray-500">Vitals (optional — fill if time permits)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div><Label className="text-xs">BP</Label><Input placeholder="120/80" value={form.vitalsBP} onChange={e => setForm({ ...form, vitalsBP: e.target.value })} className="text-sm" /></div>
                                <div><Label className="text-xs">HR (bpm)</Label><Input type="number" placeholder="72" value={form.vitalsHR} onChange={e => setForm({ ...form, vitalsHR: e.target.value })} className="text-sm" /></div>
                                <div><Label className="text-xs">Temp (°C)</Label><Input type="number" step="0.1" placeholder="37.0" value={form.vitalsTemp} onChange={e => setForm({ ...form, vitalsTemp: e.target.value })} className="text-sm" /></div>
                                <div><Label className="text-xs">SpO2 (%)</Label><Input type="number" placeholder="98" value={form.vitalsSpO2} onChange={e => setForm({ ...form, vitalsSpO2: e.target.value })} className="text-sm" /></div>
                                <div><Label className="text-xs">RR (/min)</Label><Input type="number" placeholder="16" value={form.vitalsRR} onChange={e => setForm({ ...form, vitalsRR: e.target.value })} className="text-sm" /></div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button type="submit" className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Admitting...</> : <><Zap className="mr-2 h-4 w-4" />Admit to Emergency</>}
                            </Button>
                            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Cancel</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
