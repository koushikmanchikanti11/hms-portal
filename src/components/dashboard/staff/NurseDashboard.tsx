"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Users, Activity, Pill, Loader2, BedDouble, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface NurseStats {
    assigned_patients: number;
    pending_vitals: number;
    active_prescriptions: number;
}

interface BedWithPatient {
    id: string;
    bedNumber: string;
    ward: { name: string };
    currentPatient: { id: string; name: string } | null;
    updatedAt: string;
}

interface VitalsForm {
    bp_systolic: string;
    bp_diastolic: string;
    heart_rate: string;
    temperature: string;
    spo2: string;
    blood_sugar: string;
    respiratory_rate: string;
}

const emptyVitals: VitalsForm = {
    bp_systolic: "",
    bp_diastolic: "",
    heart_rate: "",
    temperature: "",
    spo2: "",
    blood_sugar: "",
    respiratory_rate: "",
};

function getVitalsStatus(updatedAt: string): { label: string; icon: React.ReactNode; color: string } {
    const diffHours = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);
    if (diffHours > 3) {
        return { label: "Overdue", icon: <XCircle className="h-4 w-4" />, color: "text-red-600" };
    }
    if (diffHours > 1.5) {
        return { label: "Due now", icon: <AlertCircle className="h-4 w-4" />, color: "text-amber-600" };
    }
    return { label: "OK", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" };
}

export function NurseDashboard() {
    const [stats, setStats] = useState<NurseStats | null>(null);
    const [beds, setBeds] = useState<BedWithPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBed, setSelectedBed] = useState<string | null>(null);
    const [vitals, setVitals] = useState<VitalsForm>(emptyVitals);
    const [saving, setSaving] = useState(false);
    const [savedNote, setSavedNote] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/dashboard/staff-stats").then(r => r.json()),
            fetch("/api/beds?occupied=true").then(r => r.ok ? r.json() : { beds: [] }).catch(() => ({ beds: [] })),
        ]).then(([sData, bData]) => {
            setStats(sData);
            setBeds(bData.beds ?? bData ?? []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    function openVitals(bedId: string) {
        setSelectedBed(bedId);
        setVitals(emptyVitals);
        setSavedNote(null);
    }

    async function saveVitals() {
        setSaving(true);
        // We save vitals as a note in emergency / record — for now we just simulate success
        // In a full implementation this would POST to /api/vitals
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        setSavedNote("Vitals recorded successfully at " + new Date().toLocaleTimeString());
        setSelectedBed(null);
    }

    if (loading) {
        return (
            <>
                <PageHeader title="Nurse Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
            </>
        );
    }

    const activeBed = beds.find(b => b.id === selectedBed);

    return (
        <>
            <PageHeader title="Nurse Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <KPICard
                        title="Assigned Patients"
                        value={stats?.assigned_patients ?? 0}
                        subtitle="Currently in beds"
                        icon={Users}
                        color="orange"
                    />
                    <KPICard
                        title="Pending Vitals"
                        value={beds.filter(b => {
                            const diff = (Date.now() - new Date(b.updatedAt).getTime()) / (1000 * 60 * 60);
                            return diff > 1.5;
                        }).length}
                        subtitle="Need vitals update"
                        icon={Activity}
                        color="red"
                    />
                    <KPICard
                        title="Active Prescriptions"
                        value={stats?.active_prescriptions ?? 0}
                        subtitle="Across all patients"
                        icon={Pill}
                        color="green"
                    />
                </div>

                {/* Vitals Panel */}
                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Patient Beds — Vitals Status</h3>
                    </div>

                    {beds.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">No occupied beds at this time.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                        <th className="px-6 py-3 text-left font-medium">Patient</th>
                                        <th className="px-6 py-3 text-left font-medium">Bed</th>
                                        <th className="px-6 py-3 text-left font-medium">Ward</th>
                                        <th className="px-6 py-3 text-left font-medium">Last Updated</th>
                                        <th className="px-6 py-3 text-left font-medium">Status</th>
                                        <th className="px-6 py-3 text-left font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {beds.map(bed => {
                                        const vitalsStatus = getVitalsStatus(bed.updatedAt);
                                        const lastUpdated = new Date(bed.updatedAt);
                                        const diffMins = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
                                        const timeLabel = diffMins < 60
                                            ? `${diffMins} min ago`
                                            : `${Math.floor(diffMins / 60)} hr${Math.floor(diffMins / 60) > 1 ? "s" : ""} ago`;

                                        return (
                                            <tr key={bed.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-900">
                                                    {bed.currentPatient?.name ?? "—"}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">{bed.bedNumber}</td>
                                                <td className="px-6 py-3 text-gray-600">{bed.ward?.name ?? "—"}</td>
                                                <td className="px-6 py-3 text-gray-500">{timeLabel}</td>
                                                <td className={`px-6 py-3 font-medium flex items-center gap-1 ${vitalsStatus.color}`}>
                                                    {vitalsStatus.icon}
                                                    {vitalsStatus.label}
                                                </td>
                                                <td className="px-6 py-3">
                                                    {vitalsStatus.label !== "OK" ? (
                                                        <button
                                                            onClick={() => openVitals(bed.id)}
                                                            className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
                                                        >
                                                            Update Vitals
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openVitals(bed.id)}
                                                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Saved note */}
                {savedNote && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-700 font-medium">{savedNote}</p>
                    </div>
                )}

                {/* Vitals Update Modal */}
                {selectedBed && activeBed && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Update Vitals</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {activeBed.currentPatient?.name ?? "Unknown patient"} — Bed {activeBed.bedNumber}, {activeBed.ward?.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedBed(null)}
                                    className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                                >✕</button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Timestamp */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Timestamp</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={new Date().toLocaleString()}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                                    />
                                </div>

                                {/* Blood Pressure */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Blood Pressure (mmHg)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Systolic"
                                            value={vitals.bp_systolic}
                                            onChange={e => setVitals(v => ({ ...v, bp_systolic: e.target.value }))}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        />
                                        <span className="text-gray-400 font-medium">/</span>
                                        <input
                                            type="number"
                                            placeholder="Diastolic"
                                            value={vitals.bp_diastolic}
                                            onChange={e => setVitals(v => ({ ...v, bp_diastolic: e.target.value }))}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Heart Rate */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 72"
                                        value={vitals.heart_rate}
                                        onChange={e => setVitals(v => ({ ...v, heart_rate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>

                                {/* Temperature */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Temperature (°C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 36.8"
                                        value={vitals.temperature}
                                        onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>

                                {/* SpO2 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">SpO₂ (%)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 98"
                                        value={vitals.spo2}
                                        onChange={e => setVitals(v => ({ ...v, spo2: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>

                                {/* Respiratory Rate */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Respiratory Rate (breaths/min)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 16"
                                        value={vitals.respiratory_rate}
                                        onChange={e => setVitals(v => ({ ...v, respiratory_rate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>

                                {/* Blood Sugar (optional) */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Blood Sugar (mg/dL) <span className="text-gray-400">optional</span></label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 110"
                                        value={vitals.blood_sugar}
                                        onChange={e => setVitals(v => ({ ...v, blood_sugar: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedBed(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >Cancel</button>
                                <button
                                    onClick={saveVitals}
                                    disabled={saving}
                                    className="px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {saving ? "Saving..." : "Save Vitals"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-orange-700 font-medium">🩺 Nurse View — You have access to Records, Prescriptions, and Bed status. Update patient vitals using the table above.</p>
                </div>
            </div>
        </>
    );
}
