"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Stethoscope, Plus, Loader2, Trash2, Phone, Mail, IndianRupee, Clock, Lock, ShieldCheck, Edit } from "lucide-react";

const SPECIALIZATIONS = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Dermatology", "General Medicine", "Gynecology", "Ophthalmology", "ENT", "Psychiatry"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Doctor { id: string; name: string; specialization: string; phone: string | null; email: string | null; availableDays: string[]; consultationFee: string | null; }

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", specialization: "", phone: "", email: "", password: "", consultationFee: "", availableDays: [] as string[] });

    const fetchDoctors = async () => {
        const r = await fetch("/api/doctors");
        if (r.ok) setDoctors(await r.json());
        setLoading(false);
    };

    useEffect(() => { fetchDoctors(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError("");
        const method = editId ? "PATCH" : "POST";
        const url = editId ? `/api/doctors/${editId}` : "/api/doctors";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!res.ok) {
            const d = await res.json();
            setError(d.error || "Failed");
            setCreating(false);
            return;
        }
        setDialogOpen(false);
        setEditId(null);
        setForm({ name: "", specialization: "", phone: "", email: "", password: "", consultationFee: "", availableDays: [] });
        setCreating(false);
        fetchDoctors();
    };

    const handleEdit = (d: Doctor) => {
        setForm({
            name: d.name,
            specialization: d.specialization,
            phone: d.phone || "",
            email: d.email || "",
            password: "",
            consultationFee: d.consultationFee || "",
            availableDays: d.availableDays || [],
        });
        setEditId(d.id);
        setDialogOpen(true);
    };

    const toggleDay = (day: string) => {
        setForm(f => ({ ...f, availableDays: f.availableDays.includes(day) ? f.availableDays.filter(d => d !== day) : [...f.availableDays, day] }));
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/doctors/${deleteId}`, { method: "DELETE" });
        setDeleteId(null);
        fetchDoctors();
    };

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-sky-50 p-1.5 rounded-lg border border-sky-100">
                        <Stethoscope className="w-5 h-5 text-sky-600" />
                    </div>
                    Doctors Directory
                </h1>
                <div className="flex items-center gap-3">
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) {
                            setEditId(null);
                            setForm({ name: "", specialization: "", phone: "", email: "", password: "", consultationFee: "", availableDays: [] });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Add Doctor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-2xl">
                            <DialogHeader className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <DialogTitle className="text-xl font-bold text-gray-900 font-dm-sans">{editId ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
                                <p className="text-[13px] text-gray-500 font-medium">{editId ? "Update the doctor's profile details." : "Create a doctor profile and configure their portal access."}</p>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50/50">
                                {error && (
                                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 shadow-sm">
                                        <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p className="text-sm font-semibold text-red-800">{error}</p>
                                    </div>
                                )}

                                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 font-dm-sans">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[13px] font-bold text-gray-700">Name *</Label>
                                            <Input
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="bg-gray-50/50 h-10 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                                placeholder="Dr. John Doe"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[13px] font-bold text-gray-700">Specialization *</Label>
                                            <Select value={form.specialization} onValueChange={v => setForm({ ...form, specialization: v })}>
                                                <SelectTrigger className="bg-gray-50/50 h-10 border-gray-200 focus:bg-white focus:ring-[#1A56DB]">
                                                    <SelectValue placeholder="Select Specialization" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[13px] font-bold text-gray-700">Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    value={form.phone}
                                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                                    className="pl-9 bg-gray-50/50 h-10 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                                    placeholder="+91..."
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[13px] font-bold text-gray-700">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                                    className="pl-9 bg-gray-50/50 h-10 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                                    placeholder="doctor@hospital.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[13px] font-bold text-gray-700">Consultation Fee</Label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    value={form.consultationFee}
                                                    onChange={e => setForm({ ...form, consultationFee: e.target.value })}
                                                    className="pl-9 bg-gray-50/50 h-10 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                                    placeholder="e.g. 500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-1.5">
                                        <Label className="text-[13px] font-bold text-gray-700">Available Days</Label>
                                        <div className="flex flex-wrap gap-2 pt-1">{DAYS.map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => toggleDay(d)}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${form.availableDays.includes(d) ? "bg-[#1A56DB] text-white border-[#1A56DB]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                {d.slice(0, 3)}
                                            </button>
                                        ))}</div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-indigo-600" />
                                        <h3 className="text-sm font-bold text-indigo-900 font-dm-sans">Doctor Portal Access <span className="text-indigo-600/60 font-medium normal-case ml-1">(Optional)</span></h3>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[13px] font-bold text-indigo-900">Portal Password</Label>
                                        <Input
                                            type="password"
                                            placeholder="Set a password to enable portal login"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="bg-white h-10 border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <p className="text-[12px] text-indigo-700/80 font-medium mt-1.5 leading-relaxed">Requires both email and password. The doctor can then log in at the portal using their email.</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 flex justify-end gap-3">
                                    <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} className="h-10 px-5 font-bold shadow-sm">Cancel</Button>
                                    <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1E40AF] h-10 px-6 font-bold shadow-sm transition-colors" disabled={creating}>
                                        {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (editId ? "Save Changes" : "Add Doctor")}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                    </div>
                ) : doctors.length === 0 ? (
                    <EmptyState
                        icon={<Stethoscope className="h-12 w-12 text-sky-500/50" />}
                        title="No doctors added"
                        description="Start building your hospital's doctor directory."
                        action={
                            <Button onClick={() => setDialogOpen(true)} className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white mt-2">
                                <Plus className="h-4 w-4 mr-2" /> Add First Doctor
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {doctors.map(d => (
                            <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#1A56DB]/30 hover:shadow-md transition-all group overflow-hidden relative">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-[#1A56DB] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                                            <span className="text-sm font-bold text-[#1A56DB]">
                                                {d.name.replace('Dr. ', '').split(" ").map(n => n[0]).join("").substring(0, 2)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-[15px] truncate max-w-[140px]" title={d.name}>{d.name}</p>
                                            <p className="text-[12px] font-medium text-[#1A56DB] mt-0.5 bg-blue-50 inline-block px-2 py-0.5 rounded-md border border-blue-100">{d.specialization}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(d)} className="h-8 w-8 p-0 text-gray-400 hover:text-[#1A56DB] hover:bg-blue-50 transition-all shrink-0">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(d.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2.5 pt-4 border-t border-gray-100">
                                    {d.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <p className="text-[13px] font-medium truncate">{d.phone}</p>
                                        </div>
                                    )}
                                    {d.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <p className="text-[13px] font-medium truncate" title={d.email}>{d.email}</p>
                                        </div>
                                    )}
                                    {d.consultationFee && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <IndianRupee className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <p className="text-[13px] font-bold text-gray-900">{d.consultationFee}</p>
                                        </div>
                                    )}
                                </div>

                                {d.availableDays.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Availability</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {d.availableDays.map(day => (
                                                <span key={day} className="px-2 py-1 rounded-md text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                                                    {day.slice(0, 3)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Remove Doctor"
                description="Are you sure you want to remove this doctor from the directory? This action cannot be undone."
                onConfirm={handleDelete}
            />
        </div>
    );
}
