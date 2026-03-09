"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Plus, Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/EmptyState";

interface Hospital {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string;
    _count: { patients: number; doctors: number; users: number };
}

export default function HospitalsPage() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Hospital | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<Hospital | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        hospital_name: "", hospital_slug: "", hospital_email: "", hospital_phone: "", hospital_address: "",
        admin_name: "", admin_email: "", admin_password: "",
    });

    const [editForm, setEditForm] = useState({
        name: "", email: "", phone: "", address: "", isActive: true,
    });

    const fetchHospitals = async () => {
        const res = await fetch("/api/admin/hospitals");
        if (res.ok) setHospitals(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchHospitals(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError("");

        const res = await fetch("/api/admin/hospitals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to create hospital");
            setCreating(false);
            return;
        }

        setDialogOpen(false);
        setForm({ hospital_name: "", hospital_slug: "", hospital_email: "", hospital_phone: "", hospital_address: "", admin_name: "", admin_email: "", admin_password: "" });
        setCreating(false);
        setSuccess("Hospital created successfully");
        setTimeout(() => setSuccess(""), 3000);
        fetchHospitals();
    };

    const handleEdit = (hospital: Hospital) => {
        setEditing(hospital);
        setEditForm({
            name: hospital.name,
            email: hospital.email || "",
            phone: hospital.phone || "",
            address: hospital.address || "",
            isActive: hospital.isActive,
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        setError("");

        try {
            const res = await fetch(`/api/admin/hospitals/${editing.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to update hospital");
            } else {
                setEditing(null);
                setSuccess("Hospital updated successfully");
                setTimeout(() => setSuccess(""), 3000);
                fetchHospitals();
            }
        } catch (error) {
            setError("An error occurred while updating.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/admin/hospitals/${deleting.id}`, { method: "DELETE" });
            if (res.ok) {
                setDeleting(null);
                setSuccess("Hospital deactivated successfully");
                setTimeout(() => setSuccess(""), 3000);
                fetchHospitals();
            } else {
                alert("Failed to deactivate hospital");
            }
        } catch (error) {
            alert("An error occurred deactivating hospital");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Hospitals"
                action={
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                                <Plus className="h-4 w-4 mr-2" /> Create Hospital
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Hospital</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

                                <h3 className="text-sm font-semibold text-gray-700">Hospital Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><Label>Hospital Name *</Label><Input value={form.hospital_name} onChange={e => setForm({ ...form, hospital_name: e.target.value })} required /></div>
                                    <div><Label>Slug *</Label><Input value={form.hospital_slug} onChange={e => setForm({ ...form, hospital_slug: e.target.value.toLowerCase().replace(/\s/g, "-") })} required placeholder="e.g. apollo" /></div>
                                    <div><Label>Email</Label><Input type="email" value={form.hospital_email} onChange={e => setForm({ ...form, hospital_email: e.target.value })} /></div>
                                    <div><Label>Phone</Label><Input value={form.hospital_phone} onChange={e => setForm({ ...form, hospital_phone: e.target.value })} /></div>
                                </div>
                                <div><Label>Address</Label><Input value={form.hospital_address} onChange={e => setForm({ ...form, hospital_address: e.target.value })} /></div>

                                <hr />
                                <h3 className="text-sm font-semibold text-gray-700">Admin Account</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><Label>Admin Name *</Label><Input value={form.admin_name} onChange={e => setForm({ ...form, admin_name: e.target.value })} required /></div>
                                    <div><Label>Admin Email *</Label><Input type="email" value={form.admin_email} onChange={e => setForm({ ...form, admin_email: e.target.value })} required /></div>
                                </div>
                                <div><Label>Admin Password *</Label><Input type="password" value={form.admin_password} onChange={e => setForm({ ...form, admin_password: e.target.value })} required minLength={8} /></div>

                                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={creating}>
                                    {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Hospital"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                }
            />
            <div className="p-4 md:p-6">
                {success && <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">{success}</div>}
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                ) : hospitals.length === 0 ? (
                    <EmptyState icon={<Building2 className="h-12 w-12" />} title="No hospitals yet" description="Create your first hospital to get started" />
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[640px] w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hospital</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patients</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctors</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Users</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hospitals.map(h => (
                                        <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{h.name}</td>
                                            <td className="py-3 px-4 text-gray-500">{h.slug}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.patients}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.doctors}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.users}</td>
                                            <td className="py-3 px-4"><StatusBadge status={h.isActive ? "active" : "inactive"} /></td>
                                            <td className="py-3 px-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(h)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeleting(h)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Hospital Dialog */}
            <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Hospital</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
                        {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                        <div><Label>Hospital Name *</Label><Input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} required /></div>
                        <div><Label>Email</Label><Input type="email" value={editForm.email} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} /></div>
                        <div><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} /></div>
                        <div><Label>Address</Label><Input value={editForm.address} onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))} /></div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={editForm.isActive}
                                onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete/Deactivate Confirmation Dialog */}
            <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Hospital</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate {deleting?.name}? Users associated with this hospital will no longer be able to log in.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deactivating...</> : "Deactivate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
