"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface PrescriptionItem {
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
}

const emptyItem: PrescriptionItem = { medicineId: "", medicineName: "", dosage: "", frequency: "", duration: "", instructions: "", quantity: 0 };

export default function NewPrescriptionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);

    const [patientId, setPatientId] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<PrescriptionItem[]>([{ ...emptyItem }]);

    useEffect(() => {
        Promise.all([
            fetch("/api/patients").then(r => r.json()),
            fetch("/api/doctors").then(r => r.json()),
            fetch("/api/pharmacy").then(r => r.json()),
        ]).then(([p, d, m]) => {
            setPatients(p);
            setDoctors(d);
            setMedicines(Array.isArray(m) ? m : []);
        });
    }, []);

    const updateItem = (index: number, field: keyof PrescriptionItem, value: string | number) => {
        const updated = [...items];
        (updated[index] as any)[field] = value;
        if (field === "medicineId") {
            const med = medicines.find(m => m.id === value);
            if (med) updated[index].medicineName = med.name;
        }
        setItems(updated);
    };

    const addItem = () => setItems([...items, { ...emptyItem }]);
    const removeItem = (index: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const validItems = items.filter(i => i.medicineName.trim());
        if (!patientId || validItems.length === 0) {
            setError("Patient and at least one medicine required");
            setLoading(false);
            return;
        }

        const res = await fetch("/api/prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, doctorId: doctorId || null, items: validItems, validUntil: validUntil || null, notes: notes || null }),
        });

        if (!res.ok) {
            const d = await res.json();
            setError(d.error || "Failed");
            setLoading(false);
            return;
        }
        router.push("/hospital/prescriptions");
        router.refresh();
    };

    return (
        <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto page-enter">
            <PageHeader title="New Prescription" backHref="/hospital/prescriptions" />

            <div className="p-6 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-xl border border-gray-200 shadow-[var(--shadow-sm)] overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
                        {error && (
                            <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="p-6 md:p-8 space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1A56DB]"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
                                    Prescription Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Patient <span className="text-red-500">*</span></Label>
                                        <Select value={patientId} onValueChange={setPatientId}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Select Patient" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {p.phone}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Doctor</Label>
                                        <Select value={doctorId} onValueChange={setDoctorId}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Select Doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors.map(d => <SelectItem key={d.id} value={d.id}>Dr. {d.name} — {d.specialization}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Valid Until</Label>
                                        <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
                                            Prescribed Medicines
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">Add medicines from inventory or type manually.</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="border-[#1A56DB] text-[#1A56DB] hover:bg-blue-50">
                                        <Plus className="h-4 w-4 mr-1.5" /> Add Medicine
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item, i) => (
                                        <div key={i} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm relative group overflow-hidden">
                                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-[#1A56DB] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                                <span className="text-sm font-bold text-gray-700">Medicine #{i + 1}</span>
                                                {items.length > 1 && (
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 px-2">
                                                        <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                                                <div className="lg:col-span-2">
                                                    <Label className="text-[13px]">Medicine Name</Label>
                                                    <div className="space-y-2 mt-1">
                                                        <Select value={item.medicineId} onValueChange={v => updateItem(i, "medicineId", v)}>
                                                            <SelectTrigger className="h-9 bg-gray-50 border-gray-200 focus:bg-white text-sm">
                                                                <SelectValue placeholder="Select from inventory" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        {!item.medicineId && (
                                                            <Input
                                                                placeholder="Or type manual name"
                                                                value={item.medicineName}
                                                                onChange={e => updateItem(i, "medicineName", e.target.value)}
                                                                className="h-9 bg-gray-50 border-gray-200 text-sm focus:bg-white"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[13px]">Dosage</Label>
                                                    <Input placeholder="e.g. 500mg" value={item.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} className="h-9 mt-1 bg-gray-50 border-gray-200 text-sm focus:bg-white" />
                                                </div>
                                                <div>
                                                    <Label className="text-[13px]">Frequency</Label>
                                                    <Input placeholder="e.g. 1-0-1" value={item.frequency} onChange={e => updateItem(i, "frequency", e.target.value)} className="h-9 mt-1 bg-gray-50 border-gray-200 text-sm focus:bg-white" />
                                                </div>
                                                <div>
                                                    <Label className="text-[13px]">Duration</Label>
                                                    <Input placeholder="e.g. 5 days" value={item.duration} onChange={e => updateItem(i, "duration", e.target.value)} className="h-9 mt-1 bg-gray-50 border-gray-200 text-sm focus:bg-white" />
                                                </div>
                                                <div>
                                                    <Label className="text-[13px] whitespace-nowrap">Quantity</Label>
                                                    <Input type="number" placeholder="Total units" value={item.quantity || ""} onChange={e => updateItem(i, "quantity", Number(e.target.value))} className="h-9 mt-1 bg-gray-50 border-gray-200 text-sm focus:bg-white" />
                                                </div>
                                                <div className="lg:col-span-6">
                                                    <Label className="text-[13px]">Instructions</Label>
                                                    <Input placeholder="e.g. After food with warm water" value={item.instructions} onChange={e => updateItem(i, "instructions", e.target.value)} className="h-9 mt-1 bg-gray-50 border-gray-200 text-sm focus:bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 bg-gray-50/50">
                            <Label className="text-gray-700 font-semibold mb-2 block">General Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Additional instructions, diet plans, review dates..."
                                className="bg-white border-gray-200 focus:ring-[#1A56DB] resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col-reverse justify-between sm:flex-row sm:items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="w-full sm:w-auto text-gray-600 border-gray-300 hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm"
                            >
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : "Generate Prescription"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
