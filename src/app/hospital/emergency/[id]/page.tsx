"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EmergencyCaseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [ec, setEc] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCase = () => {
        fetch(`/api/emergency/${id}`).then(r => r.json()).then(d => { setEc(d); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchCase(); }, [id]);

    const updateStatus = async (status: string) => {
        await fetch(`/api/emergency/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
        fetchCase();
    };

    if (loading) return <><PageHeader title="Emergency Case" backHref="/hospital/emergency" /><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div></>;
    if (!ec) return <><PageHeader title="Emergency Case" backHref="/hospital/emergency" /><div className="p-6 text-center text-gray-500">Case not found.</div></>;

    return (
        <>
            <PageHeader title={`Case ${ec.caseNumber}`} backHref="/hospital/emergency" />
            <div className="p-4 md:p-6 max-w-3xl space-y-6">
                {/* Patient Info */}
                <div className="bg-white rounded-xl border p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{ec.patientName}</h2>
                            <p className="text-sm text-gray-500">{ec.patientGender ? `${ec.patientGender}, ` : ""}{ec.patientAge ? `${ec.patientAge} years` : ""}</p>
                        </div>
                        <StatusBadge status={ec.status.replace("_", " ")} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-gray-500">Triage: </span><span className="font-semibold capitalize">{ec.triageLevel.replace("_", " ")}</span></div>
                        <div><span className="text-gray-500">Chief Complaint: </span><span className="font-semibold">{ec.chiefComplaint}</span></div>
                        <div><span className="text-gray-500">Arrived: </span><span className="font-semibold">{formatDate(ec.arrivedAt)}</span></div>
                        {ec.assignedDoctor && <div><span className="text-gray-500">Doctor: </span><span className="font-semibold">Dr. {ec.assignedDoctor.name}</span></div>}
                        {ec.treatmentStartAt && <div><span className="text-gray-500">Treatment Started: </span><span className="font-semibold">{formatDate(ec.treatmentStartAt)}</span></div>}
                        {ec.resolvedAt && <div><span className="text-gray-500">Resolved: </span><span className="font-semibold">{formatDate(ec.resolvedAt)}</span></div>}
                    </div>
                </div>

                {/* Vitals */}
                {(ec.vitalsBP || ec.vitalsHR || ec.vitalsTemp || ec.vitalsSpO2 || ec.vitalsRR) && (
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Vitals</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {ec.vitalsBP && <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Blood Pressure</p><p className="text-lg font-bold">{ec.vitalsBP}</p></div>}
                            {ec.vitalsHR && <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Heart Rate</p><p className="text-lg font-bold">{ec.vitalsHR} <span className="text-xs">bpm</span></p></div>}
                            {ec.vitalsTemp && <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Temperature</p><p className="text-lg font-bold">{ec.vitalsTemp}°C</p></div>}
                            {ec.vitalsSpO2 && <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">SpO2</p><p className="text-lg font-bold">{ec.vitalsSpO2}%</p></div>}
                            {ec.vitalsRR && <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Resp. Rate</p><p className="text-lg font-bold">{ec.vitalsRR}/min</p></div>}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {ec.notes && (
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                        <p className="text-sm text-gray-600">{ec.notes}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        {ec.status === "waiting" && <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => updateStatus("in_treatment")}>Start Treatment</Button>}
                        {ec.status === "in_treatment" && (
                            <>
                                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => updateStatus("discharged")}>Discharge</Button>
                                <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => updateStatus("admitted")}>Admit as IP</Button>
                                <Button variant="outline" onClick={() => updateStatus("referred")}>Refer</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
