"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, Calendar, User, FileText, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientLastVisitedPage() {
    const [lastVisit, setLastVisit] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/patient/last-visited")
            .then(r => r.json())
            .then(d => { setLastVisit(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <PageHeader title="Last Visited" />
            <div className="p-4 md:p-6 max-w-4xl">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                ) : !lastVisit ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                        <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Past Visits Found</h3>
                        <p className="mt-1">You do not have any completed appointments yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-0 shadow-md">
                            <CardHeader className="bg-orange-50/50 border-b pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    Your Most Recent Visit
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Date of Visit</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {formatDate(lastVisit.appointmentDate)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-2 bg-green-50 rounded-lg text-green-600">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Consulting Doctor</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    Dr. {lastVisit.doctor?.name || "Unknown"}
                                                </p>
                                                <p className="text-sm text-gray-600">{lastVisit.doctor?.specialization}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                            <StatusBadge status={lastVisit.status} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                                            <StatusBadge status={lastVisit.type} />
                                        </div>
                                        {lastVisit.notes && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                                                    {lastVisit.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {lastVisit.records && lastVisit.records.length > 0 && (
                            <Card className="border-0 shadow-md">
                                <CardHeader className="border-b pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        Medical Record from Visit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Diagnosis</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {lastVisit.records[0].diagnosis || "No diagnosis recorded"}
                                        </p>
                                    </div>
                                    {lastVisit.records[0].prescription && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Prescription Notes</p>
                                            <p className="text-sm text-gray-700">
                                                {lastVisit.records[0].prescription}
                                            </p>
                                        </div>
                                    )}
                                    {lastVisit.records[0].notes && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Additional Notes</p>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                                                {lastVisit.records[0].notes}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
