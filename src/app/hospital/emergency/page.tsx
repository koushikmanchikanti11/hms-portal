"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RefreshCw, Clock, Activity } from "lucide-react";

// Updated Triage Colors for a cleaner card look (left border accent instead of full background)
const TRIAGE_COLORS: Record<string, { border: string; text: string; badge: string; label: string; icon: string }> = {
    critical: { border: "border-l-red-500", text: "text-red-700", badge: "bg-red-50 text-red-700", label: "CRITICAL", icon: "🔴" },
    urgent: { border: "border-l-orange-500", text: "text-orange-700", badge: "bg-orange-50 text-orange-700", label: "URGENT", icon: "🟠" },
    semi_urgent: { border: "border-l-amber-500", text: "text-amber-700", badge: "bg-amber-50 text-amber-700", label: "SEMI-URGENT", icon: "🟡" },
    non_urgent: { border: "border-l-green-500", text: "text-green-700", badge: "bg-green-50 text-green-700", label: "NON-URGENT", icon: "🟢" },
};

const STATUS_COLORS: Record<string, string> = {
    waiting: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    in_treatment: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    admitted: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20",
    discharged: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
    referred: "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20",
    deceased: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/20",
};

function getTimeSince(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
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
        <div className="page-enter flex flex-col h-full bg-[#F9FAFB] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans flex items-center gap-2">
                    <Activity className="w-6 h-6 text-red-500" />
                    Emergency Board
                </h1>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={fetchCases} className="h-9 px-3 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg">
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Link href="/hospital/emergency/new">
                        <Button className="bg-red-500 hover:bg-red-600 text-white shadow-sm h-9 px-4 rounded-lg gap-2 text-sm font-medium">
                            <Plus className="w-4 h-4" /> New Case
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 p-1 bg-gray-100/50 rounded-lg border border-gray-200">
                        <button onClick={() => setShowActive(true)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${showActive ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}>
                            Active Cases
                        </button>
                        <button onClick={() => setShowActive(false)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${!showActive ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}>
                            All Cases
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" /> Updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>

                {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" /></div> : (
                    <div className="space-y-8">
                        {(["critical", "urgent", "semi_urgent", "non_urgent"] as const).map(level => {
                            const levelCases = grouped[level];
                            const triage = TRIAGE_COLORS[level];
                            if (levelCases.length === 0) return null;

                            return (
                                <div key={level} className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                                        <h3 className={`text-[15px] font-bold font-dm-sans flex items-center gap-1.5 ${triage.text}`}>
                                            {triage.icon} {triage.label}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${triage.badge}`}>
                                            {levelCases.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {levelCases.map((c: any) => (
                                            <div key={c.id} className={`bg-white rounded-xl border-y border-r border-l-4 ${triage.border} border-y-gray-200 border-r-gray-200 p-4 shadow-[var(--shadow-sm)] hover:shadow-md transition-shadow flex flex-col`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-0.5">{c.caseNumber}</p>
                                                        <p className="text-base font-bold text-gray-900 leading-tight">{c.patientName}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{c.patientGender ? `${c.patientGender}, ` : ""}{c.patientAge ? `${c.patientAge} yrs` : ""}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${STATUS_COLORS[c.status] || "bg-gray-100 ring-1 ring-gray-200"}`}>
                                                        {c.status.replace("_", " ")}
                                                    </span>
                                                </div>

                                                <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 mb-3 flex-1 flex flex-col justify-center">
                                                    <p className="text-sm font-medium text-gray-800 line-clamp-2" title={c.chiefComplaint}>{c.chiefComplaint}</p>
                                                </div>

                                                {(c.vitalsBP || c.vitalsHR || c.vitalsSpO2) && (
                                                    <div className="flex flex-wrap gap-2 text-[11px] font-medium text-gray-600 mb-3 bg-[#F9FAFB] p-2 rounded-lg border border-gray-100">
                                                        {c.vitalsBP && <span className="bg-white px-1.5 py-0.5 rounded shadow-sm">BP: {c.vitalsBP}</span>}
                                                        {c.vitalsHR && <span className="bg-white px-1.5 py-0.5 rounded shadow-sm text-red-600">HR: {c.vitalsHR}</span>}
                                                        {c.vitalsSpO2 && <span className="bg-white px-1.5 py-0.5 rounded shadow-sm text-blue-600">SpO2: {c.vitalsSpO2}%</span>}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-3 border-b border-gray-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                                                            {c.assignedDoctor ? c.assignedDoctor.name.charAt(0) : "?"}
                                                        </div>
                                                        <span className="truncate max-w-[100px]">{c.assignedDoctor ? `Dr. ${c.assignedDoctor.name}` : "Unassigned"}</span>
                                                    </div>
                                                    <span className="font-medium text-amber-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {getTimeSince(c.arrivedAt)}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2 mt-auto">
                                                    {c.status === "waiting" && (
                                                        <Button size="sm" className="flex-1 text-xs bg-[#1A56DB] hover:bg-[#1E40AF] text-white h-8" onClick={() => handleStatusUpdate(c.id, "in_treatment")}>Treat</Button>
                                                    )}
                                                    {c.status === "in_treatment" && (
                                                        <Button size="sm" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-8" onClick={() => handleStatusUpdate(c.id, "discharged")}>Discharge</Button>
                                                    )}
                                                    <Link href={`/hospital/emergency/${c.id}`} className={c.status !== "waiting" && c.status !== "in_treatment" ? "w-full" : "flex-[0.5]"}>
                                                        <Button variant="outline" size="sm" className="w-full text-xs h-8 border-gray-200 text-gray-600 hover:bg-gray-50">View</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {cases.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-[var(--shadow-sm)] border-dashed">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Activity className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">No emergency cases</h3>
                                <p className="text-sm text-gray-500 text-center max-w-sm">
                                    {showActive ? "There are currently no active emergency cases in the department." : "No emergency cases found in the system."}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
