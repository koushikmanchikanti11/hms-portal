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
        <>
            <PageHeader title="New Prescription" backHref="/hospital/prescriptions" />
            <div className="p-4 md:p-6 max-w-4xl">
                <div className="bg-white rounded-xl border p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Patient *</Label>
                                <Select value={patientId} onValueChange={setPatientId}>
                                    <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                                    <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {p.phone}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Doctor</Label>
                                <Select value={doctorId} onValueChange={setDoctorId}>
                                    <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                                    <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>Dr. {d.name} — {d.specialization}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Valid Until</Label>
                                <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-700">Medicines</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Add Medicine</Button>
                            </div>
                            <div className="space-y-4">
                                {items.map((item, i) => (
                                    <div key={i} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium text-gray-500">Medicine #{i + 1}</span>
                                            {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4 text-red-400" /></Button>}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            <div>
                                                <Label className="text-xs">Medicine</Label>
                                                <Select value={item.medicineId} onValueChange={v => updateItem(i, "medicineId", v)}>
                                                    <SelectTrigger className="text-sm"><SelectValue placeholder="Select or type" /></SelectTrigger>
                                                    <SelectContent>{medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                                {!item.medicineId && <Input placeholder="Or type name" value={item.medicineName} onChange={e => updateItem(i, "medicineName", e.target.value)} className="mt-1 text-sm" />}
                                            </div>
                                            <div><Label className="text-xs">Dosage</Label><Input placeholder="e.g. 500mg" value={item.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} className="text-sm" /></div>
                                            <div><Label className="text-xs">Frequency</Label><Input placeholder="e.g. 3x daily" value={item.frequency} onChange={e => updateItem(i, "frequency", e.target.value)} className="text-sm" /></div>
                                            <div><Label className="text-xs">Duration</Label><Input placeholder="e.g. 5 days" value={item.duration} onChange={e => updateItem(i, "duration", e.target.value)} className="text-sm" /></div>
                                            <div><Label className="text-xs">Quantity</Label><Input type="number" placeholder="0" value={item.quantity || ""} onChange={e => updateItem(i, "quantity", Number(e.target.value))} className="text-sm" /></div>
                                            <div><Label className="text-xs">Instructions</Label><Input placeholder="e.g. After food" value={item.instructions} onChange={e => updateItem(i, "instructions", e.target.value)} className="text-sm" /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional instructions..." />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button type="submit" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" disabled={loading}>
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Generate Prescription"}
                            </Button>
                            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Cancel</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
