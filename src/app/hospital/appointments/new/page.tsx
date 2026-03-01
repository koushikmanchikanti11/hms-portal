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

export default function NewAppointmentPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]); const [doctors, setDoctors] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    const [form, setForm] = useState({ patientId: "", doctorId: "", appointmentDate: "", type: "OP", notes: "" });
    useEffect(() => { fetch("/api/patients").then(r => r.json()).then(setPatients); fetch("/api/doctors").then(r => r.json()).then(setDoctors); }, []);
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; } router.push("/hospital/appointments"); router.refresh(); };

    return (
        <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto page-enter">
            <PageHeader title="Book Appointment" backHref="/hospital/appointments" />

            <div className="p-6 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-xl border border-gray-200 shadow-[var(--shadow-sm)] overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-100">

                        {error && (
                            <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="p-6 md:p-8 space-y-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1A56DB]"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M10 14h4" /><path d="M12 12v4" /></svg>
                                Appointment Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Patient <span className="text-red-500">*</span></Label>
                                    <Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}>
                                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                            <SelectValue placeholder="Select Patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.phone})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Doctor <span className="text-red-500">*</span></Label>
                                    <Select value={form.doctorId} onValueChange={v => setForm({ ...form, doctorId: v })}>
                                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                            <SelectValue placeholder="Select Doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialization}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Date & Time <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.appointmentDate}
                                        onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
                                        required
                                        className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Type</Label>
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

                            <div className="space-y-2 mt-6">
                                <Label className="text-gray-700">Notes / Reason for Visit</Label>
                                <Textarea
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Enter reason for visit or other clinical notes..."
                                    className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                />
                            </div>
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
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</> : "Book Appointment"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
