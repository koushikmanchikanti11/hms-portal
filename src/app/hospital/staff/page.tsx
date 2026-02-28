"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
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
    receptionist: "bg-blue-100 text-blue-700",
    nurse: "bg-orange-100 text-orange-700",
    pharmacist: "bg-green-100 text-green-700",
    lab_technician: "bg-indigo-100 text-indigo-700",
    ward_boy: "bg-purple-100 text-purple-700",
    accountant: "bg-emerald-100 text-emerald-700",
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
        <>
            <PageHeader title="Staff Management" />
            <div className="p-4 md:p-6 space-y-6">

                {/* Top Bar */}
                <div className="flex items-center justify-between">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 flex-1 mr-4">
                        <UserCog className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-orange-800">Manage Staff Accounts</p>
                            <p className="text-xs text-orange-600 mt-0.5">
                                Create staff logins and assign sub-roles. Each sub-role determines which dashboard and modules the staff member can access.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setFormError(null); setForm(emptyForm); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        Add Staff
                    </button>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`rounded-xl p-4 flex items-center gap-2 ${notification.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                        }`}>
                        {notification.type === "success"
                            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                            : <AlertCircle className="h-4 w-4 shrink-0" />}
                        <p className="text-sm font-medium">{notification.msg}</p>
                    </div>
                )}

                {/* Staff Table */}
                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">
                            Staff Members {!loading && <span className="text-gray-400 font-normal text-sm">({staff.length})</span>}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="p-10 text-center">
                            <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500">No staff members yet</p>
                            <p className="text-xs text-gray-400 mt-1 mb-4">Click &ldquo;Add Staff&rdquo; to create the first staff account.</p>
                            <button
                                onClick={() => { setShowForm(true); setFormError(null); setForm(emptyForm); }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Plus className="h-4 w-4" /> Add First Staff Member
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                        <th className="px-6 py-3 text-left font-medium">Name</th>
                                        <th className="px-6 py-3 text-left font-medium">Email</th>
                                        <th className="px-6 py-3 text-left font-medium">Current Role</th>
                                        <th className="px-6 py-3 text-left font-medium">Change Role</th>
                                        <th className="px-6 py-3 text-left font-medium">Status</th>
                                        <th className="px-6 py-3 text-left font-medium">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {staff.map(member => (
                                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-semibold text-orange-600">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{member.email}</td>
                                            <td className="px-6 py-4">
                                                {member.staffRole ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.staffRole] ?? "bg-gray-100 text-gray-700"}`}>
                                                        {STAFF_ROLES.find(r => r.value === member.staffRole)?.label ?? member.staffRole}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        defaultValue={member.staffRole ?? ""}
                                                        onChange={e => updateRole(member.id, e.target.value)}
                                                        disabled={saving === member.id}
                                                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {STAFF_ROLES.map(r => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                    {saving === member.id && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">
                                                {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Role Permissions Reference */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Role Permissions Reference</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { role: "Receptionist", color: "blue", access: ["Patients", "Appointments", "Billing"] },
                            { role: "Nurse", color: "orange", access: ["Records", "Prescriptions", "Beds (view)", "Vitals"] },
                            { role: "Pharmacist", color: "green", access: ["Pharmacy (full)", "Prescriptions"] },
                            { role: "Lab Technician", color: "indigo", access: ["Medical Records"] },
                            { role: "Ward Boy", color: "purple", access: ["Beds (update status)"] },
                            { role: "Accountant", color: "emerald", access: ["Billing (full)"] },
                        ].map(({ role, color, access }) => (
                            <div key={role} className={`rounded-lg border p-3 bg-${color}-50 border-${color}-100`}>
                                <p className={`text-sm font-semibold text-${color}-800 mb-2`}>{role}</p>
                                <ul className="space-y-1">
                                    {access.map(a => (
                                        <li key={a} className={`text-xs text-${color}-700 flex items-center gap-1`}>
                                            <span>✓</span> {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Create Staff Modal ── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Header */}
                        <div className="px-6 py-5 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Add Staff Member</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Creates login credentials for the staff dashboard</p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={createStaff} className="p-6 space-y-4">
                            {/* Error */}
                            {formError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-red-700">{formError}</p>
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Priya Nair"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="staff@hospital.com"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {form.password && form.password.length < 8 && (
                                    <p className="text-xs text-red-500 mt-1">At least 8 characters required</p>
                                )}
                            </div>

                            {/* Staff Role */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Staff Role
                                </label>
                                <select
                                    value={form.staffRole}
                                    onChange={e => setForm(f => ({ ...f, staffRole: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                                >
                                    {STAFF_ROLES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    Determines which dashboard and modules they can access.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {creating ? "Creating..." : "Create Staff"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
