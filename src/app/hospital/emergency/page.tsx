"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RefreshCw, Clock } from "lucide-react";

const TRIAGE_COLORS: Record<string, { bg: string; border: string; text: string; label: string; emoji: string }> = {
    critical: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", label: "CRITICAL", emoji: "🔴" },
    urgent: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "URGENT", emoji: "🟠" },
    semi_urgent: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", label: "SEMI-URGENT", emoji: "🟡" },
    non_urgent: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", label: "NON-URGENT", emoji: "🟢" },
};

const STATUS_COLORS: Record<string, string> = {
    waiting: "bg-amber-100 text-amber-800",
    in_treatment: "bg-blue-100 text-blue-800",
    admitted: "bg-purple-100 text-purple-800",
    discharged: "bg-green-100 text-green-800",
    referred: "bg-gray-100 text-gray-800",
    deceased: "bg-gray-200 text-gray-600",
};

function getTimeSince(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

export default function EmergencyPage() {
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showActive, setShowActive] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchCases = async () => {
        const res = await fetch(`/api/emergency?active=${showActive}`);
        if (res.ok) setCases(await res.json());
        setLoading(false);
        setLastUpdated(new Date());
    };

    useEffect(() => { fetchCases(); }, [showActive]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchCases, 30000);
        return () => clearInterval(interval);
    }, [showActive]);

    const handleStatusUpdate = async (id: string, status: string) => {
        await fetch(`/api/emergency/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        fetchCases();
    };

    const grouped = {
        critical: cases.filter(c => c.triageLevel === "critical"),
        urgent: cases.filter(c => c.triageLevel === "urgent"),
        semi_urgent: cases.filter(c => c.triageLevel === "semi_urgent"),
        non_urgent: cases.filter(c => c.triageLevel === "non_urgent"),
    };

    return (
        <>
            <PageHeader title="🚨 Emergency Department" action={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchCases}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
                    <Link href="/hospital/emergency/new"><Button className="bg-red-500 hover:bg-red-600 text-white"><Plus className="h-4 w-4 mr-2" />New Case</Button></Link>
                </div>
            } />
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <button onClick={() => setShowActive(true)} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${showActive ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>Active Cases</button>
                        <button onClick={() => setShowActive(false)} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${!showActive ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>All Cases</button>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />Last updated: {lastUpdated.toLocaleTimeString()}</p>
                </div>

                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div> : (
                    <div className="space-y-6">
                        {(["critical", "urgent", "semi_urgent", "non_urgent"] as const).map(level => {
                            const levelCases = grouped[level];
                            const triage = TRIAGE_COLORS[level];
                            if (levelCases.length === 0) return null;
                            return (
                                <div key={level}>
                                    <h3 className={`text-sm font-bold mb-3 ${triage.text}`}>{triage.emoji} {triage.label} ({levelCases.length} cases)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {levelCases.map((c: any) => (
                                            <div key={c.id} className={`rounded-xl border-2 p-4 ${triage.bg} ${triage.border}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-xs font-mono text-gray-500">{c.caseNumber}</p>
                                                        <p className="font-bold text-gray-900">{c.patientName}</p>
                                                        <p className="text-sm text-gray-600">{c.patientGender ? `${c.patientGender}, ` : ""}{c.patientAge ? `${c.patientAge}y` : ""}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[c.status] || "bg-gray-100"}`}>
                                                        {c.status.replace("_", " ").toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 mb-2">{c.chiefComplaint}</p>
                                                {(c.vitalsBP || c.vitalsHR || c.vitalsSpO2) && (
                                                    <div className="flex gap-3 text-xs text-gray-600 mb-2">
                                                        {c.vitalsBP && <span>BP: {c.vitalsBP}</span>}
                                                        {c.vitalsHR && <span>HR: {c.vitalsHR}</span>}
                                                        {c.vitalsSpO2 && <span>SpO2: {c.vitalsSpO2}%</span>}
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                                    <span>{c.assignedDoctor ? `Dr. ${c.assignedDoctor.name}` : "No doctor assigned"}</span>
                                                    <span>⏱ {getTimeSince(c.arrivedAt)}</span>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    {c.status === "waiting" && (
                                                        <Button size="sm" className="text-xs bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleStatusUpdate(c.id, "in_treatment")}>Start Treatment</Button>
                                                    )}
                                                    {c.status === "in_treatment" && (
                                                        <Button size="sm" className="text-xs bg-green-500 hover:bg-green-600 text-white" onClick={() => handleStatusUpdate(c.id, "discharged")}>Discharge</Button>
                                                    )}
                                                    <Link href={`/hospital/emergency/${c.id}`}><Button variant="outline" size="sm" className="text-xs">Details</Button></Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {cases.length === 0 && <div className="text-center py-12 text-gray-500">No emergency cases {showActive ? "currently active" : "found"}.</div>}
                    </div>
                )}
            </div>
        </>
    );
}
