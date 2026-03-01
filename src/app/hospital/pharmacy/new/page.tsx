"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Antibiotic", "Painkiller", "Antacid", "Antipyretic", "Antiseptic", "Vitamin", "Antifungal", "Cardiovascular", "Other"];

export default function NewMedicinePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", genericName: "", category: "", unit: "strips", stockQty: "0", minThreshold: "10", expiryDate: "", batchNumber: "", supplierName: "", supplierContact: "", purchasePrice: "", sellingPrice: "" });
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/pharmacy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, stockQty: parseInt(form.stockQty) || 0, minThreshold: parseInt(form.minThreshold) || 10, purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined, sellingPrice: form.sellingPrice ? parseFloat(form.sellingPrice) : undefined }) }); if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; } router.push("/hospital/pharmacy"); router.refresh(); };

    return (
        <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto page-enter">
            <PageHeader title="Add Medicine" backHref="/hospital/pharmacy" />

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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
                                    Medicine Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Medicine Name <span className="text-red-500">*</span></Label>
                                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]" placeholder="e.g. Paracetamol 500mg" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Generic Name</Label>
                                        <Input value={form.genericName} onChange={e => setForm({ ...form, genericName: e.target.value })} className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]" placeholder="e.g. Acetaminophen" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Category</Label>
                                        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Unit</Label>
                                        <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["strips", "bottles", "vials", "tablets"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Stock Qty <span className="text-red-500">*</span></Label>
                                        <Input type="number" min={0} value={form.stockQty} onChange={e => setForm({ ...form, stockQty: e.target.value })} required className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Min Threshold <span className="text-red-500">*</span></Label>
                                        <Input type="number" min={0} value={form.minThreshold} onChange={e => setForm({ ...form, minThreshold: e.target.value })} required className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]" />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <Label className="text-gray-700">Batch Number</Label>
                                        <Input value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]" />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-6 max-w-sm">
                                    <Label className="text-gray-700">Expiry Date</Label>
                                    <Input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-[#1A56DB]" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                                Supplier & Pricing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Supplier Name</Label>
                                    <Input value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" placeholder="Supplier Company Ltd." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Supplier Contact</Label>
                                    <Input value={form.supplierContact} onChange={e => setForm({ ...form, supplierContact: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" placeholder="Phone or Email" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Purchase Price (₹)</Label>
                                    <Input type="number" min={0} step="0.01" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Selling Price (₹)</Label>
                                    <Input type="number" min={0} step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} className="bg-white border-gray-200 focus:ring-[#1A56DB]" placeholder="0.00" />
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
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Medicine"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
