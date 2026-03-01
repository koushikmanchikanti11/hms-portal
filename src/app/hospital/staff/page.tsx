"use client";

import { useState, useEffect } from "react";
import { UserCog, Loader2, CheckCircle2, AlertCircle, Plus, X, Eye, EyeOff } from "lucide-react";

interface StaffUser {
    id: string;
    name: string;
    email: string;
    staffRole: string | null;
    isActive: boolean;
    createdAt: string;
}

const STAFF_ROLES = [
    { value: "", label: "— No Role —" },
    { value: "receptionist", label: "Receptionist" },
    { value: "nurse", label: "Nurse" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "lab_technician", label: "Lab Technician" },
    { value: "ward_boy", label: "Ward Boy" },
    { value: "accountant", label: "Accountant" },
];

const ROLE_COLORS: Record<string, string> = {
    receptionist: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    nurse: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
    pharmacist: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    lab_technician: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20",
    ward_boy: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20",
    accountant: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/20",
};

interface CreateForm {
    name: string;
    email: string;
    password: string;
    staffRole: string;
}

const emptyForm: CreateForm = { name: "", email: "", password: "", staffRole: "" };

export default function StaffManagementPage() {
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    // Create form state
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreateForm>(emptyForm);
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetch("/api/staff")
            .then(r => r.json())
            .then(data => { setStaff(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    function showNotification(type: "success" | "error", msg: string) {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 4000);
    }

    async function updateRole(userId: string, staffRole: string) {
        setSaving(userId);
        try {
            const res = await fetch("/api/staff", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, staffRole: staffRole || null }),
            });
            if (!res.ok) throw new Error("Failed");
            const updated = await res.json();
            setStaff(prev => prev.map(s => s.id === userId ? { ...s, staffRole: updated.staffRole } : s));
            showNotification("success", `Role updated for ${staff.find(s => s.id === userId)?.name}`);
        } catch {
            showNotification("error", "Failed to update role. Please try again.");
        } finally {
            setSaving(null);
        }
    }

    async function createStaff(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);

        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setFormError("Name, email and password are all required.");
            return;
        }
        if (form.password.length < 8) {
            setFormError("Password must be at least 8 characters.");
            return;
        }

        setCreating(true);
        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                    staffRole: form.staffRole || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setFormError(data.error ?? "Failed to create staff member.");
                return;
            }
            // Prepend to list
            setStaff(prev => [{ ...data, createdAt: new Date().toISOString() }, ...prev]);
            setForm(emptyForm);
            setShowForm(false);
            showNotification("success", `Staff member "${data.name}" created successfully!`);
        } catch {
            setFormError("An unexpected error occurred. Please try again.");
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <div className="bg-[#1A56DB]/10 p-1.5 rounded-lg border border-[#1A56DB]/20">
                        <UserCog className="w-5 h-5 text-[#1A56DB]" />
                    </div>
                    Staff Management
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setShowForm(true); setFormError(null); setForm(emptyForm); }}
                        className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white shadow-sm h-9 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Staff
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Notification */}
                {notification && (
                    <div className={`rounded-xl p-4 flex items-center gap-3 shadow-sm ${notification.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                        }`}>
                        {notification.type === "success"
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                            : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
                        <p className="text-sm font-semibold">{notification.msg}</p>
                    </div>
                )}

                {/* Staff Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-gray-900 font-dm-sans">
                            Staff Directory {!loading && <span className="text-gray-500 font-medium ml-1">({staff.length})</span>}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50/50">
                            <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <UserCog className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-semibold mb-1">No staff members yet</p>
                            <p className="text-sm text-gray-500 mb-6">Click &ldquo;Add Staff&rdquo; to create the first staff account.</p>
                            <button
                                onClick={() => { setShowForm(true); setFormError(null); setForm(emptyForm); }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <Plus className="h-4 w-4" /> Add First Staff Member
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200">
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Role</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Change Role</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {staff.map(member => (
                                        <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-[#1A56DB]/10 flex items-center justify-center shrink-0 border border-[#1A56DB]/20">
                                                        <span className="text-[13px] font-bold text-[#1A56DB]">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 font-medium">{member.email}</td>
                                            <td className="px-5 py-4">
                                                {member.staffRole ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${ROLE_COLORS[member.staffRole] ?? "bg-gray-100 text-gray-700 ring-1 ring-gray-200"}`}>
                                                        {STAFF_ROLES.find(r => r.value === member.staffRole)?.label ?? member.staffRole}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic font-medium">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        defaultValue={member.staffRole ?? ""}
                                                        onChange={e => updateRole(member.id, e.target.value)}
                                                        disabled={saving === member.id}
                                                        className="border border-gray-200 rounded-lg h-8 px-2.5 text-xs font-medium bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#1A56DB] focus:border-[#1A56DB] outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[140px] transition-all duration-300 transform hover:scale-105"
                                                    >
                                                        {STAFF_ROLES.map(r => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                    {saving === member.id && <Loader2 className="h-4 w-4 animate-spin text-[#1A56DB]" />}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${member.isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-gray-500 font-medium">
                                                {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>


            </div>

            {/* ── Create Staff Modal ── */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 font-dm-sans">Add Staff Member</h2>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Creates login credentials for the staff dashboard</p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors border border-gray-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={createStaff} className="p-6 space-y-4">
                            {/* Error */}
                            {formError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shadow-sm">
                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium text-red-800">{formError}</p>
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-bold text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Priya Nair"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A56DB] focus:border-[#1A56DB] outline-none transition-shadow bg-gray-50/50 focus:bg-white"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-bold text-gray-700">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="staff@hospital.com"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A56DB] focus:border-[#1A56DB] outline-none transition-shadow bg-gray-50/50 focus:bg-white"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-bold text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A56DB] focus:border-[#1A56DB] outline-none transition-shadow bg-gray-50/50 focus:bg-white"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {form.password && form.password.length < 8 && (
                                    <p className="text-xs font-medium text-red-500 mt-1">At least 8 characters required</p>
                                )}
                            </div>

                            {/* Staff Role */}
                            <div className="space-y-1.5 pb-2">
                                <label className="block text-[13px] font-bold text-gray-700">
                                    Staff Role
                                </label>
                                <select
                                    value={form.staffRole}
                                    onChange={e => setForm(f => ({ ...f, staffRole: e.target.value }))}
                                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#1A56DB] focus:border-[#1A56DB] outline-none transition-shadow"
                                >
                                    {STAFF_ROLES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <p className="text-[11px] font-medium text-gray-500 mt-1.5 leading-relaxed">
                                    Determines which dashboard and modules they can access in the portal.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 h-10 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 h-10 text-sm font-bold text-white bg-[#1A56DB] hover:bg-[#1E40AF] rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {creating ? "Creating..." : "Create Staff"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
