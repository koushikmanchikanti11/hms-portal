"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function NewRecordPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]); const [doctors, setDoctors] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    const [form, setForm] = useState({ patientId: "", doctorId: "", type: "OP", diagnosis: "", prescription: "", notes: "", admissionDate: "", dischargeDate: "", ward: "", roomNumber: "" });
    useEffect(() => { fetch("/api/patients").then(r => r.json()).then(setPatients); fetch("/api/doctors").then(r => r.json()).then(setDoctors); }, []);
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; } router.push("/hospital/records"); router.refresh(); };

    return (
        <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto page-enter">
            <PageHeader title="New Medical Record" backHref="/hospital/records" />

            <div className="p-6 max-w-3xl mx-auto w-full">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
                                    General Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Patient <span className="text-red-500">*</span></Label>
                                        <Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Select Patient" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Doctor</Label>
                                        <Select value={form.doctorId} onValueChange={v => setForm({ ...form, doctorId: v })}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Select Doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Record Type</Label>
                                        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OP">OP (Outpatient)</SelectItem>
                                                <SelectItem value="IP">IP (Inpatient)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Diagnosis</Label>
                                        <Textarea
                                            value={form.diagnosis}
                                            onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                                            rows={2}
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                            placeholder="Enter initial diagnosis..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Prescription Notes</Label>
                                        <Textarea
                                            value={form.prescription}
                                            onChange={e => setForm({ ...form, prescription: e.target.value })}
                                            rows={2}
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                            placeholder="Medicine names, dosage, duration..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Clinical Notes</Label>
                                        <Textarea
                                            value={form.notes}
                                            onChange={e => setForm({ ...form, notes: e.target.value })}
                                            rows={3}
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                            placeholder="Add comprehensive clinical notes here..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {form.type === "IP" && (
                            <div className="p-6 md:p-8 bg-gray-50/50">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    Inpatient Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Admission Date</Label>
                                        <Input type="date" value={form.admissionDate} onChange={e => setForm({ ...form, admissionDate: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Discharge Date</Label>
                                        <Input type="date" value={form.dischargeDate} onChange={e => setForm({ ...form, dischargeDate: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Ward</Label>
                                        <Input value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" placeholder="e.g. General Ward" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Room Number</Label>
                                        <Input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" placeholder="e.g. 101-A" />
                                    </div>
                                </div>
                            </div>
                        )}

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
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Record"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
