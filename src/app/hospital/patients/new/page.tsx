"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UserPlus } from "lucide-react";

export default function NewPatientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "", phone: "", email: "", password: "",
        dob: "", gender: "", bloodGroup: "", address: "",
        emergencyContactName: "", emergencyContactPhone: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || "Failed to register patient");
                setLoading(false);
                return;
            }
            router.push("/hospital/patients");
            router.refresh();
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto page-enter">
            <PageHeader title="Register New Patient" backHref="/hospital/patients" />

            <div className="p-6 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-xl border border-gray-200 shadow-[var(--shadow-sm)] overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-100">

                        {error && (
                            <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="p-6 md:p-8 space-y-8">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-[#1A56DB]" />
                                    Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            required
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Phone Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            required
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                            placeholder="e.g. +1 234 567 890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Email Address</Label>
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Portal Password</Label>
                                        <Input
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                            placeholder="Leave empty for no portal access"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Date of Birth</Label>
                                        <Input
                                            type="date"
                                            value={form.dob}
                                            onChange={e => setForm({ ...form, dob: e.target.value })}
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Gender</Label>
                                        <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Blood Group</Label>
                                        <Select value={form.bloodGroup} onValueChange={v => setForm({ ...form, bloodGroup: v })}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Select Blood Group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg.replace("_POS", "+").replace("_NEG", "-")}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <Label className="text-gray-700">Full Address</Label>
                                    <Textarea
                                        value={form.address}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                        rows={3}
                                        className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]"
                                        placeholder="Enter patient's full residential address"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="p-6 md:p-8 bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Emergency Contact
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Contact Name</Label>
                                    <Input
                                        value={form.emergencyContactName}
                                        onChange={e => setForm({ ...form, emergencyContactName: e.target.value })}
                                        className="bg-white border-gray-200 focus:ring-[#1A56DB]"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Contact Phone</Label>
                                    <Input
                                        value={form.emergencyContactPhone}
                                        onChange={e => setForm({ ...form, emergencyContactPhone: e.target.value })}
                                        className="bg-white border-gray-200 focus:ring-[#1A56DB]"
                                        placeholder="e.g. +1 987 654 321"
                                    />
                                </div>
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
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Register Patient
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
