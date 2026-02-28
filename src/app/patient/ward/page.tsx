"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, BedDouble, Building, Hash, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientWardPage() {
    const [wardInfo, setWardInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/patient/ward")
            .then(r => r.json())
            .then(d => { setWardInfo(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <PageHeader title="My Ward Info" />
            <div className="p-4 md:p-6 max-w-4xl">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                ) : !wardInfo ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                        <BedDouble className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Not Admitted</h3>
                        <p className="mt-1">You are not currently admitted to any ward or bed.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-0 shadow-md">
                            <CardHeader className="bg-orange-50/50 border-b pb-4">
                                <CardTitle className="flex items-center justify-between text-xl">
                                    <div className="flex items-center gap-2">
                                        <BedDouble className="h-6 w-6 text-orange-500" />
                                        Current Admission Details
                                    </div>
                                    <StatusBadge status="Admitted" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="p-4 rounded-xl border bg-gray-50 flex flex-col items-center text-center">
                                        <Building className="h-8 w-8 text-blue-500 mb-2" />
                                        <p className="text-sm font-medium text-gray-500">Ward Name</p>
                                        <p className="text-lg font-bold text-gray-900">{wardInfo.ward?.name}</p>
                                        {wardInfo.ward?.floor && (
                                            <p className="text-xs text-gray-500 mt-1">Floor: {wardInfo.ward.floor}</p>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-xl border bg-gray-50 flex flex-col items-center text-center">
                                        <Hash className="h-8 w-8 text-green-500 mb-2" />
                                        <p className="text-sm font-medium text-gray-500">Bed Number</p>
                                        <p className="text-2xl font-bold text-gray-900">{wardInfo.bedNumber}</p>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-gray-50 flex flex-col items-center text-center">
                                        <Info className="h-8 w-8 text-purple-500 mb-2" />
                                        <p className="text-sm font-medium text-gray-500">Bed Type</p>
                                        <div className="mt-1">
                                            <StatusBadge status={wardInfo.type} />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-gray-50 flex flex-col items-center text-center">
                                        <BedDouble className="h-8 w-8 text-orange-500 mb-2" />
                                        <p className="text-sm font-medium text-gray-500">Admitted On</p>
                                        <p className="text-sm font-bold text-gray-900 mt-1">
                                            {wardInfo.admittedAt ? formatDate(wardInfo.admittedAt) : "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-3">
                                    <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-orange-800">Hospital Staff Assistance</h4>
                                        <p className="text-sm text-orange-700 mt-1">
                                            If you need anything while admitted, please use the call button by your bed or speak to the nursing staff on duty in {wardInfo.ward?.name}.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
